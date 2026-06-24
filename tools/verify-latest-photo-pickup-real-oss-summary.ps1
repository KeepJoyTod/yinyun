[CmdletBinding()]
param(
    [string]$EvidenceRoot = '',

    [switch]$RequireFinalPass
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $repoRoot 'docs/evidence'
}

$summaryVerifier = Join-Path $repoRoot 'tools/verify-photo-pickup-real-oss-summary.ps1'
if (-not (Test-Path -LiteralPath $summaryVerifier)) {
    throw "summary verifier not found: $summaryVerifier"
}

if (-not (Test-Path -LiteralPath $EvidenceRoot)) {
    throw "evidence root not found: $EvidenceRoot"
}

$latest = Get-ChildItem -LiteralPath $EvidenceRoot -Filter 'photo-pickup-real-oss-acceptance-*.json' -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($null -eq $latest) {
    throw "no real OSS evidence summary found: $EvidenceRoot"
}

if ($RequireFinalPass) {
    & $summaryVerifier -SummaryJsonPath $latest.FullName -RequireFinalPass
} else {
    & $summaryVerifier -SummaryJsonPath $latest.FullName
}

Write-Host 'latest real OSS evidence summary: passed'
Write-Host "latestSummaryJsonPath: $($latest.FullName)"
