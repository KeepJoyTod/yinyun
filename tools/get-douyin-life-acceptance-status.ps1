[CmdletBinding()]
param(
    [ValidateSet('LocalDocker', 'SshDocker')]
    [string]$Mode = 'LocalDocker',

    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = '',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [int]$RecentHours = 168,

    [switch]$AsJson,

    [string]$OutputJsonPath = '',

    [switch]$FailOnPending,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function New-AcceptanceSql {
    param([Parameter(Mandatory = $true)][int]$Hours)

    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with case_defs(sort_order, case_key, label, api_names, required, logid_source, next_action) as (
    values
        (10, 'webhook_challenge', '事件订阅 Webhook', array['life_event_webhook']::text[], false, 'X-Bytedance-Logid 或 challenge', '开放平台连接测试已由 preflight 覆盖；真实事件会写同步日志'),
        (20, 'issue_code', '三方码发券 SPI', array['tripartite_code_create']::text[], true, '请求头 X-Bytedance-Logid', '用真实下单触发发券，复制 logid 到开放平台'),
        (30, 'reservation_callback', '预约创单/支付回调', array['reservation_order_create','reservation_pay_notify']::text[], true, '请求头 X-Bytedance-Logid', '用户真实预约或支付后，等待抖音推送 order-create/pay-notify'),
        (40, 'confirm_order', '接单 OpenAPI', array['life_order_confirm']::text[], true, '响应 extra.logid 或 logid', '拿真实 book_id 调用接单；若创单已同步确认，记录平台说明'),
        (50, 'verify_order', '整单核销 OpenAPI', array['life_order_verify']::text[], true, '响应 extra.logid 或 logid', '拿真实券码或 verify_token 调用核销'),
        (60, 'order_auto_sync', '订单自动/补偿同步', array['life_order_auto_sync','life_order_query']::text[], false, '响应 extra.logid 或 logid', '自动同步或手动同步用于补偿漏推订单'),
        (70, 'refund_flow', '退款通知/申请', array['refund_apply','refund_notify']::text[], false, '请求头 X-Bytedance-Logid', '退款用例需要时再填对应 logid')
),
latest_logs as (
    select distinct on (api_name)
        api_name,
        coalesce(request_id, '') as request_id,
        coalesce(success, '') as success,
        coalesce(error_message, '') as error_message,
        coalesce(remark, '') as remark,
        create_time
    from yy_channel_sync_log
    where del_flag = '0'
      and channel_type = 'DOUYIN_LIFE'
      and create_time >= now() - interval '${Hours} hours'
    order by api_name, create_time desc nulls last, id desc
),
case_rows as (
    select
        d.sort_order,
        d.case_key,
        d.label,
        d.required,
        d.logid_source,
        d.next_action,
        coalesce(l.api_name, '') as api_name,
        coalesce(l.request_id, '') as request_id,
        coalesce(l.success, '') as success,
        coalesce(l.error_message, '') as error_message,
        coalesce(l.remark, '') as remark,
        l.create_time,
        case
            when l.api_name is null then 'PENDING'
            when lower(coalesce(l.success, '')) not in ('1', 'true', 'yes') then 'FAILED'
            when coalesce(l.request_id, '') = '' then 'NO_LOGID'
            else 'PASS'
        end as status
    from case_defs d
    left join lateral (
        select *
        from latest_logs ll
        where ll.api_name = any(d.api_names)
        order by ll.create_time desc nulls last
        limit 1
    ) l on true
),
event_stats as (
    select
        count(*)::bigint as total_count,
        count(*) filter (where process_status in ('RECEIVED','FAILED','RETRY'))::bigint as retryable_count,
        count(*) filter (where process_status = 'FAILED')::bigint as failed_count,
        count(*) filter (where process_status = 'RETRY')::bigint as retry_count,
        count(*) filter (where process_status = 'DEAD')::bigint as dead_count,
        count(*) filter (where process_status in ('PROCESSED','DONE'))::bigint as done_count,
        max(create_time) as latest_event_time
    from yy_channel_event_inbox
    where channel_type = 'DOUYIN_LIFE'
),
latest_events as (
    select
        event_type,
        process_status,
        coalesce(request_id, '') as request_id,
        case when coalesce(external_order_id, '') = '' then '' else left(external_order_id, 4) || '***' || right(external_order_id, 4) end as masked_external_order_id,
        create_time
    from yy_channel_event_inbox
    where channel_type = 'DOUYIN_LIFE'
    order by create_time desc nulls last, id desc
    limit 10
),
case_counts as (
    select
        count(*) filter (where required)::bigint as required_count,
        count(*) filter (where required and status = 'PASS')::bigint as required_pass_count,
        count(*) filter (where required and status in ('PENDING','NO_LOGID'))::bigint as required_pending_count,
        count(*) filter (where required and status = 'FAILED')::bigint as required_failed_count
    from case_rows
),
overall as (
    select
        case
            when (select required_failed_count from case_counts) > 0 or coalesce((select dead_count from event_stats), 0) > 0 then 'ACTION_REQUIRED'
            when (select required_pending_count from case_counts) > 0 then 'PENDING_EXTERNAL_ACCEPTANCE'
            else 'PASS'
        end as status
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'channel', 'DOUYIN_LIFE',
    'windowHours', $Hours,
    'status', (select status from overall),
    'caseCounts', (select jsonb_build_object(
        'required', required_count,
        'passed', required_pass_count,
        'pending', required_pending_count,
        'failed', required_failed_count
    ) from case_counts),
    'cases', coalesce((select jsonb_agg(jsonb_build_object(
        'caseKey', case_key,
        'label', label,
        'required', required,
        'status', status,
        'apiName', api_name,
        'requestId', request_id,
        'success', success,
        'latestTime', coalesce(to_char(create_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'logidSource', logid_source,
        'nextAction', next_action,
        'errorMessage', left(error_message, 180)
    ) order by sort_order) from case_rows), '[]'::jsonb),
    'eventInbox', (select jsonb_build_object(
        'total', coalesce(total_count, 0),
        'done', coalesce(done_count, 0),
        'retryable', coalesce(retryable_count, 0),
        'failed', coalesce(failed_count, 0),
        'retry', coalesce(retry_count, 0),
        'dead', coalesce(dead_count, 0),
        'latestEventTime', coalesce(to_char(latest_event_time, 'YYYY-MM-DD HH24:MI:SS'), ''),
        'status', case
            when coalesce(dead_count, 0) > 0 then 'DEAD'
            when coalesce(failed_count, 0) > 0 or coalesce(retry_count, 0) > 0 then 'WARNING'
            when coalesce(total_count, 0) = 0 then 'WAITING'
            else 'HEALTHY'
        end
    ) from event_stats),
    'latestEvents', coalesce((select jsonb_agg(jsonb_build_object(
        'eventType', event_type,
        'processStatus', process_status,
        'requestId', request_id,
        'maskedExternalOrderId', masked_external_order_id,
        'createTime', coalesce(to_char(create_time, 'YYYY-MM-DD HH24:MI:SS'), '')
    )) from latest_events), '[]'::jsonb)
)::text;
"@
}

function Get-PasswordFromFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "password file not found: $Path"
    }

    $lines = @(Get-Content -LiteralPath $Path | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($lines.Count -eq 0) {
        throw "password file is empty: $Path"
    }

    $passwordLabels = '密码|password|passwd|pwd'
    $candidates = @($lines | Where-Object { $_ -match $passwordLabels })
    $line = if ($candidates.Count -gt 0) { [string]$candidates[-1] } else { [string]$lines[-1] }
    if ($line -match '[:=：]\s*(.+)$') {
        return $Matches[1].Trim()
    }
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $passwordLabels -and $i + 1 -lt $lines.Count) {
            return ([string]$lines[$i + 1]).Trim()
        }
    }
    return $line.Trim()
}

