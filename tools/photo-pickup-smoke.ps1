[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,

    [string]$Phone,

    [string]$AccessCode,

    [string]$AlbumId,

    [string]$AssetId,

    [string]$Platform = 'H5',

    [switch]$SkipStream,

    [switch]$AllowEmptyAlbum,

    [string]$BareOssUrl,

    [switch]$VerifyBareOssBlocked,

    [switch]$PreviewAccount
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

function Assert-RuoyiSuccess {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Response) {
        throw "$Name failed: empty response"
    }

    if ($Response.PSObject.Properties.Name -contains 'code' -and [int]$Response.code -ne 200) {
        $message = if ($Response.PSObject.Properties.Name -contains 'msg') { $Response.msg } else { 'unknown error' }
        throw "$Name failed: code=$($Response.code), msg=$message"
    }
}

function Get-Data {
    param([Parameter(Mandatory = $true)]$Response)

    if ($Response.PSObject.Properties.Name -contains 'data') {
        return $Response.data
    }

    return $Response
}

function Format-Token {
    param([string]$Token)

    if ([string]::IsNullOrWhiteSpace($Token)) {
        return '<empty>'
    }

    if ($Token.Length -le 8) {
        return "len=$($Token.Length)"
    }

    return "len=$($Token.Length), value=$($Token.Substring(0, 4))...$($Token.Substring($Token.Length - 4))"
}

function Get-HeaderValue {
    param(
        [Parameter(Mandatory = $true)]$Headers,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Headers) {
        return $null
    }

    if ($Headers -is [System.Collections.IDictionary]) {
        foreach ($key in $Headers.Keys) {
            if ([string]::Equals([string]$key, $Name, [StringComparison]::OrdinalIgnoreCase)) {
                $value = $Headers[$key]
                if ($value -is [array]) {
                    return ($value -join ', ')
                }
                return [string]$value
            }
        }
    }

    return $null
}

function Get-ErrorMessage {
    param([Parameter(Mandatory = $true)]$ErrorRecord)

    $details = $ErrorRecord.ErrorDetails
    if ($null -ne $details) {
        if ($details -is [string] -and -not [string]::IsNullOrWhiteSpace($details)) {
            return [string]$details
        }
        if ($details.PSObject.Properties.Match('Message').Count -gt 0 -and -not [string]::IsNullOrWhiteSpace([string]$details.Message)) {
            return [string]$details.Message
        }
    }

    if ($ErrorRecord.Exception -and -not [string]::IsNullOrWhiteSpace($ErrorRecord.Exception.Message)) {
        return [string]$ErrorRecord.Exception.Message
    }

    return 'unknown error'
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

function Get-ResponseText {
    param($Response)

    if ($null -eq $Response) {
        return ''
    }

    if ($Response.PSObject.Properties.Match('Content').Count -eq 0 -or $null -eq $Response.Content) {
        return ''
    }

    if ($Response.Content -is [byte[]]) {
        if ($Response.Content.Length -le 0) {
            return ''
        }
        return [Text.Encoding]::UTF8.GetString($Response.Content)
    }

    return [string]$Response.Content
}

function Format-ResponseSnippet {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return '<empty>'
    }

    $normalized = $Text -replace '\s+', ' '
    if ($normalized.Length -gt 300) {
        return $normalized.Substring(0, 300) + '...'
    }
    return $normalized
}

function Invoke-RawRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Headers = @{}
    )

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        UseBasicParsing = $true
    }

    if ($PSVersionTable.PSVersion.Major -ge 7) {
        $params.SkipHttpErrorCheck = $true
    }

    try {
        return Invoke-WebRequest @params
    } catch {
        $status = Get-HttpStatusFromError $_
        throw "$Method $Url failed before response assertion: status=$status, $(Get-ErrorMessage $_)"
    }
}

