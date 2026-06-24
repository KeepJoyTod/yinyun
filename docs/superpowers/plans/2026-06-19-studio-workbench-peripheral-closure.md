# Studio Workbench Peripheral Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the non-core but still production-visible workbench modules: photo delivery, merchant micro pages/forms, and merchant/product operations. Each visible action must have a real API, real permission boundary, or an explicit fallback state.

**Architecture:** Keep feature boundaries intact. Photo delivery stays on photo album APIs and workbench stores. Micro page/form work stays on existing merchant and public endpoints. Merchant/product surfaces continue to use the real `yy_store.id` scope already introduced elsewhere.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vitest, Spring Boot/RuoYi-Vue-Plus, PostgreSQL.

---

### Task 1: Close the Photo Delivery Action Loop

**Files:**
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Test: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`

- [ ] **Step 1: Write failing tests for notify/confirm/deliver action gates**

Use tests shaped like:

```ts
it('disables notify when there is no album or no deliverable state', async () => {
  renderPhotoMgmt({ album: null })
  expect(screen.getByRole('button', { name: /通知客户/i })).toBeDisabled()
})

it('routes from order detail to photo management with the correct album context', async () => {
  renderOrdersWithAlbum()
  await user.click(screen.getByRole('button', { name: /去客片管理/i }))
  expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
    path: '/service/photos',
    query: expect.objectContaining({ album: 'album-1' })
  }))
})
```

- [ ] **Step 2: Run the photo-related tests**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/albums/PhotoMgmtView.contract.test.ts `
  src/features/orders/OrdersView.contract.test.ts
```

Expected:
- At least one failure confirms the action gate or route behavior still needs work.

- [ ] **Step 3: Implement the minimum action gate behavior**

Keep the implementation aligned to:

```ts
const canNotify = computed(() => !!selectedAlbum.value && selectedAlbum.value.status !== 'DRAFT')
const canConfirmSelection = computed(() => selectedAlbum.value?.selectionStatus === 'WAITING')
const canDeliver = computed(() => selectedAlbum.value?.deliveryStatus !== 'DELIVERED')
```

- [ ] **Step 4: Re-run the tests**

Run the same command as step 2.

Expected:
- Both test files pass.

- [ ] **Step 5: Commit the photo-delivery closure**

```bash
git add studio-workbench/src/features/albums/PhotoMgmtView.vue studio-workbench/src/features/orders/OrdersView.vue
git commit -m "feat(workbench): close photo delivery action loop"
```

### Task 2: Close Micro Page and Micro Form Publishing Paths

**Files:**
- Modify: `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormsView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormEditorView.vue`
- Modify: `studio-workbench/src/features/public/components/MicroPageRenderer.vue`
- Test: `studio-workbench/src/features/merchant/MerchantMicroPagesView.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/MerchantMicroFormsView.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/MerchantMicroFormEditorView.contract.test.ts`
- Test: `studio-workbench/src/features/public/PublicMicroPageView.contract.test.ts`
- Test: `studio-workbench/src/features/public/PublicMicroFormView.contract.test.ts`

- [ ] **Step 1: Write failing tests for publish, preview, CTA, and store-bound form flow**

Use cases shaped like:

```ts
it('publishes a store-bound micro page and exposes a public URL', async () => {
  renderMerchantMicroPages()
  await user.click(screen.getByRole('button', { name: /发布/i }))
  expect(mockPublish).toHaveBeenCalled()
})

it('binds CTA to a published micro form without creating an order directly', async () => {
  const schema = buildMicroPageSchemaWithFormCta()
  expect(schema.actions[0]).toEqual(expect.objectContaining({ type: 'OPEN_FORM' }))
})
```

- [ ] **Step 2: Run the micro page/form tests**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/merchant/MerchantMicroPagesView.contract.test.ts `
  src/features/merchant/MerchantMicroFormsView.contract.test.ts `
  src/features/merchant/MerchantMicroFormEditorView.contract.test.ts `
  src/features/public/PublicMicroPageView.contract.test.ts `
  src/features/public/PublicMicroFormView.contract.test.ts
```

Expected:
- At least one failure confirms a missing publish/CTA/store-bound behavior.

- [ ] **Step 3: Implement the minimum publish and CTA behavior**

Keep implementation aligned to:

```ts
type MicroPageAction =
  | { type: 'OPEN_FORM'; formId: string; storeId?: string }
  | { type: 'OPEN_URL'; url: string }
```

```ts
function buildPublicFormUrl(formId: string, storeId?: string) {
  return storeId ? `/public/micro-form/${formId}?storeId=${storeId}` : `/public/micro-form/${formId}`
}
```

- [ ] **Step 4: Re-run the tests**

Run the same command as step 2.

Expected:
- All 5 test files pass.

- [ ] **Step 5: Commit micro page/form closure**

```bash
git add studio-workbench/src/features/merchant studio-workbench/src/features/public
git commit -m "feat(workbench): close micro page and form publishing flows"
```

### Task 3: Make Merchant and Product Surfaces Explicitly Actionable

**Files:**
- Modify: `studio-workbench/src/features/stores/StoreView.vue`
- Modify: `studio-workbench/src/features/products/ProductCardCatalogView.vue`
- Modify: `studio-workbench/src/features/products/DouyinProductsView.vue`
- Test: `studio-workbench/src/features/stores/StoreView.contract.test.ts`
- Test: `studio-workbench/src/features/products/ProductCardCatalogView.contract.test.ts`
- Test: `studio-workbench/src/features/products/DouyinProductsView.contract.test.ts`

- [ ] **Step 1: Write failing tests for store scope and actionable empty states**

Use cases shaped like:

```ts
it('shows only concrete stores and no all-store option', () => {
  renderStoreView()
  expect(screen.queryByText('全部门店')).not.toBeInTheDocument()
})

it('shows an explicit empty state when no Douyin mappings exist for the visible stores', () => {
  renderDouyinProducts({ mappings: [] })
  expect(screen.getByText(/暂无可见门店映射/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the merchant/product tests**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/stores/StoreView.contract.test.ts `
  src/features/products/ProductCardCatalogView.contract.test.ts `
  src/features/products/DouyinProductsView.contract.test.ts
```

Expected:
- At least one failure confirms a missing scope or empty-state contract.

- [ ] **Step 3: Implement the minimum explicit-state behavior**

Keep the implementation aligned to:

```ts
const concreteStoreOptions = computed(() =>
  appStore.stores.filter((store) => !!store.backendId)
)
```

```vue
<EmptyState
  v-if="!filteredMappings.length"
  title="暂无可见门店映射"
  description="请先选择具体门店或补齐该门店的抖音来客商品映射。"
/>
```

- [ ] **Step 4: Re-run the tests and the build**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/stores/StoreView.contract.test.ts `
  src/features/products/ProductCardCatalogView.contract.test.ts `
  src/features/products/DouyinProductsView.contract.test.ts
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run build
```

Expected:
- All 3 tests pass.
- Build passes.

- [ ] **Step 5: Commit the merchant/product closure**

```bash
git add studio-workbench/src/features/stores/StoreView.vue studio-workbench/src/features/products
git commit -m "feat(workbench): make merchant and product surfaces explicitly actionable"
```
