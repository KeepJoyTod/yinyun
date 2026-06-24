# Authoritative Friend Project Takeover Plan

更新时间：2026-06-11

## 结论

正式生产项目只认：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

朋友项目只做参考：

| Reference | Path | Use |
| --- | --- | --- |
| Admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Album workspace, online selection, schedule, order UX |
| Miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Phone login, negatives, order cards, booking UX |

Production targets:

| Area | Path |
| --- | --- |
| Backend | `backend` |
| Admin UI | `admin-ui` |
| H5 / WeChat / Douyin pickup client | `mobile-uniapp` |
| WeChat build output | `mobile-uniapp\dist\build\mp-weixin` |
| Douyin build output | `mobile-uniapp\dist\build\mp-toutiao` |
| API domain | `https://api.evanshine.me` |

## Desktop Source Of Truth

| Purpose | File |
| --- | --- |
| Overall takeover plan | `C:\Users\Administrator\Desktop\yiyue\00-权威入口-朋友项目接手与优化规划.md` |
| Admin/frontend map | `C:\Users\Administrator\Desktop\yiyue\前端优化\00-权威入口-前端优化地图与计划.md` |
| Miniapp map | `C:\Users\Administrator\Desktop\yiyue\抖音小程序\00-权威入口-抖音小程序地图与计划.md` |

## Guardrails

- Do not replace the current Spring Boot / RuoYi-Vue-Plus / PostgreSQL / uni-app production stack with the generic stack options in `C:\Users\Administrator\Downloads\综合架构设计(1).md`.
- Do not replace `admin-ui` with the friend Vue/Tailwind/Radix stack.
- Do not replace `mobile-uniapp` with the friend Taro/React source.
- Do not import the generic SQL tables from the comprehensive architecture document directly; map them to existing `yy_order`, `yy_customer`, `yy_channel_*`, and `yy_photo_*` tables.
- Do not migrate demo backend, MinIO, public image URLs, old AppIDs, or secrets.
- Do not move Douyin Life SPI/Webhook/refund/code-issue logic into the miniapp.
- Do not make OSS public-read for preview convenience.
- Keep core orders, albums, customer data, and OSS permission checks in Spring Boot.

## 2026-06-11 Comprehensive Architecture Absorption

| Item | Decision |
| --- | --- |
| Source doc | `C:\Users\Administrator\Downloads\综合架构设计(1).md` |
| Tech stack | Keep Spring Boot / RuoYi-Vue-Plus / PostgreSQL / Redis / Element Plus / uni-app |
| Database | Do not create duplicate `appointments` or `payment_orders` P0 tables; keep `yy_order` as the unified order ledger |
| Platform adapters | Continue using `YyChannelAdapterService` plus `DOUYIN_LIFE` / `WECHAT` / `MEITUAN` adapters |
| Sync logs | Continue using `yy_channel_sync_log`; add batch/error tables only after volume requires it |
| Miniapps | Keep `mobile-uniapp`; Taro remains reference only |
| Detailed map | `docs/comprehensive-architecture-absorption-20260611.md` |

## 2026-06-11 Order / Payment / Inventory Authority

| Item | Current decision |
| --- | --- |
| Database | PostgreSQL. Existing DB migration: `backend\script\sql\postgres\postgres_yy_order_payment_migration_20260611.sql`; fresh DB script: `backend\script\sql\postgres\postgres_yy_cloud.sql` |
| Unified order ledger | `yy_order` remains the only order / appointment ledger |
| Self-owned payment ledger | `yy_payment_record` is reserved for WeChat Pay and `DOUYIN_MINI_APP tt.pay` |
| Douyin Life payment | `DOUYIN_LIFE` payment happens on Douyin Life; Yingyue only syncs order/payment facts by SPI/Webhook/OpenAPI |
| Miniapp payment | `DOUYIN_MINI_APP` payment is P1 and must use independent preorder / pay notify / status query endpoints |
| Unified inventory lock | `yy_booking_slot_inventory` is the local all-channel slot-capacity lock |
| Douyin inventory mirror | `yy_channel_inventory_slot` is only the Douyin platform mirror and debugging record |
| Anti-oversell rule | Deduct inventory after successful payment; conflicts become `STOCK_CONFLICT / CONFLICT` for manual reschedule |
| Douyin stock-query | `/api/douyin/life/reservation/stock-query` now prefers `yy_booking_slot_inventory`, then falls back to `yy_channel_inventory_slot` |

## Implementation Roadmap

