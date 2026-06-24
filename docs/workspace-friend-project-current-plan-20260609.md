# Workspace Friend Project Current Plan

更新时间：2026-06-09

## 结论

工作区已解压朋友项目：

- `D:\OtherProject\CameraApp\photoshop-master`：朋友摄影后台 Demo，作为后台 UI/交互参考。
- `D:\OtherProject\CameraApp\yuyue-main`：朋友 Taro 小程序/预约 Demo，作为移动端体验参考。

正式生产项目仍是：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

当前权威入口已经收敛到：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\00-authoritative-friend-project-takeover-20260609.md
C:\Users\Administrator\Desktop\yiyue\00-权威入口-朋友项目接手与优化规划.md
C:\Users\Administrator\Desktop\yiyue\前端优化\00-权威入口-前端优化地图与计划.md
C:\Users\Administrator\Desktop\yiyue\抖音小程序\00-权威入口-抖音小程序地图与计划.md
```

正式架构：

- 后端：`backend`
- 后台：`admin-ui`
- H5/微信/抖音客户取片：`mobile-uniapp`
- API 域名：`https://api.evanshine.me`
- 微信 AppID：`wx2a1a34748f56a6c6`
- 抖音 AppID：`tta3c8d5753dac3aae01`

## 桌面 current 地图

| 文件 | 用途 |
| --- | --- |
| `C:\Users\Administrator\Desktop\yiyue\朋友项目接手总控与优化规划-20260609-current.md` | 当前总控入口 |
| `C:\Users\Administrator\Desktop\yiyue\前端优化\前端优化-源码地图与优化计划-20260609-current.md` | `photoshop-master` 到正式后台的吸收地图 |
| `C:\Users\Administrator\Desktop\yiyue\抖音小程序\抖音小程序-源码地图与优化计划-20260609-current.md` | `yuyue-main` 到正式 uni-app 的吸收地图 |

## 正式落点

| 方向 | 正式文件 |
| --- | --- |
| 后台相册/底片/取片入口 | `admin-ui\src\views\yy\photo\index.vue` |
| 后台订单取片排障 | `admin-ui\src\views\yy\order\index.vue` |
| 后台取片入口工具 | `admin-ui\src\views\yy\utils\photoPickupEntry.ts` |
| 后台上传/缩略图/健康判断 | `admin-ui\src\views\yy\utils\photoUpload.ts`、`photoThumbnail.ts`、`photoOperationsHealth.ts` |
| 客户取片端 | `mobile-uniapp\src\pages\pickup\*` |
| 客户取片 API | `mobile-uniapp\src\api\clientPhoto.ts` |
| 小程序手机号授权 | `mobile-uniapp\src\platform\phone-auth.mjs`、后端 `ClientPhotoMiniAppPhoneAuthProvider.java` |
| 客户取片后端 | `backend\ruoyi-modules\ruoyi-yy\...\YyClientPhotoController.java`、`YyClientPhotoServiceImpl.java` |
| 抖音来客后端 | `backend\ruoyi-modules\ruoyi-yy\...\DouyinLifeChannelAdapter.java`、`YyDouyinLifeSpiController.java` |

## 不做的事

- 不把 `photoshop-master` 的后端、MinIO、JWT 体系迁入正式项目。
- 不把 `yuyue-main` 的 Taro 源码替换正式 uni-app。
- 不把主订单、主相册、客户、OSS 权限迁到微信云或抖音云。
- 不提交桌面密钥文件或 `.env.local`。

## 下一步

1. 跑正式 `admin-ui`、`mobile-uniapp`、后端子集验证。
2. 以 `photoshop-master` 的相册/在线选片体验继续优化正式后台。
3. 以 `yuyue-main` 的底片/登录/订单卡体验继续优化正式移动端。
4. 用真实 OSS 图片完成 H5 + 小程序取片验收。
5. 再接微信/抖音手机号授权和抖音来客订单自动建相册。

## 2026-06-09 Progress

