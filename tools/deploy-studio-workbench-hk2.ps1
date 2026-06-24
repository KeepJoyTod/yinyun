[CmdletBinding()]
param(
    [string]$ReleaseId = '',

    [switch]$Build,

    [switch]$Deploy,

    [switch]$ProbeHttp,

    [switch]$DryRun,

    [switch]$SkipBuild,

    [string]$BaseUrl = 'https://studio.evanshine.me'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$studioRoot = Join-Path $repoRoot 'studio-workbench'
$distRoot = Join-Path $studioRoot 'dist'
$releaseRoot = Join-Path $repoRoot 'dist'
$invokeHk2 = Join-Path $PSScriptRoot 'invoke-hk2.ps1'
$verifyRelease = Join-Path $PSScriptRoot 'verify-studio-workbench-release.ps1'

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    Push-Location $WorkingDirectory
    try {
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "command failed: $Command $($Arguments -join ' ')"
        }
    } finally {
        Pop-Location
    }
}

function Write-Utf8NoBom {
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

function Get-ShortCommit {
    try {
        return (& git -C $repoRoot rev-parse --short HEAD).Trim()
    } catch {
        return 'unknown'
    }
}

function Assert-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "required file missing: $Path"
    }
}

function Assert-DistDoesNotContainLocalSecrets {
    $envPath = Join-Path $studioRoot '.env.local'
    if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
        return
    }

    $secretValues = @(
        Get-Content -LiteralPath $envPath |
            Where-Object { $_ -match '^(VITE_API_USERNAME|VITE_API_PASSWORD|VITE_API_TOKEN)=' } |
            ForEach-Object { ($_ -split '=', 2)[1].Trim() } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    )

    foreach ($secret in $secretValues) {
        $hit = Get-ChildItem -LiteralPath $distRoot -Recurse -File |
            Where-Object { Select-String -LiteralPath $_.FullName -SimpleMatch $secret -Quiet }
        if ($null -ne $hit) {
            throw 'studio-workbench dist contains a local API credential value; aborting deploy'
        }
    }
}

if ([string]::IsNullOrWhiteSpace($ReleaseId)) {
    $ReleaseId = "prod-$(Get-ShortCommit)-studio-workbench-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}

$zipPath = Join-Path $releaseRoot "studio-workbench-$ReleaseId.zip"
$remoteZip = "/opt/yingyue/releases/studio-workbench-$ReleaseId.zip"
$remoteReleaseDir = "/opt/yingyue/releases/studio-workbench-$ReleaseId"
$siteDir = '/var/www/studio.evanshine.me'

if (-not ($Build -or $Deploy -or $ProbeHttp -or $DryRun)) {
    throw 'Choose at least one action: -Build, -Deploy, -ProbeHttp, or -DryRun.'
}

if ($Build -and $SkipBuild) {
    throw '-Build and -SkipBuild cannot be used together.'
}

$plan = [ordered]@{
    releaseId = $ReleaseId
    repoRoot = $repoRoot
    studioRoot = $studioRoot
    distRoot = $distRoot
    zipPath = $zipPath
    remoteZip = $remoteZip
    remoteReleaseDir = $remoteReleaseDir
    siteDir = $siteDir
    actions = @{
        build = [bool]$Build
        deploy = [bool]$Deploy
        probeHttp = [bool]$ProbeHttp
        skipBuild = [bool]$SkipBuild
        dryRun = [bool]$DryRun
    }
}

if ($DryRun) {
    $plan | ConvertTo-Json -Depth 6
    exit 0
}

if ($Build) {
    $previousReleaseId = $env:VITE_STUDIO_RELEASE_ID
    $previousApiUsername = $env:VITE_API_USERNAME
    $previousApiPassword = $env:VITE_API_PASSWORD
    $previousApiToken = $env:VITE_API_TOKEN
    try {
        $env:VITE_STUDIO_RELEASE_ID = $ReleaseId
        $env:VITE_API_USERNAME = ''
        $env:VITE_API_PASSWORD = ''
        $env:VITE_API_TOKEN = ''
        Invoke-CheckedCommand -WorkingDirectory $studioRoot -Command 'npm' -Arguments @('run', 'build')
    } finally {
        $env:VITE_STUDIO_RELEASE_ID = $previousReleaseId
        $env:VITE_API_USERNAME = $previousApiUsername
        $env:VITE_API_PASSWORD = $previousApiPassword
        $env:VITE_API_TOKEN = $previousApiToken
    }

    Assert-File -Path (Join-Path $distRoot 'index.html')
    $indexHtml = Get-Content -LiteralPath (Join-Path $distRoot 'index.html') -Raw
    if (-not $indexHtml.Contains($ReleaseId)) {
        throw "dist index.html does not reference release id: $ReleaseId"
    }

    Write-Utf8NoBom -Path (Join-Path $distRoot 'release.txt') -Content $ReleaseId
    Assert-DistDoesNotContainLocalSecrets

    New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null
    if (Test-Path -LiteralPath $zipPath -PathType Leaf) {
        Remove-Item -LiteralPath $zipPath -Force
    }
    Compress-Archive -Path (Join-Path $distRoot '*') -DestinationPath $zipPath -Force
    Assert-File -Path $zipPath
    Write-Host "studio workbench package created: $zipPath"
}

if ($Deploy) {
    Assert-File -Path $zipPath
    & $invokeHk2 -Command 'mkdir -p /opt/yingyue/releases /opt/yingyue/backups' -TimeoutSec 60
    & $invokeHk2 -UploadLocalPath $zipPath -UploadRemotePath $remoteZip -TimeoutSec 180

    $remoteCommand = @'
set -e
RELEASE='__RELEASE__'
REMOTE_ZIP="/opt/yingyue/releases/studio-workbench-$RELEASE.zip"
RELEASE_DIR="/opt/yingyue/releases/studio-workbench-$RELEASE"
BACKUP="/opt/yingyue/backups/$(date +%Y%m%d-%H%M%S)-pre-studio-workbench-$RELEASE"
SITE='/var/www/studio.evanshine.me'
test "$SITE" = '/var/www/studio.evanshine.me'
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
unzip -oq "$REMOTE_ZIP" -d "$RELEASE_DIR"
test -f "$RELEASE_DIR/index.html"
test -f "$RELEASE_DIR/release.txt"
grep -q "$RELEASE" "$RELEASE_DIR/index.html"
ACTUAL_RELEASE="$(tr -d '\r\n' < "$RELEASE_DIR/release.txt")"
test "$ACTUAL_RELEASE" = "$RELEASE"
mkdir -p "$BACKUP"
cp -a "$SITE/." "$BACKUP/"
find "$SITE" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a "$RELEASE_DIR/." "$SITE/"
printf '%s' "$RELEASE" > "$SITE/release.txt"
nginx -t
systemctl reload nginx
printf 'release_dir=%s\nbackup=%s\nrelease_txt=%s\n' "$RELEASE_DIR" "$BACKUP" "$(tr -d '\r\n' < "$SITE/release.txt")"
'@
    $remoteCommand = $remoteCommand.Replace('__RELEASE__', $ReleaseId)
    & $invokeHk2 -Command $remoteCommand -TimeoutSec 180
}

if ($ProbeHttp) {
    & $verifyRelease -ReleaseId $ReleaseId -BaseUrl $BaseUrl
}
