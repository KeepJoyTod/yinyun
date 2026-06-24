[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [string]$Phone = '13900001111',

    [string]$AccessCode = 'PREVIEW-20260608',

    [string]$AlbumId = '990202606080001',

    [string]$AssetId = '1781018145736000012',

    [string]$OutputRoot = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'yingyue-miniapp-acceptance-packages'),

    [switch]$NoZip
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$root = $BaseUrl.TrimEnd('/')
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$packageName = "yingyue-miniapp-acceptance-$timestamp"
$packageDir = Join-Path $OutputRoot $packageName
$wechatDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-weixin'
$douyinDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-toutiao'
$handoffScript = Join-Path $PSScriptRoot 'print-miniapp-acceptance-handoff.ps1'
$deliveryScript = Join-Path $PSScriptRoot 'get-yingyue-delivery-status.ps1'

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Label not found: $Path"
    }
}

function Assert-DirectoryExists {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Label not found: $Path"
    }
}

Assert-DirectoryExists -Path $wechatDist -Label 'WeChat miniapp dist'
Assert-DirectoryExists -Path $douyinDist -Label 'Douyin miniapp dist'
Assert-FileExists -Path (Join-Path $wechatDist 'project.config.json') -Label 'WeChat project.config.json'
Assert-FileExists -Path (Join-Path $douyinDist 'project.config.json') -Label 'Douyin project.config.json'
Assert-FileExists -Path $handoffScript -Label 'handoff script'
Assert-FileExists -Path $deliveryScript -Label 'delivery status script'

New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

$wechatTarget = Join-Path $packageDir 'mp-weixin'
$douyinTarget = Join-Path $packageDir 'mp-toutiao'
Copy-Item -LiteralPath $wechatDist -Destination $wechatTarget -Recurse
Copy-Item -LiteralPath $douyinDist -Destination $douyinTarget -Recurse

$handoffJsonPath = Join-Path $packageDir 'handoff.json'
& $handoffScript -BaseUrl $root -Phone $Phone -AccessCode $AccessCode -AlbumId $AlbumId -AssetId $AssetId -AsJson |
    Set-Content -LiteralPath $handoffJsonPath -Encoding UTF8

$deliveryStatusPath = Join-Path $packageDir 'delivery-status.txt'
$deliveryStatusJsonPath = Join-Path $packageDir 'delivery-status.json'
$deliveryOutput = & $deliveryScript *>&1
($deliveryOutput | ForEach-Object { [string]$_ }) -join [Environment]::NewLine |
    Set-Content -LiteralPath $deliveryStatusPath -Encoding UTF8
& $deliveryScript -AsJson | Set-Content -LiteralPath $deliveryStatusJsonPath -Encoding UTF8

$readmePath = Join-Path $packageDir 'README-验收说明.md'
$finalPassCommand = ".\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl `"$root`" -Phone `"$Phone`" -AccessCode `"$AccessCode`" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit"

$readme = @'
# 影约云微信/抖音小程序验收包

生成时间：__GENERATED_AT__

## 结论

这个包用于给微信开发者工具、抖音开发者工具或另一台电脑验收客户取片链路。包内不包含密钥、token、OSS AccessKey 或服务器密码。

## 平台信息

| 平台 | AppID | 导入目录 |
| --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `mp-toutiao` |

## 合法域名

后台配置都填：

```text
request: __ROOT__
uploadFile: __ROOT__
downloadFile: __ROOT__
```

## 测试账号

```text
手机号：__PHONE__
取片码：__ACCESS_CODE__
相册 ID：__ALBUM_ID__
照片 ID：__ASSET_ID__
```

## 验收步骤

1. 微信开发者工具导入本包内 `mp-weixin`。
2. 抖音开发者工具导入本包内 `mp-toutiao`。
3. 使用上面的手机号和取片码登录。
4. 验证相册列表能打开。
5. 验证相册详情能看到图片。
6. 验证图片预览能打开。
7. 验证保存/下载图片可用。
8. 截图保存开发者工具页面、网络请求和真机保存结果。

## 验收通过后回到仓库运行

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
__FINAL_PASS_COMMAND__
```

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `mp-weixin` | 微信小程序构建产物 |
| `mp-toutiao` | 抖音小程序构建产物 |
| `handoff.json` | 机器可读的 AppID、域名、测试账号、最终命令 |
| `delivery-status.txt` | 生成包时的交付状态输出 |
| `delivery-status.json` | 机器可读的交付状态 |
'@

$readme = $readme.
    Replace('__GENERATED_AT__', (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')).
    Replace('__ROOT__', $root).
    Replace('__PHONE__', $Phone).
    Replace('__ACCESS_CODE__', $AccessCode).
    Replace('__ALBUM_ID__', $AlbumId).
    Replace('__ASSET_ID__', $AssetId).
    Replace('__FINAL_PASS_COMMAND__', $finalPassCommand)

$readme | Set-Content -LiteralPath $readmePath -Encoding UTF8

$zipPath = ''
if (-not $NoZip) {
    $zipPath = Join-Path $OutputRoot "$packageName.zip"
    if (Test-Path -LiteralPath $zipPath) {
        throw "Zip already exists: $zipPath"
    }
    Compress-Archive -Path (Join-Path $packageDir '*') -DestinationPath $zipPath -CompressionLevel Optimal
}

$result = [pscustomobject]@{
    packageDir = $packageDir
    zipPath = $zipPath
    wechatImportDir = $wechatTarget
    douyinImportDir = $douyinTarget
    readme = $readmePath
    handoffJson = $handoffJsonPath
    deliveryStatus = $deliveryStatusPath
    deliveryStatusJson = $deliveryStatusJsonPath
}

$result | Format-List
