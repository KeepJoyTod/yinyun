# Studio Workbench JianYue UI Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the final JianYue-style UI and interaction polish only after the real workbench flows are already correct.

**Architecture:** This workstream is deliberately last. It reads the stabilized schedule, order, photo, merchant, and mapping surfaces, then tightens density, wording, and interaction feel without changing the underlying data contracts or inventing fake states.

**Tech Stack:** Vue 3, TypeScript, CSS/Tailwind, Vitest, browser smoke, local benchmark maps.

---

### Task 1: Build the Final Benchmark Checklist

**Files:**
- Modify: `docs\yiyue\jianyue_benchmark_map.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\jianyue-ui-benchmark-20260619.md`

- [ ] **Step 1: Rewrite the benchmark map as a pass/fail checklist**

Use this shape:

```md
| Surface | Contract | Status | Evidence |
| --- | --- | --- | --- |
| dashboard/today | morning-afternoon-evening groups, 30-minute cells, full badge, slot detail | PASS/FAIL | ... |
| order/appointment | scoped filters, detail drawer, transitions, cancel/reschedule | PASS/FAIL | ... |
| service/photos | notify/confirm/deliver gate | PASS/FAIL | ... |
| merchant/micro-pages | publish, preview, CTA | PASS/FAIL | ... |
```

- [ ] **Step 2: Create the UI benchmark evidence stub**

Create:

```md
# JianYue UI Benchmark 2026-06-19

- source benchmark:
- tested routes:
- passed:
- failed:
- screenshots:
```

- [ ] **Step 3: Verify the benchmark map now reads as an acceptance checklist**

Run:

```powershell
Get-Content -First 60 "docs\yiyue\jianyue_benchmark_map.md"
```

Expected:
- The map is now directly usable as a finish checklist.

### Task 2: Tighten Dashboard and Order Visual Density

**Files:**
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Test: `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`
- Test: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`

- [ ] **Step 1: Write failing UI-contract tests for density and visible labels**

Use cases shaped like:

```ts
it('shows compact slot cards with time, order count, and capacity summary', () => {
  renderSlotGrid()
  expect(screen.getByText(/订单：/i)).toBeInTheDocument()
  expect(screen.getByText(/工位：/i)).toBeInTheDocument()
})

it('keeps appointment order filters visible without marketing-style chrome', () => {
  renderOrders()
  expect(screen.queryByText(/演示账号|demo/i)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the UI-contract tests**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/dashboard/DashboardView.contract.test.ts `
  src/shared/components/schedule/JianyueSlotGrid.contract.test.ts `
  src/features/orders/OrdersView.contract.test.ts
```

Expected:
- At least one failure confirms the current density/label contract still needs polish.

- [ ] **Step 3: Implement minimal visual tightening without changing data behavior**

Keep implementation aligned to:

```vue
<div class="text-[12px] font-medium leading-4">{{ slot.timeLabel }}</div>
<div class="text-[11px] text-slate-500">订单：{{ slot.orderCount }}</div>
<div class="text-[11px] text-slate-500">工位：{{ slot.booked }}/{{ slot.capacity }}</div>
```

```vue
<header class="grid gap-2 md:grid-cols-[auto_auto_1fr_auto]">
  <!-- filters stay compact and operational -->
</header>
```

- [ ] **Step 4: Re-run the tests**

Run the same command as step 2.

Expected:
- All 3 test files pass.

- [ ] **Step 5: Commit the dense dashboard/order polish**

```bash
git add studio-workbench/src/features/dashboard/DashboardView.vue studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue studio-workbench/src/features/orders/OrdersView.vue
git commit -m "style(workbench): tighten dashboard and order density"
```

### Task 3: Tighten Secondary Surfaces and Run Final Smoke

**Files:**
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue`
- Modify: `studio-workbench/src/features/merchant/MerchantMicroFormsView.vue`
- Modify: `studio-workbench/src/features/products/ProductCardCatalogView.vue`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-ui-finish-20260619.md`

- [ ] **Step 1: Remove demo/test-facing copy from secondary surfaces**

Search first:

```powershell
rg -n "演示|demo|调试|DEBUG|placeholder" "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src"
```

Expected:
- You identify any lingering copy before editing.

- [ ] **Step 2: Apply the minimal copy and empty-state cleanup**

Use patterns like:

```vue
<EmptyState
  title="暂无可处理内容"
  description="请先选择具体门店或补齐该门店的数据。"
/>
```

- [ ] **Step 3: Run the final build and smoke**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run build
```

Then capture smoke evidence for:

```text
/dashboard/today
/order/appointment
/service/photos
/merchant/micro-pages
/merchant/micro-forms
/product/card-catalog
```

- [ ] **Step 4: Write the final UI finish evidence**

Create:

```md
# Studio Workbench UI Finish 2026-06-19

- routes checked:
- remaining non-goals:
- benchmark pass summary:
- screenshots:
```

- [ ] **Step 5: Commit the finish evidence and polish**

```bash
git add studio-workbench/src/features/albums/PhotoMgmtView.vue studio-workbench/src/features/merchant studio-workbench/src/features/products/ProductCardCatalogView.vue docs/evidence/studio-workbench-ui-finish-20260619.md
git commit -m "style(workbench): finish jianyue-aligned secondary surfaces"
```
