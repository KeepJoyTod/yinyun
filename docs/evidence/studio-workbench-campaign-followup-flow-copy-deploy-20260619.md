# Studio Workbench Campaign Follow-up Flow Copy Deploy - 2026-06-19

## Release

```text
commit: c88bccf fix(studio): align campaign order follow-up flow copy
release: prod-c88bccf-campaign-followup-flow-copy-20260619-0936
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
| Campaign order follow-up copy | `studio-workbench/src/features/orders/CampaignOrdersView.vue` | Right-side next-action copy now follows `已确认 -> 已到店 -> 服务中 -> 已完成`; legacy `拍摄中` is treated as old-state compatibility. |
| Contract test | `studio-workbench/src/features/orders/CampaignOrdersView.contract.test.ts` | Locks that the campaign order page no longer suggests the old `拍摄中 -> 选片中` flow as the main follow-up chain. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/CampaignOrdersView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts
# Test Files 3 passed
# Tests 89 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-c88bccf-campaign-followup-flow-copy-20260619-0936.zip
size bytes: 698918
sha256: CD3870AE27A18F0A7CF788CDEC7078FACCA4FCC3CF3639F1FF5A5527AF031784
remote zip: /opt/yingyue/releases/studio-workbench-prod-c88bccf-campaign-followup-flow-copy-20260619-0936.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-c88bccf-campaign-followup-flow-copy-20260619-0936
backup: /opt/yingyue/backups/20260619-094017-pre-studio-workbench-prod-c88bccf-campaign-followup-flow-copy-20260619-0936
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-c88bccf-campaign-followup-flow-copy-20260619-0936
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/campaign?cb=prod-c88bccf-campaign-followup-flow-copy-20260619-0936 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-c88bccf-campaign-followup-flow-copy-20260619-0936 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-094017-pre-studio-workbench-prod-c88bccf-campaign-followup-flow-copy-20260619-0936/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
