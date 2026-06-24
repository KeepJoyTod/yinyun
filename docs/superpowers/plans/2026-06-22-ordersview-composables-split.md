# OrdersView.vue Composables Split Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split OrdersView.vue (2616 lines) into composables so the Vue file stays under 800 lines, while preserving all UI, business logic, and test coverage.

**Architecture:** Extract 6 composables from the `<script setup>` section (lines 889-2604, ~1716 lines). Each composable receives reactive state and returns computed/method exports. The Vue file keeps template (888 lines), style (11 lines), and a thin orchestration script (~200 lines) that calls the composables.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript composables, date-fns, vitest source-level contract tests.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `OrdersView.vue` | Template + style + composable wiring (~800 lines target) |
| `composables/useOrderRouteScope.ts` | URL query read/write, route watchers, `readQueryString`, `applyFiltersFromQuery`, `syncFiltersToUrl` |
| `composables/useOrderFilters.ts` | Search, date ranges, calendar, dropdowns, advanced filters, `filteredOrders`, filter tags |
| `composables/useOrderSlotScope.ts` | `slotRange`, `slotScopedOrders`, `slotScopedDashboardContext`, `buildSlotScopedOrderQuery`, `loadSlotScopedOrdersFromQuery` |
| `composables/useOrderDetailState.ts` | `selectedOrder`, all `selectedOrder*` computed props, timeline, flow steps, status styles |
| `composables/useOrderMutations.ts` | `advanceOrder`, `cancelSelectedOrder`, `rescheduleSelectedOrder`, reschedule draft |
| `composables/useOrderOperationLogs.ts` | `operationLogsLoading`, `loadOrderOperationLogs`, `operationLogsStateText` |
| `OrdersView.contract.test.ts` | Updated source-level tests checking composables exist |

---

## Task 1: Create composables directory and useOrderRouteScope

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderRouteScope.ts`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue` (lines 991, 1053-1212, 2481-2569)

- [ ] **Step 1: Create composables directory**

```powershell
New-Item -ItemType Directory -Path "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\composables" -Force
```

- [ ] **Step 2: Create useOrderRouteScope.ts**

Extract from OrdersView.vue:
- `readQueryString` (line 1053)
- `isDateKey` (line 1083)
- `applySearchQueryFromRoute` (lines 1055-1059)
- `armSearchQueryInput` (lines 1061-1063)
- `setSearchQuery` (lines 1065-1069)
- `handleSearchInput` (lines 1071-1081)
- `searchQueryState` computed (lines 1095-1100)
- `effectiveSearchQuery` computed (line 1102)
- `syncedSearchQuery` computed (line 1103)
- `slotScopedRouteSearch` computed (lines 1104-1107)
- `applyFiltersFromQuery` (lines 1150-1212)
- `syncFiltersToUrl` (lines 1214-1252)

The composable signature:

```typescript
import type { Ref, ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { QuickOrderFilter } from '../orderOperations'

export type UseOrderRouteScopeParams = {
  route: RouteLocationNormalizedLoaded
  router: Router
  // refs owned by the Vue file that this composable reads/writes
  searchQuery: Ref<string>
  searchQueryArmed: Ref<boolean>
  searchQueryTouched: Ref<boolean>
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  activeStartDate: Ref<string>  // computed get/set, pass through
  activeEndDate: Ref<string>
  slotRange: Ref<{ start: string; end: string }>
  slotScopedDashboardContext: Ref<{ date: string; storeId?: string; slotStart: string; slotEnd?: string } | null>
  statusTab: Ref<string>
  advanced: Ref<{ store: string; source: string; payment: string; service: string; method: string; amountMin: string; amountMax: string; status: string[] }>
  dropdownFilters: Ref<Array<{ label: string; width: number; options: string[]; value: string }>>
  syncingFromQuery: Ref<boolean>
  lastAllOrdersQueryKey: Ref<string>
  storeNameForOrderScope: ComputedRef<string>
  resolveStoreBackendIdFromName: (name: string) => string | undefined
  resolveStoreNameFromBackendId: (id: string) => string
  normalizeOrderStoreName: (name: string) => string
  defaultOrderStoreName: ComputedRef<string>
  // read slot origin helpers
  readSlotOriginDateFromRoute: () => string | undefined
  readSlotOriginStoreIdFromRoute: () => string | undefined
  syncSlotScopedDashboardContextFromRoute: () => void
  ensureConcreteStoreScope: () => void
}

export type UseOrderRouteScopeReturn = {
  readQueryString: (value: unknown) => string
  isDateKey: (value: string) => boolean
  applySearchQueryFromRoute: (value: string) => void
  armSearchQueryInput: () => void
  setSearchQuery: (value: string) => void
  handleSearchInput: (event: Event) => void
  searchQueryState: ComputedRef<{ effectiveValue: string; urlValue: string }>
  effectiveSearchQuery: ComputedRef<string>
  syncedSearchQuery: ComputedRef<string>
  slotScopedRouteSearch: ComputedRef<boolean>
  applyFiltersFromQuery: () => void
  syncFiltersToUrl: () => void
}
```

