# Studio Workbench Micro Form Store Scope Deploy - 2026-06-19

## Summary

- Release: `prod-e2f64ca-micro-form-store-scope-20260619-0418`
- Git commit: `e2f64ca feat(studio): scope micro forms by store`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment adds real-store scoping to merchant micro forms and preserves `fromSubmissionId` when staff returns from inventory capacity handling to the staff-booking entry page.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts
# Test Files 2 passed
# Tests 11 passed

npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/public/PublicMicroFormView.contract.test.ts src/features/orders/microFormSubmissionBooking.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts
# Test Files 8 passed
# Tests 40 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-e2f64ca-micro-form-store-scope-20260619-0418'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Package

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-e2f64ca-micro-form-store-scope-20260619-0418.zip
SIZE_BYTES=694127
SHA256=9FB414A0B6E43529A1E3F2D75833933EE5B7C879837B619A36270A10054336FA
```

## HK2 Deploy

```text
SERVER=103.24.216.8
REMOTE_ZIP=/opt/yingyue/releases/studio-workbench-prod-e2f64ca-micro-form-store-scope-20260619-0418.zip
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-e2f64ca-micro-form-store-scope-20260619-0418
BACKUP=/opt/yingyue/backups/20260619-041955-pre-studio-workbench-prod-e2f64ca-micro-form-store-scope-20260619-0418
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
https://studio.evanshine.me/merchant/micro-forms?cb=prod-e2f64ca-micro-form-store-scope-20260619-0418 -> 200, marker=True
https://studio.evanshine.me/merchant/inventory?returnTo=staffBooking&fromSubmissionId=smoke-ctx&date=2026-06-19&storeId=900000000000000100&slotStart=10:00&slotEnd=10:30&cb=prod-e2f64ca-micro-form-store-scope-20260619-0418 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?fromSubmissionId=smoke-ctx&cb=prod-e2f64ca-micro-form-store-scope-20260619-0418 -> 200, marker=True
https://studio.evanshine.me/public/micro-form/demo?storeId=900000000000000100&cb=prod-e2f64ca-micro-form-store-scope-20260619-0418 -> 200, marker=True
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI/SPI reads or writes.
- No order, appointment, inventory, schedule, album, or micro-form data writes during deployment.
- Micro-form public links still only carry store context; they do not create orders or occupy inventory by themselves.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-041955-pre-studio-workbench-prod-e2f64ca-micro-form-store-scope-20260619-0418/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
