# Workspace Friend Project Control Map

Date: 2026-06-09 11:40

## Result

Production remains:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets only:

| Project | Path | Role |
| --- | --- | --- |
| Production backend/admin/mobile | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | Only production target |
| Admin UI reference | `D:\OtherProject\CameraApp\photoshop-master` | Album workspace, online selection, order and schedule UX |
| Miniapp reference | `D:\OtherProject\CameraApp\yuyue-main` | Taro login, booking, orders, negatives selection |
| Desktop Douyin folder | `docs\yiyue\抖音小程序` | Docs/AppID/maps, not importable source |

Do not migrate demo runtimes, demo backends, MinIO, public image URLs, old AppIDs, tokens, or secrets.

## Official Miniapp Values

| Platform | AppID | Build command | Import path |
| --- | --- | --- | --- |
| WeChat | `wx2a1a34748f56a6c6` | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| Douyin | `tta3c8d5753dac3aae01` | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

Legal domains:

```text
https://api.evanshine.me
```

## Current Production Status

| Module | Status | Next |
| --- | --- | --- |
| Admin album | Upload, asset creation, pickup entry, diagnostics, selected photos are available | Verify real OSS image evidence |
| Admin order | Operations workbench and pickup diagnostics are available | Strengthen Douyin Life order/reservation-to-album tests |
| H5 pickup | Login, albums, detail, preview, download, selection submit are available | Real image regression |
| WeChat miniapp | AppID and build output ready | Devtools/real-device acceptance |
| Douyin miniapp | AppID and build output ready | Devtools/real-device acceptance |
| Douyin Life | SPI/OpenAPI remains in Spring Boot backend | Keep separate from miniapp UI |

## Absorption Map

| User feature | Friend source | Production target | Priority |
| --- | --- | --- | --- |
| Admin dashboard metrics | `photoshop-master/frontend/src/features/dashboard/DashboardView.vue` | `admin-ui/src/views/yy/dashboard/index.vue` | P1 |
| Order status workspace | `photoshop-master/frontend/src/features/orders/OrdersView.vue` | `admin-ui/src/views/yy/order/index.vue` | In progress |
| Album workspace | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | P0/P1 |
| Selection QR/link | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | `admin-ui/src/views/yy/utils/photoPickupEntry.ts` | P1 |
| Schedule slots | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | Future reservation stock page | P2 |
| Miniapp login | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/pages/pickup/login/index.vue`, `platform/*` | P1 |
| Miniapp negatives | `yuyue-main/client/src/pages/negatives/index.tsx` | `mobile-uniapp/src/pages/pickup/detail/index.vue` | First pass done |
| Miniapp orders | `yuyue-main/client/src/pages/orders/*` | Future `mobile-uniapp/src/pages/orders` | P1 |

## P0 Plan

1. Upload one real private OSS image through admin.
2. Verify `yy_photo_asset.object_key` is the real object key.
3. Verify H5 photo detail, preview, download, selection submit.
4. Verify raw OSS URL returns 403, signed preview/download works, and `/stream` works.
5. Import `mp-weixin` and `mp-toutiao` into official devtools.
6. Configure request/upload/download legal domains to `https://api.evanshine.me`.

## P1 Plan

1. Album workspace polish: thumbnails, object key diagnostics, recent failures, customer selected state.
2. Pickup entry polish: QR download, customer copy template, expiry and recent access summary.
3. Platform phone auth: WeChat and Douyin phone authorization with pickup-code fallback.
4. Douyin Life order-to-album binding: paid/reserved orders create or bind customer albums. Current backend coverage includes `reservation_pay_notify` creation, repeated notification idempotent album update, and missing-phone no-album boundary.
5. Customer order center in miniapps.

## P2 Plan

1. Reservation stock board from the friend schedule UI.
2. Retouching/add-on/delivery workflow after selection submission.
3. Audit and report export through RuoYi systems.
4. Optional WeChat/Douyin cloud BFF POC for login/proxy only.

## Verification

Admin:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

Mobile:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

Backend:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,ClientPhotoMiniAppPhoneAuthProviderTest,YyPhotoAccessLogServiceImplTest,YyPhotoAlbumServiceImplTest,DouyinLifeChannelAdapterTest" test
```

## 2026-06-09 12:05 Execution Update

Friend project roles are now locked:

| Reference | Stack | Use | Do not absorb |
| --- | --- | --- | --- |
| `photoshop-master` | Vue 3 + Vite + TypeScript + Tailwind v4 + Radix Vue | Admin album/order/schedule UX patterns | Demo backend, MinIO, Tailwind/Radix runtime |
| `yuyue-main/client` | Taro 4.1.9 + React 18 + TypeScript + Zustand | Miniapp login/order/negative-selection flow ideas | Taro runtime, old app config, demo API |
| `yuyue-main/admin` | Vue 3 + Vite + TypeScript | Lightweight admin layout ideas only | Replacement for RuoYi admin |

Production order operations update:

- Backend `YyOrderVo` now exposes `photoAlbumCount`.
- `YyOrderServiceImpl` fills album counts in batch from `yy_photo_album.order_id`.
- Admin order table now shows `取片状态`: `已生成相册`, `待生成相册`, or `缺手机号`.
- This makes order-to-album status visible before opening the detail drawer.

Verified:

```text
backend YyOrderServiceImplTest -> 6 passed
admin-ui npm run test:yy -> 52 passed
```
