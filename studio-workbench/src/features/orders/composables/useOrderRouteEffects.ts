import { onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import { format } from 'date-fns'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { appStore, type Album, type BookingOrder } from '../../../shared/stores/appStore'
import type { QuickOrderFilter } from '../orderOperations'
import type { OrderAdvancedFilters, OrderDropdownFilter } from './useOrderFilters'

export function useOrderRouteEffects(state: {
  route: RouteLocationNormalizedLoaded
  activeDropdown: Ref<string | null>
  activeQuickFilter: Ref<QuickOrderFilter>
  selectedTimeType: Ref<'order' | 'arrival'>
  arrivalRange: { start: string; end: string }
  effectiveSearchQuery: ComputedRef<string>
  activeStartDate: WritableComputedString
  activeEndDate: WritableComputedString
  statusTab: Ref<string>
  slotRange: Ref<{ start: string; end: string }>
  dropdownFilters: Ref<OrderDropdownFilter[]>
  advanced: Ref<OrderAdvancedFilters>
  filteredOrders: ComputedRef<BookingOrder[]>
  todayPendingConfirmOrders: ComputedRef<BookingOrder[]>
  selectedOrderAlbum: ComputedRef<Album | null>
  orderPhotoAccessError: Ref<string>
  orderPhotoAccessLoading: Ref<boolean>
  readQueryString: (value: unknown) => string
  resolveStoreNameFromBackendId: (storeId: string) => string
  ensureConcreteStoreScope: () => void
  applyFiltersFromQuery: () => void
  syncFiltersToUrl: () => void
  openOrderFromQuery: () => void
  loadSelectedOrderPhotoAccessLogs: (albumId: string) => Promise<void>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}) {
  state.applyFiltersFromQuery()

  // OrdersView is reused across dashboard/order deep links; refresh local filters from URL
  // before syncFiltersToUrl can write any stale local search back into the route.
  watch(
    () => state.route.fullPath,
    (next, previous) => {
      if (next === previous) return
      state.applyFiltersFromQuery()
    },
  )

  watch(
    [
      () => state.route.query.storeId,
      () => appStore.stores.map(store => store.backendId).join('|'),
    ],
    ([rawStoreId]) => {
      const storeId = state.readQueryString(rawStoreId)
      if (!storeId) {
        state.ensureConcreteStoreScope()
        return
      }
      const resolvedStore = state.resolveStoreNameFromBackendId(storeId)
      if (resolvedStore && state.advanced.value.store !== resolvedStore) state.applyFiltersFromQuery()
      else state.ensureConcreteStoreScope()
    },
    { immediate: true },
  )

  watch(
    [
      state.effectiveSearchQuery,
      state.selectedTimeType,
      state.activeQuickFilter,
      state.activeStartDate,
      state.activeEndDate,
      state.statusTab,
      () => `${state.slotRange.value.start}|${state.slotRange.value.end}`,
      () => state.dropdownFilters.value.map(f => f.value).join('|'),
      () => JSON.stringify(state.advanced.value),
    ],
    state.syncFiltersToUrl,
  )

  watch(
    [
      state.filteredOrders,
      () => state.route.query.orderId,
      () => state.route.query.q,
      () => state.route.query.keyword,
      () => state.route.fullPath,
    ],
    state.openOrderFromQuery,
    { immediate: true },
  )

  watch(
    () => state.route.query.focus,
    focus => {
      if (focus !== 'pending') return
      state.activeQuickFilter.value = 'pending'
      state.selectedTimeType.value = 'arrival'
      const today = format(new Date(), 'yyyy-MM-dd')
      state.arrivalRange.start = today
      state.arrivalRange.end = today
      state.notifyOrderAction('success', `已进入今日待确认订单，当前 ${state.todayPendingConfirmOrders.value.length} 条需要处理`)
    },
    { immediate: true },
  )

  watch(
    () => state.selectedOrderAlbum.value?.id ?? '',
    albumId => {
      state.orderPhotoAccessError.value = ''
      if (!albumId) {
        state.orderPhotoAccessLoading.value = false
        return
      }
      void state.loadSelectedOrderPhotoAccessLogs(albumId)
    },
  )

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target
    if (!(target instanceof Element)) return
    if (target.closest('[data-dropdown-root]')) return
    state.activeDropdown.value = null
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    state.activeDropdown.value = null
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

type WritableComputedString = Ref<string> | ComputedRef<string>
