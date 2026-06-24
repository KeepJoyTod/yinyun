# Studio Workbench Schedule and Fulfillment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the daily schedule board and appointment-order fulfillment chain so the workbench behaves like a real single-store operations tool instead of a demo surface.

**Architecture:** Keep `yy_order` as the only order ledger and `yy_booking_slot_inventory` as the only schedule/capacity ledger. Implement and verify one user path end-to-end: dashboard slot -> slot detail -> scoped appointment orders -> order detail -> transition/cancel/reschedule -> refresh back to the same scoped context.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vitest, Vite, Spring Boot/RuoYi-Vue-Plus, PostgreSQL.

---

### Task 1: Lock the Dashboard and Slot Contract

**Files:**
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/features/dashboard/dashboardOperations.ts`
- Modify: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- Test: `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`
- Test: `studio-workbench/src/features/dashboard/dashboardOperations.test.ts`
- Test: `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts`

- [ ] **Step 1: Write the failing dashboard contract tests**

Add or extend tests with cases shaped like:

```ts
it('groups slots into 上午/下午/晚上 with 30-minute buckets', () => {
  const groups = buildJianyueSlotGroups(sampleItems)
  expect(groups.map((group) => group.label)).toEqual(['上午', '下午', '晚上'])
})

it('opens scoped slot detail for one concrete store and day', async () => {
  renderDashboard({ storeId: '900000000000000100', date: '2026-06-19' })
  await user.click(screen.getByRole('button', { name: /18:00/i }))
  expect(screen.getByText('18:00-18:30')).toBeInTheDocument()
  expect(screen.queryByText('全部门店')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the dashboard tests to confirm failure**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/dashboard/DashboardView.contract.test.ts `
  src/features/dashboard/dashboardOperations.test.ts `
  src/shared/components/schedule/JianyueSlotGrid.contract.test.ts
```

Expected:
- At least one failure confirms missing or regressed slot-board behavior.

- [ ] **Step 3: Implement the minimum slot-board behavior**

Keep the implementation aligned to these shapes:

```ts
export function buildJianyueSlotGroups(items: ScheduleItem[]) {
  return [
    { label: '上午', items: items.filter((item) => item.bucket === 'morning') },
    { label: '下午', items: items.filter((item) => item.bucket === 'afternoon') },
    { label: '晚上', items: items.filter((item) => item.bucket === 'evening') }
  ]
}
```

```vue
<JianyueSlotGrid
  :groups="slotGroups"
  :selected-store-id="selectedStoreId"
  @open-slot-detail="openSlotDetail"
  @open-empty-slot-booking="openStaffBookingFromSelectedSlot"
/>
```

- [ ] **Step 4: Re-run the dashboard tests**

Run the same command as step 2.

Expected:
- All 3 dashboard-related test files pass.

- [ ] **Step 5: Commit the dashboard contract**

```bash
git add studio-workbench/src/features/dashboard studio-workbench/src/shared/components/schedule
git commit -m "feat(workbench): stabilize dashboard slot board contract"
```

### Task 2: Finish the Appointment Order Detail Loop

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/orderOperations.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Test: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/orderOperations.test.ts`

- [ ] **Step 1: Write failing tests for transition, cancel, reschedule, and slot-context return**

Add cases shaped like:

```ts
it('keeps slot-scoped context when returning from order detail', async () => {
  const route = createSlotScopedRoute()
  renderOrders({ route })
  await user.click(screen.getByRole('button', { name: /返回时段/i }))
  expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
    path: '/dashboard/today',
    query: expect.objectContaining({ slotStart: '18:00', slotEnd: '18:30' })
  }))
})

it('shows cancel reason and operator summary in the detail timeline', () => {
  const timeline = buildOrderDetailTimeline(order, album, [], operationLogs)
  expect(timeline.some((item) => item.title.includes('取消'))).toBe(true)
})
```

- [ ] **Step 2: Run the order detail tests to confirm failure**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/orders/OrdersView.contract.test.ts `
  src/features/orders/orderOperations.test.ts
```

Expected:
- At least one failure confirms missing or stale order-detail behavior.

- [ ] **Step 3: Implement the minimal action-chain behavior**

Keep the code aligned to these shapes:

```ts
export function buildOrderFlowSteps(order: BookingOrder) {
  return ['待确认', '已确认', '已到店', '服务中', '已完成']
}
```

```ts
async function cancelSelectedOrder(reason: string) {
  await backendApi.transitionOrder(selectedOrderId.value!, {
    targetStatus: 'CANCELLED',
    remark: reason
  })
  await reloadAfterOrderMutation()
}
```

```ts
async function reloadAfterOrderMutation() {
  await Promise.all([
    reloadOrders(),
    reloadScheduleContext(),
    loadOrderOperationLogs()
  ])
}
```

- [ ] **Step 4: Re-run the order detail tests**

Run the same command as step 2.

Expected:
- Both order-related test files pass.

- [ ] **Step 5: Commit the order-detail loop**

```bash
git add studio-workbench/src/features/orders studio-workbench/src/shared/stores/appStore.ts
git commit -m "feat(workbench): complete appointment order fulfillment loop"
```

### Task 3: Stabilize Staff Booking and Inventory Re-entry

**Files:**
- Modify: `studio-workbench/src/features/orders/StaffBookingEntryView.vue`
- Modify: `studio-workbench/src/features/orders/StaffBookingModal.vue`
- Modify: `studio-workbench/src/features/merchant/InventoryView.vue`
- Test: `studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts`
- Test: `studio-workbench/src/features/orders/StaffBookingModal.contract.test.ts`
- Test: `studio-workbench/src/features/merchant/InventoryView.contract.test.ts`

- [ ] **Step 1: Write failing tests for full-slot redirect and inventory return**

Use tests shaped like:

```ts
it('redirects full or conflicting slots to inventory instead of saving', async () => {
  renderStaffBookingEntry(fullSlotContext)
  await user.click(screen.getByRole('button', { name: /按该时段录入/i }))
  expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ path: '/merchant/inventory' }))
})

it('reopens the booking form after returning from inventory', async () => {
  renderStaffBookingEntry(returnedInventoryContext)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the staff-booking and inventory tests**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run test -- `
  src/features/orders/StaffBookingEntryView.contract.test.ts `
  src/features/orders/StaffBookingModal.contract.test.ts `
  src/features/merchant/InventoryView.contract.test.ts
```

Expected:
- At least one failure confirms the entry/inventory contract still needs work.

- [ ] **Step 3: Implement the minimal redirect-and-return behavior**

Keep the implementation aligned to:

```ts
const slotBlocked = computed(() => slotIsFull.value || slotHasConflict.value)

function goSlotInventory() {
  return router.push({
    path: '/merchant/inventory',
    query: {
      storeId: selectedStoreId.value,
      date: selectedDate.value,
      slotStart: selectedSlotStart.value,
      slotEnd: selectedSlotEnd.value,
      returnTo: 'staff-booking'
    }
  })
}
```

- [ ] **Step 4: Re-run the tests**

Run the same command as step 2.

Expected:
- All 3 test files pass.

- [ ] **Step 5: Run the schedule/order build gate**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run build
```

Expected:
- Build passes.

- [ ] **Step 6: Commit the staff-booking contract**

```bash
git add studio-workbench/src/features/orders/StaffBookingEntryView.vue studio-workbench/src/features/orders/StaffBookingModal.vue studio-workbench/src/features/merchant/InventoryView.vue
git commit -m "feat(workbench): stabilize staff booking and inventory re-entry"
```
