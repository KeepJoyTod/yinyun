# JianYue Booking Product Map 2026-06-17

## Product Goal

Make the workbench usable for studio staff in the same operational shape as JianYue: see today's capacity, find appointment orders quickly, and create service orders without leaving the workbench.

## Personas

| Persona | Needs |
| --- | --- |
| Front desk staff | See today's slots, create new service orders, find customer orders by phone/name, mark service progress. |
| Store manager | Check capacity, full slots, order status, channel/order mix, and operational exceptions. |
| Photographer/service staff | Understand which customer arrives at which time and whether the order is pending, serving, or completed. |
| Operator/admin | Sync Douyin Life orders, inspect channel mapping, and verify data quality. |

## Core Product Surfaces

| Surface | User value | Current status | Target |
| --- | --- | --- | --- |
| Business overview | Know today's income/order state | Implemented, needs density tuning | Compact JianYue-like overview with deep links. |
| Today's appointment | Know capacity by time | Implemented, needs reference alignment | Morning/afternoon/evening slot board with full badges. |
| Appointment orders | Search and operate orders | Implemented, needs filter/list alignment | JianYue-like filters, status groups, dense table. |
| New service order | Staff manual booking | Simplified modal exists | Full JianYue-style form and save modes. |
| Slot inventory | Capacity source of truth | Implemented | Continue using `yy_booking_slot_inventory`. |
| Douyin sync | Bring platform orders into ledger | Implemented with known historical slot limit | Keep order sync; only scheduled payloads affect slot board. |

## Product Rules

- The slot board is a capacity board, not the primary creation form.
- New service orders start from a clear `新增订单` entry.
- Full slots are visible and inspectable, but should not silently accept more scheduled orders.
- Unscheduled orders can exist, but they do not appear in the timed slot board.
- Orders without trustworthy appointment time remain in the order list and anomaly/sync views.

## Selected UX Policy

| Decision | Policy |
| --- | --- |
| Today's appointment shape | Keep compact top summary and use JianYue slot grid as primary body. |
| Slot click | Navigate to matching order scope/detail; do not directly create an order. |
| New order | Dedicated `新增订单` / `新增服务订单` entry. |
| Staff form | Implement both basic and extended JianYue fields. |
| Historical Douyin orders | Do not fabricate schedule slots. |

## Acceptance Signals

- A staff member can open `/dashboard/today`, pick a store/date, and understand capacity within 5 seconds.
- A full slot clearly shows `满`.
- The order list can reproduce JianYue-style scopes: all valid, pending service, serving, completed, pending payment, canceled, refunded.
- A staff member can create a scheduled order and see the slot capacity update.
- A staff member can create an undecided-schedule order and find it in the order list.