function Invoke-ProbeRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Headers = @{}
    )

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        UseBasicParsing = $true
    }

    if ($PSVersionTable.PSVersion.Major -ge 7) {
        $params.SkipHttpErrorCheck = $true
    }

    try {
        return Invoke-WebRequest @params
    } catch {
        $exception = $_.Exception
        if ($null -eq $exception -or $exception.PSObject.Properties.Name -notcontains 'Response' -or $null -eq $exception.Response) {
            $status = Get-HttpStatusFromError $_
            throw "$Method $Url failed before response assertion: status=$status, $(Get-ErrorMessage $_)"
        }

        $response = $exception.Response
        $body = ''
        try {
            $stream = $response.GetResponseStream()
            if ($null -ne $stream) {
                $reader = [System.IO.StreamReader]::new($stream)
                $body = $reader.ReadToEnd()
                $reader.Dispose()
            }
        } catch {
            $body = ''
        }

        $statusCode = 'unknown'
        if ($response.PSObject.Properties.Name -contains 'StatusCode' -and $null -ne $response.StatusCode) {
            $statusCode = [int]$response.StatusCode
        }

        return [pscustomobject]@{
            StatusCode = $statusCode
            Headers = $response.Headers
            Content = $body
            RawContentLength = if ($null -eq $body) { 0 } else { [Text.Encoding]::UTF8.GetByteCount([string]$body) }
        }
    }
}

function Assert-SignedUrl {
    param(
        [Parameter(Mandatory = $true)]$SignedUrl,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ([string]::IsNullOrWhiteSpace([string]$SignedUrl.url)) {
        throw "$Name failed: url is empty"
    }
    if ([string]::IsNullOrWhiteSpace([string]$SignedUrl.fileName)) {
        throw "$Name failed: fileName is empty"
    }
    if ([string]::IsNullOrWhiteSpace([string]$SignedUrl.contentType)) {
        throw "$Name failed: contentType is empty"
    }
    if ([string]::IsNullOrWhiteSpace([string]$SignedUrl.expiresAt)) {
        throw "$Name failed: expiresAt is empty"
    }
}

function Test-SignedUrlLike {
    param([string]$Url)

    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $false
    }

    return $Url -match '[?&](OSSAccessKeyId|Signature|Expires|x-oss-signature|x-oss-credential|X-Amz-Signature)='
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

function Get-BareOssCandidateFromAsset {
    param($Asset)

    if ($null -eq $Asset) {
        return $null
    }

    $propertyNames = @('fileUrl', 'url', 'ossUrl', 'rawUrl', 'sourceUrl')
    foreach ($propertyName in $propertyNames) {
        if ($Asset.PSObject.Properties.Match($propertyName).Count -gt 0) {
            $candidate = [string]$Asset.$propertyName
            if (-not [string]::IsNullOrWhiteSpace($candidate) -and $candidate -match 'oss-[a-z0-9-]+\.aliyuncs\.com') {
                return $candidate
            }
        }
    }

    return $null
}

function Format-ProbeUrl {
    param([string]$Url)

    try {
        $uri = [uri]$Url
        return "$($uri.Scheme)://$($uri.Host)$($uri.AbsolutePath)"
    } catch {
        if ($Url.Length -gt 160) {
            return $Url.Substring(0, 160) + '...'
        }
        return $Url
    }
}

function Assert-BareOssBlocked {
    param([Parameter(Mandatory = $true)][string]$Url)

    if (Test-SignedUrlLike -Url $Url) {
        throw 'bare-oss failed: BareOssUrl looks like a signed URL; pass the raw OSS object URL without query parameters'
    }
    if (-not (Test-AliyunOssBareObjectUrl -Url $Url)) {
        throw 'bare-oss failed: BareOssUrl is not an HTTPS Aliyun OSS object URL'
    }

    $probeUrl = Format-ProbeUrl -Url $Url
    $response = Invoke-ProbeRequest -Method 'GET' -Url $Url
    $statusCode = [int]$response.StatusCode
    $body = Get-ResponseText $response

    if ($statusCode -ne 403) {
        $kind = 'unknown'
        if ($body -match '^\s*\{') {
            $kind = 'json'
        } elseif ($body -match '^\s*<') {
            $kind = 'xml/html'
        } elseif ([string]::IsNullOrWhiteSpace($body)) {
            $kind = 'empty'
        }
        throw "bare-oss failed: expected 403 for private OSS object, got status=$statusCode, bodyKind=$kind, url=$probeUrl, body=$(Format-ResponseSnippet $body)"
    }

    Write-Host "bare-oss: blocked status=403 url=$probeUrl"
}

function Assert-ImageStreamResponse {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Url
    )

    $statusCode = [int]$Response.StatusCode
    $contentType = Get-HeaderValue -Headers $Response.Headers -Name 'Content-Type'
    $contentDisposition = Get-HeaderValue -Headers $Response.Headers -Name 'Content-Disposition'
    $length = 0
    if ($Response.PSObject.Properties.Match('RawContentLength').Count -gt 0) {
        $length = [int64]$Response.RawContentLength
    } elseif ($Response.Content -is [byte[]]) {
        $length = [int64]$Response.Content.Length
    } elseif ($null -ne $Response.Content) {
        $length = ([string]$Response.Content).Length
    }

    if ($statusCode -ne 200) {
        $body = Get-ResponseText $Response
        $kind = 'unknown'
        if ($body -match '^\s*\{') {
            $kind = 'json'
        } elseif ($body -match '<html|页面不存在|normalize\.css') {
            $kind = 'html'
        } elseif ([string]::IsNullOrWhiteSpace($body)) {
            $kind = 'empty'
        }
        throw "GET $Url failed: status=$statusCode, bodyKind=$kind, contentType=$contentType, body=$(Format-ResponseSnippet $body)"
    }

    if ([string]::IsNullOrWhiteSpace($contentType) -or -not $contentType.StartsWith('image/', [StringComparison]::OrdinalIgnoreCase)) {
        throw "GET $Url failed: expected image/* Content-Type, got '$contentType'"
    }

    if ([string]::IsNullOrWhiteSpace($contentDisposition)) {
        throw "GET $Url failed: Content-Disposition is missing"
    }

    if ($length -le 0) {
        throw "GET $Url failed: image stream body is empty"
    }

    return @{
        StatusCode = $statusCode
        ContentType = $contentType
        ContentDisposition = $contentDisposition
        Length = $length
    }
}

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Headers = @{},
        $Body = $null
    )

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        ContentType = 'application/json'
    }

    if ($null -ne $Body) {
        $params.Body = ConvertTo-JsonBody $Body
    }

    try {
        return Invoke-RestMethod @params
    } catch {
        $status = Get-HttpStatusFromError $_
        $message = Get-ErrorMessage $_
        if ($message -match '<html|页面不存在|normalize\.css') {
            $message = 'received HTML page instead of JSON; check BaseUrl API prefix or reverse proxy'
        }
        throw "$Method $Url failed: status=$status, $message"
    }
}

