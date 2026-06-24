[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [string]$Date = '',

    [string]$YiyueOutDir = 'C:\Users\Administrator\Desktop\yiyue',

    [string]$EvidenceDir = '',

    [switch]$Execute,

    [switch]$SkipExport,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EvidenceDir)) {
    $EvidenceDir = Join-Path $repoRoot 'docs/evidence'
}

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

function Get-CredentialFromPasswordFile {
    Import-Module Posh-SSH -ErrorAction Stop
    $password = Get-PasswordFromFile -Path $SshPasswordFile
    $secure = ConvertTo-SecureString $password -AsPlainText -Force
    return [pscredential]::new($SshUser, $secure)
}

function Invoke-RemoteCommand {
    param(
        [Parameter(Mandatory = $true)][object]$Session,
        [Parameter(Mandatory = $true)][string]$Command,
        [int]$TimeoutSeconds = 180
    )

    $result = Invoke-SSHCommand -SessionId $Session.SessionId -Command $Command -TimeOut $TimeoutSeconds
    if ($result.ExitStatus -ne 0) {
        $err = ($result.Error | Out-String).Trim()
        throw "remote command failed: exit=$($result.ExitStatus), $err"
    }
    return $result.Output
}

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Invoke-NodeExport {
    param([Parameter(Mandatory = $true)][string]$ScriptPath)

    & node $ScriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "Jianyue export failed: $ScriptPath exited with code $LASTEXITCODE"
    }
}

$bizDate = Get-ShanghaiDate
$stamp = $bizDate.Replace('-', '')
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$scheduleSqlPath = Join-Path $repoRoot "backend/script/sql/postgres/postgres_jianyue_booking_slot_inventory_seed_$stamp.sql"
$orderSqlPath = Join-Path $YiyueOutDir "postgres_jianyue_orders_import_$stamp.sql"
$snapshotPath = Join-Path $EvidenceDir "yingyue-booking-chain-snapshot-$stamp-after-refresh.json"
$reportPath = Join-Path $EvidenceDir "jianyue-production-booking-chain-refresh-$timestamp.md"
$remoteDir = "/opt/yingyue/runtime/jianyue-refresh/$timestamp"

$planLines = @(
    'JIANYUE_PRODUCTION_BOOKING_CHAIN_REFRESH',
    "mode: $(if ($Execute) { 'EXECUTE' } else { 'DRY_RUN' })",
    "date: $bizDate",
    "repo: $repoRoot",
    "yiyueOutDir: $YiyueOutDir",
    "scheduleSql: $scheduleSqlPath",
    "orderSql: $orderSqlPath",
    "remoteDir: $remoteDir",
    '',
    'Planned commands:',
    "1. node tools/export-jianyue-schedule.mjs",
    "2. node tools/export-jianyue-orders.mjs",
    "3. remote pg_dump -> $remoteDir/pre-jianyue-refresh-$timestamp.sql",
    "4. upload postgres_jianyue_booking_slot_inventory_seed_$stamp.sql",
    "5. upload postgres_jianyue_orders_import_$stamp.sql",
    "6. docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < schedule SQL",
    "7. docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < order SQL",
    "8. tools/get-yingyue-booking-chain-snapshot.ps1 -> $snapshotPath"
)

if ($DryRun -or -not $Execute) {
    $planLines | ForEach-Object { Write-Host $_ }
    exit 0
}

if (-not $SkipExport) {
    if ([string]::IsNullOrWhiteSpace($env:JIANYUE_ACCOUNT) -or [string]::IsNullOrWhiteSpace($env:JIANYUE_PASSWORD)) {
        throw 'JIANYUE_ACCOUNT and JIANYUE_PASSWORD are required when exporting from Jianyue.'
    }

    $env:YIYUE_OUT_DIR = $YiyueOutDir
    $env:YINGYUE_REPO_ROOT = $repoRoot
    $env:JIANYUE_ORDER_SQL_OUTPUT_DIR = $YiyueOutDir
    Push-Location $repoRoot
    try {
        Invoke-NodeExport -ScriptPath 'tools/export-jianyue-schedule.mjs'
        Invoke-NodeExport -ScriptPath 'tools/export-jianyue-orders.mjs'
    } finally {
        Pop-Location
    }
}

