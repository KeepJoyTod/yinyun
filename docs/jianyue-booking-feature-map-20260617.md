# JianYue Booking Feature Map 2026-06-17

## Natural-Language Feature Index

| User wording | Feature | Code location |
| --- | --- | --- |
| 首页经营概况 | Business overview | `studio-workbench/src/features/dashboard/DashboardView.vue` |
| 今日预约 | Today's appointment board | `studio-workbench/src/features/schedule/ScheduleView.vue` |
| 上午下午晚上分类 | Slot period grouping | `studio-workbench/src/features/schedule/scheduleOperations.ts` |
| 时间格 / 档期格 | Slot card UI | `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue` |
| 满员角标 | Full slot badge | `JianyueSlotGrid.vue`, `buildJianyueSlotGroups()` |
| 工位容量 | Slot capacity | `yy_booking_slot_inventory`, `BookingInventorySlot`, `buildJianyueSlotGroups()` |
| 预约订单 | Appointment order list | `studio-workbench/src/features/orders/OrdersView.vue` |
| 全部有效订单 | Valid order status group | `studio-workbench/src/features/orders/orderOperations.ts` |
| 待服务 / 服务中 / 已完成 | Order status groups | `orderOperations.ts`, `OrdersView.vue` |
| 同步订单 | Douyin Life order sync | `appStore.syncDouyinLifeOrdersAndRefresh`, `backendApi.syncDouyinLifeOrders` |
| 新增订单 | Staff service order entry | `OrdersView.vue`, `ScheduleView.vue`, `StaffBookingModal.vue` |
| 店员录入 | Staff manual booking | `StaffBookingModal.vue`, `POST /yy/order/staff-booking` |
| 保存并接待 | Create and receive customer | `StaffBookingModal.vue`, `YyOrderServiceImpl.createStaffBooking()` |
| 档期未定 | Unscheduled service order | Extend `OrderCreatePayload`, `YyStaffBookingCreateBo` |
| 关联客户 | Customer linking | `yy_customer`, `CustomersView.vue`, staff order payload extension |
| 产品选择 | Product selection | `appStore.products`, `ProductConfigView.vue`, staff order payload extension |
| 发送通知 | Notification option | `yy_notification_template`, `yy_notification_log`, staff order payload extension |

## User Flows

### Flow 1: Check today's capacity

```text
Open /dashboard/today
  -> choose date/store/service group
  -> read 上午/下午/晚上 slot cards
  -> click slot
  -> navigate to scoped order list/detail
```

### Flow 2: Create service order

```text
Click 新增订单
  -> fill customer phone/name/gender/email
  -> optionally link customer
  -> choose store/service group/product
  -> choose schedule or 档期未定
  -> choose notification and remark
  -> 保存 or 保存并接待
  -> yy_order created
  -> yy_booking_slot_inventory updated when scheduled
```

### Flow 3: Sync platform orders

```text
Click 同步订单
  -> POST /yy/channel/DOUYIN_LIFE/orders/sync
  -> writes/updates yy_order
  -> only orders with real slot fields affect schedule
  -> refresh dashboard, schedule, order list, logs
```

## Implementation Priority

1. Schedule board reference alignment.
2. Full staff service order form.
3. Appointment order filter/list density.
4. Evidence and maps update.
