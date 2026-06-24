# Studio Workbench Order Operation Logs - 2026-06-19

## Scope

- Frontend-only improvement for the appointment order detail drawer.
- Adds matched backend operation logs into the existing order detail timeline.
- Data source is the existing system operation log API: `GET /monitor/operlog/list`.
- No backend table change, no database migration, no Douyin OpenAPI call, and no order/inventory write in this batch.

## Code

| Area | File | Change |
| --- | --- | --- |
| Timeline helper | `studio-workbench/src/features/orders/orderOperations.ts` | Adds `isOrderOperationLog()` and `getOrderOperationLogs()`; `buildOrderDetailTimeline()` now accepts operation logs |
| Order drawer | `studio-workbench/src/features/orders/OrdersView.vue` | Loads `appStore.loadOperationLogs()` when opening an order and after transition/cancel/reschedule; passes `appStore.operationLogs` to the timeline helper |
| Tests | `orderOperations.test.ts`, `OrdersView.contract.test.ts` | Covers matching `/yy/order/{id}/transition` and `/reschedule`, excludes `/monitor/operlog/list`, and locks the drawer data flow |

## Matching Rules

- Match stable order operation endpoints:
  - `/yy/order/{id}/transition`
  - `/yy/order/{id}/reschedule`
  - `/yy/order/{id}/photo-album-placeholder`
- Ignore generic log page reads such as `/monitor/operlog/list`.
- Sort matched operation logs by `happenedAt` descending and show up to 3 records in the order detail timeline.
- Do not expose request parameters, raw payloads, tokens, or full private data.
- `POST /yy/order/staff-booking` is recognized as an order operation endpoint, but it only attaches to a specific order when the log contains a reliable order id/backend id context.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts
# Test Files 2 passed
# Tests 77 passed

npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/settings/logsOperations.test.ts
# Test Files 4 passed
# Tests 83 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# passed
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing warning and not a blocker for this frontend-only change.

## Boundaries

- If the current role lacks `monitor:operlog:list`, the drawer keeps the existing timeline and silently skips operation-log enrichment.
- Order state changes still use the existing APIs:
  - `POST /yy/order/{id}/transition`
  - `POST /yy/order/{id}/reschedule`
- This batch does not implement a dedicated `yy_order_event` table. If the business needs immutable order lifecycle events independent from RuoYi operation logs, that should be a backend design task.
