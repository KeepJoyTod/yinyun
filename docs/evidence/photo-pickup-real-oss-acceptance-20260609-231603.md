# 客户取片真实 OSS 验收证据

生成时间：2026-06-09 23:16:03

## 结论

本文件用于记录一次真实图片取片验收。命令结论只代表自动命令覆盖的部分；最终结论必须同时满足自动命令通过和人工确认 H5、微信、抖音、后台审计验收。

命令结论：

```text
PENDING
```

人工确认：

```text
未确认
```

最终结论：

```text
PENDING
```

## 基础信息

| 项 | 值 |
| --- | --- |
| 环境 | https://api.evanshine.me |
| 手机号 | 13900001111 |
| 取片码 | PREVIEW-20260608 |
| 相册 ID | 990202606080001 |
| 底片 ID | 1781018145736000012 |
| OSS objectKey | photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg |
| 缩略图 objectKey | <待填写> |
| OSS 裸链 | https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg |
| 验收人 | <待填写> |

## 一键命令

### 1. 真实 OSS 生产预检

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012" -BareOssUrl "https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg" -VerifyBareOssBlocked
```

预期：

```text
thumbnail-url: success
preview-url: success
download-url: success
bare-oss: blocked status=403
stream: success status=200
preflight: passed
```

实际结果：

```text
<未自动运行>
```

### 2. 本地总验收

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-local-acceptance.ps1 -SkipH5Browser -SkipBackendSmoke -SkipBackendUnit
```

预期：

```text
mobile typecheck: passed
mobile unit tests: passed
mobile H5 build: passed
mobile WeChat mini build: passed
mobile Douyin mini build: passed
platform readiness local checks: passed
admin yy tests: passed
admin dev build: passed
photo pickup local acceptance: passed
```

实际结果：

```text
<未自动运行>
```

### 3. JSON 摘要校验

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-real-oss-acceptance-20260609-231603.json"
```

预期：

```text
real OSS evidence summary: passed
```

### 4. 最终发布前校验

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-real-oss-acceptance-20260609-231603.json" -RequireFinalPass
```

说明：只有自动命令通过且已执行 -ConfirmManualAcceptance 后，本命令才会通过。

### 5. 发布状态 JSON

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\get-photo-pickup-release-status.ps1 -OutputJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-release-status.json"
```

说明：生成本证据后会自动更新该状态文件，供 CI、部署包或其他 agent 读取。

## 小程序导入和域名

| 平台 | 项 | 值 | 结果 |
| --- | --- | --- | --- |
| 微信 | 导入目录 | D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin | <PASS/FAIL> |
| 微信 | request 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 微信 | uploadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 微信 | downloadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | 导入目录 | D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao | <PASS/FAIL> |
| 抖音 | request 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | uploadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | downloadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |

## 页面验收

| 场景 | 通过标准 | 结果 |
| --- | --- | --- |
| H5 登录 | 手机号 + 取片码进入相册 | <PASS/FAIL> |
| H5 相册目录 | 真实图缩略图可见 | <PASS/FAIL> |
| H5 预览 | 原图可预览，错误态清晰 | <PASS/FAIL> |
| H5 下载 | 下载成功，URL 不暴露 client_token | <PASS/FAIL> |
| 微信开发者工具 | 登录、相册、预览可用 | <PASS/FAIL> |
| 微信真机 | 保存图片可用 | <PASS/FAIL> |
| 抖音开发者工具 | 登录、相册、预览可用 | <PASS/FAIL> |
| 抖音真机 | 保存图片可用 | <PASS/FAIL> |

## 后台审计

| 动作 | 通过标准 | 结果 |
| --- | --- | --- |
| VERIFY | 登录动作有成功日志 | <PASS/FAIL> |
| ALBUM_DETAIL | 打开相册目录有成功日志 | <PASS/FAIL> |
| PREVIEW | 生成预览 URL 有成功日志 | <PASS/FAIL> |
| DOWNLOAD | 下载 URL 或下载动作有成功日志 | <PASS/FAIL> |
| STREAM | 后端图片流有成功日志 | <PASS/FAIL> |
| 失败日志 | 如果失败，原因能区分无权限、过期、对象不存在、OSS 读取失败 | <PASS/FAIL> |

## 判定

| 项 | 状态 |
| --- | --- |
| 私有 OSS 裸链 403 | <PASS/FAIL> |
| 签名 URL 可用 | <PASS/FAIL> |
| /stream 可用 | <PASS/FAIL> |
| H5 可用 | <PASS/FAIL> |
| 微信可用 | <PASS/FAIL> |
| 抖音可用 | <PASS/FAIL> |
| 后台审计可追踪 | <PASS/FAIL> |