Implementation: move the function bodies verbatim from OrdersView.vue. The composable does NOT create route/router — it receives them. It does NOT create the refs — it receives them. It only provides the pure logic functions and computed properties.

- [ ] **Step 3: Verify build passes**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Expected: PASS (the composable is created but not yet imported by OrdersView.vue)

- [ ] **Step 4: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderRouteScope.ts
git commit -m "feat(orders): extract useOrderRouteScope composable"
```

---

## Task 2: Create useOrderFilters

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderFilters.ts`

- [ ] **Step 1: Create useOrderFilters.ts**

Extract from OrdersView.vue:
- `storeOptions` (line 1361)
- `defaultOrderStoreName` (line 1362)
- `advancedStoreOptions` (line 1363)
- `serviceOptions`, `paymentOptions`, `sourceOptions`, `methodOptions`, `statusOptions` (lines 1382-1386)
- `dropdownFilters` ref + watcher (lines 1388-1403)
- `selectDropdown`, `getDropdownCaption`, `selectMethodFilter` (lines 1405-1423)
- `advanced` ref (lines 1425-1434)
- `normalizeOrderStoreName`, `storeNameForOrderScope`, `selectOrderStore`, `ensureConcreteStoreScope` (lines 1436-1460)
- `toggleAdvancedStatus` (lines 1462-1468)
- `columns`, `tableColumns` (lines 1470-1471)
- `statusStyles`, `photoDeliveryStageStyles`, `orderTimelineToneStyles`, `paymentToneMap`, `paymentTone` (lines 1473-1508)
- `orderRange`, `arrivalRange`, `activeStartDate`, `activeEndDate` (lines 1027-1050)
- `calendarMonth`, `calendarCells`, `calendarTitle`, `normalizedRange`, `isInRange`, `isBoundary`, `getCalendarCellClass`, `openCalendar`, `prevMonth`, `nextMonth`, `selectDate` (lines 1051, 1279-1359)
- `matchesDropdown`, `matchesAdvanced`, `getFilterDate`, `filteredOrders` (lines 2292-2362)
- `emptyStateTitle`, `emptyStateHint`, `paginationStart`, `totalAmount` (lines 2364-2391)
- `activeFilterTags`, `hasSearchFilter`, `hasDateRangeFilter`, `hasActiveFilters`, `hasOnlyQuickFilter` (lines 2393-2447)
- `resetAdvanced`, `resetFilters` (lines 2449-2479)
- `anomalyFilters`, `anomalyFilterOptions`, `toggleAnomalyFilter` (lines 965-990)

Signature:

