# Studio Workbench Derived Order Store Scope Deploy - 2026-06-19

## Release

```text
commit: 2dc2897 fix(studio): scope derived order modules by store
release: prod-2dc2897-derived-order-store-scope-20260619-082858
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
| Derived order store selector | `studio-workbench/src/features/orders/DerivedOrderModuleView.vue` | `/order/print`, `/order/enterprise`, `/order/card`, `/order/coupon` now use concrete `yy_store.id` from `appStore.stores`; no all-store option in the normal workbench UI. |
| Derived order stats | `DerivedOrderModuleView.vue` | Cards, quick-filter counts, amount total, and list rows are computed from the current `order.storeBackendId` scope. |
| Unified order deep links | `studio-workbench/src/features/orders/derivedOrderModules.ts` | Row actions append `storeId=<yy_store.id>` when opening `/order/appointment`; the top "打开统一订单" button also carries current `storeId`. |
| Cold start behavior | `DerivedOrderModuleView.vue` | Direct route loads wait for `appStore.bootstrap()` before normalizing the concrete store filter. |
| Contract tests | `DerivedOrderModuleView.contract.test.ts`, `derivedOrderModules.test.ts` | Tests lock concrete store filtering, `storeBackendId` filtering, and `storeId` deep links. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/DerivedOrderModuleView.contract.test.ts src/features/orders/derivedOrderModules.test.ts
# Test Files 2 passed
# Tests 7 passed

npm --prefix studio-workbench run test -- src/features/orders/DerivedOrderModuleView.contract.test.ts src/features/orders/derivedOrderModules.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/app/router/featureRegistry.contract.test.ts
# Test Files 5 passed
# Tests 112 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

Production build used:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-2dc2897-derived-order-store-scope-20260619-082858'
npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-2dc2897-derived-order-store-scope-20260619-082858.zip
size bytes: 697392
sha256: 28DC4EF79871888996DB1AE4ABA136179BECEECCC4358DEBDB90AD35FD0C6C7B
remote zip: /opt/yingyue/releases/studio-workbench-prod-2dc2897-derived-order-store-scope-20260619-082858.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-2dc2897-derived-order-store-scope-20260619-082858
backup: /opt/yingyue/backups/20260619-083118-pre-studio-workbench-prod-2dc2897-derived-order-store-scope-20260619-082858
site dir: /var/www/studio.evanshine.me
site files: 111
marker count: 10
yingyue-admin.service: active
nginx -t: successful
```

Note: an initial remote deploy command failed before site replacement because local PowerShell interpolated Bash `$()` expressions. The server was checked immediately after that failed attempt: uploaded zip existed, release dir did not exist, existing site still had files, and `yingyue-admin.service` was active. The corrected deploy used a non-interpolated script and completed successfully.

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=true
https://studio.evanshine.me/order/print?cb=prod-2dc2897-derived-order-store-scope-20260619-082858 -> 200, marker=true
https://studio.evanshine.me/order/enterprise?cb=prod-2dc2897-derived-order-store-scope-20260619-082858 -> 200, marker=true
https://studio.evanshine.me/order/card?cb=prod-2dc2897-derived-order-store-scope-20260619-082858 -> 200, marker=true
https://studio.evanshine.me/order/coupon?cb=prod-2dc2897-derived-order-store-scope-20260619-082858 -> 200, marker=true
https://studio.evanshine.me/order/appointment?quick=all&storeId=900000000000000100&cb=prod-2dc2897-derived-order-store-scope-20260619-082858 -> 200, marker=true
```

## Local Maps Updated

```text
C:\Users\Administrator\Desktop\yiyue\code_map.md
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
```

## Boundaries

- This deploy only changes the derived-order module pages and their route-to-unified-order behavior.
- Historical DOUYIN_LIFE orders without real slots are still not fabricated into `yy_booking_slot_inventory`.
- Global/all-store views for administrators still need a separate design; they are not mixed into the normal staff workbench.
- Existing untracked evidence screenshots and local draft files were not added or removed.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-083118-pre-studio-workbench-prod-2dc2897-derived-order-store-scope-20260619-082858/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
