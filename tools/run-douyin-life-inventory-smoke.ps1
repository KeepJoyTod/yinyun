[CmdletBinding()]
param(
    [string]$EnvFile,
    [string]$BaseUrl = $env:DOUYIN_LIFE_BASE_URL,
    [string]$ClientKey = $env:DOUYIN_LIFE_CLIENT_KEY,
    [string]$ClientSecret = $env:DOUYIN_LIFE_CLIENT_SECRET,
    [string]$AccountId = $env:DOUYIN_LIFE_ACCOUNT_ID,
    [string]$PoiId = $env:DOUYIN_LIFE_POI_ID,
    [string]$StoreId = $env:DOUYIN_LIFE_STORE_ID,
    [string]$SkuId = $env:DOUYIN_LIFE_SKU_ID,
    [string]$SkuOutId = $env:DOUYIN_LIFE_SKU_OUT_ID,
    [string]$SkuName = $env:DOUYIN_LIFE_SKU_NAME,
    [string]$ReceptionUnitId = $env:DOUYIN_LIFE_RECEPTION_UNIT_ID,
    [int]$SkuOperateType = 1,
    [string]$Date = (Get-Date).ToString('yyyy-MM-dd'),
    [string]$StartTime = '10:00',
    [string]$EndTime = '10:30',
    [int]$Stock = 6,
    [int]$TimeSlot = 30,
    [switch]$UseTestDataHeader,
    [switch]$ShowRaw
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($EnvFile)) {
    $EnvFile = Join-Path $PSScriptRoot '..\backend\.env.local'
}

if (Test-Path -LiteralPath $EnvFile) {
    Get-Content -LiteralPath $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }
        $index = $line.IndexOf('=')
        if ($index -le 0) {
            return
        }
        [Environment]::SetEnvironmentVariable($line.Substring(0, $index).Trim(), $line.Substring($index + 1).Trim(), 'Process')
    }
}

$scriptBoundParameters = @{} + $PSBoundParameters

function Resolve-EnvParam {
    param(
        [string]$ParamName,
        [string]$CurrentValue,
        [string]$EnvName
    )
    if ($scriptBoundParameters.ContainsKey($ParamName)) {
        return $CurrentValue
    }
    $envValue = [Environment]::GetEnvironmentVariable($EnvName, 'Process')
    if ([string]::IsNullOrWhiteSpace($envValue)) {
        return $CurrentValue
    }
    return $envValue
}

$BaseUrl = Resolve-EnvParam -ParamName 'BaseUrl' -CurrentValue $BaseUrl -EnvName 'DOUYIN_LIFE_BASE_URL'
$ClientKey = Resolve-EnvParam -ParamName 'ClientKey' -CurrentValue $ClientKey -EnvName 'DOUYIN_LIFE_CLIENT_KEY'
$ClientSecret = Resolve-EnvParam -ParamName 'ClientSecret' -CurrentValue $ClientSecret -EnvName 'DOUYIN_LIFE_CLIENT_SECRET'
$AccountId = Resolve-EnvParam -ParamName 'AccountId' -CurrentValue $AccountId -EnvName 'DOUYIN_LIFE_ACCOUNT_ID'
$PoiId = Resolve-EnvParam -ParamName 'PoiId' -CurrentValue $PoiId -EnvName 'DOUYIN_LIFE_POI_ID'
$StoreId = Resolve-EnvParam -ParamName 'StoreId' -CurrentValue $StoreId -EnvName 'DOUYIN_LIFE_STORE_ID'
$SkuId = Resolve-EnvParam -ParamName 'SkuId' -CurrentValue $SkuId -EnvName 'DOUYIN_LIFE_SKU_ID'
$SkuOutId = Resolve-EnvParam -ParamName 'SkuOutId' -CurrentValue $SkuOutId -EnvName 'DOUYIN_LIFE_SKU_OUT_ID'
$SkuName = Resolve-EnvParam -ParamName 'SkuName' -CurrentValue $SkuName -EnvName 'DOUYIN_LIFE_SKU_NAME'
$ReceptionUnitId = Resolve-EnvParam -ParamName 'ReceptionUnitId' -CurrentValue $ReceptionUnitId -EnvName 'DOUYIN_LIFE_RECEPTION_UNIT_ID'
if ([string]::IsNullOrWhiteSpace($BaseUrl)) { $BaseUrl = 'https://open.douyin.com' }
$BaseUrl = $BaseUrl.TrimEnd('/')
if ([string]::IsNullOrWhiteSpace($PoiId)) { $PoiId = $StoreId }
if ([string]::IsNullOrWhiteSpace($ReceptionUnitId)) { $ReceptionUnitId = $SkuId }

