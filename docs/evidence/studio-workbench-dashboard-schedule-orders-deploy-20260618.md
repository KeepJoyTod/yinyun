# studio-workbench dashboard schedule orders deploy - 2026-06-18

## Scope

- Branch: `yingyue-closed-loop-optimization-20260603`
- Commit: `fa14d02 fix(studio): merge slot orders into dashboard schedule`
- Release: `prod-fa14d02-dashboard-schedule-orders-20260618`
- Target: `https://studio.evanshine.me`
- Deployment target: Hong Kong 2, `/var/www/studio.evanshine.me`

This deployment fixes the dashboard "today schedule" case where a real booked slot showed capacity full but order count `0`. The frontend now merges `yy_order` rows queried by `slotDate` into dashboard schedule items.

## Changed Data Flow

```text
DashboardView
-> appStore.loadSchedule(date, storeName, storeBackendId)
-> backendApi.listSchedules({ date, storeId })
-> backendApi.listOrders({ storeId, slotDate: date, pageSize: 500 })
-> buildScheduleItemsFromOrders(scheduleOrders, date, storeId)
-> appStore.scheduleItems = schedules + real slot orders, de-duped
```

`buildScheduleItemsFromOrders` now also supports orders where `arrivalAt` is absent but real `slotDate/slotStartTime/slotEndTime` exist.

Boundary retained: historical `DOUYIN_LIFE` orders without real slot fields are not fabricated into daily schedule slots.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStore.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/dashboard/dashboardOperations.test.ts
# Test Files 4 passed
# Tests 59 passed

npm --prefix studio-workbench run test -- src/features/dashboard/dashboardOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
# Test Files 8 passed
# Tests 154 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-fa14d02-dashboard-schedule-orders-20260618'
npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# built in 3.65s
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Deploy

Local package:

```text
C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-fa14d02-dashboard-schedule-orders-20260618.tgz
SIZE_BYTES=592381
```

Remote:

```text
RELEASE=/opt/yingyue/releases/prod-fa14d02-dashboard-schedule-orders-20260618
BACKUP=/opt/yingyue/backups/20260618-194855-pre-studio-workbench-prod-fa14d02-dashboard-schedule-orders-20260618
MARKER_FILES=103
SITE_ASSET_FILES=103
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Smoke Routes

All routes returned the new release marker:

```text
https://studio.evanshine.me/ -> marker=True
https://studio.evanshine.me/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30 -> marker=True
https://studio.evanshine.me/order/appointment?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30&q=JY-12138444&quick=all -> marker=True
https://studio.evanshine.me/merchant/store -> marker=True
https://studio.evanshine.me/product/card-management -> marker=True
```

## Authenticated Acceptance

URL:

```text
https://studio.evanshine.me/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30&cb=prod-fa14d02-dashboard-schedule-orders-20260618
```

Observed with existing real workbench login session:

```text
滨州万达店
晚上
18:00 - 18:30
订单：1
工位：1/1
满
SLOT DETAIL
JY-12138444
王昱婷
```

Screenshot:

```text
docs/evidence/studio-workbench-dashboard-schedule-orders-20260618-live.png
```

## Rollback

```bash
rm -rf /var/www/studio.evanshine.me.rollback-target
mv /var/www/studio.evanshine.me /var/www/studio.evanshine.me.rollback-target
cp -a /opt/yingyue/backups/20260618-194855-pre-studio-workbench-prod-fa14d02-dashboard-schedule-orders-20260618/. /var/www/studio.evanshine.me/
nginx -t && systemctl reload nginx
```

## Boundaries

- Frontend-only deploy.
- No backend service restart.
- No database migration.
- No Douyin OpenAPI writes.
- No secrets or credential files staged.
