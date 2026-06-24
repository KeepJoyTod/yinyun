[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SummaryJsonPath,

    [switch]$RequireFinalPass
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-TextField {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Object -or $Object.PSObject.Properties.Name -notcontains $Name) {
        throw "summary field missing: $Name"
    }

    $value = $Object.$Name
    if ([string]::IsNullOrWhiteSpace([string]$value)) {
        throw "summary field missing: $Name"
    }
    return [string]$value
}

function Assert-Conclusion {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $allowed = @('PASS', 'PENDING', 'FAIL')
    if ($allowed -cnotcontains $Value) {
        throw "$Name has invalid value: $Value"
    }
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

function Assert-ManualCheck {
    param(
        [Parameter(Mandatory = $true)]$ManualChecks,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $ManualChecks -or $ManualChecks.PSObject.Properties.Name -notcontains $Name) {
        throw "manual check missing: $Name"
    }

    if ($RequireFinalPass -and -not (Test-StrictTrueValue -Value $ManualChecks.$Name)) {
        throw "manual check missing: $Name"
    }
}

if (-not (Test-Path -LiteralPath $SummaryJsonPath)) {
    throw "summary json not found: $SummaryJsonPath"
}

$checkedSummaryPath = (Resolve-Path -LiteralPath $SummaryJsonPath).Path
$checkedSummaryItemPath = (Get-Item -LiteralPath $SummaryJsonPath).FullName
try {
    $summary = Get-Content -LiteralPath $SummaryJsonPath -Raw | ConvertFrom-Json
} catch {
    throw "summary json is not readable: $SummaryJsonPath"
}

$evidencePath = Assert-TextField -Object $summary -Name 'evidencePath'
$summaryPath = Assert-TextField -Object $summary -Name 'summaryJsonPath'
$commandConclusion = Assert-TextField -Object $summary -Name 'commandConclusion'
$finalConclusion = Assert-TextField -Object $summary -Name 'finalConclusion'

if (-not (Test-Path -LiteralPath $evidencePath)) {
    throw "evidence file not found: $evidencePath"
}

if (-not (Test-Path -LiteralPath $summaryPath)) {
    throw "summaryJsonPath does not match checked file: $summaryPath"
}

$resolvedSummaryPath = (Resolve-Path -LiteralPath $summaryPath).Path
$resolvedSummaryItemPath = (Get-Item -LiteralPath $summaryPath).FullName
if ($resolvedSummaryPath -ne $checkedSummaryPath -and $resolvedSummaryItemPath -ne $checkedSummaryItemPath) {
    throw "summaryJsonPath does not match checked file: $summaryPath"
}

Assert-Conclusion -Name 'commandConclusion' -Value $commandConclusion
Assert-Conclusion -Name 'finalConclusion' -Value $finalConclusion

if ($summary.PSObject.Properties.Name -notcontains 'preflightRan') {
    throw 'summary field missing: preflightRan'
}
if ($summary.PSObject.Properties.Name -notcontains 'localAcceptanceRan') {
    throw 'summary field missing: localAcceptanceRan'
}
if ($RequireFinalPass -and -not (Test-StrictTrueValue -Value $summary.preflightRan)) {
    throw 'preflight run is required for final PASS'
}
if ($RequireFinalPass -and -not (Test-StrictTrueValue -Value $summary.localAcceptanceRan)) {
    throw 'local acceptance run is required for final PASS'
}
if ($summary.PSObject.Properties.Name -notcontains 'manualChecks') {
    throw 'summary field missing: manualChecks'
}
if ($null -eq $summary.inputs) {
    throw 'summary field missing: inputs'
}

Assert-ManualCheck -ManualChecks $summary.manualChecks -Name 'h5Pickup'
Assert-ManualCheck -ManualChecks $summary.manualChecks -Name 'wechatMiniapp'
Assert-ManualCheck -ManualChecks $summary.manualChecks -Name 'douyinMiniapp'
Assert-ManualCheck -ManualChecks $summary.manualChecks -Name 'adminAudit'

$phone = Assert-TextField -Object $summary.inputs -Name 'phone'
$accessCode = Assert-TextField -Object $summary.inputs -Name 'accessCode'
$albumId = Assert-TextField -Object $summary.inputs -Name 'albumId'
$assetId = Assert-TextField -Object $summary.inputs -Name 'assetId'
$bareOssUrl = Assert-TextField -Object $summary.inputs -Name 'bareOssUrl'

if ($bareOssUrl -match 'Signature=' -or $bareOssUrl -match 'OSSAccessKeyId=' -or $bareOssUrl -match '\?') {
    throw 'bareOssUrl is not a sanitized bare OSS URL'
}
if (-not (Test-AliyunOssBareObjectUrl -Url $bareOssUrl)) {
    throw 'bareOssUrl is not an HTTPS Aliyun OSS object URL'
}

if ($RequireFinalPass -and $finalConclusion -cne 'PASS') {
    throw 'final conclusion is not PASS'
}

Write-Host 'real OSS evidence summary: passed'
Write-Host "summaryJsonPath: $summaryPath"
Write-Host "evidencePath: $evidencePath"
Write-Host "commandConclusion: $commandConclusion"
Write-Host "finalConclusion: $finalConclusion"
Write-Host "preflightRan: $(Test-StrictTrueValue -Value $summary.preflightRan)"
Write-Host "localAcceptanceRan: $(Test-StrictTrueValue -Value $summary.localAcceptanceRan)"
Write-Host "h5Pickup: $(Test-StrictTrueValue -Value $summary.manualChecks.h5Pickup)"
Write-Host "wechatMiniapp: $(Test-StrictTrueValue -Value $summary.manualChecks.wechatMiniapp)"
Write-Host "douyinMiniapp: $(Test-StrictTrueValue -Value $summary.manualChecks.douyinMiniapp)"
Write-Host "adminAudit: $(Test-StrictTrueValue -Value $summary.manualChecks.adminAudit)"
Write-Host "albumId: $albumId"
Write-Host "assetId: $assetId"
