import { apiRequest, apiRequestBlob, apiRequestRaw, type BlobResponse, type PageResponse } from './request'
import { assetsApi } from './backendAssetsApi'
import { createAlbumsApi } from './backendAlbumsApi'
import { mapChannelAcceptanceCaseRow, mapChannelSyncHealthRow } from './backendChannelInsights'
import { normalizeBackendId, type BackendId } from './backendId'
import { createMasterDataApi } from './backendMasterDataApi'
import { merchantContentApi } from './backendMerchantContentApi'
import { createProductsApi } from './backendProductsApi'
import { reportsApi } from './backendReportsApi'
import { scheduleRulesApi } from './backendScheduleRulesApi'
import { workOrdersApi } from './backendWorkOrdersApi'
import {
  buildAllOrdersQuery,
  buildTodayArrivalOrderQuery,
  mapDouyinLifeSyncQuery,
  mapOrderExportQuery,
  mapOrderListQuery,
  pageQuery,
  toFormBody,
  type OrderListQueryWithRouteSlot,
} from './backendQueryMappers'
import {
  mapBookingInventoryRow,
  mapChannelProductMappingRow,
  mapChannelSyncLogRow,
  mapDashboardFinanceRow,
  mapDouyinLifeSyncResult,
  mapScheduleGridRow,
  mapOperationLogRow,
} from './backendRowMappers'
import {
  buildOrderStatusStats,
  buildScheduleItemsFromOrders,
  buildStudiosFromStores,
  buildTodaySlots,
  buildTrendStats,
  extractRuoyiRows,
  mapYyOrder,
  mapYyStore,
  orderStatusValues,
  type RuoyiTableResponse,
  type YyOrderVo,
  type YyStoreVo,
} from './yingyueAdapter'
import type {
  BookingInventoryDto,
  BookingInventoryUpdatePayload,
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  ChannelSyncLogDto,
  CustomerDto,
  DouyinLifeOrderSyncQuery,
  EmployeeDto,
  NotificationLogDto,
  NotificationTemplateDto,
  OperationLogDto,
  OrderCreatePayload,
  OrderExportQuery,
  OrderDto,
  OrderListQuery,
  OrderReschedulePayload,
  OrderStatusPayload,
  ProductDto,
  ServiceGroupDto,
  StoreDto,
  WorkbenchBootstrapDto,
} from './backendTypes'
export type {
  AlbumDto,
  AlbumPhotoDto,
  BookingInventoryDto,
  BookingInventoryUpdatePayload,
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  ChannelSyncHealthDto,
  ChannelSyncLogDto,
  CustomerDto,
  CustomerPayload,
  DashboardFinanceDto,
  DouyinLifeOrderSyncQuery,
  DouyinLifeOrderSyncResult,
  EmployeeDto,
  EmployeePayload,
  MerchantDecorationConfig,
  MerchantDecorationDto,
  MerchantDecorationPayload,
  MicroFormDto,
  MicroFormFieldSchema,
  MicroFormFieldType,
  MicroFormListQuery,
  MicroFormPayload,
  MicroFormSchema,
  MicroFormSubmissionDto,
  MicroFormSubmissionFollowPayload,
  MicroFormSubmissionQuery,
  MicroPageComponentSchema,
  MicroPageComponentType,
  MicroPageDto,
  MicroPageListQuery,
  MicroPagePayload,
  MicroPageSchema,
  NotificationLogDto,
  NotificationTemplateDto,
  NotificationTemplatePayload,
  OperationLogDto,
  OrderCreatePayload,
  OrderExportQuery,
  OrderDto,
  OrderListQuery,
  OrderReschedulePayload,
  OrderStatusPayload,
  OrderStatusStatDto,
  PhotoAccessLog,
  PhotoAccessLogQuery,
  ProductDto,
  ProductPayload,
  ReportSnapshot,
  ReportSnapshotQuery,
  ScheduleItemDto,
  ScheduleRuleDto,
  SelectionLinkDto,
  SelectionStatsDto,
  ServiceGroupDto,
  StoreDto,
  StudioDto,
  TodaySlotDto,
  TrendStatDto,
  WorkOrderDto,
  WorkOrderEventDto,
  WorkOrderListQuery,
  WorkOrderTransitionPayload,
  WorkbenchBootstrapDto,
  PublicMicroFormDto,
  PublicMicroFormSubmitPayload,
  PublicMicroFormSubmitResult,
  PublicMicroPageDto,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

let cachedStores: StoreDto[] = []
let cachedProducts: ProductDto[] = []
let cachedOrders: OrderDto[] = []
let cachedLedgerOrders: OrderDto[] = []
let cachedServiceGroups: ServiceGroupDto[] = []
let cachedBookingInventory: BookingInventoryDto[] = []
let cachedEmployees: EmployeeDto[] = []
let cachedCustomers: CustomerDto[] = []
let cachedNotificationTemplates: NotificationTemplateDto[] = []
let cachedNotificationLogs: NotificationLogDto[] = []
let cachedOperationLogs: OperationLogDto[] = []
let cachedChannelSyncLogs: ChannelSyncLogDto[] = []
let cachedChannelProductMappings: ChannelProductMappingDto[] = []
let cachedDouyinAcceptanceCases: ChannelAcceptanceCaseDto[] = []

const ensureChannelProductMappingsLoaded = async (channelType = 'DOUYIN_LIFE') => {
  const normalized = String(channelType).trim()
  if (cachedChannelProductMappings.some(item => String(item.channelType ?? '').trim() === normalized)) return
  const rows = await listRows<Record<string, any>>('/yy/channelProductMapping/list', { channelType: normalized })
  cachedChannelProductMappings = rows.map(mapChannelProductMappingRow)
}

const normalizeMatchText = (value?: string | number | null) => String(value ?? '').trim()

const resolveOrderPresentation = (row: YyOrderVo) => {
  const externalSkuId = normalizeMatchText(row.externalSkuId)
  const externalPoiId = normalizeMatchText(row.externalPoiId)
  const externalProductId = normalizeMatchText(row.externalProductId)

  const skuMappings = externalSkuId
    ? cachedChannelProductMappings.filter(item => normalizeMatchText(item.externalSkuId) === externalSkuId)
    : []
  const poiMappings = externalPoiId
    ? cachedChannelProductMappings.filter(item => normalizeMatchText(item.externalPoiId) === externalPoiId)
    : []

  const mapping = skuMappings.find(item => externalPoiId && normalizeMatchText(item.externalPoiId) === externalPoiId)
    ?? skuMappings[0]
    ?? poiMappings.find(item => !normalizeMatchText(item.externalSkuId))
    ?? poiMappings[0]

  const mappedProductId = mapping ? normalizeBackendId(mapping.productId) : null
  const directProduct = cachedProducts.find(item =>
    sameId(item.id, externalProductId) || String(item.productCode ?? '').trim() === externalProductId,
  )
  const mappedProduct = mappedProductId ? cachedProducts.find(item => item.id === mappedProductId) : undefined
  const product = mappedProduct ?? directProduct

  return {
    productId: product?.id ?? mappedProductId ?? null,
    serviceNameSnapshot: product?.name
      || mapping?.externalName
      || (externalSkuId ? `抖音SKU ${externalSkuId}` : ''),
  }
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

const productsApi = createProductsApi({
  getStores: () => cachedStores,
  getProducts: () => cachedProducts,
  setProducts: items => { cachedProducts = items },
})

const masterDataApi = createMasterDataApi({
  ensureProductsLoaded: async () => {
    if (!cachedProducts.length) await backendApi.listProducts()
  },
  getCachedProducts: () => cachedProducts,
  getServiceGroups: () => cachedServiceGroups,
  setServiceGroups: items => { cachedServiceGroups = items },
  getEmployees: () => cachedEmployees,
  setEmployees: items => { cachedEmployees = items },
  getCustomers: () => cachedCustomers,
  setCustomers: items => { cachedCustomers = items },
  getNotificationTemplates: () => cachedNotificationTemplates,
  setNotificationTemplates: items => { cachedNotificationTemplates = items },
  getNotificationLogs: () => cachedNotificationLogs,
  setNotificationLogs: items => { cachedNotificationLogs = items },
})

export const backendApi = {
  getWorkbenchBootstrap: () => apiRequest<WorkbenchBootstrapDto>('/yy/studio/bootstrap'),
  ...assetsApi,
  async dashboardFinance(query: { date?: string; storeId?: BackendId } = {}) {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/finance', {}, {
      date: query.date,
      storeId: query.storeId,
    })
    return mapDashboardFinanceRow(row)
  },
  async dashboardScheduleGrid(query: { storeId?: BackendId } = {}) {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/schedule-grid', {}, {
      storeId: query.storeId,
    })
    return mapScheduleGridRow(row)
  },
  async listStores() {
    const rows = await listRows<YyStoreVo>('/yy/store/list')
    cachedStores = rows.map(mapYyStore)
    return cachedStores
  },
  ...productsApi,
  ...masterDataApi,
  async listBookingInventory(query?: { bizDate?: string; beginBizDate?: string; endBizDate?: string; storeId?: BackendId; serviceGroupId?: BackendId; conflictOnly?: string }) {
    const backendQuery = {
      bizDate: query?.bizDate,
      beginBizDate: query?.beginBizDate,
      endBizDate: query?.endBizDate,
      storeId: query?.storeId,
      serviceGroupId: query?.serviceGroupId,
      conflictOnly: query?.conflictOnly,
    }
    const rows = await listRows<Record<string, any>>('/yy/bookingSlotInventory/list', backendQuery)
    cachedBookingInventory = rows.map(mapBookingInventoryRow)
    return cachedBookingInventory
  },
  async listOperationLogs() {
    const rows = await listRows<Record<string, any>>('/monitor/operlog/list', {
      orderByColumn: 'operTime',
      isAsc: 'descending',
    })
    cachedOperationLogs = rows.map(mapOperationLogRow)
    return cachedOperationLogs
  },
  async listChannelSyncLogs() {
    const rows = await listRows<Record<string, any>>('/yy/channelSyncLog/list')
    cachedChannelSyncLogs = rows.map(mapChannelSyncLogRow)
    return cachedChannelSyncLogs
  },
  async listChannelProductMappings(query?: { channelType?: string; storeId?: BackendId }) {
    const rows = await listRows<Record<string, any>>('/yy/channelProductMapping/list', query)
    cachedChannelProductMappings = rows.map(mapChannelProductMappingRow)
    return cachedChannelProductMappings
  },
  async listDouyinAcceptanceCases() {
    const rows = await apiRequest<unknown[]>('/yy/channel/DOUYIN_LIFE/acceptance-cases')
    cachedDouyinAcceptanceCases = rows.map(row => mapChannelAcceptanceCaseRow(row as Record<string, any>))
    return cachedDouyinAcceptanceCases
  },
  async getDouyinSyncHealth() {
    const row = await apiRequest<Record<string, any>>('/yy/channel/DOUYIN_LIFE/sync-health')
    return mapChannelSyncHealthRow(row)
  },
  async syncDouyinLifeOrders(query: DouyinLifeOrderSyncQuery = {}) {
    const row = await apiRequest<Record<string, any>>('/yy/channel/DOUYIN_LIFE/orders/sync', {
      method: 'POST',
      body: JSON.stringify(mapDouyinLifeSyncQuery(query)),
    })
    return mapDouyinLifeSyncResult(row)
  },
  async updateBookingInventory(payload: BookingInventoryUpdatePayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId,
      serviceGroupId: payload.serviceGroupId ?? null,
      externalSkuId: payload.externalSkuId || '',
      bizDate: payload.bizDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      capacity: payload.capacity,
      status: payload.status,
      remark: payload.remark || '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/bookingSlotInventory', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapBookingInventoryRow({
      ...cachedBookingInventory.find(item => item.id === payload.id),
      ...body,
    })
    cachedBookingInventory = cachedBookingInventory.map(item => (item.id === updated.id ? updated : item))
    return updated
  },
  async listProductSpecOptions() {
    if (!cachedProducts.length) await this.listProducts()
    return Array.from(new Set(cachedProducts.map(product => product.spec).filter(Boolean)))
  },
  async listTodayOrders() {
    const page = await this.listOrders(buildTodayArrivalOrderQuery())
    cachedOrders = page.items
    return page
  },
  async listAllOrders() {
    const page = await this.listOrders(buildAllOrdersQuery())
    cachedLedgerOrders = page.items
    return page
  },
  async listOrders(query: OrderListQuery = {}) {
    try {
      await ensureChannelProductMappingsLoaded('DOUYIN_LIFE')
    } catch {
      // Order list should still render even if mapping metadata is temporarily unavailable.
    }
    const rows = await listRows<YyOrderVo>('/yy/order/list', mapOrderListQuery(query as OrderListQueryWithRouteSlot))
    const orders = rows.map(row => mapYyOrder(row, cachedProducts, resolveOrderPresentation(row)))
    return {
      items: orders,
      page: 1,
      pageSize: orders.length,
      total: orders.length,
    } satisfies PageResponse<OrderDto>
  },
  async exportOrders(query: OrderExportQuery): Promise<BlobResponse> {
    const body = toFormBody(mapOrderExportQuery(query))
    return apiRequestBlob('/yy/order/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  },
  ...createAlbumsApi({ getCachedOrders: () => cachedOrders }),
  async listStudios() {
    return buildStudiosFromStores(cachedStores)
  },
  listSchedules: (query: { date?: string; storeId?: BackendId }) =>
    Promise.resolve(
      buildScheduleItemsFromOrders(
        cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders,
        query.date,
        query.storeId,
      ),
    ),
  orderStatusStats: (query: { date?: string; storeId?: BackendId }) => {
    const ledger = cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders
    return Promise.resolve(
      buildOrderStatusStats(
        ledger.filter(order =>
          (!query.storeId || order.storeId === query.storeId)
          && (!query.date || order.arrivalAt.slice(0, 10) === query.date),
        ),
      ),
    )
  },
  trendStats: (query: { endDate?: string; days?: number; storeId?: BackendId }) => {
    const ledger = cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders
    return Promise.resolve(
      buildTrendStats(
        ledger.filter(order => !query.storeId || order.storeId === query.storeId),
        query.endDate || new Date().toISOString().slice(0, 10),
        query.days || 20,
      ),
    )
  },
  todaySlots: (query: { date?: string; storeId?: BackendId }) =>
    Promise.resolve(
      buildTodaySlots(
        (cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders).filter(order =>
          !query.storeId || order.storeId === query.storeId,
        ),
        query.date || new Date().toISOString().slice(0, 10),
      ),
    ),
  async createOrder(payload: OrderCreatePayload) {
    const body = {
      storeId: payload.storeId,
      serviceGroupId: payload.serviceGroupId,
      productId: payload.productId ?? null,
      customerId: payload.customerId ?? null,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      gender: payload.gender,
      email: payload.email,
      arrivalTime: payload.arrivalAt.replace('T', ' '),
      scheduleMode: payload.scheduleMode || 'SCHEDULED',
      slotDate: payload.slotDate,
      slotStartTime: payload.slotStartTime,
      slotEndTime: payload.slotEndTime,
      notifyEnabled: payload.notifyEnabled ?? false,
      submitMode: payload.submitMode || 'SAVE',
      status: payload.status || 'PENDING',
      payStatus: payload.payStatus || 'UNPAID',
      workstationNo: payload.studioId ? String(payload.studioId) : '',
      remark: payload.remark || '',
    }
    const row = await apiRequest<YyOrderVo>('/yy/order/staff-booking', { method: 'POST', body: JSON.stringify(body) })
    const order = mapYyOrder(row, cachedProducts, resolveOrderPresentation(row))
    cachedOrders = [order, ...cachedOrders]
    return order
  },
  async updateOrderStatus(payload: OrderStatusPayload) {
    const current = cachedOrders.find(order => order.id === payload.id)
      ?? cachedLedgerOrders.find(order => order.id === payload.id)
    const status = orderStatusValues[payload.status] ?? payload.status
    const expectedStatus = orderStatusValues[payload.expectedStatus || current?.status || '']
      ?? payload.expectedStatus
      ?? current?.status
    if (!expectedStatus) throw new Error('未找到订单状态')
    const remark = payload.remark
    const body = {
      expectedStatus,
      targetStatus: status,
      remark: remark?.trim() || `工作台状态流转：${payload.expectedStatus || current?.status || '未知'} -> ${payload.status}`,
    }
    const response = await apiRequest<YyOrderVo>(`/yy/order/${payload.id}/transition`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const next = mapYyOrder(response, cachedProducts, resolveOrderPresentation(response))
    cachedOrders = cachedOrders.map(order => (order.id === payload.id ? next : order))
    cachedLedgerOrders = cachedLedgerOrders.map(order => (order.id === payload.id ? next : order))
    return next
  },
  async rescheduleOrder(payload: OrderReschedulePayload) {
    const expectedStatus = orderStatusValues[payload.expectedStatus] ?? payload.expectedStatus
    const body = {
      expectedStatus,
      arrivalTime: payload.arrivalTime,
      serviceGroupId: payload.serviceGroupId ?? null,
      slotDate: payload.slotDate,
      slotStartTime: payload.slotStartTime,
      slotEndTime: payload.slotEndTime,
      remark: payload.remark || '工作台订单改期',
    }
    const response = await apiRequest<YyOrderVo>(`/yy/order/${payload.id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const next = mapYyOrder(response, cachedProducts, resolveOrderPresentation(response))
    cachedOrders = cachedOrders.map(order => (order.id === payload.id ? next : order))
    cachedLedgerOrders = cachedLedgerOrders.map(order => (order.id === payload.id ? next : order))
    return next
  },
  ...workOrdersApi,
  ...reportsApi,
  ...scheduleRulesApi,
  ...merchantContentApi,
}

export { getApiAssetUrl } from './request'
export type { PhotoAlbumActionDto, PhotoAlbumActionPayload } from './backendAlbumsApi'
export { buildAllOrdersQuery } from './backendQueryMappers'
export {
  defaultMerchantDecorationConfig,
  defaultMicroFormSchema,
  defaultMicroPageSchema,
} from './backendMerchantContentApi'
