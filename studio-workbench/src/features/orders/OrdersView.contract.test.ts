import { describe, expect, it } from 'vitest'
import ordersSource from './OrdersView.vue?raw'
import ordersViewConsoleShellSource from './OrdersViewConsoleShell.vue?raw'
import orderWorkspaceSource from './OrderWorkspace.vue?raw'
import orderOpsBoardSource from './OrderOpsBoard.vue?raw'
import orderTableSource from './OrderTable.vue?raw'
import orderDataFetchingSource from './composables/useOrderDataFetching.ts?raw'
import orderFiltersSource from './composables/useOrderFilters.ts?raw'
import orderRouteEffectsSource from './composables/useOrderRouteEffects.ts?raw'
import orderRouteSyncSource from './composables/useOrderRouteSync.ts?raw'
import orderConsoleActionsSource from './composables/useOrderConsoleActions.ts?raw'
import orderDetailActionsSource from './composables/useOrderDetailActions.ts?raw'
import ordersViewStateSource from './composables/useOrdersViewState.ts?raw'
import orderDetailNavigationSource from './composables/useOrderDetailNavigation.ts?raw'
import orderFilterOperationsSource from './orderFilterOperations.ts?raw'
import orderLifecycleOperationsSource from './orderLifecycleOperations.ts?raw'
import orderStatusOperationsSource from './orderStatusOperations.ts?raw'

