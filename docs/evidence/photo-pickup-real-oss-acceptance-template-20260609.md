# 客户取片真实 OSS 验收证据模板

日期：2026-06-09

## 结论

本文件用于记录“后台上传真实测试图后”的最终证据。命令结论只代表自动命令覆盖的部分；最终结论必须同时满足自动命令通过和人工确认 H5、微信、抖音、后台审计验收。

## 基础信息

| 项 | 值 |
| --- | --- |
| 环境 | `https://api.evanshine.me` |
| 手机号 | `<填写客户手机号>` |
| 取片码 | `<填写取片码>` |
| 相册 ID | `<填写 albumId>` |
| 底片 ID | `<填写 assetId>` |
| OSS objectKey | `<填写 objectKey>` |
| 缩略图 objectKey | `<填写 thumbnailObjectKey，没有则填空>` |
| OSS 裸链 | `https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>` |
| 上传时间 | `<填写时间>` |
| 验收人 | `<填写姓名>` |

## 命令证据

### 1. 生产预检

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone <手机号> -AccessCode <取片码> -AlbumId <相册ID> -AssetId <底片ID> -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
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
<粘贴关键输出，不粘贴 clientToken 和签名 URL>
```

### 2. 移动端构建

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

实际结果：

```text
<粘贴关键输出>
```

### 3. 后台构建

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

实际结果：

```text
<粘贴关键输出>
```

## 页面验收

| 场景 | 通过标准 | 结果 |
| --- | --- | --- |
| H5 登录 | 手机号 + 取片码进入相册 | `<PASS/FAIL>` |
| H5 相册目录 | 真实图缩略图可见 | `<PASS/FAIL>` |
| H5 预览 | 原图可预览，错误态清晰 | `<PASS/FAIL>` |
| H5 下载 | 下载成功，URL 不暴露 `client_token` | `<PASS/FAIL>` |
| 微信开发者工具 | 登录、相册、预览可用 | `<PASS/FAIL>` |
| 微信真机 | 保存图片可用 | `<PASS/FAIL>` |
| 抖音开发者工具 | 登录、相册、预览可用 | `<PASS/FAIL>` |
| 抖音真机 | 保存图片可用 | `<PASS/FAIL>` |

## 后台审计

| 动作 | 通过标准 | 结果 |
| --- | --- | --- |
| `VERIFY` | 登录动作有成功日志 | `<PASS/FAIL>` |
| `ALBUM_DETAIL` | 打开相册目录有成功日志 | `<PASS/FAIL>` |
| `PREVIEW` | 生成预览 URL 有成功日志 | `<PASS/FAIL>` |
| `DOWNLOAD` | 下载 URL 或下载动作有成功日志 | `<PASS/FAIL>` |
| `STREAM` | 后端图片流有成功日志 | `<PASS/FAIL>` |
| 失败日志 | 如果失败，原因能区分无权限、过期、对象不存在、OSS 读取失败 | `<PASS/FAIL>` |

## 平台配置

| 平台 | 配置项 | 值 | 结果 |
| --- | --- | --- | --- |
| 微信 | request 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |
| 微信 | downloadFile 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |
| 微信 | uploadFile 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |
| 抖音 | request 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |
| 抖音 | downloadFile 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |
| 抖音 | uploadFile 合法域名 | `https://api.evanshine.me` | `<PASS/FAIL>` |

## 判定

| 项 | 状态 |
| --- | --- |
| 私有 OSS 裸链 403 | `<PASS/FAIL>` |
| 签名 URL 可用 | `<PASS/FAIL>` |
| `/stream` 可用 | `<PASS/FAIL>` |
| H5 可用 | `<PASS/FAIL>` |
| 微信可用 | `<PASS/FAIL>` |
| 抖音可用 | `<PASS/FAIL>` |
| 后台审计可追踪 | `<PASS/FAIL>` |

命令结论：

```text
<PASS / PENDING / FAIL>
```

人工确认：

```text
<已确认 / 未确认>
```

最终结论：

```text
<PASS / PENDING / FAIL；如果不是 PASS，写下一步>
```