function Invoke-LocalDockerQuery {
    param([Parameter(Mandatory = $true)][string]$Sql)
    $Sql | docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1
}

function Invoke-SshDockerQuery {
    param([Parameter(Mandatory = $true)][string]$Sql)

    Import-Module Posh-SSH -ErrorAction Stop
    if ([string]::IsNullOrWhiteSpace($SshPasswordFile)) {
        throw 'SshPasswordFile is required for SshDocker mode.'
    }

    $password = Get-PasswordFromFile -Path $SshPasswordFile
    $secure = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = [pscredential]::new($SshUser, $secure)
    $session = New-SSHSession -ComputerName $SshHost -Credential $credential -AcceptKey -ErrorAction Stop
    try {
        $encodedSql = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Sql))
        $remoteCommand = "tmp=`$(mktemp); printf '%s' '$encodedSql' | base64 -d > `$tmp; docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < `$tmp; rc=`$?; rm -f `$tmp; exit `$rc"
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $remoteCommand -TimeOut 90
        if ($result.ExitStatus -ne 0) {
            $err = ($result.Error | Out-String).Trim()
            throw "remote acceptance status failed: exit=$($result.ExitStatus), $err"
        }
        return $result.Output
    } finally {
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
    }
}

function Write-JsonArtifact {
    param(
        [Parameter(Mandatory = $true)][string]$Json,
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Json, $utf8NoBom)
}

