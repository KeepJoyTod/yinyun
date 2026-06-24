[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,

    [string]$Phone = '13800003333',

    [string]$AccessCode = 'PICK-202606-001',

    [string]$AlbumId = '903001',

    [string]$AssetId,

    [string]$BareOssUrl,

    [switch]$PreviewAccount,

    [switch]$SkipPhotoSmoke,

    [switch]$SkipPhotoStream,

    [switch]$AllowEmptyAlbum,

    [switch]$VerifyBareOssBlocked,

    [switch]$ContinueOnPhotoSmokeError,

    [switch]$SkipAuthJsonRoute,

    [switch]$CheckDouyinMissingSignature
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Join-ApiUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    return $Root.TrimEnd('/') + '/' + $Path.TrimStart('/')
}

function ConvertTo-JsonBody {
    param([Parameter(Mandatory = $true)]$Value)
    return ($Value | ConvertTo-Json -Depth 8 -Compress)
}

function Assert-NotHtml {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($Content -match '<html|<!doctype html|normalize\.css|页面不存在') {
        throw "$Name failed: received HTML instead of JSON; check reverse proxy/API domain"
    }
}

function Get-HttpStatusFromError {
    param([Parameter(Mandatory = $true)]$ErrorRecord)

    $exception = $ErrorRecord.Exception
    if ($null -eq $exception) {
        return 'unknown'
    }
    if ($exception.PSObject.Properties.Name -notcontains 'Response' -or $null -eq $exception.Response) {
        return 'unknown'
    }
    $response = $exception.Response
    if ($response.PSObject.Properties.Name -contains 'StatusCode' -and $null -ne $response.StatusCode) {
        return [int]$response.StatusCode
    }
    return 'unknown'
}

function Invoke-JsonProbe {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        $Body = $null,
        [hashtable]$Headers = @{}
    )

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        ContentType = 'application/json'
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $params.Body = ConvertTo-JsonBody $Body
    }

    try {
        $response = Invoke-WebRequest @params
    } catch {
        $status = Get-HttpStatusFromError $_
        $message = [string]$_.ErrorDetails.Message
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = $_.Exception.Message
        }
        if ($message -match '<html|<!doctype html|normalize\.css|页面不存在') {
            $message = 'received HTML instead of JSON; check reverse proxy/API domain'
        }
        throw "$Method $Url failed: status=$status, $message"
    }

    $content = [string]$response.Content
    Assert-NotHtml -Content $content -Name "$Method $Url"

    try {
        $json = $content | ConvertFrom-Json
    } catch {
        throw "$Method $Url failed: response is not valid JSON"
    }

    return [pscustomobject]@{
        StatusCode = [int]$response.StatusCode
        Json = $json
    }
}

function Assert-RuoyiAuthResponse {
    param([Parameter(Mandatory = $true)]$Json)

    if (-not ($Json.PSObject.Properties.Name -contains 'code')) {
        throw 'auth route failed: missing RuoYi code field'
    }
    if ([int]$Json.code -ne 200) {
        $message = if ($Json.PSObject.Properties.Name -contains 'msg') { $Json.msg } else { 'unknown error' }
        throw "auth route failed: code=$($Json.code), msg=$message"
    }
    if (-not ($Json.PSObject.Properties.Name -contains 'data') -or $null -eq $Json.data) {
        throw 'auth route failed: missing data object'
    }
    if (-not ($Json.data.PSObject.Properties.Name -contains 'clientToken') -or [string]::IsNullOrWhiteSpace([string]$Json.data.clientToken)) {
        throw 'auth route failed: missing clientToken'
    }
}

function Assert-DouyinRawFailure {
    param([Parameter(Mandatory = $true)]$Json)

    if ($Json.PSObject.Properties.Name -contains 'code') {
        throw 'douyin signature probe failed: response looks like RuoYi wrapper, expected Douyin raw JSON'
    }
    if (-not ($Json.PSObject.Properties.Name -contains 'data')) {
        throw 'douyin signature probe failed: missing data object'
    }
    if (-not ($Json.data.PSObject.Properties.Name -contains 'error_code')) {
        throw 'douyin signature probe failed: missing data.error_code'
    }
    if ([int]$Json.data.error_code -eq 0) {
        throw 'douyin signature probe failed: missing signature was accepted; check DOUYIN_LIFE_REQUIRE_SIGNATURE=true'
    }
}

