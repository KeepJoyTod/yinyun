# Studio Workbench Order Status Chain Evidence - 2026-06-17

## Scope

This batch aligns the appointment order detail actions with the JianYue-style daily workflow:

- `待确认 -> 已确认`
- `已确认 -> 已到店`
- `已到店 -> 服务中`
- `服务中 -> 已完成`

Legacy labels remain compatible:

- `拍摄中` is still treated as `服务中`.
- `选片中` is still treated as completed/follow-up state.

## Source Files

| File | Purpose |
| --- | --- |
| `studio-workbench/src/features/orders/orderOperations.ts` | Status grouping, next visible action, export status mapping |
| `studio-workbench/src/features/orders/OrdersView.vue` | Order detail drawer uses `getNextOrderAction` and writes through `appStore.updateOrderStatus` |
| `studio-workbench/src/shared/api/yingyueAdapter.ts` | Backend status mapping: `ARRIVED=已到店`, `SERVING=服务中` |
| `studio-workbench/src/shared/stores/appStoreTypes.ts` | Allows `已到店` and `服务中` as order statuses |
| `studio-workbench/src/shared/stores/appStoreTransforms.ts` | Preserves `已到店` and `服务中` in store transforms |
| `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java` | Allows backend `CONFIRMED -> ARRIVED` transition |
| `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java` | Covers `CONFIRMED -> ARRIVED` transition |

## API / Data Boundary

- Status transition API: `POST /yy/order/{id}/transition`
- Backend state chain: `PENDING -> CONFIRMED -> ARRIVED -> SERVING -> COMPLETED`
- `yy_order.status` remains the single order status source.
- This batch does not implement Douyin verification/cancel/refund OpenAPI calls.

## Verification

```text
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts
2 passed, 54 passed
```

```text
mvn -pl ruoyi-modules/ruoyi-yy -am -Dtest=YyOrderServiceImplTest -DskipTests=false '-Dmaven.test.skip=false' '-Dsurefire.failIfNoSpecifiedTests=false' test
YyOrderServiceImplTest: 30 tests, 0 failures, 0 errors
```

```text
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/derivedOrderModules.test.ts src/features/orders/CampaignOrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
6 passed, 103 passed

npm --prefix studio-workbench run build
passed; existing Vite large chunk warning only
```

## Production Deploy

Backend:

```text
release: yingyue-api-order-status-flow-55a7171-20260617
runtime: /opt/yingyue/backend/ruoyi-admin.jar
backup: /opt/yingyue/backups/yingyue-api-order-status-flow-55a7171-20260617-pre/ruoyi-admin.jar
sha256: 39798e84071ff26eaf33d9802891375166a37a7b8dc7b854bf702a241c409c94
smoke:
  https://api.evanshine.me/ -> 200
  https://api.evanshine.me/prod-api/ -> 200 RuoYi 404 JSON
```

Frontend:

```text
release: prod-55a7171-order-status-flow-20260617
zip: /tmp/studio-workbench-prod-55a7171-order-status-flow-20260617.zip
site: /var/www/studio.evanshine.me
backup: /opt/yingyue/backups/20260617-215842-pre-studio-workbench-prod-55a7171-order-status-flow-20260617
nginx: nginx -t passed; systemctl reload nginx executed
marker: present
```

Public smoke:

```text
https://studio.evanshine.me/?cb=order-status-flow -> 200, marker=true
https://studio.evanshine.me/login?cb=order-status-flow -> 200, marker=true
https://studio.evanshine.me/order/appointment?quick=all&cb=order-status-flow -> 200, marker=true
https://studio.evanshine.me/dashboard/today?cb=order-status-flow -> 200, marker=true
https://studio.evanshine.me/schedule?cb=order-status-flow -> 200, marker=true
```

Rollback:

```bash
systemctl stop yingyue-admin.service
cp -a /opt/yingyue/backups/yingyue-api-order-status-flow-55a7171-20260617-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
systemctl start yingyue-admin.service

find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-215842-pre-studio-workbench-prod-55a7171-order-status-flow-20260617/. /var/www/studio.evanshine.me/
nginx -t && systemctl reload nginx
```

## Remaining

- Add explicit cancel/refund buttons with reason input in the order detail drawer.
- Decide whether cancel/refund should call only local `yy_order` status transition or also Douyin Life cancel/refund APIs when a real external order/certificate exists.
