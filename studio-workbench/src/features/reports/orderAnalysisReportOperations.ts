import type {
  OrderAnalysisChannelBreakdownDto,
  OrderAnalysisFunnelStageDto,
  OrderAnalysisOverviewDto,
  OrderAnalysisRefundBreakdownDto,
} from '../../shared/api/backend'

export type OrderAnalysisSummaryCard = {
  label: string
  value: string
  hint: string
  scope: string
}

export type OrderAnalysisFunnelRow = {
  id: string
  label: string
  orderCountLabel: string
  amountLabel: string
  conversionLabel: string
}

export type OrderAnalysisChannelRow = {
  id: string
  channelLabel: string
  orderCountLabel: string
  paidAmountLabel: string
  refundAmountLabel: string
  pendingCountLabel: string
}

export type OrderAnalysisRefundRow = {
  id: string
  refundStatus: string
  orderCountLabel: string
  refundAmountLabel: string
  note: string
}

const formatCurrency = (amountCent: number) => `¥${(amountCent / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatPercent = (ratio: number) => `${Math.round((ratio <= 1 ? ratio * 100 : ratio) * 10) / 10}%`

export const buildOrderAnalysisSummaryCards = (overview: OrderAnalysisOverviewDto): OrderAnalysisSummaryCard[] => [
  {
    label: '订购单量',
    value: String(overview.orderedCount),
    hint: '当前时间范围内进入统一订单账本的订购记录数。',
    scope: 'ORDERS',
  },
  {
    label: '已支付收入',
    value: formatCurrency(overview.paidAmountCent),
    hint: '优先读取支付流水；无流水时回退订单实付字段。',
    scope: 'PAID',
  },
  {
    label: '退款金额',
    value: formatCurrency(overview.refundAmountCent),
    hint: '按退款状态与退款金额字段聚合，不代表财务对账完成。',
    scope: 'REFUND',
  },
  {
    label: '待关注',
    value: String(overview.pendingAttentionCount),
    hint: '包含待支付与退款中/已退款仍需跟进的订单。',
    scope: 'ACTION',
  },
]

export const buildOrderAnalysisFunnelRows = (items: OrderAnalysisFunnelStageDto[]): OrderAnalysisFunnelRow[] =>
  items.map(item => ({
    id: item.stageKey,
    label: item.stageLabel,
    orderCountLabel: `${item.orderCount} 单`,
    amountLabel: formatCurrency(item.amountCent),
    conversionLabel: formatPercent(item.conversionRate),
  }))

export const buildOrderAnalysisChannelRows = (items: OrderAnalysisChannelBreakdownDto[]): OrderAnalysisChannelRow[] =>
  items.map(item => ({
    id: item.channelKey || item.channelLabel,
    channelLabel: item.channelLabel,
    orderCountLabel: `${item.orderCount} 单`,
    paidAmountLabel: formatCurrency(item.paidAmountCent),
    refundAmountLabel: formatCurrency(item.refundAmountCent),
    pendingCountLabel: `${item.pendingCount} 单`,
  }))

export const buildOrderAnalysisRefundRows = (items: OrderAnalysisRefundBreakdownDto[]): OrderAnalysisRefundRow[] =>
  items.map(item => ({
    id: `${item.refundStatus}:${item.note}`,
    refundStatus: item.refundStatus,
    orderCountLabel: `${item.orderCount} 单`,
    refundAmountLabel: formatCurrency(item.refundAmountCent),
    note: item.note,
  }))
