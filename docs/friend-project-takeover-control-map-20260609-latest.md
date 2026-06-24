# Friend Project Takeover Control Map

Date: 2026-06-09

## Result

Production development stays in:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets only:

| Asset | Path | Use | Production target |
| --- | --- | --- | --- |
| Photo studio admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Album workspace, online selection, order filtering, schedule board | `admin-ui` |
| Desktop admin copy | `C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master` | Handover copy | Documentation and reference only |
| Taro miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Login, booking, orders, negatives selection | `mobile-uniapp` |
| Desktop miniapp copy | `C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main` | Handover copy | Documentation and reference only |

Do not migrate demo runtimes, demo backends, MinIO, public image URLs, old AppIDs, tokens, or secrets.

## Production Boundaries

| Area | Production source | Boundary |
| --- | --- | --- |
| Core API | `backend`, `https://api.evanshine.me` | Single source of truth for albums, orders, OSS permission, and Douyin Life logs |
| Admin operations | `admin-ui` | RuoYi / Element Plus remains the admin stack |
| H5 / WeChat / Douyin pickup | `mobile-uniapp` | One uni-app codebase builds H5, `mp-weixin`, and `mp-toutiao` |
| Douyin Life | `backend/ruoyi-modules/ruoyi-yy` | SPI, Webhook, voucher, refund, reservation, stock, verification |
| Image storage | Private Aliyun OSS | Client uses signed URLs or `/stream`, never long-lived public URLs |

## Friend Admin Map

| Feature | Reference file | Absorb | Production target |
| --- | --- | --- | --- |
| Shell and navigation | `photoshop-master/frontend/src/app/App.vue`, `shared/components/layout/*` | Navigation grouping and information density | Reference only |
| Routes | `frontend/src/app/router/index.ts` | Dashboard, orders, schedule, store, photo management, online selection | `admin-ui/src/views/yy/*` |
| Album workspace | `frontend/src/features/albums/PhotoMgmtView.vue` | Album side list, photo grid, upload, sorting, status tags | `admin-ui/src/views/yy/photo/index.vue` |
| Online selection | `frontend/src/features/selection/OnlineSelectionView.vue` | QR, share link, expiry, visits, extra selection stats | Pickup entry, selection rules, access audit |
| Orders | `frontend/src/features/orders/OrdersView.vue` | Customer/service/status troubleshooting | `admin-ui/src/views/yy/order/index.vue` |
| Schedule | `frontend/src/features/schedule/ScheduleView.vue` | Store/date/slot capacity board | Douyin reservation stock operations page |
| Selection config | `frontend/src/features/products/components/SelectionConfigModal.vue` | Included retouch count, max selectable, extra price, expiry | Album/package rule config |

Do not migrate: `photoshop-master/backend`, MinIO, Tailwind/Radix runtime, demo auth, demo seed data, public image links.

## Friend Miniapp Map

| Feature | Reference file | Absorb | Production target |
| --- | --- | --- | --- |
| App structure | `yuyue-main/client/src/app.config.ts` | Home, booking, negatives, orders, mine tabs | Future `mobile-uniapp/src/pages.json` expansion |
| Request wrapper | `client/src/api/request.ts` | Token injection, 401 cleanup, unified toast | `mobile-uniapp/src/api/request.ts` |
| Auth | `client/src/pages/auth/*` | Phone, code, agreement, redirect | `mobile-uniapp/src/pages/pickup/login/index.vue`, `src/platform/*` |
| Negatives | `client/src/pages/negatives/index.tsx` | Selection status, empty state, submit flow | `mobile-uniapp/src/pages/pickup/detail/index.vue` |
| Orders | `client/src/pages/orders/*` | Customer order cards and detail entry | Future customer order / album binding pages |
| Booking | `client/src/pages/services/*`, `booking/confirm` | Services, store schedule, confirmation | Future booking entry |

Do not migrate: Taro runtime, React components, demo server, mock payment, old AppID, dev tokens, secrets.

## Current Production Status

| Flow | State | Next |
| --- | --- | --- |
| Admin upload | RuoYi OSS upload creates `yy_photo_asset` and attempts thumbnail generation | Verify `thumbnailObjectKey` with real public test images |
| Album workspace | Pickup entry, photo troubleshooting, selection result, access troubleshooting, batch visible/hidden are available | Centralize real OSS failure reasons |
| H5 pickup | Phone + pickup code, albums, preview, download, selection, empty-album UI are available | Re-test with real public images |
| WeChat miniapp | AppID is configured; import `dist\build\mp-weixin` | Devtools and real-device acceptance |
| Douyin miniapp | AppID is configured; import `dist\build\mp-toutiao` | Devtools and real-device acceptance |
| Platform phone auth | Frontend entry and backend env placeholders are available | Configure real credentials and test |
| Douyin Life | Public paths converge to `api.evanshine.me` | Auto-create or bind albums from payment/reservation callbacks |

## Optimization Plan

### P0: Acceptance Baseline

