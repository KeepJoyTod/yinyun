[CmdletBinding()]
param(
    [ValidateSet('LocalDocker', 'SshDocker')]
    [string]$Mode = 'LocalDocker',

    [string]$AlbumId = '',

    [string]$AssetId = '',

    [string[]]$RequiredActions = @('VERIFY', 'ALBUM_DETAIL', 'PREVIEW', 'DOWNLOAD', 'STREAM'),

    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = '',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [int]$RecentHours = 24,

    [int]$RecentLimit = 30,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-RequiredInput {
    if ([string]::IsNullOrWhiteSpace($AlbumId)) {
        throw 'AlbumId is required'
    }
}

function ConvertTo-SqlLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)
    return "'" + $Value.Replace("'", "''") + "'"
}

function ConvertTo-StringListLiteral {
    param([Parameter(Mandatory = $true)][string[]]$Values)
    $items = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { ConvertTo-SqlLiteral $_ })
    if ($items.Count -eq 0) {
        throw 'RequiredActions must not be empty'
    }
    return ($items -join ', ')
}

function New-AuditSql {
    param(
        [Parameter(Mandatory = $true)][string]$TargetAlbumId,
        [string]$TargetAssetId,
        [Parameter(Mandatory = $true)][string[]]$Actions,
        [Parameter(Mandatory = $true)][int]$Hours,
        [Parameter(Mandatory = $true)][int]$Limit
    )

    $albumIdNumber = [long]$TargetAlbumId
    $assetPredicate = ''
    if (-not [string]::IsNullOrWhiteSpace($TargetAssetId)) {
        $assetPredicate = "and (asset_id = $([long]$TargetAssetId) or action in ('VERIFY', 'ALBUM_DETAIL'))"
    }
    $actionList = ConvertTo-StringListLiteral -Values $Actions

    return @"
\pset pager off
\pset null '(null)'

with required(action) as (
    values $((@($Actions | ForEach-Object { '(' + (ConvertTo-SqlLiteral $_) + ')' }) -join ', '))
),
matched as (
    select
        action,
        count(*) as log_count,
        max(create_time) as latest_time
    from yy_photo_access_log
    where del_flag = '0'
      and album_id = $albumIdNumber
      $assetPredicate
      and action in ($actionList)
      and create_time >= now() - interval '${Hours} hours'
    group by action
)
select
    r.action,
    coalesce(m.log_count, 0) as log_count,
    coalesce(to_char(m.latest_time, 'YYYY-MM-DD HH24:MI:SS'), '') as latest_time,
    case when coalesce(m.log_count, 0) > 0 then 'PASS' else 'FAIL' end as status
from required r
left join matched m on m.action = r.action
order by r.action;

select
    to_char(create_time, 'YYYY-MM-DD HH24:MI:SS') as create_time,
    id,
    coalesce(store_id::text, '') as store_id,
    coalesce(album_id::text, '') as album_id,
    coalesce(asset_id::text, '') as asset_id,
    case
        when coalesce(customer_phone, '') = '' then 'empty'
        when customer_phone like 'ENC_%' then 'present_encrypted_or_masked'
        when length(customer_phone) >= 7 then substring(customer_phone from 1 for 3) || '****' || right(customer_phone, 4)
        else 'mask_phone'
    end as mask_phone,
    coalesce(platform, '') as platform,
    coalesce(action, '') as action,
    case
        when coalesce(ip, '') = '' then ''
        when position(':' in ip) > 0 then split_part(ip, ':', 1) || ':****'
        when position('.' in ip) > 0 then split_part(ip, '.', 1) || '.' || split_part(ip, '.', 2) || '.***.***'
        else 'masked'
    end as masked_ip,
    coalesce(success, '') as success,
    coalesce(left(remark, 120), '') as remark
from yy_photo_access_log
where del_flag = '0'
  and album_id = $albumIdNumber
  $assetPredicate
  and create_time >= now() - interval '${Hours} hours'
order by create_time desc nulls last, id desc
limit $Limit;
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
    $Sql | docker exec -i $DockerContainer psql -U $DbUser -d $Database -v ON_ERROR_STOP=1
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
        $remoteCommand = "tmp=`$(mktemp); printf '%s' '$encodedSql' | base64 -d > `$tmp; docker exec -i $DockerContainer psql -U $DbUser -d $Database -v ON_ERROR_STOP=1 < `$tmp; rc=`$?; rm -f `$tmp; exit `$rc"
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $remoteCommand -TimeOut 60
        if ($result.ExitStatus -ne 0) {
            $err = ($result.Error | Out-String).Trim()
            throw "remote access audit failed: exit=$($result.ExitStatus), $err"
        }
        return $result.Output
    } finally {
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
    }
}

function Test-AuditOutputPassed {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string[]]$Actions
    )

    $missing = [System.Collections.Generic.List[string]]::new()
    foreach ($action in $Actions) {
        $pattern = "(?m)^\s*$([regex]::Escape($action))\s+\|\s+[1-9][0-9]*\s+\|.*\|\s+PASS\s*$"
        if ($Text -notmatch $pattern) {
            $missing.Add($action)
        }
    }

    return $missing.ToArray()
}

Assert-RequiredInput
$sql = New-AuditSql -TargetAlbumId $AlbumId -TargetAssetId $AssetId -Actions $RequiredActions -Hours $RecentHours -Limit $RecentLimit

Write-Host 'photo pickup access audit'
Write-Host "mode: $Mode"
Write-Host "albumId: $AlbumId"
if (-not [string]::IsNullOrWhiteSpace($AssetId)) {
    Write-Host "assetId: $AssetId"
}
Write-Host "recentHours: $RecentHours"
Write-Host "requiredActions: $($RequiredActions -join ',')"
Write-Host ''

if ($DryRun) {
    Write-Host 'dry-run SQL:'
    Write-Host $sql
    exit 0
}

$output = if ($Mode -eq 'LocalDocker') {
    Invoke-LocalDockerQuery -Sql $sql
} else {
    Invoke-SshDockerQuery -Sql $sql
}

$text = (($output | ForEach-Object { [string]$_ }) -join [Environment]::NewLine)
Write-Host $text

$missing = @(Test-AuditOutputPassed -Text $text -Actions $RequiredActions)
if ($missing.Count -gt 0) {
    throw "missing required audit actions: $($missing -join ',')"
}

Write-Host 'access audit: passed'
