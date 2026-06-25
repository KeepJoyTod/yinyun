# Friend Project Final Control Plan

Date: 2026-06-09 12:40

## Result

Production code remains only:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets:

| Project | Path | Role |
| --- | --- | --- |
| Production | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | Only production codebase |
| Friend admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Admin UX reference |
| Friend miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Taro miniapp flow reference |
| Desktop maps | `docs\yiyue` | Local maps, runbooks, evidence |

Do not absorb demo backends, MinIO, public image URLs, old AppIDs, tokens, secrets, or demo database models.

## Production Boundaries

| Area | Production owner |
| --- | --- |
| Core API | `https://api.evanshine.me` |
| Admin UI | `admin-ui` |
| H5 / WeChat / Douyin pickup | `mobile-uniapp` |
| Image storage | Private Aliyun OSS with signed URLs or `/stream` |
| Douyin Life | Spring Boot backend, `DOUYIN_LIFE` |
| Platform cloud | Optional BFF only, not primary ledger |

## Miniapp Values

| Platform | AppID | Build command | Import path |
| --- | --- | --- | --- |
| WeChat | `wx2a1a34748f56a6c6` | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| Douyin | `tta3c8d5753dac3aae01` | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

Legal domain for request/upload/download:

```text
https://api.evanshine.me
```

## Absorption Map

| Friend source | Production target | Priority | Note |
| --- | --- | --- | --- |
| `photoshop-master/frontend/src/features/orders/OrdersView.vue` | `admin-ui/src/views/yy/order/index.vue` | P0/P1 | Order pickup delivery status and shortcuts |
| `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | P0/P1 | Album upload, thumbnails, object key diagnostics |
| `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | `admin-ui/src/views/yy/utils/photoPickupEntry.ts` | P1 | QR, link, expiry, customer copy |
| `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | Future reservation stock page | P2 | Schedule and stock board |
| `yuyue-main/client/src/pages/auth/phone/index.tsx` | `mobile-uniapp/src/pages/pickup/login/index.vue` | P1 | Platform phone auth with pickup code fallback |
| `yuyue-main/client/src/pages/negatives/index.tsx` | `mobile-uniapp/src/pages/pickup/detail/index.vue` | P0/P1 | Photo grid and selection states |
| `yuyue-main/client/src/pages/orders/*` | Future miniapp order center | P1/P2 | Customer order center |

## P0

1. Verify real private OSS images through admin upload.
2. Confirm `yy_photo_asset.object_key` is populated.
3. Verify H5 login, albums, detail, preview, download, selection submit.
4. Verify raw OSS URL returns 403, signed URL works, `/stream` works.
5. Import WeChat and Douyin builds into official devtools.
6. Configure `https://api.evanshine.me` as request/upload/download domain.

## P1

1. Add admin order filter for undeliverable pickup orders.
2. Add order row shortcuts to album, upload, and pickup copy.
3. Improve album workspace thumbnails, object key diagnostics, visible toggles, and batch operations.
4. Improve pickup entry QR download, customer copy, expiry, recent access, and recent failures.
5. Add WeChat and Douyin phone authorization with pickup code fallback.
6. Bind Douyin Life paid/reserved orders to photo album placeholders.

## P2

1. Customer order center in miniapps.
2. Retouching/add-on/delivery workflow.
3. Reservation stock board.
4. Optional WeChat/Douyin cloud BFF POC.
5. Audit/report export.

## Verification

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
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
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyClientPhotoServiceImplTest,YyPhotoAlbumServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```
