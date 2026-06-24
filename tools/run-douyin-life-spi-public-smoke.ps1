[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',
    [string]$Challenge = "yy-smoke-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())",
    [switch]$IncludeBusinessSpi,
    [switch]$ShowRaw
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Root = $BaseUrl.TrimEnd('/')

function Join-ApiUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )
    return $Root + '/' + $Path.TrimStart('/')
}

function ConvertTo-JsonBody {
    param([Parameter(Mandatory = $true)]$Value)
    return ($Value | ConvertTo-Json -Depth 12 -Compress)
}

function Invoke-SmokeJson {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Body,
        [hashtable]$Headers = @{}
    )

    $url = Join-ApiUrl -Path $Path
    $requestHeaders = @{
        'X-Bytedance-Logid' = "SMOKE-$Name-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
    }
    foreach ($key in $Headers.Keys) {
        $requestHeaders[$key] = $Headers[$key]
    }

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Headers $requestHeaders -Body (ConvertTo-JsonBody $Body) -UseBasicParsing -TimeoutSec 30
        $contentType = [string]($response.Headers['Content-Type'] -join ',')
        $isJson = $contentType -match 'application/json'
        $bodyText = [string]$response.Content
        [pscustomobject]@{
            Name = $Name
            Url = $url
            StatusCode = [int]$response.StatusCode
            Json = $isJson
            Result = if ($isJson) { 'OK' } else { 'NON_JSON' }
            Body = if ($ShowRaw) { $bodyText } elseif ($bodyText.Length -gt 180) { $bodyText.Substring(0, 180) + '...' } else { $bodyText }
        }
    } catch {
        $status = if ($_.Exception.Response -and $_.Exception.Response.StatusCode) { [int]$_.Exception.Response.StatusCode } else { 'unknown' }
        $message = [string]$_.ErrorDetails.Message
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = $_.Exception.Message
        }
        [pscustomobject]@{
            Name = $Name
            Url = $url
            StatusCode = $status
            Json = $false
            Result = 'FAILED'
            Body = $message
        }
    }
}

Write-Host "douyin life public SPI smoke"
Write-Host "baseUrl: $Root"

$results = [System.Collections.Generic.List[object]]::new()
$webhookResult = Invoke-SmokeJson -Name 'webhook-challenge' -Path '/api/douyin/life/webhook' -Body @{
    event = 'verify_webhook'
    content = @{
        challenge = $Challenge
    }
}
$results.Add($webhookResult)

if ($webhookResult.Result -eq 'OK' -and $webhookResult.Body -notmatch [regex]::Escape($Challenge)) {
    $results.Add([pscustomobject]@{
        Name = 'webhook-challenge-value'
        Url = Join-ApiUrl -Path '/api/douyin/life/webhook'
        StatusCode = $webhookResult.StatusCode
        Json = $webhookResult.Json
        Result = 'FAILED'
        Body = "response did not echo challenge: $Challenge"
    })
}

if ($IncludeBusinessSpi) {
    $smokeOrderId = "YY-SMOKE-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
    $businessCases = @(
        @{ Name = 'reservation-order-create'; Path = '/api/douyin/life/reservation/order-create'; Body = @{ order_id = $smokeOrderId; book_id = $smokeOrderId; third_order_id = $smokeOrderId; order_status = 'PAY_SUCCESS' } },
        @{ Name = 'reservation-pay-notify'; Path = '/api/douyin/life/reservation/pay-notify'; Body = @{ order_id = $smokeOrderId; third_order_id = $smokeOrderId; order_status = 'PAY_SUCCESS' } },
        @{ Name = 'reservation-order-query'; Path = '/api/douyin/life/reservation/order-query'; Body = @{ order_id = $smokeOrderId; third_order_id = $smokeOrderId } },
        @{ Name = 'reservation-stock-query'; Path = '/api/douyin/life/reservation/stock-query'; Body = @{ poi_id = 'YY-SMOKE-POI'; sku_id = 'YY-SMOKE-SKU'; date = (Get-Date).ToString('yyyy-MM-dd') } },
        @{ Name = 'voucher-revoke'; Path = '/api/douyin/life/voucher/revoke'; Body = @{ order_id = $smokeOrderId; certificate_id = 'YY-SMOKE-CERT'; code = 'YY-SMOKE-CODE' } },
        @{ Name = 'voucher-batch-revoke'; Path = '/api/douyin/life/voucher/batch-revoke'; Body = @{ order_id = $smokeOrderId; certificates = @(@{ certificate_id = 'YY-SMOKE-CERT'; code = 'YY-SMOKE-CODE' }) } },
        @{ Name = 'life-order-query'; Path = '/api/douyin/life/order/query'; Body = @{ order_id = $smokeOrderId; third_order_id = $smokeOrderId } },
        @{ Name = 'fulfil-check-info-sync'; Path = '/api/douyin/life/fulfil/check-info-sync'; Body = @{ order_id = $smokeOrderId; certificate_id = 'YY-SMOKE-CERT'; code = 'YY-SMOKE-CODE' } }
    )

    foreach ($case in $businessCases) {
        $results.Add((Invoke-SmokeJson -Name $case.Name -Path $case.Path -Body $case.Body))
    }
} else {
    Write-Host ''
    Write-Host 'business SPI probes skipped. Add -IncludeBusinessSpi to test semantic SPI paths with smoke payloads.' -ForegroundColor Yellow
}

$results | Format-Table -AutoSize

$failed = @($results | Where-Object { $_.Result -ne 'OK' })
if ($failed.Count -gt 0) {
    throw "Public smoke failed: $($failed.Count) check(s) failed."
}

Write-Host ''
Write-Host 'public smoke passed' -ForegroundColor Green
