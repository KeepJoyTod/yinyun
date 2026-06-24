import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import type { OrderListQuery } from '../../../shared/api/backend'
import {
  mapScheduleItemToSlotOrder,
  matchesOrderSlotRange,
  type OrderSlotRange,
} from '../orderOperations'

type OrderDataStringRef = { value: string }
type OrderDataSlotRange = { value: Required<OrderSlotRange> }
type OrderDataScopedOrders = { value: BookingOrder[] | null }

export function useOrderDataFetching(state: {
  activeStartDate: OrderDataStringRef
  activeEndDate: OrderDataStringRef
  effectiveSearchQuery: OrderDataStringRef
  storeNameForOrderScope: OrderDataStringRef
  slotRange: OrderDataSlotRange
  slotScopedOrders: OrderDataScopedOrders
  buildSlotScopedOrderQuery: () => (OrderListQuery & { slotStart?: string; slotEnd?: string }) | null
}, notifyOrderAction: (type: 'success' | 'error', message: string) => void) {
  const route = useRoute()
  const lastAllOrdersQueryKey = ref('')
  const readQueryString = (value: unknown) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

  const loadAllOrdersFromQuery = async () => {
    if (!appStore.initialized || appStore.demoMode || readQueryString(route.query.quick) !== 'douyin30') return
    const queryKey = route.fullPath
    if (lastAllOrdersQueryKey.value === queryKey) return
    lastAllOrdersQueryKey.value = queryKey
    try {
      await appStore.loadAllOrders()
    } catch (error) {
      lastAllOrdersQueryKey.value = ''
      const message = error instanceof Error ? error.message : '加载失败'
      notifyOrderAction('error', `加载近30天来客订单失败：${message}`)
    }
  }

  const loadSlotScopedOrdersFromQuery = async () => {
    const query = state.buildSlotScopedOrderQuery()
    const quick = readQueryString(route.query.quick)
    if (!query || !appStore.initialized || appStore.demoMode || (quick !== 'all' && quick !== 'douyin30')) {
      state.slotScopedOrders.value = null
      return
    }
    try {
      const orders = await appStore.loadReportOrders(query)
      if (orders.length > 0) {
        state.slotScopedOrders.value = orders
        return
      }
      const relaxedOrders = await appStore.loadReportOrders({
        pageNum: 1,
        pageSize: 5000,
        storeId: query.storeId,
        beginArrivalTime: query.beginArrivalTime,
        endArrivalTime: query.endArrivalTime,
      })
      const relaxedScopedOrders = relaxedOrders.filter(order => matchesOrderSlotRange(order, state.slotRange.value))
      if (relaxedScopedOrders.length > 0) {
        state.slotScopedOrders.value = relaxedScopedOrders
        return
      }
      await appStore.loadSchedule(query.slotDate || state.activeStartDate.value, state.storeNameForOrderScope.value, query.storeId)
      state.slotScopedOrders.value = appStore.scheduleItems
        .map(item => mapScheduleItemToSlotOrder(item, appStore.stores))
        .filter(order => matchesOrderSlotRange(order, state.slotRange.value))
    } catch (error) {
      state.slotScopedOrders.value = null
      const message = error instanceof Error ? error.message : '加载失败'
      notifyOrderAction('error', `加载时段订单失败：${message}`)
    }
  }

  watch(
    [
      () => appStore.initialized,
      () => appStore.demoMode,
      () => route.query.quick,
      () => route.query.slotStart,
      () => route.query.slotEnd,
      state.activeStartDate,
      state.activeEndDate,
      state.effectiveSearchQuery,
    ],
    () => {
      void loadAllOrdersFromQuery()
      void loadSlotScopedOrdersFromQuery()
    },
    { immediate: true },
  )

  return {
    loadAllOrdersFromQuery,
    loadSlotScopedOrdersFromQuery,
  }
}
