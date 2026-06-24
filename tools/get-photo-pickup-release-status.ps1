[CmdletBinding()]
param(
    [string]$EvidenceRoot = '',

    [switch]$AsJson,

    [string]$OutputJsonPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function New-ReleaseStatusReport {
    param(
        [Parameter(Mandatory = $true)][string]$EvidenceRoot,
        [string]$LatestSummaryJsonPath = $null,
        [string]$CommandConclusion = $null,
        [string]$FinalConclusion = $null,
        [bool]$PreflightRan = $false,
        [bool]$LocalAcceptanceRan = $false,
        [hashtable]$ManualChecks = $null,
        [string[]]$Missing,
        [string[]]$NextCommands
    )

    $status = 'BLOCKED'
    if ($Missing.Count -eq 0) {
        $status = 'READY'
    }

    $latestSummaryJsonPathValue = if ([string]::IsNullOrWhiteSpace($LatestSummaryJsonPath)) { $null } else { [string]$LatestSummaryJsonPath }
    $commandConclusionValue = if ([string]::IsNullOrWhiteSpace($CommandConclusion)) { $null } else { [string]$CommandConclusion }
    $finalConclusionValue = if ([string]::IsNullOrWhiteSpace($FinalConclusion)) { $null } else { [string]$FinalConclusion }

    return [ordered]@{
        status = $status
        evidenceRoot = $EvidenceRoot
        latestSummaryJsonPath = $latestSummaryJsonPathValue
        commandConclusion = $commandConclusionValue
        finalConclusion = $finalConclusionValue
        preflightRan = [bool]$PreflightRan
        localAcceptanceRan = [bool]$LocalAcceptanceRan
        manualChecks = [ordered]@{
            h5Pickup = Test-ManualCheckValue -ManualChecks $ManualChecks -Name 'h5Pickup'
            wechatMiniapp = Test-ManualCheckValue -ManualChecks $ManualChecks -Name 'wechatMiniapp'
            douyinMiniapp = Test-ManualCheckValue -ManualChecks $ManualChecks -Name 'douyinMiniapp'
            adminAudit = Test-ManualCheckValue -ManualChecks $ManualChecks -Name 'adminAudit'
        }
        missing = @($Missing)
        nextCommands = @($NextCommands)
    }
}

function Test-ManualCheckValue {
    param(
        $ManualChecks,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $ManualChecks) {
        return $false
    }
    if ($ManualChecks -is [System.Collections.IDictionary]) {
        if ($ManualChecks.Contains($Name)) {
            return Test-StrictTrueValue -Value $ManualChecks[$Name]
        }
        return $false
    }
    if ($ManualChecks.PSObject.Properties.Name -contains $Name) {
        return Test-StrictTrueValue -Value $ManualChecks.$Name
    }
    return $false
}

function Test-StrictTrueValue {
    param($Value)

    if ($Value -is [bool]) {
        return $Value
    }
    if ($Value -is [string]) {
        return $Value.Trim().Equals('true', [System.StringComparison]::OrdinalIgnoreCase)
    }
    return $false
}

function Test-AliyunOssBareObjectUrl {
    param([string]$Url)

    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $false
    }

    try {
        $uri = [uri]$Url
    } catch {
        return $false
    }

    if ($uri.Scheme -ne 'https') {
        return $false
    }
    if (-not ($uri.Host -match '^[^.]+\.oss-[a-z0-9-]+\.aliyuncs\.com$')) {
        return $false
    }
    if ([string]::IsNullOrWhiteSpace($uri.AbsolutePath) -or $uri.AbsolutePath -eq '/') {
        return $false
    }
    if (-not [string]::IsNullOrWhiteSpace($uri.Query)) {
        return $false
    }

    return $true
}

function Get-JsonPropertyValue {
    param(
        $InputObject,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $InputObject) {
        return $null
    }
    if ($InputObject -is [System.Collections.IDictionary]) {
        if ($InputObject.Contains($Name)) {
            return $InputObject[$Name]
        }
        return $null
    }
    if ($InputObject.PSObject.Properties.Name -contains $Name) {
        return $InputObject.$Name
    }
    return $null
}

function Write-ReleaseStatusText {
    param(
        [Parameter(Mandatory = $true)]$Report
    )

    Write-Host 'photo pickup release status'
    Write-Host "evidenceRoot: $($Report.evidenceRoot)"

    if (-not [string]::IsNullOrWhiteSpace([string]$Report.latestSummaryJsonPath)) {
        Write-Host "latestSummaryJsonPath: $($Report.latestSummaryJsonPath)"
        Write-Host "commandConclusion: $($Report.commandConclusion)"
        Write-Host "finalConclusion: $($Report.finalConclusion)"
        Write-Host "preflightRan: $([bool]$Report.preflightRan)"
        Write-Host "localAcceptanceRan: $([bool]$Report.localAcceptanceRan)"
        Write-Host "h5Pickup: $([bool]$Report.manualChecks.h5Pickup)"
        Write-Host "wechatMiniapp: $([bool]$Report.manualChecks.wechatMiniapp)"
        Write-Host "douyinMiniapp: $([bool]$Report.manualChecks.douyinMiniapp)"
        Write-Host "adminAudit: $([bool]$Report.manualChecks.adminAudit)"
    }

    Write-Host "status: $($Report.status)"
    foreach ($item in $Report.missing) {
        Write-Host "missing: $item"
    }
    foreach ($command in $Report.nextCommands) {
        Write-Host "next: $command"
    }
}

