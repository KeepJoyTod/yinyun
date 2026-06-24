# Workspace Friend Project Takeover Plan

Date: 2026-06-09 11:08

## Result

Production remains:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

The friend projects are reference assets only:

| Project | Path | Use |
| --- | --- | --- |
| Admin/UI reference | `D:\OtherProject\CameraApp\photoshop-master` | Album workspace, online selection, schedule board, order filtering |
| Miniapp reference | `D:\OtherProject\CameraApp\yuyue-main` | Taro login, booking, orders, negatives selection |
| Production admin | `admin-ui` | RuoYi Vue3/Element Plus |
| Production H5/WeChat/Douyin | `mobile-uniapp` | uni-app build outputs |
| Production backend | `backend` | Spring Boot core business and Douyin Life SPI |

Do not migrate demo runtimes, demo backends, MinIO, public image URLs, demo AppIDs, or secrets.

Newer control-map entry for ongoing execution:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\workspace-friend-project-control-map-20260609-latest.md
```

## Fresh Verification

| Check | Result |
| --- | --- |
| `mobile-uniapp npm test` | 41 passed |
| `mobile-uniapp npm run typecheck` | passed |
| `mobile-uniapp npm run build:h5` | passed |
| `mobile-uniapp npm run build:mp-weixin` | passed |
| `mobile-uniapp npm run build:mp-toutiao` | passed |
| backend client-photo subset | 25 passed |

Backend subset command:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,ClientPhotoMiniAppPhoneAuthProviderTest,YyPhotoAccessLogServiceImplTest,YyPhotoAlbumServiceImplTest" test
```

## Official Miniapp Values

| Platform | AppID | Import path |
| --- | --- | --- |
| WeChat | `wx2a1a34748f56a6c6` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| Douyin | `tta3c8d5753dac3aae01` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

Legal domains:

```text
https://api.evanshine.me
```

## Admin Reference Absorption

| User feature | Friend source | Production target | Priority |
| --- | --- | --- | --- |
| Dashboard metrics | `photoshop-master/frontend/src/features/dashboard/DashboardView.vue` | `admin-ui/src/views/yy/dashboard/index.vue` | P1 |
| Order filtering | `photoshop-master/frontend/src/features/orders/OrdersView.vue` | `admin-ui/src/views/yy/order/index.vue` | P1 |
| Schedule board | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | Future reservation stock page | P2 |
| Album workspace | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | In progress |
| Selection link and QR | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | `photoPickupEntry.ts` | In progress |
| Store state/actions | `photoshop-master/frontend/src/shared/stores/appStore.ts` | Existing RuoYi APIs/utilities | Reference only |

## Miniapp Reference Absorption

| User feature | Friend source | Production target | Priority |
| --- | --- | --- | --- |
| Login/phone/code | `yuyue-main/client/src/pages/auth/*` | `pickup/login`, `platform/*` | P1 |
| Negatives selection | `yuyue-main/client/src/pages/negatives/index.tsx` | `pickup/detail` | First pass done |
| Orders | `yuyue-main/client/src/pages/orders/*` | Future `mobile-uniapp/src/pages/orders` | P1 |
| Booking | `yuyue-main/client/src/pages/booking/confirm/index.tsx` | Future booking module | P2 |
| Request wrapper | `yuyue-main/client/src/api/request.ts` | `mobile-uniapp/src/api/request.ts` | Reference only |

## Next Plan

### P0

1. Import WeChat and Douyin build outputs in official devtools.
2. Configure request/upload/download legal domains to `https://api.evanshine.me`.
3. Upload one real OSS test image.
4. Verify raw OSS URL returns 403, signed preview/download works, and `/stream` works.
5. Run real-device preview/save acceptance.

### P1

1. Admin album workspace polish: thumbnail evidence, objectKey diagnostics, recent failures, customer selection state.
2. Pickup entry polish: QR download, customer copy template, expiry and recent access summary.
3. Platform phone auth: WeChat and Douyin phone authorization with manual pickup-code fallback.
4. Douyin Life order-to-album binding: paid/reserved orders create or bind customer albums.

### P2

1. Reservation stock board from the friend schedule UI.
2. Customer order center in miniapps.
3. Retouching/delivery workflow after selection submission.
4. Audit/report export using RuoYi systems.
