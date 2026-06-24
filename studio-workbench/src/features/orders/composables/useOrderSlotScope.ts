import type { Ref, ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { OrderListQuery } from '../../../shared/api/backend'
import type { BookingOrder } from '../../../shared/stores/appStore'
import { appStore } from '../../../shared/stores/appStore'
import type { OrderSlotRange } from '../orderOperations'
import { mapScheduleItemToSlotOrder, matchesOrderSlotRange } from '../orderOperations'

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
  readQueryString: (value: unknown) => string
  isDateKey: (value: string) => boolean
  resolveStoreBackendIdFromName: (name: string) => string | undefined
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export type UseOrderSlotScopeReturn = {
  buildSlotScopedOrderQuery: () => (OrderListQuery & { slotStart?: string; slotEnd?: string }) | null
  loadSlotScopedOrdersFromQuery: () => Promise<void>
}

export function useOrderSlotScope(params: UseOrderSlotScopeParams): UseOrderSlotScopeReturn {
  const {
    route,
    slotRange,
    slotScopedOrders,
    slotScopedDashboardContext,
    effectiveSearchQuery,
    activeStartDate,
    activeEndDate,
    storeNameForOrderScope,
    readQueryString,
    isDateKey,
    resolveStoreBackendIdFromName,
    notifyOrderAction,
  } = params

  const buildSlotScopedOrderQuery = (): (OrderListQuery & { slotStart?: string; slotEnd?: string }) | null => {
    if (!slotRange.value.start) return null
    const queryDate = slotScopedDashboardContext.value?.date || activeStartDate.value || activeEndDate.value
    const scopedStoreId = slotScopedDashboardContext.value?.storeId || readQueryString(route.query.slotOriginStoreId)
    if (!isDateKey(queryDate)) return null
    return {
      pageNum: 1,
      pageSize: 5000,
      keyword: effectiveSearchQuery.value || undefined,
      storeId: scopedStoreId || readQueryString(route.query.storeId) || resolveStoreBackendIdFromName(storeNameForOrderScope.value) || undefined,
      beginArrivalTime: `${queryDate} 00:00:00`,
      endArrivalTime: `${queryDate} 23:59:59`,
      slotDate: queryDate,
      slotStart: slotRange.value.start || undefined,
      slotEnd: slotRange.value.end || undefined,
    }
  }

  const loadSlotScopedOrdersFromQuery = async () => {
    const query = buildSlotScopedOrderQuery()
    const quick = readQueryString(route.query.quick)
    if (!query || !appStore.initialized || appStore.demoMode || (quick !== 'all' && quick !== 'douyin30')) {
      slotScopedOrders.value = null
      return
    }
    try {
      const orders = await appStore.loadReportOrders(query)
      if (orders.length > 0) {
        slotScopedOrders.value = orders
        return
      }
      await appStore.loadSchedule(query.slotDate || activeStartDate.value, storeNameForOrderScope.value, query.storeId)
      slotScopedOrders.value = appStore.scheduleItems
        .map((item: Parameters<typeof mapScheduleItemToSlotOrder>[0]) => mapScheduleItemToSlotOrder(item, appStore.stores))
        .filter((order: BookingOrder) => matchesOrderSlotRange(order, slotRange.value))
    } catch (error) {
      slotScopedOrders.value = null
      const message = error instanceof Error ? error.message : '加载失败'
      notifyOrderAction('error', `加载时段订单失败：${message}`)
    }
  }

  return {
    buildSlotScopedOrderQuery,
    loadSlotScopedOrdersFromQuery,
  }
}