| Area | Evidence |
| --- | --- |
| Mobile pickup login polish | Added `pickup-flow-panel` with phone, pickup-code, and private-album steps plus `pickup-credential-note` |
| Mobile album list polish | Added `album-dashboard` with total, viewable, and waiting album counts plus short-term original protection copy |
| Mobile pickup detail polish | Added `delivery-proof-grid` summary for asset count, preview readiness, and selection progress |
| Mobile preview polish | Added `preview-file-context` for current file, protected credential, and album position |
| Contract tests | `cd mobile-uniapp; npm test -- pickup-ui-polish-contract` -> 45 passed |
| Typecheck | `cd mobile-uniapp; npm run typecheck` -> passed |
| H5 build | `cd mobile-uniapp; npm run build:h5` -> passed |
| WeChat miniapp build | `cd mobile-uniapp; npm run build:mp-weixin` -> passed |
| Douyin miniapp build | `cd mobile-uniapp; npm run build:mp-toutiao` -> passed |
| H5 login visible check | `http://127.0.0.1:5176/#/pages/pickup/login/index` showed the new pickup flow and credential note; `5174` was an older hot-reload process |
| H5 visible check | `http://127.0.0.1:5174/#/pages/pickup/detail/index?albumId=990202606080001` showed asset count, preview readiness, and selection progress; preview error state still showed current file, protected credential, and album position |
| Admin album operation actions | Added row-level and workspace quick actions for `编辑相册 / 上传照片 / 查看缺 Key / 查看审计 / 取片入口` |
| Admin pickup channel copy | Added `buildPickupChannelShareText`; pickup-entry dialog now has per-channel `复制话术` for H5, WeChat miniapp, and Douyin miniapp |
| Admin channel safety | H5 copy can include the H5 pickup URL; WeChat/Douyin copy only tells customers to open the miniapp and does not expose OSS URLs, `/dev-api`, signed params, or `client_token` |
| Admin verification | `cd admin-ui; npm run test:yy -- photoPickupEntry photoPageContract` -> 57 passed; `npm run build:dev` -> built successfully |

## 2026-06-09 Admin Pickup Entry Channel Copy

| Item | Result |
| --- | --- |
| Utility | `admin-ui\src\views\yy\utils\photoPickupEntry.ts` exports `buildPickupChannelShareText(album, channelLabel, entryUrl)` |
| Dialog UI | `admin-ui\src\views\yy\photo\index.vue` shows `复制话术` for H5, WeChat miniapp, and Douyin miniapp channel rows |
| H5 behavior | H5 share text includes the safe H5 pickup entry when configured |
| Miniapp behavior | WeChat/Douyin share text instructs customers to open `影约云客户取片` inside the relevant miniapp and enter phone + pickup code |
| Guardrail | The generated copy avoids admin URLs, OSS domains, signed query params, and client tokens |
| Tests | `photoPickupEntry.test.ts` covers the three channel variants; `photoPageContract.test.ts` pins the dialog action and `yy-pickup-channel-copy` style hook |
| Verification | `npm run test:yy -- photoPickupEntry photoPageContract` -> 57 passed; `npm run build:dev` -> built successfully |

## 2026-06-09 Admin Pickup QR Download Feedback

| Item | Result |
| --- | --- |
| Improvement | The pickup-entry dialog now treats QR download as a visible operator action, not a silent browser download |
| UI | The feedback block changed from `上次复制` to `最近操作`, covering copy actions and QR download |
| Filename | QR downloads use `photo-pickup-<albumName>-<albumId>.png` with Windows-invalid filename characters sanitized |
| Failure state | When no safe H5 QR exists, the dialog records a warning and tells operators to configure the H5 entry or use miniapp copy |
| Files | `admin-ui\src\views\yy\photo\index.vue`, `admin-ui\src\views\yy\utils\photoPageContract.test.ts` |
| Verification | `npm run test:yy -- photoPageContract photoPickupEntry` -> 57 passed; `npm run build:dev` -> built successfully |

## Planning Snapshot

| Priority | Next work | Production target |
| --- | --- | --- |
| P0 | Real private OSS acceptance with uploaded images, bare OSS 403, signed preview/download, and `/stream` fallback | `tools\photo-pickup-local-acceptance.ps1`, `tools\new-photo-pickup-real-oss-evidence.ps1` |
| P0 | Import WeChat/Douyin miniapp builds into official devtools and validate phone + pickup-code flow | `mobile-uniapp\dist\build\mp-weixin`, `mobile-uniapp\dist\build\mp-toutiao` |
| P1 | Continue absorbing `photoshop-master` album workspace UX into the Element Plus admin page | `admin-ui\src\views\yy\photo\index.vue` |
| P1 | Continue absorbing `yuyue-main` login/negatives/order-card UX into uni-app pickup pages | `mobile-uniapp\src\pages\pickup\*` |
| P2 | Add WeChat/Douyin phone authorization while keeping pickup code as fallback | `mobile-uniapp\src\platform\phone-auth.mjs`, `ClientPhotoMiniAppPhoneAuthProvider.java` |
| P2 | Bind Douyin Life paid/reservation orders to customer album placeholders | `DouyinLifeChannelAdapter.java`, `YyPhotoAlbumServiceImpl.java` |

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

