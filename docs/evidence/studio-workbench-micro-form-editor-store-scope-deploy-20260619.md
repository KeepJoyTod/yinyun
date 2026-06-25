# Studio Workbench Micro Form Editor Store Scope Deploy - 2026-06-19

## Release

```text
commit: 208a7f9 fix(studio): require concrete store for staff micro forms
release: prod-208a7f9-micro-form-editor-store-scope-20260619-092410
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No order, appointment, inventory, schedule, product, album, employee, log, channel mapping, or micro form data write during smoke.

## Changes

| Area | Files | Result |
| --- | --- | --- |
| Micro form editor store scope | `studio-workbench/src/features/merchant/MerchantMicroFormEditorView.vue` | "全部门店 / 不绑定" is visible only when `studioAccessStore.globalStoreScope` is true. Normal staff can only save a concrete `yy_store.id`. |
| Cold-start store normalization | `MerchantMicroFormEditorView.vue` | The editor waits for `appStore.bootstrap()` and normalizes `draft.storeId` before new/edit save. |
| Save payload guard | `MerchantMicroFormEditorView.vue` | `buildPayload()` writes normalized `storeId`; normal staff without available stores are blocked before submit. |
| Contract test | `MerchantMicroFormEditorView.contract.test.ts` | Locks `studioAccessStore`, `canUseGlobalStoreScope`, `concreteStoreOptions`, `ensureWorkbenchStores`, and `normalizeDraftStoreId`. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroFormEditorView.contract.test.ts
# Test Files 1 passed
# Tests 4 passed

npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts
# Test Files 2 passed
# Tests 11 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

Production build used:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-208a7f9-micro-form-editor-store-scope-20260619-092410'
npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-208a7f9-micro-form-editor-store-scope-20260619-092410.zip
size bytes: 699749
sha256: E5124EAB409FE717309FAE3152C6C7C6BF49A30938F54A5DAD75E27A32095443
remote zip: /opt/yingyue/releases/studio-workbench-prod-208a7f9-micro-form-editor-store-scope-20260619-092410.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-208a7f9-micro-form-editor-store-scope-20260619-092410
backup: /opt/yingyue/backups/20260619-092526-pre-studio-workbench-prod-208a7f9-micro-form-editor-store-scope-20260619-092410
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-208a7f9-micro-form-editor-store-scope-20260619-092410
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms?cb=prod-208a7f9-micro-form-editor-store-scope-20260619-092410 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms/new?cb=prod-208a7f9-micro-form-editor-store-scope-20260619-092410 -> 200, marker=True
https://studio.evanshine.me/merchant/overview?cb=prod-208a7f9-micro-form-editor-store-scope-20260619-092410 -> 200, marker=True
```

## Local Maps Updated

```text
docs\yiyue\code_map.md
docs\yiyue\function_map.md
docs\yiyue\api_map.md
docs\yiyue\optimization_map.md
```

## Boundaries

- This release only closes the frontend editor loophole for normal staff saving unbound micro forms.
- Admin/global scope is preserved via `studioAccessStore.globalStoreScope`.
- Backend `YyMicroFormServiceImpl` remains the security boundary for cross-store access.
- Existing untracked evidence screenshots, local plans, and skill files were not added or removed.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-092526-pre-studio-workbench-prod-208a7f9-micro-form-editor-store-scope-20260619-092410/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