if (-not (Test-Path -LiteralPath $scheduleSqlPath -PathType Leaf)) {
    throw "schedule SQL not found: $scheduleSqlPath"
}
if (-not (Test-Path -LiteralPath $orderSqlPath -PathType Leaf)) {
    throw "order SQL not found: $orderSqlPath"
}

$credential = Get-CredentialFromPasswordFile
$session = New-SSHSession -ComputerName $SshHost -Credential $credential -AcceptKey -ErrorAction Stop
try {
    Invoke-RemoteCommand -Session $session -Command "mkdir -p '$remoteDir'" -TimeoutSeconds 30 | Out-Null
    $backupRemotePath = "$remoteDir/pre-jianyue-refresh-$timestamp.sql"
    Invoke-RemoteCommand -Session $session -Command "docker exec $DockerContainer pg_dump -U $DbUser $Database > '$backupRemotePath'" -TimeoutSeconds 300 | Out-Null

    Set-SCPItem -ComputerName $SshHost -Credential $credential -AcceptKey -Path $scheduleSqlPath -Destination $remoteDir -OperationTimeout 120 | Out-Null
    Set-SCPItem -ComputerName $SshHost -Credential $credential -AcceptKey -Path $orderSqlPath -Destination $remoteDir -OperationTimeout 120 | Out-Null

    $remoteSchedule = "$remoteDir/$(Split-Path -Leaf $scheduleSqlPath)"
    $remoteOrders = "$remoteDir/$(Split-Path -Leaf $orderSqlPath)"
    Invoke-RemoteCommand -Session $session -Command "docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < '$remoteSchedule'" -TimeoutSeconds 300 | Out-Null
    Invoke-RemoteCommand -Session $session -Command "docker exec -i $DockerContainer psql -q -U $DbUser -d $Database -v ON_ERROR_STOP=1 < '$remoteOrders'" -TimeoutSeconds 300 | Out-Null
} finally {
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
}

& (Join-Path $PSScriptRoot 'get-yingyue-booking-chain-snapshot.ps1') `
    -Mode SshDocker `
    -SshHost $SshHost `
    -SshUser $SshUser `
    -SshPasswordFile $SshPasswordFile `
    -DockerContainer $DockerContainer `
    -Database $Database `
    -DbUser $DbUser `
    -Date $bizDate `
    -LookbackDays 30 `
    -OutputJsonPath $snapshotPath

$content = @(
    "# Jianyue Production Booking Chain Refresh - $timestamp",
    '',
    '## Result',
    '',
    'Executed guarded Jianyue schedule/order refresh against Hong Kong 2.',
    '',
    '| Item | Value |',
    '| --- | --- |',
    "| Date | `$bizDate` |",
    "| Server | `$SshHost` |",
    "| Remote dir | `$remoteDir` |",
    "| Backup | `$remoteDir/pre-jianyue-refresh-$timestamp.sql` |",
    "| Schedule SQL | `$scheduleSqlPath` |",
    "| Order SQL | `$orderSqlPath` |",
    "| Snapshot | `$snapshotPath` |",
    '',
    '## Safety',
    '',
    '- The order import SQL can contain customer PII and stays outside Git under the local `YIYUE_OUT_DIR` path.',
    '- The committed evidence snapshot is aggregated/masked and does not include customer names, phone numbers, tokens, secrets, or raw external payloads.',
    '- Rollback uses the remote pg_dump backup listed above.'
) -join [Environment]::NewLine
Write-Utf8File -Path $reportPath -Content $content

Write-Host "jianyue production booking chain refresh complete"
Write-Host "report: $reportPath"
Write-Host "snapshot: $snapshotPath"