```typescript
import type { Ref, ComputedRef, Reactive } from 'vue'
import type { QuickOrderFilter, OrderSlotRange } from '../orderOperations'
import type { BookingOrder } from '../../../shared/stores/appStore'

export type UseOrderFiltersParams = {
  // Core refs
  searchQuery: Ref<string>
  searchQueryArmed: Ref<boolean>
  searchQueryTouched: Ref<boolean>
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  slotRange: Ref<OrderSlotRange>
  slotScopedOrders: Ref<BookingOrder[] | null>
  statusTab: Ref<string>
  activeDropdown: Ref<string | null>
  // Store-related
  appStore: typeof import('../../../shared/stores/appStore').appStore
  appDerived: typeof import('../../../shared/stores/appStore').appDerived
  // Route
  effectiveSearchQuery: ComputedRef<string>
  todayKey: string
}

export type UseOrderFiltersReturn = {
  // Store options
  storeOptions: ComputedRef<string[]>
  defaultOrderStoreName: ComputedRef<string>
  advancedStoreOptions: ComputedRef<string[]>
  // Filter options
  serviceOptions: ComputedRef<string[]>
  paymentOptions: ComputedRef<string[]>
  sourceOptions: ComputedRef<string[]>
  methodOptions: ComputedRef<string[]>
  statusOptions: ComputedRef<string[]>
  // Dropdown
  dropdownFilters: Ref<Array<{ label: string; width: number; options: string[]; value: string }>>
  selectDropdown: (label: string, option: string) => void
  getDropdownCaption: (label: string) => string
  selectMethodFilter: (option: string) => void
  // Advanced
  advanced: Ref<{ store: string; source: string; payment: string; service: string; method: string; amountMin: string; amountMax: string; status: string[] }>
  normalizeOrderStoreName: (name: string) => string
  storeNameForOrderScope: ComputedRef<string>
  selectOrderStore: (storeName: string) => void
  ensureConcreteStoreScope: () => void
  toggleAdvancedStatus: (opt: string) => void
  // Calendar
  calendarMonth: Ref<Date>
  calendarCells: ComputedRef<Array<{ date: Date; inMonth: boolean }>>
  calendarTitle: ComputedRef<string>
  openCalendar: (target: 'startDate' | 'endDate') => void
  prevMonth: () => void
  nextMonth: () => void
  selectDate: (d: Date) => void
  // Date range
  orderRange: Reactive<{ start: string; end: string }>
  arrivalRange: Reactive<{ start: string; end: string }>
  activeStartDate: ComputedRef<string>
  activeEndDate: ComputedRef<string>
  // Table
  columns: string[]
  tableColumns: string[]
  statusStyles: Record<string, string>
  photoDeliveryStageStyles: Record<string, string>
  orderTimelineToneStyles: Record<string, string>
  paymentTone: (payment: string) => 'success' | 'warn' | 'danger' | 'neutral'
  // Filter results
  filteredOrders: ComputedRef<BookingOrder[]>
  emptyStateTitle: ComputedRef<string>
  emptyStateHint: ComputedRef<string>
  paginationStart: ComputedRef<number>
  totalAmount: ComputedRef<string>
  // Filter tags
  activeFilterTags: ComputedRef<Array<{ key: string; label: string; clear: () => void }>>
  hasSearchFilter: ComputedRef<boolean>
  hasDateRangeFilter: ComputedRef<boolean>
  hasActiveFilters: ComputedRef<boolean>
  hasOnlyQuickFilter: ComputedRef<boolean>
  // Anomaly
  anomalyFilters: Ref<Set<string>>
  anomalyFilterOptions: ComputedRef<Array<{ key: string; label: string; count: number }>>
  toggleAnomalyFilter: (key: string) => void
  // Reset
  resetAdvanced: () => void
  resetFilters: () => void
}
```

- [ ] **Step 2: Verify build passes**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

- [ ] **Step 3: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderFilters.ts
git commit -m "feat(orders): extract useOrderFilters composable"
```

---

## Task 3: Create useOrderSlotScope

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderSlotScope.ts`

- [ ] **Step 1: Create useOrderSlotScope.ts**

Extract from OrdersView.vue:
- `slotRange` ref (line 954)
- `slotScopedOrders` ref (line 955)
- `slotScopedDashboardContext` ref (lines 956-961)
- `readSlotOriginDateFromRoute` (lines 1109-1112)
- `readSlotOriginStoreIdFromRoute` (lines 1114-1115)
- `syncSlotScopedDashboardContextFromRoute` (lines 1117-1148)
- `buildSlotScopedOrderQuery` (lines 1254-1269)
- `loadSlotScopedOrdersFromQuery` (lines 1825-1847)

