# Studio Workbench Order StoreId Deep Link Evidence 2026-06-17 20:43

## Scope

- Fix dashboard -> appointment order deep links so `storeId=<yy_store.id>` is honored by `OrdersView`.
- Preserve existing `astore=<store name>` links for compatibility.
- Re-apply the `storeId` filter after `appStore.stores` loads, so cold-open production links keep the selected store scope.

## Files

- `studio-workbench/src/features/orders/OrdersView.vue`
- `studio-workbench/src/features/orders/OrdersView.contract.test.ts`

## Verification

```text
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
Result: 31 passed
```

```text
npm --prefix studio-workbench run build
Result: passed; existing Vite large chunk warning only
```

## Notes

- No backend/API change.
- No secret or production payload recorded.
- Existing untracked `studio-workbench-acceptance-20260617-112604.*` evidence files were left untouched.