$root = $BaseUrl.TrimEnd('/')
$repoRoot = Split-Path -Parent $PSScriptRoot
$smokeScript = Join-Path $repoRoot 'tools/photo-pickup-smoke.ps1'
$photoSmokeMode = 'explicit'

if ($PreviewAccount) {
    $photoSmokeMode = 'preview-empty'
    if ($Phone -eq '13800003333') {
        $Phone = '13900001111'
    }
    if ($AccessCode -eq 'PICK-202606-001') {
        $AccessCode = 'PREVIEW-20260608'
    }
    if ($AlbumId -eq '903001') {
        $AlbumId = ''
    }
    $SkipPhotoStream = $true
    $AllowEmptyAlbum = $true
}

if (-not $PreviewAccount -and $root -match 'api\.evanshine\.me' -and $Phone -eq '13800003333' -and $AccessCode -eq 'PICK-202606-001' -and $AlbumId -eq '903001') {
    Write-Warning 'public api preflight is using local demo account defaults; use -PreviewAccount for the current production preview account, or pass explicit production values.'
    $photoSmokeMode = 'local-demo-defaults-on-public-api'
}

Write-Host 'yingyue production preflight'
Write-Host "baseUrl: $root"
Write-Host "photo smoke mode: $photoSmokeMode"
Write-Host "photo smoke account: $Phone"
Write-Host "photo smoke albumId: $(if ([string]::IsNullOrWhiteSpace($AlbumId)) { '<auto>' } else { $AlbumId })"

if (-not $SkipPhotoSmoke) {
    if (-not (Test-Path -LiteralPath $smokeScript)) {
        throw "photo pickup smoke script not found: $smokeScript"
    }
    $smokeArgs = @{
        BaseUrl = $root
        Phone = $Phone
        AccessCode = $AccessCode
    }
    if (-not [string]::IsNullOrWhiteSpace($AlbumId)) {
        $smokeArgs.AlbumId = $AlbumId
    }
    if (-not [string]::IsNullOrWhiteSpace($AssetId)) {
        $smokeArgs.AssetId = $AssetId
    }
    if (-not [string]::IsNullOrWhiteSpace($BareOssUrl)) {
        $smokeArgs.BareOssUrl = $BareOssUrl
    }
    if ($SkipPhotoStream) {
        $smokeArgs.SkipStream = $true
    }
    if ($AllowEmptyAlbum) {
        $smokeArgs.AllowEmptyAlbum = $true
    }
    if ($VerifyBareOssBlocked) {
        $smokeArgs.VerifyBareOssBlocked = $true
    }
    try {
        & $smokeScript @smokeArgs
        if ($LASTEXITCODE -ne 0) {
            throw "photo pickup smoke failed with exit code $LASTEXITCODE"
        }
    } catch {
        if (-not $ContinueOnPhotoSmokeError) {
            throw
        }
        Write-Warning "photo pickup smoke failed but continuing: $($_.Exception.Message)"
    }
}

if (-not $SkipAuthJsonRoute) {
    $authUrl = Join-ApiUrl $root '/client/photo/auth/verify'
    $authBody = @{
        phone = $Phone
        code = $AccessCode
        platform = 'H5'
    }
    $authProbe = Invoke-JsonProbe -Method 'POST' -Url $authUrl -Body $authBody
    Assert-RuoyiAuthResponse -Json $authProbe.Json
    Write-Host 'auth-json-route: success'
} else {
    Write-Host 'auth-json-route: skipped'
}

if ($CheckDouyinMissingSignature) {
    $douyinUrl = Join-ApiUrl $root '/api/douyin/life/order/query'
    $douyinBody = @{
        preflight = $true
    }
    $douyinProbe = Invoke-JsonProbe -Method 'POST' -Url $douyinUrl -Body $douyinBody
    Assert-DouyinRawFailure -Json $douyinProbe.Json
    Write-Host "douyin-missing-signature: rejected error_code=$($douyinProbe.Json.data.error_code)"
}

Write-Host 'preflight: passed'
