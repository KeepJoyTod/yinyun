# JianYue Booking Workbench API Contract 2026-06-17

## Scope

This document defines the concrete API contract for the JianYue-aligned booking workbench. It supplements:

- `docs/studio-workbench-api-route-map.md`
- `docs/contracts/studio-workbench-api-contract-20260615.md`
- `docs/api/studio-workbench-openapi-skeleton-20260615.yaml`

It does not replace the global API contract. It narrows the booking workbench slice.

## Global Rules

- Order and appointment facts live in `yy_order`.
- Slot capacity lives in `yy_booking_slot_inventory`.
- Douyin Life sync writes `yy_order`, `yy_channel_order_mapping`, `yy_channel_sync_log`, and optionally `yy_channel_event_inbox`.
- Historical `DOUYIN_LIFE` orders without real slot fields remain excluded from the timed schedule grid.
- Staff-created scheduled orders reserve local slot inventory.
- Staff-created `UNDECIDED` orders do not reserve local slot inventory.
- SPI/OpenAPI logid values must be recorded in `yy_channel_sync_log.request_id` or the equivalent event inbox request id.

## Status Vocabulary

### Local Order Status

| Workbench Label | Local Status Candidates | Meaning |
| --- | --- | --- |
| 待服务 | `PENDING` | Order is valid but not yet in service. |
| 服务中 | `CONFIRMED`, `SERVING` | Order is confirmed or currently being served. |
| 已完成 | `SELECTING`, `COMPLETED` | Service has finished or entered post-service selection/delivery. |
| 已取消 | `CANCELLED` | Cancelled and excluded from valid orders. |
| 已退单 | `REFUNDED`, pay/refund status refunded | Refunded and excluded from valid orders. |

### Staff Save Action

| Field | Values | Behavior |
| --- | --- | --- |
| `submitMode` | `SAVE`, `SAVE_AND_RECEIVE` | `SAVE` creates only. `SAVE_AND_RECEIVE` creates then applies the allowed receive/serving transition. |
| `scheduleMode` | `SCHEDULED`, `UNDECIDED`, `PAST_DATE` | `SCHEDULED` requires slot fields. `UNDECIDED` skips inventory reservation. `PAST_DATE` allows previous date only with explicit staff intent. |

## API-001 List Appointment Orders

```text
GET /yy/order/list
```

### Used By

- `/order/appointment`
- `/dashboard/today`
- `/`
- order status cards
- schedule slot deep links

### Query Parameters

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `pageNum` | number | no | RuoYi page number. |
| `pageSize` | number | no | Workbench default should avoid unbounded all-history loads. |
| `storeId` | string/long | no | Real store id. |
| `channelType` | string | no | Example: `DOUYIN_LIFE`, `LOCAL`, `JIANYUE`, `MEITUAN`. |
| `source` | string | no | Existing frontend may use source labels; adapter maps to backend filters where supported. |
| `orderStatus` | string | no | Raw local status. |
| `payStatus` | string | no | Example: `PAID`, `UNPAID`, `REFUNDED`. |
| `inventoryStatus` | string | no | Example: `CONFIRMED`, `CONFLICT`, `NEED_MAPPING`. |
| `keyword` | string | no | Name, phone, order no, external order no. |
| `beginOrderTime` | datetime | no | Order create time start. |
| `endOrderTime` | datetime | no | Order create time end. |
| `beginArrivalTime` | datetime | no | Arrival/slot time start. |
| `endArrivalTime` | datetime | no | Arrival/slot time end. |
| `photoDeliveryIssueOnly` | boolean/int | no | For dashboard issue count. |

### Response

RuoYi `TableDataInfo`:

```json
{
  "code": 200,
  "rows": [
    {
      "id": "910000000012152033",
      "orderNo": "JY-12152033",
      "channelType": "JIANYUE",
      "source": "JIANYUE",
      "storeId": "900000000000000100",
      "customerName": "客户名",
      "customerPhone": "13800000000",
      "status": "PENDING",
      "payStatus": "PAID",
      "productId": "900000000000020100",
      "serviceGroupId": "900000000000010100",
      "arrivalTime": "2026-06-17 10:30:00",
      "slotDate": "2026-06-17",
      "slotStartTime": "10:30",
      "slotEndTime": "11:00",
      "inventoryStatus": "CONFIRMED",
      "remark": ""
    }
  ],
  "total": 1
}
```

### Frontend Mapping

- `backendApi.listOrders()`
- `mapYyOrder()`
- `appStore.refreshCoreData()`
- `OrdersView.vue`

