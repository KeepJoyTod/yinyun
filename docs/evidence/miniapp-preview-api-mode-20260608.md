# 小程序预览 API Mode 证据 2026-06-08

## 结论

微信小程序和抖音小程序预览/构建已统一走 `api` mode，客户端请求域名固定为：

```text
https://api.evanshine.me
```

这样导入微信开发者工具或抖音开发者工具后，请求不会再落到相对路径 `/client/photo/*`，也不会误连本机 `127.0.0.1:8080`。

## 2026-06-08 UI 与交互复测

本轮在 H5 先做实测，再同步升级 uni-app 共用页面，微信/抖音小程序会继承同一套 UI。

已完成：

| 项 | 结果 |
| --- | --- |
| H5 登录页 | 可打开，默认填入预览账号，文案从“技术说明”改成客户可理解的取片说明 |
| 手机号 + 取片码登录 | `13900001111 / PREVIEW-20260608` 登录成功 |
| 相册列表 | 返回 1 个预览专用相册，页面进入 `pages/pickup/albums/index` |
| 相册详情 | 相册为空时展示“暂无可见照片”空状态，不是 404 或无权限 |
| 加载状态 | 相册列表、照片目录、预览页增加骨架/空/错误状态 |
| 预览页 | 改为暗色照片预览界面，H5 显示“下载原图”，小程序显示“保存图片” |
| 下载权限 | 小程序保存失败时会提示去设置相册权限 |
| 目录加载策略 | 相册详情先展示目录结构，再逐张补预览签名 URL，避免一张图慢拖住整页 |

仍需真实图/真机补测：

| 项 | 原因 |
| --- | --- |
| 图片预览 | 当前预览相册可见照片数为 `0`，需要后台上传测试图 |
| H5 原图下载 | 需要真实 OSS 对象验证 `/stream`、文件名、Content-Type |
| 微信保存图片 | 需要微信开发者工具和真机验证 `downloadFile`/`saveImageToPhotosAlbum` |
| 抖音保存图片 | 需要抖音开发者工具和真机验证平台权限提示 |
| 大相册性能 | 需要 20 张以上真实照片验证缩略图并发和滚动体验 |

## 预览账号验证

已在生产创建一个非真实客户的预览专用测试相册：

| 项 | 结果 |
| --- | --- |
| 相册 ID | `990202606080001` |
| 相册名 | `影约云小程序预览相册` |
| 客户名 | `预览测试用户` |
| 手机号 | 测试号，数据库加密存储 |
| 取片码 | 预览专用，不写入文档 |
| 渠道 | `MANUAL` |
| 状态 | `ACTIVE` |
| 选片状态 | `WAITING` |
| 过期时间 | 2026-07-07 |
| 可见照片数 | `0` |

H5 预览验证结果：

```text
POST https://api.evanshine.me/client/photo/auth/verify -> 200
GET  https://api.evanshine.me/client/photo/albums -> 200, count=1
GET  https://api.evanshine.me/client/photo/albums/990202606080001 -> 200, assets=[]
```

当前相册为空，所以小程序进入后应看到“暂无可见照片”，不是 404 或无权限。后续后台上传测试图后，再复测 `preview-url` 和 `/stream`。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-platform-readiness.ps1
```

## 开发者工具导入目录

微信小程序开发预览：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\dev\mp-weixin
```

抖音小程序开发预览：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\dev\mp-toutiao
```

## 当前预览账号

该账号只用于小程序/H5 预览，不是真实客户：

```text
手机号：13900001111
取片码：PREVIEW-20260608
```
