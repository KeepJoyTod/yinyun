# JianYue Booking Workbench Design

## Goal

Align the studio workbench booking core with the JianYue reference workflow: dashboard overview, today's appointment board, appointment order list, and staff-created service orders. The implementation must stay on real local data ledgers: `yy_order` for orders and appointments, and `yy_booking_slot_inventory` for slot capacity.

## Decisions Confirmed

- Today's appointment page keeps a compact top summary, but the primary visual surface is the JianYue-style slot board.
- Slot board grouping is exactly `上午`, `下午`, `晚上`.
- Slot cards are capacity board entries. They do not directly create a booking.
- Staff creation uses a dedicated `新增订单` / `新增服务订单` entry.
- Staff service order creation includes both required minimum fields and JianYue-compatible fields: customer phone, customer name, gender, email, linked customer, store, service group, schedule, product, notification toggle, remark, save, and save-and-receive.

## Current Project Fit

The current project already has the correct backbone:

- Frontend route registry: `studio-workbench/src/app/router/featureRegistry.ts`.
- Today's appointment page: `studio-workbench/src/features/schedule/ScheduleView.vue`.
- JianYue-style slot group logic: `studio-workbench/src/features/schedule/scheduleOperations.ts`.
- Slot board component: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`.
- Staff booking modal: `studio-workbench/src/features/orders/StaffBookingModal.vue`.
- Order page: `studio-workbench/src/features/orders/OrdersView.vue`.
- Frontend API facade: `studio-workbench/src/shared/api/backend.ts`.
- Frontend payload types: `studio-workbench/src/shared/api/backendTypes.ts`.
- Backend create endpoint: `POST /yy/order/staff-booking`.
- Backend create BO: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java`.
- Backend create service: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`.

## Reference UI Contract

Today's appointment board:

- Top controls: date, store, service group, `看板`, `档期`, `订单` or equivalent navigation.
- Date strip: visible day cells around the selected date.
- Slot board:
  - `上午`: before 12:00.
  - `下午`: 12:00 through before 18:00.
  - `晚上`: 18:00 and later.
  - Slot card shows clock, `订单：n`, `工位：x/y`.
  - Full card shows `满` badge at the top-right.
  - Filled/full cards use a muted gray background; empty cards use white background and border.

Appointment orders:

- Status groups: `全部有效订单`, `待服务`, `服务中`, `已完成`, `待支付`, `已取消`, `已退单`.
- Primary filters: store, keyword, source, order method, order date range, arrival date range.
- Table columns: customer, product, status, store, remark, arrival time, order time.
- Actions: sync orders, export, booking board, channel verification, new order.

Staff service order:

- Customer section: phone, name, gender, email, linked customer.
- Order section: store, service group, schedule mode, slot date/time, product.
- Optional controls: schedule undecided, previous date, notification toggle, remark.
- Submit actions: return, save, save-and-receive.

## Data Rules

- `yy_order` remains the single order and appointment ledger.
- `yy_booking_slot_inventory` remains the local all-channel slot capacity ledger.
- Historical `DOUYIN_LIFE` orders without real slot fields must not be fabricated into the daily schedule.
- Staff-created scheduled orders write `slotDate`, `slotStartTime`, `slotEndTime`, and `arrivalTime`.
- Staff-created unscheduled orders are allowed only when `scheduleMode=UNDECIDED`; they appear in the order list, not the slot board.
- Save-and-receive must use the existing order status transition semantics instead of bypassing the state machine.
- If backend columns for gender/email/notification are unavailable, customer fields should be persisted through `yy_customer` when possible; otherwise they should be preserved in structured `remark` without creating a second order ledger.

## Implementation Scope

### P0 Schedule Board

- Reduce non-essential schedule chrome in `ScheduleView.vue`.
- Make `JianyueSlotGrid.vue` visually match the reference board more closely.
- Keep `buildJianyueSlotGroups()` as the source of slot grouping and fullness calculation.
- Change slot click behavior to board/detail/list navigation, not direct creation.
- Keep new order entry as a clear top-level action.

### P1 Staff Service Order

- Upgrade `StaffBookingModal.vue` into a JianYue-style service order form or split it into a focused `StaffServiceOrderModal.vue`.
- Extend `OrderCreatePayload` with product, customer, schedule, notification, and save mode fields.
- Extend backend `YyStaffBookingCreateBo` while preserving compatibility with existing callers.
- Update backend create logic to persist new compatible fields and reserve inventory only when a concrete schedule exists.

### P2 Order List Alignment

- Rework `OrdersView.vue` density and filter layout toward the JianYue list.
- Keep current status helper rules; do not duplicate status grouping logic.
- Ensure query deep links from dashboard and schedule still land on the correct order scope.

## Verification

- Frontend contract tests for slot grouping, full badge, and slot click behavior.
- Frontend contract tests for service order payload fields and save modes.
- Backend unit tests for scheduled staff order, unscheduled staff order, and save-and-receive status transition.
- Browser smoke for `/dashboard/today` and `/order/appointment`.
- Production smoke after HK2 deploy.

## Explicit Non-Goals

- Do not clone JianYue's account data.
- Do not store reference-system credentials in repository or local maps.
- Do not invent appointment slots for historical Douyin Life orders.
- Do not replace the current feature registry with Joe/Joe666 routes.
