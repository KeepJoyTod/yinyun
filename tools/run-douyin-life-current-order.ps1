[CmdletBinding()]
param(
    [string]$EnvFile = (Join-Path $PSScriptRoot '..\backend\.env.local'),
    [switch]$UseTestDataHeader,
    [switch]$ShowRaw
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Env file not found: $EnvFile"
}

Get-Content -LiteralPath $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) {
        return
    }

    $index = $line.IndexOf('=')
    if ($index -le 0) {
        return
    }

    $name = $line.Substring(0, $index).Trim()
    $value = $line.Substring($index + 1).Trim()
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

$smokeParams = @{
    BaseUrl = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_BASE_URL', 'Process')
    ClientKey = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_CLIENT_KEY', 'Process')
    ClientSecret = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_CLIENT_SECRET', 'Process')
    AccountId = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_ACCOUNT_ID', 'Process')
    OrderId = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_ORDER_ID', 'Process')
    OutOrderNo = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_OUT_ORDER_NO', 'Process')
    OpenId = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_OPEN_ID', 'Process')
    OrderStatus = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_ORDER_STATUS', 'Process')
    StartTime = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_START_TIME', 'Process')
    EndTime = [Environment]::GetEnvironmentVariable('DOUYIN_LIFE_END_TIME', 'Process')
}
if ($UseTestDataHeader) {
    $smokeParams.UseTestDataHeader = $true
}
if ($ShowRaw) {
    $smokeParams.ShowRaw = $true
}

& (Join-Path $PSScriptRoot 'douyin-life-order-smoke.ps1') @smokeParams
