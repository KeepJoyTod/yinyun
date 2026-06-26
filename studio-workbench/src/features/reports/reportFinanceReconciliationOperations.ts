import type {
  ReportFinanceDifferenceDto,
  ReportFinanceExportTaskDto,
  ReportFinanceLedgerLineDto,
  ReportFinanceOverviewDto,
} from '../../shared/api/backend'

export type FinanceSummaryCard = {
  label: string
  value: string
  hint: string
  scope: string
}

export type FinanceLedgerRow = {
  id: string
  label: string
  recordCountLabel: string
  amountLabel: string
  refundAmountLabel: string
  sourceTable: string
  statusSummary: string
}

export type FinanceDifferenceRow = {
  id: string
  label: string
  severity: string
  amountLabel: string
  recordCountLabel: string
  note: string
}

export type FinanceExportTaskRow = {
  id: string
  status: string
  range: string
  createdTime: string
  expireTime: string
  downloadUrl: string
  auditNote: string
}

const formatCurrency = (amountCent: number) =>
  `¥${(amountCent / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const buildFinanceSummaryCards = (overview: ReportFinanceOverviewDto): FinanceSummaryCard[] => [
  {
    label: '订单应收',
    value: formatCurrency(overview.orderAmountCent),
    hint: '来自 yy_order.totalAmountCent 的订单视角总额。',
    scope: 'ORDER',
  },
  {
    label: '资金实收',
    value: formatCurrency(overview.paidAmountCent),
    hint: '优先取 yy_payment_record，缺失时由订单实付兜底。',
    scope: 'FUND',
  },
  {
    label: '退款与逆向',
    value: formatCurrency(overview.refundAmountCent + overview.storedValueReversalCent),
    hint: '汇总退款金额和储值逆向回补金额。',
    scope: 'REVERSE',
  },
  {
    label: '待关注',
    value: String(overview.attentionCount),
    hint: '未支付、退款关注和未释放权益预占。',
    scope: 'ACTION',
  },
]

export const buildFinanceLedgerRows = (items: ReportFinanceLedgerLineDto[]): FinanceLedgerRow[] =>
  items.map(item => ({
    id: item.ledgerKey,
    label: item.ledgerLabel,
    recordCountLabel: `${item.recordCount} 条`,
    amountLabel: formatCurrency(item.amountCent),
    refundAmountLabel: formatCurrency(item.refundAmountCent),
    sourceTable: item.sourceTable,
    statusSummary: item.statusSummary,
  }))

export const buildFinanceDifferenceRows = (items: ReportFinanceDifferenceDto[]): FinanceDifferenceRow[] =>
  items.map(item => ({
    id: item.differenceKey,
    label: item.differenceLabel,
    severity: item.severity,
    amountLabel: formatCurrency(item.amountCent),
    recordCountLabel: `${item.recordCount} 条`,
    note: item.note,
  }))

export const buildFinanceExportTaskRows = (items: ReportFinanceExportTaskDto[]): FinanceExportTaskRow[] =>
  items.map(item => ({
    id: item.taskId,
    status: item.status,
    range: `${item.dateFrom || '-'} 至 ${item.dateTo || '-'}`,
    createdTime: item.createdTime || '-',
    expireTime: item.expireTime || '-',
    downloadUrl: item.downloadUrl,
    auditNote: item.auditNote,
  }))
