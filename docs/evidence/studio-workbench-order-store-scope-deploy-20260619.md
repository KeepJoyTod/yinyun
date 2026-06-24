# Studio Workbench Order Store Scope Deploy - 2026-06-19

## Summary

- Release: `prod-8c8ab8e-order-store-scope-20260619`
- Git commit: `8c8ab8e fix(studio): scope appointment orders by store`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment tightens `/order/appointment` so appointment orders are scoped to one concrete store instead of exposing an all-store option in the workbench UI.

## Behavior

- The top order-page store filter no longer renders a clickable `全部门店`.
- Advanced store filter options are real stores only.
- URL sync writes `storeId`, `astore`, and `dm` from the resolved concrete store scope.
- Slot-scoped order queries still accept dashboard deep links with `storeId`, and fall back to the current concrete store when `storeId` is missing.
- Staff-booking modal opened from the order page is prefilled with the current concrete store.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
# Test Files 1 passed
# Tests 45 passed

npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts
# Test Files 4 passed
# Tests 120 passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

Production build:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-8c8ab8e-order-store-scope-20260619'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Package

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-8c8ab8e-order-store-scope-20260619.zip
SIZE_BYTES=692176
SHA256=6680614171771A6CF2B287BBC89EF24B8557A0A54E55AB3D9B93B07E583B1FE0
```

## HK2 Deploy

```text
SERVER=103.24.216.8
REMOTE_ZIP=/opt/yingyue/releases/studio-workbench-prod-8c8ab8e-order-store-scope-20260619.zip
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-8c8ab8e-order-store-scope-20260619
BACKUP=/opt/yingyue/backups/20260619-045701-pre-studio-workbench-prod-8c8ab8e-order-store-scope-20260619
SITE=/var/www/studio.evanshine.me
SITE_FILES=111
MARKER_COUNT=4
yingyue-admin.service=active
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/?cb=prod-8c8ab8e-order-store-scope-20260619 -> 200, marker=True
https://studio.evanshine.me/login?cb=prod-8c8ab8e-order-store-scope-20260619 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?date=2026-06-19&storeId=900000000000000100&slotStart=13:30&slotEnd=14:00&cb=prod-8c8ab8e-order-store-scope-20260619 -> 200, marker=True
https://studio.evanshine.me/order/appointment?date=2026-06-19&start=2026-06-19&end=2026-06-19&storeId=900000000000000100&slotStart=13:30&slotEnd=14:00&quick=all&cb=prod-8c8ab8e-order-store-scope-20260619 -> 200, marker=True
https://studio.evanshine.me/service/photos?cb=prod-8c8ab8e-order-store-scope-20260619 -> 200, marker=True
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI/SPI reads or writes.
- No order, appointment, inventory, schedule, album, or micro-form data writes during deployment.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-045701-pre-studio-workbench-prod-8c8ab8e-order-store-scope-20260619/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
