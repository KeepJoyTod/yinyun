[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [string]$Phone = '13900001111',

    [string]$AccessCode = 'PREVIEW-20260608',

    [string]$AlbumId = '990202606080001',

    [string]$AssetId = '1781018145736000012',

    [switch]$AsJson
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$root = $BaseUrl.TrimEnd('/')
$manifestPath = Join-Path $repoRoot 'mobile-uniapp/src/manifest.json'
$wechatDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-weixin'
$douyinDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-toutiao'
$defaultWechatAppId = 'wx2a1a34748f56a6c6'
$defaultDouyinAppId = 'tta3c8d5753dac3aae01'

function Read-Utf8Json {
    param([Parameter(Mandatory = $true)][string]$Path)
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-ManifestAppId {
    param(
        [Parameter(Mandatory = $true)][object]$Manifest,
        [Parameter(Mandatory = $true)][string]$Platform
    )

    $platformNode = $Manifest.PSObject.Properties[$Platform]
    if ($null -eq $platformNode -or $null -eq $platformNode.Value) {
        return ''
    }
    $appid = $platformNode.Value.PSObject.Properties['appid']
    if ($null -eq $appid) {
        return ''
    }
    return [string]$appid.Value
}

function Test-FirstExistingPath {
    param([Parameter(Mandatory = $true)][string[]]$Paths)
    foreach ($path in $Paths) {
        if (-not [string]::IsNullOrWhiteSpace($path) -and (Test-Path -LiteralPath $path)) {
            return $path
        }
    }
    return ''
}

$manifest = Read-Utf8Json -Path $manifestPath
$wechatAppId = Get-ManifestAppId -Manifest $manifest -Platform 'mp-weixin'
$douyinAppId = Get-ManifestAppId -Manifest $manifest -Platform 'mp-toutiao'
if ([string]::IsNullOrWhiteSpace($wechatAppId)) {
    $wechatAppId = $defaultWechatAppId
}
if ([string]::IsNullOrWhiteSpace($douyinAppId)) {
    $douyinAppId = $defaultDouyinAppId
}

$wechatTool = Test-FirstExistingPath -Paths @(
    'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat',
    'C:\Program Files\Tencent\微信web开发者工具\cli.bat',
    'C:\Program Files (x86)\Tencent\微信开发者工具\cli.bat',
    'C:\Program Files\Tencent\微信开发者工具\cli.bat',
    (Join-Path $env:LOCALAPPDATA '微信开发者工具\cli.bat'),
    (Join-Path $env:LOCALAPPDATA 'Programs\微信开发者工具\cli.bat'),
    (Join-Path $env:LOCALAPPDATA 'Programs\wechat-devtools\cli.bat')
)

$douyinTool = Test-FirstExistingPath -Paths @(
    'C:\Program Files\ByteDance\抖音开发者工具\ide.exe',
    'C:\Program Files (x86)\ByteDance\抖音开发者工具\ide.exe',
    (Join-Path $env:LOCALAPPDATA 'Programs\douyin-devtools\ide.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\抖音开发者工具\ide.exe'),
    (Join-Path $env:LOCALAPPDATA 'ByteDance\抖音开发者工具\ide.exe')
)

$developerToolsDetected = -not [string]::IsNullOrWhiteSpace($wechatTool) -or -not [string]::IsNullOrWhiteSpace($douyinTool)

$finalPassCommand = ".\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl `"$root`" -Phone `"$Phone`" -AccessCode `"$AccessCode`" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit"

$handoff = [pscustomobject]@{
    generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
    baseUrl = $root
    legalDomains = [pscustomobject]@{
        request = $root
        uploadFile = $root
        downloadFile = $root
    }
    wechat = [pscustomobject]@{
        appId = $wechatAppId
        importPath = $wechatDist
        devTools = $wechatTool
        readyToImport = (Test-Path -LiteralPath (Join-Path $wechatDist 'project.config.json'))
    }
    douyin = [pscustomobject]@{
        appId = $douyinAppId
        importPath = $douyinDist
        devTools = $douyinTool
        readyToImport = (Test-Path -LiteralPath (Join-Path $douyinDist 'project.config.json'))
    }
    testAccount = [pscustomobject]@{
        phone = $Phone
        accessCode = $AccessCode
        albumId = $AlbumId
        assetId = $AssetId
    }
    checks = @(
        'request/uploadFile/downloadFile legal domains are set to https://api.evanshine.me',
        'WeChat DevTools imports mp-weixin and can login/list/detail/preview/save',
        'Douyin DevTools imports mp-toutiao and can login/list/detail/preview/save',
        'Run final PASS command only after real platform verification'
    )
    developerToolsDetected = $developerToolsDetected
    finalPassCommand = $finalPassCommand
}

if ($AsJson) {
    $handoff | ConvertTo-Json -Depth 8
    return
}

Write-Host 'miniapp acceptance handoff'
Write-Host "baseUrl: $root"
Write-Host "developer-tools-detected: $developerToolsDetected"
Write-Host ''

Write-Host 'WeChat DevTools'
Write-Host "appid: $wechatAppId"
Write-Host "import: $wechatDist"
Write-Host "detected: $(if ($wechatTool) { $wechatTool } else { 'NOT_FOUND' })"
Write-Host ''

Write-Host 'Douyin DevTools'
Write-Host "appid: $douyinAppId"
Write-Host "import: $douyinDist"
Write-Host "detected: $(if ($douyinTool) { $douyinTool } else { 'NOT_FOUND' })"
Write-Host ''

Write-Host 'legal domains'
Write-Host "request/uploadFile/downloadFile: $root"
Write-Host ''

Write-Host 'test account'
Write-Host "phone: $Phone"
Write-Host "accessCode: $AccessCode"
Write-Host "albumId: $AlbumId"
Write-Host "assetId: $AssetId"
Write-Host ''

Write-Host 'final PASS command after manual miniapp acceptance'
Write-Host $finalPassCommand
