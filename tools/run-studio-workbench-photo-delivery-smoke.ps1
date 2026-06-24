[CmdletBinding()]
param(
    [string]$ApiBaseUrl = 'https://api.evanshine.me',

    [string]$OutputDir = '',

    [string]$AlbumId = '',

    [switch]$Notify,

    [switch]$ConfirmSelection,

    [switch]$Deliver,

    [switch]$CreateSyntheticAlbum,

    [switch]$UploadFixtureAssets,

    [switch]$SubmitSyntheticSelection,

    [switch]$ConfirmWriteLocalDb
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$hasWriteAction = $Notify -or $ConfirmSelection -or $Deliver -or $CreateSyntheticAlbum -or $UploadFixtureAssets -or $SubmitSyntheticSelection

if ($hasWriteAction -and -not $ConfirmWriteLocalDb) {
    throw 'This smoke can write photo album workflow state. Re-run with -ConfirmWriteLocalDb to confirm this WRITE_LOCAL_DB action.'
}

if (($Notify -or $ConfirmSelection -or $Deliver -or $UploadFixtureAssets -or $SubmitSyntheticSelection) -and [string]::IsNullOrWhiteSpace($AlbumId) -and -not $CreateSyntheticAlbum) {
    throw 'Write actions require -AlbumId for a synthetic/test-marked album, unless -CreateSyntheticAlbum is used.'
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot 'studio-workbench/.env.local'
$scriptPath = Join-Path $PSScriptRoot 'studio-workbench-photo-delivery-smoke.mjs'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "docs/evidence/studio-photo-delivery-smoke-$stamp"
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

$username = $env:STUDIO_PHOTO_USERNAME
$password = $env:STUDIO_PHOTO_PASSWORD
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = Read-DotEnvValue -Path $envPath -Key 'VITE_API_USERNAME'
}
if ([string]::IsNullOrWhiteSpace($password)) {
    $password = Read-DotEnvValue -Path $envPath -Key 'VITE_API_PASSWORD'
}

if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password)) {
    throw 'Missing smoke credentials. Set STUDIO_PHOTO_USERNAME/STUDIO_PHOTO_PASSWORD or provide VITE_API_USERNAME/VITE_API_PASSWORD in studio-workbench/.env.local.'
}

if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw "Missing smoke script: $scriptPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$previous = @{
    Username = $env:STUDIO_PHOTO_USERNAME
    Password = $env:STUDIO_PHOTO_PASSWORD
    ApiBaseUrl = $env:STUDIO_PHOTO_API_BASE_URL
    OutputDir = $env:STUDIO_PHOTO_OUTPUT_DIR
    AlbumId = $env:STUDIO_PHOTO_ALBUM_ID
    ConfirmWrite = $env:STUDIO_PHOTO_CONFIRM_WRITE_LOCAL_DB
    RunNotify = $env:STUDIO_PHOTO_RUN_NOTIFY
    RunConfirm = $env:STUDIO_PHOTO_RUN_CONFIRM
    RunDeliver = $env:STUDIO_PHOTO_RUN_DELIVER
    CreateSyntheticAlbum = $env:STUDIO_PHOTO_CREATE_SYNTHETIC_ALBUM
    UploadFixtureAssets = $env:STUDIO_PHOTO_UPLOAD_FIXTURE_ASSETS
    SubmitSyntheticSelection = $env:STUDIO_PHOTO_SUBMIT_SYNTHETIC_SELECTION
}

try {
    $env:STUDIO_PHOTO_USERNAME = $username
    $env:STUDIO_PHOTO_PASSWORD = $password
    $env:STUDIO_PHOTO_API_BASE_URL = $ApiBaseUrl
    $env:STUDIO_PHOTO_OUTPUT_DIR = $OutputDir
    $env:STUDIO_PHOTO_ALBUM_ID = $AlbumId
    $env:STUDIO_PHOTO_CONFIRM_WRITE_LOCAL_DB = if ($ConfirmWriteLocalDb) { '1' } else { '0' }
    $env:STUDIO_PHOTO_RUN_NOTIFY = if ($Notify) { '1' } else { '0' }
    $env:STUDIO_PHOTO_RUN_CONFIRM = if ($ConfirmSelection) { '1' } else { '0' }
    $env:STUDIO_PHOTO_RUN_DELIVER = if ($Deliver) { '1' } else { '0' }
    $env:STUDIO_PHOTO_CREATE_SYNTHETIC_ALBUM = if ($CreateSyntheticAlbum) { '1' } else { '0' }
    $env:STUDIO_PHOTO_UPLOAD_FIXTURE_ASSETS = if ($UploadFixtureAssets) { '1' } else { '0' }
    $env:STUDIO_PHOTO_SUBMIT_SYNTHETIC_SELECTION = if ($SubmitSyntheticSelection) { '1' } else { '0' }

    node $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "studio workbench photo delivery smoke failed with exit code $LASTEXITCODE"
    }
} finally {
    $env:STUDIO_PHOTO_USERNAME = $previous.Username
    $env:STUDIO_PHOTO_PASSWORD = $previous.Password
    $env:STUDIO_PHOTO_API_BASE_URL = $previous.ApiBaseUrl
    $env:STUDIO_PHOTO_OUTPUT_DIR = $previous.OutputDir
    $env:STUDIO_PHOTO_ALBUM_ID = $previous.AlbumId
    $env:STUDIO_PHOTO_CONFIRM_WRITE_LOCAL_DB = $previous.ConfirmWrite
    $env:STUDIO_PHOTO_RUN_NOTIFY = $previous.RunNotify
    $env:STUDIO_PHOTO_RUN_CONFIRM = $previous.RunConfirm
    $env:STUDIO_PHOTO_RUN_DELIVER = $previous.RunDeliver
    $env:STUDIO_PHOTO_CREATE_SYNTHETIC_ALBUM = $previous.CreateSyntheticAlbum
    $env:STUDIO_PHOTO_UPLOAD_FIXTURE_ASSETS = $previous.UploadFixtureAssets
    $env:STUDIO_PHOTO_SUBMIT_SYNTHETIC_SELECTION = $previous.SubmitSyntheticSelection
}
