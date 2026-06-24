# Studio Workbench Complete Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the 影约云 `studio-workbench` into a JianYue-like daily staff workbench with real appointment, order, photo-delivery, merchant-page, and Douyin Life data flows.

**Architecture:** Keep the current RuoYi-Vue-Plus backend and Vue 3 workbench. Use `yy_order` as the single order ledger and `yy_booking_slot_inventory` as the single schedule/capacity ledger. UI parity work must follow real data/API contracts and must not fabricate Douyin historical appointment slots.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vite, Vitest, Spring Boot/RuoYi-Vue-Plus, MyBatis Plus, PostgreSQL, Redis/Redisson, HK2 deployment.

---

## Current State

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Branch: `yingyue-closed-loop-optimization-20260603`
- Current local HEAD: `aad6f52 fix(studio): localize merchant store polish`
- Git state: branch is ahead of origin by 1 commit; push needs retry.
- Production marker: `prod-aad6f52-merchant-store-polish-20260619`
- Main local plan: `C:\Users\Administrator\Desktop\yiyue\studio-workbench-complete-optimization-plan-20260619.md`
- Handoff prompt: `C:\Users\Administrator\Desktop\yiyue\studio-workbench-ai-handoff-prompt-20260619.md`
- Acceptance checklist: `C:\Users\Administrator\Desktop\yiyue\studio-workbench-acceptance-checklist-20260619.md`

## Non-Negotiable Rules

- Do not use `git add .`.
- Do not print or commit secrets, tokens, raw private payloads, or full phone numbers.
- Do not infer schedule slots from historical `DOUYIN_LIFE` order create/pay times.
- `yy_order` remains the only order/appointment ledger.
- `yy_booking_slot_inventory` remains the real capacity ledger.
- `DOUYIN_LIFE` and `DOUYIN_MINI_APP` must stay separate.
- Every visible action must have a real API/action, disabled state, or explicit fallback state.

## Files By Workstream

### Dashboard / Schedule

- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- Modify: `studio-workbench/src/features/dashboard/dashboardOperations.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Test: `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`
- Test: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts`
- Test: `studio-workbench/src/features/dashboard/dashboardOperations.test.ts`

### Appointment Orders

- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/orderOperations.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/orderOperations.test.ts`

### Staff Booking / Inventory

- Modify: `studio-workbench/src/features/orders/StaffBookingEntryView.vue`
- Modify: `studio-workbench/src/features/orders/StaffBookingModal.vue`
- Modify: `studio-workbench/src/features/merchant/InventoryView.vue`
- Test: `studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/StaffBookingModal.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/InventoryView.contract.test.ts`

### Photo Delivery

- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Test: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`

### Merchant Micro Pages / Forms

- Modify: `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormsView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormEditorView.vue`
- Modify: `studio-workbench/src/features/public/components/MicroPageRenderer.vue`
- Test: `studio-workbench/src/features/merchant/MerchantMicroPagesView.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/MerchantMicroFormsView.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/MerchantMicroFormEditorView.contract.test.ts`
- Test: `studio-workbench/src/features/public/PublicMicroPageView.contract.test.ts`
- Test: `studio-workbench/src/features/public/PublicMicroFormView.contract.test.ts`

### Douyin Life

- Modify only when needed: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java`
- Modify only when needed: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinOpenApiClient.java`
- Modify only when needed: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyDouyinLifeAutoSyncService.java`
- Modify only when needed: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`

## Task 0: Baseline Sync

- [ ] **Step 1: Check repo state**

Run:

```powershell
git status --short --branch
git log -1 --oneline
```

Expected:

- Branch is `yingyue-closed-loop-optimization-20260603`.
- HEAD is `aad6f52` or newer.
- Untracked files are reviewed and not staged blindly.

- [ ] **Step 2: Retry GitHub push**

Run:

```powershell
git push origin yingyue-closed-loop-optimization-20260603
```

Expected:

- Push succeeds, or failure is reported without changing history.

- [ ] **Step 3: Check HK2 production marker**

Run:

```powershell
.\tools\invoke-hk2.ps1 -Command "cat /var/www/studio.evanshine.me/release.txt; systemctl is-active yingyue-admin.service; nginx -t"
```

Expected:

- Marker includes current release.
- Backend service is `active`.
- `nginx -t` succeeds.

## Task 1: Dashboard Schedule Parity

- [ ] **Step 1: Write/update contract tests**

Ensure tests assert:

