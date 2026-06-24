[CmdletBinding()]
param(
    [string]$PackageDir = '',

    [switch]$AsJson,

    [string]$OutputJsonPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot

function Resolve-FrontendPackageDir {
    param([string]$InputPackageDir)

    if (-not [string]::IsNullOrWhiteSpace($InputPackageDir)) {
        return [System.IO.Path]::GetFullPath($InputPackageDir)
    }

    $parent = Split-Path -Parent $PSScriptRoot
    if (Test-Path -LiteralPath (Join-Path $parent 'FRONTEND_PACKAGE_README.md')) {
        return [System.IO.Path]::GetFullPath($parent)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot 'dist/yingyue-frontend-deploy'))
}

function New-Check {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = ''
    )

    return [pscustomobject]@{
        name = $Name
        status = $Status
        detail = $Detail
    }
}

function Test-RequiredFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [long]$MinBytes = 1
    )

    $path = Join-Path $Root $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        return New-Check -Name "file:$RelativePath" -Status 'FAIL' -Detail 'missing'
    }

    $item = Get-Item -LiteralPath $path
    if ($item.Length -lt $MinBytes) {
        return New-Check -Name "file:$RelativePath" -Status 'FAIL' -Detail "too small: $($item.Length) bytes"
    }

    return New-Check -Name "file:$RelativePath" -Status 'PASS' -Detail "$($item.Length) bytes"
}

function Test-RequiredDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$RelativePath
    )

    $path = Join-Path $Root $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Container)) {
        return New-Check -Name "dir:$RelativePath" -Status 'FAIL' -Detail 'missing'
    }

    $count = @(Get-ChildItem -LiteralPath $path -Recurse -File).Count
    if ($count -le 0) {
        return New-Check -Name "dir:$RelativePath" -Status 'FAIL' -Detail 'empty'
    }

    return New-Check -Name "dir:$RelativePath" -Status 'PASS' -Detail "$count files"
}

function Test-NoSecretFiles {
    param([Parameter(Mandatory = $true)][string]$Root)

    $denyPatterns = @(
        '\.env$',
        '\.env\.production$',
        '\.env\.local$',
        'APPSecret',
        'AccessKey',
        'Secret',
        'secret'
    )

    $files = @(Get-ChildItem -LiteralPath $Root -Recurse -File | ForEach-Object {
        $_.FullName.Substring($Root.Length).TrimStart('\', '/')
    })

    $bad = @($files | Where-Object {
        $relative = $_
        $denyPatterns | Where-Object { $relative -match $_ } | Select-Object -First 1
    })

    if ($bad.Count -gt 0) {
        return New-Check -Name 'secret-files:denylist' -Status 'FAIL' -Detail ($bad -join '; ')
    }

    return New-Check -Name 'secret-files:denylist' -Status 'PASS' -Detail 'no denied secret-like file names'
}

function Write-JsonArtifact {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    $json = $Report | ConvertTo-Json -Depth 6
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
}

$resolvedPackage = Resolve-FrontendPackageDir -InputPackageDir $PackageDir
$checks = @()

if (-not (Test-Path -LiteralPath $resolvedPackage -PathType Container)) {
    $checks += New-Check -Name 'package-dir' -Status 'FAIL' -Detail 'missing'
} else {
    $checks += New-Check -Name 'package-dir' -Status 'PASS' -Detail $resolvedPackage
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'FRONTEND_PACKAGE_README.md'
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'web/admin-ui/index.html' -MinBytes 100
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'web/client-web/index.html' -MinBytes 100
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'web/studio-workbench/index.html' -MinBytes 100
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'web/mobile-uniapp-h5/index.html' -MinBytes 100
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'miniapps/mp-weixin/app.json' -MinBytes 10
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'miniapps/mp-weixin/project.config.json' -MinBytes 10
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'miniapps/mp-toutiao/app.json' -MinBytes 10
    $checks += Test-RequiredFile -Root $resolvedPackage -RelativePath 'miniapps/mp-toutiao/project.config.json' -MinBytes 10
    $checks += Test-RequiredDirectory -Root $resolvedPackage -RelativePath 'web/admin-ui/assets'
    $checks += Test-RequiredDirectory -Root $resolvedPackage -RelativePath 'web/client-web/assets'
    $checks += Test-RequiredDirectory -Root $resolvedPackage -RelativePath 'web/studio-workbench/assets'
    $checks += Test-RequiredDirectory -Root $resolvedPackage -RelativePath 'web/mobile-uniapp-h5/assets'
    $checks += Test-NoSecretFiles -Root $resolvedPackage
}

$failed = @($checks | Where-Object { $_.status -eq 'FAIL' })
$status = if ($failed.Count -gt 0) { 'FAIL' } else { 'PASS' }
$report = [ordered]@{
    status = $status
    packageDir = $resolvedPackage
    checkedAt = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
    failureCount = $failed.Count
    checks = @($checks)
}

Write-JsonArtifact -Report $report -Path $OutputJsonPath

if ($AsJson) {
    $report | ConvertTo-Json -Depth 6
    if ($status -eq 'PASS') {
        exit 0
    }
    exit 1
}

if ($status -ne 'PASS') {
    $failed | Format-Table -AutoSize | Out-String | Write-Host
    throw "frontend package verification failed: $($failed.Count) failed checks"
}

Write-Host "yingyue frontend package verification PASS: $resolvedPackage"
