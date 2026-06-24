[CmdletBinding()]
param(
    [ValidateSet('LocalDocker', 'SshDocker')]
    [string]$Mode = 'SshDocker',

    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = '',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [string]$Date = '',

    [int]$LookbackDays = 30,

    [string]$OutputJsonPath = '',

    [switch]$AsJson,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-ShanghaiDate {
    if (-not [string]::IsNullOrWhiteSpace($Date)) {
        return $Date
    }
    $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById('China Standard Time')
    return [System.TimeZoneInfo]::ConvertTimeFromUtc((Get-Date).ToUniversalTime(), $tz).ToString('yyyy-MM-dd')
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

function New-BookingChainSql {
    param(
        [Parameter(Mandatory = $true)][string]$BizDate,
        [Parameter(Mandatory = $true)][int]$Days
    )

    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with params as (
    select '$BizDate'::date as biz_date,
           greatest($Days, 1)::int as lookback_days,
           ('$BizDate'::date - (greatest($Days, 1)::int - 1))::date as start_date
),
slot_today as (
    select s.*
    from yy_booking_slot_inventory s, params p
    where s.del_flag = '0'
      and s.biz_date = p.biz_date::text
),
today_slot_summary as (
    select jsonb_build_object(
        'date', (select biz_date::text from params),
        'slotCount', (select count(*) from slot_today),
        'capacity', (select coalesce(sum(coalesce(capacity, 0)), 0) from slot_today),
        'paidCount', (select coalesce(sum(coalesce(paid_count, 0)), 0) from slot_today),
        'conflictCount', (select coalesce(sum(coalesce(conflict_count, 0)), 0) from slot_today),
        'fullSlotCount', (select count(*) from slot_today where coalesce(paid_count, 0) + coalesce(conflict_count, 0) >= coalesce(capacity, 0) and coalesce(capacity, 0) > 0),
        'byStore', coalesce(jsonb_object_agg(store_id::text, store_data order by store_id::text), '{}'::jsonb)
    ) as data
    from (
        select store_id,
               jsonb_build_object(
                   'slotCount', count(*),
                   'capacity', coalesce(sum(coalesce(capacity, 0)), 0),
                   'paidCount', coalesce(sum(coalesce(paid_count, 0)), 0),
                   'conflictCount', coalesce(sum(coalesce(conflict_count, 0)), 0)
               ) as store_data
        from slot_today
        group by store_id
    ) by_store
),
today_slots as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', id::text,
        'storeId', store_id::text,
        'serviceGroupId', coalesce(service_group_id::text, ''),
        'externalSkuIdPresent', coalesce(external_sku_id, '') <> '',
        'date', biz_date,
        'time', start_time || '-' || end_time,
        'capacity', coalesce(capacity, 0),
        'paidCount', coalesce(paid_count, 0),
        'conflictCount', coalesce(conflict_count, 0),
        'status', coalesce(status, '')
    ) order by store_id, start_time, end_time, id), '[]'::jsonb) as data
    from slot_today
),
orders_window as (
    select o.*
    from yy_order o, params p
    where o.del_flag = '0'
      and (
        nullif(o.slot_date, '')::date between p.start_date and p.biz_date
        or nullif(to_jsonb(o)->>'arrival_time', '')::timestamp::date between p.start_date and p.biz_date
        or nullif(to_jsonb(o)->>'order_time', '')::timestamp::date between p.start_date and p.biz_date
      )
),
orders_today as (
    select o.*
    from yy_order o, params p
    where o.del_flag = '0'
      and (
        o.slot_date = p.biz_date::text
        or nullif(to_jsonb(o)->>'arrival_time', '')::timestamp::date = p.biz_date
      )
),
today_order_summary as (
    select jsonb_build_object(
        'orderCount', (select count(*) from orders_today),
        'paidCount', (select count(*) from orders_today where coalesce(pay_status, '') = 'PAID'),
        'withSlotCount', (select count(*) from orders_today where coalesce(slot_date, '') <> '' and coalesce(slot_start_time, '') <> '' and coalesce(slot_end_time, '') <> ''),
        'conflictCount', (select count(*) from orders_today where coalesce(inventory_status, '') = 'CONFLICT'),
        'byChannel', coalesce((select jsonb_object_agg(channel_key, cnt) from (
            select coalesce(channel_type, '') as channel_key, count(*) as cnt from orders_today group by coalesce(channel_type, '')
        ) c), '{}'::jsonb),
        'byStatus', coalesce((select jsonb_object_agg(status_key, status_cnt) from (
            select coalesce(status, '') as status_key, count(*) as status_cnt from orders_today group by coalesce(status, '')
        ) s), '{}'::jsonb)
    ) as data
),
today_orders as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', id::text,
        'orderNoMasked', case when coalesce(order_no, '') = '' then '' else left(order_no, 4) || '***' || right(order_no, 4) end,
        'externalOrderMasked', case when coalesce(external_order_id, '') = '' then '' else left(external_order_id, 4) || '***' || right(external_order_id, 4) end,
        'storeId', coalesce(store_id::text, ''),
        'channelType', coalesce(channel_type, ''),
        'source', coalesce(source, ''),
        'status', coalesce(status, ''),
        'payStatus', coalesce(pay_status, ''),
        'slotDate', coalesce(slot_date, ''),
        'slotTime', coalesce(slot_start_time, '') || case when coalesce(slot_end_time, '') = '' then '' else '-' || slot_end_time end,
        'arrivalTimePresent', coalesce(to_jsonb(o)->>'arrival_time', '') <> '',
        'inventoryStatus', coalesce(inventory_status, ''),
        'inventorySlotId', coalesce(inventory_slot_id::text, ''),
        'externalPoiIdPresent', coalesce(external_poi_id, '') <> '',
        'externalSkuIdPresent', coalesce(external_sku_id, '') <> ''
    ) order by coalesce(slot_start_time, ''), id), '[]'::jsonb) as data
    from orders_today o
),
window_order_summary as (
    select jsonb_build_object(
        'startDate', (select start_date::text from params),
        'endDate', (select biz_date::text from params),
        'orderCount', count(*),
        'jianyueCount', count(*) filter (where channel_type = 'JIANYUE'),
        'douyinLifeCount', count(*) filter (where channel_type = 'DOUYIN_LIFE'),
        'withSlotCount', count(*) filter (where coalesce(slot_date, '') <> '' and coalesce(slot_start_time, '') <> '' and coalesce(slot_end_time, '') <> ''),
        'missingSlotCount', count(*) filter (where coalesce(slot_date, '') = '' or coalesce(slot_start_time, '') = '' or coalesce(slot_end_time, '') = ''),
        'confirmedInventoryCount', count(*) filter (where coalesce(inventory_status, '') = 'CONFIRMED'),
        'conflictInventoryCount', count(*) filter (where coalesce(inventory_status, '') = 'CONFLICT'),
        'needMappingInventoryCount', count(*) filter (where coalesce(inventory_status, '') = 'NEED_MAPPING'),
        'byChannel', coalesce((select jsonb_object_agg(channel_key, cnt) from (
            select coalesce(channel_type, '') as channel_key, count(*) as cnt from orders_window group by coalesce(channel_type, '')
        ) c), '{}'::jsonb),
        'bySource', coalesce((select jsonb_object_agg(source_key, cnt) from (
            select coalesce(source, '') as source_key, count(*) as cnt from orders_window group by coalesce(source, '')
        ) s), '{}'::jsonb)
    ) as data
    from orders_window
),
slot_gap_summary as (
    select jsonb_build_object(
        'paidOrdersWithSlotNoInventory', count(*) filter (where slot.id is null),
        'paidOrdersWithSlotAndInventory', count(*) filter (where slot.id is not null),
        'sample', coalesce(jsonb_agg(jsonb_build_object(
            'orderNoMasked', left(o.order_no, 4) || '***' || right(o.order_no, 4),
            'channelType', coalesce(o.channel_type, ''),
            'storeId', coalesce(o.store_id::text, ''),
            'slotDate', coalesce(o.slot_date, ''),
            'slotTime', coalesce(o.slot_start_time, '') || '-' || coalesce(o.slot_end_time, '')
        ) order by o.slot_date desc, o.slot_start_time desc) filter (where slot.id is null), '[]'::jsonb)
    ) as data
    from orders_window o
    left join yy_booking_slot_inventory slot
      on slot.del_flag = '0'
     and slot.tenant_id = o.tenant_id
     and slot.store_id = o.store_id
     and coalesce(slot.service_group_id, 0) = coalesce(o.service_group_id, 0)
     and coalesce(slot.external_sku_id, '') = coalesce(o.external_sku_id, '')
     and slot.biz_date = o.slot_date
     and slot.start_time = o.slot_start_time
     and slot.end_time = o.slot_end_time
    where o.del_flag = '0'
      and o.pay_status = 'PAID'
      and coalesce(o.status, '') not in ('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT')
      and coalesce(o.slot_date, '') <> ''
      and coalesce(o.slot_start_time, '') <> ''
      and coalesce(o.slot_end_time, '') <> ''
),
sync_health as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'apiName', coalesce(api_name, ''),
        'success', coalesce(success, ''),
        'requestId', coalesce(request_id, ''),
        'errorMessage', left(coalesce(error_message, ''), 160),
        'remark', left(coalesce(remark, ''), 220),
        'createTime', coalesce(to_char(create_time, 'YYYY-MM-DD HH24:MI:SS'), '')
    ) order by create_time desc nulls last, id desc), '[]'::jsonb) as data
    from (
        select *
        from yy_channel_sync_log
        where del_flag = '0'
          and channel_type = 'DOUYIN_LIFE'
          and api_name in ('life_order_auto_sync', 'life_order_query', 'reservation_order_create', 'reservation_pay_notify', 'reservation_stock_query')
        order by create_time desc nulls last, id desc
        limit 12
    ) l
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'date', (select biz_date::text from params),
    'lookbackDays', (select lookback_days from params),
    'todaySlotsSummary', (select data from today_slot_summary),
    'todaySlots', (select data from today_slots),
    'todayOrdersSummary', (select data from today_order_summary),
    'todayOrders', (select data from today_orders),
    'windowOrdersSummary', (select data from window_order_summary),
    'slotGapSummary', (select data from slot_gap_summary),
    'recentDouyinSyncLogs', (select data from sync_health)
)::text;
"@
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
            throw "remote booking chain snapshot failed: exit=$($result.ExitStatus), $err"
        }
        return $result.Output
    } finally {
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
    }
}