| Task | Target | Acceptance |
| --- | --- | --- |
| Miniapp import | `dist\build\mp-weixin`, `dist\build\mp-toutiao` | Login, albums, preview, save work |
| Real image OSS smoke | Admin album + private OSS | Raw OSS is 403; `thumbnail-url`, `preview-url`, `download-url`, `/stream` work |
| Upload failure recovery | `admin-ui/src/views/yy/photo/index.vue` | Operators can see failure reason and retry asset creation |
| Docs consistency | Desktop maps + repo docs | Entrypoints point to production repo, not friend demos |

### P1: Absorb High-Value UX

| Task | Reference | Production target | Acceptance |
| --- | --- | --- | --- |
| Album photo workspace | `PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | Photo grid, status, sorting, missing object key are visible |
| Pickup QR and share copy | `OnlineSelectionView.vue` | `photoPickupEntry.ts`, album page | H5 / WeChat / Douyin copy is generated without exposing admin or OSS |
| Selection rules | `SelectionConfigModal.vue` | Album/package config | Retouch count, max selectable, extra price, expiry are configurable |
| Platform phone auth | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/*`, `/client/photo/auth/platform-login` | Success skips pickup code; failure falls back to manual login |
| Customer order entry | `yuyue-main/client/src/pages/orders/*` | Future `mobile-uniapp/src/pages/orders/*` | Customers open album from order |
| Douyin order album binding | `DOUYIN_LIFE` backend | Payment/reservation callbacks | Albums can be found by order, certificate code, or phone |

### P2: Productization

| Direction | Goal |
| --- | --- |
| Retouch delivery flow | Pending selection, submitted, retouching, downloadable, expired |
| Extra selection stats | Extra count, extra amount, conversion |
| Reservation stock board | Store/date/slot capacity and anomalies in one page |
| Access audit report | Preview, download, fail, expired, unauthorized are traceable |
| Platform cloud BFF POC | WeChat/Douyin cloud only for login, phone auth, lightweight proxy |

## Verification Baseline

| Command | Result |
| --- | --- |
| `mobile-uniapp npm test` | 27 passed |
| `mobile-uniapp npm run typecheck` | passed |
| `mobile-uniapp npm run build:h5` | DONE Build complete |
| `mobile-uniapp npm run build:mp-weixin` | DONE Build complete |
| `mobile-uniapp npm run build:mp-toutiao` | DONE Build complete |
| `admin-ui npm run test:yy` | 49 passed |
| `admin-ui npm run build:dev` | built successfully |
| `backend yy photo/auth/access/album subset` | 25 passed |
| `tools\yingyue-platform-readiness.ps1` | passed |

## 2026-06-09 Latest Audit Notes

- Access-log phone search now covers both plain input and encrypted `ENC_...` stored values; `REQ-BE-004` is complete.
- The friend admin demo remains strongest for `PhotoMgmtView.vue`, `OnlineSelectionView.vue`, `OrdersView.vue`, `ScheduleView.vue`, and `SelectionConfigModal.vue`.
- `FinanceView`, `CustomersView`, and `PackagesView` remain non-P0 reference material because they are incomplete or not central to the current pickup acceptance path.
- Already landed production capabilities should not be planned again: pickup entry, operations troubleshooting, selected-photo view, selection confirmation, order pickup summary, thumbnail URL, and admin upload thumbnail retry.
- If maps are refined again, prioritize function-level entries for photo upload, pickup-link generation, QR download, photo sort/rename/delete, and OSS object-key diagnostics.

## Next Operation Order

1. Read this file plus `docs/current-execution-board-20260609.md`.
2. Import `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` into WeChat DevTools.
3. Import `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` into Douyin DevTools.
4. Configure miniapp request/download/upload domains as `https://api.evanshine.me`.
5. Upload real test images from admin and run private OSS smoke.
6. Implement platform phone auth, then Douyin order/reservation album binding.

## 2026-06-09 Function-Level Map Update

| Area | Added map | Why it matters |
| --- | --- | --- |
| Friend admin demo | `PhotoMgmtView.vue` upload, sort, rename, delete, pickup-link generation; `OnlineSelectionView.vue` detail, copy, QR; `appStore.ts` upload/sort/link methods | Future admin changes can jump from a user request to the exact reference function and production target |
| Production admin | Mapped to `admin-ui/src/views/yy/photo/index.vue`, `photoUpload.ts`, `photoPickupEntry.ts`, `photoOperationsHealth.ts` | Prevents copying demo state or demo APIs |
| Friend Taro miniapp | App registration, request wrapper, phone login, orders, negatives selection/download | Future mobile changes can borrow flow without importing Taro runtime |
| Production uni-app | Mapped to `mobile-uniapp/src/pages/pickup/*`, `src/api/clientPhoto.ts`, `src/platform/douyin.ts` | Keeps H5 / WeChat / Douyin on one codebase |

Desktop source maps:

```text
C:\Users\Administrator\Desktop\yiyue\前端优化\latest-index.md
C:\Users\Administrator\Desktop\yiyue\抖音小程序\latest-index.md
```
