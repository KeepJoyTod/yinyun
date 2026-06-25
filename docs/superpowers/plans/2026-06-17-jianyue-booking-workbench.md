# JianYue Booking Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the studio workbench booking core with JianYue-style schedule, order list, and staff-created service order workflows.

**Architecture:** Keep `yy_order` as the order ledger and `yy_booking_slot_inventory` as the slot capacity ledger. Reuse current Vue 3 workbench routes and API facade; extend only the staff-order create path and schedule/order UI contracts needed for the selected workflow.

**Tech Stack:** Vue 3, TypeScript, Vite, Vitest, Tailwind/custom CSS tokens, Java Spring Boot/RuoYi, MyBatis Plus, PostgreSQL.

---

## File Structure

- Modify `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`: reference-style slot card rendering and click intent.
- Modify `studio-workbench/src/features/schedule/ScheduleView.vue`: compact top summary, new-order entry, slot click to order/detail scope.
- Modify `studio-workbench/src/features/schedule/scheduleOperations.ts`: slot query helpers and tests for the selected click policy.
- Modify `studio-workbench/src/features/orders/StaffBookingModal.vue`: full service order form.
- Modify `studio-workbench/src/shared/api/backendTypes.ts`: extend `OrderCreatePayload`.
- Modify `studio-workbench/src/shared/api/backend.ts`: pass extended payload to `/yy/order/staff-booking`.
- Modify `studio-workbench/src/shared/stores/appStore.ts`: pass extended fields and save mode.
- Modify `studio-workbench/src/features/orders/OrdersView.vue`: align filters and action labels with JianYue.
- Modify `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java`: add compatible fields.
- Modify `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`: persist compatible fields and handle save-and-receive.
- Modify tests under `studio-workbench/src/**.test.ts` and `backend/ruoyi-modules/ruoyi-yy/src/test/**`.

## Task 1: Lock Schedule Board Contract

**Files:**
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.contract.test.ts`

- [ ] **Step 1: Add tests for reference-style groups and no direct empty-slot creation**

Assert the grid source contains `上午`, `下午`, `晚上`, `订单：`, `工位：`, and `满`. Assert `ScheduleView.vue` no longer opens staff booking directly from `openJianyueSlot`.

- [ ] **Step 2: Run focused tests and verify they fail before implementation**

Run: `npm --prefix studio-workbench run test -- JianyueSlotGrid.contract.test.ts ScheduleView.contract.test.ts`

Expected before implementation: at least one assertion fails for the new click-policy contract.

- [ ] **Step 3: Implement slot-board UI and click policy**

Update `JianyueSlotGrid.vue` to use flatter cards matching the reference. Update `ScheduleView.vue` so `openJianyueSlot()` routes to `/order/appointment` with date/store/time query when a slot is clicked. Keep `openStaffBookingModal()` only on explicit new-order buttons.

- [ ] **Step 4: Re-run focused tests**

Run: `npm --prefix studio-workbench run test -- JianyueSlotGrid.contract.test.ts ScheduleView.contract.test.ts`

Expected: PASS.

## Task 2: Upgrade Staff Service Order Form

**Files:**
- Modify: `studio-workbench/src/features/orders/StaffBookingModal.vue`
- Modify: `studio-workbench/src/features/orders/StaffBookingModal.contract.test.ts`
- Modify: `studio-workbench/src/shared/api/backendTypes.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`

- [ ] **Step 1: Add payload contract tests**

Assert the modal/app store can submit `customerName`, `customerPhone`, `gender`, `email`, `customerId`, `storeId`, `serviceGroupId`, `productId`, `scheduleMode`, `slotDate`, `slotStartTime`, `slotEndTime`, `notifyEnabled`, `remark`, and `submitMode`.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm --prefix studio-workbench run test -- StaffBookingModal.contract.test.ts appStore.contract.test.ts backend.contract.test.ts`

Expected before implementation: extended field assertions fail.

- [ ] **Step 3: Extend frontend types and facade**

