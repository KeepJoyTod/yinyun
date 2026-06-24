import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { BackendId } from '../../shared/api/backendId'
import type { BookingOrder, DashboardFinanceInfo } from '../../shared/stores/appStoreTypes'

const scheduleIdentityKeys = (item: Pick<ScheduleItemDto, 'bookingId' | 'orderId' | 'orderNo'>) =>
  [item.bookingId, item.orderId, item.orderNo].filter(value => value != null && String(value).trim()).map(String)

const isScheduleItemInScope = (item: ScheduleItemDto, selectedDate?: string, selectedStoreBackendId?: BackendId) => {
  if (selectedDate && !item.startAt.startsWith(selectedDate)) return false
  if (selectedStoreBackendId && item.storeId !== selectedStoreBackendId) return false
  return true
}

export const buildDashboardScheduleItems = ({
  scheduleItems,
  selectedDateOrders,
  selectedStoreBackendId,
  selectedDate,
}: {
  scheduleItems: ScheduleItemDto[]
  selectedDateOrders: BookingOrder[]
  selectedStoreBackendId?: BackendId
  selectedDate?: string
}): ScheduleItemDto[] => {
  void selectedDateOrders

  const rows = scheduleItems.filter(item => isScheduleItemInScope(item, selectedDate, selectedStoreBackendId))
  const seen = new Set<string>()
  return rows.filter(item => {
    const key = [
      item.storeId,
      item.startAt,
      item.endAt,
      ...scheduleIdentityKeys(item),
    ].join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const centsToDisplayAmount = (value: number) => Math.round((value || 0) / 100)

export const buildDashboardFinanceOverview = ({
  backendFinance,
  backendFinanceMatchesScope,
  dayOrders,
}: {
  backendFinance?: DashboardFinanceInfo | null
  backendFinanceMatchesScope: boolean
  dayOrders: BookingOrder[]
}) => {
  if (backendFinance && backendFinanceMatchesScope) {
    return {
      hasBackendFinanceApi: true,
      actualIncome: centsToDisplayAmount(backendFinance.actualIncomeCent),
      expectedIncome: centsToDisplayAmount(backendFinance.expectedIncomeCent),
      productAmount: centsToDisplayAmount(backendFinance.productAmountCent),
      discountAmount: centsToDisplayAmount(backendFinance.discountAmountCent),
      orderAmount: centsToDisplayAmount(backendFinance.orderAmountCent),
      refundAmount: centsToDisplayAmount(backendFinance.refundAmountCent),
      orderCount: backendFinance.orderCount,
    }
  }

  const paidOrders = dayOrders.filter(order => order.payment === '已支付')
  const refundedOrders = dayOrders.filter(order => order.payment === '已退款')
  const orderAmount = dayOrders.reduce((sum, order) => sum + order.amount, 0)
  return {
    hasBackendFinanceApi: false,
    actualIncome: paidOrders.reduce((sum, order) => sum + order.amount, 0),
    expectedIncome: dayOrders.filter(order => order.payment !== '已退款').reduce((sum, order) => sum + order.amount, 0),
    productAmount: orderAmount,
    discountAmount: 0,
    orderAmount,
    refundAmount: refundedOrders.reduce((sum, order) => sum + order.amount, 0),
    orderCount: dayOrders.length,
  }
}

export const buildDashboardServiceOrderBreakdown = (
  groups: Array<{ key: string; label: string; count: number }>,
) => [
  { label: '总订单', count: groups.find(item => item.key === 'all')?.count ?? 0 },
  ...groups.filter(item => item.key !== 'all' && item.key !== '待支付').map(item => ({
    label: item.label,
    count: item.count,
  })),
]