| Priority | Work | Production target | Verification |
| --- | --- | --- | --- |
| P0 | Real private OSS acceptance: upload, objectKey, visible asset, H5 preview/download, bare OSS 403 | `admin-ui`, `backend`, `tools\photo-pickup-local-acceptance.ps1` | Browser + smoke script evidence |
| P0 | WeChat/Douyin devtools import and phone + pickup-code flow | `mobile-uniapp\dist\build\mp-weixin`, `dist\build\mp-toutiao` | Login, album list, detail, preview, save |
| P1 | Absorb admin album workspace UX | `admin-ui\src\views\yy\photo\index.vue` | `npm run test:yy -- photoPageContract photoPickupEntry`; `npm run build:dev` |
| P1 | Absorb mobile login/negatives/order-card UX | `mobile-uniapp\src\pages\pickup\*`, `src\styles\app.scss` | `npm test`; `typecheck`; all builds. Latest: album detail has state-aware `下一步` guidance, selection-order guidance, preview progress, and save safety note |
| P1 | Add WeChat/Douyin phone authorization | `mobile-uniapp\src\platform\phone-auth.mjs`, `ClientPhotoMiniAppPhoneAuthProvider.java` | Real-device auth succeeds; pickup code fallback still works |
| P2 | Bind Douyin Life paid/reservation orders to albums | `DouyinLifeChannelAdapter.java`, `YyPhotoAlbumServiceImpl.java` | Paid/reserved order creates or reuses album placeholder |
| P2 | Commercial selection workflow | album/product/client selection modules | selected count, extra retouch, download/share/audit visible in admin |

## Remaining Execution Checklist

| Priority | Task | Done when |
| --- | --- | --- |
| P0 | Commit current order/inventory changes | Git includes backend inventory ledger, admin inventory page, order fields, PostgreSQL migration, docs; no secrets are staged |
| P0 | Apply PostgreSQL migration | Production DB has `yy_payment_record`, `yy_booking_slot_inventory`, and `yy_order` payment/inventory fields |
| P0 | Deploy and smoke | Backend health, admin menu, `/client/photo/*`, `/api/douyin/life/reservation/stock-query`, and order sync return expected JSON |
| P0 | Real private OSS pickup acceptance | Bare OSS URL is not public; H5/WeChat/Douyin can preview and save through backend stream/signature |
| P0 | Douyin Life real order loop | Paid Douyin Life order syncs to `yy_order`, creates/reuses album placeholder, appears in unified export |
| P1 | WeChat Pay | Signed notify writes `yy_payment_record`, updates `yy_order`, and deducts `yy_booking_slot_inventory` |
| P1 | Douyin miniapp `tt.pay` | `DOUYIN_MINI_APP` preorder, pay notify, and status query are implemented separately from DOUYIN_LIFE |
| P1 | Platform phone authorization | WeChat/Douyin phone auth binds customer identity while pickup code fallback remains available |

## 2026-06-09 Mobile Detail Next Step

| Item | Result |
| --- | --- |
| Improvement | Added `getDeliveryNextStep(...)` and a customer-facing `下一步` panel on the album detail page |
| States | Waiting upload, ready to select, selected but not submitted, submitted, retouching, delivered, and preview-error states now each have a clear action |
| Files | `mobile-uniapp\src\pages\pickup\detail\detail-state.mjs`, `detail\index.vue`, `src\styles\app.scss`, `tests\detail-state.test.cjs`, `tests\pickup-ui-polish-contract.test.cjs` |
| Verification | `npm test -- detail-state.test.cjs` -> 48 passed; `npm test -- pickup-ui-polish-contract.test.cjs` -> 48 passed; `npm run typecheck`; `build:h5`; `build:mp-weixin`; `build:mp-toutiao` all passed |

## 2026-06-09 Public Preflight Guard

| Item | Result |
| --- | --- |
| Public basic preflight | `.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount -CheckDouyinMissingSignature` passed |
| Verified routes | Preview account auth, album list, empty album detail, auth JSON route, and Douyin missing-signature rejection |
| Script shortcut | `.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount` passed and is the shortest public empty-album check |
| Script guard | `photo-pickup-smoke.ps1` warns when public API is tested with local demo defaults and prints the correct empty-preview command |
| Real OSS evidence helper | `.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs` now prints the exact required fields and copyable commands for the production image acceptance |
| Remaining P0 gap | Public preview album is still empty, so thumbnail/preview/download/stream/bare OSS 403 need a production test image before final acceptance. First run `-PrintRequiredInputs`, then generate evidence with explicit phone/code/album/asset/BareOssUrl |

## 2026-06-11 Mobile Pickup UI Polish

| Item | Result |
| --- | --- |
| Album detail | Added customer-facing selection guidance: tap the top-right select button, selection order is retouch order, and store staff process submitted choices in order |
| Preview page | Added image position progress and a save safety note explaining that original-photo save rechecks pickup identity and does not expose admin URLs or long-lived OSS links |
| Files | `mobile-uniapp\src\pages\pickup\detail\index.vue`, `preview\index.vue`, `src\styles\app.scss`, `tests\pickup-ui-polish-contract.test.cjs` |
| Verification | `npm test -- tests/pickup-ui-polish-contract.test.cjs` -> 103 passed; `npm run typecheck`; `npm run build:h5`; `npm run build:mp-weixin`; `npm run build:mp-toutiao` all passed |

## Verification Commands

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy -- photoPageContract photoPickupEntry orderPageContract
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyClientPhotoServiceImplTest,YyPhotoAlbumServiceImplTest,YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest,DouyinLifeChannelAdapterTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
mvn -pl ruoyi-admin -am -DskipTests package
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-platform-readiness.ps1 -BaseUrl https://api.evanshine.me -SkipGithub
```

Real OSS evidence helper:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs
```
