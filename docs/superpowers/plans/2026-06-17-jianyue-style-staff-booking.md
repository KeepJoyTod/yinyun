# Jianyue-Style Staff Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real staff manual appointment workflow and wire it into the Jian Yue-style appointment overview.

**Architecture:** Backend exposes a dedicated staff-booking endpoint that generates the order number, inserts `yy_order`, and reserves inventory in one transaction. Frontend reuses the existing store/service-group/inventory data and adds a modal entry from order list and schedule slots.

**Tech Stack:** Spring Boot/RuoYi, MyBatis Plus, PostgreSQL, Vue 3, Pinia-like reactive store, Vite, Vitest, Tailwind utility classes.

---

### Task 1: Backend Staff Booking API

**Files:**
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyOrderService.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderController.java`
- Test: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java`

- [ ] Write failing test `createStaffBookingShouldInsertLocalOrderAndReserveInventory`.
- [ ] Add `YyStaffBookingCreateBo` with validation for store, service group, customer, slot date/time, and optional pay/status fields.
- [ ] Add `createStaffBooking(YyStaffBookingCreateBo bo)` to the service.
- [ ] Implement transaction: generate `YY-STAFF-<id>`, normalize fields, insert order, sync customer, call `bookingSlotInventoryService.confirmPaidOrderSlot(order)`, return `queryById`.
- [ ] Add `POST /yy/order/staff-booking` guarded by `yy:order:add`.
- [ ] Run targeted Maven test.

### Task 2: Frontend API And Store

**Files:**
- Modify: `studio-workbench/src/shared/api/backendTypes.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Test: `studio-workbench/src/shared/api/backend.contract.test.ts`

- [ ] Extend `OrderCreatePayload` with `serviceGroupId`, `slotDate`, `slotStartTime`, `slotEndTime`, `payStatus`, `status`, and `durationMinutes`.
- [ ] Change `backendApi.createOrder` to call `/yy/order/staff-booking`.
- [ ] Send slot/service group fields and keep product id optional.
- [ ] Update `appStore.createOrder` to accept service group, date, time, duration, and refresh schedule/inventory after creation.
- [ ] Run targeted Vitest contract tests.

### Task 3: Staff Booking Modal

**Files:**
- Create: `studio-workbench/src/features/orders/StaffBookingModal.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`
- Test: `studio-workbench/src/features/orders/StaffBookingModal.contract.test.ts`

- [ ] Build modal fields: store, service group, customer name, phone, date, start time, duration, pay status, status, remark.
- [ ] Validate name, phone, service group, date, and time before submit.
- [ ] On submit call `appStore.createOrder`.
- [ ] Add order list header button "订单" or "新增预约".
- [ ] Add schedule empty slot click to open the modal with prefilled slot context.

### Task 4: Jian Yue Slot Interaction Polish

**Files:**
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- Modify: `studio-workbench/src/shared/components/schedule/jianyueSlotTypes.ts`
- Modify: `studio-workbench/src/features/schedule/scheduleOperations.ts`
- Test: `studio-workbench/src/features/schedule/scheduleOperations.test.ts`

- [ ] Add service group ids and primary slot metadata to slot cards.
- [ ] Preserve `订单：n 工位：x/y` labels.
- [ ] Show full/conflict badge in the card corner.
- [ ] Add wheel-to-horizontal scrolling on slot rows.
- [ ] Empty slot emits enough context for the booking modal.

### Task 5: Verification

**Files:**
- Update maps if behavior changes materially: `docs/yiyue/code_map.md`, `api_map.md`, `liucheng_map.md`

- [ ] Run backend targeted test.
- [ ] Run frontend Vitest targeted tests.
- [ ] Run `npm run build` or at least `vue-tsc -b`.
- [ ] Open local/prod workbench and verify order creation flow visually when server is available.