Signature:

```typescript
import type { Ref, ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { OrderListQuery } from '../../../../shared/api/backend'
import type { BookingOrder, BookingInventorySlot } from '../../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'

export type UseOrderSlotScopeParams = {
  route: RouteLocationNormalizedLoaded
  slotRange: Ref<OrderSlotRange>
  slotScopedOrders: Ref<BookingOrder[] | null>
  slotScopedDashboardContext: Ref<{
    date: string
    storeId?: string
    slotStart: string
    slotEnd?: string
  } | null>
  effectiveSearchQuery: ComputedRef<string>
  activeStartDate: Ref<string>
  activeEndDate: Ref<string>
  storeNameForOrderScope: ComputedRef<string>
  activeQuickFilter: Ref<QuickOrderFilter>
  todayKey: string
  readQueryString: (value: unknown) => string
  isDateKey: (value: string) => boolean
  resolveStoreBackendIdFromName: (name: string) => string | undefined
  appStore: typeof import('../../../../shared/stores/appStore').appStore
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export type UseOrderSlotScopeReturn = {
  readSlotOriginDateFromRoute: () => string | undefined
  readSlotOriginStoreIdFromRoute: () => string | undefined
  syncSlotScopedDashboardContextFromRoute: () => void
  buildSlotScopedOrderQuery: () => (OrderListQuery & { slotStart?: string; slotEnd?: string }) | null
  loadSlotScopedOrdersFromQuery: () => Promise<void>
}
```

- [ ] **Step 2: Verify build**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

- [ ] **Step 3: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderSlotScope.ts
git commit -m "feat(orders): extract useOrderSlotScope composable"
```

---

## Task 4: Create useOrderDetailState

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderDetailState.ts`

- [ ] **Step 1: Create useOrderDetailState.ts**

Extract from OrdersView.vue:
- `selectedOrder` ref (line 1001)
- `selectedOrderAlbum` computed (lines 1511-1517)
- `selectedOrderPhotoStage` computed (line 1519)
- `selectedOrderAlbumActionAvailability` computed (line 1520)
- `canNotifySelectedOrderAlbum`, `canConfirmSelectedOrderAlbum`, `canDeliverSelectedOrderAlbum` (lines 1521-1523)
- `selectedOrderPhotoAccessLogs` computed (lines 1525-1529)
- `selectedOrderProduct` computed (lines 1532-1536)
- `selectedOrderSelectionLink` computed (lines 1538-1544)
- `selectedOrderAddonSummary` computed (lines 1546-1552)
- `selectedOrderSyncLogs` computed (lines 1555-1559)
- `selectedOrderCancelGuidance` computed (lines 1561-1566)
- `selectedOrderSourceContext` computed (lines 1568-1573)
- `clockToMinutes` helper (lines 1575-1579)
- `selectedOrderCurrentSlot` computed (lines 1581-1604)
- `selectedOrderSlotTimeLabel` computed (lines 1606-1612)
- `selectedOrderCapacitySummary` computed (lines 1614-1626)
- `selectedOrderStoreScopeText` computed (lines 1628-1633)
- `selectedOrderNextActionLabel` computed (lines 1635-1639)
- `selectedOrderOperationalHint` computed (lines 1641-1647)
- `selectedOrderTimeline` computed (lines 1649-1654)
- `selectedOrderOperationEvidenceCards` computed (lines 1656-1659)
- `orderFlowSteps` computed (lines 1719-1723)
- `todayPendingConfirmOrders` computed (line 1725)
- `orderOperationCards` / `orderPipelineCards` (lines 1727-1728)
- `inventoryConflictOrders` computed (lines 1729-1731)
- `missingInfoOrders` computed (lines 1732-1734)
- `dayCommandCards` computed (lines 1735-1768)
- `getOrderSyncLabel` (line 1770)

Signature:

