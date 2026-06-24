import type { BookingOrder } from '../../shared/stores/appStore'

export type CampaignOrderBridgeSummary = {
  totalOrders: number
  pendingOrders: number
  paidAmountCent: number
  sources: Array<{ sourceLabel: string; orderCount: number }>
}

export const isCampaignOrder = (order: BookingOrder) =>
  /抖音|美团|微信|券|活动|拼团|秒杀|砍价|分享|团购|兑换/.test(`${order.source} ${order.service}`)

export const buildCampaignOrderBridgeSummary = (orders: BookingOrder[]): CampaignOrderBridgeSummary => {
  const campaignOrders = orders.filter(isCampaignOrder)
  const sourceCount = new Map<string, number>()
  for (const order of campaignOrders) {
    const source = order.source || '未标记来源'
    sourceCount.set(source, (sourceCount.get(source) || 0) + 1)
  }
  return {
    totalOrders: campaignOrders.length,
    pendingOrders: campaignOrders.filter(order => !['已支付', '部分支付'].includes(order.payment)).length,
    paidAmountCent: campaignOrders.reduce((sum, order) => sum + (['已支付', '部分支付'].includes(order.payment) ? order.amount * 100 : 0), 0),
    sources: Array.from(sourceCount.entries())
      .map(([sourceLabel, orderCount]) => ({ sourceLabel, orderCount }))
      .sort((left, right) => right.orderCount - left.orderCount)
      .slice(0, 4),
  }
}
