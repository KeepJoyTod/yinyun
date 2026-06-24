[CmdletBinding()]
param(
    [string]$BaseUrl = $env:DOUYIN_BASE_URL,
    [string]$ClientKey = $env:DOUYIN_CLIENT_KEY,
    [string]$ClientSecret = $env:DOUYIN_CLIENT_SECRET,
    [string]$OpenId = $env:DOUYIN_TEST_OPEN_ID,
    [string]$ServiceId = $env:DOUYIN_SERVICE_ID,
    [string]$ServiceModeId = $env:DOUYIN_SERVICE_MODE_ID,
    [switch]$ShowRaw
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
    $BaseUrl = 'https://open-sandbox.douyin.com'
}
$BaseUrl = $BaseUrl.TrimEnd('/')

function Require-Value {
    param(
        [string]$Name,
        [string]$Value
    )
    if ([string]::IsNullOrWhiteSpace($Value)) {
        throw "Missing required env/param: $Name"
    }
}

function Find-JsonValue {
    param(
        [Parameter(Mandatory = $true)]$Node,
        [Parameter(Mandatory = $true)][string[]]$Names
    )

    if ($null -eq $Node) {
        return $null
    }

    if ($Node -is [System.Array]) {
        foreach ($item in $Node) {
            $found = Find-JsonValue -Node $item -Names $Names
            if ($null -ne $found) {
                return $found
            }
        }
        return $null
    }

    if ($Node -is [pscustomobject]) {
        foreach ($property in $Node.PSObject.Properties) {
            if ($Names -contains $property.Name) {
                return $property.Value
            }
        }
        foreach ($property in $Node.PSObject.Properties) {
            $found = Find-JsonValue -Node $property.Value -Names $Names
            if ($null -ne $found) {
                return $found
            }
        }
    }

    return $null
}

function Invoke-DouyinJson {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body
    )

    $uri = "$BaseUrl$Path"
    $request = @{
        Method = $Method
        Uri = $uri
        Headers = $Headers
        TimeoutSec = 30
    }
    if ($null -ne $Body) {
        $request.ContentType = 'application/json'
        $request.Body = ($Body | ConvertTo-Json -Depth 8)
    }
    Invoke-RestMethod @request
}

function Write-Step {
    param([string]$Text)
    Write-Host ""
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Write-RedactedJson {
    param([Parameter(Mandatory = $true)]$Value)

    $Value |
        ConvertTo-Json -Depth 12 |
        ForEach-Object {
            $_ -replace '(?i)("(?:client_access_token|access_token|refresh_token|client_secret|open_id)"\s*:\s*")[^"]+(")', '$1***$2'
        }
}

Require-Value -Name 'DOUYIN_CLIENT_KEY' -Value $ClientKey
Require-Value -Name 'DOUYIN_CLIENT_SECRET' -Value $ClientSecret

Write-Step "client_token"
$tokenResponse = Invoke-DouyinJson -Method 'POST' -Path '/oauth/client_token/' -Body @{
    client_key = $ClientKey
    client_secret = $ClientSecret
    grant_type = 'client_credential'
}

$clientAccessToken = Find-JsonValue -Node $tokenResponse -Names @('client_access_token', 'access_token')
$expiresIn = Find-JsonValue -Node $tokenResponse -Names @('expires_in')
$errNo = Find-JsonValue -Node $tokenResponse -Names @('err_no', 'code')
$message = Find-JsonValue -Node $tokenResponse -Names @('message', 'errmsg', 'description')

[pscustomobject]@{
    BaseUrl = $BaseUrl
    Success = -not [string]::IsNullOrWhiteSpace([string]$clientAccessToken)
    ErrNo = $errNo
    Message = $message
    ExpiresIn = $expiresIn
    TokenRedacted = if ([string]::IsNullOrWhiteSpace([string]$clientAccessToken)) { $null } else { '***' }
} | Format-List

if ($ShowRaw) {
    Write-RedactedJson -Value $tokenResponse
}

if ([string]::IsNullOrWhiteSpace([string]$clientAccessToken)) {
    throw 'client_token did not return client_access_token/access_token'
}

$hasPurchaseParams = -not [string]::IsNullOrWhiteSpace($OpenId) `
    -and -not [string]::IsNullOrWhiteSpace($ServiceId) `
    -and -not [string]::IsNullOrWhiteSpace($ServiceModeId)

if (-not $hasPurchaseParams) {
    Write-Host "Skip service-status and purchase-list: set DOUYIN_TEST_OPEN_ID, DOUYIN_SERVICE_ID, DOUYIN_SERVICE_MODE_ID first." -ForegroundColor Yellow
    exit 0
}

$query = "open_id=$([uri]::EscapeDataString($OpenId))&service_id=$([uri]::EscapeDataString($ServiceId))&service_mode_id=$([uri]::EscapeDataString($ServiceModeId))"
$authHeaders = @{ 'access-token' = [string]$clientAccessToken }

Write-Step "service-status"
$statusResponse = Invoke-DouyinJson -Method 'GET' -Path "/aweme/v2/creator/service_market/user/service/status?$query" -Headers $authHeaders
if ($ShowRaw) {
    Write-RedactedJson -Value $statusResponse
} else {
    [pscustomobject]@{
        ErrNo = Find-JsonValue -Node $statusResponse -Names @('err_no', 'code')
        Message = Find-JsonValue -Node $statusResponse -Names @('message', 'errmsg', 'description')
        HasData = $null -ne (Find-JsonValue -Node $statusResponse -Names @('data'))
    } | Format-List
}

Write-Step "purchase-list"
$purchaseResponse = Invoke-DouyinJson -Method 'GET' -Path "/market/service/user/purchase/list/?$query" -Headers $authHeaders
if ($ShowRaw) {
    Write-RedactedJson -Value $purchaseResponse
} else {
    [pscustomobject]@{
        ErrNo = Find-JsonValue -Node $purchaseResponse -Names @('err_no', 'code')
        Message = Find-JsonValue -Node $purchaseResponse -Names @('message', 'errmsg', 'description')
        HasData = $null -ne (Find-JsonValue -Node $purchaseResponse -Names @('data'))
    } | Format-List
}
