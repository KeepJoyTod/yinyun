# Studio Workbench Order Detail Feedback Deploy - 2026-06-19

## Release

```text
commit: 5f17d6b fix(studio): show order action feedback in detail drawer
release: prod-5f17d6b-order-detail-feedback-20260619-1032
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
| Order detail drawer feedback | `studio-workbench/src/features/orders/OrdersView.vue` | The detail drawer now shows the existing `orderActionNotice` inside the drawer with `role="status"` and label `订单操作反馈`, so confirm, reschedule, cancel, and failure messages are visible while the drawer overlay is open. |
| Contract test | `studio-workbench/src/features/orders/OrdersView.contract.test.ts` | Locks that the `order-detail-drawer` block contains `orderActionNotice`, `订单操作反馈`, and `role="status"`. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
# Test Files 1 passed
# Tests 46 passed

npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/CampaignOrdersView.contract.test.ts
# Test Files 3 passed
# Tests 90 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-5f17d6b-order-detail-feedback-20260619-1032.zip
size bytes: 691526
sha256: 98EACD98A93A597FE5EDE1E57B160AE75BC1DC1AD1ACE79707158B2A0389B858
remote zip: /opt/yingyue/releases/studio-workbench-prod-5f17d6b-order-detail-feedback-20260619-1032.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-5f17d6b-order-detail-feedback-20260619-1032
backup: /opt/yingyue/backups/20260619-103323-pre-studio-workbench-prod-5f17d6b-order-detail-feedback-20260619-1032
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-5f17d6b-order-detail-feedback-20260619-1032
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-5f17d6b-order-detail-feedback-20260619-1032 -> 200, marker=True
https://studio.evanshine.me/order/campaign?cb=prod-5f17d6b-order-detail-feedback-20260619-1032 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-5f17d6b-order-detail-feedback-20260619-1032 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-103323-pre-studio-workbench-prod-5f17d6b-order-detail-feedback-20260619-1032/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Notes

- The first GitHub push attempt after the code commit failed due to network connectivity to `github.com:443`; HK2 deployment used the local verified commit package directly.
