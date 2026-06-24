# Studio Workbench Schedule Conflict Filter Deploy - 2026-06-17

## Result

Deployed the schedule conflict-filter fix to Hong Kong 2. The Today Schedule quick filter now counts real `yy_booking_slot_inventory.conflict_count` slots instead of only pending schedule orders.

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Commit | `54a1324 fix(studio): filter schedule conflicts from slot inventory` |
| Push | `b4213c7..54a1324` pushed to GitHub |

## Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-54a1324-schedule-conflict-20260617-114635
npm run build
-> passed
```

Local package:

```text
C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-54a1324-schedule-conflict-20260617-114635.zip
sha256=069FD99536B8DB6D8B3C0AB734AC0DE1BB20942227FBBE05BE8DEE1A821F15D6
```

Build note: Vite reported the existing large chunk warning for `echarts-vendor`; this is not a build failure.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-prod-54a1324-schedule-conflict-20260617-114635.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-prod-54a1324-schedule-conflict-20260617-114635` |
| Backup | `/opt/yingyue/backups/20260617-115008-pre-studio-workbench-prod-54a1324-schedule-conflict-20260617-114635` |
| Asset files | `76` |
| Frontend marker | `prod-54a1324-schedule-conflict-20260617-114635` |

Remote deploy output:

```text
nginx -t -> successful
systemctl reload nginx -> successful
```

## Verification

Local:

```text
npm run test -- --run src/features/schedule/scheduleOperations.test.ts src/features/schedule/ScheduleView.contract.test.ts
-> 2 files, 21 tests passed

npm run test -- --run src/features/schedule/scheduleOperations.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/api/backend.contract.test.ts
-> 6 files, 109 tests passed

npm run build
-> passed
```

Public HTTP:

```text
https://studio.evanshine.me/ -> 200, marker found
https://studio.evanshine.me/login -> 200, marker found
https://studio.evanshine.me/dashboard/today -> 200, marker found
https://studio.evanshine.me/schedule -> 200, marker found
https://studio.evanshine.me/order/appointment -> 200, marker found
```

Authenticated browser smoke:

```text
https://studio.evanshine.me/dashboard/today?cb=prod-54a1324-schedule-conflict-20260617-114635
quick filter: 只看冲突 · 1
slot card: 11:00 shows 冲突 1
screenshot: output/playwright/studio-today-prod-54a1324-schedule-conflict-20260617.png
summary: output/playwright/studio-prod-54a1324-schedule-conflict-smoke-20260617.json
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-115008-pre-studio-workbench-prod-54a1324-schedule-conflict-20260617-114635/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
