# 微信/抖音小程序预览清单

日期：2026-06-09

## 结论

微信小程序和抖音小程序都使用同一套 `mobile-uniapp` 源码。当前 P0 先验证手机号 + 取片码链路，不等待平台手机号授权。

`C:\Users\Administrator\Downloads\综合架构设计(1).md` 已评审：不切 Taro/React，不把主订单和主相册迁到微信云/抖音云。小程序继续作为客户取片入口，统一调用 `https://api.evanshine.me/client/photo/*`；平台云后续只做手机号授权、openid 绑定或轻量代理 POC。

## 审核材料补充

| 材料 | 建议截图/说明 |
| --- | --- |
| 首页/登录 | 手机号 + 取片码登录页，说明用于客户身份校验 |
| 相册列表 | 仅展示当前手机号可访问的相册 |
| 相册详情 | 多图目录、照片数量、有效期、交付状态 |
| 预览保存 | 图片预览页、保存按钮、失败提示 |
| 无权限/过期 | 取片码错误、相册过期、无权限页面 |
| 隐私说明 | 手机号用于取片身份校验，访问日志用于安全审计，照片不公开展示 |
| 接口域名 | request/uploadFile/downloadFile 均为 `https://api.evanshine.me` |

## 构建命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

## 微信小程序

| 项 | 值 |
| --- | --- |
| AppID | `wx2a1a34748f56a6c6` |
| 导入目录 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| API 域名 | `https://api.evanshine.me` |
| 合法域名 | request、uploadFile、downloadFile 均配置 `https://api.evanshine.me` |

## 抖音小程序

| 项 | 值 |
| --- | --- |
| AppID | `tta3c8d5753dac3aae01` |
| 导入目录 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |
| API 域名 | `https://api.evanshine.me` |
| 合法域名 | request、uploadFile、downloadFile 均配置 `https://api.evanshine.me` |

## 测试账号

### 公网预览账号

```text
手机号：13900001111
取片码：PREVIEW-20260608
相册 ID：990202606080001
```

当前该相册可见照片数为 `0`，用于验证登录、相册列表、空相册详情。

### 本地真实图账号

```text
手机号：13800003333
取片码：PICK-202606-001
相册 ID：903001
```

该账号用于本地 API 模式验证真实图片。小程序正式预览优先用公网账号，等后台给公网预览相册上传测试图后再验证保存图片。

## P0 验收项

| 步骤 | 预期 |
| --- | --- |
| 打开小程序 | 进入客户取片登录页 |
| 输入公网预览账号 | 登录成功 |
| 查看相册列表 | 能看到 `影约云小程序预览相册` |
| 打开相册详情 | 空相册显示交付状态，不白屏、不 404 |
| 上传公网测试图后再打开详情 | 能看到照片目录 |
| 点击照片 | 能进入预览页 |
| 保存图片 | 真机触发保存或权限引导 |
| token 失效后重进 | 回到登录页，重新登录后可继续 |

## 真实图片证据生成

上传公网测试图后，先生成证据文件，再按文件内命令和表格逐项验收：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -ObjectKey "<object-key>" -ThumbnailObjectKey "<thumb-object-key>" -Operator "<验收人>"
```

生成文件默认位于：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence
```

证据文件会包含：

- 真实 OSS 生产预检命令。
- 本地总验收命令。
- 微信/抖音开发者工具导入目录。
- request/uploadFile/downloadFile 合法域名填写表。
- H5、微信、抖音、后台审计验收表。

如果要让脚本自动跑命令并把脱敏输出写进证据文件，可以追加：

```powershell
-RunPreflight
-RunLocalAcceptance
```

注意：脚本会自动剥离 `BareOssUrl` 上的签名查询参数，只保留裸 OSS 对象 URL 用于 403 验证。

结论规则：

- 命令结论：未自动运行完整命令为 `PENDING`；任一自动命令失败为 `FAIL`；`-RunPreflight` 和 `-RunLocalAcceptance` 都通过为 `PASS`。
- 最终结论：没有人工确认时保持 `PENDING`；真机和后台审计都确认后，再加 `-ConfirmManualAcceptance` 重新生成证据，最终结论才允许为 `PASS`。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 请求失败或域名不合法 | 检查平台后台 request/download/upload 域名是否都有 `https://api.evanshine.me` |
| 能登录但无照片 | 当前公网预览相册可能还没上传测试图 |
| 图片能预览但保存失败 | 真机检查相册权限和 downloadFile 合法域名 |
| OSS 签名域名被平台拦截 | 切回后端 `/client/photo/assets/{assetId}/stream` |
| 抖音 SPI 地址疑问 | SPI 属于 `DOUYIN_LIFE`，不是小程序；继续填 `https://api.evanshine.me/api/douyin/life/*` |
