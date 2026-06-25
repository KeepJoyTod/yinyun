# Studio Workbench Collaboration Store Scope - 2026-06-19

## Result

This batch tightens the collaboration/work-order pages so staff operations are scoped to one concrete store instead of an all-store view.

## Scope

- Frontend only: `studio-workbench`.
- Pages:
  - `/collaboration/overview`
  - `/collaboration/work-orders`
  - `/collaboration/export`
- Backend, database, Douyin OpenAPI/SPI, order sync, inventory writes, customer notification, and work-order ledger tables are unchanged.

## Code

Changed files:

```text
studio-workbench/src/features/collaboration/WorkExecutionOverviewView.vue
studio-workbench/src/features/collaboration/WorkExecutionOverviewView.contract.test.ts
studio-workbench/src/features/collaboration/WorkOrdersView.vue
studio-workbench/src/features/collaboration/WorkOrdersView.contract.test.ts
studio-workbench/src/features/collaboration/WorkOrderExportView.vue
studio-workbench/src/features/collaboration/WorkOrderExportView.contract.test.ts
```

Main behavior:

- Work execution overview no longer offers an all-store option.
- Work orders no longer offers an all-store option.
- Work order export no longer offers an all-store option.
- Store selects use concrete `yy_store.id` values from `appStore.stores`; store names are display only.
- Page totals, quick-filter counts, and export summaries are calculated from the current concrete store scope, not the all-store derived work-order pool.
- Direct page refresh waits for `appStore.bootstrap()` / `appStore.stores` before normalizing the store filter.
- If no concrete store is available, the pages render an explicit no-store permission empty state and do not show all-store data.

## Verification

RED checks:

```text
npm --prefix studio-workbench run test -- src/features/collaboration/WorkExecutionOverviewView.contract.test.ts src/features/collaboration/WorkOrdersView.contract.test.ts src/features/collaboration/WorkOrderExportView.contract.test.ts
-> failed before production-code fix because concrete store scope, bootstrap wait, and yy_store.id filtering were missing
```

Target tests after fix:

```text
npm --prefix studio-workbench run test -- src/features/collaboration/WorkExecutionOverviewView.contract.test.ts src/features/collaboration/WorkOrdersView.contract.test.ts src/features/collaboration/WorkOrderExportView.contract.test.ts
-> 3 files passed, 12 tests passed
```

Associated tests:

```text
npm --prefix studio-workbench run test -- src/features/collaboration/WorkExecutionOverviewView.contract.test.ts src/features/collaboration/WorkOrdersView.contract.test.ts src/features/collaboration/WorkOrderExportView.contract.test.ts src/features/collaboration/WorkOrderStatisticsView.contract.test.ts src/features/collaboration/workExecution.test.ts src/features/collaboration/workOrders.test.ts src/features/collaboration/workOrderExport.test.ts src/features/collaboration/workOrderStats.test.ts
-> 8 files passed, 23 tests passed
```

Build:

```text
npm --prefix studio-workbench run build
-> passed; existing echarts-vendor chunk-size warning only
```

## Data/API Boundary

- These pages are derived staff work views.
- Data source remains the existing `appStore` data loaded from unified orders, albums, and selection links.
- No new backend API was added.
- No new work-order table was added.
- `yy_order` remains the order/appointment ledger.
- `yy_photo_album` / `yy_photo_asset` remain the photo-delivery data source.
- Store security still depends on backend `yy_employee_store` enforcement; this batch removes the front-end all-store operation entry and prevents accidental all-store derived summaries.

## Local Maps Updated

```text
docs\yiyue\code_map.md
docs\yiyue\function_map.md
docs\yiyue\api_map.md
docs\yiyue\optimization_map.md
```

## Boundaries

- No backend route, migration, platform callback, active Douyin OpenAPI request, order mutation, appointment mutation, inventory mutation, album mutation, product mapping mutation, or micro-form data mutation is part of this batch.
- `DOUYIN_LIFE` remains separate from `DOUYIN_MINI_APP`.
- Historical Douyin orders without real slot fields are not fabricated into daily schedules.

## Deployment

Deployment evidence will be added in a follow-up evidence file after Git commit and HK2 deployment.