$root = $BaseUrl.TrimEnd('/')
$photoSmokeMode = 'explicit'

if ($PreviewAccount) {
    $photoSmokeMode = 'preview-empty'
    $Phone = '13900001111'
    $AccessCode = 'PREVIEW-20260608'
    $AlbumId = ''
    $AllowEmptyAlbum = $true
    $SkipStream = $true
}

if ([string]::IsNullOrWhiteSpace($Phone)) {
    throw 'Phone is required unless -PreviewAccount is used'
}
if ([string]::IsNullOrWhiteSpace($AccessCode)) {
    throw 'AccessCode is required unless -PreviewAccount is used'
}

Write-Host "photo pickup smoke"
Write-Host "baseUrl: $root"
Write-Host "photo smoke mode: $photoSmokeMode"

if ($root -match 'api\.evanshine\.me' -and $Phone -eq '13800003333' -and $AccessCode -eq 'PICK-202606-001' -and $AlbumId -eq '903001') {
    Write-Warning 'public api smoke is using local demo account defaults. Current public preview account is 13900001111 / PREVIEW-20260608; for empty preview album use: .\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13900001111 -AccessCode PREVIEW-20260608 -AllowEmptyAlbum -SkipStream'
}

$authBody = @{
    phone = $Phone
    code = $AccessCode
    platform = $Platform
}
$authResponse = Invoke-JsonRequest -Method 'POST' -Url (Join-ApiUrl $root '/client/photo/auth/verify') -Body $authBody
Assert-RuoyiSuccess -Response $authResponse -Name 'auth'
$authData = Get-Data $authResponse
$clientToken = [string]$authData.clientToken
if ([string]::IsNullOrWhiteSpace($clientToken)) {
    throw 'auth failed: clientToken is empty'
}
Write-Host "auth: success ($(Format-Token $clientToken))"

$headers = @{
    'X-Client-Token' = $clientToken
}

$albumsResponse = Invoke-JsonRequest -Method 'GET' -Url (Join-ApiUrl $root '/client/photo/albums') -Headers $headers
Assert-RuoyiSuccess -Response $albumsResponse -Name 'albums'
$albums = @(Get-Data $albumsResponse)
Write-Host "albums: success count=$($albums.Count)"
if ($albums.Count -le 0) {
    throw 'albums failed: no accessible albums'
}

$targetAlbumId = [string]$AlbumId
if ([string]::IsNullOrWhiteSpace($targetAlbumId)) {
    $targetAlbumId = [string]$albums[0].albumId
    if ([string]::IsNullOrWhiteSpace($targetAlbumId)) {
        throw 'albums failed: first albumId is empty'
    }
    Write-Host "albums: selected first albumId=$targetAlbumId"
}
$albumPathId = [uri]::EscapeDataString($targetAlbumId)

