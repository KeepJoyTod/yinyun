# Studio Workbench Schedule Grid Entry Deploy - 2026-06-17

## Result

`studio-workbench` release `prod-530652c-schedule-grid-entry-20260617-1710` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

This deployment fixes the schedule page shown in the user screenshot:

- Morning / afternoon / evening slot sections now use wrapping grid cards instead of inner horizontal scroll rows.
- The schedule page now has a visible staff manual booking entry: `店员录入 · 新增预约`.
- The entry opens the existing `StaffBookingModal`, which writes to the unified staff booking flow.

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Commit | `530652c fix(studio): restore schedule slot grid entry` |
| Push | `4dc68ff..530652c` pushed to GitHub |

## Local Verification

```text
npm run test -- src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
-> 6 files, 56 tests passed

npm run build
-> passed
```

Build note: Vite reported the existing large chunk warning for `echarts-vendor`; this is not a build failure.

## Production Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-530652c-schedule-grid-entry-20260617-1710
npm run build
-> passed
```

Local package:

```text
C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-530652c-schedule-grid-entry-20260617-1710.zip
sha256=4428D2B034D0B2E4347865AD9F17AF8017471C4E0AC98D51959A6D4A4399462C
```

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-prod-530652c-schedule-grid-entry-20260617-1710.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-prod-530652c-schedule-grid-entry-20260617-1710` |
| Backup | `/opt/yingyue/backups/20260617-170857-pre-studio-workbench-prod-530652c-schedule-grid-entry-20260617-1710` |
| Asset files | `79` |
| Frontend marker | `prod-530652c-schedule-grid-entry-20260617-1710` |

Remote deploy output:

```text
nginx -t -> successful
systemctl reload nginx -> successful
index_marker=6
asset_count=79
```

## Public HTTP Verification

```text
https://studio.evanshine.me/dashboard/today -> 200, marker=True
https://studio.evanshine.me/schedule -> 200, marker=True
https://studio.evanshine.me/order/appointment -> 200, marker=True
```

## Authenticated Browser Smoke

The smoke used an existing staff session/local workbench account. No password or token is recorded.

```text
/dashboard/today:
- hasSchedule=true
- hasManualEntry=true
- hasTopCreate=true
- gridListCount=3
- horizontalRowCount=0
- overflowXAutoCount=0
- grid scrollWidth/clientWidth: 909/909, 909/909, 909/909
- hasForbidden=false
- hasLogin=false

Manual booking modal:
- button count for `店员录入 · 新增预约` = 1
- hasModalTitle=true
- hasStoreField=true
- hasServiceGroupField=true
- hasSaveBooking=true
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-170857-pre-studio-workbench-prod-530652c-schedule-grid-entry-20260617-1710/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
