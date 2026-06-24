# Studio Workbench Order Sync Deploy 2026-06-16

## Result

`studio-workbench` has been rebuilt in real API mode and deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, nginx site config, OSS configuration, miniapp builds, or the system admin site.

## What Changed

- Added a staff-facing `同步订单` action on the appointment order page.
- The action calls the shared `DOUYIN_LIFE` order sync flow and refreshes the same workbench caches used by homepage stats, schedule, and order lists.
- Appointment order status tabs now use business groups: `全部有效订单`, `待服务`, `服务中`, `已完成`, `待支付`, `已取消`, `已退单`.
- Homepage `经营概况` uses the same effective/completed/cancelled/refunded order helpers.
- Schedule page explicitly labels the operational board as `今日预约排期承接`.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-order-sync-20260616-002741.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-order-sync-20260616-002859.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-order-sync-20260616-002859` |
| Backup | `/opt/yingyue/backups/20260616-002859-pre-studio-workbench-order-sync-20260616-002859` |
| Uploaded files | `92` |
| Asset files | `89` |

## Verification

Local:

```text
npm test -- --run src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
-> 5 files passed, 74 tests passed

npm run build
-> passed
```

Remote deploy output:

```text
site_files=92
site_index_mtime=2026-06-16 00:25:14 +0800
nginx -t -> passed
systemctl reload nginx -> passed
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/schedule -> 200 text/html
```

Remote bundle markers:

```text
同步订单 -> OrdersView bundle present
同步近24小时抖音来客订单 -> OrdersView bundle present
全部有效订单 -> OrdersView/orderOperations bundle present
已退单 -> Dashboard/Orders/orderOperations bundles present
今日预约排期承接 -> ScheduleView bundle present
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260616-002859-pre-studio-workbench-order-sync-20260616-002859/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
