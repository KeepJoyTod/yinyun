# YingYue Complete Closed Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish 影约云 into a backend-backed staff/customer/merchant/Douyin closed loop while keeping client-side online payment as an explicit placeholder.

**Architecture:** Keep RuoYi-Vue-Plus backend, `studio-workbench`, and `mobile-uniapp`. Use `yy_order` as the only order ledger, `yy_booking_slot_inventory` as the only schedule/capacity ledger, and keep `DOUYIN_LIFE` separate from miniapp/local customer orders. Payment stays reserved through `paymentReady=false` and future `yy_payment_record` hooks.

**Tech Stack:** Spring Boot/RuoYi-Vue-Plus, MyBatis Plus, PostgreSQL, Redis, Vue 3, TypeScript, Pinia, Vite, Vitest, uni-app, HK2 deployment.

---

## Current Baseline

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Branch: `yingyue-closed-loop-optimization-20260603`
- Staff domain: `https://studio.evanshine.me`
- API domain: `https://api.evanshine.me`
- Customer source: `mobile-uniapp`
- Staff source: `studio-workbench`
- Backend module: `backend/ruoyi-modules/ruoyi-yy`

The worktree contains many unrelated and untracked changes. Do not revert. Do not use `git add .`.

## Non-Negotiable Boundaries

- Do not implement real client online payment in this plan.
- Do not mark customer-created orders as `PAID` from `/api/customer/orders/{id}/pay`.
- Do not fabricate schedule slots for historical DOUYIN_LIFE orders.
- Do not expose secrets, tokens, raw private payloads, or full phones in docs/logs.
- Do not mix `DOUYIN_LIFE` with `DOUYIN_MINI_APP`.
- Every visible button must be connected to a real API/action, disabled with reason, or shown as an explicit placeholder.

## Multi-Agent Split

| Agent | Scope | Primary files |
| --- | --- | --- |
| A Backend Customer API | Public/customer APIs, inventory reservation, payment placeholder | `YyClientPublicApiController.java`, `YyClientPublicApiServiceImpl.java`, `YyOrderServiceImpl.java`, `YyBookingSlotInventoryServiceImpl.java` |
| B Mobile Customer | uni-app real API flow and no-payment UX | `mobile-uniapp/src/api/customer.ts`, `mobile-uniapp/src/api/home.ts`, `mobile-uniapp/src/pages/product/detail/index.vue`, `mobile-uniapp/src/pages/customer/orders/index.vue` |
| C Staff Workbench | Dashboard, schedule, appointment order actions, inventory return | `studio-workbench/src/features/dashboard/DashboardView.vue`, `studio-workbench/src/features/orders/OrdersView.vue`, `studio-workbench/src/features/orders/StaffBookingModal.vue`, `studio-workbench/src/shared/api/backend.ts`, `studio-workbench/src/shared/stores/appStore.ts` |
| D Merchant/Photo | Photo delivery, decoration, micro pages/forms, card products | `PhotoMgmtView.vue`, `MerchantDecorationView.vue`, `MerchantMicroPagesView.vue`, `MerchantMicroFormsView.vue`, `ProductCardManagementView.vue` |
| E HK2/Douyin/Docs | DOUYIN_LIFE truth table, deploy smoke, maps | `tools/*.ps1`, `docs/evidence/*`, `docs\yiyue\*.md` |

Main controller reviews and merges in order: A -> B -> C -> D -> E -> UI finish.

## Task 0: Baseline Lock And Submission Strategy

**Files:**
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Update evidence only after verification: `docs/evidence/*`

