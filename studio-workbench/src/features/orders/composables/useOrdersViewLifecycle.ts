import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { format } from 'date-fns'
import { appStore } from '../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'
import type { useOrderRouteScope } from './useOrderRouteScope'
import type { useOrderFilters } from './useOrderFilters'
import type { UseOrderDetailStateReturn } from './useOrderDetailState'
import type { UseOrderSlotScopeReturn } from './useOrderSlotScope'

export type UseOrdersViewLifecycleParams = {
  route: RouteLocationNormalizedLoaded
  activeDropdown: Ref<string | null>
  activeQuickFilter: Ref<QuickOrderFilter>
  selectedTimeType: Ref<'order' | 'arrival'>
  statusTab: Ref<string>
  slotRange: Ref<OrderSlotRange>
  routeScope: ReturnType<typeof useOrderRouteScope>
  filters: ReturnType<typeof useOrderFilters>
  slotScope: UseOrderSlotScopeReturn
  detailState: UseOrderDetailStateReturn
  orderPhotoAccessLoading: Ref<boolean>
  orderPhotoAccessError: Ref<string>
  loadAllOrdersFromQuery: () => Promise<void>
  openOrderFromQuery: () => void
  resolveStoreNameFromBackendId: (storeId: string) => string
  loadSelectedOrderPhotoAccessLogs: (albumId: string) => Promise<void>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrdersViewLifecycle(params: UseOrdersViewLifecycleParams) {
  const {
    route,
    activeDropdown,
    activeQuickFilter,
    selectedTimeType,
    statusTab,
    slotRange,
    routeScope,
    filters,
    slotScope,
    detailState,
    orderPhotoAccessLoading,
    orderPhotoAccessError,
    loadAllOrdersFromQuery,
    openOrderFromQuery,
    resolveStoreNameFromBackendId,
    loadSelectedOrderPhotoAccessLogs,
    notifyOrderAction,
  } = params

  // OrdersView is reused across dashboard/order deep links; refresh local filters from URL
  // before syncFiltersToUrl can write any stale local search back into the route.
  watch(
    () => route.fullPath,
    (next, previous) => {
      if (next === previous) return
      routeScope.applyFiltersFromQuery()
    },
  )

  watch(
    [
      () => route.query.storeId,
      () => appStore.stores.map(store => store.backendId).join('|'),
    ],
    ([rawStoreId]) => {
      const storeId = routeScope.readQueryString(rawStoreId)
      if (!storeId) {
        filters.ensureConcreteStoreScope()
        return
      }
      const resolvedStore = resolveStoreNameFromBackendId(storeId)
      if (resolvedStore && filters.advanced.value.store !== resolvedStore) routeScope.applyFiltersFromQuery()
      else filters.ensureConcreteStoreScope()
    },
    { immediate: true },
  )

  watch(
    [
      () => appStore.initialized,
      () => appStore.demoMode,
      () => route.query.quick,
      () => route.query.slotStart,
      () => route.query.slotEnd,
      filters.activeStartDate,
      filters.activeEndDate,
      routeScope.effectiveSearchQuery,
    ],
    () => {
      void loadAllOrdersFromQuery()
      void slotScope.loadSlotScopedOrdersFromQuery()
    },
    { immediate: true },
  )

  watch(
    [
      routeScope.effectiveSearchQuery,
      selectedTimeType,
      activeQuickFilter,
      filters.activeStartDate,
      filters.activeEndDate,
      statusTab,
      () => `${slotRange.value.start}|${slotRange.value.end}`,
      () => filters.dropdownFilters.value.map(f => f.value).join('|'),
      () => JSON.stringify(filters.advanced.value),
    ],
    routeScope.syncFiltersToUrl,
  )

  watch(
    [
      filters.filteredOrders,
      () => route.query.orderId,
      () => route.query.q,
      () => route.query.keyword,
      () => route.fullPath,
    ],
    openOrderFromQuery,
    { immediate: true },
  )

  watch(
    () => route.query.focus,
    focus => {
      if (focus === 'pending') {
        activeQuickFilter.value = 'pending'
        selectedTimeType.value = 'arrival'
        const today = format(new Date(), 'yyyy-MM-dd')
        filters.arrivalRange.start = today
        filters.arrivalRange.end = today
        notifyOrderAction('success', `已进入今日待确认订单，当前 ${detailState.todayPendingConfirmOrders.value.length} 条需要处理`)
      }
    },
    { immediate: true },
  )

  watch(
    () => detailState.selectedOrderAlbum.value?.id ?? '',
    albumId => {
      orderPhotoAccessError.value = ''
      if (!albumId) {
        orderPhotoAccessLoading.value = false
        return
      }
      void loadSelectedOrderPhotoAccessLogs(albumId)
    },
  )

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target
    if (!(target instanceof Element)) return
    if (target.closest('[data-dropdown-root]')) return
    activeDropdown.value = null
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    activeDropdown.value = null
  }

  onMounted(() => {
    window.addEventListener('click', handleGlobalClick)
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', handleGlobalClick)
    window.removeEventListener('keydown', handleKeydown)
  })
}
