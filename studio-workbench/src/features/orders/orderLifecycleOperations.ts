import type { BookingOrder } from '../../shared/stores/appStore'

export type OrderNextAction = {
  label: string
  nextStatus: BookingOrder['status']
  hint: string
}

export type OrderFlowStep = {
  label: BookingOrder['status']
  state: 'done' | 'current' | 'todo'
  hint?: string
}

export const isRefundedOrder = (order: BookingOrder) =>
  order.payment === '已退款' || order.status === '已退单'

export const isCancelledOrder = (order: BookingOrder) =>
  order.status === '已取消'

export const isCompletedOrder = (order: BookingOrder) =>
  !isRefundedOrder(order) && !isCancelledOrder(order) && (order.status === '已完成' || order.status === '选片中')

export const isEffectiveOrder = (order: BookingOrder) =>
  !isRefundedOrder(order) && !isCancelledOrder(order)

export const nextOrderActions: Partial<Record<BookingOrder['status'], OrderNextAction>> = {
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

const terminalOrderHints: Partial<Record<BookingOrder['status'], string>> = {
  已取消: '订单已取消，库存已释放；如需重新安排请新建预约或从操作日志追溯原因',
  已退单: '订单已退单，等待退款/平台同步记录归档',
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

export const getNextOrderAction = (order: BookingOrder) => nextOrderActions[order.status]

export const getNextOrderHint = (order: BookingOrder) =>
  getNextOrderAction(order)?.hint
  ?? terminalOrderHints[order.status]
  ?? '服务已完成，可进入客片交付和资料发送'