- [ ] **Step 1: Record status**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short --branch
git log -1 --oneline
```

Expected:

- Branch is `yingyue-closed-loop-optimization-20260603`.
- Existing modified/untracked files are visible.
- No files are reverted.

- [ ] **Step 2: Decide commit batches**

Use these batches:

```text
batch-1 backend-public-customer-api
batch-2 mobile-customer-flow
batch-3 studio-schedule-orders
batch-4 merchant-photo-card
batch-5 docs-maps-evidence
```

Expected:

- Each batch can be staged by explicit file path.
- Each batch has its own verification command.

## Task 1: Backend Customer API Closed Loop

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientPublicApiController.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyClientPublicApiService.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPublicApiServiceImpl.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Test: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyClientPublicApiServiceImplTest.java`
- Test: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java`

- [ ] **Step 1: Add tests for payment placeholder**

Create or update `YyClientPublicApiServiceImplTest` with assertions:

```java
@Test
void payCustomerOrderShouldReturnPlaceholderWithoutMarkingPaid() {
    Map<String, Object> result = service.payCustomerOrder("Bearer valid-customer-token", 9001L);

    assertThat(result.get("paymentReady")).isEqualTo(false);
    assertThat(result.get("message")).asString().contains("在线支付暂未接入");
    assertThat(result.get("timeStamp")).isEqualTo("");
    assertThat(orderMapper.selectById(9001L).getPayStatus()).isEqualTo("UNPAID");
}
```

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyClientPublicApiServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

Expected: test fails only if the placeholder contract is not preserved.

- [ ] **Step 2: Add customer booking inventory rule test**

Add a test proving customer-created unpaid bookings reserve or explicitly do not reserve capacity. Current recommended behavior is reserve immediately:

```java
@Test
void createCustomerOrderShouldReserveSlotEvenWhenPaymentIsReserved() {
    Map<String, Object> result = service.createCustomerOrder("Bearer valid-customer-token", requestForSlot("2026-06-20", "10:00-10:30"));

    Long orderId = Long.valueOf(String.valueOf(result.get("orderId")));
    YyOrder order = orderMapper.selectById(orderId);
    assertThat(order.getPayStatus()).isEqualTo("UNPAID");
    assertThat(order.getInventoryStatus()).isEqualTo("CONFIRMED");
    assertThat(order.getInventorySlotId()).isNotNull();
}
```

Expected:

- If the team chooses manual reserve, this test passes after implementation.
- If the team chooses staff-confirm reserve, replace the inventory assertions with `inventoryStatus` empty and add a staff-confirm test that reserves capacity.

- [ ] **Step 3: Implement selected inventory rule**

Recommended implementation in `YyClientPublicApiServiceImpl#doCreateCustomerOrder` after `orderMapper.insert(order)`:

```java
bookingSlotInventoryService.confirmPaidOrderSlot(order);
YyOrder refreshed = orderMapper.selectById(order.getId());
customerService.upsertByMobile(customerName, phone, "CLIENT_PUBLIC", BigDecimal.ZERO, now, "客户公开端预约");
return toCustomerOrderMap(refreshed);
```

Keep:

```java
order.setPayStatus("UNPAID");
```

Do not insert `yy_payment_record`.

- [ ] **Step 4: Verify backend compile and focused tests**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyClientPublicApiServiceImplTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile
```

Expected:

- Focused tests pass.
- Compile returns `BUILD SUCCESS`.

## Task 2: Mobile Customer Booking Flow

**Files:**
- Modify: `mobile-uniapp/src/api/customer.ts`
- Modify: `mobile-uniapp/src/api/home.ts`
- Modify: `mobile-uniapp/src/pages/product/detail/index.vue`
- Modify: `mobile-uniapp/src/pages/customer/orders/index.vue`
- Modify: `mobile-uniapp/src/types/clientPhoto.ts`
- Test: `mobile-uniapp/tests/customer-api-contract.test.cjs`

- [ ] **Step 1: Add contract tests for payment placeholder response**

Create or update `mobile-uniapp/tests/customer-api-contract.test.cjs`:

```js
const assert = require('node:assert/strict');

test('customer pay placeholder is treated as no online payment', () => {
  const response = {
    orderId: '9001',
    paymentReady: false,
    message: '在线支付暂未接入，订单已创建，请到店或联系门店确认。',
    timeStamp: '',
  };
  assert.equal(response.paymentReady, false);
  assert.equal(Boolean(response.timeStamp), false);
  assert.match(response.message, /暂未接入/);
});
```

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run test
```

