[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [switch]$SkipNetwork,

    [switch]$SkipGithub,

    [switch]$FailOnWarning
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Root = $BaseUrl.TrimEnd('/')

$Checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = ''
    )

    $Checks.Add([pscustomobject]@{
        Name = $Name
        Status = $Status
        Detail = $Detail
    })
}

function Join-ApiUrl {
    param([Parameter(Mandatory = $true)][string]$Path)
    return $Root + '/' + $Path.TrimStart('/')
}

function ConvertTo-JsonBody {
    param([Parameter(Mandatory = $true)]$Value)
    return ($Value | ConvertTo-Json -Depth 12 -Compress)
}

function Read-Utf8Json {
    param([Parameter(Mandatory = $true)][string]$Path)
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Invoke-JsonPost {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Body,
        [hashtable]$Headers = @{}
    )

    $url = Join-ApiUrl -Path $Path
    $response = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Headers $Headers -Body (ConvertTo-JsonBody $Body) -UseBasicParsing -TimeoutSec 30
    $contentType = [string]($response.Headers['Content-Type'] -join ',')
    if ($contentType -notmatch 'application/json') {
        throw "expected application/json but got $contentType"
    }
    $json = ([string]$response.Content) | ConvertFrom-Json
    return [pscustomobject]@{
        StatusCode = [int]$response.StatusCode
        Json = $json
        Body = [string]$response.Content
    }
}