```typescript
import type { Ref, ComputedRef } from 'vue'
import type { BookingOrder, BookingInventorySlot, Album } from '../../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'

export type UseOrderDetailStateParams = {
  orders: ComputedRef<BookingOrder[]>
  todayKey: string
  appStore: typeof import('../../../../shared/stores/appStore').appStore
}

export type UseOrderDetailStateReturn = {
  selectedOrder: Ref<BookingOrder | null>
  selectedOrderAlbum: ComputedRef<Album | null>
  selectedOrderPhotoStage: ComputedRef<{ key: string; label: string; hint: string; primaryAction: string }>
  selectedOrderAlbumActionAvailability: ComputedRef<Record<string, { enabled: boolean; reason: string }>>
  canNotifySelectedOrderAlbum: ComputedRef<boolean>
  canConfirmSelectedOrderAlbum: ComputedRef<boolean>
  canDeliverSelectedOrderAlbum: ComputedRef<boolean>
  selectedOrderPhotoAccessLogs: ComputedRef<Array<unknown>>
  selectedOrderProduct: ComputedRef<unknown>
  selectedOrderSelectionLink: ComputedRef<unknown>
  selectedOrderAddonSummary: ComputedRef<string>
  selectedOrderSyncLogs: ComputedRef<unknown[]>
  selectedOrderCancelGuidance: ComputedRef<{ tone: string; title: string; body: string }>
  selectedOrderSourceContext: ComputedRef<{ title: string; badge: string; tone: string; description: string; details: string[] }>
  selectedOrderCurrentSlot: ComputedRef<BookingInventorySlot | null>
  selectedOrderSlotTimeLabel: ComputedRef<string>
  selectedOrderCapacitySummary: ComputedRef<string>
  selectedOrderStoreScopeText: ComputedRef<string>
  selectedOrderNextActionLabel: ComputedRef<string>
  selectedOrderOperationalHint: ComputedRef<string>
  selectedOrderTimeline: ComputedRef<unknown[]>
  selectedOrderOperationEvidenceCards: ComputedRef<unknown[]>
  orderFlowSteps: ComputedRef<unknown[]>
  todayPendingConfirmOrders: ComputedRef<BookingOrder[]>
  orderOperationCards: ComputedRef<unknown[]>
  orderPipelineCards: ComputedRef<unknown[]>
  inventoryConflictOrders: ComputedRef<BookingOrder[]>
  missingInfoOrders: ComputedRef<BookingOrder[]>
  dayCommandCards: ComputedRef<Array<{ label: string; value: string; hint: string; action: string; scope: string; filter: QuickOrderFilter }>>
  getOrderSyncLabel: () => string
}
```

- [ ] **Step 2: Verify build**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

- [ ] **Step 3: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderDetailState.ts
git commit -m "feat(orders): extract useOrderDetailState composable"
```

---

## Task 5: Create useOrderMutations

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderMutations.ts`

- [ ] **Step 1: Create useOrderMutations.ts**

Extract from OrdersView.vue:
- `cancelReason` ref (line 993)
- `cancellingOrderId` ref (line 994)
- `updatingOrderId` ref (line 995)
- `reschedulingOrderId` ref (line 1004)
- `rescheduleConflict` ref (line 1005)
- `rescheduleDraft` reactive (lines 1012-1017)
- `cancelReasonOptions`, `rescheduleReasonOptions` (lines 1018-1019)
- `resetRescheduleDraft` (lines 1940-1946)
- `applyCancelReason`, `applyRescheduleReason` (lines 1948-1954)
- `reschedulePreviewSlot` computed (lines 1666-1670)
- `reschedulePreviewConflictMessage` computed (lines 1672-1676)
- `matchesSelectedOrderInventoryDimension` (lines 1678-1684)
- `rescheduleSlotOptions` computed (lines 1686-1696)
- `isRescheduleSlotSelected` (lines 1698-1699)
- `applyRescheduleSlot` (lines 1701-1709)
- `buildRescheduleSlotOptionMeta` (lines 1711-1716)
- `refreshOrderDetailAfterAdvance` (lines 2175-2180)
- `syncSlotScopeToOrder` (lines 2182-2199)
- `advanceOrder` (lines 2201-2220)
- `cancelSelectedOrder` (lines 2222-2243)
- `rescheduleSelectedOrder` (lines 2245-2281)

