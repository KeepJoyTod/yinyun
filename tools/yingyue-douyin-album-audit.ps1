[CmdletBinding()]
param(
    [ValidateSet('LocalDocker', 'SshDocker')]
    [string]$Mode = 'LocalDocker',

    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile,

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [int]$RecentLimit = 10,

    [int]$RecentHours = 24,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function New-AuditSql {
    param(
        [Parameter(Mandatory = $true)][int]$Limit,
        [Parameter(Mandatory = $true)][int]$Hours
    )

    return @"
\pset pager off
\pset null '(null)'

select 'DOUYIN_LIFE albums total' as metric, count(*)::text as value
from yy_photo_album
where del_flag = '0' and channel_type = 'DOUYIN_LIFE';

select 'DOUYIN_LIFE albums in recent ${Hours}h' as metric, count(*)::text as value
from yy_photo_album
where del_flag = '0'
  and channel_type = 'DOUYIN_LIFE'
  and create_time >= now() - interval '${Hours} hours';

select
  to_char(a.create_time, 'YYYY-MM-DD HH24:MI:SS') as create_time,
  a.id,
  a.store_id,
  a.order_id,
  coalesce(a.douyin_order_id, '') as douyin_order_id,
  coalesce(a.book_id, '') as book_id,
  coalesce(a.certificate_code, '') as certificate_code,
  coalesce(a.status, '') as status,
  coalesce(a.selection_status, '') as selection_status,
  case when coalesce(a.customer_phone, '') = '' then 'empty' else 'present_encrypted_or_masked' end as phone_record,
  coalesce(asset_stats.asset_count, 0) as asset_count,
  coalesce(asset_stats.visible_count, 0) as visible_asset_count
from yy_photo_album a
left join (
  select
    album_id,
    count(*) filter (where del_flag = '0') as asset_count,
    count(*) filter (where del_flag = '0' and visible = '1') as visible_count
  from yy_photo_asset
  group by album_id
) asset_stats on asset_stats.album_id = a.id
where a.del_flag = '0' and a.channel_type = 'DOUYIN_LIFE'
order by a.create_time desc nulls last, a.id desc
limit ${Limit};

select
  api_name,
  count(*) as log_count,
  max(create_time) as latest_time,
  max(request_id) filter (where coalesce(request_id, '') <> '') as latest_logid
from yy_channel_sync_log
where del_flag = '0'
  and channel_type = 'DOUYIN_LIFE'
  and create_time >= now() - interval '${Hours} hours'
group by api_name
order by latest_time desc nulls last, api_name
limit 30;
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

function Invoke-LocalDockerAudit {
    param([Parameter(Mandatory = $true)][string]$Sql)

    $Sql | docker exec -i $DockerContainer psql -U $DbUser -d $Database -v ON_ERROR_STOP=1
}

function Invoke-SshDockerAudit {
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
        $remoteCommand = "tmp=`$(mktemp); printf '%s' '$encodedSql' | base64 -d > `$tmp; docker exec -i $DockerContainer psql -U $DbUser -d $Database -v ON_ERROR_STOP=1 < `$tmp; rc=`$?; rm -f `$tmp; exit `$rc"
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $remoteCommand -TimeOut 60
        if ($result.ExitStatus -ne 0) {
            $err = ($result.Error | Out-String).Trim()
            throw "remote audit failed: exit=$($result.ExitStatus), $err"
        }
        $result.Output
    } finally {
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
    }
}

$sql = New-AuditSql -Limit $RecentLimit -Hours $RecentHours

Write-Host 'yingyue douyin album audit'
Write-Host "mode: $Mode"
Write-Host "recentHours: $RecentHours"
Write-Host "recentLimit: $RecentLimit"
Write-Host ''

if ($DryRun) {
    Write-Host 'dry-run SQL:'
    Write-Host $sql
    exit 0
}

if ($Mode -eq 'LocalDocker') {
    Invoke-LocalDockerAudit -Sql $sql
} else {
    Invoke-SshDockerAudit -Sql $sql
}
