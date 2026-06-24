[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [string]$DiscoveryJsonPath = '',

    [string]$OutputJsonPath = '',

    [string]$OutputMarkdownPath = '',

    [switch]$AsJson,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Resolve-DiscoveryJsonPath {
    param([string]$Path)

    if (-not [string]::IsNullOrWhiteSpace($Path)) {
        if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
            throw "DiscoveryJsonPath not found: $Path"
        }
        return (Resolve-Path -LiteralPath $Path).Path
    }

    $evidenceDir = Join-Path $PSScriptRoot '..\docs\evidence'
    $candidate = Get-ChildItem -LiteralPath $evidenceDir -Filter 'douyin-life-real-account-discovery-*.json' |
        Where-Object { $_.Length -gt 0 } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($null -eq $candidate) {
        throw "No discovery JSON found in: $evidenceDir"
    }
    return $candidate.FullName
}

function ConvertTo-Array {
    param($Value)
    if ($null -eq $Value) {
        return @()
    }
    if ($Value -is [System.Array]) {
        return @($Value)
    }
    return @($Value)
}

function First-Value {
    param($Value)
    $items = ConvertTo-Array $Value
    foreach ($item in $items) {
        if (-not [string]::IsNullOrWhiteSpace([string]$item)) {
            return [string]$item
        }
    }
    return ''
}

function Escape-SqlLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)
    return $Value.Replace("'", "''")
}

