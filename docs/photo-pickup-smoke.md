# 客户取片 Smoke 脚本

用于验证影约云客户取片主链路：手机号 + 取片码登录、相册列表、相册详情、短期缩略图 URL、短期预览 URL、短期下载 URL、后端图片流。

## 命令

本地后端启动推荐使用项目脚本，它会带上本地 PostgreSQL / Redis 环境变量：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\start-yingyue-local.ps1 -SkipFrontend -SkipPrototype
```

本地验证：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

公网验证时，`BaseUrl` 必须是影约云 Spring Boot API 所在域名或反代前缀：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.example.com -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

如果只想验证账号、相册列表和第一个相册详情，可以不传 `AlbumId`，脚本会自动选择登录后返回的第一个相册：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.example.com -Phone 13900001111 -AccessCode PREVIEW-20260608 -AllowEmptyAlbum -SkipStream
```

影约云正式预设 API 域名：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

带私有 OSS 裸链验证：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
```

如果相册详情返回了 `fileUrl` 且它是 OSS 裸链，也可以让脚本尝试自动探测：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -VerifyBareOssBlocked
```

通过标准：输出 `bare-oss: blocked status=403`。如果裸链返回 `200`，说明 Bucket、ACL、阻止公共访问或反代策略有问题，不能作为正式客户取片配置上线。

当前公网预览账号基础链路：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount
```

等价完整参数：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13900001111 -AccessCode PREVIEW-20260608 -AllowEmptyAlbum -SkipStream
```

如果误用本地真实图 demo 账号去测公网：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

脚本会先提示当前是 `local demo account defaults`，并打印正确的公网预览账号命令。这个失败通常是环境账号不匹配，不代表公网 API 路由坏了。

`-SkipStream` 用于只验证 `auth / albums / detail / thumbnail-url / preview-url / download-url`，不验证后端代理图片流。
`-AllowEmptyAlbum` 用于生产预览相册没有可见底片时，把“空相册详情可访问”视为通过。
`-BareOssUrl` 用于显式验证私有 OSS 裸对象 URL 必须返回 `403`。
`-VerifyBareOssBlocked` 用于从相册详情里的 OSS 裸链字段自动探测；探测不到时会跳过并提示传 `-BareOssUrl`。

上线前建议跑完整预检：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

上线前带私有 OSS 裸链的完整预检：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
```

生产预览账号相册为空时，可先跑基础链路预检：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount
```

该命令会自动使用当前公网预览账号 `13900001111 / PREVIEW-20260608`，自动选择相册列表第一个相册，跳过 `/stream`，并允许 `assetCount=0` 作为基础链路通过。上传生产测试图后，改传真实手机号/取片码/相册 ID，并去掉 `-AllowEmptyAlbum` 和 `-SkipPhotoStream` 再做完整图片链路验收。

如果需要显式写完整参数，等价命令为：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone 13900001111 -AccessCode PREVIEW-20260608 -AlbumId '' -SkipPhotoStream -AllowEmptyAlbum
```

如果本机网络策略拦截公网 socket，但仍想验证脚本流程或继续检查其他项：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount -ContinueOnPhotoSmokeError -SkipAuthJsonRoute
```

该模式只适合排查脚本和后续检查项，不代表公网客户取片链路已通过；真正上线前仍要在网络正常的机器或服务器上跑不带跳过参数的完整预检。

生产切抖音来客 Spring Boot SPI 前，再跑缺签名探针：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -CheckDouyinMissingSignature
```

生产库没有 demo 取片账号时，可跳过取片 auth，只测 SPI 签名：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

如果提示 `missing signature was accepted`，代表该环境还没强制开启 `DOUYIN_LIFE_REQUIRE_SIGNATURE=true`。

如果后台 API 挂在前缀下，`BaseUrl` 要带上 API 前缀：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.example.com/prod-api -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

如果要指定某张照片：

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -AssetId 2063173289800183809
```

## 验证内容

- `POST /client/photo/auth/verify` 返回 `clientToken`
- `GET /client/photo/albums` 返回可访问相册
- `GET /client/photo/albums/{albumId}` 返回客户可见照片
- `GET /client/photo/assets/{assetId}/thumbnail-url` 返回短期缩略图签名 URL，用于相册封面和目录网格
- `GET /client/photo/assets/{assetId}/preview-url` 返回短期签名 URL
- `GET /client/photo/assets/{assetId}/download-url` 返回短期下载 URL、文件名、内容类型、过期时间
- 可选：OSS 裸对象 URL 不带签名访问返回 `403`
- `GET /client/photo/assets/{assetId}/stream` 使用 `X-Client-Token` 返回图片流

脚本不会打印完整 `clientToken`，也不会打印完整签名 URL。

可选参数：

