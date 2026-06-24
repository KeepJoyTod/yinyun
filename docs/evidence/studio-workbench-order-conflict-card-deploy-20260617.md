# Studio Workbench Order Conflict Card Deploy - 2026-06-17

## Result

Deployed the order-level inventory conflict fallback to Hong Kong 2. The appointment order page now counts orders marked `inventoryStatus=CONFLICT` even when the current inventory slot page does not include the matching slot.

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Local commit | `ae70333 fix(studio): include order-level inventory conflicts` |
| GitHub commit | `be697a2 fix(studio): include order-level inventory conflicts` |
| Push method | GitHub API, based on remote commit `4984297` |

## Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-be697a2-order-conflict-20260617-120649
npm run build
-> passed
```

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-be697a2-order-conflict-20260617-120649.zip
sha256=89D1D7F031DD47EE4FE02CDAB608164EAB63EDED9DABDA519F0C5C63A467950A
```

Build note: Vite reported the existing large chunk warning for `echarts-vendor`; this is not a build failure.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-prod-be697a2-order-conflict-20260617-120649.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-prod-be697a2-order-conflict-20260617-120649` |
| Backup | `/opt/yingyue/backups/20260617-120945-pre-prod-be697a2-order-conflict-20260617-120649` |
| Asset files | `76` |
| Frontend marker | `prod-be697a2-order-conflict-20260617-120649` |

Remote deploy output:

```text
nginx -t -> successful
systemctl reload nginx -> successful
```

## Verification

Local:

```text
npm run test -- --run src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts
-> 2 files, 50 tests passed

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
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-be697a2-order-conflict-20260617-120649
inventory conflict card: 库存冲突订单 -> 1 条
known conflict order: JY-12152139 shown
screenshot: output/playwright/studio-orders-prod-be697a2-order-conflict-20260617-120649.png
summary: output/playwright/studio-prod-prod-be697a2-order-conflict-20260617-120649-order-conflict-smoke.json
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-120945-pre-prod-be697a2-order-conflict-20260617-120649/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
