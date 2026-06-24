# Studio Workbench Front Store Scope Batch - 2026-06-19

## Result

This batch tightens more `studio-workbench` staff-facing store filters so daily operations default to one concrete store instead of an all-store view.

## Scope

- Frontend only: `studio-workbench`.
- Pages:
  - `/merchant/inventory`
  - `/merchant/micro-forms`
  - `/product/douyin`
- Backend, database, Douyin OpenAPI/SPI, order sync, inventory writes, and micro-form data writes are unchanged.

## Code

Changed files:

```text
studio-workbench/src/features/merchant/InventoryView.vue
studio-workbench/src/features/merchant/InventoryView.contract.test.ts
studio-workbench/src/features/merchant/MerchantMicroFormsView.vue
studio-workbench/src/features/merchant/MerchantMicroFormsView.contract.test.ts
studio-workbench/src/features/products/DouyinProductsView.vue
studio-workbench/src/features/products/DouyinProductsView.contract.test.ts
```

Main behavior:

- Inventory page no longer offers an all-store option and always calls booking inventory with a concrete `storeBackendId` when stores are available.
- Micro-form management no longer offers an all-store option; search and reset normalize to a concrete `storeId`.
- Douyin Life product mapping page no longer offers an all-store option; it filters to the intersection of visible workbench stores and `DOUYIN_LIFE` mapping store names.
- The three pages wait for `appStore.bootstrap()` / `appStore.stores` before normalizing store filters, so direct page refreshes do not accidentally show all-store data or an empty false state.

## Verification

RED check:

```text
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts
-> failed before production-code fix because ensureWorkbenchStores was missing from the three pages
```

Target tests after fix:

```text
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts
-> 3 files passed, 19 tests passed
```

Associated tests:

```text
npm --prefix studio-workbench run test -- src/features/merchant/InventoryView.contract.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts src/features/stores/StoreView.contract.test.ts
-> 8 files passed, 49 tests passed
```

Build:

```text
npm --prefix studio-workbench run build
-> passed; existing echarts-vendor chunk-size warning only
```

Static checks:

```text
rg -n "密码|token|secret|Authorization|Bearer|手机号|openid|AppSecret|client_secret|access_token|pwd|passwd" docs/evidence/studio-workbench-front-store-scope-batch-20260619.md
-> no matches

git diff --check -- <batch files>
-> no whitespace errors; CRLF warnings only
```

## Local Maps Updated

```text
C:\Users\Administrator\Desktop\yiyue\code_map.md
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\api_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
```

## Boundaries

- This is an experience-layer store-scope tightening. Backend `yy_employee_store` enforcement remains the security boundary.
- No backend route, migration, platform callback, active Douyin OpenAPI request, order mutation, appointment mutation, inventory mutation, or customer notification is part of this batch.
- `DOUYIN_LIFE` remains separate from `DOUYIN_MINI_APP`.
- Historical Douyin orders without real slot fields are not fabricated into daily schedules.

## Deployment

Deployment evidence will be appended in a follow-up evidence file after Git commit and HK2 deployment.
