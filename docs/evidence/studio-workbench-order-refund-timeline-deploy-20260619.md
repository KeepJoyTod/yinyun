# Studio Workbench Order Refund Timeline Deploy Evidence - 2026-06-19

## Release

```text
commit: 93ab192 feat(studio): expose order refund timeline
release: prod-93ab192-order-refund-timeline-20260619-033611
site: https://studio.evanshine.me
```

## Local Verification Before Deploy

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/shared/api/yingyueAdapter.test.ts
# 4 files / 91 tests passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-93ab192-order-refund-timeline-20260619-033611'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Deploy

```text
Uploaded: /tmp/studio-workbench-prod-93ab192-order-refund-timeline-20260619-033611.zip
Release dir: /opt/yingyue/releases/studio-workbench-prod-93ab192-order-refund-timeline-20260619-033611
Site dir: /var/www/studio.evanshine.me
release.txt: prod-93ab192-order-refund-timeline-20260619-033611
nginx -t: successful
yingyue-admin.service: active
```

## Smoke

```text
200 /release.txt
200 /order/appointment?quick=all
200 /dashboard/today
200 /settings/logs
200 /service/photos
marker=prod-93ab192-order-refund-timeline-20260619-033611
```

## Boundary

- Frontend-only deployment.
- No database migration.
- No backend jar replacement.
- No Douyin/OpenAPI write operation.
- Existing production backend stayed active.
