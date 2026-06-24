[CmdletBinding()]
param(
    [string]$ContractPath = 'docs/contracts/studio-workbench-api-contract-20260615.md',
    [string]$OpenApiPath = 'docs/api/studio-workbench-openapi-skeleton-20260615.yaml',
    [switch]$AsJson
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$contractFullPath = Join-Path $repoRoot $ContractPath
$openApiFullPath = Join-Path $repoRoot $OpenApiPath

function New-Check {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Detail = ''
    )
    [pscustomobject]@{
        name = $Name
        status = $Status
        detail = $Detail
    }
}

$checks = [System.Collections.Generic.List[object]]::new()

if (Test-Path -LiteralPath $contractFullPath) {
    $checks.Add((New-Check -Name 'contract-exists' -Status 'PASS' -Detail $ContractPath))
} else {
    $checks.Add((New-Check -Name 'contract-exists' -Status 'FAIL' -Detail "missing $ContractPath"))
}

if (Test-Path -LiteralPath $openApiFullPath) {
    $checks.Add((New-Check -Name 'openapi-exists' -Status 'PASS' -Detail $OpenApiPath))
} else {
    $checks.Add((New-Check -Name 'openapi-exists' -Status 'FAIL' -Detail "missing $OpenApiPath"))
}

$contractText = if (Test-Path -LiteralPath $contractFullPath) { Get-Content -Raw -LiteralPath $contractFullPath } else { '' }
$openApiText = if (Test-Path -LiteralPath $openApiFullPath) { Get-Content -Raw -LiteralPath $openApiFullPath } else { '' }
$combinedText = $contractText + [Environment]::NewLine + $openApiText

$requiredTerms = @(
    'yy_order',
    'yy_photo_album',
    'yy_photo_asset',
    'yy_payment_record',
    'DOUYIN_LIFE',
    'DOUYIN_MINI_APP',
    'yy_channel_sync_log',
    'EXTERNAL_BLOCKED',
    'SKELETON'
)

foreach ($term in $requiredTerms) {
    if ($combinedText.Contains($term)) {
        $checks.Add((New-Check -Name "required-term:$term" -Status 'PASS'))
    } else {
        $checks.Add((New-Check -Name "required-term:$term" -Status 'FAIL' -Detail 'missing required boundary term'))
    }
}

$forbiddenPatterns = @(
    'APPSecret\s*[:=]',
    'AccessKey\s*[:=]',
    'SECRET\s*[:=]\s*[A-Za-z0-9]',
    'password\s*[:=]\s*[A-Za-z0-9]',
    'token\s*[:=]\s*[A-Za-z0-9._-]+',
    'fake success',
    'acl\s*[:=]\s*public-read',
    'ossAcl\s*[:=]\s*public-read',
    'bucketAcl\s*[:=]\s*public-read'
)

foreach ($pattern in $forbiddenPatterns) {
    if ($combinedText -match $pattern) {
        $checks.Add((New-Check -Name "forbidden:$pattern" -Status 'FAIL' -Detail 'forbidden text found'))
    } else {
        $checks.Add((New-Check -Name "forbidden:$pattern" -Status 'PASS'))
    }
}

if ($openApiText -match '(?m)^openapi:\s*3\.0\.3') {
    $checks.Add((New-Check -Name 'openapi-version' -Status 'PASS'))
} else {
    $checks.Add((New-Check -Name 'openapi-version' -Status 'FAIL' -Detail 'expected openapi: 3.0.3'))
}

$failures = @($checks | Where-Object { $_.status -eq 'FAIL' })
$report = [ordered]@{
    status = if ($failures.Count -eq 0) { 'PASS' } else { 'FAIL' }
    checkedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
    checks = @($checks)
}

if ($AsJson) {
    $report | ConvertTo-Json -Depth 6
} else {
    Write-Host "studio api contracts: $($report.status)"
    $checks | Format-Table -AutoSize | Out-String | Write-Host
}

if ($failures.Count -gt 0) {
    exit 1
}
