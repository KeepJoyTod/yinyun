[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:8080',

    [string]$Phone = '13800003333',

    [string]$AccessCode = 'PICK-202606-001',

    [string]$AlbumId = '903001',

    [string]$AssetId = '2063173289800183809',

    [switch]$SkipPhotoStream,

    [switch]$AllowEmptyAlbum,

    [switch]$SkipMobileBuild,

    [switch]$SkipPlatformReadiness,

    [switch]$SkipAdminCheck,

    [switch]$SkipAdminBuild,

    [switch]$SkipH5Browser,

    [switch]$SkipBackendSmoke,

    [switch]$SkipBackendUnit
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$mobileRoot = Join-Path $repoRoot 'mobile-uniapp'
$adminRoot = Join-Path $repoRoot 'admin-ui'
$backendRoot = Join-Path $repoRoot 'backend'
$photoSmoke = Join-Path $repoRoot 'tools/photo-pickup-smoke.ps1'
$platformReadiness = Join-Path $repoRoot 'tools/yingyue-platform-readiness.ps1'

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Script
    )

    Write-Host ""
    Write-Host "==> $Name"
    $start = Get-Date
    $global:LASTEXITCODE = 0
    & $Script
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE"
    }
    $elapsed = (Get-Date) - $start
    Write-Host ("<== {0} passed in {1:n1}s" -f $Name, $elapsed.TotalSeconds)
}

function Invoke-Npm {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptName
    )

    Push-Location $mobileRoot
    try {
        & npm.cmd run $ScriptName
        if ($LASTEXITCODE -ne 0) {
            throw "npm run $ScriptName failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Invoke-AdminNpm {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptName
    )

    Push-Location $adminRoot
    try {
        & npm.cmd run $ScriptName
        if ($LASTEXITCODE -ne 0) {
            throw "admin-ui npm run $ScriptName failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

if (-not (Test-Path -LiteralPath $mobileRoot)) {
    throw "mobile root not found: $mobileRoot"
}
if (-not (Test-Path -LiteralPath $adminRoot)) {
    throw "admin-ui root not found: $adminRoot"
}
if (-not (Test-Path -LiteralPath $backendRoot)) {
    throw "backend root not found: $backendRoot"
}

Write-Host 'photo pickup local acceptance'
Write-Host "repoRoot: $repoRoot"
Write-Host "baseUrl:  $BaseUrl"
Write-Host "albumId:  $AlbumId"
Write-Host "assetId:  $AssetId"

Invoke-Step 'mobile typecheck' { Invoke-Npm 'typecheck' }
Invoke-Step 'mobile unit tests' { Invoke-Npm 'test' }

if (-not $SkipH5Browser) {
    Invoke-Step 'mobile H5 browser smoke' { Invoke-Npm 'test:h5' }
} else {
    Write-Host 'mobile H5 browser smoke skipped'
}

if (-not $SkipMobileBuild) {
    Invoke-Step 'mobile H5 build' { Invoke-Npm 'build:h5' }
    Invoke-Step 'mobile WeChat mini build' { Invoke-Npm 'build:mp-weixin' }
    Invoke-Step 'mobile Douyin mini build' { Invoke-Npm 'build:mp-toutiao' }
} else {
    Write-Host 'mobile builds skipped'
}

if (-not $SkipPlatformReadiness) {
    if (-not (Test-Path -LiteralPath $platformReadiness)) {
        throw "platform readiness script not found: $platformReadiness"
    }
    Invoke-Step 'platform readiness local checks' {
        & $platformReadiness -BaseUrl 'https://api.evanshine.me' -SkipNetwork -SkipGithub
    }
} else {
    Write-Host 'platform readiness skipped'
}

if (-not $SkipAdminCheck) {
    Invoke-Step 'admin yy tests' { Invoke-AdminNpm 'test:yy' }
    if (-not $SkipAdminBuild) {
        Invoke-Step 'admin dev build' { Invoke-AdminNpm 'build:dev' }
    } else {
        Write-Host 'admin dev build skipped'
    }
} else {
    Write-Host 'admin checks skipped'
}

if (-not $SkipBackendSmoke) {
    if (-not (Test-Path -LiteralPath $photoSmoke)) {
        throw "photo pickup smoke script not found: $photoSmoke"
    }
    Invoke-Step 'backend photo pickup smoke' {
        $smokeArgs = @{
            BaseUrl = $BaseUrl
            Phone = $Phone
            AccessCode = $AccessCode
        }
        if (-not [string]::IsNullOrWhiteSpace($AlbumId)) {
            $smokeArgs.AlbumId = $AlbumId
        }
        if (-not [string]::IsNullOrWhiteSpace($AssetId)) {
            $smokeArgs.AssetId = $AssetId
        }
        if ($SkipPhotoStream) {
            $smokeArgs.SkipStream = $true
        }
        if ($AllowEmptyAlbum) {
            $smokeArgs.AllowEmptyAlbum = $true
        }
        & $photoSmoke @smokeArgs
    }
} else {
    Write-Host 'backend photo pickup smoke skipped'
}

if (-not $SkipBackendUnit) {
    Invoke-Step 'backend client photo unit tests' {
        Push-Location $backendRoot
        try {
            & mvn.cmd -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test
        } finally {
            Pop-Location
        }
    }
} else {
    Write-Host 'backend client photo unit tests skipped'
}

Write-Host ''
Write-Host 'photo pickup local acceptance: passed'