Signature:

```typescript
import type { Ref, ComputedRef, Reactive } from 'vue'
import type { BookingOrder, BookingInventorySlot } from '../../../../shared/stores/appStore'
import type { OrderSlotRange } from '../orderOperations'

export type UseOrderMutationsParams = {
  selectedOrder: Ref<BookingOrder | null>
  selectedOrderCurrentSlot: ComputedRef<BookingInventorySlot | null>
  reschedulePreviewConflictMessage: ComputedRef<string>
  todayKey: string
  slotRange: Ref<OrderSlotRange>
  slotScopedDashboardContext: Ref<{ date: string; storeId?: string; slotStart: string; slotEnd?: string } | null>
  appStore: typeof import('../../../../shared/stores/appStore').appStore
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
  loadSlotScopedOrdersFromQuery: () => Promise<void>
  loadOrderOperationLogs: () => Promise<void>
}

export type UseOrderMutationsReturn = {
  cancelReason: Ref<string>
  cancellingOrderId: Ref<string>
  updatingOrderId: Ref<string>
  reschedulingOrderId: Ref<string>
  rescheduleConflict: Ref<string>
  rescheduleDraft: Reactive<{ date: string; time: string; durationMinutes: number; remark: string }>
  cancelReasonOptions: string[]
  rescheduleReasonOptions: string[]
  resetRescheduleDraft: (order: BookingOrder) => void
  applyCancelReason: (reason: string) => void
  applyRescheduleReason: (reason: string) => void
  reschedulePreviewSlot: ComputedRef<BookingInventorySlot | null>
  reschedulePreviewConflictMessage: ComputedRef<string>
  rescheduleSlotOptions: ComputedRef<BookingInventorySlot[]>
  isRescheduleSlotSelected: (slot: BookingInventorySlot) => boolean
  applyRescheduleSlot: (slot: BookingInventorySlot) => void
  buildRescheduleSlotOptionMeta: (slot: BookingInventorySlot) => string
  advanceOrder: (order: BookingOrder) => Promise<void>
  cancelSelectedOrder: () => Promise<void>
  rescheduleSelectedOrder: () => Promise<void>
}
```

- [ ] **Step 2: Verify build**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

- [ ] **Step 3: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderMutations.ts
git commit -m "feat(orders): extract useOrderMutations composable"
```

---

## Task 6: Create useOrderOperationLogs

**Files:**
- Create: `studio-workbench/src/features/orders/composables/useOrderOperationLogs.ts`

- [ ] **Step 1: Create useOrderOperationLogs.ts**

Extract from OrdersView.vue:
- `operationLogsLoading` ref (line 1007)
- `operationLogsReloadQueued` ref (line 1008)
- `operationLogsNotice` ref (line 1009)
- `operationLogsStateText` computed (lines 1661-1664)
- `loadOrderOperationLogs` (lines 1956-1978)

Signature:

```typescript
import type { Ref, ComputedRef } from 'vue'

export type UseOrderOperationLogsParams = {
  appStore: typeof import('../../../../shared/stores/appStore').appStore
}

export type UseOrderOperationLogsReturn = {
  operationLogsLoading: Ref<boolean>
  operationLogsReloadQueued: Ref<boolean>
  operationLogsNotice: Ref<string>
  operationLogsStateText: ComputedRef<string>
  loadOrderOperationLogs: () => Promise<void>
}
```

- [ ] **Step 2: Verify build**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

- [ ] **Step 3: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/composables/useOrderOperationLogs.ts
git commit -m "feat(orders): extract useOrderOperationLogs composable"
```

---

