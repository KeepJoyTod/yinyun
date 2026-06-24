# Studio Workbench Order Refund Timeline Evidence - 2026-06-19

## Scope

Order detail drawer now exposes real refund/refund-notify information already present in `yy_order` and channel sync logs.

```text
yy_order.refund_status
yy_order.refund_amount_cent
yy_channel_sync_log.request_id / api_name / remark
```

## Files

```text
studio-workbench/src/shared/api/backendTypes.ts
studio-workbench/src/shared/api/yingyueAdapter.ts
studio-workbench/src/shared/stores/appStoreTypes.ts
studio-workbench/src/shared/stores/appStoreTransforms.ts
studio-workbench/src/features/orders/orderOperations.ts
studio-workbench/src/shared/stores/appStoreTransforms.test.ts
studio-workbench/src/features/orders/orderOperations.test.ts
```

## Data and API Boundary

- No backend API was added.
- No database migration was added.
- No Douyin OpenAPI/SPI write operation was added.
- The frontend maps existing backend `YyOrderVo.refundStatus/refundAmountCent` into `OrderDto` and `BookingOrder`.
- The order detail timeline adds `退款/退单结果` only when refund status, refund amount, or refunded terminal status exists.
- Refund logid is read from matching `yy_channel_sync_log` rows already loaded by the workbench.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/shared/stores/appStoreTransforms.test.ts src/features/orders/orderOperations.test.ts
# 2 files / 40 tests passed

npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/shared/api/yingyueAdapter.test.ts
# 4 files / 91 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Result

- `mapOrder()` preserves refund status and refund amount for order diagnostics.
- `buildOrderDetailTimeline()` shows refund amount as yuan and includes the latest refund logid when a matching channel sync log exists.
- Cancel guidance remains a boundary warning; it still does not initiate or fabricate external Douyin refund actions.
