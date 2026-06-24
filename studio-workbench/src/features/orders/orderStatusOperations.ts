import type { BookingOrder } from '../../shared/stores/appStore'
import {
  getOrderOperationalDate,
  hasCustomerContact,
} from '../../shared/stores/orderIssueRules'

export {
  getOrderOperationalDate,
  hasCustomerContact,
} from '../../shared/stores/orderIssueRules'

export const todayOperationalStatuses = ['待确认', '已确认', '已到店', '服务中', '拍摄中'] as BookingOrder['status'][]

export const isRefundedOrder = (order: BookingOrder) =>
  order.payment === '已退款' || order.status === '已退单'

export const isCancelledOrder = (order: BookingOrder) =>
  order.status === '已取消'

export const isCompletedOrder = (order: BookingOrder) =>
  !isRefundedOrder(order) && !isCancelledOrder(order) && (order.status === '已完成' || order.status === '选片中')

export const isEffectiveOrder = (order: BookingOrder) =>
  !isRefundedOrder(order) && !isCancelledOrder(order)

export const orderStatusGroupKeys = ['all', '待服务', '服务中', '已完成', '待支付', '已取消', '已退单'] as const

export type OrderStatusGroupKey = typeof orderStatusGroupKeys[number]

export type OrderStatusGroupCount = {
  key: OrderStatusGroupKey
  label: string
  count: number
}

const _normalizeOrderStatusTab = (value: string): OrderStatusGroupKey => {
  const normalized = value.trim()
  if (normalized === 'all' || normalized === '全部有效订单') return 'all'
  if (normalized === '待服务' || normalized === '待确认') return '待服务'
  if (normalized === '服务中' || normalized === '已确认' || normalized === '已到店' || normalized === '拍摄中') return '服务中'
  if (normalized === '已完成' || normalized === '选片中') return '已完成'
  if (normalized === '待支付') return '待支付'
  if (normalized === '已取消') return '已取消'
  if (normalized === '已退单' || normalized === '已退款') return '已退单'
  return 'all'
}

export const matchesOrderStatusGroup = (order: BookingOrder, group: OrderStatusGroupKey | string) => {
  const normalizedGroup = _normalizeOrderStatusTab(group)
  if (normalizedGroup === 'all') return isEffectiveOrder(order)
  if (normalizedGroup === '待服务') return isEffectiveOrder(order) && order.status === '待确认'
  if (normalizedGroup === '服务中') {
    return isEffectiveOrder(order) && ['已确认', '已到店', '服务中', '拍摄中'].includes(order.status)
  }
  if (normalizedGroup === '已完成') return isCompletedOrder(order)
  if (normalizedGroup === '待支付') return isEffectiveOrder(order) && order.payment === '待支付'
  if (normalizedGroup === '已取消') return isCancelledOrder(order)
  if (normalizedGroup === '已退单') return isRefundedOrder(order) && !isCancelledOrder(order)
  return order.status === group
}

export const buildOrderStatusGroupCounts = (orders: BookingOrder[]): OrderStatusGroupCount[] => [
  { key: 'all', label: '全部有效订单', count: orders.filter(order => matchesOrderStatusGroup(order, 'all')).length },
  { key: '待服务', label: '待服务', count: orders.filter(order => matchesOrderStatusGroup(order, '待服务')).length },
  { key: '服务中', label: '服务中', count: orders.filter(order => matchesOrderStatusGroup(order, '服务中')).length },
  { key: '已完成', label: '已完成', count: orders.filter(order => matchesOrderStatusGroup(order, '已完成')).length },
  { key: '待支付', label: '待支付', count: orders.filter(order => matchesOrderStatusGroup(order, '待支付')).length },
  { key: '已取消', label: '已取消', count: orders.filter(order => matchesOrderStatusGroup(order, '已取消')).length },
  { key: '已退单', label: '已退单', count: orders.filter(order => matchesOrderStatusGroup(order, '已退单')).length },
]

