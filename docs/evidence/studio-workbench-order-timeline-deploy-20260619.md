# Studio Workbench Order Timeline Deploy - 2026-06-19

## Summary

- Release: `prod-afe5a49-order-timeline-20260619-0225`
- Git commit: `afe5a49 feat(studio): add order detail timeline`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment replaces the static three-line appointment order drawer operation record with a unified readable timeline.

## Code Changes

| Area | File | Change |
| --- | --- | --- |
| Order helper | `studio-workbench/src/features/orders/orderOperations.ts` | Adds `buildOrderDetailTimeline(order, album, channelSyncLogs)` |
| Order drawer | `studio-workbench/src/features/orders/OrdersView.vue` | Renders `selectedOrderTimeline` cards under `操作记录` |
| Tests | `orderOperations.test.ts`, `OrdersView.contract.test.ts` | Covers order entry, appointment slot, current state, cancellation/refund boundary, photo delivery stage, and channel sync summary |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts
# Test Files 2 passed
# Tests 70 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# passed
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing warning and not a deployment blocker.

## Production Build

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-afe5a49-order-timeline-20260619-0225'
npm --prefix studio-workbench run build
```

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\prod-afe5a49-order-timeline-20260619-0225.tgz
SIZE_BYTES=603717
SHA256=d8ce248ad6659d2fecedf5ddb98faa7e964fdabc6e520064fb45ff85829776d4
```

## Deploy

Remote:

```text
SERVER=103.24.216.8
RELEASE_DIR=/opt/yingyue/releases/prod-afe5a49-order-timeline-20260619-0225
BACKUP=/opt/yingyue/backups/20260619-022151-pre-prod-afe5a49-order-timeline-20260619-0225
SITE=/var/www/studio.evanshine.me
MARKER=prod-afe5a49-order-timeline-20260619-0225
SITE_FILES=111
ASSET_MARKER_COUNT=9
yingyue-admin.service=active
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> prod-afe5a49-order-timeline-20260619-0225
https://studio.evanshine.me/order/appointment?cb=prod-afe5a49-order-timeline-20260619-0225 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-afe5a49-order-timeline-20260619-0225 -> 200, marker=True
https://studio.evanshine.me/service/photos?cb=prod-afe5a49-order-timeline-20260619-0225 -> 200, marker=True
```

## Boundaries

- Frontend-only deployment.
- No backend restart.
- No database migration.
- No Douyin OpenAPI reads or writes.
- No order, appointment, inventory, schedule, or album data writes during deployment.