## API-002 Create Staff Service Order

```text
POST /yy/order/staff-booking
```

### Used By

- `StaffBookingModal.vue`
- `appStore.createOrder()`
- `backendApi.createOrder()`

### Current Request Body

```json
{
  "storeId": "900000000000000100",
  "serviceGroupId": "900000000000010100",
  "customerName": "张三",
  "customerPhone": "13800000000",
  "arrivalTime": "2026-06-17 10:30:00",
  "slotDate": "2026-06-17",
  "slotStartTime": "10:30",
  "slotEndTime": "11:00",
  "status": "PENDING",
  "payStatus": "UNPAID",
  "workstationNo": "",
  "remark": "门店录入"
}
```

### Required Extension Request Body

```json
{
  "storeId": "900000000000000100",
  "serviceGroupId": "900000000000010100",
  "productId": "900000000000020100",
  "customerId": "900000000000030100",
  "customerName": "张三",
  "customerPhone": "13800000000",
  "gender": "FEMALE",
  "email": "customer@example.com",
  "arrivalTime": "2026-06-17 10:30:00",
  "slotDate": "2026-06-17",
  "slotStartTime": "10:30",
  "slotEndTime": "11:00",
  "scheduleMode": "SCHEDULED",
  "submitMode": "SAVE_AND_RECEIVE",
  "notifyEnabled": true,
  "status": "PENDING",
  "payStatus": "UNPAID",
  "workstationNo": "",
  "remark": "门店录入"
}
```

### Field Rules

| Field | Required | Rule |
| --- | --- | --- |
| `storeId` | yes | Must be a real `yy_store.id`. |
| `serviceGroupId` | yes for scheduled order | Must belong to the selected store when a store binding exists. |
| `productId` | no but preferred | Should be a real `yy_product.id`. |
| `customerName` | yes | Non-empty. |
| `customerPhone` | yes | Mainland mobile validation on frontend; backend should also validate basic format. |
| `gender` | no | Store in customer profile when possible. |
| `email` | no | Store in customer profile when possible. |
| `scheduleMode` | yes after extension | Defaults to `SCHEDULED` for backward compatibility. |
| `slotDate/slotStartTime/slotEndTime/arrivalTime` | yes when `SCHEDULED` or `PAST_DATE` | Not required when `UNDECIDED`. |
| `notifyEnabled` | no | Does not imply success unless notification API is called and logged. |
| `submitMode` | no | Defaults to `SAVE`. |

### Response

`R<YyOrderVo>` with the created order.

### Ledger Effects

| Mode | `yy_order` | `yy_booking_slot_inventory` |
| --- | --- | --- |
| `SCHEDULED + SAVE` | Insert local/staff order | Reserve or mark conflict according to inventory service. |
| `SCHEDULED + SAVE_AND_RECEIVE` | Insert and transition through allowed status | Reserve or mark conflict. |
| `UNDECIDED` | Insert local/staff order without slot fields | No reservation. |
| `PAST_DATE` | Insert with explicit past date intent | Reserve only if inventory service accepts the slot. |

## API-003 Transition Order Status

```text
POST /yy/order/{id}/transition
```

### Request

```json
{
  "expectedStatus": "PENDING",
  "targetStatus": "SERVING",
  "remark": "保存并接待"
}
```

### Used By

- order detail actions
- `SAVE_AND_RECEIVE` after staff creation

### Rule

The frontend must not mutate status locally without backend confirmation.

## API-004 Reschedule Order

```text
POST /yy/order/{id}/reschedule
```

### Request

```json
{
  "expectedStatus": "PENDING",
  "arrivalTime": "2026-06-18 10:00:00",
  "serviceGroupId": "900000000000010100",
  "slotDate": "2026-06-18",
  "slotStartTime": "10:00",
  "slotEndTime": "10:30",
  "remark": "客户改期"
}
```

### Ledger Effects

- Releases old confirmed inventory when applicable.
- Confirms or flags new inventory according to slot availability.
- Updates `yy_order.slot_*` and `arrival_time`.

## API-005 List Booking Slot Inventory

```text
GET /yy/bookingSlotInventory/list
```

### Used By

- `/dashboard/today`
- `/merchant/inventory`
- slot grid
- capacity conflict cards

### Query Parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `storeId` | string/long | Filter by store. |
| `serviceGroupId` | string/long | Filter by service group. |
| `bizDate` or `date` | date | Selected schedule date. |
| `beginDate` | date | Range start when supported. |
| `endDate` | date | Range end when supported. |
| `status` | string | Example: `ACTIVE`. |
| `conflictOnly` | boolean/int | Only slots with conflict count. |

