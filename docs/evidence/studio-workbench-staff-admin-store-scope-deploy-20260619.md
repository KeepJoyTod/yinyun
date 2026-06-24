# Studio Workbench Staff/Admin Store Scope Deploy - 2026-06-19

## Release

```text
commit: 769f34c fix(studio): gate staff admin store scope views
release: prod-769f34c-staff-admin-store-scope-20260619-091251
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No order, appointment, inventory, schedule, product, album, employee, log, or channel mapping write operation during smoke.

## Changes

| Area | Files | Result |
| --- | --- | --- |
| Merchant store page | `studio-workbench/src/features/stores/StoreView.vue` | `/merchant/store` no longer exposes "全部门店/查看全部门店" as a normal staff action; the page uses "当前可见" for the scoped store set returned by the backend. |
| Store card deep links | `StoreView.vue` | Store actions for walk-in order and order attributes now append `storeId=<yy_store.id>` instead of relying only on the store display name. |
| Employee page global scope gate | `studio-workbench/src/features/settings/EmployeesView.vue` | "全部门店" appears only when `studioAccessStore.globalStoreScope` is true; staff metrics, role filters, skill coverage, and rows are computed from `scopedEmployees`. |
| Employee create form | `EmployeesView.vue` | Admin all-store view still pre-fills a concrete store ID for new employees; it never writes `all` into the employee store field. |
| Logs page global scope gate | `studio-workbench/src/features/settings/LogsView.vue` | "全部门店" appears only when `studioAccessStore.globalStoreScope` is true; normal staff log filters normalize to visible store names. |
| Contract tests | `StoreView.contract.test.ts`, `LogsView.contract.test.ts`, `EmployeesView.contract.test.ts` | Tests lock the Store page no-all-store wording and the admin-only global scope behavior for Logs and Employees. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/stores/StoreView.contract.test.ts src/features/settings/LogsView.contract.test.ts src/features/settings/EmployeesView.contract.test.ts
# RED before implementation: 3 files, 4 expected failures
# GREEN after implementation: Test Files 3 passed; Tests 27 passed

npm --prefix studio-workbench run test -- src/features/stores/StoreView.contract.test.ts src/features/settings/LogsView.contract.test.ts src/features/settings/EmployeesView.contract.test.ts src/features/settings/RolesView.contract.test.ts src/features/settings/SettingsView.contract.test.ts src/features/merchant/MerchantOverviewView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/shared/stores/studioAccessStore.contract.test.ts
# Test Files 7 passed
# Tests 75 passed

git diff --check -- studio-workbench/src/features/stores/StoreView.vue studio-workbench/src/features/stores/StoreView.contract.test.ts studio-workbench/src/features/settings/LogsView.vue studio-workbench/src/features/settings/LogsView.contract.test.ts studio-workbench/src/features/settings/EmployeesView.vue studio-workbench/src/features/settings/EmployeesView.contract.test.ts
# exit 0

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

Production build used:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-769f34c-staff-admin-store-scope-20260619-091251'
npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-769f34c-staff-admin-store-scope-20260619-091251.zip
size bytes: 698134
sha256: 5C61346702FC96CFED51E2BD9A2B74D6675F935C56731F54B644C38662A97EC7
remote zip: /opt/yingyue/releases/studio-workbench-prod-769f34c-staff-admin-store-scope-20260619-091251.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-769f34c-staff-admin-store-scope-20260619-091251
backup: /opt/yingyue/backups/20260619-091402-pre-studio-workbench-prod-769f34c-staff-admin-store-scope-20260619-091251
site dir: /var/www/studio.evanshine.me
site files: 111
release.txt: prod-769f34c-staff-admin-store-scope-20260619-091251
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/merchant/store?cb=prod-769f34c-staff-admin-store-scope-20260619-091251 -> 200, marker=True
https://studio.evanshine.me/settings/logs?cb=prod-769f34c-staff-admin-store-scope-20260619-091251 -> 200, marker=True
https://studio.evanshine.me/settings/employees?cb=prod-769f34c-staff-admin-store-scope-20260619-091251 -> 200, marker=True
https://studio.evanshine.me/merchant/overview?cb=prod-769f34c-staff-admin-store-scope-20260619-091251 -> 200, marker=True
```

## Local Maps Updated

```text
C:\Users\Administrator\Desktop\yiyue\code_map.md
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
```

## Boundaries

- This deploy only changes staff-workbench frontend views and route query behavior.
- Admin/global scope is preserved via `studioAccessStore.globalStoreScope`; the normal staff workbench no longer defaults to all-store where this release touched.
- Backend employee/store/log permissions remain the security boundary; this release improves the UI contract and deep-link behavior.
- Existing untracked evidence screenshots, local plans, and skill files were not added or removed.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-091402-pre-studio-workbench-prod-769f34c-staff-admin-store-scope-20260619-091251/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
