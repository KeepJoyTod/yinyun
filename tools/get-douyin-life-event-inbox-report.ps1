[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [int]$StaleDays = 3,

    [int]$Limit = 20,

    [string]$OutputJsonPath = '',

    [string]$OutputMarkdownPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function New-EventInboxReportSql {
    param(
        [Parameter(Mandatory = $true)][int]$Days,
        [Parameter(Mandatory = $true)][int]$RowLimit
    )

    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with inbox as (
    select
        id,
        channel_type,
        event_type,
        coalesce(event_id, '') as event_id,
        coalesce(external_order_id, '') as external_order_id,
        coalesce(request_id, '') as request_id,
        coalesce(signature_valid, '') as signature_valid,
        coalesce(process_status, '') as process_status,
        coalesce(retry_count, 0) as retry_count,
        next_retry_time,
        coalesce(error_message, '') as error_message,
        coalesce(remark, '') as remark,
        processed_time,
        create_time,
        update_time
    from yy_channel_event_inbox
    where del_flag = '0'
      and channel_type = 'DOUYIN_LIFE'
),
status_counts as (
    select process_status, count(*)::bigint as count
    from inbox
    group by process_status
),
summary as (
    select
        count(*)::bigint as total_count,
        count(*) filter (where process_status in ('PROCESSED','DONE'))::bigint as done_count,
        count(*) filter (where process_status = 'FAILED')::bigint as failed_count,
        count(*) filter (where process_status = 'RETRY')::bigint as retry_count,
        count(*) filter (where process_status = 'DEAD')::bigint as dead_count,
        count(*) filter (where process_status in ('RECEIVED','FAILED','RETRY'))::bigint as retryable_count,
        count(*) filter (
            where process_status in ('FAILED','RETRY','DEAD')
              and create_time < now() - interval '$Days days'
        )::bigint as stale_failure_count,
        count(*) filter (
            where process_status in ('FAILED','RETRY','DEAD')
              and create_time < now() - interval '$Days days'
              and lower(error_message) like '%x-life-sign%'
        )::bigint as stale_x_life_sign_failure_count,
        min(create_time) filter (where process_status in ('FAILED','RETRY','DEAD')) as oldest_failure_time,
        max(create_time) as latest_event_time
    from inbox
),
failure_buckets as (
    select
        process_status,
        case
            when lower(error_message) like '%x-life-sign%' then 'missing_x_life_sign'
            when lower(error_message) like '%signature%' or error_message like '%签名%' then 'signature_related'
            when error_message = '' then 'empty_error'
            else left(regexp_replace(error_message, '[0-9]{7,}', '[redacted-number]', 'g'), 120)
        end as reason_key,
        count(*)::bigint as count,
        max(create_time) as latest_time
    from inbox
    where process_status in ('FAILED','RETRY','DEAD')
    group by process_status, reason_key
),
stale_failures as (
    select *
    from inbox
    where process_status in ('FAILED','RETRY','DEAD')
      and create_time < now() - interval '$Days days'
    order by create_time desc nulls last, id desc
    limit $RowLimit
),
latest_events as (
    select *
    from inbox
    order by create_time desc nulls last, id desc
    limit $RowLimit
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'channel', 'DOUYIN_LIFE',
    'readOnly', true,
    'staleDays', $Days,
    'limit', $RowLimit,
    'summary', (select jsonb_build_object(
        'total', coalesce(total_count, 0),
        'done', coalesce(done_count, 0),
        'retryable', coalesce(retryable_count, 0),
        'failed', coalesce(failed_count, 0),
        'retry', coalesce(retry_count, 0),
        'dead', coalesce(dead_count, 0),
        'staleFailures', coalesce(stale_failure_count, 0),
        'staleXLifeSignFailures', coalesce(stale_x_life_sign_failure_count, 0),
        'oldestFailureTime', coalesce(to_char(oldest_failure_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'latestEventTime', coalesce(to_char(latest_event_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'status', case
            when coalesce(dead_count, 0) > 0 then 'ACTION_REQUIRED_DEAD'
            when coalesce(stale_failure_count, 0) > 0 and coalesce(stale_failure_count, 0) = coalesce(stale_x_life_sign_failure_count, 0) then 'STALE_SIGNATURE_NO_CURRENT_BLOCKER'
            when coalesce(failed_count, 0) > 0 or coalesce(retry_count, 0) > 0 then 'WARNING_REVIEW_FAILURES'
            when coalesce(total_count, 0) = 0 then 'WAITING_FOR_EVENTS'
            else 'HEALTHY'
        end
    ) from summary),
    'statusCounts', coalesce((select jsonb_agg(jsonb_build_object(
        'status', process_status,
        'count', count
    ) order by process_status) from status_counts), '[]'::jsonb),
    'failureBuckets', coalesce((select jsonb_agg(jsonb_build_object(
        'status', process_status,
        'reasonKey', reason_key,
        'count', count,
        'latestTime', coalesce(to_char(latest_time, 'YYYY-MM-DD HH24:MI:SS'), '')
    ) order by latest_time desc nulls last) from failure_buckets), '[]'::jsonb),
    'staleFailures', coalesce((select jsonb_agg(jsonb_build_object(
        'id', id,
        'eventType', event_type,
        'maskedEventId', case
            when event_id = '' then ''
            when length(event_id) <= 8 then left(event_id, 2) || '***' || right(event_id, 2)
            else left(event_id, 4) || '***' || right(event_id, 4)
        end,
        'maskedExternalOrderId', case
            when external_order_id = '' then ''
            when length(external_order_id) <= 8 then left(external_order_id, 2) || '***' || right(external_order_id, 2)
            else left(external_order_id, 4) || '***' || right(external_order_id, 4)
        end,
        'requestId', request_id,
        'signatureValid', signature_valid,
        'processStatus', process_status,
        'retryCount', retry_count,
        'nextRetryTime', coalesce(to_char(next_retry_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'processedTime', coalesce(to_char(processed_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'createTime', coalesce(to_char(create_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'errorCategory', case
            when lower(error_message) like '%x-life-sign%' then 'missing_x_life_sign'
            when lower(error_message) like '%signature%' or error_message like '%签名%' then 'signature_related'
            when error_message = '' then 'empty_error'
            else 'other'
        end,
        'errorMessage', left(regexp_replace(error_message, '[0-9]{7,}', '[redacted-number]', 'g'), 240),
        'remark', left(regexp_replace(remark, '[0-9]{7,}', '[redacted-number]', 'g'), 160)
    ) order by create_time desc nulls last, id desc) from stale_failures), '[]'::jsonb),
    'latestEvents', coalesce((select jsonb_agg(jsonb_build_object(
        'id', id,
        'eventType', event_type,
        'requestId', request_id,
        'signatureValid', signature_valid,
        'processStatus', process_status,
        'retryCount', retry_count,
        'createTime', coalesce(to_char(create_time, 'YYYY-MM-DD HH24:MI:SS'), '')
    ) order by create_time desc nulls last, id desc) from latest_events), '[]'::jsonb),
    'recommendation', (select case
        when coalesce(dead_count, 0) > 0 then 'Review DEAD events manually before retry.'
        when coalesce(stale_failure_count, 0) > 0 and coalesce(stale_failure_count, 0) = coalesce(stale_x_life_sign_failure_count, 0) then 'Keep as stale signature evidence or archive with a dedicated cleanup; do not retry blindly.'
        when coalesce(failed_count, 0) > 0 or coalesce(retry_count, 0) > 0 then 'Inspect failure buckets before retry.'
        else 'No action required.'
    end from summary)
)::text;
"@
}

function Invoke-Hk2Sql {
    param([Parameter(Mandatory = $true)][string]$Sql)

    $encodedSql = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Sql))
    $remoteCommand = "tmp=`$(mktemp); printf '%s' '$encodedSql' | base64 -d > `$tmp; docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < `$tmp; rc=`$?; rm -f `$tmp; exit `$rc"
    $helper = Join-Path $PSScriptRoot 'invoke-hk2.ps1'
    & $helper -SshHost $SshHost -SshUser $SshUser -SshPasswordFile $SshPasswordFile -Command $remoteCommand -TimeoutSec 120
}

function Get-JsonFromOutput {
    param([Parameter(Mandatory = $true)][object[]]$Output)

    $lines = @($Output | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $jsonLines = @($lines | Where-Object { $_.TrimStart().StartsWith('{') })
    if ($jsonLines.Count -eq 0) {
        throw 'empty event inbox report output'
    }
    return ([string]$jsonLines[-1]).Trim()
}

function Write-TextArtifact {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

function Convert-ReportToMarkdown {
    param([Parameter(Mandatory = $true)][pscustomobject]$Report)

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("# DOUYIN_LIFE Event Inbox Read-only Report")
    $lines.Add("")
    $lines.Add("- generatedAt: ``$($Report.generatedAt)``")
    $lines.Add("- channel: ``$($Report.channel)``")
    $lines.Add("- readOnly: ``$($Report.readOnly)``")
    $lines.Add("- staleDays: ``$($Report.staleDays)``")
    $lines.Add("- status: ``$($Report.summary.status)``")
    $lines.Add("- recommendation: $($Report.recommendation)")
    $lines.Add("")
    $lines.Add("## Summary")
    $lines.Add("")
    $lines.Add("| total | done | retryable | failed | retry | dead | staleFailures | staleXLifeSignFailures | latestEventTime |")
    $lines.Add("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |")
    $lines.Add("| $($Report.summary.total) | $($Report.summary.done) | $($Report.summary.retryable) | $($Report.summary.failed) | $($Report.summary.retry) | $($Report.summary.dead) | $($Report.summary.staleFailures) | $($Report.summary.staleXLifeSignFailures) | $($Report.summary.latestEventTime) |")
    $lines.Add("")
    $lines.Add("## Failure Buckets")
    $lines.Add("")
    $lines.Add("| status | reasonKey | count | latestTime |")
    $lines.Add("| --- | --- | ---: | --- |")
    foreach ($bucket in @($Report.failureBuckets)) {
        $lines.Add("| $($bucket.status) | $($bucket.reasonKey) | $($bucket.count) | $($bucket.latestTime) |")
    }
    if (@($Report.failureBuckets).Count -eq 0) {
        $lines.Add("| - | - | 0 | - |")
    }
    $lines.Add("")
    $lines.Add("## Stale Failures")
    $lines.Add("")
    $lines.Add("| id | eventType | status | signatureValid | retryCount | createTime | errorCategory | errorMessage |")
    $lines.Add("| ---: | --- | --- | --- | ---: | --- | --- | --- |")
    foreach ($event in @($Report.staleFailures)) {
        $safeMessage = ([string]$event.errorMessage).Replace('|', '/')
        $lines.Add("| $($event.id) | $($event.eventType) | $($event.processStatus) | $($event.signatureValid) | $($event.retryCount) | $($event.createTime) | $($event.errorCategory) | $safeMessage |")
    }
    if (@($Report.staleFailures).Count -eq 0) {
        $lines.Add("| - | - | - | - | 0 | - | - | - |")
    }
    $lines.Add("")
    $lines.Add("Boundary: this report does not retry events, does not write database rows, does not call Douyin OpenAPI, and does not persist raw payloads.")
    return ($lines -join "`n") + "`n"
}

if ($StaleDays -lt 1) {
    throw 'StaleDays must be >= 1'
}
if ($Limit -lt 1 -or $Limit -gt 100) {
    throw 'Limit must be between 1 and 100'
}

$sql = New-EventInboxReportSql -Days $StaleDays -RowLimit $Limit
$output = @(Invoke-Hk2Sql -Sql $sql)
$jsonText = Get-JsonFromOutput -Output $output
$report = $jsonText | ConvertFrom-Json

if (-not [string]::IsNullOrWhiteSpace($OutputJsonPath)) {
    Write-TextArtifact -Text $jsonText -Path $OutputJsonPath
}

if (-not [string]::IsNullOrWhiteSpace($OutputMarkdownPath)) {
    $markdown = Convert-ReportToMarkdown -Report $report
    Write-TextArtifact -Text $markdown -Path $OutputMarkdownPath
}

Write-Host 'douyin life event inbox report'
Write-Host "status: $($report.summary.status)"
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host "total: $($report.summary.total)"
Write-Host "failed: $($report.summary.failed)"
Write-Host "retry: $($report.summary.retry)"
Write-Host "dead: $($report.summary.dead)"
Write-Host "staleFailures: $($report.summary.staleFailures)"
Write-Host "staleXLifeSignFailures: $($report.summary.staleXLifeSignFailures)"
Write-Host "recommendation: $($report.recommendation)"
if (-not [string]::IsNullOrWhiteSpace($OutputJsonPath)) {
    Write-Host "json: $OutputJsonPath"
}
if (-not [string]::IsNullOrWhiteSpace($OutputMarkdownPath)) {
    Write-Host "markdown: $OutputMarkdownPath"
}
