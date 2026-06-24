[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://studio.evanshine.me',

    [string]$ApiBaseUrl = 'https://api.evanshine.me',

    [string]$ReleaseId = '',

    [string]$OutputDir = '',

    [switch]$Headed,

    [switch]$CreateBooking,

    [switch]$ConfirmWriteLocalDb
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $ConfirmWriteLocalDb) {
    throw 'This smoke creates and deletes one synthetic micro form/submission. With -CreateBooking it also creates/cancels one synthetic local booking and verifies inventory rollback. Re-run with -ConfirmWriteLocalDb to confirm this WRITE_LOCAL_DB action.'
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot 'studio-workbench/.env.local'
$scriptPath = Join-Path $PSScriptRoot 'studio-workbench-micro-form-booking-smoke.mjs'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "docs/evidence/studio-micro-form-booking-smoke-$stamp"
}

function Read-DotEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return ''
    }

    $line = Get-Content -LiteralPath $Path |
        Where-Object { $_ -match "^$([regex]::Escape($Key))=" } |
        Select-Object -First 1
    if ([string]::IsNullOrWhiteSpace($line)) {
        return ''
    }

    return (($line -split '=', 2)[1]).Trim().Trim('"').Trim("'")
}

$username = $env:STUDIO_MF_USERNAME
$password = $env:STUDIO_MF_PASSWORD
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = Read-DotEnvValue -Path $envPath -Key 'VITE_API_USERNAME'
}
if ([string]::IsNullOrWhiteSpace($password)) {
    $password = Read-DotEnvValue -Path $envPath -Key 'VITE_API_PASSWORD'
}
if ([string]::IsNullOrWhiteSpace($ReleaseId)) {
    try {
        $ReleaseId = (Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 -Uri ($BaseUrl.TrimEnd('/') + '/release.txt')).Content.Trim()
    } catch {
        $ReleaseId = ''
    }
}

if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password)) {
    throw 'Missing smoke credentials. Set STUDIO_MF_USERNAME/STUDIO_MF_PASSWORD or provide VITE_API_USERNAME/VITE_API_PASSWORD in studio-workbench/.env.local.'
}

if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw "Missing smoke script: $scriptPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$previous = @{
    Username = $env:STUDIO_MF_USERNAME
    Password = $env:STUDIO_MF_PASSWORD
    BaseUrl = $env:STUDIO_MF_BASE_URL
    ApiBaseUrl = $env:STUDIO_MF_API_BASE_URL
    ReleaseId = $env:STUDIO_MF_RELEASE_ID
    OutputDir = $env:STUDIO_MF_OUTPUT_DIR
    Headed = $env:STUDIO_MF_HEADED
    CreateBooking = $env:STUDIO_MF_CREATE_BOOKING
    ConfirmWrite = $env:STUDIO_MF_CONFIRM_WRITE_LOCAL_DB
}

try {
    $env:STUDIO_MF_USERNAME = $username
    $env:STUDIO_MF_PASSWORD = $password
    $env:STUDIO_MF_BASE_URL = $BaseUrl
    $env:STUDIO_MF_API_BASE_URL = $ApiBaseUrl
    $env:STUDIO_MF_RELEASE_ID = $ReleaseId
    $env:STUDIO_MF_OUTPUT_DIR = $OutputDir
    $env:STUDIO_MF_HEADED = if ($Headed) { '1' } else { '0' }
    $env:STUDIO_MF_CREATE_BOOKING = if ($CreateBooking) { '1' } else { '0' }
    $env:STUDIO_MF_CONFIRM_WRITE_LOCAL_DB = '1'

    npx --yes -p playwright node $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "studio workbench micro form booking smoke failed with exit code $LASTEXITCODE"
    }
} finally {
    $env:STUDIO_MF_USERNAME = $previous.Username
    $env:STUDIO_MF_PASSWORD = $previous.Password
    $env:STUDIO_MF_BASE_URL = $previous.BaseUrl
    $env:STUDIO_MF_API_BASE_URL = $previous.ApiBaseUrl
    $env:STUDIO_MF_RELEASE_ID = $previous.ReleaseId
    $env:STUDIO_MF_OUTPUT_DIR = $previous.OutputDir
    $env:STUDIO_MF_HEADED = $previous.Headed
    $env:STUDIO_MF_CREATE_BOOKING = $previous.CreateBooking
    $env:STUDIO_MF_CONFIRM_WRITE_LOCAL_DB = $previous.ConfirmWrite
}