- `-AlbumId`：指定相册；不传时自动选择相册列表第一个相册。
- `-AssetId`：指定底片；不传时自动选择详情里第一张可见底片。
- `-SkipStream`：跳过 `/stream`，用于分层验证签名 URL 或绕开本机 OSS 出口异常。
- `-AllowEmptyAlbum`：相册无可见底片时也返回成功，适合生产空预览账号做基础链路探针。
- `-PreviewAccount`：自动使用公网预览账号 `13900001111 / PREVIEW-20260608`，自动选择第一个相册，自动启用 `-AllowEmptyAlbum` 和 `-SkipStream`。
- `-BareOssUrl`：传入不带签名 query 的 OSS 对象裸链，脚本会断言它返回 `403`。
- `-VerifyBareOssBlocked`：尝试从接口返回的资产字段里找 OSS 裸链并断言 `403`；找不到时跳过。

## 期望输出

```text
photo pickup smoke
baseUrl: http://127.0.0.1:8080
auth: success (len=..., value=abcd...wxyz)
albums: success count=1
detail: success albumId=903001, assetCount=2
thumbnail-url: success assetId=..., fileName=..., contentType=..., expiresAt=...
preview-url: success assetId=..., fileName=..., contentType=..., expiresAt=...
download-url: success assetId=..., fileName=..., contentType=..., expiresAt=...
bare-oss: blocked status=403 url=https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>
stream: success status=200, contentType=image/webp, contentDisposition=attachment; filename="...", bytes=...
```

## 常见失败

- `auth failed`：手机号、取片码、相册状态或过期时间不匹配。
- `detail failed: code=500, msg=相册不存在或无权限访问`：当前 token 不包含该相册授权；常见原因是把本地相册 ID 拿去测公网预览账号。
- `received HTML page instead of JSON`：当前 `BaseUrl` 命中了前端页面或前端 404，没有命中 Spring Boot API；检查 Nginx/Caddy 反代、`/prod-api` 前缀或后端端口。
- `http://47.94.157.55:8080`：当前是 Lsky 临时图床入口，不是影约云 Spring Boot API；不要把它当客户取片公网 API 验证地址。
- `photo.evanshine.me`：当前可继续作为客户 H5/图床入口使用，但正式 `/client/photo/*` API 应统一走 `https://api.evanshine.me`。
- `detail failed: no visible assets available`：相册没有 `visible=1` 且 `object_key` 非空的底片。
- `thumbnail-url failed`：缩略图签名生成失败；如果 `thumbnailObjectKey` 为空，后端会回退原图 `objectKey`，仍失败时优先查 OSS 配置和 objectKey。
- `preview-url failed`：OSS 配置、objectKey 或签名生成失败。
- `download-url failed`：下载签名生成失败，通常是 OSS 配置或 objectKey 问题。
- `bare-oss failed: expected 403`：OSS 裸链没有被私有策略拦住，优先检查 Bucket ACL、阻止公共访问、RAM 授权、反代缓存。
- `bare-oss failed: BareOssUrl looks like a signed URL`：传入的是签名 URL，不是裸对象 URL；去掉 query 参数后再测。
- `stream failed: status=500, bodyKind=json`：后端已经鉴权通过，但从私有 OSS 拉流失败；查看 `logs/ruoyi-admin-dev.log` 中 `YyClientPhotoController` 的原始异常。
- `stream failed: status=500, bodyKind=empty`：旧版后端错误路径可能混用了 `getOutputStream()` 和 `getWriter()`；需更新到 2026-06-08 后的 controller 修复。
- `stream failed: expected image/* Content-Type`：反代或错误页返回了非图片内容；检查 API 域名、反代前缀和后端错误体。

## 2026-06-08 实测记录

本地账号：

```text
phone=13800003333
code=PICK-202606-001
albumId=903001
assetId=2063173289800183809
```

结果：

- `auth`、`albums`、`detail`、`thumbnail-url`、`preview-url`、`download-url` 均成功。
- `/stream` 返回 `500 application/json`，错误体为 `图片流读取失败，请稍后重试或使用签名链接下载`。
- 后端日志显示 AWS SDK 到 `evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com:443` 的流式连接被关闭，且本机直连签名 URL 报 Windows socket 权限错误。

结论：

- 当前失败不归因于 H5 页面或取片权限逻辑。
- 该环境疑似受本机 VPN / 代理 / TUN 规则影响，需在生产或准生产服务器侧复验 OSS 443 出口。
- H5 已有兜底：`/stream` 失败时可改用已通过权限校验的短期签名 URL；小程序端仍建议优先验证 `/stream`，避免平台合法域名限制 OSS 签名域名。

公网预览账号：

```text
baseUrl=https://api.evanshine.me
phone=13900001111
code=PREVIEW-20260608
autoAlbumId=990202606080001
```

结果：

- `auth`、`albums`、`detail` 成功。
- 相册 `990202606080001` 当前 `assetCount=0`，因此不能验证 `thumbnail-url`、`preview-url`、`download-url`、`/stream`。
- 本地真实相册 `903001` 不能用于公网预览账号验证，公网会按预期返回“相册不存在或无权限访问”。
