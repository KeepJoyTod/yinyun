import { ref, type ComputedRef, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { BookingOrder } from '../../../shared/stores/appStore'
import {
  matchesOrderDeepLinkId,
  matchesOrderDeepLinkQuery,
  type OrderSlotRange,
} from '../orderOperations'

type SlotScopedDashboardContext = {
  date: string
  storeId?: string
  slotStart: string
  slotEnd?: string
}

export type UseOrderDetailRoutingParams = {
  route: RouteLocationNormalizedLoaded
  router: Router
  filteredOrders: ComputedRef<BookingOrder[]>
  selectedOrder: Ref<BookingOrder | null>
  activeStartDate: Ref<string>
  todayKey: string
  slotRange: Ref<OrderSlotRange>
  slotScopedDashboardContext: Ref<SlotScopedDashboardContext | null>
  readQueryString: (value: unknown) => string
  resetCancelReason: () => void
  resetRescheduleDraft: (order: BookingOrder) => void
  loadOrderOperationLogs: () => Promise<void>
}

export function useOrderDetailRouting(params: UseOrderDetailRoutingParams) {
  const {
    route,
    router,
    filteredOrders,
    selectedOrder,
    activeStartDate,
    todayKey,
    slotRange,
    slotScopedDashboardContext,
    readQueryString,
    resetCancelReason,
    resetRescheduleDraft,
    loadOrderOperationLogs,
  } = params

  const lastOpenedOrderQuery = ref('')

  const openOrderDetail = (order: BookingOrder) => {
    selectedOrder.value = order
    resetCancelReason()
    resetRescheduleDraft(order)
    void loadOrderOperationLogs()
  }

  const goBackToDashboardSlot = () => {
    const date = slotScopedDashboardContext.value?.date || activeStartDate.value || selectedOrder.value?.arrivalDate || todayKey
    const slotStart = slotScopedDashboardContext.value?.slotStart || slotRange.value.start
    if (!slotStart) return
    router.push({
      path: '/dashboard/today',
      query: {
        date,
        storeId: slotScopedDashboardContext.value?.storeId || readQueryString(route.query.storeId) || selectedOrder.value?.storeBackendId || undefined,
        slotStart,
        slotEnd: slotScopedDashboardContext.value?.slotEnd || slotRange.value.end || undefined,
      },
    })
  }

  const openOrderFromQuery = () => {
    const deepLinkOrderId = readQueryString(route.query.orderId)
    const raw = readQueryString(route.query.q || route.query.keyword)
    const key = `${route.fullPath}|${filteredOrders.value.map(order => order.backendId).join(',')}`
    if ((!deepLinkOrderId.trim() && !raw.trim()) || lastOpenedOrderQuery.value === key) return
    const matchById = deepLinkOrderId
      ? filteredOrders.value.find(order => matchesOrderDeepLinkId(order, deepLinkOrderId))
      : undefined
    const match = matchById ?? filteredOrders.value.find(order => matchesOrderDeepLinkQuery(order, raw))
    if (!match) return
    lastOpenedOrderQuery.value = key
    openOrderDetail(match)
  }

  return {
    lastOpenedOrderQuery,
    openOrderDetail,
    goBackToDashboardSlot,
    openOrderFromQuery,
  }
}
