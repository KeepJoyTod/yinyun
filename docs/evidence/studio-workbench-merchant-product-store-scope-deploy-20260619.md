# Studio Workbench Merchant/Product Store Scope Deploy - 2026-06-19

## Release

```text
commit: c63913d fix(studio): scope merchant product pages by store
release: prod-c63913d-merchant-product-store-scope-20260619-081430
site: https://studio.evanshine.me
```

## Scope

- Frontend-only `studio-workbench` deploy.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI call.
- No order, inventory, schedule, product, or channel mapping write operation during smoke.

## Changes

| Area | Files | Result |
| --- | --- | --- |
| Service groups | `ServiceGroupsView.vue`, `ServiceGroupsView.contract.test.ts` | `/merchant/service-groups` uses concrete `yy_store.id` filters only; new service groups default to the current store. |
| Product card catalog | `ProductCardCatalogView.vue`, `ProductCardCatalogView.contract.test.ts` | `/product/card-catalog` scopes stats, list, and batch publish to the current concrete store. |
| Derived product modules | `DerivedProductModuleView.vue`, `derivedProductModules.ts`, related tests | Add-on, group, print, and Meituan product module pages remove all-store browsing; product-derived rows expand by real store names. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/ServiceGroupsView.contract.test.ts src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/ProductCardCatalogView.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts src/features/products/DerivedProductModuleView.contract.test.ts src/features/products/derivedProductModules.test.ts
# 8 files / 44 tests passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Deploy Evidence

```text
Uploaded: /tmp/prod-c63913d-merchant-product-store-scope-20260619-081430.zip
Release dir: /opt/yingyue/releases/studio-workbench-prod-c63913d-merchant-product-store-scope-20260619-081430
Backup: /opt/yingyue/backups/20260619-081500-pre-studio-workbench-prod-c63913d-merchant-product-store-scope-20260619-081430
Site dir: /var/www/studio.evanshine.me
nginx -t: successful
yingyue-admin.service: active
```

## Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=true
https://studio.evanshine.me/merchant/service-groups -> 200
https://studio.evanshine.me/product/card-catalog -> 200
https://studio.evanshine.me/product/addon -> 200
https://studio.evanshine.me/product/meituan -> 200
```

## Rollback

```bash
SITE=/var/www/studio.evanshine.me
BACKUP=/opt/yingyue/backups/20260619-081500-pre-studio-workbench-prod-c63913d-merchant-product-store-scope-20260619-081430
find "$SITE" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a "$BACKUP/." "$SITE/"
nginx -t
```
