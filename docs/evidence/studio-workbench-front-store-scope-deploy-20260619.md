# Studio Workbench Front Store Scope Deploy - 2026-06-19

## Summary

- Release: `prod-72914df-front-store-scope-20260619-0731`
- Git commit: `72914df fix(studio): scope more store filters`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment tightens more staff-facing store filters so inventory, merchant micro forms, and Douyin Life product mapping pages no longer expose an all-store operation entry.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts
# Test Files 3 passed
# Tests 19 passed

npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts src/features/stores/StoreView.contract.test.ts
# Test Files 8 passed
# Tests 49 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-72914df-front-store-scope-20260619-0731'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Package

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-72914df-front-store-scope-20260619-0731.zip
SIZE_BYTES=693705
SHA256=ED3FB5DEABCA47E59BCC476110720E18F398F9AF3DF1CB9504FE17B360EA4143
```

## HK2 Deploy

```text
SERVER=103.24.216.8
REMOTE_ZIP=/opt/yingyue/releases/studio-workbench-prod-72914df-front-store-scope-20260619-0731.zip
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-72914df-front-store-scope-20260619-0731
BACKUP=/opt/yingyue/backups/20260619-073315-pre-studio-workbench-prod-72914df-front-store-scope-20260619-0731
SITE=/var/www/studio.evanshine.me
SITE_FILES=111
MARKER_COUNT=10
RELEASE_TXT=prod-72914df-front-store-scope-20260619-0731
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
https://studio.evanshine.me/merchant/inventory?date=2026-06-19&storeId=900000000000000100&cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms?cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
https://studio.evanshine.me/product/douyin?cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?fromSubmissionId=smoke-ctx&cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
https://studio.evanshine.me/order/appointment?storeId=900000000000000100&cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?storeId=900000000000000100&cb=prod-72914df-front-store-scope-20260619-0731 -> 200, marker=True
```

Browser read-only check:

```text
URL after guard: https://studio.evanshine.me/login?redirect=/product/douyin?cb=prod-72914df-front-store-scope-20260619-0731&reason=access
title: 影约云门店工作台
release asset marker: true
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI/SPI reads or writes.
- No order, appointment, inventory, schedule, album, product mapping, or micro-form data writes during deployment.
- Static smoke confirms route fallback and release marker only; staff-login functional checks remain separate from this no-write deploy.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-073315-pre-studio-workbench-prod-72914df-front-store-scope-20260619-0731/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