Expected: node tests pass.

- [ ] **Step 2: Update product detail payment UX**

In `mobile-uniapp/src/pages/product/detail/index.vue`, after calling `payCustomerOrder(order.orderId)`:

```ts
if (payParams.paymentReady === false || !payParams.timeStamp) {
  uni.showToast({ title: payParams.message || '订单已创建，请到店确认', icon: 'none' });
  uni.switchTab({ url: '/pages/customer/orders/index' });
  return;
}
```

Do not show success text when no payment started.

- [ ] **Step 3: Update order list pay action**

In `mobile-uniapp/src/pages/customer/orders/index.vue`, keep the button but treat placeholder as reserved payment:

```ts
if (params.paymentReady === false || !params?.timeStamp) {
  uni.showToast({ title: params.message || '在线支付暂未接入', icon: 'none' });
  await loadOrders();
  return;
}
```

- [ ] **Step 4: Disable production fallback for customer order creation**

Keep local preview fallback only in development:

```ts
const customerApiFallbackEnabled = String(import.meta.env.PROD) !== 'true'
  || String(import.meta.env.VITE_CUSTOMER_API_FALLBACK || '').toLowerCase() === 'true';
```

Verify no production build uses fallback unless `VITE_CUSTOMER_API_FALLBACK=true`.

- [ ] **Step 5: Verify mobile**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:h5
```

Expected:

- Typecheck passes.
- H5 build succeeds.

## Task 3: Staff Schedule And Appointment Orders

**Files:**
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/orderOperations.ts`
- Modify: `studio-workbench/src/features/orders/StaffBookingModal.vue`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Test: `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/orderOperations.test.ts`

- [ ] **Step 1: Assert single-store daily view**

Tests must assert:

```ts
expect(source).toContain('selectedStoreId')
expect(source).not.toContain('全部门店')
expect(source).toContain('storeBackendId')
```

Expected:

- Dashboard requires a concrete `yy_store.id`.
- Global admin may switch stores, but daily schedule renders one store at a time.

- [ ] **Step 2: Assert JianYue slot grouping**

Tests must assert:

```ts
expect(source).toContain('上午')
expect(source).toContain('下午')
expect(source).toContain('晚上')
expect(source).toContain('30')
expect(source).not.toContain('overflow-x-auto')
```

Expected:

- Half-hour slots remain.
- Morning/afternoon/evening grouping is visible.
- Wheel-to-horizontal slot dragging is not required.

- [ ] **Step 3: Close action refresh chain**

After cancel, reschedule, confirm, arrive, serving, complete:

```ts
await Promise.all([
  appStore.loadOrders(currentQuery),
  appStore.loadBookingInventory({ date, storeBackendId }),
  appStore.loadTodayOrders(),
  appStore.loadAllOrders(),
  appStore.loadOperationLogs(),
]);
```

Expected:

- Order list, slot detail, inventory, dashboard stats and operation log refresh together.

- [ ] **Step 4: Verify staff workbench**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
npm run build
```

Expected:

- Focused tests pass.
- Build passes.

## Task 4: Photo Delivery Closure

**Files:**
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/shared/stores/albumsStore.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Backend existing APIs: `/yy/photoAlbum/{id}/notify`, `/yy/photoAlbum/{id}/selection/confirm`, `/yy/photoAlbum/{id}/deliver`
- Test: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`

- [ ] **Step 1: Assert three real buttons**

Tests must assert visible controls for:

```text
通知客户
确认选片
发送资料
```

Each action must call `backendApi.notifyAlbum`, `backendApi.confirmAlbumSelection`, or `backendApi.deliverAlbum`.

- [ ] **Step 2: Implement fallback wording**

If backend returns `fallback=true`, show:

```text
已记录，需要人工跟进
```

Do not show:

