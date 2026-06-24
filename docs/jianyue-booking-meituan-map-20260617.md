# JianYue Booking Meituan Map 2026-06-17

## Conclusion

Meituan should follow the same channel-adapter pattern as Douyin Life, but it must not block the JianYue booking core. Build it as a parallel channel after order/status/slot ledgers are stable.

## Current Project Position

| Item | Current state |
| --- | --- |
| Adapter | `MeituanChannelAdapter` framework exists |
| Client | `MeituanOpenApiClient` framework exists |
| Local endpoints | `GET /yy/channel/MEITUAN/orders`, `POST /yy/channel/MEITUAN/orders/sync`, `POST /yy/channel/MEITUAN/verify` framework exists |
| Missing | Real authorization, official path/signature confirmation, production credentials |

## Data Mapping

| Meituan concept | YingYue table/field |
| --- | --- |
| Shop id | `yy_store` or channel mapping store field |
| Product/SKU | `yy_product`, `yy_channel_product_mapping` |
| Order id | `yy_channel_order_mapping.external_order_id`, `yy_order.external_order_id` |
| Order status | `yy_order.status`, `pay_status`, `refund_status` |
| Appointment time | `yy_order.slot_*`, `yy_booking_slot_inventory` only when trustworthy |
| Sync log | `yy_channel_sync_log` |

## Implementation Phases

| Phase | Scope |
| --- | --- |
| M1 Authorization proof | Confirm app credentials, shop binding, token refresh, signature |
| M2 Read-only order sync | Sync Meituan orders into `yy_order` and mapping, no slot write without real time |
| M3 Status/refund/hx mapping | Map paid, used, refunded, cancelled states |
| M4 Appointment slot integration | Write `yy_booking_slot_inventory` only when Meituan payload includes real time and store |
| M5 Workbench UI | Add channel filters, sync button, anomaly view |

## Rules

- Meituan status groups must use the same status machine document.
- Meituan orders must not create a second order ledger.
- Unknown shop/product mapping must surface as `NEED_MAPPING`.
- No real API calls without confirmed credentials and official docs.

## Acceptance

- Sync writes idempotent `yy_channel_order_mapping` rows.
- Meituan rows appear in the same appointment order list by channel filter.
- Missing appointment time does not create schedule cards.
- Sync failures are visible in `yy_channel_sync_log`.
