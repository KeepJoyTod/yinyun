import type {
  DashboardProductRankingQuery,
  DashboardScopeQuery,
  DashboardTrendStatsQuery,
  DashboardExportQuery,
  DouyinLifeOrderSyncQuery,
  OrderExportQuery,
  OrderListQuery,
  WorkOrderListQuery,
} from './backendTypes'

export const pageQuery = {
  pageNum: 1,
  pageSize: 200,
}

export const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const buildTodayArrivalOrderQuery = () => {
  const today = localDateKey()
  return {
    pageNum: 1,
    pageSize: 100,
    beginArrivalTime: `${today} 00:00:00`,
    endArrivalTime: `${today} 23:59:59`,
  }
}

export const buildAllOrdersQuery = () => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 29)
  return {
    pageNum: 1,
    pageSize: 5000,
    source: 'DOUYIN_LIFE',
    beginOrderTime: `${localDateKey(start)} 00:00:00`,
    endOrderTime: `${localDateKey(end)} 23:59:59`,
  }
}

export type OrderListQueryWithRouteSlot = OrderListQuery & { slotStart?: string; slotEnd?: string }

export const mapOrderListQuery = (query: OrderListQueryWithRouteSlot = {}) => ({
  pageNum: query.pageNum ?? 1,
  pageSize: query.pageSize ?? 100,
  keyword: query.keyword,
  storeId: query.storeId,
  source: query.source,
  bookingMethod: query.bookingMethod,
  status: query.status,
  payStatus: query.payStatus,
  beginOrderTime: query.beginOrderTime,
  endOrderTime: query.endOrderTime,
  beginArrivalTime: query.beginArrivalTime,
  endArrivalTime: query.endArrivalTime,
  slotDate: query.slotDate,
  slotStartTime: query.slotStartTime || query.slotStart,
  slotEndTime: query.slotEndTime || query.slotEnd,
})

export const mapOrderExportQuery = (query: OrderExportQuery = {}) => ({
  pageNum: query.pageNum ?? 1,
  pageSize: query.pageSize ?? 5000,
  keyword: query.keyword,
  storeId: query.storeId,
  source: query.source,
  bookingMethod: query.bookingMethod,
  status: query.status,
  payStatus: query.payStatus,
  beginOrderTime: query.beginOrderTime,
  endOrderTime: query.endOrderTime,
  beginArrivalTime: query.beginArrivalTime,
  endArrivalTime: query.endArrivalTime,
})

export const mapDashboardExportQuery = (query: DashboardExportQuery) => ({
  beginDate: query.beginDate,
  endDate: query.endDate,
  storeId: query.storeId,
  channelType: query.channelType,
})

const resolveDashboardDate = (query: DashboardScopeQuery = {}) =>
  query.date || query.bizDate

const resolveDashboardStoreId = (query: DashboardScopeQuery = {}) =>
  query.storeId || query.storeBackendId

export const mapDashboardFinanceQuery = (query: DashboardScopeQuery = {}) => ({
  date: resolveDashboardDate(query),
  storeId: resolveDashboardStoreId(query),
})

export const mapDashboardOrderStatusStatsQuery = (query: DashboardScopeQuery = {}) => ({
  date: resolveDashboardDate(query),
  storeId: resolveDashboardStoreId(query),
})

export const mapDashboardTrendStatsQuery = (query: DashboardTrendStatsQuery = {}) => ({
  endDate: query.endDate || resolveDashboardDate(query),
  days: query.days,
  storeId: resolveDashboardStoreId(query),
})

export const mapDashboardTodaySlotsQuery = (query: DashboardScopeQuery = {}) => ({
  date: resolveDashboardDate(query),
  storeId: resolveDashboardStoreId(query),
})

export const mapDashboardProductRankingQuery = (query: DashboardProductRankingQuery = {}) => ({
  date: resolveDashboardDate(query),
  storeId: resolveDashboardStoreId(query),
  topN: query.topN,
})

export const mapDashboardConversionQuery = (query: DashboardScopeQuery = {}) => ({
  date: resolveDashboardDate(query),
  storeId: resolveDashboardStoreId(query),
})

export const mapDouyinLifeSyncQuery = (query: DouyinLifeOrderSyncQuery = {}) => ({
  storeId: query.storeId,
  orderId: query.orderId,
  outOrderNo: query.outOrderNo,
  orderStatus: query.orderStatus,
  startTime: query.startTime,
  endTime: query.endTime,
  pageNum: query.pageNum ?? 1,
  pageSize: query.pageSize ?? 50,
  maxPages: query.maxPages ?? 2,
  maxTotal: query.maxTotal ?? 80,
  useTestDataHeader: query.useTestDataHeader,
})

export const mapWorkOrderListQuery = (query: WorkOrderListQuery = {}) => ({
  pageNum: query.pageNum ?? 1,
  pageSize: query.pageSize ?? 50,
  storeId: query.storeId,
  orderNo: query.orderNo,
  orderId: query.orderId,
  orderType: query.orderType,
  stageCode: query.stageCode,
  status: query.status,
  priority: query.priority,
  handlerId: query.handlerId,
})

export const toFormBody = (value: Record<string, string | number | boolean | null | undefined>) => {
  const params = new URLSearchParams()
  Object.entries(value).forEach(([key, entry]) => {
    if (entry === null || entry === undefined || entry === '') return
    params.set(key, String(entry))
  })
  return params.toString()
}
