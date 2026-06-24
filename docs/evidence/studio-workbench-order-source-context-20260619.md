# Studio Workbench Order Source Context Evidence - 2026-06-19

## Scope

- Added a safe order source context section to the appointment order detail drawer.
- Covered three operational sources:
  - micro-form converted booking
  - staff manual booking
  - DOUYIN_LIFE synchronized order
- No backend table change, no external Douyin call, no customer mutation.

## Code

- `studio-workbench/src/shared/stores/appStoreTypes.ts`
- `studio-workbench/src/shared/stores/appStoreTransforms.ts`
- `studio-workbench/src/features/orders/orderOperations.ts`
- `studio-workbench/src/features/orders/OrdersView.vue`

## Data Boundary

- Reads existing `yy_order` fields already returned by the backend:
  - `source`
  - `serviceMethod`
  - `channelType`
  - `externalProductId`
  - `externalSkuId`
  - `externalPoiId`
  - `remark`
- Does not read raw payloads.
- Does not expose full phone numbers from micro-form answers.
- Historical DOUYIN_LIFE orders without real slot fields still remain outside `yy_booking_slot_inventory`.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts
# 3 files / 76 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Production Deployment

```text
Release: prod-ceb266b-order-source-context-20260619-025509
Commit: ceb266b feat(studio): show order source context
Target: HK2 /var/www/studio.evanshine.me
Release dir: /opt/yingyue/releases/studio-workbench-prod-ceb266b-order-source-context-20260619-025509
Backup: /opt/yingyue/backups/20260619-025605-pre-studio-workbench-prod-ceb266b-order-source-context-20260619-025509
Site files: 111
Marker count: 10
yingyue-admin.service: active
nginx -t: successful
```

Production package:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-ceb266b-order-source-context-20260619-025509.zip
SHA256=EBC85A93FEF9F2FAC71249918EA4D8B8DEF51C36EA6D9C0B9C1675EB242424A8
SIZE_BYTES=691157
```

HTTP smoke:

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-ceb266b-order-source-context-20260619-025509 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-ceb266b-order-source-context-20260619-025509 -> 200, marker=True
https://studio.evanshine.me/order/forms?cb=prod-ceb266b-order-source-context-20260619-025509 -> 200, marker=True
https://studio.evanshine.me/service/photos?cb=prod-ceb266b-order-source-context-20260619-025509 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-pages?cb=prod-ceb266b-order-source-context-20260619-025509 -> 200, marker=True
```

Rollback:

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-025605-pre-studio-workbench-prod-ceb266b-order-source-context-20260619-025509/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