$detailResponse = Invoke-JsonRequest -Method 'GET' -Url (Join-ApiUrl $root "/client/photo/albums/$albumPathId") -Headers $headers
Assert-RuoyiSuccess -Response $detailResponse -Name 'detail'
$detail = Get-Data $detailResponse
$assets = @()
if ($null -ne $detail.assets) {
    $assets = @($detail.assets)
}
Write-Host "detail: success albumId=$($detail.albumId), assetCount=$($assets.Count)"

if ($assets.Count -le 0 -and [string]::IsNullOrWhiteSpace($AssetId) -and $AllowEmptyAlbum) {
    Write-Host 'detail: empty album accepted'
    exit 0
}
if ($assets.Count -le 0 -and [string]::IsNullOrWhiteSpace($AssetId)) {
    throw 'detail failed: no visible assets available and AssetId was not provided'
}

$targetAssetId = if ([string]::IsNullOrWhiteSpace($AssetId)) { [string]$assets[0].assetId } else { [string]$AssetId }
if ([string]::IsNullOrWhiteSpace($targetAssetId)) {
    throw 'detail failed: target assetId is empty'
}

$selectedAsset = $null
foreach ($asset in $assets) {
    if ([string]$asset.assetId -eq $targetAssetId) {
        $selectedAsset = $asset
        break
    }
}

$assetPathId = [uri]::EscapeDataString($targetAssetId)
$thumbnailResponse = Invoke-JsonRequest -Method 'GET' -Url (Join-ApiUrl $root "/client/photo/assets/$assetPathId/thumbnail-url") -Headers $headers
Assert-RuoyiSuccess -Response $thumbnailResponse -Name 'thumbnail-url'
$thumbnail = Get-Data $thumbnailResponse
Assert-SignedUrl -SignedUrl $thumbnail -Name 'thumbnail-url'
Write-Host "thumbnail-url: success assetId=$($thumbnail.assetId), fileName=$($thumbnail.fileName), contentType=$($thumbnail.contentType), expiresAt=$($thumbnail.expiresAt)"

$previewResponse = Invoke-JsonRequest -Method 'GET' -Url (Join-ApiUrl $root "/client/photo/assets/$assetPathId/preview-url") -Headers $headers
Assert-RuoyiSuccess -Response $previewResponse -Name 'preview-url'
$preview = Get-Data $previewResponse
Assert-SignedUrl -SignedUrl $preview -Name 'preview-url'
Write-Host "preview-url: success assetId=$($preview.assetId), fileName=$($preview.fileName), contentType=$($preview.contentType), expiresAt=$($preview.expiresAt)"

$downloadResponse = Invoke-JsonRequest -Method 'GET' -Url (Join-ApiUrl $root "/client/photo/assets/$assetPathId/download-url") -Headers $headers
Assert-RuoyiSuccess -Response $downloadResponse -Name 'download-url'
$download = Get-Data $downloadResponse
Assert-SignedUrl -SignedUrl $download -Name 'download-url'
Write-Host "download-url: success assetId=$($download.assetId), fileName=$($download.fileName), contentType=$($download.contentType), expiresAt=$($download.expiresAt)"

$bareOssCandidate = $BareOssUrl
if ([string]::IsNullOrWhiteSpace($bareOssCandidate) -and $VerifyBareOssBlocked) {
    $bareOssCandidate = Get-BareOssCandidateFromAsset -Asset $selectedAsset
}
if (-not [string]::IsNullOrWhiteSpace($bareOssCandidate)) {
    Assert-BareOssBlocked -Url $bareOssCandidate
} elseif ($VerifyBareOssBlocked) {
    Write-Host 'bare-oss: skipped (pass -BareOssUrl with a raw OSS object URL to verify private bucket blocking)'
}

if ($SkipStream) {
    Write-Host 'stream: skipped'
    exit 0
}

$streamUrl = Join-ApiUrl $root "/client/photo/assets/$assetPathId/stream"
$streamResponse = Invoke-RawRequest -Method 'GET' -Url $streamUrl -Headers $headers
$stream = Assert-ImageStreamResponse -Response $streamResponse -Url $streamUrl
Write-Host "stream: success status=$($stream.StatusCode), contentType=$($stream.ContentType), contentDisposition=$($stream.ContentDisposition), bytes=$($stream.Length)"
