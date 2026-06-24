# Jianyue-Style Staff Booking Design

## Goal

Build the staff-side manual appointment workflow first, then make the appointment overview behave like the Jian Yue reference screenshots. The workflow must write real `yy_order` records and occupy `yy_booking_slot_inventory`; it must not fabricate appointment times for historical DOUYIN_LIFE orders.

## Reference

Primary visual reference is the user's Jian Yue screenshots because the local browser cannot inspect the authenticated page. Local DNS resolves `brand.yuyue123.cn` to `28.0.0.5` and TLS closes; HK2 can fetch static HTML, but not the logged-in DOM. Visible reference details to preserve:

- Dark left sidebar, orange active state, white top bar.
- Compact "预约概况" section with store selectors, date strip, and orange action buttons.
- Morning, afternoon, evening sections.
- Slot cards show time, order count, workstation capacity like `1/2`, and full/conflict state.
- Clicking a non-empty slot opens order detail/list; clicking an empty slot starts a new appointment.
- Staff detail view has "返回", "编辑", and horizontally scrollable order table.

## Data Rules

- `yy_order` remains the only order and appointment ledger.
- Staff-created appointments use `source=LOCAL`, `channelType=LOCAL`, `bookingMethod=STAFF_MANUAL`.
- Staff-created appointments can reserve inventory even when `payStatus=UNPAID`; payment status remains independent from capacity occupancy.
- A staff-created appointment requires store, service group, customer name, customer mobile, date, start time, end time, and status.
- The backend must generate a local order number and return the created `YyOrderVo`.
- The backend must call the unified inventory service after insert when slot identity is complete.
- Historical DOUYIN_LIFE orders with blank slot fields stay out of the daily schedule grid.

## UI Scope

- Add a reusable staff booking modal.
- Add "订单" or "新增预约" entry on `/order/appointment` and the schedule page.
- Schedule empty slot click opens the modal prefilled with store, date, start time, end time, and service group when available.
- Existing slot click keeps the current behavior of opening the order list/detail.
- Add horizontal wheel support to Jian Yue slot grid/list areas.

## Verification

- Backend unit test proves staff booking inserts an order and occupies inventory.
- Frontend tests prove the API payload includes service group and slot fields, and the slot grid contract exposes empty-slot creation intent.
- Run targeted Maven and Vitest checks before reporting completion.
