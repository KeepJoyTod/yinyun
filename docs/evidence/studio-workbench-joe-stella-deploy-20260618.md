# studio-workbench Joe/Stella merge deploy evidence - 2026-06-18

## Scope

- Branch: `yingyue-closed-loop-optimization-20260603`
- Commit: `77dae67 feat(studio): merge Joe Stella workbench modules`
- Target: `https://studio.evanshine.me`
- Deployment target: Hong Kong 2, `/var/www/studio.evanshine.me`

This deploy publishes the repaired Joe/Stella merged `studio-workbench` modules after TypeScript/build fixes:

- merchant decoration, micro pages, micro forms, service groups
- product card catalog, product card management, card/channel mapping modals
- shared dashboard/feedback components
- JianYue slot grid and schedule/dashboard contract updates
- draft split stores isolated by `tsconfig.app.json`, not activated

## Verification

```powershell
node -v
# v24.16.0

npm -v
# 11.13.0

npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/schedule/scheduleOperations.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/stores/appStore.contract.test.ts
# Test Files 4 passed
# Tests 82 passed

npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/products/derivedProductModules.test.ts src/features/products/components/ChannelMappingModal.contract.test.ts src/features/products/components/CardProductModal.contract.test.ts src/features/products/ProductCardCatalogView.contract.test.ts src/features/merchant/ServiceGroupsView.contract.test.ts
# Test Files 5 passed
# Tests 20 passed

npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/shared/components/dashboard/StatItem.contract.test.ts src/shared/components/dashboard/TrendChart.contract.test.ts src/shared/components/feedback/NoticeBanner.contract.test.ts src/shared/components/feedback/SkeletonRows.contract.test.ts src/shared/stores/workbenchAssets.test.ts src/features/merchant/MerchantDecorationView.contract.test.ts src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/products/components/ProductCardActionModal.contract.test.ts
# Test Files 11 passed
# Tests 44 passed

npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
# vue-tsc -b && vite build
# built in 3.82s
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Deploy

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\studio-workbench-joe-stella-20260618-165832.tgz
SIZE_BYTES=551652
```

Remote:

```text
RELEASE=/opt/yingyue/releases/studio-workbench-joe-stella-20260618-165832
BACKUP=/opt/yingyue/backups/20260618-165832-pre-studio-workbench-joe-stella-20260618-165832
SITE_FILES=87
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Smoke Routes

```text
200 text/html /
200 text/html /login
200 text/html /dashboard/today
200 text/html /order/appointment
200 text/html /merchant/store
200 text/html /merchant/service-groups
200 text/html /merchant/decoration
200 text/html /merchant/micro-pages
200 text/html /merchant/micro-forms
200 text/html /product/card-management
200 text/html /product/card-catalog
200 text/html /schedule
```

## Boundaries

- No backend schema/data migration was deployed in this step.
- No secrets, tokens, password files, or server credential files were staged.
- Untracked draft files intentionally remain outside this commit:
  - `studio-workbench/.cursor/`
  - `studio-workbench/run-test.mjs`
  - `studio-workbench/src/shared/stores/*Store.ts` split-store drafts
- Real order and appointment source of truth remains:
  - `yy_order`
  - `yy_booking_slot_inventory`
- `DOUYIN_LIFE` and `DOUYIN_MINI_APP` remain separate channels.
