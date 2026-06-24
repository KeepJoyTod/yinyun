[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ReleaseId,

    [string]$BaseUrl = 'https://studio.evanshine.me',

    [string[]]$Route = @(
        '/',
        '/login',
        '/dashboard/today',
        '/order/appointment?quick=all',
        '/service/photos',
        '/merchant/decoration',
        '/merchant/micro-pages',
        '/merchant/micro-forms',
        '/product/card-management',
        '/product/card-catalog'
    ),

    [switch]$AsJson,

    [string]$OutputJsonPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Join-StudioUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)]$RoutePath
    )

    $routeText = [string]$RoutePath
    if ($routeText.StartsWith('http://') -or $routeText.StartsWith('https://')) {
        return $routeText
    }

    $rootText = $Root -replace '/+$', ''
    $relativeText = $routeText -replace '^/+', ''
    return $rootText + '/' + $relativeText
}

function Add-ReleaseCacheBust {
    param(
        [Parameter(Mandatory = $true)]$RoutePath,
        [Parameter(Mandatory = $true)][string]$Marker
    )

    $routeText = [string]$RoutePath
    if ($routeText -match '(^|[?&])cb=') {
        return $routeText
    }

    $separator = if ($routeText.Contains('?')) { '&' } else { '?' }
    return $routeText + $separator + 'cb=' + [System.Uri]::EscapeDataString($Marker)
}

function New-Check {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = ''
    )

    [pscustomobject]@{
        name = $Name
        status = $Status
        detail = $Detail
    }
}

function Invoke-TextGet {
    param([Parameter(Mandatory = $true)][string]$Url)

    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 0
    [pscustomobject]@{
        statusCode = [int]$response.StatusCode
        content = [string]$response.Content
    }
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

    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, ($Report | ConvertTo-Json -Depth 8), $utf8NoBom)
}

$checks = New-Object System.Collections.Generic.List[object]
$releaseUrl = Join-StudioUrl -Root $BaseUrl -RoutePath '/release.txt'
$releaseText = ''

try {
    $releaseResponse = Invoke-TextGet -Url $releaseUrl
    $releaseText = $releaseResponse.content.Trim()
    if ($releaseText -eq $ReleaseId) {
        $checks.Add((New-Check -Name 'release.txt:marker' -Status 'PASS' -Detail $releaseText))
    } else {
        $checks.Add((New-Check -Name 'release.txt:marker' -Status 'FAIL' -Detail "expected=$ReleaseId actual=$releaseText"))
    }
} catch {
    $checks.Add((New-Check -Name 'release.txt:marker' -Status 'FAIL' -Detail $_.Exception.Message))
}

$routeResults = @()
$routesToProbe = @($Route | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
foreach ($route in $routesToProbe) {
    $routeText = [string]$route
    $path = Add-ReleaseCacheBust -RoutePath $routeText -Marker $ReleaseId
    $url = Join-StudioUrl -Root $BaseUrl -RoutePath $path
    try {
        $response = Invoke-TextGet -Url $url
        $statusOk = $response.statusCode -ge 200 -and $response.statusCode -lt 400
        $containsRelease = $response.content.Contains($ReleaseId)
        $status = if ($statusOk -and $containsRelease) { 'PASS' } else { 'FAIL' }
        $detail = "http=$($response.statusCode); containsRelease=$containsRelease"
        $routeResults += [pscustomobject]@{
            route = $routeText
            url = $url
            status = $status
            statusCode = $response.statusCode
            containsRelease = $containsRelease
        }
        $checks.Add((New-Check -Name "route:$routeText" -Status $status -Detail $detail))
    } catch {
        $routeResults += [pscustomobject]@{
            route = $routeText
            url = $url
            status = 'FAIL'
            statusCode = 0
            containsRelease = $false
            error = $_.Exception.Message
        }
        $checks.Add((New-Check -Name "route:$routeText" -Status 'FAIL' -Detail $_.Exception.Message))
    }
}

$failed = @($checks | Where-Object { $_.status -ne 'PASS' })
$overallStatus = if ($failed.Count -eq 0) { 'PASS' } else { 'FAIL' }
$checkedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$checkRows = @()
foreach ($check in $checks) {
    $checkRows += $check
}
$routeRows = @($routeResults)
$report = [pscustomobject]@{
    status = $overallStatus
    checkedAt = $checkedAt
    baseUrl = $BaseUrl
    releaseId = $ReleaseId
    releaseTxt = $releaseText
    markerMatched = $releaseText -eq $ReleaseId
    failureCount = $failed.Count
    checks = $checkRows
    routes = $routeRows
}

Write-JsonArtifact -Report $report -Path $OutputJsonPath

if ($AsJson) {
    $report | ConvertTo-Json -Depth 8
    if ($failed.Count -gt 0) {
        exit 1
    }
    exit 0
}

if ($failed.Count -gt 0) {
    $failed | Format-Table -AutoSize | Out-String | Write-Host
    throw "studio workbench release verification failed: $($failed.Count) failed checks"
}

Write-Host "studio workbench release verification PASS: $ReleaseId"
