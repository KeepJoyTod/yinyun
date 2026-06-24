[CmdletBinding()]
param(
    [string]$BaseUrl = '',

    [string]$Phone = '',

    [string]$AccessCode = '',

    [string]$AlbumId = '',

    [string]$AssetId = '',

    [string]$EvidenceRoot = '',

    [switch]$SkipLocalAcceptance,

    [switch]$SkipRealOssFinalPass,

    [switch]$AsJson,

    [string]$ReleaseStatusScriptPath = '',

    [string]$LocalAcceptanceScriptPath = '',

    [string]$RealOssSummaryGateScriptPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $repoRoot 'docs/evidence'
}
$localAcceptance = if ([string]::IsNullOrWhiteSpace($LocalAcceptanceScriptPath)) { Join-Path $repoRoot 'tools/photo-pickup-local-acceptance.ps1' } else { $LocalAcceptanceScriptPath }
$realOssSummaryGate = if ([string]::IsNullOrWhiteSpace($RealOssSummaryGateScriptPath)) { Join-Path $repoRoot 'tools/verify-latest-photo-pickup-real-oss-summary.ps1' } else { $RealOssSummaryGateScriptPath }
$releaseStatus = if ([string]::IsNullOrWhiteSpace($ReleaseStatusScriptPath)) { Join-Path $repoRoot 'tools/get-photo-pickup-release-status.ps1' } else { $ReleaseStatusScriptPath }
$localAcceptanceParams = @{}
if (-not [string]::IsNullOrWhiteSpace($BaseUrl)) {
    $localAcceptanceParams.BaseUrl = $BaseUrl
}
if (-not [string]::IsNullOrWhiteSpace($Phone)) {
    $localAcceptanceParams.Phone = $Phone
}
if (-not [string]::IsNullOrWhiteSpace($AccessCode)) {
    $localAcceptanceParams.AccessCode = $AccessCode
}
if (-not [string]::IsNullOrWhiteSpace($AlbumId)) {
    $localAcceptanceParams.AlbumId = $AlbumId
}
if (-not [string]::IsNullOrWhiteSpace($AssetId)) {
    $localAcceptanceParams.AssetId = $AssetId
}

function New-ReleaseGateReport {
    param(
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$ReleaseStatus = $null,
        [string[]]$Missing = @(),
        [bool]$PartialOnly = $false,
        [bool]$SkippedLocalAcceptance = $false,
        [bool]$SkippedRealOssFinalPass = $false,
        [bool]$LocalAcceptanceRan = $false,
        [bool]$RealOssFinalPassRan = $false,
        [string]$Stage = '',
        [string]$Message = ''
    )

    return [ordered]@{
        status = $Status
        releaseStatus = $ReleaseStatus
        repoRoot = $repoRoot
        evidenceRoot = $EvidenceRoot
        missing = @($Missing)
        partialOnly = $PartialOnly
        skippedLocalAcceptance = $SkippedLocalAcceptance
        skippedRealOssFinalPass = $SkippedRealOssFinalPass
        localAcceptanceRan = $LocalAcceptanceRan
        realOssFinalPassRan = $RealOssFinalPassRan
        stage = $Stage
        message = $Message
    }
}

function Complete-ReleaseGate {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [int]$ExitCode = 0
    )

    if ($AsJson) {
        $Report | ConvertTo-Json -Depth 6
        exit $ExitCode
    }

    if ($ExitCode -ne 0) {
        throw $Report.message
    }
}

function Invoke-ReleaseGateStep {
    param(
        [Parameter(Mandatory = $true)][string]$Stage,
        [Parameter(Mandatory = $true)][scriptblock]$Script,
        [Parameter(Mandatory = $true)][string]$ReleaseStatusValue,
        [bool]$PartialOnly = $false,
        [bool]$SkippedLocalAcceptance = $false,
        [bool]$SkippedRealOssFinalPass = $false,
        [bool]$LocalAcceptanceRan = $false,
        [bool]$RealOssFinalPassRan = $false
    )

    try {
        $global:LASTEXITCODE = 0
        if ($AsJson) {
            $null = & $Script *>&1
        } else {
            & $Script
        }
        if ($null -ne $LASTEXITCODE -and [int]$LASTEXITCODE -ne 0) {
            throw "$Stage failed: exit_code: $LASTEXITCODE"
        }
    } catch {
        $message = $_.Exception.Message
        $report = New-ReleaseGateReport `
            -Status 'FAILED' `
            -ReleaseStatus $ReleaseStatusValue `
            -Missing @() `
            -PartialOnly $PartialOnly `
            -SkippedLocalAcceptance $SkippedLocalAcceptance `
            -SkippedRealOssFinalPass $SkippedRealOssFinalPass `
            -LocalAcceptanceRan $LocalAcceptanceRan `
            -RealOssFinalPassRan $RealOssFinalPassRan `
            -Stage $Stage `
            -Message $message
        Complete-ReleaseGate -Report $report -ExitCode 1
    }
}

