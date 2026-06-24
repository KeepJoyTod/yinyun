[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://studio.evanshine.me',

    [string]$ReleaseId = '',

    [string]$OutputDir = '',

    [switch]$Headed
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot 'studio-workbench/.env.local'
$scriptPath = Join-Path $PSScriptRoot 'studio-workbench-real-login-smoke.mjs'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "docs/evidence/studio-real-login-smoke-$stamp"
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
    throw 'Missing smoke credentials. Set STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD or provide VITE_API_USERNAME/VITE_API_PASSWORD in studio-workbench/.env.local.'
}

if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw "Missing smoke script: $scriptPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$previousUsername = $env:STUDIO_SMOKE_USERNAME
$previousPassword = $env:STUDIO_SMOKE_PASSWORD
$previousBaseUrl = $env:STUDIO_SMOKE_BASE_URL
$previousReleaseId = $env:STUDIO_SMOKE_RELEASE_ID
$previousOutputDir = $env:STUDIO_SMOKE_OUTPUT_DIR
$previousHeaded = $env:STUDIO_SMOKE_HEADED

try {
    $env:STUDIO_SMOKE_USERNAME = $username
    $env:STUDIO_SMOKE_PASSWORD = $password
    $env:STUDIO_SMOKE_BASE_URL = $BaseUrl
    $env:STUDIO_SMOKE_RELEASE_ID = $ReleaseId
    $env:STUDIO_SMOKE_OUTPUT_DIR = $OutputDir
    $env:STUDIO_SMOKE_HEADED = if ($Headed) { '1' } else { '0' }

    npx --yes -p playwright node $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "studio workbench real login smoke failed with exit code $LASTEXITCODE"
    }
} finally {
    $env:STUDIO_SMOKE_USERNAME = $previousUsername
    $env:STUDIO_SMOKE_PASSWORD = $previousPassword
    $env:STUDIO_SMOKE_BASE_URL = $previousBaseUrl
    $env:STUDIO_SMOKE_RELEASE_ID = $previousReleaseId
    $env:STUDIO_SMOKE_OUTPUT_DIR = $previousOutputDir
    $env:STUDIO_SMOKE_HEADED = $previousHeaded
}