describe('orders page contract', () => {
  it('shows a store order operations board before the table', () => {
    expect(ordersSource).toContain('<OrdersViewConsoleShell')
    expect(ordersViewConsoleShellSource).toContain('<OrderWorkspace')
    expect(orderWorkspaceSource).toContain('<OrderOpsBoard')
    expect(orderOpsBoardSource).toContain('orders-ops-board')
    expect(orderFilterOperationsSource).toContain('今日到店')
    expect(orderRouteEffectsSource).toContain('待确认')
    expect(orderFilterOperationsSource).toContain('待服务')
    expect(orderFilterOperationsSource).toContain('客片交付')
    expect(orderOpsBoardSource).toContain('完成服务后进入客片交付')
    expect(orderFilterOperationsSource).not.toContain('待拍摄')
    expect(orderFilterOperationsSource).not.toContain('选片跟进')
    expect(`${ordersSource}\n${ordersViewConsoleShellSource}`).not.toContain('拍摄完成后跟进选片')
    expect(orderFiltersSource).toContain('当前统一订单库暂无可展示订单')
  })

  it('offers quick operational filters for store staff', () => {
    expect(ordersSource).toContain('quickOrderFilters')
    expect(orderFilterOperationsSource).toContain('今日待处理')
    expect(orderFilterOperationsSource).toContain('只看今日')
    expect(orderFilterOperationsSource).toContain('待确认优先')
    expect(orderFilterOperationsSource).toContain('客片交付')
    expect(orderFilterOperationsSource).not.toContain('选片跟进')
    expect(ordersSource).toContain('activeQuickFilter')
  })

  it('derives order operations from existing store order data', () => {
    expect(ordersSource).toContain('buildOrderOperationCards(orders.value, todayKey)')
    expect(orderStatusOperationsSource).toContain('isTodayOperationalOrder')
    expect(orderStatusOperationsSource).toContain('isTodayPendingConfirmOrder')
    expect(orderStatusOperationsSource).toContain('isSelectionFollowOrder')
  })

  it('lets staff advance order status with visible feedback', () => {
    expect(ordersSource).toContain('advanceOrder')
    expect(ordersSource).toContain('getNextOrderAction')
    expect(orderLifecycleOperationsSource).toContain('确认订单')
    expect(orderLifecycleOperationsSource).toContain('标记到店')
    expect(orderLifecycleOperationsSource).toContain('开始服务')
    expect(orderLifecycleOperationsSource).toContain('完成服务')
    expect(ordersSource).toContain('orderActionNotice')
    expect(orderTableSource).toContain('点击后写入影约云订单库')
  })

  it('waits for scoped orders and operation logs after status advance', () => {
    expect(orderDetailActionsSource).toContain('const refreshOrderDetailAfterAdvance = async () =>')
    expect(orderDetailActionsSource).toContain('await options.loadSlotScopedOrdersFromQuery()')
    expect(orderDetailActionsSource).toContain('await loadOrderOperationLogs()')
    expect(orderDetailActionsSource).toContain('if (shouldRefresh) await refreshOrderDetailAfterAdvance()')
    expect(orderDetailActionsSource).not.toContain('if (shouldRefresh) void refreshOrderDetailAfterAdvance()')
  })

  it('loads real booking inventory for the selected order and reschedule date before showing half-hour slots', () => {
    expect(orderDetailActionsSource).toContain('watch(')
    expect(orderDetailActionsSource).toContain('[options.selectedOrder, () => options.rescheduleDraft.date]')
    expect(orderDetailActionsSource).toContain('await appStore.loadBookingInventory({')
    expect(orderDetailActionsSource).toContain('storeBackendId: order.storeBackendId')
    expect(orderDetailActionsSource).toContain('serviceGroupBackendId: order.serviceGroupBackendId || undefined')
    expect(orderDetailActionsSource).toContain('加载改期时段失败')
  })

  it('opens in pending focus from the global order action', () => {
    expect(orderRouteEffectsSource).toContain("route.query.focus")
    expect(orderRouteEffectsSource).toContain("focus !== 'pending'")
    expect(orderRouteEffectsSource).toContain("state.activeQuickFilter.value = 'pending'")
  })

  it('defaults store staff to today operational orders instead of all history', () => {
    expect(orderFilterOperationsSource).toContain("quickOrderFilterKeys = ['todayOps', 'all', 'douyin30', 'today', 'pending', 'selection', 'issues'] as const")
    expect(ordersViewStateSource).toContain("activeQuickFilter = ref<QuickOrderFilter>('todayOps')")
    expect(orderStatusOperationsSource).toContain('todayOperationalStatuses')
    expect(orderFiltersSource).toContain('matchesQuickOrderFilter(o, activeQuickFilter.value, todayKey)')
    expect(orderFilterOperationsSource).toContain("filter === 'todayOps'")
  })

  it('lets staff switch from today queue to all synchronized orders without keeping date filters', () => {
    expect(ordersSource).toContain('showAllOrders')
    expect(orderConsoleActionsSource).toContain('appStore.loadAllOrders()')
    expect(orderFiltersSource).toContain('appStore.ledgerOrders')
    expect(orderConsoleActionsSource).toContain("options.arrivalRange.start = ''")
    expect(orderConsoleActionsSource).toContain("options.arrivalRange.end = ''")
    expect(ordersSource).toContain('@show-all-orders="showAllOrders"')
  })

  it('loads all synchronized orders when opened directly with quick all', () => {
    expect(orderDataFetchingSource).toContain('loadAllOrdersFromQuery')
    expect(orderDataFetchingSource).toContain("readQueryString(route.query.quick) !== 'douyin30'")
    expect(orderDataFetchingSource).toContain('!appStore.initialized')
    expect(orderDataFetchingSource).toContain('await appStore.loadAllOrders()')
    expect(orderDataFetchingSource).toContain('lastAllOrdersQueryKey')
    expect(orderDataFetchingSource).toContain('appStore.initialized')
    expect(orderDataFetchingSource).toContain("route.query.quick")
    expect(orderDataFetchingSource).toContain('{ immediate: true }')
  })

  it('keeps pending confirmation counts scoped to today for staff work', () => {
    expect(ordersSource).toContain('todayPendingConfirmOrders')
    expect(orderStatusOperationsSource).toContain("order.status === '待确认'")
    expect(orderRouteEffectsSource).toContain('todayPendingConfirmOrders.value.length')
  })

  it('separates incomplete channel orders from staff operational work', () => {
    expect(ordersSource).toContain('hasCustomerContact')
    expect(orderFilterOperationsSource).toContain('!isOperationalOrder(order)')
    expect(orderFilterOperationsSource).toContain('异常缺资料')
    expect(orderFiltersSource).toContain("activeQuickFilter.value === 'issues'")
    expect(orderFilterOperationsSource).toContain("filter === 'issues'")
  })

  it('syncs common filters to the url for refreshable staff handoff links', () => {
    expect(orderRouteSyncSource).toContain('useRouter')
    expect(ordersSource).toContain('syncFiltersToUrl')
    expect(ordersSource).toContain('applyFiltersFromQuery')
    expect(orderRouteSyncSource).toContain('router.replace')
    expect(orderRouteSyncSource).toContain("route.query.q")
    expect(orderRouteSyncSource).toContain('route.query.keyword')
    expect(orderRouteSyncSource).toContain("route.query.quick")
  })

  it('re-applies route query filters when dashboard deep links reopen the reused orders view', () => {
    expect(orderRouteEffectsSource).toContain('() => state.route.fullPath')
    expect(orderRouteEffectsSource).toContain('if (next === previous) return')
    expect(orderRouteEffectsSource).toContain('state.applyFiltersFromQuery()')
    expect(orderRouteSyncSource).toContain('applySearchQueryFromRoute(readQueryString(route.query.q || route.query.keyword))')
    expect(orderRouteSyncSource).toContain('resolveOrderSearchQueryState')
  })

  it('returns to the same dashboard slot from slot-scoped order detail context', () => {
    expect(ordersSource).toContain('goBackToDashboardSlot')
    expect(orderDetailNavigationSource).toContain("path: '/dashboard/today'")
    expect(orderDetailNavigationSource).toContain('state.slotRange.value.start')
    expect(orderDetailNavigationSource).toContain('state.slotRange.value.end || undefined')
    expect(orderDetailNavigationSource).toContain('state.readQueryString(state.route.query.storeId)')
    expect(orderDetailNavigationSource).toContain('state.selectedOrder.value?.storeBackendId')
  })

  it('preserves the original dashboard slot context even after local order filters change', () => {
    expect(ordersSource).toContain('slotScopedDashboardContext')
    expect(orderRouteSyncSource).toContain('route.query.slotOriginDate')
    expect(orderRouteSyncSource).toContain('route.query.slotOriginStoreId')
    expect(orderRouteSyncSource).toContain('slotScopedDashboardContext.value?.date')
    expect(orderRouteSyncSource).toContain('slotScopedDashboardContext.value?.storeId')
    expect(orderDetailNavigationSource).toContain('state.slotScopedDashboardContext.value?.slotStart')
    expect(orderDetailNavigationSource).toContain('state.slotScopedDashboardContext.value?.slotEnd')
  })

  it('uses dashboard slot origin date when loading slot-scoped order results', () => {
    const queryBlockStart = orderRouteSyncSource.indexOf('const buildSlotScopedOrderQuery')
    const queryBlock = orderRouteSyncSource.slice(
      queryBlockStart,
      orderRouteSyncSource.indexOf('return {\n    readQueryString', queryBlockStart),
    )
    expect(queryBlock).toContain('const queryDate = state.slotScopedDashboardContext.value?.date || state.activeStartDate.value || state.activeEndDate.value')
    expect(queryBlock).toContain('if (!isDateKey(queryDate)) return null')
    expect(queryBlock).toContain('beginArrivalTime: `${queryDate} 00:00:00`')
    expect(queryBlock).toContain('endArrivalTime: `${queryDate} 23:59:59`')
    expect(queryBlock).toContain('slotDate: queryDate')
    expect(orderRouteSyncSource).toContain('slotOriginDate: state.slotScopedDashboardContext.value?.date || route.query.slotOriginDate || undefined')
    expect(orderRouteSyncSource).toContain('slotOriginStoreId: state.slotScopedDashboardContext.value?.storeId || route.query.slotOriginStoreId || undefined')
  })

  it('hydrates slot-scoped arrival filters from dashboard date links when start and end are omitted', () => {
    expect(orderRouteSyncSource).toContain('const readSlotScopedDateFromRoute = () => {')
    expect(orderRouteSyncSource).toContain("const routeDate = readQueryString(route.query.date).trim()")
    expect(orderRouteSyncSource).toContain('const slotScopedDate = readSlotScopedDateFromRoute()')
    expect(orderRouteSyncSource).toContain('const hasSlotScopedRange = Boolean(slotStart || slotEnd)')
    expect(orderRouteSyncSource).toContain('if (!hasExplicitStart && hasSlotScopedRange && slotScopedDate) state.activeStartDate.value = slotScopedDate')
    expect(orderRouteSyncSource).toContain('if (!hasExplicitEnd && hasSlotScopedRange && slotScopedDate) state.activeEndDate.value = slotScopedDate')
  })

  it('shares the route-synced date ranges with order filtering instead of keeping a second local today range', () => {
    expect(ordersSource).toContain('externalOrderRange: orderRange')
    expect(ordersSource).toContain('externalArrivalRange: arrivalRange')
    expect(orderFiltersSource).toContain('const orderRange = externalOrderRange ?? reactive({')
    expect(orderFiltersSource).toContain('const arrivalRange = externalArrivalRange ?? reactive({')
  })

  it('accepts dashboard storeId deep links while preserving astore compatibility', () => {
    expect(orderRouteSyncSource).toContain('resolveStoreNameFromBackendId')
    expect(orderRouteSyncSource).toContain("const storeId = readAdvancedScalar('storeId')")
    expect(orderRouteSyncSource).toContain('const resolvedStore = resolveStoreNameFromBackendId(storeId)')
    expect(orderRouteSyncSource).toContain('state.advanced.value.store = resolvedStore || store')
    expect(orderRouteSyncSource).toContain("storeId: resolveStoreBackendIdFromName(state.storeNameForOrderScope.value)")
    expect(orderRouteEffectsSource).toContain('appStore.stores.map(store => store.backendId).join')
    expect(orderRouteEffectsSource).toContain('state.applyFiltersFromQuery()')
  })

  it('opens the matching order drawer from dashboard deep links', () => {
    expect(ordersSource).toContain('openOrderFromQuery')
    expect(orderDetailNavigationSource).toContain('state.route.query.orderId')
    expect(orderDetailNavigationSource).toContain('matchesOrderDeepLinkId')
    expect(orderDetailNavigationSource).toContain('const matchById = deepLinkOrderId')
    expect(orderDetailNavigationSource).toContain('matchesOrderDeepLinkQuery')
    expect(orderDetailNavigationSource).toContain('state.filteredOrders.value.find')
    expect(orderDetailNavigationSource).toContain('state.openOrderDetail(match)')
    expect(ordersSource).toContain('lastOpenedOrderQuery')
    expect(orderRouteSyncSource).toContain('normalizeOrderStatusTab(stTab)')
  })

  it('keeps the selected order recoverable across fullPath remounts caused by query sync', () => {
    expect(ordersSource).toContain('openOrderDetailWithRouteSync')
    expect(ordersSource).toContain('closeOrderDetail')
    expect(ordersSource).toContain('syncSelectedOrderQuery(order.id)')
    expect(ordersSource).toContain('const nextOrderId = orderId || undefined')
    expect(ordersSource).toContain('orderId: nextOrderId')
  })

  it('moves slot-scoped order context to the new slot after reschedule', () => {
    expect(orderDetailActionsSource).toContain('slotScopedDashboardContext')
    expect(orderDetailActionsSource).toContain('options.slotRange.value = {')
    expect(orderDetailActionsSource).toContain('slotStart: nextStart')
    expect(orderDetailActionsSource).toContain('options.slotScopedDashboardContext.value = {')
    expect(orderDetailActionsSource).toContain('date: order.arrivalDate')
  })

  it('parses slot deep links and keeps them in url-synced order filters', () => {
    expect(orderRouteSyncSource).toContain("const slotStart = readQueryString(route.query.slotStart)")
    expect(orderRouteSyncSource).toContain("const slotEnd = readQueryString(route.query.slotEnd)")
    expect(orderRouteSyncSource).toContain('state.slotRange.value = { start: slotStart, end: slotEnd }')
    expect(orderFiltersSource).toContain('matchesOrderSlotRange(o, slotRange.value)')
    expect(orderRouteSyncSource).toContain('slotStart: state.slotRange.value.start || undefined')
    expect(orderRouteSyncSource).toContain('slotEnd: state.slotRange.value.end || undefined')
    expect(ordersSource).toContain('loadSlotScopedOrdersFromQuery')
    expect(orderDataFetchingSource).toContain('mapScheduleItemToSlotOrder')
    expect(orderDataFetchingSource).toContain('await appStore.loadSchedule')
    expect(orderDataFetchingSource).toContain('appStore.scheduleItems')
  })

  it('falls back to day-scoped backend orders before using cached schedule items for slot-scoped links', () => {
    expect(orderDataFetchingSource).toContain('const relaxedOrders = await appStore.loadReportOrders({')
    expect(orderDataFetchingSource).toContain('beginArrivalTime: query.beginArrivalTime')
    expect(orderDataFetchingSource).toContain('endArrivalTime: query.endArrivalTime')
    expect(orderDataFetchingSource).toContain('const relaxedScopedOrders = relaxedOrders.filter(order => matchesOrderSlotRange(order, state.slotRange.value))')
  })

  it('strips stale q from slot-scoped deep links before keeping the url shareable', () => {
    expect(orderRouteSyncSource).toContain('slotScopedRouteSearch')
    expect(orderRouteSyncSource).toContain('if (slotScopedRouteSearch.value) syncFiltersToUrl()')
  })

})
