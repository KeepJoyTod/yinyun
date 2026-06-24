# Studio Workbench Micro Form Store Slot Guard Deploy - 2026-06-19

## Summary

- Release: `prod-37896f6-micro-form-store-slot-guard-20260619-0406`
- Git commit: `37896f6 feat(studio): bind micro forms to store schedule guard`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment adds store binding for micro forms and protects customer-requested micro-form time slots with an inventory check before staff can save them as scheduled appointments.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/public/PublicMicroFormView.contract.test.ts src/features/orders/microFormSubmissionBooking.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts
# Test Files 7 passed
# Tests 35 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-37896f6-micro-form-store-slot-guard-20260619-0406'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Package

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-37896f6-micro-form-store-slot-guard-20260619-0406.zip
SIZE_BYTES=695009
SHA256=3E0536F8B1EE33D49C406F99D7F7DA60E9625F5615851F9707647AF1F8B6DC70
```

## HK2 Deploy

```text
SERVER=103.24.216.8
REMOTE_ZIP=/opt/yingyue/releases/studio-workbench-prod-37896f6-micro-form-store-slot-guard-20260619-0406.zip
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-37896f6-micro-form-store-slot-guard-20260619-0406
BACKUP=/opt/yingyue/backups/20260619-040612-pre-studio-workbench-prod-37896f6-micro-form-store-slot-guard-20260619-0406
SITE=/var/www/studio.evanshine.me
SITE_FILES=111
MARKER_COUNT=10
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
https://studio.evanshine.me/merchant/micro-forms?cb=prod-37896f6-micro-form-store-slot-guard-20260619-0406 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms/new?cb=prod-37896f6-micro-form-store-slot-guard-20260619-0406 -> 200, marker=True
https://studio.evanshine.me/public/micro-form/demo?cb=prod-37896f6-micro-form-store-slot-guard-20260619-0406&storeId=900000000000000100 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?cb=prod-37896f6-micro-form-store-slot-guard-20260619-0406 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-pages?cb=prod-37896f6-micro-form-store-slot-guard-20260619-0406 -> 200, marker=True
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI/SPI reads or writes.
- No order, appointment, inventory, schedule, album, or micro-form data writes during deployment.
- Customer-requested times from public forms still do not create schedule inventory automatically.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-040612-pre-studio-workbench-prod-37896f6-micro-form-store-slot-guard-20260619-0406/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
