# Studio Workbench Order Operation Logs Deploy - 2026-06-19

## Summary

- Release: `prod-fb5f116-order-operation-logs-20260619-030846`
- Git commit: `fb5f116 feat(studio): show order operation logs`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment lets the appointment order detail drawer merge matched backend operation logs into the order timeline.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/settings/logsOperations.test.ts
# Test Files 4 passed
# Tests 83 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# passed
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. Existing warning, not a blocker.

## Production Build

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-fb5f116-order-operation-logs-20260619-030846'
npm --prefix studio-workbench run build
```

Package:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-fb5f116-order-operation-logs-20260619-030846.zip
SHA256=EC0FA117247999BFFFA0E566CFDE98F03D5AC06CE1B1ABAD92EE6158DDB4FF06
SIZE_BYTES=691715
```

## HK2 Deploy

Remote:

```text
SERVER=103.24.216.8
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-fb5f116-order-operation-logs-20260619-030846
BACKUP=/opt/yingyue/backups/20260619-030935-pre-studio-workbench-prod-fb5f116-order-operation-logs-20260619-030846
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
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-fb5f116-order-operation-logs-20260619-030846 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-fb5f116-order-operation-logs-20260619-030846 -> 200, marker=True
https://studio.evanshine.me/service/photos?cb=prod-fb5f116-order-operation-logs-20260619-030846 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-pages?cb=prod-fb5f116-order-operation-logs-20260619-030846 -> 200, marker=True
https://studio.evanshine.me/settings/logs?cb=prod-fb5f116-order-operation-logs-20260619-030846 -> 200, marker=True
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI reads or writes.
- No order, appointment, inventory, schedule, album, or operation-log writes during deployment.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-030935-pre-studio-workbench-prod-fb5f116-order-operation-logs-20260619-030846/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