## 2026-06-09 Consolidated Takeover Plan

This is the current source of truth inside the repo for the friend's project handover.

### Fixed Inputs

| Source | Path | Role |
| --- | --- | --- |
| Friend admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Reference only: album workspace, online selection, schedule, order UX |
| Friend miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Reference only: phone login, negatives, orders, booking, profile UX |
| Production project | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | Only production implementation line |

### Production Targets

| Area | Production path |
| --- | --- |
| Backend/API/Douyin Life | `backend` |
| Admin operations UI | `admin-ui` |
| H5/WeChat/Douyin pickup client | `mobile-uniapp` |
| WeChat import output | `mobile-uniapp\dist\build\mp-weixin` |
| Douyin import output | `mobile-uniapp\dist\build\mp-toutiao` |
| API domain | `https://api.evanshine.me` |

### Do Not Migrate

- Do not replace `admin-ui` with the friend Vue/Tailwind/Radix stack.
- Do not replace `mobile-uniapp` with the friend Taro/React source.
- Do not migrate demo backend, MinIO, public image URLs, old AppIDs, or secrets.
- Do not move Douyin Life SPI/Webhook/refund/code issue logic into the miniapp.
- Do not make OSS public-read for preview convenience.

### Implementation Roadmap

| Priority | Work | Production target | Verification |
| --- | --- | --- | --- |
| P0 | Real private OSS acceptance: upload, objectKey, visible asset, H5 preview/download, bare OSS 403 | `admin-ui`, `backend`, `tools\photo-pickup-local-acceptance.ps1` | Browser + smoke script evidence |
| P0 | WeChat/Douyin devtools import and phone + pickup-code flow | `mobile-uniapp\dist\build\mp-weixin`, `dist\build\mp-toutiao` | Login, album list, detail, preview, save |
| P1 | Absorb admin album workspace UX | `admin-ui\src\views\yy\photo\index.vue` | `npm run test:yy -- photoPageContract photoPickupEntry`; `npm run build:dev` |
| P1 | Absorb mobile login/negatives/order-card UX | `mobile-uniapp\src\pages\pickup\*`, `src\styles\app.scss` | `npm test`; `typecheck`; all builds |
| P1 | Add WeChat/Douyin phone authorization | `mobile-uniapp\src\platform\phone-auth.mjs`, `ClientPhotoMiniAppPhoneAuthProvider.java` | Real-device auth succeeds; pickup code fallback still works |
| P2 | Bind Douyin Life paid/reservation orders to albums | `DouyinLifeChannelAdapter.java`, `YyPhotoAlbumServiceImpl.java` | Paid/reserved order creates or reuses album placeholder |
| P2 | Commercial selection workflow | album/product/client selection modules | selected count, extra retouch, download/share/audit visible in admin |

## 2026-06-09 Mobile Preview Download Failure Diagnostics

| Item | Result |
| --- | --- |
| Goal | Make preview download/save failures understandable for customers and actionable for operators |
| Files | `mobile-uniapp\src\pages\pickup\preview\preview-state.mjs`, `preview\index.vue`, `src\styles\app.scss`, `tests\preview-state.test.cjs` |
| New helper | `getDownloadFailureFeedback(errorMessage, { action })` classifies permission, expired identity, missing OSS object, and network failures |
| Miniapp save permission | `saveImageToPhotosAlbum` permission denial now shows `需要相册权限` and guides users to settings |
| Expired identity | `401/403/token/无权限/过期` clears token/cache and asks the customer to re-enter phone + pickup code |
| Missing original | `OSS/对象不存在/404` now tells the customer the original is not ready and tells operators to check OSS Key, visibility, and private OSS object existence |
| H5 fallback | Stream download success shows filename; stream failure can still fall back to the short-lived signed URL with a clear warning |
| Verification | `npm test -- preview-state.test.cjs` -> 46 passed; `npm run typecheck` -> passed; `build:h5`, `build:mp-weixin`, `build:mp-toutiao` -> Build complete |