## Task 7: Rewire OrdersView.vue to use composables

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`

- [ ] **Step 1: Replace extracted code with composable calls**

Replace the extracted variable declarations and function bodies in the `<script setup>` with calls to the composables. The Vue file keeps:
- All imports (composables + components)
- Ref creation for state that composables need
- `useOrderRouteScope(...)`, `useOrderFilters(...)`, `useOrderSlotScope(...)`, `useOrderDetailState(...)`, `useOrderMutations(...)`, `useOrderOperationLogs(...)` calls
- Destructuring the returns
- Watchers that wire composables together
- `openStaffBookingModal`, `handleStaffBookingCreated`, `syncDouyinLifeOrders`, `showAllOrders`, `loadAllOrdersFromQuery` (these are view-specific orchestration)
- Photo action handlers (`handleOrderAlbumNotify`, `handleOrderAlbumConfirm`, `handleOrderAlbumDeliver`, `copyField`, `copyOrderChannelDiagnostic`)
- Navigation helpers (`goToAlbum`, `goToPhotoManagement`, `goBackToDashboardSlot`, `openOrderDetail`, `openOrderFromQuery`)
- Export logic (`exportOrders`, `downloadOrderBlob`, `orderExportQuery`, etc.)
- Global event handlers (`handleGlobalClick`, `handleKeydown`)
- `onMounted` / `onBeforeUnmount`

Target: script section ~200 lines, total file ~800 lines.

- [ ] **Step 2: Verify all tests pass**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
```

Expected: ALL PASS

- [ ] **Step 3: Verify build passes**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/OrdersView.vue
git commit -m "refactor(orders): rewire OrdersView.vue to use composables"
```

---

## Task 8: Update contract tests for composables

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`

- [ ] **Step 1: Add composable source imports and assertions**

Add imports for each composable raw source:

```typescript
import useOrderRouteScopeSource from './composables/useOrderRouteScope.ts?raw'
import useOrderFiltersSource from './composables/useOrderFilters.ts?raw'
import useOrderSlotScopeSource from './composables/useOrderSlotScope.ts?raw'
import useOrderDetailStateSource from './composables/useOrderDetailState.ts?raw'
import useOrderMutationsSource from './composables/useOrderMutations.ts?raw'
import useOrderOperationLogsSource from './composables/useOrderOperationLogs.ts?raw'
```

Add tests verifying:
- `useOrderRouteScope` contains `applyFiltersFromQuery`, `syncFiltersToUrl`, `readQueryString`
- `useOrderFilters` contains `filteredOrders`, `storeOptions`, `activeQuickFilter`
- `useOrderSlotScope` contains `loadSlotScopedOrdersFromQuery`, `buildSlotScopedOrderQuery`
- `useOrderDetailState` contains `selectedOrderTimeline`, `orderFlowSteps`
- `useOrderMutations` contains `advanceOrder`, `cancelSelectedOrder`, `rescheduleSelectedOrder`
- `useOrderOperationLogs` contains `loadOrderOperationLogs`, `operationLogsStateText`
- `ordersSource` contains `useOrderRouteScope`, `useOrderFilters`, `useOrderSlotScope`, `useOrderDetailState`, `useOrderMutations`, `useOrderOperationLogs`

- [ ] **Step 2: Verify tests pass**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
```

Expected: ALL PASS

- [ ] **Step 3: Final full verification**

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Expected: ALL PASS

- [ ] **Step 4: Commit**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add studio-workbench/src/features/orders/OrdersView.contract.test.ts
git commit -m "test(orders): add composable source-level contract tests"
```

---

## Critical Invariants to Preserve

1. **Homepage slot jump params**: `date`, `storeId`, `slotStart`, `slotEnd` must still be read from route query and passed to `goBackToDashboardSlot`. Verify: `goBackToDashboardSlot` still reads `slotScopedDashboardContext`, `slotRange`, `route.query.storeId`.

2. **Reschedule URL update**: After `rescheduleSelectedOrder` succeeds, `syncSlotScopeToOrder(next)` must update `slotRange` and `slotScopedDashboardContext`. The `syncFiltersToUrl` watcher must fire and write new `slotStart`/`slotEnd` to URL.

3. **Operation logs refresh after mutation**: `advanceOrder`, `cancelSelectedOrder`, `rescheduleSelectedOrder` must call `loadOrderOperationLogs()` after success.

4. **No 全部门店替代具体 storeId**: `ensureConcreteStoreScope` must never set `advanced.store` to `'全部门店'`. `resolveStoreBackendIdFromName` must return `undefined` for `'全部门店'`.
