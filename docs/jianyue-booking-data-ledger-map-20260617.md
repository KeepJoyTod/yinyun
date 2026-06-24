# JianYue Booking Data Ledger Map 2026-06-17

## Conclusion

The booking workbench has two source-of-truth ledgers:

| Ledger | Table | Purpose |
| --- | --- | --- |
| Order ledger | `yy_order` | Every appointment, staff-created service order, platform order, payment summary, status, arrival time, and channel identifier. |
| Slot capacity ledger | `yy_booking_slot_inventory` | Store/service/date/time capacity, used count, conflict count, and full-slot status. |

Do not create a second appointment table. Do not put untrusted historical Douyin Life order rows into the timed slot board.

## Core Tables

| Table | Role | Write owner | Read owner |
| --- | --- | --- | --- |
| `yy_order` | Single order and appointment ledger | Staff order create, JianYue import, Douyin Life sync/SPI, future Meituan sync | Dashboard, schedule, order list, reports, export |
| `yy_booking_slot_inventory` | Local capacity ledger | Schedule seed/import, staff booking reserve, future Douyin inventory callback | Schedule grid, stock-query SPI, capacity warnings |
| `yy_channel_order_mapping` | External order idempotency | Channel adapters | Sync health, order detail, duplicate prevention |
| `yy_channel_product_mapping` | External POI/SKU/product mapping | Admin/channel mapping pages and seed scripts | Douyin resolver, product entry pages, order attribution |
| `yy_channel_sync_log` | OpenAPI/SPI evidence and error log | Channel adapters and SPI controllers | Admin diagnostics, acceptance evidence |
| `yy_product` | Local product/SKU catalog | Admin product config and seed scripts | Staff order form, mapping resolver, reports |
| `yy_service_group` | Service group and schedule category | Admin service config and seed scripts | Schedule grouping, staff order form |
| `yy_customer` | Customer master data | Staff order form, customer import, order sync when safe | Customer search, CRM, order detail |
| `yy_store` | Real store master data | Store seed/admin config | All store-scoped workbench views |
| `yy_employee_store` | Multi-store staff permission scope | Admin employee-store binding | Bootstrap identity, store filters, permissions |

## `yy_order` Field Rules

| Field | Use | Rule |
| --- | --- | --- |
| `store_id` | Real store attribution | Must come from staff choice, JianYue source, or unique POI mapping. Never use a random first store fallback. |
| `order_no` | Local display number | Staff/JianYue local orders may use local number; platform orders also keep `external_order_id`. |
| `customer_name` / `customer_phone` | Customer lookup | Store only when available from valid source. UI masks phone where needed. |
| `source` | Human-facing source | Examples: `DOUYIN_LIFE`, `JIANYUE`, `LOCAL`, `MEITUAN`. |
| `booking_method` | Order method | Distinguish platform order, staff manual booking, walk-in, phone booking where available. |
| `order_time` | Creation/payment/order time | Used for one-month Douyin order window and reports. |
| `arrival_time` | Arrival datetime | Must match slot fields when the row is scheduled. |
| `status` | Service lifecycle | Mapped by the status machine document. |
| `channel_type` | Technical channel | `DOUYIN_LIFE`, `DOUYIN_MINI_APP`, `LOCAL`, `JIANYUE`, `MEITUAN`. |
| `pay_status` | Payment summary | Do not infer paid from service status; use platform payment facts or staff input. |
| `external_order_id` | Platform order id | Required for platform idempotency and external detail lookup. |
| `external_sku_id` / `external_poi_id` | Platform attribution | Used by `DouyinLifeStoreResolver` and product mapping. |
| `service_group_id` | Schedule category | Required for scheduled staff orders where a service group exists. |
| `inventory_slot_id` | Capacity reservation link | Set only after a real slot is resolved/reserved. |
| `slot_date` / `slot_start_time` / `slot_end_time` | Timed schedule fields | Required for timed schedule board. Historical Douyin rows without trustworthy fields stay empty. |
| `inventory_status` | Capacity state | `CONFIRMED`, `CONFLICT`, `NEED_MAPPING`, or empty when not applicable. |
| `conflict_reason` | Capacity exception | Required when `inventory_status=CONFLICT` or `NEED_MAPPING`. |

## `yy_booking_slot_inventory` Field Rules

| Field | Use | Rule |
| --- | --- | --- |
| `store_id` | Store capacity | Required. |
| `service_group_id` | Service grouping | Required for schedule board grouping when known. |
| `external_sku_id` | Platform SKU link | Optional, used for Douyin inventory sync and resolver. |
| `biz_date` | Date | `yyyy-MM-dd`. |
| `start_time` / `end_time` | Slot | `HH:mm`, usually 30-minute granularity for JianYue-like board. |
| `capacity` | Workstation count | Capacity shown as the denominator in `工位：x/y`. |
| `paid_count` | Confirmed/reserved count | Counted from real scheduled orders only. |
| `conflict_count` | Over-capacity count | Counted when capacity was exceeded or reservation failed. |
| `status` | Slot state | UI derives `满` when `paid_count >= capacity`, even if status is generic active. |
| `version` | Optimistic locking | Must be used by reservation updates to avoid overbooking races. |

## Write Paths

| Scenario | Order ledger write | Slot ledger write |
| --- | --- | --- |
| Staff creates scheduled order | Insert `yy_order` with slot fields | Reserve matching slot; update `paid_count` or conflict |
| Staff creates undecided order | Insert `yy_order` without slot fields | No slot write |
| JianYue schedule import | Insert/update `yy_order` when order data exists | Upsert slot capacity and counts |
| Douyin Life historical sync | Insert/update `yy_order`, mapping, log | No timed slot write unless payload has real slot fields |
| Douyin Life new SPI/Webhook with reserve info | Insert/update `yy_order`, mapping, log | Reserve slot when POI/SKU/date/time resolve uniquely |
| Reschedule order | Update `yy_order.slot_*` | Release old reservation and reserve new slot atomically |
| Cancel/refund order | Update status/pay/refund fields | Release or decrement reservation if it had a confirmed slot |

## Read Paths

| Page | Required tables |
| --- | --- |
| 首页经营概况 | `yy_order`, `yy_booking_slot_inventory`, `yy_channel_sync_log` |
| 今日预约 | `yy_booking_slot_inventory`, scheduled rows from `yy_order` |
| 预约订单 | `yy_order`, `yy_channel_order_mapping`, `yy_product`, `yy_store` |
| 新增服务订单 | `yy_store`, `yy_service_group`, `yy_product`, `yy_customer`, `yy_booking_slot_inventory` |
| 同步/异常页 | `yy_channel_sync_log`, `yy_channel_order_mapping`, `yy_channel_product_mapping` |

## Invariants

- One business order row must have one primary `yy_order.id`.
- One external platform order must map through `yy_channel_order_mapping(channel_type, external_order_id)`.
- One timed schedule order must have `slot_date`, `slot_start_time`, `slot_end_time`, and `arrival_time`.
- A slot board card must be driven by `yy_booking_slot_inventory` plus real scheduled order counts.
- Historical records without trustworthy appointment time are valid accounting/order-list records, not schedule-board records.
