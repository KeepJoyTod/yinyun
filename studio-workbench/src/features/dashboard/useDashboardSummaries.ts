import { computed, type ComputedRef } from 'vue'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import { buildOrderStatusGroupCounts } from '../orders/orderOperations'
import {
  buildChannelOrderSummary,
  buildInventoryConflicts,
  buildPendingTaskNotice,
} from './dashboardPresentation'

type UseDashboardSummariesOptions = {
  selectedDateValue: ComputedRef<string>
  selectedDateOrders: ComputedRef<BookingOrder[]>
}

export const useDashboardSummaries = ({
  selectedDateValue,
  selectedDateOrders,
}: UseDashboardSummariesOptions) => {
  // 渠道订单汇总：按 source 聚合本地 yy_order 已同步账本（不调抖音 OpenAPI）
  const channelOrderSummary = computed(() => buildChannelOrderSummary(selectedDateOrders.value))

  // 库存冲突提醒：从 bookingInventory 筛出当天 conflictCount > 0 的时段
  const inventoryConflicts = computed(() =>
    buildInventoryConflicts(appStore.bookingInventory, selectedDateValue.value),
  )

  // 今日待处理事项计数（用于渠道/冲突卡片的次级提示）
  const pendingTaskNotice = computed(() => {
    const conflicts = inventoryConflicts.value.length
    const pending = selectedDateOrders.value.filter(order => order.status === '待确认').length
    return buildPendingTaskNotice(conflicts, pending)
  })

  const serviceStatusCards = computed(() =>
    buildOrderStatusGroupCounts(selectedDateOrders.value)
      .filter(item => item.key !== '待支付')
      .map(item => ({ key: item.key, label: item.label, value: String(item.count) })),
  )
  const statusCards = computed(() => serviceStatusCards.value)

  return {
    channelOrderSummary,
    inventoryConflicts,
    pendingTaskNotice,
    serviceStatusCards,
    statusCards,
  }
}