function Test-ManifestValue {
    param(
        [Parameter(Mandatory = $true)][object]$Manifest,
        [Parameter(Mandatory = $true)][string]$Platform,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    $platformNode = $Manifest.PSObject.Properties[$Platform]
    if ($null -eq $platformNode -or $null -eq $platformNode.Value) {
        return ''
    }
    $property = $platformNode.Value.PSObject.Properties[$PropertyName]
    if ($null -eq $property) {
        return ''
    }
    return [string]$property.Value
}

function Test-RequiredDistFiles {
    param(
        [Parameter(Mandatory = $true)][string]$DistPath,
        [Parameter(Mandatory = $true)][string[]]$RequiredFiles
    )

    $missing = @()
    foreach ($file in $RequiredFiles) {
        $filePath = Join-Path $DistPath $file
        if (-not (Test-Path -LiteralPath $filePath)) {
            $missing += $file
        }
    }

    return $missing
}

function Test-MiniappProjectConfig {
    param(
        [Parameter(Mandatory = $true)][string]$DistPath,
        [Parameter(Mandatory = $true)][string]$ExpectedAppId,
        [Parameter(Mandatory = $true)][string]$CheckName
    )

    $configPath = Join-Path $DistPath 'project.config.json'
    if (-not (Test-Path -LiteralPath $configPath)) {
        Add-Check $CheckName 'FAIL' "missing project.config.json in $DistPath"
        return
    }

    try {
        $config = Read-Utf8Json -Path $configPath
        $configAppId = ''
        if ($config.PSObject.Properties.Name -contains 'appid') {
            $configAppId = [string]$config.appid
        }
        if ([string]::IsNullOrWhiteSpace($configAppId)) {
            Add-Check $CheckName 'FAIL' 'project.config.json appid is empty.'
        } elseif ($configAppId -ne $ExpectedAppId) {
            Add-Check $CheckName 'FAIL' "project.config.json appid=$configAppId does not match manifest appid=$ExpectedAppId"
        } else {
            Add-Check $CheckName 'PASS' 'project.config.json appid matches manifest.'
        }
    } catch {
        Add-Check $CheckName 'FAIL' "project.config.json parse failed: $($_.Exception.Message)"
    }
}

Write-Host 'yingyue platform readiness'
Write-Host "baseUrl: $Root"
Write-Host ''

if ($Root -match '^https://') {
    Add-Check 'api-domain-scheme' 'PASS' $Root
} else {
    Add-Check 'api-domain-scheme' 'FAIL' 'BaseUrl must use HTTPS for platform callbacks and miniapp domains.'
}

$manifestPath = Join-Path $RepoRoot 'mobile-uniapp/src/manifest.json'
if (Test-Path -LiteralPath $manifestPath) {
    $manifest = Read-Utf8Json -Path $manifestPath
    $douyinAppId = Test-ManifestValue -Manifest $manifest -Platform 'mp-toutiao' -PropertyName 'appid'
    $wechatAppId = Test-ManifestValue -Manifest $manifest -Platform 'mp-weixin' -PropertyName 'appid'

    if ([string]::IsNullOrWhiteSpace($douyinAppId)) {
        Add-Check 'douyin-miniapp-appid' 'FAIL' 'mp-toutiao.appid is empty.'
    } else {
        Add-Check 'douyin-miniapp-appid' 'PASS' 'mp-toutiao.appid is configured.'
    }

    if ([string]::IsNullOrWhiteSpace($wechatAppId)) {
        Add-Check 'wechat-miniapp-appid' 'WARN' 'mp-weixin.appid is still empty; fill it after the WeChat miniapp is created.'
    } else {
        Add-Check 'wechat-miniapp-appid' 'PASS' 'mp-weixin.appid is configured.'
    }
} else {
    Add-Check 'mobile-manifest' 'FAIL' "missing: $manifestPath"
}

$douyinDist = Join-Path $RepoRoot 'mobile-uniapp/dist/build/mp-toutiao'
$wechatDist = Join-Path $RepoRoot 'mobile-uniapp/dist/build/mp-weixin'
if (Test-Path -LiteralPath $douyinDist) {
    Add-Check 'douyin-miniapp-dist' 'PASS' $douyinDist
    $missing = @(Test-RequiredDistFiles -DistPath $douyinDist -RequiredFiles @('app.js', 'app.json', 'app.ttss', 'project.config.json', 'pages'))
    if ($missing.Count -gt 0) {
        Add-Check 'douyin-miniapp-dist-files' 'FAIL' "missing: $($missing -join ', ')"
    } else {
        Add-Check 'douyin-miniapp-dist-files' 'PASS' 'app.js, app.json, app.ttss, project.config.json and pages exist.'
    }
    if (-not [string]::IsNullOrWhiteSpace($douyinAppId)) {
        Test-MiniappProjectConfig -DistPath $douyinDist -ExpectedAppId $douyinAppId -CheckName 'douyin-miniapp-project-config'
    }
} else {
    Add-Check 'douyin-miniapp-dist' 'FAIL' "run: cd mobile-uniapp; npm run build:mp-toutiao"
}
if (Test-Path -LiteralPath $wechatDist) {
    Add-Check 'wechat-miniapp-dist' 'PASS' $wechatDist
    $missing = @(Test-RequiredDistFiles -DistPath $wechatDist -RequiredFiles @('app.js', 'app.json', 'app.wxss', 'project.config.json', 'pages'))
    if ($missing.Count -gt 0) {
        Add-Check 'wechat-miniapp-dist-files' 'FAIL' "missing: $($missing -join ', ')"
    } else {
        Add-Check 'wechat-miniapp-dist-files' 'PASS' 'app.js, app.json, app.wxss, project.config.json and pages exist.'
    }
    if (-not [string]::IsNullOrWhiteSpace($wechatAppId)) {
        Test-MiniappProjectConfig -DistPath $wechatDist -ExpectedAppId $wechatAppId -CheckName 'wechat-miniapp-project-config'
    }
} else {
    Add-Check 'wechat-miniapp-dist' 'FAIL' "run: cd mobile-uniapp; npm run build:mp-weixin"
}

if (-not $SkipNetwork) {
    try {
        $challenge = "yy-ready-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
        $probe = Invoke-JsonPost -Path '/api/douyin/life/webhook' -Body @{
            event = 'verify_webhook'
            content = @{
                challenge = $challenge
            }
        }
        if ($probe.StatusCode -eq 200 -and $probe.Body -match [regex]::Escape($challenge)) {
            Add-Check 'douyin-webhook-challenge' 'PASS' 'returns application/json and echoes challenge.'
        } else {
            Add-Check 'douyin-webhook-challenge' 'FAIL' 'challenge was not echoed.'
        }
    } catch {
        Add-Check 'douyin-webhook-challenge' 'FAIL' $_.Exception.Message
    }

    try {
        $probe = Invoke-JsonPost -Path '/api/douyin/life/order/query' -Body @{
            readiness = $true
        }
        if ($probe.Json.PSObject.Properties.Name -contains 'code') {
            Add-Check 'douyin-spi-raw-json' 'FAIL' 'response looks like RuoYi wrapper.'
        } elseif (-not ($probe.Json.PSObject.Properties.Name -contains 'data')) {
            Add-Check 'douyin-spi-raw-json' 'FAIL' 'missing data object.'
        } elseif (-not ($probe.Json.data.PSObject.Properties.Name -contains 'error_code')) {
            Add-Check 'douyin-spi-raw-json' 'FAIL' 'missing data.error_code.'
        } elseif ([int]$probe.Json.data.error_code -eq 0) {
            Add-Check 'douyin-missing-signature' 'FAIL' 'missing signature was accepted; check DOUYIN_LIFE_REQUIRE_SIGNATURE=true.'
        } else {
            Add-Check 'douyin-missing-signature' 'PASS' "rejected error_code=$($probe.Json.data.error_code)"
        }
    } catch {
        Add-Check 'douyin-missing-signature' 'FAIL' $_.Exception.Message
    }
} else {
    Add-Check 'network-probes' 'WARN' 'skipped by -SkipNetwork'
}

if (-not $SkipGithub) {
    try {
        $repoInfo = (& gh repo view --json visibility,nameWithOwner | ConvertFrom-Json)
        if ($repoInfo.visibility -eq 'PRIVATE') {
            Add-Check 'github-repo-private' 'PASS' $repoInfo.nameWithOwner
        } else {
            Add-Check 'github-repo-private' 'FAIL' "visibility=$($repoInfo.visibility)"
        }
    } catch {
        Add-Check 'github-repo-private' 'WARN' "gh check skipped/failed: $($_.Exception.Message)"
    }
} else {
    Add-Check 'github-repo-private' 'WARN' 'skipped by -SkipGithub'
}

Add-Check 'miniapp-request-domain' 'MANUAL' $Root
Add-Check 'miniapp-download-domain' 'MANUAL' $Root
Add-Check 'miniapp-upload-domain' 'MANUAL' $Root

$spiUrls = @(
    '/api/douyin/life/webhook',
    '/api/douyin/life/tripartite-code/create',
    '/api/douyin/life/refund/apply',
    '/api/douyin/life/refund/notify',
    '/api/douyin/life/reservation/order-create',
    '/api/douyin/life/reservation/pay-notify',
    '/api/douyin/life/reservation/order-query',
    '/api/douyin/life/reservation/stock-query',
    '/api/douyin/life/voucher/revoke',
    '/api/douyin/life/voucher/batch-revoke',
    '/api/douyin/life/order/query',
    '/api/douyin/life/fulfil/check-info-sync'
)

Write-Host 'checks'
$Checks | Format-Table -AutoSize

Write-Host ''
Write-Host 'platform fill values'
Write-Host "miniapp request/download/upload domain: $Root"
Write-Host "WeChat devtools import: $wechatDist"
Write-Host "Douyin devtools import: $douyinDist"
Write-Host "WeChat legal domains: request=$Root; uploadFile=$Root; downloadFile=$Root"
Write-Host "Douyin legal domains: request=$Root; uploadFile=$Root; downloadFile=$Root"
foreach ($path in $spiUrls) {
    Write-Host (Join-ApiUrl -Path $path)
}

$failed = @($Checks | Where-Object { $_.Status -eq 'FAIL' })
$warnings = @($Checks | Where-Object { $_.Status -eq 'WARN' })
if ($failed.Count -gt 0) {
    throw "platform readiness failed: $($failed.Count) failure(s)."
}
if ($FailOnWarning -and $warnings.Count -gt 0) {
    throw "platform readiness has warnings: $($warnings.Count)."
}

Write-Host ''
Write-Host 'platform readiness passed' -ForegroundColor Green
