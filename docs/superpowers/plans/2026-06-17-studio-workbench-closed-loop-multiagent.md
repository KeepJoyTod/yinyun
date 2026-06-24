# Studio Workbench Closed Loop Multiagent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the studio workbench closer to JianYue-level daily use by fixing real schedule data, appointment order actions, and photo delivery workflows without fabricating historical Douyin appointment times.

**Architecture:** Keep `yy_order` as the only order ledger and `yy_booking_slot_inventory` as the schedule/capacity ledger. Backend APIs provide authoritative filters and workflow actions; frontend pages render scoped slot/order/photo actions from those APIs and keep fallback-only behavior explicit.

**Tech Stack:** RuoYi-Vue-Plus Java backend, PostgreSQL, Vue 3 + TypeScript + Vitest studio-workbench, existing HK2 deployment scripts.

---

## Hard Boundaries

- Do not fabricate `slot_date`, `slot_start_time`, or `slot_end_time` for historical `DOUYIN_LIFE` orders.
- Keep `DOUYIN_LIFE` separate from `DOUYIN_MINI_APP`.
- Do not print or commit secrets, tokens, full phones, raw customer payloads, or private JianYue screenshots.
- Do not touch the existing untracked files:
  - `docs/evidence/studio-workbench-acceptance-20260617-112604.json`
  - `docs/evidence/studio-workbench-acceptance-20260617-112604.md`
- Use focused tests plus `npm --prefix studio-workbench run build` before any completion claim.

## Parallel Work Slices

### Slice A: Backend Schedule And Order Filter Contract

**Owner:** Backend worker.

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyOrderBo.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java`
- Create/modify only if existing pattern requires: schedule-specific VO/controller/service files under `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/`

- [ ] Add or verify API-level filters for `slotDate`, `slotStartTime`, `slotEndTime`, `inventoryStatus`, `syncStatus`, and `photoDeliveryIssueOnly`.
- [ ] Ensure backend can return orders scoped to one real slot without relying on frontend keyword filtering.
- [ ] If adding a schedule API, return real `storeId`, `serviceGroupId` or `externalSkuId`, `slotDate`, `slotStartTime`, `slotEndTime`, capacity, booked count, remaining count, conflict/full status, and scoped order ids.
- [ ] Add focused backend tests for slot filtering and no fabrication of missing slot fields.

**Validation:**

```powershell
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

### Slice B: Frontend Schedule And Dashboard Slot Interaction

**Owner:** Frontend schedule worker.

**Files:**
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/api/yingyueAdapter.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/features/schedule/scheduleOperations.ts`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify/test: `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`
- Modify/test: `studio-workbench/src/features/schedule/ScheduleView.contract.test.ts`
- Modify/test: `studio-workbench/src/features/schedule/scheduleOperations.test.ts`

- [ ] Use real `slotEndTime` when present; only fall back to computed duration when the backend lacks an end time.
- [ ] Change slot identity from start-time-only to `storeId + serviceGroupId/externalSkuId + slotDate + slotStartTime + slotEndTime`.
- [ ] Make homepage occupied-slot clicks open scoped slot detail first, not jump to the first order.
- [ ] Keep empty-slot staff booking prefill, but require a real store/service scope when an aggregate slot is ambiguous.

**Validation:**

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/api/yingyueAdapter.test.ts
```

### Slice C: Appointment Order Actions

**Owner:** Order workflow worker.

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderController.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Modify: `studio-workbench/src/features/orders/orderOperations.ts`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify/test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Modify/test: `studio-workbench/src/features/orders/orderOperations.test.ts`

- [ ] Add explicit cancel action with reason input and success/failure state.
- [ ] Add refund/return state only where backed by backend state or clearly mark as external-platform pending.
- [ ] Make slot deep links parse `slotStart` and `slotEnd` and use API-level filters when available.
- [ ] Refresh orders, schedule, and dashboard after successful cancel/reschedule/status transition.

**Validation:**

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

### Slice D: Photo Delivery Workflow

**Owner:** Photo workflow worker.

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPhotoAlbumController.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPhotoAlbumService.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPhotoAlbumServiceImpl.java`
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify/test: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`

- [ ] Add explicit backend semantics for selection confirmation and final delivery.
- [ ] Replace disabled `通知客户 / 客片确认 / 资料发送` buttons with real API-backed actions or explicit offline fallback states.
- [ ] Record success/failure in existing notification/log structures when possible.
- [ ] Refresh album/order delivery state after action success.

**Validation:**

```powershell
npm --prefix studio-workbench run test -- src/features/albums/PhotoMgmtView.contract.test.ts
npm --prefix client-web run test -- src/api/clientPhotoApi.test.ts src/views/customerAlbumDetailPageContract.test.ts
```

### Slice E: Maps, Docs, And Final Acceptance

**Owner:** Main coordinator after integration.

**Files:**
- Update: `C:\Users\Administrator\Desktop\yiyue\function_map.md`
- Update: `C:\Users\Administrator\Desktop\yiyue\optimization_map.md`
- Update: `C:\Users\Administrator\Desktop\yiyue\api_map.md`
- Add/update evidence under `docs/evidence/`

- [ ] Record implemented user path, API, tables, source files, and verification.
- [ ] Run focused frontend/backend checks.
- [ ] Build production frontend.
- [ ] Commit, push, deploy HK2, and record rollback command if production-facing.

**Final Validation:**

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
npm --prefix studio-workbench run build
```

## External Blockers

- `DOUYIN_LIFE` new order schedule validation requires one real new appointment payload with true time fields.
- Inventory direct-write OpenAPI still needs target POI/SKU business permissions.
- Real store/product/sample images require owned business assets or OSS URLs; current local images remain fallbacks.
