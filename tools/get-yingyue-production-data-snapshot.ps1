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

    [int]$RecentOrderLimit = 20,

    [string]$OutputJsonPath = '',

    [switch]$AsJson,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

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

function New-SnapshotSql {
    param([Parameter(Mandatory = $true)][int]$Limit)

    return @"
\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null ''

with stores as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', s.id::text,
        'storeCode', coalesce(to_jsonb(s)->>'store_code', ''),
        'storeName', coalesce(to_jsonb(s)->>'store_name', ''),
        'status', coalesce(to_jsonb(s)->>'status', ''),
        'managerName', coalesce(to_jsonb(s)->>'manager_name', ''),
        'phoneMasked', case when coalesce(to_jsonb(s)->>'phone', '') = '' then '' else regexp_replace(to_jsonb(s)->>'phone', '(1\d{2})\d{4}(\d{4})', '\1****\2') end,
        'addressPresent', coalesce(to_jsonb(s)->>'address', '') <> '',
        'openTime', coalesce(to_jsonb(s)->>'open_time', ''),
        'closeTime', coalesce(to_jsonb(s)->>'close_time', '')
    ) order by id), '[]'::jsonb) as data
    from yy_store s
    where del_flag = '0'
),
employees_source as (
    select e.*, to_jsonb(e) as row_json, row_number() over (order by id) as rn
    from yy_employee e
    where e.del_flag = '0'
),
employees as (
    select jsonb_build_object(
        'count', count(*),
        'roles', coalesce(jsonb_agg(distinct coalesce(row_json->>'role_type', '')) filter (where coalesce(row_json->>'role_type', '') <> ''), '[]'::jsonb),
        'sample', coalesce(jsonb_agg(jsonb_build_object(
            'id', id::text,
            'storeId', coalesce(row_json->>'store_id', ''),
            'userIdPresent', coalesce(row_json->>'user_id', '') <> '',
            'employeeNo', coalesce(row_json->>'employee_no', ''),
            'employeeName', coalesce(row_json->>'employee_name', ''),
            'mobileMasked', case when coalesce(row_json->>'mobile', '') = '' then '' else regexp_replace(row_json->>'mobile', '(1\d{2})\d{4}(\d{4})', '\1****\2') end,
            'roleType', coalesce(row_json->>'role_type', ''),
            'skillTags', coalesce(row_json->>'skill_tags', ''),
            'status', coalesce(row_json->>'status', '')
        ) order by id) filter (where rn <= 20), '[]'::jsonb)
    ) as data
    from employees_source
),
channel_accounts as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', a.id::text,
        'storeId', coalesce(to_jsonb(a)->>'store_id', ''),
        'channelType', coalesce(to_jsonb(a)->>'channel_type', ''),
        'accountName', coalesce(to_jsonb(a)->>'account_name', ''),
        'serviceIdPresent', coalesce(to_jsonb(a)->>'service_id', '') <> '',
        'accessTokenPresent', coalesce(to_jsonb(a)->>'access_token', '') <> '',
        'refreshTokenPresent', coalesce(to_jsonb(a)->>'refresh_token', '') <> '',
        'status', coalesce(to_jsonb(a)->>'status', '')
    ) order by id), '[]'::jsonb) as data
    from yy_channel_account a
    where a.del_flag = '0'
      and coalesce(to_jsonb(a)->>'channel_type', '') = 'DOUYIN_LIFE'
),
orders_by_status as (
    select coalesce(jsonb_object_agg(status_key, cnt), '{}'::jsonb) as data
    from (
        select coalesce(to_jsonb(o)->>'status', '') as status_key, count(*) as cnt
        from yy_order o
        where o.del_flag = '0'
        group by coalesce(to_jsonb(o)->>'status', '')
    ) s
),
orders_by_pay_status as (
    select coalesce(jsonb_object_agg(pay_status_key, cnt), '{}'::jsonb) as data
    from (
        select coalesce(to_jsonb(o)->>'pay_status', '') as pay_status_key, count(*) as cnt
        from yy_order o
        where o.del_flag = '0'
        group by coalesce(to_jsonb(o)->>'pay_status', '')
    ) s
),
orders_by_channel as (
    select coalesce(jsonb_object_agg(channel_key, cnt), '{}'::jsonb) as data
    from (
        select coalesce(to_jsonb(o)->>'channel_type', '') as channel_key, count(*) as cnt
        from yy_order o
        where o.del_flag = '0'
        group by coalesce(to_jsonb(o)->>'channel_type', '')
    ) s
),
order_counts as (
    select jsonb_build_object(
        'total', count(*),
        'douyinLife', count(*) filter (where to_jsonb(o)->>'channel_type' = 'DOUYIN_LIFE' or to_jsonb(o)->>'source' = 'DOUYIN_LIFE'),
        'byStatus', (select data from orders_by_status),
        'byPayStatus', (select data from orders_by_pay_status),
        'byChannel', (select data from orders_by_channel)
    ) as data
    from yy_order o
    where o.del_flag = '0'
),
recent_orders as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', id::text,
        'orderNoMasked', case when coalesce(row_json->>'order_no', '') = '' then '' else left(row_json->>'order_no', 4) || '***' || right(row_json->>'order_no', 4) end,
        'storeId', coalesce(row_json->>'store_id', ''),
        'customerNamePresent', coalesce(row_json->>'customer_name', '') <> '',
        'customerPhoneMasked', case when coalesce(row_json->>'customer_phone', '') = '' then '' else regexp_replace(row_json->>'customer_phone', '(1\d{2})\d{4}(\d{4})', '\1****\2') end,
        'serviceName', left(coalesce(row_json->>'service_name_snapshot', ''), 60),
        'source', coalesce(row_json->>'source', ''),
        'channelType', coalesce(row_json->>'channel_type', ''),
        'status', coalesce(row_json->>'status', ''),
        'payStatus', coalesce(row_json->>'pay_status', ''),
        'amountCent', coalesce(nullif(row_json->>'amount_cent', '')::numeric, 0),
        'arrivalTime', coalesce(row_json->>'arrival_time', ''),
        'orderTime', coalesce(row_json->>'order_time', '')
    ) order by nullif(row_json->>'order_time', '')::timestamp desc nulls last, id desc), '[]'::jsonb) as data
    from (
        select o.*, to_jsonb(o) as row_json
        from yy_order o
        where o.del_flag = '0'
        order by nullif(to_jsonb(o)->>'order_time', '')::timestamp desc nulls last, id desc
        limit $Limit
    ) o
),
mapping_status as (
    select coalesce(jsonb_object_agg(sync_status_key, cnt), '{}'::jsonb) as data
    from (
        select coalesce(to_jsonb(m)->>'sync_status', '') as sync_status_key, count(*) as cnt
        from yy_channel_order_mapping m
        where m.del_flag = '0'
          and coalesce(to_jsonb(m)->>'channel_type', '') = 'DOUYIN_LIFE'
        group by coalesce(to_jsonb(m)->>'sync_status', '')
    ) m
),
mappings as (
    select jsonb_build_object(
        'count', count(*),
        'bySyncStatus', (select data from mapping_status)
    ) as data
    from yy_channel_order_mapping m
    where m.del_flag = '0'
      and coalesce(to_jsonb(m)->>'channel_type', '') = 'DOUYIN_LIFE'
),
sync_logs as (
    select coalesce(jsonb_agg(jsonb_build_object(
        'apiName', coalesce(row_json->>'api_name', ''),
        'success', coalesce(row_json->>'success', ''),
        'requestId', coalesce(row_json->>'request_id', ''),
        'errorMessage', left(coalesce(row_json->>'error_message', ''), 140),
        'remark', left(coalesce(row_json->>'remark', ''), 220),
        'createTime', coalesce(row_json->>'create_time', '')
    ) order by nullif(row_json->>'create_time', '')::timestamp desc nulls last, id desc), '[]'::jsonb) as data
    from (
        select l.*, to_jsonb(l) as row_json
        from yy_channel_sync_log l
        where l.del_flag = '0'
          and coalesce(to_jsonb(l)->>'channel_type', '') = 'DOUYIN_LIFE'
        order by nullif(to_jsonb(l)->>'create_time', '')::timestamp desc nulls last, id desc
        limit 12
    ) l
)
select jsonb_build_object(
    'generatedAt', to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZH:TZM'),
    'stores', (select data from stores),
    'employees', (select data from employees),
    'douyinLifeChannelAccounts', (select data from channel_accounts),
    'orders', (select data from order_counts),
    'recentOrders', (select data from recent_orders),
    'douyinLifeMappings', (select data from mappings),
    'recentDouyinLifeSyncLogs', (select data from sync_logs)
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
            throw "remote production snapshot failed: exit=$($result.ExitStatus), $err"
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
        throw 'empty production snapshot output'
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

$sql = New-SnapshotSql -Limit $RecentOrderLimit

if ($DryRun) {
    Write-Host 'yingyue production data snapshot dry-run SQL'
    Write-Host "mode: $Mode"
    Write-Host "recentOrderLimit: $RecentOrderLimit"
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

Write-Host 'yingyue production data snapshot'
Write-Host "generatedAt: $($report.generatedAt)"
Write-Host "stores: $($report.stores.Count)"
Write-Host "employees: $($report.employees.count)"
Write-Host "douyinLifeAccounts: $($report.douyinLifeChannelAccounts.Count)"
Write-Host "ordersTotal: $($report.orders.total)"
Write-Host "douyinLifeOrders: $($report.orders.douyinLife)"
Write-Host "douyinLifeMappings: $($report.douyinLifeMappings.count)"
Write-Host ''

Write-Host 'stores'
$report.stores |
    Select-Object id, storeCode, storeName, status, managerName, phoneMasked, addressPresent, openTime, closeTime |
    Format-Table -AutoSize |
    Out-String |
    Write-Host

Write-Host 'employee roles'
$report.employees.roles | ForEach-Object { Write-Host "- $_" }

Write-Host ''
Write-Host 'douyin life accounts'
$report.douyinLifeChannelAccounts |
    Select-Object id, storeId, accountName, serviceIdPresent, accessTokenPresent, refreshTokenPresent, status |
    Format-Table -AutoSize |
    Out-String |
    Write-Host

Write-Host 'orders by status'
($report.orders.byStatus | ConvertTo-Json -Compress) | Write-Host

Write-Host 'orders by channel'
($report.orders.byChannel | ConvertTo-Json -Compress) | Write-Host

Write-Host 'latest douyin life logs'
$report.recentDouyinLifeSyncLogs |
    Select-Object apiName, success, requestId, errorMessage, remark, createTime |
    Format-Table -AutoSize |
    Out-String |
    Write-Host
