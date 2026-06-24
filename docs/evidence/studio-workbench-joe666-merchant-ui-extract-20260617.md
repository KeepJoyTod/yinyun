# Studio Workbench Joe666 Merchant UI Extract - 2026-06-17

## Result

Joe666 was used only as UI/design reference for the merchant module. The current `yingyue-closed-loop-optimization-20260603` branch kept the real booking/order/schedule chain intact and did not merge the unrelated Joe666 history.

## Source Policy

- Source branch inspected: `origin/Joe666`.
- Integration method: manual extraction and reimplementation.
- Not performed: direct merge, route replacement, `featureRegistry` overwrite, mock data import, or fallback merchant data import.
- Current data source: existing `appStore`, backed by `yy_order`, `yy_booking_slot_inventory`, `yy_store`, and `yy_channel_product_mapping`.

## Added Or Changed Files

| Area | File | Purpose |
| --- | --- | --- |
| Merchant chrome | `studio-workbench/src/features/merchant/components/MerchantModuleChrome.vue` | Merchant module tabs and quick access shell inspired by Joe666/Figma |
| Merchant chrome config | `studio-workbench/src/features/merchant/merchantChrome.ts` | Tab and quick access definitions |
| Merchant overview | `studio-workbench/src/features/merchant/MerchantOverviewView.vue` | Real-data merchant overview for stores, orders, slots, and Douyin Life mappings |
| Store management | `studio-workbench/src/features/stores/StoreView.vue` | Wrapped existing real store page in merchant module chrome |
| Router registry | `studio-workbench/src/app/router/featureRegistry.ts` | Additive `merchant-overview` feature only |
| Router loader | `studio-workbench/src/app/router/index.ts` | Additive `/merchant -> /merchant/overview` redirect and component loader |
| Contract tests | `studio-workbench/src/features/merchant/*.contract.test.ts` | Prevent mock import, route overwrite, and missing chrome regressions |
| Store/router tests | `studio-workbench/src/features/stores/StoreView.contract.test.ts`, `studio-workbench/src/app/router/*.test.ts` | Verify store page chrome and feature access mapping |
| Figma references | `studio-workbench/docs/figma-screenshots/*.png` | Local design references extracted from Joe666 |

## Real Data Wiring

- Merchant overview refresh calls:
  - `appStore.refreshCoreData()`
  - `appStore.loadSchedule(todayKey)`
  - `appStore.loadBookingInventory({ date: todayKey })`
  - `appStore.loadChannelProductMappings('DOUYIN_LIFE')`
- Store rows come from `appStore.stores`.
- Today appointments come from `appStore.scheduleItems`.
- Slot fill and full-slot indicators come from `appStore.bookingInventory`.
- Douyin Life readiness comes from `appStore.channelProductMappings` through `buildDouyinStoreBindings(...)`.

## Verification

Target contract tests:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- src/features/merchant/MerchantModuleChrome.contract.test.ts src/features/merchant/MerchantOverviewView.contract.test.ts src/features/stores/StoreView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/app/router/featureRegistry.access.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
```

Observed result:

```text
11 passed
128 tests passed
```

Build:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

Observed result:

```text
vue-tsc -b && vite build
vite build completed successfully
```

Browser smoke:

```text
Local URL: http://localhost:5190
Login user: store-admin
Password/token: not recorded

/merchant/overview:
- hasMerchantOverview=true
- hasQuickAccess=true
- hasRealDataMarker=true
- hasForbidden=false
- hasLogin=false

/merchant/store:
- hasMerchantChrome=true
- hasStoreManagement=true
- hasForbidden=false
- hasLogin=false
```

## Boundaries

- This change is frontend UI extraction only.
- It does not change database schema, Douyin OpenAPI calls, sync scheduling, webhook/SPI handling, or nginx config.
- Historical Douyin Life orders without real slot fields are still not fabricated into `yy_booking_slot_inventory`.
- The existing real booking chain remains the source of truth.
