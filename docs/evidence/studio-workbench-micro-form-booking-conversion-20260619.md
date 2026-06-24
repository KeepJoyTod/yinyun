# Studio Workbench Micro Form Booking Conversion - 2026-06-19

## Scope

- Frontend: `studio-workbench`
- Workflow: public micro-form submission -> staff manual booking -> linked order follow-up.
- Backend/database schema: unchanged.
- Douyin Life/OpenAPI: unchanged.

## Behavior

- `/order/forms` shows `转预约` for submissions without an `orderId`.
- The button routes to `/order/staff-booking?fromSubmissionId=<id>&scheduleMode=UNDECIDED`.
- Customer name, phone, and answers are not passed in the URL.
- `StaffBookingEntryView` loads submission detail with `GET /yy/microFormSubmission/{id}` and opens `StaffBookingModal`.
- The booking modal defaults to `UNDECIDED`; no inventory is occupied until staff selects a real scheduled slot.
- After `POST /yy/order/staff-booking` succeeds, the submission is linked by `PUT /yy/microFormSubmission/follow` with `FOLLOWED + orderId`.
- If linking fails after order creation, the new order path still opens and the link failure is shown as a non-blocking error.

## Code

```text
studio-workbench/src/features/orders/OrderFormSubmissionsView.vue
studio-workbench/src/features/orders/OrderFormSubmissionsView.contract.test.ts
studio-workbench/src/features/orders/StaffBookingEntryView.vue
studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts
studio-workbench/src/features/orders/StaffBookingModal.vue
studio-workbench/src/features/orders/StaffBookingModal.contract.test.ts
studio-workbench/src/shared/api/backend.ts
studio-workbench/src/shared/api/backend.contract.test.ts
```

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrderFormSubmissionsView.contract.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/shared/api/backend.contract.test.ts
# Test Files 4 passed
# Tests 32 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# passed
```

Known warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification.

## Production Build

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-52e2691-micro-form-booking-20260619-0239'
npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

Package:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-52e2691-micro-form-booking-20260619-0239.zip
SHA256=2CA10CBBA26CAB0DDE9E128924DD13B5695647326BB484450777A177990795C4
SIZE_BYTES=689261
```

## Deployment

```text
Release: prod-52e2691-micro-form-booking-20260619-0239
Commit: 52e2691 feat(studio): convert micro form submissions to bookings
Target: HK2 /var/www/studio.evanshine.me
Backup: /opt/yingyue/backups/20260619-023954-pre-studio-workbench-prod-52e2691-micro-form-booking-20260619-0239
Release dir: /opt/yingyue/releases/studio-workbench-prod-52e2691-micro-form-booking-20260619-0239
Site files: 111
Marker count: 10
yingyue-admin.service: active
nginx -t: successful
```

HTTP smoke:

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/forms?cb=prod-52e2691-micro-form-booking-20260619-0239 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?fromSubmissionId=0&scheduleMode=UNDECIDED&cb=prod-52e2691-micro-form-booking-20260619-0239 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms?cb=prod-52e2691-micro-form-booking-20260619-0239 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-52e2691-micro-form-booking-20260619-0239 -> 200, marker=True
```

Browser smoke:

```text
Opened /order/forms, /order/staff-booking?fromSubmissionId=0&scheduleMode=UNDECIDED, /merchant/micro-forms.
Observed release asset: /assets/prod-52e2691-micro-form-booking-20260619-0239/index-*.js
No console error/warn logs captured.
Current browser session had no valid staff login state, so protected routes redirected to:
https://studio.evanshine.me/login?redirect=...&reason=access
```

Real logged-in conversion smoke is intentionally not recorded here because it would require selecting a real submission and may lead to a real local booking mutation if saved.

## Local Maps

Updated:

```text
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
C:\Users\Administrator\Desktop\yiyue\api_map.md
```

## Boundaries

- No automatic order creation from public micro-page CTA.
- No inventory occupancy without a real staff-confirmed time slot.
- No customer private fields in the `fromSubmissionId` deep link.
- No real production customer mutation was performed during local verification.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-023954-pre-studio-workbench-prod-52e2691-micro-form-booking-20260619-0239/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
