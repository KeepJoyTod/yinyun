import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { BookingOrder } from '../../../shared/stores/appStore'
import { matchesOrderDeepLinkId, matchesOrderDeepLinkQuery } from '../orderOperations'

export function useOrderDetailNavigation(state: {
  route: RouteLocationNormalizedLoaded
  router: Router
  filteredOrders: ComputedRef<BookingOrder[]>
  selectedOrder: Ref<BookingOrder | null>
  lastOpenedOrderQuery: Ref<string>
  slotScopedDashboardContext: Ref<{ date: string; storeId?: string; slotStart: string; slotEnd?: string } | null>
  slotRange: Ref<{ start: string; end: string }>
  activeStartDate: Ref<string>
  todayKey: string
  readQueryString: (value: unknown) => string
  openOrderDetail: (order: BookingOrder) => void
}) {
  const goBackToDashboardSlot = () => {
    const date = state.slotScopedDashboardContext.value?.date || state.activeStartDate.value || state.selectedOrder.value?.arrivalDate || state.todayKey
    const slotStart = state.slotScopedDashboardContext.value?.slotStart || state.slotRange.value.start
    if (!slotStart) return
    state.router.push({
      path: '/dashboard/today',
      query: {
        date,
        storeId: state.slotScopedDashboardContext.value?.storeId
          || state.readQueryString(state.route.query.storeId)
          || state.selectedOrder.value?.storeBackendId
          || undefined,
        slotStart,
        slotEnd: state.slotScopedDashboardContext.value?.slotEnd || state.slotRange.value.end || undefined,
      },
    })
  }

  const openOrderFromQuery = () => {
    const deepLinkOrderId = state.readQueryString(state.route.query.orderId)
    const raw = state.readQueryString(state.route.query.q || state.route.query.keyword)
    const key = `${state.route.fullPath}|${state.filteredOrders.value.map(order => order.backendId).join(',')}`
    if ((!deepLinkOrderId.trim() && !raw.trim()) || state.lastOpenedOrderQuery.value === key) return
    const matchById = deepLinkOrderId
      ? state.filteredOrders.value.find(order => matchesOrderDeepLinkId(order, deepLinkOrderId))
      : undefined
    const match = matchById ?? state.filteredOrders.value.find(order => matchesOrderDeepLinkQuery(order, raw))
    if (!match) return
    state.lastOpenedOrderQuery.value = key
    state.openOrderDetail(match)
  }

  return { goBackToDashboardSlot, openOrderFromQuery }
}