Add optional fields to `OrderCreatePayload`: `gender`, `email`, `customerId`, `scheduleMode`, `notifyEnabled`, and `submitMode`. Ensure `backend.ts` forwards only defined fields and keeps old callers valid.

- [ ] **Step 4: Extend modal UI**

Add JianYue-compatible sections: customer info, order info, schedule controls, notification toggle, remark, and footer actions `返回`, `保存`, `保存并接待`.

- [ ] **Step 5: Re-run focused tests**

Run: `npm --prefix studio-workbench run test -- StaffBookingModal.contract.test.ts appStore.contract.test.ts backend.contract.test.ts`

Expected: PASS.

## Task 3: Extend Backend Staff Booking Create

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java`

- [ ] **Step 1: Add backend tests**

Add tests for three cases: scheduled save reserves inventory, undecided schedule creates an order without inventory reservation, and save-and-receive creates or transitions to service status through the existing status semantics.

- [ ] **Step 2: Run backend focused tests and verify failure**

Run: `mvn -pl backend/ruoyi-modules/ruoyi-yy -Dtest=YyOrderServiceImplTest test`

Expected before implementation: new field/status assertions fail.

- [ ] **Step 3: Extend BO and service logic**

Add optional BO fields compatible with frontend payload. Keep existing required scheduled fields unless `scheduleMode=UNDECIDED`; then skip slot validation and inventory reservation.

- [ ] **Step 4: Re-run backend focused tests**

Run: `mvn -pl backend/ruoyi-modules/ruoyi-yy -Dtest=YyOrderServiceImplTest test`

Expected: PASS.

## Task 4: Align Order List With JianYue

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Modify: `studio-workbench/src/features/orders/orderOperations.test.ts`

- [ ] **Step 1: Add list/filter contract tests**

Assert visible labels include `选择门店`, `关键字`, `下单来源`, `下单方式`, `下单时间`, `到店时间`, `高级查询`, `全部有效订单`, `待服务`, `服务中`, `已完成`, `待支付`, `已取消`, `已退单`, `导出`, `预约看板`, `新增订单`.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm --prefix studio-workbench run test -- OrdersView.contract.test.ts orderOperations.test.ts`

Expected before implementation: missing label/layout assertions fail.

- [ ] **Step 3: Rework order page density and action labels**

Keep existing data helpers and status rules. Change UI labels and grouping to the JianYue order-list contract without replacing backend APIs.

- [ ] **Step 4: Re-run focused tests**

Run: `npm --prefix studio-workbench run test -- OrdersView.contract.test.ts orderOperations.test.ts`

Expected: PASS.

## Task 5: End-to-End Verification And Evidence

**Files:**
- Create: `docs/evidence/jianyue-booking-workbench-acceptance-20260617.md`
- Update: `docs/yiyue/jianyue-booking-code-map-20260617.md`
- Update: `docs/yiyue/jianyue-booking-feature-map-20260617.md`
- Update: `docs/yiyue/jianyue-booking-product-map-20260617.md`
- Update: `docs/yiyue/jianyue-booking-optimization-map-20260617.md`

- [ ] **Step 1: Run full frontend checks**

Run: `npm --prefix studio-workbench run test`

Expected: PASS.

Run: `npm --prefix studio-workbench run build`

Expected: build succeeds. Existing chunk-size warnings are acceptable if unchanged.

- [ ] **Step 2: Run backend compile or focused Maven test**

Run: `mvn -pl backend/ruoyi-modules/ruoyi-yy -DskipTests compile`

Expected: BUILD SUCCESS.

- [ ] **Step 3: Browser smoke**

Open `/dashboard/today` and `/order/appointment`. Verify schedule groups, full badges, new-order entry, order tabs, and staff order form fields.

- [ ] **Step 4: Record evidence**

Write acceptance evidence with command outputs, browser smoke results, and known limitations.

## Self-Review

- Spec coverage: P0 schedule, P1 staff service order, P2 order list, and verification are covered.
- Marker scan: no unresolved implementation markers remain.
- Type consistency: frontend payload fields match the backend BO extension names proposed in this plan.
