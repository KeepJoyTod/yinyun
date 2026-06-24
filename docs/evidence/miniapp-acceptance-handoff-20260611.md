# Miniapp Acceptance Handoff 2026-06-11

## 结论

代码、构建产物、H5 真实 OSS 客户取片、后台访问审计已经通过自动化和生产只读验证。当前只剩两个外部验收项：微信小程序开发者工具/真机验收、抖音小程序开发者工具/真机验收。

本机未检测到微信开发者工具或抖音开发者工具，所以不能在当前机器直接完成平台工具验收。平台验收完成前，发布门禁保持 `BLOCKED` 是预期状态。

## 需要填写的值

| 平台 | AppID | 导入目录 |
| --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

| 域名项 | 填写值 |
| --- | --- |
| request/uploadFile/downloadFile | `https://api.evanshine.me` |

## 验收账号

```text
13900001111 / PREVIEW-20260608
albumId: 990202606080001
assetId: 1781018145736000012
```

## 验收步骤

1. 微信开发者工具导入 `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin`。
2. 抖音开发者工具导入 `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao`。
3. 两个平台后台 `request/uploadFile/downloadFile` 合法域名已由用户确认均为 `https://api.evanshine.me`。
4. 使用 `13900001111 / PREVIEW-20260608` 登录。
5. 验证相册列表、相册详情、图片预览、保存图片。
6. 截图保存开发者工具页面、网络请求和真机保存结果。

## 自动打印交接信息

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\print-miniapp-acceptance-handoff.ps1
```

如果需要机器可读输出：

```powershell
.\tools\print-miniapp-acceptance-handoff.ps1 -AsJson
```

## 最终 PASS 命令

只有微信和抖音都在开发者工具或真机里确认通过后，再运行：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
.\tools\verify-photo-pickup-release-gate.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012"
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -OutputJsonPath .\docs\evidence\yingyue-delivery-status.json
```

## 当前外部阻塞

| 项 | 状态 |
| --- | --- |
| H5 客户取片 | PASS |
| 后台访问审计 | PASS |
| 微信小程序验收 | PENDING |
| 抖音小程序验收 | PENDING |
| final PASS evidence | 等微信/抖音确认后生成 |