function Write-ReleaseStatusJsonArtifact {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [string]$OutputJsonPath
    )

    if ([string]::IsNullOrWhiteSpace($OutputJsonPath)) {
        return
    }

    $parent = Split-Path -Parent $OutputJsonPath
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    $json = $Report | ConvertTo-Json -Depth 6
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($OutputJsonPath, $json, $utf8NoBom)
}

function Complete-ReleaseStatus {
    param(
        [Parameter(Mandatory = $true)]$Report
    )

    Write-ReleaseStatusJsonArtifact -Report $Report -OutputJsonPath $OutputJsonPath

    if ($AsJson) {
        $Report | ConvertTo-Json -Depth 6
    } else {
        Write-ReleaseStatusText -Report $Report
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $repoRoot 'docs/evidence'
}

$nextUploadImage = '在后台客片选片上传真实私有 OSS 图片，并从相册工作台复制 albumId/assetId/objectKey/OSS 裸链'
$nextRequiredInputs = '.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs'
$nextAutoResolveEvidence = '.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance'
$nextGenerateEvidence = '.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -RunPreflight -RunLocalAcceptance'
$nextAutoResolveFinalPassEvidence = '.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit'
$nextGenerateFinalPassEvidence = '.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit'
$nextReleaseGate = '.\tools\verify-photo-pickup-release-gate.ps1'

if (-not (Test-Path -LiteralPath $EvidenceRoot)) {
    $report = New-ReleaseStatusReport `
        -EvidenceRoot $EvidenceRoot `
        -ManualChecks @{} `
        -Missing @('real OSS evidence summary') `
        -NextCommands @($nextUploadImage, $nextRequiredInputs, $nextAutoResolveEvidence, $nextGenerateEvidence, $nextAutoResolveFinalPassEvidence, $nextGenerateFinalPassEvidence, $nextReleaseGate)

    Complete-ReleaseStatus -Report $report
    exit 0
}

$latest = Get-ChildItem -LiteralPath $EvidenceRoot -Filter 'photo-pickup-real-oss-acceptance-*.json' -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($null -eq $latest) {
    $report = New-ReleaseStatusReport `
        -EvidenceRoot $EvidenceRoot `
        -ManualChecks @{} `
        -Missing @('real OSS evidence summary') `
        -NextCommands @($nextUploadImage, $nextRequiredInputs, $nextAutoResolveEvidence, $nextGenerateEvidence, $nextAutoResolveFinalPassEvidence, $nextGenerateFinalPassEvidence, $nextReleaseGate)

    Complete-ReleaseStatus -Report $report
    exit 0
}

$summary = $null
try {
    $summary = Get-Content -LiteralPath $latest.FullName -Raw | ConvertFrom-Json
} catch {
    $report = New-ReleaseStatusReport `
        -EvidenceRoot $EvidenceRoot `
        -LatestSummaryJsonPath $latest.FullName `
        -ManualChecks @{} `
        -Missing @('readable real OSS evidence summary') `
        -NextCommands @($nextUploadImage, $nextRequiredInputs, $nextAutoResolveEvidence, $nextGenerateEvidence, $nextAutoResolveFinalPassEvidence, $nextGenerateFinalPassEvidence, $nextReleaseGate)

    Complete-ReleaseStatus -Report $report
    exit 0
}

$missing = [System.Collections.Generic.List[string]]::new()

$commandConclusion = Get-JsonPropertyValue -InputObject $summary -Name 'commandConclusion'
$finalConclusion = Get-JsonPropertyValue -InputObject $summary -Name 'finalConclusion'
$preflightRan = Test-StrictTrueValue -Value (Get-JsonPropertyValue -InputObject $summary -Name 'preflightRan')
$localAcceptanceRan = Test-StrictTrueValue -Value (Get-JsonPropertyValue -InputObject $summary -Name 'localAcceptanceRan')
$evidencePath = Get-JsonPropertyValue -InputObject $summary -Name 'evidencePath'
$summaryPath = Get-JsonPropertyValue -InputObject $summary -Name 'summaryJsonPath'
$inputs = Get-JsonPropertyValue -InputObject $summary -Name 'inputs'
$phone = Get-JsonPropertyValue -InputObject $inputs -Name 'phone'
$accessCode = Get-JsonPropertyValue -InputObject $inputs -Name 'accessCode'
$albumId = Get-JsonPropertyValue -InputObject $inputs -Name 'albumId'
$assetId = Get-JsonPropertyValue -InputObject $inputs -Name 'assetId'
$bareOssUrl = Get-JsonPropertyValue -InputObject $inputs -Name 'bareOssUrl'

if ([string]$commandConclusion -cne 'PASS') {
    $missing.Add('automatic command conclusion PASS')
}
if ([string]$finalConclusion -cne 'PASS') {
    $missing.Add('final conclusion PASS')
}
if (-not $preflightRan) {
    $missing.Add('production preflight run')
}
if (-not $localAcceptanceRan) {
    $missing.Add('local pickup acceptance run')
}
if ([string]::IsNullOrWhiteSpace([string]$evidencePath) -or -not (Test-Path -LiteralPath ([string]$evidencePath))) {
    $missing.Add('real OSS evidence markdown file')
}
if ([string]::IsNullOrWhiteSpace([string]$summaryPath) -or -not (Test-Path -LiteralPath ([string]$summaryPath))) {
    $missing.Add('summary path matches checked file')
} else {
    $resolvedSummaryPath = (Resolve-Path -LiteralPath ([string]$summaryPath)).Path
    $resolvedLatestPath = (Resolve-Path -LiteralPath $latest.FullName).Path
    $summaryItemPath = (Get-Item -LiteralPath ([string]$summaryPath)).FullName
    $latestItemPath = (Get-Item -LiteralPath $latest.FullName).FullName
    if ($resolvedSummaryPath -ne $resolvedLatestPath -and $summaryItemPath -ne $latestItemPath) {
        $missing.Add('summary path matches checked file')
    }
}
if ([string]::IsNullOrWhiteSpace([string]$bareOssUrl) -or [string]$bareOssUrl -match 'Signature=' -or [string]$bareOssUrl -match 'OSSAccessKeyId=' -or [string]$bareOssUrl -match '\?') {
    $missing.Add('sanitized bare OSS URL')
}
if (-not (Test-AliyunOssBareObjectUrl -Url ([string]$bareOssUrl))) {
    $missing.Add('HTTPS Aliyun OSS bare object URL')
}
if ([string]::IsNullOrWhiteSpace([string]$phone)) {
    $missing.Add('real OSS evidence phone')
}
if ([string]::IsNullOrWhiteSpace([string]$accessCode)) {
    $missing.Add('real OSS evidence access code')
}
if ([string]::IsNullOrWhiteSpace([string]$albumId)) {
    $missing.Add('real OSS evidence album id')
}
if ([string]::IsNullOrWhiteSpace([string]$assetId)) {
    $missing.Add('real OSS evidence asset id')
}

$manualChecks = Get-JsonPropertyValue -InputObject $summary -Name 'manualChecks'
$h5PickupPassed = Test-ManualCheckValue -ManualChecks $manualChecks -Name 'h5Pickup'
$wechatMiniappPassed = Test-ManualCheckValue -ManualChecks $manualChecks -Name 'wechatMiniapp'
$douyinMiniappPassed = Test-ManualCheckValue -ManualChecks $manualChecks -Name 'douyinMiniapp'
$adminAuditPassed = Test-ManualCheckValue -ManualChecks $manualChecks -Name 'adminAudit'

if (-not $h5PickupPassed) {
    $missing.Add('H5 pickup acceptance')
}
if (-not $wechatMiniappPassed) {
    $missing.Add('WeChat miniapp acceptance')
}
if (-not $douyinMiniappPassed) {
    $missing.Add('Douyin miniapp acceptance')
}
if (-not $adminAuditPassed) {
    $missing.Add('admin audit acceptance')
}

$nextCommands = @($nextReleaseGate)
if ($missing.Count -gt 0) {
    $nextCommands = @($nextUploadImage, $nextRequiredInputs, $nextAutoResolveEvidence, $nextGenerateEvidence, $nextAutoResolveFinalPassEvidence, $nextGenerateFinalPassEvidence, $nextReleaseGate)
}

$report = New-ReleaseStatusReport `
    -EvidenceRoot $EvidenceRoot `
    -LatestSummaryJsonPath $latest.FullName `
    -CommandConclusion ([string]$commandConclusion) `
    -FinalConclusion ([string]$finalConclusion) `
    -PreflightRan $preflightRan `
    -LocalAcceptanceRan $localAcceptanceRan `
    -ManualChecks @{
        h5Pickup = $h5PickupPassed
        wechatMiniapp = $wechatMiniappPassed
        douyinMiniapp = $douyinMiniappPassed
        adminAudit = $adminAuditPassed
    } `
    -Missing $missing.ToArray() `
    -NextCommands $nextCommands

Complete-ReleaseStatus -Report $report
