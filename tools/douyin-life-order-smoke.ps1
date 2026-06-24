[CmdletBinding()]
param(
    [string]$BaseUrl = $env:DOUYIN_LIFE_BASE_URL,
    [string]$ClientKey = $env:DOUYIN_LIFE_CLIENT_KEY,
    [string]$ClientSecret = $env:DOUYIN_LIFE_CLIENT_SECRET,
    [string]$AccountId = $env:DOUYIN_LIFE_ACCOUNT_ID,
    [string]$OrderId = $env:DOUYIN_LIFE_ORDER_ID,
    [string]$OutOrderNo = $env:DOUYIN_LIFE_OUT_ORDER_NO,
    [string]$OpenId = $env:DOUYIN_LIFE_OPEN_ID,
    [string]$OrderStatus = $env:DOUYIN_LIFE_ORDER_STATUS,
    [string]$StartTime = $env:DOUYIN_LIFE_START_TIME,
    [string]$EndTime = $env:DOUYIN_LIFE_END_TIME,
    [int]$PageNum = 1,
    [int]$PageSize = 10,
    [switch]$UseTestDataHeader,
    [switch]$ShowRaw
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
    $BaseUrl = 'https://open.douyin.com'
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

function Write-RedactedJson {
    param([Parameter(Mandatory = $true)]$Value)

    $Value |
        ConvertTo-Json -Depth 16 |
        ForEach-Object {
            $_ `
                -replace '(?i)("(?:client_access_token|access_token|refresh_token|client_secret|open_id|mobile|phone|encrypt_mobile)"\s*:\s*")[^"]+(")', '$1***$2' `
                -replace '(?i)("authorization"\s*:\s*")[^"]+(")', '$1***$2'
        }
}

function Invoke-DouyinJson {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body
    )

    $request = @{
        Method = $Method
        Uri = "$BaseUrl$Path"
        Headers = $Headers
        TimeoutSec = 30
    }
    if ($null -ne $Body) {
        $request.ContentType = 'application/json'
        $request.Body = ($Body | ConvertTo-Json -Depth 12)
    }
    Invoke-RestMethod @request
}

function Add-Query {
    param(
        [System.Collections.Generic.List[string]]$Parts,
        [string]$Name,
        [string]$Value
    )
    if (-not [string]::IsNullOrWhiteSpace($Value)) {
        $Parts.Add("$Name=$([uri]::EscapeDataString($Value))")
    }
}

function Convert-ToDouyinOrderQueryTime {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }
    $text = $Value.Trim()
    if ($text -match '^\d{13}$') {
        return ([int64]([int64]$text / 1000)).ToString()
    }
    if ($text -match '^\d{10}$') {
        return $text
    }
    $parsed = [datetime]::MinValue
    if ([datetime]::TryParseExact(
        $text,
        'yyyy-MM-dd HH:mm:ss',
        [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::AssumeLocal,
        [ref]$parsed
    )) {
        return ([DateTimeOffset]$parsed).ToUnixTimeSeconds().ToString()
    }
    return $text
}

function Write-Step {
    param([string]$Text)
    Write-Host ""
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

Require-Value -Name 'DOUYIN_LIFE_CLIENT_KEY' -Value $ClientKey
Require-Value -Name 'DOUYIN_LIFE_CLIENT_SECRET' -Value $ClientSecret
Require-Value -Name 'DOUYIN_LIFE_ACCOUNT_ID' -Value $AccountId

Write-Step 'client_token'
$tokenResponse = Invoke-DouyinJson -Method 'POST' -Path '/oauth/client_token/' -Body @{
    client_key = $ClientKey
    client_secret = $ClientSecret
    grant_type = 'client_credential'
}

$clientAccessToken = Find-JsonValue -Node $tokenResponse -Names @('client_access_token', 'access_token')
$errNo = Find-JsonValue -Node $tokenResponse -Names @('err_no', 'code')
$message = Find-JsonValue -Node $tokenResponse -Names @('message', 'errmsg', 'description')
$expiresIn = Find-JsonValue -Node $tokenResponse -Names @('expires_in')

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

$hasOrderFilter = -not [string]::IsNullOrWhiteSpace($OrderId) `
    -or -not [string]::IsNullOrWhiteSpace($OutOrderNo) `
    -or -not [string]::IsNullOrWhiteSpace($OpenId) `
    -or -not [string]::IsNullOrWhiteSpace($OrderStatus) `
    -or -not [string]::IsNullOrWhiteSpace($StartTime) `
    -or -not [string]::IsNullOrWhiteSpace($EndTime)

if (-not $hasOrderFilter) {
    throw 'Set one of DOUYIN_LIFE_ORDER_ID, DOUYIN_LIFE_OUT_ORDER_NO, DOUYIN_LIFE_OPEN_ID, DOUYIN_LIFE_ORDER_STATUS, DOUYIN_LIFE_START_TIME, DOUYIN_LIFE_END_TIME before querying orders.'
}

$queryParts = [System.Collections.Generic.List[string]]::new()
Add-Query -Parts $queryParts -Name 'account_id' -Value $AccountId
Add-Query -Parts $queryParts -Name 'order_id' -Value $OrderId
Add-Query -Parts $queryParts -Name 'out_order_no' -Value $OutOrderNo
Add-Query -Parts $queryParts -Name 'open_id' -Value $OpenId
Add-Query -Parts $queryParts -Name 'order_status' -Value $OrderStatus
Add-Query -Parts $queryParts -Name 'create_order_start_time' -Value (Convert-ToDouyinOrderQueryTime -Value $StartTime)
Add-Query -Parts $queryParts -Name 'create_order_end_time' -Value (Convert-ToDouyinOrderQueryTime -Value $EndTime)
Add-Query -Parts $queryParts -Name 'page_num' -Value ([string]$PageNum)
Add-Query -Parts $queryParts -Name 'page_size' -Value ([string]$PageSize)
$query = [string]::Join('&', $queryParts)

$headers = @{
    'access-token' = [string]$clientAccessToken
    'Rpc-Transit-Life-Account' = $AccountId
}
if ($UseTestDataHeader) {
    $headers['Rpc-Persist-Life-Test-Data-Access'] = 'all'
}

Write-Step 'local-life order query'
$orderResponse = Invoke-DouyinJson -Method 'GET' -Path "/goodlife/v1/trade/order/query/?$query" -Headers $headers

if ($ShowRaw) {
    Write-RedactedJson -Value $orderResponse
} else {
    [pscustomobject]@{
        ErrNo = Find-JsonValue -Node $orderResponse -Names @('err_no', 'code')
        Message = Find-JsonValue -Node $orderResponse -Names @('message', 'errmsg', 'description')
        HasData = $null -ne (Find-JsonValue -Node $orderResponse -Names @('data'))
        FirstOrderStatus = Find-JsonValue -Node $orderResponse -Names @('order_status', 'status')
        FirstOrderId = Find-JsonValue -Node $orderResponse -Names @('order_id')
        FirstOutOrderNo = Find-JsonValue -Node $orderResponse -Names @('out_order_no')
    } | Format-List
}
