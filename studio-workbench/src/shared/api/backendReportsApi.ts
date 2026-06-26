import { apiRequest, apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import { mapReportSnapshotRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  OrderAnalysisChannelBreakdownDto,
  OrderAnalysisFunnelStageDto,
  OrderAnalysisQuery,
  OrderAnalysisRefundBreakdownDto,
  OrderAnalysisScaffoldDto,
  ReportFinanceDifferenceDto,
  ReportFinanceExportTaskDto,
  ReportFinanceLedgerLineDto,
  ReportFinanceOverviewDto,
  ReportFinanceReconciliationDto,
  ReportFinanceReconciliationQuery,
  ReportSnapshot,
  ReportSnapshotQuery,
} from './backendTypes'

let cachedReportSnapshots: ReportSnapshot[] = []

const demoMode = () => import.meta.env.VITE_STUDIO_DEMO === 'true'

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const reportsApi = {
  async listReportSnapshots(query: ReportSnapshotQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/reportSnapshot/list', {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      ...(query.reportType ? { reportType: query.reportType } : {}),
      ...(query.storeId ? { storeId: String(query.storeId) } : {}),
      ...(query.snapshotDate ? { snapshotDate: query.snapshotDate } : {}),
    })
    cachedReportSnapshots = rows.map(mapReportSnapshotRow)
    return cachedReportSnapshots
  },
  async getOrderAnalysisOverview(query: OrderAnalysisQuery = {}): Promise<OrderAnalysisScaffoldDto> {
    if (demoMode()) return buildEmptyOrderAnalysisFallback()
    try {
      const response = await apiRequest<Record<string, unknown>>('/yy/reportOrderAnalysis/overview', {}, {
        ...(query.storeId ? { storeId: String(query.storeId) } : {}),
        ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
        ...(query.dateTo ? { dateTo: query.dateTo } : {}),
      })
      return mapOrderAnalysisScaffold(response)
    } catch (error) {
      if (demoMode()) return buildEmptyOrderAnalysisFallback()
      throw error
    }
  },
  async getReportFinanceReconciliation(query: ReportFinanceReconciliationQuery = {}): Promise<ReportFinanceReconciliationDto> {
    if (demoMode()) return buildEmptyFinanceReconciliationFallback()
    try {
      const response = await apiRequest<Record<string, unknown>>('/yy/reportFinanceReconciliation/overview', {}, financeQueryParams(query))
      return mapReportFinanceReconciliation(response)
    } catch (error) {
      if (demoMode()) return buildEmptyFinanceReconciliationFallback()
      throw error
    }
  },
  async createReportFinanceExportTask(query: ReportFinanceReconciliationQuery = {}): Promise<ReportFinanceExportTaskDto> {
    if (demoMode()) return buildDemoFinanceExportTask(query)
    const response = await apiRequest<Record<string, unknown>>('/yy/reportFinanceReconciliation/export', { method: 'POST' }, financeQueryParams(query))
    return mapReportFinanceExportTask(response)
  },
  async listReportFinanceExportTasks(query: ReportFinanceReconciliationQuery = {}): Promise<ReportFinanceExportTaskDto[]> {
    if (demoMode()) return []
    const response = await apiRequest<Record<string, unknown>[]>('/yy/reportFinanceReconciliation/export/tasks', {}, financeQueryParams(query))
    return (response ?? []).map(item => mapReportFinanceExportTask(item))
  },
}

const text = (value: unknown) => String(value ?? '')
const numberValue = (value: unknown) => Number(value ?? 0)

const financeQueryParams = (query: ReportFinanceReconciliationQuery = {}) => ({
  ...(query.storeId ? { storeId: String(query.storeId) } : {}),
  ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
  ...(query.dateTo ? { dateTo: query.dateTo } : {}),
})

const mapOrderAnalysisFunnelStage = (row: Record<string, unknown>): OrderAnalysisFunnelStageDto => ({
  stageKey: text(row.stageKey),
  stageLabel: text(row.stageLabel),
  orderCount: numberValue(row.orderCount),
  amountCent: numberValue(row.amountCent),
  conversionRate: numberValue(row.conversionRate),
})

const mapOrderAnalysisChannel = (row: Record<string, unknown>): OrderAnalysisChannelBreakdownDto => ({
  channelKey: text(row.channelKey),
  channelLabel: text(row.channelLabel),
  orderCount: numberValue(row.orderCount),
  paidAmountCent: numberValue(row.paidAmountCent),
  refundAmountCent: numberValue(row.refundAmountCent),
  pendingCount: numberValue(row.pendingCount),
})

const mapOrderAnalysisRefund = (row: Record<string, unknown>): OrderAnalysisRefundBreakdownDto => ({
  refundStatus: text(row.refundStatus),
  orderCount: numberValue(row.orderCount),
  refundAmountCent: numberValue(row.refundAmountCent),
  note: text(row.note),
})

const buildEmptyOrderAnalysisFallback = (): OrderAnalysisScaffoldDto => ({
  overview: {
    orderedCount: 0,
    paidOrderCount: 0,
    paidAmountCent: 0,
    refundOrderCount: 0,
    refundAmountCent: 0,
    pendingAttentionCount: 0,
    boundaryNote: '订购分析优先读取 yy_payment_record；无支付流水时回退 yy_order.paidAmountCent/refundAmountCent，不写第二套统计账本。',
  },
  funnel: [],
  channels: [],
  refunds: [],
})

