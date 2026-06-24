# Studio Workbench Order Flow Lifecycle Evidence - 2026-06-19

## Scope

Order detail drawer operation flow now follows the real store lifecycle:

```text
待确认 -> 已确认 -> 已到店 -> 服务中 -> 已完成
```

Terminal states are not shown as normal completion:

```text
已取消 / 已退单
```

Legacy `拍摄中` remains compatible for old rows, but the main lifecycle no longer uses `拍摄中 -> 选片中` as the appointment operation chain.

## Files

```text
studio-workbench/src/features/orders/orderOperations.ts
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/orderOperations.test.ts
studio-workbench/src/features/orders/OrdersView.contract.test.ts
```

## Data and API Boundary

- No backend API was added.
- No database migration was added.
- The drawer uses existing `BookingOrder.status`.
- Status actions still use the existing `POST /yy/order/{id}/transition` path through `appStore.updateOrderStatus`.
- Operation logs still use existing `/monitor/operlog/list` when permission exists.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/settings/logsOperations.test.ts
# 4 files / 87 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Result

- `buildOrderFlowSteps(order)` is the single frontend source for the drawer lifecycle.
- `OrdersView.vue` no longer hardcodes the old `待确认/已确认/拍摄中/选片中` sequence.
- Cancel/refund terminal states are displayed as stopped states, not as unfinished normal work.