### Response Row

```json
{
  "id": "900000000001000002",
  "storeId": "900000000000000100",
  "serviceGroupId": "900000000000010100",
  "bizDate": "2026-06-17",
  "startTime": "10:30",
  "endTime": "11:00",
  "capacity": 1,
  "confirmedCount": 1,
  "conflictCount": 0,
  "status": "ACTIVE",
  "remark": ""
}
```

## API-006 Update Booking Slot Inventory

```text
PUT /yy/bookingSlotInventory
```

### Request

```json
{
  "id": "900000000001000002",
  "storeId": "900000000000000100",
  "serviceGroupId": "900000000000010100",
  "bizDate": "2026-06-17",
  "startTime": "10:30",
  "endTime": "11:00",
  "capacity": 2,
  "status": "ACTIVE",
  "remark": "临时增容"
}
```

### Rule

Capacity must not be lower than confirmed occupied count.

## API-007 List Stores

```text
GET /yy/store/list
```

Used by dashboard filters, staff order form, store management, and sharing entry pages.

Required row fields:

- `id`
- `storeCode`
- `storeName`
- `status`
- `remark`

## API-008 List Service Groups

```text
GET /yy/serviceGroup/list
```

Used by schedule filters, slot inventory, and staff order form.

Required row fields:

- `id`
- `storeId`
- `groupCode`
- `groupName`
- `capacity`
- `durationMinutes`
- `status`
- `sort`

## API-009 List Products

```text
GET /yy/product/list
```

Used by staff order product selection and product settings.

Required row fields:

- `id`
- `productCode`
- `productName`
- `productType`
- `price`
- `status`
- `remark`

## API-010 List Customers

```text
GET /yy/customer/list
```

Used by customer association in the staff service order form.

Recommended filters:

- `customerPhone`
- `customerName`
- `storeId`

Required row fields:

- `id`
- `customerName`
- `customerPhone`
- `gender`
- `remark`

## API-011 Notifications

```text
GET /yy/notificationTemplate/list
GET /yy/notificationLog/list
```

Staff order form may show `notifyEnabled`, but actual delivery is not complete unless a notification send API is called and a row appears in `yy_notification_log`.

## API-012 Douyin Life Manual Order Sync

```text
POST /yy/channel/DOUYIN_LIFE/orders/sync
```

### Request

```json
{
  "startTime": "2026-06-17 00:00:00",
  "endTime": "2026-06-17 23:59:59",
  "maxPages": 2,
  "maxTotal": 80
}
```

### Rule

Backend must convert to official `create_order_start_time` and `create_order_end_time` seconds timestamps when calling Douyin OpenAPI.

### Response

```json
{
  "syncStatus": "SYNCED",
  "total": 7,
  "created": 7,
  "updated": 0,
  "failed": 0,
  "lastLogId": "20260617143817..."
}
```

### Ledger Effects

- Upsert `yy_channel_order_mapping`.
- Upsert `yy_order`.
- Write `yy_channel_sync_log`.
- Do not write schedule inventory unless the order payload contains trustworthy slot fields.

## API-013 Douyin Life Sync Health

```text
GET /yy/channel/DOUYIN_LIFE/sync-health
GET /yy/channel/DOUYIN_LIFE/auto-sync/status
GET /yy/channel/DOUYIN_LIFE/event-inbox/list
POST /yy/channel/DOUYIN_LIFE/event-inbox/{id}/retry
```

Used by channel verification and operational troubleshooting.

## API-014 Douyin Life SPI Public Callbacks

These are platform-to-server callbacks, not normal workbench API calls.

```text
POST /api/douyin/life/webhook
POST /api/douyin/life/reservation/order-create
POST /api/douyin/life/reservation/pay-notify
POST /api/douyin/life/reservation/order-query
POST /api/douyin/life/reservation/stock-query
POST /api/douyin/life/tripartite-code/create
POST /api/douyin/life/refund/apply
POST /api/douyin/life/refund/notify
POST /api/douyin/life/voucher/revoke
POST /api/douyin/life/voucher/batch-revoke
POST /api/douyin/life/order/query
POST /api/douyin/life/fulfil/check-info-sync
```

Rules:

- Return Douyin raw JSON response shape.
- Do not wrap with RuoYi `R.ok`.
- Record `X-Bytedance-Logid`.
- Do not log full phone, token, secret, or raw private identifiers.

## Workbench API Verification

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-studio-api-contracts.ps1
git diff --check
```

