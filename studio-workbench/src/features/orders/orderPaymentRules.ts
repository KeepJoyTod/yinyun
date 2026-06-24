import type { BookingOrder } from '../../shared/stores/appStore'

export const canConfirmStorePayment = (order: BookingOrder | null) => Boolean(
  order
  && order.payment === '待支付'
  && order.status !== '已取消'
  && order.status !== '已退单'
  && !String(order.refundStatus || '').trim()
  && order.source !== '抖音来客'
  && order.channelType !== 'DOUYIN_LIFE',
)
