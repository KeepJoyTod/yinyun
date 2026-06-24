[CmdletBinding()]
param(
    [string]$OutputDir,

    [switch]$Build,

    [switch]$Clean,

    [switch]$Zip
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot 'dist/yingyue-frontend-deploy'
}

$resolvedRepo = [System.IO.Path]::GetFullPath($repoRoot)
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDir)

function Assert-InsideRepo {
    param([Parameter(Mandatory = $true)][string]$Path)

    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    if (-not $resolvedPath.StartsWith($resolvedRepo, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path must be inside repo: $resolvedPath"
    }
}

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
            throw "Command failed: $Command $($Arguments -join ' ')"
        }
    } finally {
        Pop-Location
    }
}

function Copy-RequiredDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [Parameter(Mandatory = $true)][string]$RequiredFile
    )

    if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
        throw "required directory not found: $Source"
    }

    $requiredPath = Join-Path $Source $RequiredFile
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
        throw "required file not found: $requiredPath"
    }

    Assert-InsideRepo -Path $Destination
    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

function Copy-OptionalFile {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
        return
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

Assert-InsideRepo -Path $resolvedOutput

if ($Build) {
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'client-web') -Command 'npm' -Arguments @('run', 'build')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'studio-workbench') -Command 'npm' -Arguments @('run', 'build')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'admin-ui') -Command 'pnpm' -Arguments @('run', 'build:prod')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'mobile-uniapp') -Command 'npm' -Arguments @('run', 'typecheck')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'mobile-uniapp') -Command 'npm' -Arguments @('test')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'mobile-uniapp') -Command 'npm' -Arguments @('run', 'build:h5')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'mobile-uniapp') -Command 'npm' -Arguments @('run', 'build:mp-weixin')
    Invoke-CheckedCommand -WorkingDirectory (Join-Path $repoRoot 'mobile-uniapp') -Command 'npm' -Arguments @('run', 'build:mp-toutiao')
}

if ($Clean -and (Test-Path -LiteralPath $resolvedOutput)) {
    Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$entries = @(
    @{ Source = 'admin-ui/dist'; Destination = 'web/admin-ui'; RequiredFile = 'index.html' },
    @{ Source = 'client-web/dist'; Destination = 'web/client-web'; RequiredFile = 'index.html' },
    @{ Source = 'studio-workbench/dist'; Destination = 'web/studio-workbench'; RequiredFile = 'index.html' },
    @{ Source = 'mobile-uniapp/dist/build/h5'; Destination = 'web/mobile-uniapp-h5'; RequiredFile = 'index.html' },
    @{ Source = 'mobile-uniapp/dist/build/mp-weixin'; Destination = 'miniapps/mp-weixin'; RequiredFile = 'app.json' },
    @{ Source = 'mobile-uniapp/dist/build/mp-toutiao'; Destination = 'miniapps/mp-toutiao'; RequiredFile = 'app.json' }
)

foreach ($entry in $entries) {
    Copy-RequiredDirectory `
        -Source (Join-Path $repoRoot $entry.Source) `
        -Destination (Join-Path $resolvedOutput $entry.Destination) `
        -RequiredFile $entry.RequiredFile
}

$docFiles = @(
    'frontend-entry-map-20260610.md',
    'client-web-code-map-20260610.md',
    'studio-workbench-code-map-20260610.md',
    'miniapp-preview-checklist-20260609.md',
    'douyin-miniapp-official-map-20260609.md',
    'douyin-miniapp-takeover-map-20260609.md'
)

foreach ($docFile in $docFiles) {
    Copy-OptionalFile `
        -Source (Join-Path $repoRoot "docs/$docFile") `
        -Destination (Join-Path $resolvedOutput "docs/$docFile")
}

Copy-OptionalFile `
    -Source (Join-Path $repoRoot 'tools/verify-yingyue-frontend-package.ps1') `
    -Destination (Join-Path $resolvedOutput 'tools/verify-yingyue-frontend-package.ps1')

$commit = 'unknown'
try {
    $commit = (& git -C $repoRoot rev-parse --short HEAD).Trim()
} catch {
    $commit = 'unknown'
}

$readmeTemplate = @'
# Yingyue Frontend Deploy Package

Commit: {{COMMIT}}
GeneratedAt: {{GENERATED_AT}}

## Web Outputs

- `web/admin-ui`: system admin UI. Deploy behind the admin web domain.
- `web/client-web`: customer PC web. Deploy behind the customer website domain.
- `web/studio-workbench`: store/studio PC workbench. Deploy behind the store staff domain.
- `web/mobile-uniapp-h5`: uni-app H5 preview build. Use mainly for pickup debugging or H5 fallback.

## Miniapp Outputs

- `miniapps/mp-weixin`: import this directory in WeChat DevTools.
- `miniapps/mp-toutiao`: import this directory in Douyin DevTools.

## Required Domains

Miniapp platform settings should allow:

- request domain: `api.evanshine.me`
- uploadFile domain: `api.evanshine.me`
- downloadFile domain: `api.evanshine.me`

Runtime API base remains:

```text
https://api.evanshine.me
```

## Preview Account

```text
phone: 13900001111
pickup code: PREVIEW-20260608
albumId: 990202606080001
```

Do not put production secrets or cloud AccessKeys into this package.
'@

$readme = $readmeTemplate.
    Replace('{{COMMIT}}', $commit).
    Replace('{{GENERATED_AT}}', (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText((Join-Path $resolvedOutput 'FRONTEND_PACKAGE_README.md'), $readme, $utf8NoBom)

if ($Zip) {
    $zipPath = "$resolvedOutput-$commit.zip"
    Assert-InsideRepo -Path $zipPath
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $resolvedOutput '*') -DestinationPath $zipPath -Force
    Write-Host "zip: $zipPath"
}

Write-Host 'yingyue frontend package created'
Write-Host "output: $resolvedOutput"
Write-Host "commit: $commit"
