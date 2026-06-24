# Studio Workbench Appointment Order Copy Deploy - 2026-06-19

## Release

```text
commit: 056d07e fix(studio): align appointment order workbench copy
release: prod-056d07e-appointment-order-copy-20260619-0946
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
| Appointment order workbench copy | `studio-workbench/src/features/orders/orderOperations.ts` | Operation cards and quick filter labels now use `待服务` and `客片交付` instead of old main-entry copy `待拍摄/选片跟进`. |
| Appointment order page copy | `studio-workbench/src/features/orders/OrdersView.vue` | Scope label and empty states now follow `到店确认 -> 服务中 -> 客片交付`. |
| Regression tests | `OrdersView.contract.test.ts`, `orderOperations.test.ts` | Locks the new workbench entry wording while keeping existing filter keys and data logic stable. |

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
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-056d07e-appointment-order-copy-20260619-0946.zip
size bytes: 697746
sha256: 24465605A35ED5617559BA154CB650D9CE9EF10A305EAC5E77407121C9B3D1FF
remote zip: /opt/yingyue/releases/studio-workbench-prod-056d07e-appointment-order-copy-20260619-0946.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-056d07e-appointment-order-copy-20260619-0946
backup: /opt/yingyue/backups/20260619-094852-pre-studio-workbench-prod-056d07e-appointment-order-copy-20260619-0946
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-056d07e-appointment-order-copy-20260619-0946
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-056d07e-appointment-order-copy-20260619-0946 -> 200, marker=True
https://studio.evanshine.me/order/campaign?cb=prod-056d07e-appointment-order-copy-20260619-0946 -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-056d07e-appointment-order-copy-20260619-0946 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-094852-pre-studio-workbench-prod-056d07e-appointment-order-copy-20260619-0946/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
