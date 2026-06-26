import type { BackendId } from './backendId'

export type OrderAnalysisQuery = {
  storeId?: BackendId
  dateFrom?: string
  dateTo?: string
}

export type OrderAnalysisOverviewDto = {
  orderedCount: number
  paidOrderCount: number
  paidAmountCent: number
  refundOrderCount: number
  refundAmountCent: number
  pendingAttentionCount: number
  boundaryNote: string
}

export type OrderAnalysisFunnelStageDto = {
  stageKey: string
  stageLabel: string
  orderCount: number
  amountCent: number
  conversionRate: number
}

export type OrderAnalysisChannelBreakdownDto = {
  channelKey: string
  channelLabel: string
  orderCount: number
  paidAmountCent: number
  refundAmountCent: number
  pendingCount: number
}

export type OrderAnalysisRefundBreakdownDto = {
  refundStatus: string
  orderCount: number
  refundAmountCent: number
  note: string
}

export type OrderAnalysisScaffoldDto = {
  overview: OrderAnalysisOverviewDto
  funnel: OrderAnalysisFunnelStageDto[]
  channels: OrderAnalysisChannelBreakdownDto[]
  refunds: OrderAnalysisRefundBreakdownDto[]
}

export type ReportFinanceReconciliationQuery = {
  storeId?: BackendId
  dateFrom?: string
  dateTo?: string
}

export type ReportFinanceOverviewDto = {
  orderAmountCent: number
  paidAmountCent: number
  refundAmountCent: number
  storedValueConsumeCent: number
  storedValueReversalCent: number
  withdrawPaidCent: number
  discountAmountCent: number
  waiveAmountCent: number
  reconciliationDiffCent: number
  attentionCount: number
  boundaryNote: string
}

export type ReportFinanceLedgerLineDto = {
  ledgerKey: string
  ledgerLabel: string
  recordCount: number
  amountCent: number
  refundAmountCent: number
  statusSummary: string
  sourceTable: string
}

export type ReportFinanceDifferenceDto = {
  differenceKey: string
  differenceLabel: string
  amountCent: number
  recordCount: number
  severity: string
  note: string
}

export type ReportFinanceExportTaskDto = {
  taskId: string
  taskType: string
  status: string
  storeId?: BackendId | null
  dateFrom: string
  dateTo: string
  createdTime: string
  finishedTime: string
  expireTime: string
  downloadUrl: string
  fileName: string
  errorMessage: string
  auditNote: string
}

export type ReportFinanceReconciliationDto = {
  overview: ReportFinanceOverviewDto
  orderLedgers: ReportFinanceLedgerLineDto[]
  fundLedgers: ReportFinanceLedgerLineDto[]
  differences: ReportFinanceDifferenceDto[]
  exportTasks: ReportFinanceExportTaskDto[]
}
