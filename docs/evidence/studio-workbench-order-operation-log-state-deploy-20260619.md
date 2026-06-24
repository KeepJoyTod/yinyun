# Studio Workbench Order Operation Log State Deploy - 2026-06-19

## Release

```text
commit: 176a0a3 fix(studio): show order operation log sync state
release: prod-176a0a3-order-operation-log-state-20260619-1022
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No business data write during smoke.

## Change

| Area | Files | Result |
| --- | --- | --- |
| Order detail operation logs | `studio-workbench/src/features/orders/OrdersView.vue` | The detail drawer now shows operation-log loading and failure states. If `/monitor/operlog/list` is unavailable or unauthorized, it keeps the base timeline and explicitly says order confirm/reschedule/cancel actions are not blocked. |
| Order flow copy | `studio-workbench/src/features/orders/OrdersView.vue` | Replaced the remaining old “拍摄完成后跟进选片” sentence with the current “完成服务后进入客片交付” flow. |
| Contract test | `studio-workbench/src/features/orders/OrdersView.contract.test.ts` | Locks visible operation-log state text and current fulfillment copy. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/CampaignOrdersView.contract.test.ts
# Test Files 3 passed
# Tests 89 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-176a0a3-order-operation-log-state-20260619-1022.zip
size bytes: 698543
sha256: CE5CA09099C232797503C46AEDFCB85DABC0FE43782F04768378A8D086B9D58F
remote zip: /opt/yingyue/releases/studio-workbench-prod-176a0a3-order-operation-log-state-20260619-1022.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-176a0a3-order-operation-log-state-20260619-1022
backup: /opt/yingyue/backups/20260619-102459-pre-studio-workbench-prod-176a0a3-order-operation-log-state-20260619-1022
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-176a0a3-order-operation-log-state-20260619-1022
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-176a0a3-order-operation-log-state-20260619-1022 -> 200, marker=True
https://studio.evanshine.me/order/campaign?cb=prod-176a0a3-order-operation-log-state-20260619-1022 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-176a0a3-order-operation-log-state-20260619-1022 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-102459-pre-studio-workbench-prod-176a0a3-order-operation-log-state-20260619-1022/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
