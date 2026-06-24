[CmdletBinding()]
param(
    [string]$ApiBaseUrl = 'https://api.evanshine.me',

    [string]$ReleaseId = '',

    [string]$OutputDir = '',

    [switch]$ConfirmWriteLocalDb
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $ConfirmWriteLocalDb) {
    throw 'This smoke writes yy_order and yy_booking_slot_inventory. Re-run with -ConfirmWriteLocalDb to continue.'
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot 'studio-workbench/.env.local'
$scriptPath = Join-Path $PSScriptRoot 'studio-workbench-appointment-write-smoke.mjs'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "docs/evidence/studio-appointment-write-smoke-$stamp"
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

$username = $env:STUDIO_SMOKE_USERNAME
$password = $env:STUDIO_SMOKE_PASSWORD
$clientId = $env:STUDIO_SMOKE_CLIENT_ID
$tenantId = $env:STUDIO_SMOKE_TENANT_ID
if ([string]::IsNullOrWhiteSpace($username)) { $username = Read-DotEnvValue -Path $envPath -Key 'VITE_API_USERNAME' }
if ([string]::IsNullOrWhiteSpace($password)) { $password = Read-DotEnvValue -Path $envPath -Key 'VITE_API_PASSWORD' }
if ([string]::IsNullOrWhiteSpace($clientId)) { $clientId = Read-DotEnvValue -Path $envPath -Key 'VITE_STUDIO_CLIENT_ID' }
if ([string]::IsNullOrWhiteSpace($tenantId)) { $tenantId = Read-DotEnvValue -Path $envPath -Key 'VITE_STUDIO_TENANT_ID' }
if ([string]::IsNullOrWhiteSpace($clientId)) { $clientId = 'e5cd7e4891bf95d1d19206ce24a7b32e' }
if ([string]::IsNullOrWhiteSpace($tenantId)) { $tenantId = '000000' }

if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password)) {
    throw 'Missing smoke credentials. Set STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD or provide VITE_API_USERNAME/VITE_API_PASSWORD in studio-workbench/.env.local.'
}

if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw "Missing smoke script: $scriptPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$previousUsername = $env:STUDIO_SMOKE_USERNAME
$previousPassword = $env:STUDIO_SMOKE_PASSWORD
$previousClientId = $env:STUDIO_SMOKE_CLIENT_ID
$previousTenantId = $env:STUDIO_SMOKE_TENANT_ID
$previousApiBaseUrl = $env:STUDIO_SMOKE_API_BASE_URL
$previousReleaseId = $env:STUDIO_SMOKE_RELEASE_ID
$previousOutputDir = $env:STUDIO_SMOKE_OUTPUT_DIR
$previousConfirm = $env:STUDIO_SMOKE_CONFIRM_WRITE_LOCAL_DB

try {
    $env:STUDIO_SMOKE_USERNAME = $username
    $env:STUDIO_SMOKE_PASSWORD = $password
    $env:STUDIO_SMOKE_CLIENT_ID = $clientId
    $env:STUDIO_SMOKE_TENANT_ID = $tenantId
    $env:STUDIO_SMOKE_API_BASE_URL = $ApiBaseUrl
    $env:STUDIO_SMOKE_RELEASE_ID = $ReleaseId
    $env:STUDIO_SMOKE_OUTPUT_DIR = $OutputDir
    $env:STUDIO_SMOKE_CONFIRM_WRITE_LOCAL_DB = '1'

    npx --yes -p playwright node $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "studio workbench appointment write smoke failed with exit code $LASTEXITCODE"
    }
} finally {
    $env:STUDIO_SMOKE_USERNAME = $previousUsername
    $env:STUDIO_SMOKE_PASSWORD = $previousPassword
    $env:STUDIO_SMOKE_CLIENT_ID = $previousClientId
    $env:STUDIO_SMOKE_TENANT_ID = $previousTenantId
    $env:STUDIO_SMOKE_API_BASE_URL = $previousApiBaseUrl
    $env:STUDIO_SMOKE_RELEASE_ID = $previousReleaseId
    $env:STUDIO_SMOKE_OUTPUT_DIR = $previousOutputDir
    $env:STUDIO_SMOKE_CONFIRM_WRITE_LOCAL_DB = $previousConfirm
}
