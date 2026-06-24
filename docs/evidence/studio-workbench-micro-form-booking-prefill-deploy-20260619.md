# Studio Workbench Micro Form Booking Prefill Deploy - 2026-06-19

## Summary

- Release: `prod-976d39e-micro-form-booking-prefill-20260619-0350`
- Git commit: `976d39e feat(studio): prefill booking from micro-form answers`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment lets `/order/forms -> 转预约 -> /order/staff-booking?fromSubmissionId=<id>` prefill staff booking fields from micro-form answers while keeping the booking as `UNDECIDED` until staff confirms a real slot.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/microFormSubmissionBooking.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/orders/OrderFormSubmissionsView.contract.test.ts src/shared/api/backend.contract.test.ts
# Test Files 5 passed
# Tests 36 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-976d39e-micro-form-booking-prefill-20260619-0350'
npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Package

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-976d39e-micro-form-booking-prefill-20260619-0350.zip
SIZE_BYTES=693887
SHA256=A11B14B94E33787B868B3D4F3BE8BCAF392F35CC88F4760A1318D07A0CFB12E4
```

## HK2 Deploy

```text
SERVER=103.24.216.8
REMOTE_ZIP=/opt/yingyue/releases/studio-workbench-prod-976d39e-micro-form-booking-prefill-20260619-0350.zip
RELEASE_DIR=/opt/yingyue/releases/studio-workbench-prod-976d39e-micro-form-booking-prefill-20260619-0350
BACKUP=/opt/yingyue/backups/20260619-035307-pre-studio-workbench-prod-976d39e-micro-form-booking-prefill-20260619-0350
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
https://studio.evanshine.me/order/forms?cb=prod-976d39e-micro-form-booking-prefill-20260619-0350 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?cb=prod-976d39e-micro-form-booking-prefill-20260619-0350 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-976d39e-micro-form-booking-prefill-20260619-0350 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-976d39e-micro-form-booking-prefill-20260619-0350 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms?cb=prod-976d39e-micro-form-booking-prefill-20260619-0350 -> 200, marker=True
```

## Boundaries

- Frontend static deployment only.
- No backend restart.
- No database migration.
- No Douyin OpenAPI/SPI reads or writes.
- No order, appointment, inventory, schedule, album, or micro-form data writes during deployment.
- Micro-form expected time remains reference data; staff must confirm a real scheduled slot before inventory is occupied.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-035307-pre-studio-workbench-prod-976d39e-micro-form-booking-prefill-20260619-0350/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
