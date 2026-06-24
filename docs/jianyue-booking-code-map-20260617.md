# JianYue Booking Code Map 2026-06-17

## Purpose

This map locates the code involved in the JianYue-aligned booking workbench: today's appointment board, appointment orders, staff-created service orders, and real slot capacity.

## Frontend Entry Points

| User area | Route | Main file | Notes |
| --- | --- | --- | --- |
| Dashboard overview | `/` | `studio-workbench/src/features/dashboard/DashboardView.vue` | Business overview and deep links to orders, inventory, and reports. |
| Today's appointment | `/dashboard/today` | `studio-workbench/src/features/schedule/ScheduleView.vue` | Date/store filters, compact summary, slot board, explicit new-order entry. |
| Appointment orders | `/order/appointment` | `studio-workbench/src/features/orders/OrdersView.vue` | Order filters, status groups, sync, export, new order, detail drawer. |
| Staff service order | Modal from schedule/orders | `studio-workbench/src/features/orders/StaffBookingModal.vue` | To be upgraded into JianYue-style service order creation. |
| Slot board | Component | `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue` | Morning/afternoon/evening capacity grid. |
| Route registry | Workbench routes | `studio-workbench/src/app/router/featureRegistry.ts` | Do not replace with Joe/Joe666 registry. |

## Frontend Logic

| Responsibility | File | Key functions |
| --- | --- | --- |
| Slot grouping and fullness | `studio-workbench/src/features/schedule/scheduleOperations.ts` | `buildJianyueSlotGroups`, `buildQuickScheduleFilters`, `buildScheduleOrderQuery` |
| App state and create order | `studio-workbench/src/shared/stores/appStore.ts` | `createOrder`, `loadSchedule`, `loadBookingInventory`, `syncDouyinLifeOrdersAndRefresh` |
| API facade | `studio-workbench/src/shared/api/backend.ts` | `createOrder`, `listOrders`, `listBookingInventory`, `syncDouyinLifeOrders` |
| DTO types | `studio-workbench/src/shared/api/backendTypes.ts` | `OrderCreatePayload`, `YyOrderVo`, `BookingInventoryUpdatePayload` |
| DTO mapping | `studio-workbench/src/shared/api/yingyueAdapter.ts` | Maps `YyOrderVo` into workbench order DTOs. |
| Order status rules | `studio-workbench/src/features/orders/orderOperations.ts` | Shared grouping and anomaly logic. |

## Backend Entry Points

| Responsibility | File | Notes |
| --- | --- | --- |
| Staff booking endpoint | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderController.java` | `POST /yy/order/staff-booking` |
| Staff booking BO | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java` | Currently has store, service group, customer, slot, status, pay status, remark. |
| Order service | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java` | Creates local staff booking and reserves inventory. |
| Order VO | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyOrderVo.java` | Frontend receives created/listed orders from here. |
| Order entity | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyOrder.java` | Ledger table entity. |
| Inventory entity/VO | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyBookingSlotInventory.java` | Local all-channel slot capacity ledger. |

## Data Flow

```text
JianYue-style schedule UI
  -> appStore.loadSchedule + appStore.loadBookingInventory
  -> /yy/order/list + /yy/bookingSlotInventory/list
  -> yy_order + yy_booking_slot_inventory
  -> buildJianyueSlotGroups()
  -> JianyueSlotGrid.vue
```

```text
Staff new service order
  -> StaffBookingModal.vue
  -> appStore.createOrder()
  -> backendApi.createOrder()
  -> POST /yy/order/staff-booking
  -> YyOrderServiceImpl.createStaffBooking()
  -> yy_order
  -> yy_booking_slot_inventory when scheduled
```

## Guardrails

- Do not fabricate slots for historical `DOUYIN_LIFE` orders.
- Do not create a second appointment table.
- Do not bypass existing order status transition semantics for save-and-receive.
- Do not store reference system credentials in code, docs, maps, or evidence.