if (-not (Test-Path -LiteralPath $localAcceptance)) {
    throw "local acceptance script not found: $localAcceptance"
}
if (-not (Test-Path -LiteralPath $realOssSummaryGate)) {
    throw "real OSS summary gate not found: $realOssSummaryGate"
}
if (-not (Test-Path -LiteralPath $releaseStatus)) {
    throw "release status script not found: $releaseStatus"
}

if (-not $AsJson) {
    Write-Host 'photo pickup release gate'
    Write-Host "repoRoot: $repoRoot"
    Write-Host 'release gate status diagnostic'
    & $releaseStatus -EvidenceRoot $EvidenceRoot
}
$releaseStatusJson = & $releaseStatus -EvidenceRoot $EvidenceRoot -AsJson
$releaseStatusReport = $releaseStatusJson | ConvertFrom-Json
if (-not $AsJson) {
    Write-Host "release gate status: $($releaseStatusReport.status)"
}
if ([string]$releaseStatusReport.status -ne 'READY' -and -not $SkipRealOssFinalPass) {
    foreach ($item in $releaseStatusReport.missing) {
        if (-not $AsJson) {
            Write-Host "release gate missing: $item"
        }
    }
    $report = New-ReleaseGateReport `
        -Status 'BLOCKED' `
        -ReleaseStatus ([string]$releaseStatusReport.status) `
        -Missing @($releaseStatusReport.missing) `
        -SkippedLocalAcceptance ([bool]$SkipLocalAcceptance) `
        -SkippedRealOssFinalPass ([bool]$SkipRealOssFinalPass) `
        -Stage 'releaseStatus' `
        -Message "release gate blocked: $($releaseStatusReport.status)"
    Complete-ReleaseGate -Report $report -ExitCode 1
}

$partialOnly = $false
$localAcceptanceRan = $false
if ($SkipLocalAcceptance) {
    if (-not $AsJson) {
        Write-Host 'release gate skipped local acceptance'
    }
    $partialOnly = $true
} else {
    Invoke-ReleaseGateStep `
        -Stage 'localAcceptance' `
        -Script { & $localAcceptance @localAcceptanceParams } `
        -ReleaseStatusValue ([string]$releaseStatusReport.status) `
        -SkippedLocalAcceptance $false `
        -SkippedRealOssFinalPass ([bool]$SkipRealOssFinalPass)
    $localAcceptanceRan = $true
}

$realOssFinalPassRan = $false
if ($SkipRealOssFinalPass) {
    if (-not $AsJson) {
        Write-Warning 'release gate skipped real OSS final PASS check'
        Write-Warning 'release gate requires real OSS final PASS before production handoff'
        Write-Host 'photo pickup release gate: partial only'
        return
    }
    $report = New-ReleaseGateReport `
        -Status 'PARTIAL' `
        -ReleaseStatus ([string]$releaseStatusReport.status) `
        -Missing @($releaseStatusReport.missing) `
        -PartialOnly $true `
        -SkippedLocalAcceptance ([bool]$SkipLocalAcceptance) `
        -SkippedRealOssFinalPass $true `
        -LocalAcceptanceRan $localAcceptanceRan `
        -RealOssFinalPassRan $false `
        -Stage 'realOssFinalPass' `
        -Message 'photo pickup release gate: partial only'
    Complete-ReleaseGate -Report $report
} else {
    Invoke-ReleaseGateStep `
        -Stage 'realOssFinalPass' `
        -Script { & $realOssSummaryGate -EvidenceRoot $EvidenceRoot -RequireFinalPass } `
        -ReleaseStatusValue ([string]$releaseStatusReport.status) `
        -PartialOnly $partialOnly `
        -SkippedLocalAcceptance ([bool]$SkipLocalAcceptance) `
        -SkippedRealOssFinalPass $false `
        -LocalAcceptanceRan $localAcceptanceRan `
        -RealOssFinalPassRan $false
    $realOssFinalPassRan = $true
}

if ($partialOnly) {
    if (-not $AsJson) {
        Write-Host 'photo pickup release gate: partial only'
        return
    }
    $report = New-ReleaseGateReport `
        -Status 'PARTIAL' `
        -ReleaseStatus ([string]$releaseStatusReport.status) `
        -Missing @($releaseStatusReport.missing) `
        -PartialOnly $true `
        -SkippedLocalAcceptance $true `
        -SkippedRealOssFinalPass ([bool]$SkipRealOssFinalPass) `
        -LocalAcceptanceRan $localAcceptanceRan `
        -RealOssFinalPassRan $realOssFinalPassRan `
        -Stage 'releaseGate' `
        -Message 'photo pickup release gate: partial only'
    Complete-ReleaseGate -Report $report
}

if ($AsJson) {
    $report = New-ReleaseGateReport `
        -Status 'PASSED' `
        -ReleaseStatus ([string]$releaseStatusReport.status) `
        -Missing @() `
        -PartialOnly $false `
        -SkippedLocalAcceptance $false `
        -SkippedRealOssFinalPass $false `
        -LocalAcceptanceRan $localAcceptanceRan `
        -RealOssFinalPassRan $realOssFinalPassRan `
        -Stage 'releaseGate' `
        -Message 'photo pickup release gate: passed'
    Complete-ReleaseGate -Report $report
}

Write-Host 'photo pickup release gate: passed'
