# Studio Workbench Campaign And Merchant Store Scope Deploy - 2026-06-19

## Release

```text
commit: 829ca5e fix(studio): scope campaign and merchant overview by store
release: prod-829ca5e-campaign-merchant-store-scope-20260619-090034
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No order, appointment, inventory, schedule, product, album, or channel mapping write operation during smoke.

## Changes

| Area | Files | Result |
| --- | --- | --- |
| Campaign order store selector | `studio-workbench/src/features/orders/CampaignOrdersView.vue` | `/order/campaign` now uses concrete `yy_store.id` from `appStore.stores`; no all-store option in the normal workbench UI. |
| Campaign order stats and rows | `CampaignOrdersView.vue` | Cards, quick-filter counts, channel options, list rows, and detail drawer are computed from the current `order.storeBackendId` scope. |
| Unified order deep links | `CampaignOrdersView.vue` | "打开统一订单" and row "跟进订单" append `storeId=<yy_store.id>` when opening `/order/appointment`. |
| Merchant overview store selector | `studio-workbench/src/features/merchant/MerchantOverviewView.vue` | `/merchant/overview` now selects one concrete store and scopes orders, schedule items, booking inventory, and Douyin store bindings to that store. |
| Merchant data load | `MerchantOverviewView.vue` | Direct route loads wait for `appStore.bootstrap()` before loading schedule and booking inventory with the selected concrete store. |
| Contract tests | `CampaignOrdersView.contract.test.ts`, `MerchantOverviewView.contract.test.ts` | Tests lock concrete store filtering, `storeId` deep links, and no all-store action in these staff workbench views. |

## Local Verification

```powershell
git diff --check -- studio-workbench/src/features/orders/CampaignOrdersView.vue studio-workbench/src/features/orders/CampaignOrdersView.contract.test.ts studio-workbench/src/features/merchant/MerchantOverviewView.vue studio-workbench/src/features/merchant/MerchantOverviewView.contract.test.ts
# exit 0

npm --prefix studio-workbench run test -- src/features/orders/CampaignOrdersView.contract.test.ts src/features/merchant/MerchantOverviewView.contract.test.ts
# Test Files 2 passed
# Tests 9 passed

npm --prefix studio-workbench run test -- src/features/orders/CampaignOrdersView.contract.test.ts src/features/merchant/MerchantOverviewView.contract.test.ts src/features/orders/DerivedOrderModuleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/merchant/InventoryView.contract.test.ts src/features/merchant/ServiceGroupsView.contract.test.ts
# Test Files 6 passed
# Tests 68 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

Production build used:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-829ca5e-campaign-merchant-store-scope-20260619-090034'
npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-829ca5e-campaign-merchant-store-scope-20260619-090034.zip
size bytes: 699035
sha256: 7EBC1C1315DEC44100857DF80C4C602A7E4BCD2855BB5167D282936C202E2FF5
remote zip: /opt/yingyue/releases/studio-workbench-prod-829ca5e-campaign-merchant-store-scope-20260619-090034.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-829ca5e-campaign-merchant-store-scope-20260619-090034
backup: /opt/yingyue/backups/20260619-090215-pre-studio-workbench-prod-829ca5e-campaign-merchant-store-scope-20260619-090034
site dir: /var/www/studio.evanshine.me
site files: 111
release.txt: prod-829ca5e-campaign-merchant-store-scope-20260619-090034
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/order/campaign?cb=prod-829ca5e-campaign-merchant-store-scope-20260619-090034 -> 200, marker=True
https://studio.evanshine.me/merchant/overview?cb=prod-829ca5e-campaign-merchant-store-scope-20260619-090034 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&storeId=900000000000000100&cb=prod-829ca5e-campaign-merchant-store-scope-20260619-090034 -> 200, marker=True
```

## Local Maps Updated

```text
C:\Users\Administrator\Desktop\yiyue\code_map.md
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
```

## Boundaries

- This deploy only changes campaign order and merchant overview staff workbench views.
- Historical DOUYIN_LIFE orders without real slots are still not fabricated into `yy_booking_slot_inventory`.
- Global/all-store views for administrators still need a separate design; they are not mixed into the normal staff workbench.
- Existing untracked evidence screenshots and local draft files were not added or removed.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-090215-pre-studio-workbench-prod-829ca5e-campaign-merchant-store-scope-20260619-090034/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
