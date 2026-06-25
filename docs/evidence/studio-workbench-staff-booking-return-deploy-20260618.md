# Studio Workbench Staff Booking Return Deploy - 2026-06-18

## Result

`studio-workbench` release `prod-d527524-staff-booking-return-20260618-0240` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

## Scope

- Frontend only: `studio-workbench/dist` deployed to `/var/www/studio.evanshine.me`.
- Backend, database, nginx site config, Douyin OpenAPI settings, OSS, and miniapp builds unchanged.
- This release completes the blocked-slot loop:
  - `/order/staff-booking` full/conflict recommended slot -> `/merchant/inventory`.
  - Inventory page keeps `returnTo=staffBooking`, `slotStart`, and `slotEnd`.
  - Staff can click `回到录入预约` and return to a prefilled booking modal for the same store, service group, date, and time slot.

## Code

```text
Commit: d527524 feat(studio): return to booking after inventory fix
Branch: yingyue-closed-loop-optimization-20260603
```

Changed files:

```text
studio-workbench/src/features/merchant/InventoryView.vue
studio-workbench/src/features/merchant/InventoryView.contract.test.ts
studio-workbench/src/features/orders/StaffBookingEntryView.vue
studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts
```

## Verification

Local:

```text
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
-> 6 files, 107 tests passed

npm --prefix studio-workbench run build
-> passed; existing Vite chunk-size warning only

git diff --check
-> passed; CRLF warnings only
```

Production build:

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-d527524-staff-booking-return-20260618-0240
npm --prefix studio-workbench run build
-> passed; existing Vite chunk-size warning only
```

Package:

```text
Local package: D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-d527524-staff-booking-return-20260618-0240.zip
SHA256: FAA171DE6837D5731DBF49A1EAB8EF9F0B9C2EE7093BC0295948237D4E3499C5
Remote package: /opt/yingyue/releases/studio-workbench-prod-d527524-staff-booking-return-20260618-0240.zip
```

Deployment:

```text
release=prod-d527524-staff-booking-return-20260618-0240
release_dir=/opt/yingyue/releases/studio-workbench-prod-d527524-staff-booking-return-20260618-0240
backup=/opt/yingyue/backups/20260618-0240-pre-studio-workbench-prod-d527524-staff-booking-return-20260618-0240
site=/var/www/studio.evanshine.me
nginx -t -> successful
systemctl reload nginx -> successful
```

Public HTTP:

```text
GET https://studio.evanshine.me/?cb=prod-d527524-staff-booking-return-20260618-0240
-> 200, marker=True

GET https://studio.evanshine.me/dashboard/today?cb=prod-d527524-staff-booking-return-20260618-0240
-> 200, marker=True

GET https://studio.evanshine.me/order/staff-booking?cb=prod-d527524-staff-booking-return-20260618-0240
-> 200, marker=True

GET https://studio.evanshine.me/merchant/inventory?date=2026-06-18&cb=prod-d527524-staff-booking-return-20260618-0240
-> 200, marker=True
```

## Local Maps Updated

```text
docs\yiyue\function_map.md
docs\yiyue\optimization_map.md
docs\yiyue\jianyue_benchmark_map.md
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260618-0240-pre-studio-workbench-prod-d527524-staff-booking-return-20260618-0240/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

