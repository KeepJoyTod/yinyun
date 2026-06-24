[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://studio.evanshine.me',

    [string[]]$Route = @(
        '/',
        '/login',
        '/order/appointment',
        '/service/photos',
        '/order/verification',
        '/settings/workbench'
    ),

    [string]$OutputPath = '',

    [string]$SummaryJsonPath = '',

    [switch]$ProbeHttp,

    [switch]$AsJson
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$evidenceRoot = Join-Path $repoRoot 'docs/evidence'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $evidenceRoot "studio-workbench-acceptance-$stamp.md"
}

if ([string]::IsNullOrWhiteSpace($SummaryJsonPath)) {
    $SummaryJsonPath = Join-Path $evidenceRoot "studio-workbench-acceptance-$stamp.json"
}

function New-RouteProbe {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$Status,
        [int]$StatusCode = 0,
        [string]$Detail = ''
    )

    return [pscustomobject]@{
        route = $Path
        url = $Url
        status = $Status
        statusCode = $StatusCode
        detail = $Detail
    }
}

function Join-Url {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ($Path.StartsWith('http://') -or $Path.StartsWith('https://')) {
        return $Path
    }

    return $Root.TrimEnd('/') + '/' + $Path.TrimStart('/')
}

function Invoke-RouteProbe {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $url = Join-Url -Root $Root -Path $Path
    try {
        $response = Invoke-WebRequest -Method Get -Uri $url -UseBasicParsing -TimeoutSec 15
        $code = [int]$response.StatusCode
        $status = if ($code -ge 200 -and $code -lt 400) { 'PASS' } else { 'FAIL' }
        return New-RouteProbe -Path $Path -Url $url -Status $status -StatusCode $code -Detail $response.StatusDescription
    } catch {
        $response = $_.Exception.Response
        $statusCode = 0
        if ($null -ne $response) {
            try {
                $statusCode = [int]$response.StatusCode
            } catch {
                $statusCode = 0
            }
        }
        return New-RouteProbe -Path $Path -Url $url -Status 'FAIL' -StatusCode $statusCode -Detail $_.Exception.Message
    }
}

function Write-Utf8File {
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

New-Item -ItemType Directory -Force -Path $evidenceRoot | Out-Null

$routes = @($Route | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
$probes = @()
if ($ProbeHttp) {
    $probes = @($routes | ForEach-Object { Invoke-RouteProbe -Root $BaseUrl -Path $_ })
}

$failedProbes = @($probes | Where-Object { $_.status -ne 'PASS' })
$status = if (-not $ProbeHttp) {
    'SKELETON'
} elseif ($failedProbes.Count -gt 0) {
    'FAIL'
} else {
    'READY_FOR_MANUAL_CHECK'
}

$generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
$routeRows = if ($probes.Count -gt 0) {
    ($probes | ForEach-Object {
        "| $($_.route) | $($_.status) | $($_.statusCode) | $($_.url) | $($_.detail -replace '\|', '/') |"
    }) -join [Environment]::NewLine
} else {
    ($routes | ForEach-Object {
        "| $_ | NOT_PROBED |  | $(Join-Url -Root $BaseUrl -Path $_) | run with -ProbeHttp or verify manually |"
    }) -join [Environment]::NewLine
}

$contentLines = @(
    '# Studio Workbench Acceptance Evidence',
    '',
    "GeneratedAt: $generatedAt",
    '',
    '## Result',
    '',
    'Status:',
    '',
    '```text',
    $status,
    '```',
    '',
    'This script only creates an acceptance evidence skeleton by default. With `-ProbeHttp`, it only probes public page HTTP status. It does not log in, read secrets, or write databases.',
    '',
    '## Basics',
    '',
    '| Item | Value |',
    '| --- | --- |',
    "| BaseUrl | $BaseUrl |",
    "| Repo | $repoRoot |",
    "| Output | $OutputPath |",
    '',
    '## Route Probes',
    '',
    '| Route | Status | HTTP | URL | Detail |',
    '| --- | --- | --- | --- | --- |',
    $routeRows,
    '',
    '## Manual Checks',
    '',
    '| Scene | Pass Standard | Result |',
    '| --- | --- | --- |',
    '| Login | Staff login form is in the side/work area; errors do not block layout | `<PASS/FAIL>` |',
    '| Dashboard | Today metrics, channel sync, and photo issue entry are readable | `<PASS/FAIL>` |',
    '| Orders | Today queue, reschedule precheck, export boundary, and diagnostic package are usable | `<PASS/FAIL>` |',
    '| Photos | Upload, batch selection, rename/delete refresh, and copyable errors are usable | `<PASS/FAIL>` |',
    '| Channel Verification | Acceptance cases, recent logid, and diagnostic package are usable | `<PASS/FAIL>` |',
    '| Settings | Runtime mode, permission boundary, and staff entry notes are clear | `<PASS/FAIL>` |',
    '',
    '## Next Commands',
    '',
    '```powershell',
    "cd $repoRoot",
    'cd studio-workbench',
    'npm test',
    'npm run build',
    '```'
)
$content = $contentLines -join [Environment]::NewLine

Write-Utf8File -Path $OutputPath -Content $content

$summary = [ordered]@{
    status = $status
    generatedAt = $generatedAt
    baseUrl = $BaseUrl
    outputPath = $OutputPath
    summaryJsonPath = $SummaryJsonPath
    probeHttp = [bool]$ProbeHttp
    routes = @($routes)
    probes = @($probes)
}

Write-Utf8File -Path $SummaryJsonPath -Content ($summary | ConvertTo-Json -Depth 8)

if ($AsJson) {
    $summary | ConvertTo-Json -Depth 8
} else {
    Write-Host "studio workbench acceptance evidence: $status"
    Write-Host "created evidence: $OutputPath"
    Write-Host "created summary: $SummaryJsonPath"
}

if ($status -eq 'FAIL') {
    exit 1
}