```text
发送成功
```

unless backend send status says success.

- [ ] **Step 3: Verify photo flow**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- src/features/albums/PhotoMgmtView.contract.test.ts
npm run build
```

Expected: tests and build pass.

## Task 5: Merchant Decoration, Micro Pages, Forms, Card Products

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMerchantDecorationController.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantDecorationServiceImpl.java`
- Modify: `backend/script/sql/postgres/postgres_yy_merchant_decoration_migration_20260619.sql`
- Modify: `studio-workbench/src/features/merchant/MerchantDecorationView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormsView.vue`
- Modify: `studio-workbench/src/features/products/ProductCardManagementView.vue`
- Test: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyMerchantDecorationServiceImplTest.java`
- Test: `studio-workbench/src/features/merchant/MerchantDecorationView.contract.test.ts`
- Test: `studio-workbench/src/features/products/ProductCardManagementView.contract.test.ts`

- [ ] **Step 1: Verify backend decoration API**

Expected endpoints:

```text
GET /yy/merchantDecoration?storeId=&channelType=
POST /yy/merchantDecoration
POST /yy/merchantDecoration/publish
```

Test:

```java
@Test
void publishShouldReturnPublishedDecorationForStoreAndChannel() {
    YyMerchantDecorationBo bo = new YyMerchantDecorationBo();
    bo.setStoreId(900000000000000100L);
    bo.setChannelType("STUDIO");
    bo.setConfigJson("{\"theme\":\"light\"}");

    YyMerchantDecorationVo result = service.publish(bo);

    assertThat(result.getPublishStatus()).isEqualTo("PUBLISHED");
    assertThat(result.getStoreId()).isEqualTo(900000000000000100L);
}
```

- [ ] **Step 2: Verify public micro-page render path**

Expected routes:

```text
/merchant/micro-pages
/public/micro-page/:id
/merchant/micro-forms
/public/micro-form/:id
```

Contract tests must prove public routes have `meta.public = true`.

- [ ] **Step 3: Verify card product actions**

Card product page must support:

```text
create
edit
publish/offline
copy public/customer link
map to DOUYIN_LIFE product if applicable
```

If a button is not backed by API, it must be disabled with a reason.

- [ ] **Step 4: Verify merchant/photo/card batch**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyMerchantDecorationServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- src/features/merchant/MerchantDecorationView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts
npm run build
```

Expected: backend and frontend pass.

## Task 6: DOUYIN_LIFE HK2 Truth Table

**Files:**
- Read/modify if required: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java`
- Read/modify if required: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinOpenApiClient.java`
- Read/modify if required: `tools/run-douyin-life-current-order.ps1`
- Update: `docs/evidence/douyin-life-hk2-truth-table-20260619.md`
- Update: `docs\yiyue\api_map.md`
- Update: `docs\yiyue\callback_map.md`

- [ ] **Step 1: Run HK2 current-order smoke**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

Expected:

- `client_token` success.
- For each OpenAPI, record success or platform error with logid.
- Do not paste token or secret.

- [ ] **Step 2: Verify no-slot order rule**

Check order sync/backfill:

```text
If DOUYIN_LIFE payload lacks slot_date, slot_start_time, slot_end_time:
  write/update yy_order
  do not write yy_booking_slot_inventory
  show in order ledger/anomaly list
  do not show in daily schedule grid
```

- [ ] **Step 3: Verify new slot order rule**

If a new DOUYIN_LIFE order carries real slot:

```text
external_poi_id -> yy_store.id by ACTIVE yy_channel_product_mapping
external_sku_id -> yy_product.id by ACTIVE yy_channel_product_mapping
slot_date/start/end -> yy_order slot fields
confirm inventory -> yy_booking_slot_inventory
write logid -> yy_channel_sync_log
```

- [ ] **Step 4: Save truth table**

Write `docs/evidence/douyin-life-hk2-truth-table-20260619.md` with columns:

