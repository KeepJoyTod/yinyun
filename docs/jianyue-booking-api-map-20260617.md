# JianYue Booking API Map 2026-06-17

## Purpose

This map connects JianYue-style workbench features to frontend calls, backend endpoints, and data ledgers.

## Route To API Map

| Route | Page | Frontend calls | Backend endpoints | Ledgers |
| --- | --- | --- | --- | --- |
| `/` | `DashboardView.vue` | `loadDashboardStats`, `refreshCoreData`, `orderStatusStats`, `trendStats`, `todaySlots` | `GET /yy/order/list`, `GET /yy/bookingSlotInventory/list`, optional stats endpoints | `yy_order`, `yy_booking_slot_inventory` |
| `/dashboard/today` | `ScheduleView.vue` | `loadSchedule`, `loadBookingInventory` | `GET /yy/order/list`, `GET /yy/bookingSlotInventory/list` | `yy_order`, `yy_booking_slot_inventory` |
| `/order/appointment` | `OrdersView.vue` | `listOrders`, `updateOrderStatus`, `rescheduleOrder`, `syncDouyinLifeOrders`, `createOrder` | `GET /yy/order/list`, `POST /yy/order/{id}/transition`, `POST /yy/order/{id}/reschedule`, `POST /yy/channel/DOUYIN_LIFE/orders/sync`, `POST /yy/order/staff-booking` | `yy_order`, `yy_channel_order_mapping`, `yy_channel_sync_log`, `yy_booking_slot_inventory` |
| `/merchant/inventory` | `InventoryView.vue` | `listBookingInventory`, `updateBookingInventory` | `GET /yy/bookingSlotInventory/list`, `PUT /yy/bookingSlotInventory` | `yy_booking_slot_inventory` |
| `/merchant/service-groups` | `ServiceGroupsView.vue` | `listServiceGroups`, `createServiceGroup`, `updateServiceGroup` | `GET /yy/serviceGroup/list`, service group create/update | `yy_service_group` |
| `/product/service` | `ProductConfigView.vue` | `listProducts`, `createProduct`, `updateProduct` | `GET /yy/product/list`, product create/update | `yy_product` |
| `/product/douyin` | `DouyinProductsView.vue` | `listChannelProductMappings('DOUYIN_LIFE')` | `GET /yy/channelProductMapping/list?channelType=DOUYIN_LIFE` | `yy_channel_product_mapping` |
| `/member/customers` | `CustomersView.vue` | `listCustomers`, `listOrders` | `GET /yy/customer/list`, `GET /yy/order/list` | `yy_customer`, `yy_order` |
| `/tools/notifications` | `NotificationsView.vue` | `listNotificationTemplates`, `listNotificationLogs` | `GET /yy/notificationTemplate/list`, `GET /yy/notificationLog/list` | `yy_notification_template`, `yy_notification_log` |
| `/order/verification` | `ChannelVerificationView.vue` | `getDouyinSyncHealth`, `listChannelSyncLogs`, `listDouyinAcceptanceCases` | `GET /yy/channel/DOUYIN_LIFE/sync-health`, `GET /yy/channelSyncLog/list`, `GET /yy/channel/DOUYIN_LIFE/acceptance-cases` | `yy_channel_sync_log`, `yy_channel_event_inbox` |

## Feature To API Map

| Feature | Frontend owner | API | Required data | Write behavior |
| --- | --- | --- | --- | --- |
| Business overview metrics | `DashboardView.vue` | `GET /yy/order/list`, stats facade | order status, amount, arrival/order dates | read-only |
| Today's appointment slot board | `ScheduleView.vue`, `JianyueSlotGrid.vue` | `GET /yy/bookingSlotInventory/list`, `GET /yy/order/list` | slot date/time, capacity, confirmed count, order count | read-only |
| Full slot badge | `buildJianyueSlotGroups` | same as above | `capacity`, `confirmedCount`, `orderCount` | read-only |
| Order status tabs | `OrdersView.vue`, `orderOperations.ts` | `GET /yy/order/list` | local status, pay/refund status | read-only |
| New staff service order | `StaffBookingModal.vue` | `POST /yy/order/staff-booking` | customer, store, service group, product, slot, save mode | writes `yy_order`, may reserve inventory |
| Save-and-receive | `StaffBookingModal.vue`, `appStore.createOrder` | `POST /yy/order/staff-booking`, optionally `POST /yy/order/{id}/transition` | new order id, expected status, target status | writes order status |
| Reschedule | order detail actions | `POST /yy/order/{id}/reschedule` | expected status, new slot, service group | updates order and inventory |
| Capacity adjustment | `InventoryView.vue` | `PUT /yy/bookingSlotInventory` | slot id, capacity, status | writes inventory |
| Douyin manual sync | `OrdersView.vue` | `POST /yy/channel/DOUYIN_LIFE/orders/sync` | time window, max pages, max total | writes local order/mapping/logs |
| Douyin sync health | `ChannelVerificationView.vue` | `GET /yy/channel/DOUYIN_LIFE/sync-health` | recent logs/inbox status | read-only |
| Product picker | staff order form | `GET /yy/product/list` | active products | read-only |
| Customer association | staff order form | `GET /yy/customer/list` | phone/name/customer id | read-only for current form; future create/update if needed |
| Notification option | staff order form | `GET /yy/notificationTemplate/list`, future send endpoint | template and notify flag | no fake-send; log only after real send |