- `JianyueSlotGrid` has morning/afternoon/evening groups.
- Main schedule grid does not use `overflow-x-auto`, wheel-to-horizontal scrolling, or full-store mixing.
- Dashboard requires concrete `storeId`.
- Slot detail displays capacity, booked, remaining, conflicts, and orders.

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/dashboard/dashboardOperations.test.ts
```

Expected: failing tests only for missing requested behavior.

- [ ] **Step 2: Implement minimal dashboard/schedule changes**

Preserve:

- Half-hour buckets.
- `yy_store.id` route/query semantics.
- Existing order/inventory merge rules.

Do not:

- Reintroduce all-store default.
- Infer slots from no-slot Douyin history.

- [ ] **Step 3: Verify**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/dashboard/dashboardOperations.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

## Task 2: Appointment Order Detail and Actions

- [ ] **Step 1: Update contract tests**

Tests must cover:

- Slot-scoped order deep link.
- Detail drawer sections: customer, product, store, slot, source, pay status, photo stage.
- Cancel reason requirement.
- Local cancellation text does not claim Douyin refund.
- Action refresh calls for orders/schedule/inventory/dashboard.

- [ ] **Step 2: Implement order detail UI and action cleanup**

Modify:

- `OrdersView.vue`
- `orderOperations.ts`
- `appStore.ts`

Keep API calls through existing backend API helpers.

- [ ] **Step 3: Verify**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

## Task 3: Staff Booking and Inventory Return Flow

- [ ] **Step 1: Update contract tests**

Tests must cover:

- `/order/staff-booking` route remains present.
- Empty slot opens prefilled booking modal.
- Full/conflict slot goes to inventory instead of saving.
- Inventory return keeps date/store/service group/slot context.

- [ ] **Step 2: Implement or refine missing interactions**

Modify:

- `StaffBookingEntryView.vue`
- `StaffBookingModal.vue`
- `InventoryView.vue`

Do not change backend write semantics unless tests prove a backend contract gap.

- [ ] **Step 3: Verify**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/merchant/InventoryView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

## Task 4: Photo Delivery Workflow

- [ ] **Step 1: Update contract tests**

Tests must cover:

- Photo stage is visible in order detail.
- Notify/confirm/deliver buttons use real appStore/backend actions.
- Fallback notification is labelled as fallback/manual follow-up.
- Recent access logs are loaded or have a real empty state.

- [ ] **Step 2: Implement UI refinements**

Modify:

- `PhotoMgmtView.vue`
- `OrdersView.vue`
- `appStore.ts`

Do not claim SMS/subscription notification success unless a real channel exists.

- [ ] **Step 3: Verify**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/albums/PhotoMgmtView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

## Task 5: Merchant Micro Page/Form Operational Flow

- [ ] **Step 1: Update contract tests**

Tests must cover:

- Public micro page does not leak debug/schema/component names.
- CTA can bind published micro forms.
- Micro form submission follow-up uses real API types.
- No micro page editor code directly creates orders.

- [ ] **Step 2: Implement missing UI wiring**

Modify:

- `MerchantMicroPagesView.vue`
- `MerchantMicroFormsView.vue`
- `MerchantMicroFormEditorView.vue`
- `MicroPageRenderer.vue`

Keep supported component types aligned with backend whitelist:

```text
image, masonry, title, textnav, store, spacer, divider
```

- [ ] **Step 3: Verify**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/public/PublicMicroPageView.contract.test.ts src/features/public/PublicMicroFormView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

## Task 6: Douyin Life New Slot Payload Gate

- [ ] **Step 1: Run read-only discovery first**

Run only if Douyin work is in scope:

```powershell
.\tools\yingyue-douyin-real-account-discovery.ps1
```

Expected:

- Produces redacted evidence.
- Does not write DB, change stock, or create orders.

- [ ] **Step 2: Review payload fields**

If payload contains real appointment fields:

- Map to `yy_order.slot_date`.
- Map to `yy_order.slot_start_time`.
- Map to `yy_order.slot_end_time`.
- Occupy `yy_booking_slot_inventory`.

If payload has no real appointment fields:

- Keep order in `yy_order`.
- Do not enter schedule grid.
- Record `NO_SLOT` or equivalent diagnostic.

- [ ] **Step 3: Verify backend**

Run targeted backend tests for touched classes. Minimum compile:

```powershell
mvn -pl backend/ruoyi-modules/ruoyi-yy -am -DskipTests compile
```

Expected: build success.

## Task 7: Deploy and Evidence

- [ ] **Step 1: Full target frontend verification**

Run:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected: tests and build pass.

- [ ] **Step 2: Commit**

Run:

```powershell
git status --short
git add <exact files changed in this batch>
git commit -m "feat(studio): complete workbench parity batch"
```

Expected: one focused commit.

- [ ] **Step 3: Push**

Run:

```powershell
git push origin yingyue-closed-loop-optimization-20260603
```

Expected: push succeeds.

- [ ] **Step 4: Production build**

Run:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='<release>'
npm --prefix studio-workbench run build
```

Expected: build passes.

- [ ] **Step 5: HK2 deploy**

Use existing project deployment pattern and `tools/invoke-hk2.ps1`. Keep backup and marker.

- [ ] **Step 6: Smoke**

Verify:

```text
https://studio.evanshine.me/
https://studio.evanshine.me/login
https://studio.evanshine.me/dashboard/today
https://studio.evanshine.me/order/appointment
https://studio.evanshine.me/service/photos
https://studio.evanshine.me/merchant/micro-pages
```

Expected:

- All return 200.
- Release marker matches.
- Real login flow works.

## Final Evidence

After deployment, write an evidence doc under:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\
```

Include:

- Commit SHA.
- Release marker.
- Tests run and pass counts.
- Smoke URLs.
- Known residual risks.