function Require-Value {
    param([string]$Name, [string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        throw "Missing required env/param: $Name"
    }
}

function Test-MeaningfulScalar {
    param($Value)
    if ($null -eq $Value) {
        return $false
    }
    if ($Value -is [string]) {
        return -not [string]::IsNullOrWhiteSpace($Value)
    }
    return $true
}

function ConvertFrom-JsonCompat {
    param(
        [Parameter(Mandatory = $true)][string]$Json
    )
    $preparedJson = $Json
    if ($preparedJson -match '"Extra"\s*:' -and $preparedJson -match '"extra"\s*:') {
        $preparedJson = [regex]::Replace($preparedJson, '"Extra"\s*:', '"__upper_extra__":')
    }
    try {
        return ($preparedJson | ConvertFrom-Json)
    }
    catch {
        try {
            Add-Type -AssemblyName System.Web.Extensions -ErrorAction Stop | Out-Null
            $serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
            $serializer.MaxJsonLength = [int]::MaxValue
            return $serializer.DeserializeObject($preparedJson)
        }
        catch {
            return $null
        }
    }
}

function Convert-ToNormalizedJsonNode {
    param($Value)
    if ($null -eq $Value) {
        return $null
    }
    if ($Value -is [string]) {
        $trimmed = $Value.Trim()
        if (
            ($trimmed.StartsWith('{') -and $trimmed.EndsWith('}')) -or
            ($trimmed.StartsWith('[') -and $trimmed.EndsWith(']')) -or
            ($trimmed.StartsWith('"') -and $trimmed.EndsWith('"'))
        ) {
            $parsed = ConvertFrom-JsonCompat -Json $trimmed
            if ($null -ne $parsed) {
                return Convert-ToNormalizedJsonNode -Value $parsed
            }
        }
        return $Value
    }
    if ($Value -is [System.Collections.IDictionary]) {
        $result = [ordered]@{}
        foreach ($key in $Value.Keys) {
            $result[[string]$key] = Convert-ToNormalizedJsonNode -Value $Value[$key]
        }
        return [pscustomobject]$result
    }
    if ($Value -is [System.Array]) {
        return @(
            foreach ($item in $Value) {
                Convert-ToNormalizedJsonNode -Value $item
            }
        )
    }
    if ($Value -is [pscustomobject]) {
        $result = [ordered]@{}
        foreach ($property in $Value.PSObject.Properties) {
            $result[$property.Name] = Convert-ToNormalizedJsonNode -Value $property.Value
        }
        return [pscustomobject]$result
    }
    if (($Value -is [System.Collections.IEnumerable]) -and -not ($Value -is [string])) {
        return @(
            foreach ($item in $Value) {
                Convert-ToNormalizedJsonNode -Value $item
            }
        )
    }
    return $Value
}

function Find-JsonValue {
    param(
        [Parameter(Mandatory = $true)]$Node,
        [Parameter(Mandatory = $true)][string[]]$Names
    )
    return Find-JsonValueInternal -Node (Convert-ToNormalizedJsonNode -Value $Node) -Names $Names
}

function Get-JsonChildValue {
    param(
        [Parameter(Mandatory = $true)]$Node,
        [Parameter(Mandatory = $true)][string]$Name
    )
    if ($null -eq $Node) {
        return $null
    }
    if ($Node -is [System.Collections.IDictionary]) {
        foreach ($key in $Node.Keys) {
            if ([string]$key -ceq $Name) {
                return $Node[$key]
            }
        }
        foreach ($key in $Node.Keys) {
            if ([string]::Equals([string]$key, $Name, [System.StringComparison]::OrdinalIgnoreCase)) {
                return $Node[$key]
            }
        }
        return $null
    }
    if ($Node -is [pscustomobject]) {
        foreach ($property in $Node.PSObject.Properties) {
            if ($property.Name -ceq $Name) {
                return $property.Value
            }
        }
        foreach ($property in $Node.PSObject.Properties) {
            if ([string]::Equals($property.Name, $Name, [System.StringComparison]::OrdinalIgnoreCase)) {
                return $property.Value
            }
        }
        return $null
    }
    return $null
}

function Find-JsonValueByPath {
    param(
        [Parameter(Mandatory = $true)]$Node,
        [Parameter(Mandatory = $true)][string[]]$Path
    )
    $current = Convert-ToNormalizedJsonNode -Value $Node
    foreach ($segment in $Path) {
        $current = Get-JsonChildValue -Node $current -Name $segment
        if ($null -eq $current) {
            return $null
        }
    }
    if (Test-MeaningfulScalar -Value $current) {
        return $current
    }
    return $null
}

function Find-JsonValueInternal {
    param(
        [Parameter(Mandatory = $true)]$Node,
        [Parameter(Mandatory = $true)][string[]]$Names
    )
    if ($null -eq $Node) { return $null }
    if (($Node -is [System.Array]) -or (($Node -is [System.Collections.IEnumerable]) -and -not ($Node -is [string]) -and -not ($Node -is [pscustomobject]) -and -not ($Node -is [System.Collections.IDictionary]))) {
        foreach ($item in $Node) {
            $found = Find-JsonValueInternal -Node $item -Names $Names
            if ($null -ne $found) { return $found }
        }
        return $null
    }
    if ($Node -is [System.Collections.IDictionary]) {
        foreach ($key in $Node.Keys) {
            $value = $Node[$key]
            if (($Names -contains [string]$key) -and (Test-MeaningfulScalar -Value $value)) {
                return $value
            }
        }
        foreach ($key in $Node.Keys) {
            $found = Find-JsonValueInternal -Node $Node[$key] -Names $Names
            if ($null -ne $found) { return $found }
        }
        return $null
    }
    if ($Node -is [pscustomobject]) {
        foreach ($property in $Node.PSObject.Properties) {
            if (($Names -contains $property.Name) -and (Test-MeaningfulScalar -Value $property.Value)) {
                return $property.Value
            }
        }
        foreach ($property in $Node.PSObject.Properties) {
            $found = Find-JsonValueInternal -Node $property.Value -Names $Names
            if ($null -ne $found) { return $found }
        }
    }
    return $null
}

function Write-Step {
    param([string]$Text)
    Write-Host ''
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Write-RedactedJson {
    param([Parameter(Mandatory = $true)]$Value)
    (Convert-ToNormalizedJsonNode -Value $Value) |
        ConvertTo-Json -Depth 16 |
        ForEach-Object {
            $_ -replace '(?i)("(?:client_access_token|access_token|refresh_token|client_secret|open_id|mobile|phone|encrypt_mobile)"\s*:\s*")[^"]+(")', '$1***$2'
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
    Convert-ToNormalizedJsonNode -Value (Invoke-RestMethod @request)
}

function Write-ApiSummary {
    param(
        [string]$Name,
        [Parameter(Mandatory = $true)]$Response
    )
    $normalized = Convert-ToNormalizedJsonNode -Value $Response
    $resolvedErrNo =
        (Find-JsonValueByPath -Node $normalized -Path @('err_no')),
        (Find-JsonValueByPath -Node $normalized -Path @('code')),
        (Find-JsonValueByPath -Node $normalized -Path @('__upper_extra__', 'error_code')),
        (Find-JsonValueByPath -Node $normalized -Path @('Extra', 'error_code')),
        (Find-JsonValueByPath -Node $normalized -Path @('extra', 'error_code')),
        (Find-JsonValueByPath -Node $normalized -Path @('data', 'error_code')),
        (Find-JsonValue -Node $normalized -Names @('error_code')) |
        Where-Object { $null -ne $_ } |
        Select-Object -First 1
    $resolvedMessage =
        (Find-JsonValueByPath -Node $normalized -Path @('message')),
        (Find-JsonValueByPath -Node $normalized -Path @('errmsg')),
        (Find-JsonValueByPath -Node $normalized -Path @('__upper_extra__', 'description')),
        (Find-JsonValueByPath -Node $normalized -Path @('Extra', 'description')),
        (Find-JsonValueByPath -Node $normalized -Path @('extra', 'description')),
        (Find-JsonValueByPath -Node $normalized -Path @('data', 'description')),
        (Find-JsonValue -Node $normalized -Names @('description')) |
        Where-Object { Test-MeaningfulScalar -Value $_ } |
        Select-Object -First 1
    $resolvedLogId =
        (Find-JsonValueByPath -Node $normalized -Path @('logid')),
        (Find-JsonValueByPath -Node $normalized -Path @('log_id')),
        (Find-JsonValueByPath -Node $normalized -Path @('extra', 'logid')),
        (Find-JsonValueByPath -Node $normalized -Path @('__upper_extra__', 'logid')),
        (Find-JsonValueByPath -Node $normalized -Path @('Extra', 'logid')),
        (Find-JsonValue -Node $normalized -Names @('logid', 'log_id')) |
        Where-Object { Test-MeaningfulScalar -Value $_ } |
        Select-Object -First 1

    [pscustomobject]@{
        Api = $Name
        ErrNo = $resolvedErrNo
        Message = $resolvedMessage
        LogId = $resolvedLogId
        HasData = $null -ne (Find-JsonValueByPath -Node $normalized -Path @('data'))
    } | Format-List
    if ($ShowRaw) {
        Write-RedactedJson -Value $normalized
    }
}

function Resolve-NumericOrText {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $Value
    }
    if ($Value -match '^\d+$') {
        return [long]$Value
    }
    return $Value
}

function Get-DouyinWeekValue {
    param([string]$Value)
    try {
        $dateValue = [datetime]::ParseExact($Value, 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture)
        $day = [int]$dateValue.DayOfWeek
        if ($day -eq 0) { return 7 }
        return $day
    } catch {
        return 1
    }
}

Require-Value -Name 'DOUYIN_LIFE_CLIENT_KEY' -Value $ClientKey
Require-Value -Name 'DOUYIN_LIFE_CLIENT_SECRET' -Value $ClientSecret
Require-Value -Name 'DOUYIN_LIFE_ACCOUNT_ID' -Value $AccountId
Require-Value -Name 'DOUYIN_LIFE_POI_ID' -Value $PoiId
Require-Value -Name 'DOUYIN_LIFE_SKU_ID or DOUYIN_LIFE_SKU_OUT_ID' -Value ([string]::Join('', @($SkuId, $SkuOutId)))

Write-Step 'client_token'
$tokenResponse = Invoke-DouyinJson -Method 'POST' -Path '/oauth/client_token/' -Body @{
    client_key = $ClientKey
    client_secret = $ClientSecret
    grant_type = 'client_credential'
}
$clientAccessToken = Find-JsonValue -Node $tokenResponse -Names @('client_access_token', 'access_token')
Write-ApiSummary -Name 'client_token' -Response $tokenResponse
if ([string]::IsNullOrWhiteSpace([string]$clientAccessToken)) {
    throw 'client_token did not return client_access_token/access_token'
}

$headers = @{
    'access-token' = [string]$clientAccessToken
    'Rpc-Transit-Life-Account' = $AccountId
}
if ($UseTestDataHeader) {
    $headers['Rpc-Persist-Life-Test-Data-Access'] = 'all'
}

$skuInfo = @{}
if (-not [string]::IsNullOrWhiteSpace($SkuId)) { $skuInfo.sku_id = $SkuId }
if (-not [string]::IsNullOrWhiteSpace($SkuOutId)) { $skuInfo.sku_out_id = $SkuOutId }
if ([string]::IsNullOrWhiteSpace($SkuName)) { $SkuName = '证件照预约' }
$skuInfo.sku_name = $SkuName
$skuInfo.sku_operate_type = $SkuOperateType

Write-Step 'inventory sku upsert'
$skuResponse = Invoke-DouyinJson `
    -Method 'POST' `
    -Path "/goodlife/v1/goods/comprehensive/reception/stock/sku/upsert/?account_id=$([uri]::EscapeDataString($AccountId))" `
    -Headers $headers `
    -Body @{
        poi_id = $PoiId
        time_slot = $TimeSlot
        sku_info_list = @($skuInfo)
    }

Write-ApiSummary -Name 'life_inventory_sku_upsert' -Response $skuResponse

$stockSku = @{}
if (-not [string]::IsNullOrWhiteSpace($SkuId)) { $stockSku.sku_id = $SkuId }
if (-not [string]::IsNullOrWhiteSpace($SkuOutId)) { $stockSku.sku_out_id = $SkuOutId }
$stockSku.real_time_stock_list = @(@{
    date = $Date
    start_time = $StartTime
    end_time = $EndTime
    available_stock = $Stock
})

Write-Step 'realtime stock save'
$stockResponse = Invoke-DouyinJson `
    -Method 'POST' `
    -Path "/goodlife/v1/goods/comprehensive/reception/save/stock/?account_id=$([uri]::EscapeDataString($AccountId))" `
    -Headers $headers `
    -Body @{
        poi_id = $PoiId
        sku_real_time_stock_list = @($stockSku)
    }

Write-ApiSummary -Name 'life_reception_stock_save' -Response $stockResponse

Write-Step 'stock update trigger'
$triggerResponse = Invoke-DouyinJson `
    -Method 'POST' `
    -Path "/goodlife/v1/goods/comprehensive/reception/trigger/stock/?account_id=$([uri]::EscapeDataString($AccountId))" `
    -Headers $headers `
    -Body @{
        poi_id = $PoiId
        start_date = $Date
        end_date = $Date
        sku_info_struct_list = @($skuInfo)
    }

Write-ApiSummary -Name 'life_reception_stock_trigger' -Response $triggerResponse

if (-not [string]::IsNullOrWhiteSpace($ReceptionUnitId)) {
    Write-Step 'time stock save'
    $timeSaveResponse = Invoke-DouyinJson `
        -Method 'POST' `
        -Path "/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/save/?account_id=$([uri]::EscapeDataString($AccountId))" `
        -Headers $headers `
        -Body @{
            account_id = $AccountId
            poi_id = $PoiId
            room_time_rules = @(@{
                room_id = Resolve-NumericOrText -Value $ReceptionUnitId
                time_rules = @(@{
                    rule_type = 1
                    date_range = @($Date, $Date)
                    week_range = Get-DouyinWeekValue -Value $Date
                    time_range = @($StartTime, $EndTime)
                    stock = $Stock
                })
            })
        }

    Write-ApiSummary -Name 'life_time_stock_save' -Response $timeSaveResponse
}

Write-Step 'time stock get'
$timeGetResponse = Invoke-DouyinJson `
    -Method 'GET' `
    -Path "/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/get/?account_id=$([uri]::EscapeDataString($AccountId))&poi_id=$([uri]::EscapeDataString($PoiId))" `
    -Headers $headers
Write-ApiSummary -Name 'life_time_stock_get' -Response $timeGetResponse