## Frontend Facade Map

| backendApi method | Endpoint | Used by |
| --- | --- | --- |
| `listOrders(query)` | `GET /yy/order/list` | dashboard, orders, schedule, customers, reports |
| `createOrder(payload)` | `POST /yy/order/staff-booking` | staff service order form |
| `updateOrderStatus(payload)` | `POST /yy/order/{id}/transition` | order detail, save-and-receive |
| `rescheduleOrder(payload)` | `POST /yy/order/{id}/reschedule` | order detail reschedule |
| `exportOrders(query)` | `POST /yy/order/export` | order export |
| `listBookingInventory(query)` | `GET /yy/bookingSlotInventory/list` | schedule, inventory |
| `updateBookingInventory(payload)` | `PUT /yy/bookingSlotInventory` | inventory capacity adjustment |
| `listStores(query)` | `GET /yy/store/list` | filters, order form, store pages |
| `listServiceGroups(query)` | `GET /yy/serviceGroup/list` | schedule and staff form |
| `listProducts(query)` | `GET /yy/product/list` | staff product picker, product pages |
| `listCustomers(query)` | `GET /yy/customer/list` | customer association |
| `syncDouyinLifeOrders(query)` | `POST /yy/channel/DOUYIN_LIFE/orders/sync` | manual sync |
| `getDouyinSyncHealth()` | `GET /yy/channel/DOUYIN_LIFE/sync-health` | channel troubleshooting |
| `listChannelSyncLogs(query)` | `GET /yy/channelSyncLog/list` | logs and verification |
| `listChannelProductMappings(query)` | `GET /yy/channelProductMapping/list` | Douyin product mapping |

## Backend Code Map

| Endpoint | Controller | Service |
| --- | --- | --- |
| `GET /yy/order/list` | `YyOrderController` | `YyOrderServiceImpl.queryPageList` |
| `POST /yy/order/staff-booking` | `YyOrderController.staffBooking` | `YyOrderServiceImpl.createStaffBooking` |
| `POST /yy/order/{id}/transition` | `YyOrderController.transition` | `YyOrderServiceImpl.transitionOrder` |
| `POST /yy/order/{id}/reschedule` | `YyOrderController.reschedule` | `YyOrderServiceImpl.rescheduleOrder` |
| `GET /yy/bookingSlotInventory/list` | `YyBookingSlotInventoryController` | `YyBookingSlotInventoryServiceImpl` |
| `PUT /yy/bookingSlotInventory` | `YyBookingSlotInventoryController` | `YyBookingSlotInventoryServiceImpl` |
| `GET /yy/product/list` | `YyProductController` | `YyProductServiceImpl` |
| `GET /yy/serviceGroup/list` | `YyServiceGroupController` | `YyServiceGroupServiceImpl` |
| `GET /yy/customer/list` | `YyCustomerController` | `YyCustomerServiceImpl` |
| `POST /yy/channel/DOUYIN_LIFE/orders/sync` | `YyChannelController` or channel-specific controller | `DouyinLifeChannelAdapter.syncOrders` |
| `GET /yy/channel/DOUYIN_LIFE/sync-health` | channel verification controller | channel sync health service |

## Douyin Life Callback Map

| Public callback | Purpose | Local write |
| --- | --- | --- |
| `/api/douyin/life/webhook` | General event subscription | `yy_channel_event_inbox`, `yy_channel_sync_log` |
| `/api/douyin/life/reservation/order-create` | Reservation order created | `yy_order`, `yy_channel_order_mapping`, logs |
| `/api/douyin/life/reservation/pay-notify` | Reservation payment notification | `yy_order.pay_status`, inventory when slot is complete, logs |
| `/api/douyin/life/reservation/order-query` | Douyin queries third-party reservation order | read local order and mapping |
| `/api/douyin/life/reservation/stock-query` | Douyin pulls available stock | read `yy_booking_slot_inventory`, fallback only when documented |
| `/api/douyin/life/tripartite-code/create` | Third-party code issuing | code/mapping/logs |
| `/api/douyin/life/refund/apply` | Refund apply | logs and configured response |
| `/api/douyin/life/refund/notify` | Refund result | order refund state/logs |
| `/api/douyin/life/voucher/revoke` | Single voucher revoke | order/voucher state/logs |
| `/api/douyin/life/voucher/batch-revoke` | Batch voucher revoke | order/voucher state/logs |
| `/api/douyin/life/order/query` | Normal Life order query callback | read local order |
| `/api/douyin/life/fulfil/check-info-sync` | Fulfilment reconciliation | logs and reconciliation data |

## Implementation Guardrails

- Add new request fields first in `backendTypes.ts`, then `backend.ts`, then `appStore.ts`, then backend BO/service.
- Every new field in the staff order form must be either persisted or explicitly documented as remark-compatible until a real column/API exists.
- Do not add a new order table.
- Do not let frontend call Douyin OpenAPI directly.
- Do not expose secrets or full personal identifiers in logs, docs, maps, or evidence.