const mapOrderAnalysisScaffold = (row: Record<string, unknown>): OrderAnalysisScaffoldDto => {
  const overview = (row.overview ?? {}) as Record<string, unknown>
  const funnel = Array.isArray(row.funnel) ? row.funnel : []
  const channels = Array.isArray(row.channels) ? row.channels : []
  const refunds = Array.isArray(row.refunds) ? row.refunds : []
  return {
    overview: {
      orderedCount: numberValue(overview.orderedCount),
      paidOrderCount: numberValue(overview.paidOrderCount),
      paidAmountCent: numberValue(overview.paidAmountCent),
      refundOrderCount: numberValue(overview.refundOrderCount),
      refundAmountCent: numberValue(overview.refundAmountCent),
      pendingAttentionCount: numberValue(overview.pendingAttentionCount),
      boundaryNote: text(overview.boundaryNote),
    },
    funnel: funnel.map(item => mapOrderAnalysisFunnelStage(item as Record<string, unknown>)),
    channels: channels.map(item => mapOrderAnalysisChannel(item as Record<string, unknown>)),
    refunds: refunds.map(item => mapOrderAnalysisRefund(item as Record<string, unknown>)),
  }
}

const buildEmptyFinanceOverview = (): ReportFinanceOverviewDto => ({
  orderAmountCent: 0,
  paidAmountCent: 0,
  refundAmountCent: 0,
  storedValueConsumeCent: 0,
  storedValueReversalCent: 0,
  withdrawPaidCent: 0,
  discountAmountCent: 0,
  waiveAmountCent: 0,
  reconciliationDiffCent: 0,
  attentionCount: 0,
  boundaryNote: 'report-finance reads yy_order, yy_payment_record, stored-value, withdraw, composite-payment and entitlement ledgers without creating a second finance ledger.',
})

const buildEmptyFinanceReconciliationFallback = (): ReportFinanceReconciliationDto => ({
  overview: buildEmptyFinanceOverview(),
  orderLedgers: [],
  fundLedgers: [],
  differences: [],
  exportTasks: [],
})

const mapReportFinanceOverview = (row: Record<string, unknown>): ReportFinanceOverviewDto => ({
  orderAmountCent: numberValue(row.orderAmountCent),
  paidAmountCent: numberValue(row.paidAmountCent),
  refundAmountCent: numberValue(row.refundAmountCent),
  storedValueConsumeCent: numberValue(row.storedValueConsumeCent),
  storedValueReversalCent: numberValue(row.storedValueReversalCent),
  withdrawPaidCent: numberValue(row.withdrawPaidCent),
  discountAmountCent: numberValue(row.discountAmountCent),
  waiveAmountCent: numberValue(row.waiveAmountCent),
  reconciliationDiffCent: numberValue(row.reconciliationDiffCent),
  attentionCount: numberValue(row.attentionCount),
  boundaryNote: text(row.boundaryNote),
})

const mapReportFinanceLedgerLine = (row: Record<string, unknown>): ReportFinanceLedgerLineDto => ({
  ledgerKey: text(row.ledgerKey),
  ledgerLabel: text(row.ledgerLabel),
  recordCount: numberValue(row.recordCount),
  amountCent: numberValue(row.amountCent),
  refundAmountCent: numberValue(row.refundAmountCent),
  statusSummary: text(row.statusSummary),
  sourceTable: text(row.sourceTable),
})

const mapReportFinanceDifference = (row: Record<string, unknown>): ReportFinanceDifferenceDto => ({
  differenceKey: text(row.differenceKey),
  differenceLabel: text(row.differenceLabel),
  amountCent: numberValue(row.amountCent),
  recordCount: numberValue(row.recordCount),
  severity: text(row.severity),
  note: text(row.note),
})

const mapReportFinanceExportTask = (row: Record<string, unknown>): ReportFinanceExportTaskDto => ({
  taskId: text(row.taskId),
  taskType: text(row.taskType),
  status: text(row.status),
  storeId: row.storeId === null || row.storeId === undefined || row.storeId === '' ? null : String(row.storeId),
  dateFrom: text(row.dateFrom),
  dateTo: text(row.dateTo),
  createdTime: text(row.createdTime),
  finishedTime: text(row.finishedTime),
  expireTime: text(row.expireTime),
  downloadUrl: text(row.downloadUrl),
  auditNote: text(row.auditNote),
})

const mapReportFinanceReconciliation = (row: Record<string, unknown>): ReportFinanceReconciliationDto => {
  const overview = (row.overview ?? {}) as Record<string, unknown>
  const orderLedgers = Array.isArray(row.orderLedgers) ? row.orderLedgers : []
  const fundLedgers = Array.isArray(row.fundLedgers) ? row.fundLedgers : []
  const differences = Array.isArray(row.differences) ? row.differences : []
  const exportTasks = Array.isArray(row.exportTasks) ? row.exportTasks : []
  return {
    overview: mapReportFinanceOverview(overview),
    orderLedgers: orderLedgers.map(item => mapReportFinanceLedgerLine(item as Record<string, unknown>)),
    fundLedgers: fundLedgers.map(item => mapReportFinanceLedgerLine(item as Record<string, unknown>)),
    differences: differences.map(item => mapReportFinanceDifference(item as Record<string, unknown>)),
    exportTasks: exportTasks.map(item => mapReportFinanceExportTask(item as Record<string, unknown>)),
  }
}

const buildDemoFinanceExportTask = (query: ReportFinanceReconciliationQuery): ReportFinanceExportTaskDto => ({
  taskId: `DEMO-FIN-${Date.now()}`,
  taskType: 'REPORT_FINANCE_RECONCILIATION_EXPORT',
  status: 'COMPLETED',
  storeId: query.storeId ?? null,
  dateFrom: query.dateFrom ?? '',
  dateTo: query.dateTo ?? '',
  createdTime: new Date().toISOString(),
  finishedTime: new Date().toISOString(),
  expireTime: '',
  downloadUrl: '',
  auditNote: 'demo export task',
})