function ConvertTo-JsonText {
    param([Parameter(Mandatory = $true)][object[]]$Output)

    $lines = @($Output | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $jsonLines = @($lines | Where-Object { $_.TrimStart().StartsWith('{') })
    if ($jsonLines.Count -eq 0) {
        throw 'empty acceptance status output'
    }
    return ([string]$jsonLines[-1]).Trim()
}

$sql = New-AcceptanceSql -Hours $RecentHours

if ($DryRun) {
    Write-Host 'douyin life acceptance status dry-run SQL'
    Write-Host "mode: $Mode"
    Write-Host "recentHours: $RecentHours"
    Write-Host ''
    Write-Host $sql
    exit 0
}

$output = if ($Mode -eq 'LocalDocker') {
    Invoke-LocalDockerQuery -Sql $sql
} else {
    Invoke-SshDockerQuery -Sql $sql
}

$jsonText = ConvertTo-JsonText -Output $output
Write-JsonArtifact -Json $jsonText -Path $OutputJsonPath

if ($AsJson) {
    Write-Host $jsonText
    $reportForExit = $jsonText | ConvertFrom-Json
    if ($FailOnPending -and [string]$reportForExit.status -ne 'PASS') {
        exit 1
    }
    exit 0
}

$report = $jsonText | ConvertFrom-Json

Write-Host 'douyin life acceptance status'
Write-Host "status: $($report.status)"
Write-Host "channel: $($report.channel)"
Write-Host "windowHours: $($report.windowHours)"
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host ''

$report.cases |
    Select-Object label, required, status, apiName, requestId, latestTime, nextAction |
    Format-Table -AutoSize |
    Out-String |
    Write-Host

Write-Host 'event inbox'
$report.eventInbox |
    Select-Object status, total, done, retryable, failed, retry, dead, latestEventTime |
    Format-List |
    Out-String |
    Write-Host

if ($report.latestEvents.Count -gt 0) {
    Write-Host 'latest inbox events'
    $report.latestEvents |
        Select-Object eventType, processStatus, requestId, maskedExternalOrderId, createTime |
        Format-Table -AutoSize |
        Out-String |
        Write-Host
}

if ($FailOnPending -and [string]$report.status -ne 'PASS') {
    throw "douyin life acceptance status is $($report.status)"
}