export const nextOrderActions: Partial<Record<BookingOrder['status'], { label: string; nextStatus: BookingOrder['status']; hint: string }>> = {
  待确认: { label: '确认订单', nextStatus: '已确认', hint: '电话/微信确认后点击' },
  已确认: { label: '标记到店', nextStatus: '已到店', hint: '客户到店后点击' },
  已到店: { label: '开始服务', nextStatus: '服务中', hint: '开始拍摄或证件照服务时点击' },
  服务中: { label: '完成服务', nextStatus: '已完成', hint: '拍摄/服务完成后点击' },
  拍摄中: { label: '完成服务', nextStatus: '已完成', hint: '兼容旧状态：拍摄完成后点击' },
}

export const orderFlowSequence: BookingOrder['status'][] = ['待确认', '已确认', '已到店', '服务中', '已完成']

const legacyShootingFlowSequence: BookingOrder['status'][] = ['待确认', '已确认', '已到店', '拍摄中', '已完成']

const terminalOrderFlowLabels: Partial<Record<BookingOrder['status'], BookingOrder['status']>> = {
  已取消: '已取消',
  已退单: '已退单',
}

export type OrderFlowStep = {
  label: BookingOrder['status']
  state: 'done' | 'current' | 'todo'
  hint?: string
}

export const buildOrderFlowSteps = (order: BookingOrder): OrderFlowStep[] => {
  const terminalLabel = terminalOrderFlowLabels[order.status]
  if (terminalLabel) {
    return [
      { label: '待确认', state: 'done', hint: nextOrderActions['待确认']?.hint },
      { label: terminalLabel, state: 'current' },
    ]
  }

  const sequence = order.status === '拍摄中' ? legacyShootingFlowSequence : orderFlowSequence
  const visibleStatus: BookingOrder['status'] = order.status === '选片中' ? '已完成' : order.status
  const currentIndex = Math.max(0, sequence.findIndex(step => step === visibleStatus))

  return sequence.map((label, index) => ({
    label,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo',
    hint: nextOrderActions[label]?.hint,
  }))
}

export const isTodayArrivalOrder = (order: BookingOrder, todayKey: string) =>
  getOrderOperationalDate(order) === todayKey && hasCustomerContact(order)

export const isTodayOperationalOrder = (order: BookingOrder, todayKey: string) =>
  isTodayArrivalOrder(order, todayKey) && todayOperationalStatuses.includes(order.status)

export const isTodayPendingConfirmOrder = (order: BookingOrder, todayKey: string) =>
  isTodayArrivalOrder(order, todayKey) && order.status === '待确认'

export const isSelectionFollowOrder = (order: BookingOrder) =>
  hasCustomerContact(order) && order.status === '选片中'

export const getNextOrderAction = (order: BookingOrder) => nextOrderActions[order.status]

const terminalOrderHints: Partial<Record<BookingOrder['status'], string>> = {
  已取消: '订单已取消，库存已释放；如需重新安排请新建预约或从操作日志追溯原因',
  已退单: '订单已退单，等待退款/平台同步记录归档',
}

export const getNextOrderHint = (order: BookingOrder) =>
  getNextOrderAction(order)?.hint
  ?? terminalOrderHints[order.status]
  ?? '服务已完成，可进入客片交付和资料发送'

export const normalizeOrderStatusTab = (value: string): OrderStatusGroupKey => {
  const normalized = value.trim()
  if (normalized === 'all' || normalized === '全部有效订单') return 'all'
  if (normalized === '待服务' || normalized === '待确认') return '待服务'
  if (normalized === '服务中' || normalized === '已确认' || normalized === '已到店' || normalized === '拍摄中') return '服务中'
  if (normalized === '已完成' || normalized === '选片中') return '已完成'
  if (normalized === '待支付') return '待支付'
  if (normalized === '已取消') return '已取消'
  if (normalized === '已退单' || normalized === '已退款') return '已退单'
  return 'all'
}