```text
能力 | 接口/SPI | HK2结果 | logid | 本地落库 | 当前结论
```

## Task 7: UI/JianYue Parity Finish

**Files:**
- Modify after contracts pass: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify after contracts pass: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify after contracts pass: `studio-workbench/src/features/merchant/*.vue`
- Read reference assets: `docs\yiyue\jianyue-assets\20260617-dashboard`

- [ ] **Step 1: Lock benchmark**

Use the existing local JianYue evidence:

```text
docs\yiyue\jianyue-assets\20260617-dashboard\jianyue-dashboard-viewport.png
docs\yiyue\jianyue-assets\20260617-dashboard\dom-style-evidence.json
```

Expected:

- Schedule layout follows simple morning/afternoon/evening grouped blocks.
- No oversized decorative cards in operational pages.
- Store switch is clear and single-store schedule is the default.

- [ ] **Step 2: Apply UI only after data contracts pass**

Allowed changes:

```text
spacing
typography
table density
button order
empty/loading/error states
JianYue-like grouped slot readability
```

Disallowed changes:

```text
new fake data
new local-only action
route rewrites that bypass existing featureRegistry
all-store daily schedule default
```

- [ ] **Step 3: Verify UI build**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

Expected: build passes. Capture screenshots only after production deploy or local preview is stable.

## Task 8: Commit, Push, Deploy HK2

**Files:**
- Explicitly stage only files from the completed batch.
- Update: `docs/evidence/*`
- Update: `docs\yiyue\*.md`

- [ ] **Step 1: Stage explicitly**

Example:

```powershell
git add backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientPublicApiController.java
git add backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPublicApiServiceImpl.java
git add docs/superpowers/specs/2026-06-19-yingyue-complete-closed-loop-design.md
git add docs/superpowers/plans/2026-06-19-yingyue-complete-closed-loop-plan.md
```

Do not run:

```powershell
git add .
```

- [ ] **Step 2: Commit by batch**

Commit messages:

```powershell
git commit -m "feat(client): add backend-backed customer booking placeholder payment"
git commit -m "feat(studio): close schedule order action loop"
git commit -m "feat(merchant): close decoration photo card workflows"
git commit -m "docs: add complete closed-loop implementation plan"
```

- [ ] **Step 3: Push**

Run:

```powershell
git push origin yingyue-closed-loop-optimization-20260603
```

Expected: push succeeds without history rewrite.

- [ ] **Step 4: Deploy HK2**

Use existing project deploy scripts/runbook. Minimum checks:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\invoke-hk2.ps1 -Command "systemctl is-active yingyue-admin.service; nginx -t"
```

Expected:

- backend service is `active`.
- nginx config is valid.
- `https://studio.evanshine.me` loads.

## Final Acceptance Checklist

- [ ] Customer mobile home loads real `/api/public/pages/home`.
- [ ] Customer can pick real store, product, date and half-hour slot.
- [ ] Customer create order writes `yy_order` with `CLIENT_WEB`, `UNPAID`, slot fields.
- [ ] Payment endpoint returns `paymentReady=false` and does not mark order paid.
- [ ] Customer order list/detail shows real order.
- [ ] Customer cancel/reschedule updates `yy_order` and inventory according to chosen rule.
- [ ] Staff dashboard shows single-store morning/afternoon/evening half-hour schedule.
- [ ] Slot click opens scoped orders or prefilled staff booking.
- [ ] Order detail supports confirm, arrived, serving, completed, cancel, reschedule.
- [ ] All order actions refresh schedule, inventory, stats, logs.
- [ ] Photo delivery buttons have real backend actions or explicit fallback result.
- [ ] Merchant decoration saves and publishes through backend.
- [ ] Micro pages and forms public routes render without staff auth.
- [ ] Card product page supports real create/edit/status actions.
- [ ] DOUYIN_LIFE sync writes only real slot orders into daily schedule.
- [ ] HK2 smoke evidence is saved.
- [ ] Local maps under `docs\yiyue` are updated.