function New-DiagnosisInput {
    param(
        [Parameter(Mandatory = $true)][pscustomobject]$Discovery,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $sampleOrders = @()
    foreach ($order in (ConvertTo-Array $Discovery.order_discovery.sample_orders)) {
        $sampleOrders += [ordered]@{
            order_hash = [string]$order.order_hash
            order_id_masked = [string]$order.order_id_masked
            poi_id = [string]$order.primary_poi_id
            product_id = [string]$order.primary_product_id
            sku_id = [string]$order.primary_sku_id
            order_status = [string]$order.order_status
            create_order_time = [string]$order.time_fields.create_order_time
            pay_time = [string]$order.time_fields.pay_time
            update_order_time = [string]$order.time_fields.update_order_time
            buyer_reserve_info_count = [int]($order.buyer_reserve_info_count ?? 0)
            reserve_candidate_count = [int]($order.reserve_candidate_count ?? 0)
        }
    }

    $pairMap = [ordered]@{}
    foreach ($order in $sampleOrders) {
        $key = "$($order.poi_id)|$($order.product_id)|$($order.sku_id)"
        if (-not $pairMap.Contains($key)) {
            $pairMap[$key] = [ordered]@{
                poi_id = $order.poi_id
                product_id = $order.product_id
                sku_id = $order.sku_id
                expected_orders = 0
            }
        }
        $pairMap[$key].expected_orders++
    }

    [ordered]@{
        discovery_file = (Split-Path -Leaf $Path)
        discovery_generated_at = [string]$Discovery.generated_at
        window = $Discovery.window
        expected_sample_order_count = $sampleOrders.Count
        discovery_deduped_order_count = [int]($Discovery.order_discovery.deduped_order_count ?? 0)
        sample_orders = $sampleOrders
        expected_pairs = @($pairMap.Values)
    }
}

function New-DiagnosisSql {
    param([Parameter(Mandatory = $true)][string]$InputJson)

    $escapedJson = Escape-SqlLiteral -Value $InputJson
    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with input as (
    select '$escapedJson'::jsonb as data
),
sample_orders as (
    select *
    from input,
         jsonb_to_recordset(input.data->'sample_orders') as s(
            order_hash text,
            order_id_masked text,
            poi_id text,
            product_id text,
            sku_id text,
            order_status text,
            create_order_time text,
            pay_time text,
            update_order_time text,
            buyer_reserve_info_count int,
            reserve_candidate_count int
         )
),
expected_pairs as (
    select *
    from input,
         jsonb_to_recordset(input.data->'expected_pairs') as p(
            poi_id text,
            product_id text,
            sku_id text,
            expected_orders int
         )
),
mapping_matches as (
    select s.order_hash,
           count(distinct m.id) as mapping_matches,
           coalesce(bool_or(coalesce(to_jsonb(m)->>'sync_status', '') = 'SYNCED'), false) as mapping_synced,
           coalesce(bool_or(coalesce(to_jsonb(m)->>'sync_status', '') = 'FAILED_LOCAL'), false) as mapping_failed_local,
           coalesce(jsonb_agg(distinct jsonb_build_object(
               'mappingId', m.id::text,
               'localOrderIdPresent', coalesce(to_jsonb(m)->>'local_order_id', '') <> '',
               'syncStatus', coalesce(to_jsonb(m)->>'sync_status', ''),
               'externalStatus', coalesce(to_jsonb(m)->>'external_status', ''),
               'updateTime', coalesce(to_jsonb(m)->>'update_time', ''),
               'createTime', coalesce(to_jsonb(m)->>'create_time', '')
           )) filter (where m.id is not null), '[]'::jsonb) as mappings
    from sample_orders s
    left join yy_channel_order_mapping m
      on m.del_flag = '0'
     and coalesce(to_jsonb(m)->>'channel_type', '') = 'DOUYIN_LIFE'
     and left(encode(sha256(coalesce(to_jsonb(m)->>'external_order_id', '')::bytea), 'hex'), 16) = s.order_hash
    group by s.order_hash
),
order_matches as (
    select s.order_hash,
           count(distinct o.id) as order_matches,
           coalesce(jsonb_agg(distinct jsonb_build_object(
               'orderId', o.id::text,
               'storeId', coalesce(to_jsonb(o)->>'store_id', ''),
               'source', coalesce(to_jsonb(o)->>'source', ''),
               'channelType', coalesce(to_jsonb(o)->>'channel_type', ''),
               'status', coalesce(to_jsonb(o)->>'status', ''),
               'payStatus', coalesce(to_jsonb(o)->>'pay_status', ''),
               'inventoryStatus', coalesce(to_jsonb(o)->>'inventory_status', ''),
               'slotDatePresent', coalesce(to_jsonb(o)->>'slot_date', '') <> '',
               'slotStartPresent', coalesce(to_jsonb(o)->>'slot_start_time', '') <> '',
               'slotEndPresent', coalesce(to_jsonb(o)->>'slot_end_time', '') <> '',
               'externalPoiId', coalesce(to_jsonb(o)->>'external_poi_id', ''),
               'externalSkuId', coalesce(to_jsonb(o)->>'external_sku_id', ''),
               'orderTime', coalesce(to_jsonb(o)->>'order_time', ''),
               'createTime', coalesce(to_jsonb(o)->>'create_time', '')
           )) filter (where o.id is not null), '[]'::jsonb) as orders
    from sample_orders s
    left join yy_channel_order_mapping m
      on m.del_flag = '0'
     and coalesce(to_jsonb(m)->>'channel_type', '') = 'DOUYIN_LIFE'
     and left(encode(sha256(coalesce(to_jsonb(m)->>'external_order_id', '')::bytea), 'hex'), 16) = s.order_hash
    left join yy_order o
      on o.del_flag = '0'
     and (
        o.id::text = coalesce(to_jsonb(m)->>'local_order_id', '')
        or left(encode(sha256(coalesce(to_jsonb(o)->>'external_order_id', '')::bytea), 'hex'), 16) = s.order_hash
     )
    group by s.order_hash
),
sample_status as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'orderHash', s.order_hash,
        'orderMasked', s.order_id_masked,
        'poiId', s.poi_id,
        'productId', s.product_id,
        'skuId', s.sku_id,
        'externalStatus', s.order_status,
        'createOrderTime', s.create_order_time,
        'payTime', s.pay_time,
        'buyerReserveInfoCount', coalesce(s.buyer_reserve_info_count, 0),
        'reserveCandidateCount', coalesce(s.reserve_candidate_count, 0),
        'mappingMatches', coalesce(mm.mapping_matches, 0),
        'mappingSynced', coalesce(mm.mapping_synced, false),
        'mappingFailedLocal', coalesce(mm.mapping_failed_local, false),
        'orderMatches', coalesce(om.order_matches, 0),
        'mappings', coalesce(mm.mappings, '[]'::jsonb),
        'orders', coalesce(om.orders, '[]'::jsonb)
    ) order by s.create_order_time desc nulls last, s.order_hash), '[]'::jsonb) as data
    from sample_orders s
    left join mapping_matches mm on mm.order_hash = s.order_hash
    left join order_matches om on om.order_hash = s.order_hash
),
pair_status as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'poiId', p.poi_id,
        'productId', p.product_id,
        'skuId', p.sku_id,
        'expectedOrders', p.expected_orders,
        'activeMappingCount', coalesce(pm.active_mapping_count, 0),
        'mappingCount', coalesce(pm.mapping_count, 0),
        'localOrderCountByPair', coalesce(po.local_order_count, 0),
        'localOrdersWithSlotByPair', coalesce(po.local_order_with_slot_count, 0),
        'mappingStoreIds', coalesce(pm.store_ids, '[]'::jsonb)
    ) order by p.poi_id, p.sku_id), '[]'::jsonb) as data
    from expected_pairs p
    left join lateral (
        select count(*) as mapping_count,
               count(*) filter (where coalesce(to_jsonb(m)->>'mapping_status', '') = 'ACTIVE') as active_mapping_count,
               coalesce(jsonb_agg(distinct coalesce(to_jsonb(m)->>'store_id', '')) filter (where m.id is not null), '[]'::jsonb) as store_ids
        from yy_channel_product_mapping m
        where m.del_flag = '0'
          and coalesce(to_jsonb(m)->>'channel_type', '') = 'DOUYIN_LIFE'
          and coalesce(to_jsonb(m)->>'external_poi_id', '') = p.poi_id
          and coalesce(to_jsonb(m)->>'external_sku_id', '') = p.sku_id
    ) pm on true
    left join lateral (
        select count(*) as local_order_count,
               count(*) filter (
                   where coalesce(to_jsonb(o)->>'slot_date', '') <> ''
                     and coalesce(to_jsonb(o)->>'slot_start_time', '') <> ''
                     and coalesce(to_jsonb(o)->>'slot_end_time', '') <> ''
               ) as local_order_with_slot_count
        from yy_order o
        where o.del_flag = '0'
          and coalesce(to_jsonb(o)->>'channel_type', '') = 'DOUYIN_LIFE'
          and coalesce(to_jsonb(o)->>'external_poi_id', '') = p.poi_id
          and coalesce(to_jsonb(o)->>'external_sku_id', '') = p.sku_id
    ) po on true
),
sync_logs as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'apiName', coalesce(to_jsonb(l)->>'api_name', ''),
        'success', coalesce(to_jsonb(l)->>'success', ''),
        'requestId', coalesce(to_jsonb(l)->>'request_id', ''),
        'errorMessage', left(coalesce(to_jsonb(l)->>'error_message', ''), 220),
        'remark', left(coalesce(to_jsonb(l)->>'remark', ''), 320),
        'createTime', coalesce(to_char(l.create_time, 'YYYY-MM-DD HH24:MI:SS'), '')
    ) order by l.create_time desc nulls last, l.id desc), '[]'::jsonb) as data
    from (
        select *
        from yy_channel_sync_log
        where del_flag = '0'
          and channel_type = 'DOUYIN_LIFE'
          and api_name in ('life_order_auto_sync', 'life_order_query', 'life_order_backfill', 'reservation_order_create', 'reservation_pay_notify')
        order by create_time desc nulls last, id desc
        limit 18
    ) l
),
event_inbox as (
    select jsonb_build_object(
        'total', count(*),
        'retryable', count(*) filter (where process_status in ('RECEIVED', 'FAILED', 'RETRY')),
        'dead', count(*) filter (where process_status = 'DEAD'),
        'done', count(*) filter (where process_status = 'DONE'),
        'latest', coalesce(jsonb_agg(jsonb_build_object(
            'eventType', coalesce(to_jsonb(e)->>'event_type', ''),
            'processStatus', coalesce(to_jsonb(e)->>'process_status', ''),
            'requestIdPresent', coalesce(to_jsonb(e)->>'request_id', '') <> '',
            'errorMessage', left(coalesce(to_jsonb(e)->>'error_message', ''), 180),
            'createTime', coalesce(to_char(e.create_time, 'YYYY-MM-DD HH24:MI:SS'), '')
        ) order by e.create_time desc nulls last, e.id desc) filter (where rn <= 8), '[]'::jsonb)
    ) as data
    from (
        select e.*, row_number() over (order by e.create_time desc nulls last, e.id desc) as rn
        from yy_channel_event_inbox e
        where e.del_flag = '0'
          and e.channel_type = 'DOUYIN_LIFE'
    ) e
),
overall as (
    select jsonb_build_object(
        'expectedSampleOrderCount', (select count(*) from sample_orders),
        'sampleMappingsFound', (select count(*) from mapping_matches where mapping_matches > 0),
        'sampleOrdersFound', (select count(*) from order_matches where order_matches > 0),
        'sampleOrdersMissingLocal', (select count(*) from order_matches where order_matches = 0),
        'activePairMappingGap', (select count(*) from pair_status ps, jsonb_to_recordset(ps.data) as row("activeMappingCount" int) where coalesce(row."activeMappingCount", 0) = 0),
        'sampleOrdersWithReserveTime', (select count(*) from sample_orders where coalesce(reserve_candidate_count, 0) > 0),
        'sampleOrdersWithBuyerReserveInfo', (select count(*) from sample_orders where coalesce(buyer_reserve_info_count, 0) > 0)
    ) as data
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'mode', 'READ_ONLY_DOUYIN_LIFE_SYNC_DIAGNOSIS',
    'discoveryFile', (select data->>'discovery_file' from input),
    'discoveryGeneratedAt', (select data->>'discovery_generated_at' from input),
    'discoveryWindow', (select data->'window' from input),
    'overall', (select data from overall),
    'sampleOrders', (select data from sample_status),
    'expectedPairs', (select data from pair_status),
    'recentSyncLogs', (select data from sync_logs),
    'eventInbox', (select data from event_inbox)
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
        throw 'empty sync diagnosis output'
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

function New-MarkdownReport {
    param([Parameter(Mandatory = $true)][pscustomobject]$Report)

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Douyin Life Sync Diagnosis')
    $lines.Add('')
    $lines.Add("generatedAt: $($Report.generatedAt)")
    $lines.Add("mode: $($Report.mode)")
    $lines.Add("discoveryFile: $($Report.discoveryFile)")
    $lines.Add('')
    $lines.Add('## Overall')
    $lines.Add('')
    $lines.Add("| metric | value |")
    $lines.Add("| --- | ---: |")
    $lines.Add("| expectedSampleOrderCount | $($Report.overall.expectedSampleOrderCount) |")
    $lines.Add("| sampleMappingsFound | $($Report.overall.sampleMappingsFound) |")
    $lines.Add("| sampleOrdersFound | $($Report.overall.sampleOrdersFound) |")
    $lines.Add("| sampleOrdersMissingLocal | $($Report.overall.sampleOrdersMissingLocal) |")
    $lines.Add("| activePairMappingGap | $($Report.overall.activePairMappingGap) |")
    $lines.Add("| sampleOrdersWithReserveTime | $($Report.overall.sampleOrdersWithReserveTime) |")
    $lines.Add('')
    $lines.Add('## Sample Orders')
    $lines.Add('')
    $lines.Add("| order | poi | sku | ext_status | mapping | local_order | slot |")
    $lines.Add("| --- | --- | --- | --- | ---: | ---: | --- |")
    foreach ($row in (ConvertTo-Array $Report.sampleOrders)) {
        $slot = 'no'
        foreach ($order in (ConvertTo-Array $row.orders)) {
            if ($order.slotDatePresent -and $order.slotStartPresent -and $order.slotEndPresent) {
                $slot = 'yes'
            }
        }
        $lines.Add("| $($row.orderMasked) | $($row.poiId) | $($row.skuId) | $($row.externalStatus) | $($row.mappingMatches) | $($row.orderMatches) | $slot |")
    }
    $lines.Add('')
    $lines.Add('## Pair Mapping')
    $lines.Add('')
    $lines.Add("| poi | sku | expected_orders | mapping | active | local_orders | with_slot |")
    $lines.Add("| --- | --- | ---: | ---: | ---: | ---: | ---: |")
    foreach ($row in (ConvertTo-Array $Report.expectedPairs)) {
        $lines.Add("| $($row.poiId) | $($row.skuId) | $($row.expectedOrders) | $($row.mappingCount) | $($row.activeMappingCount) | $($row.localOrderCountByPair) | $($row.localOrdersWithSlotByPair) |")
    }
    $lines.Add('')
    $lines.Add('## Recent Sync Logs')
    $lines.Add('')
    $lines.Add("| time | api | success | requestId | summary |")
    $lines.Add("| --- | --- | --- | --- | --- |")
    foreach ($row in (ConvertTo-Array $Report.recentSyncLogs | Select-Object -First 8)) {
        $summary = if ([string]::IsNullOrWhiteSpace([string]$row.remark)) { [string]$row.errorMessage } else { [string]$row.remark }
        $summary = $summary.Replace('|', '/')
        $lines.Add("| $($row.createTime) | $($row.apiName) | $($row.success) | $($row.requestId) | $summary |")
    }
    $lines.Add('')
    $lines.Add('## Conclusion')
    $lines.Add('')
    if ([int]$Report.overall.sampleOrdersFound -eq [int]$Report.overall.expectedSampleOrderCount) {
        $lines.Add('- 当前发现样本已经全部落入本地 `yy_order`。')
    } else {
        $lines.Add('- 当前发现样本未全部落入本地 `yy_order`，下一步应走补偿同步或定位同步窗口/状态过滤。')
    }
    if ([int]$Report.overall.activePairMappingGap -eq 0) {
        $lines.Add('- `POI+SKU` 商品映射已具备 ACTIVE 覆盖。')
    } else {
        $lines.Add('- 仍有 `POI+SKU` 商品映射缺口，不能直接补偿同步。')
    }
    if ([int]$Report.overall.sampleOrdersWithReserveTime -eq 0) {
        $lines.Add('- 样本订单仍没有真实预约时段，不能写 `yy_booking_slot_inventory`。')
    }
    return ($lines -join [Environment]::NewLine) + [Environment]::NewLine
}

$resolvedDiscoveryPath = Resolve-DiscoveryJsonPath -Path $DiscoveryJsonPath
$discovery = Get-Content -Raw -LiteralPath $resolvedDiscoveryPath | ConvertFrom-Json
$inputObject = New-DiagnosisInput -Discovery $discovery -Path $resolvedDiscoveryPath
$inputJson = $inputObject | ConvertTo-Json -Depth 30 -Compress
$sql = New-DiagnosisSql -InputJson $inputJson

if ($DryRun) {
    Write-Host $sql
    exit 0
}

$output = @(Invoke-Hk2Sql -Sql $sql)
$jsonText = Get-JsonFromOutput -Output $output

if (-not [string]::IsNullOrWhiteSpace($OutputJsonPath)) {
    Write-TextArtifact -Text $jsonText -Path $OutputJsonPath
}

$report = $jsonText | ConvertFrom-Json
if (-not [string]::IsNullOrWhiteSpace($OutputMarkdownPath)) {
    Write-TextArtifact -Text (New-MarkdownReport -Report $report) -Path $OutputMarkdownPath
}

if ($AsJson) {
    Write-Host $jsonText
    exit 0
}

Write-Host 'douyin life sync diagnosis'
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host "discoveryFile: $($report.discoveryFile)"
Write-Host "expectedSampleOrderCount: $($report.overall.expectedSampleOrderCount)"
Write-Host "sampleMappingsFound: $($report.overall.sampleMappingsFound)"
Write-Host "sampleOrdersFound: $($report.overall.sampleOrdersFound)"
Write-Host "sampleOrdersMissingLocal: $($report.overall.sampleOrdersMissingLocal)"
Write-Host "activePairMappingGap: $($report.overall.activePairMappingGap)"
Write-Host "sampleOrdersWithReserveTime: $($report.overall.sampleOrdersWithReserveTime)"
Write-Host ''
Write-Host 'sample orders'
$report.sampleOrders |
    Select-Object orderMasked, poiId, skuId, externalStatus, mappingMatches, orderMatches |
    Format-Table -AutoSize |
    Out-String |
    Write-Host

Write-Host 'latest sync logs'
$report.recentSyncLogs |
    Select-Object -First 8 apiName, success, requestId, errorMessage, remark, createTime |
    Format-Table -AutoSize |
    Out-String |
    Write-Host