function ConvertTo-JsonText {
    param([Parameter(Mandatory = $true)][object[]]$Output)

    $lines = @($Output | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $jsonLines = @($lines | Where-Object { $_.TrimStart().StartsWith('{') })
    if ($jsonLines.Count -eq 0) {
        throw 'empty booking chain snapshot output'
    }
    return ([string]$jsonLines[-1]).Trim()
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

$bizDate = Get-ShanghaiDate
$sql = New-BookingChainSql -BizDate $bizDate -Days $LookbackDays

if ($DryRun) {
    Write-Host 'yingyue booking chain snapshot dry-run SQL'
    Write-Host "mode: $Mode"
    Write-Host "date: $bizDate"
    Write-Host "lookbackDays: $LookbackDays"
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
    exit 0
}

$report = $jsonText | ConvertFrom-Json

Write-Host 'yingyue booking chain snapshot'
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host "date: $($report.date)"
Write-Host "lookbackDays: $($report.lookbackDays)"
Write-Host "todaySlots: $($report.todaySlotsSummary.slotCount)"
Write-Host "todayCapacity: $($report.todaySlotsSummary.capacity)"
Write-Host "todayPaid: $($report.todaySlotsSummary.paidCount)"
Write-Host "todayConflicts: $($report.todaySlotsSummary.conflictCount)"
Write-Host "todayOrders: $($report.todayOrdersSummary.orderCount)"
Write-Host "todayOrdersWithSlot: $($report.todayOrdersSummary.withSlotCount)"
Write-Host "windowOrders: $($report.windowOrdersSummary.orderCount)"
Write-Host "windowMissingSlot: $($report.windowOrdersSummary.missingSlotCount)"
Write-Host "paidOrdersWithSlotNoInventory: $($report.slotGapSummary.paidOrdersWithSlotNoInventory)"
Write-Host ''
Write-Host 'today orders by channel'
($report.todayOrdersSummary.byChannel | ConvertTo-Json -Compress) | Write-Host
Write-Host ''
Write-Host 'window orders by channel'
($report.windowOrdersSummary.byChannel | ConvertTo-Json -Compress) | Write-Host
Write-Host ''
Write-Host 'latest douyin sync logs'
$report.recentDouyinSyncLogs |
    Select-Object apiName, success, requestId, errorMessage, remark, createTime |
    Format-Table -AutoSize |
    Out-String |
    Write-Host
