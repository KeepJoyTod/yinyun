import { describe, expect, it } from 'vitest'
import backendAlbumsApiSource from './backendAlbumsApi.ts?raw'
import backendAssetsApiSource from './backendAssetsApi.ts?raw'
import backendSource from './backend.ts?raw'
import backendMasterDataApiSource from './backendMasterDataApi.ts?raw'
import backendMerchantContentApiSource from './backendMerchantContentApi.ts?raw'
import backendProductsApiSource from './backendProductsApi.ts?raw'
import backendQueryMappersSource from './backendQueryMappers.ts?raw'
import backendReportsApiSource from './backendReportsApi.ts?raw'
import backendRowMappersSource from './backendRowMappers.ts?raw'
import backendScheduleRulesApiSource from './backendScheduleRulesApi.ts?raw'
import backendTypesSource from './backendTypes.ts?raw'
import backendTypesCoreSource from './backendTypesCore.ts?raw'
import backendTypesMerchantSource from './backendTypesMerchant.ts?raw'
import backendTypesPayloadsSource from './backendTypesPayloads.ts?raw'
import backendWorkOrdersApiSource from './backendWorkOrdersApi.ts?raw'

const backendContractSource = `${backendSource}\n${backendAlbumsApiSource}\n${backendAssetsApiSource}\n${backendMasterDataApiSource}\n${backendMerchantContentApiSource}\n${backendProductsApiSource}\n${backendReportsApiSource}\n${backendScheduleRulesApiSource}\n${backendWorkOrdersApiSource}\n${backendQueryMappersSource}\n${backendRowMappersSource}`
const backendTypesContractSource = `${backendTypesSource}\n${backendTypesCoreSource}\n${backendTypesPayloadsSource}\n${backendTypesMerchantSource}`
const backendTypesNormalized = backendTypesContractSource.replace(/\r\n/g, '\n')

describe('studio backend api contract', () => {
  it('keeps snowflake identifiers as strings at the api boundary', () => {
    expect(backendContractSource).toContain('normalizeBackendId')
    expect(backendContractSource).toContain('optionalBackendId')
    expect(backendSource).toContain("from './backendTypes'")
    expect(backendTypesNormalized).toContain('export type OrderDto = {\n  id: BackendId')
    expect(backendTypesNormalized).toContain('export type AlbumDto = {\n  id: BackendId')
    expect(backendContractSource).toContain('id: normalizeBackendId(row.id)')
    expect(backendContractSource).toContain('storeId: normalizeBackendId(row.storeId)')
  })

  it('keeps slotDate and slotStartTime on orders so Douyin appointments can render daily schedules', () => {
    expect(backendTypesContractSource).toContain('slotDate?: string')
    expect(backendTypesContractSource).toContain('slotStartTime?: string')
    expect(backendTypesContractSource).toContain('slotEndTime?: string')
    expect(backendSource).toContain('resolveOrderPresentation')
    expect(backendSource).toContain('mapYyOrder(row, cachedProducts, resolveOrderPresentation(row))')
  })

  it('loads the authenticated studio bootstrap contract', () => {
    expect(backendSource).toContain('getWorkbenchBootstrap')
    expect(backendSource).toContain("'/yy/studio/bootstrap'")
    expect(backendSource).toContain('WorkbenchBootstrapDto')
  })

  it('keeps dashboard order status stats scoped to the selected date', () => {
    expect(backendSource).toContain('orderStatusStats: (query: { date?: string; storeId?: BackendId })')
    expect(backendSource).toContain('buildOrderStatusStats')
    expect(backendSource).toContain('cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders')
  })

  it('exposes the authoritative dashboard finance endpoint', () => {
    expect(backendTypesContractSource).toContain('export type DashboardFinanceDto')
    expect(backendTypesContractSource).toContain('actualIncomeCent: number')
    expect(backendTypesContractSource).toContain('expectedIncomeCent: number')
    expect(backendSource).toContain('async dashboardFinance(query: { date?: string; storeId?: BackendId } = {})')
    expect(backendSource).toContain("apiRequest<Record<string, any>>('/yy/dashboard/finance'")
    expect(backendSource).toContain('mapDashboardFinanceRow(row)')
  })

  it('builds schedules from the 30-day ledger cache when available', () => {
    expect(backendSource).toContain('listSchedules: (query: { date?: string; storeId?: BackendId }) =>')
    expect(backendSource).toContain('buildScheduleItemsFromOrders(')
    expect(backendSource).toContain('cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders')
    expect(backendSource).toContain('buildOrderStatusStats')
  })

  it('loads staff orders with a bounded today-arrival query instead of a 1000 row dump', () => {
    expect(backendTypesContractSource).toContain('export type OrderListQuery')
    expect(backendSource).toContain('async listTodayOrders()')
    expect(backendSource).toContain('async listAllOrders()')
    expect(backendSource).toContain('async listOrders(query: OrderListQuery = {})')
    expect(backendSource).toContain('mapOrderListQuery(query as OrderListQueryWithRouteSlot)')
    expect(backendSource).toContain('buildTodayArrivalOrderQuery')
    expect(backendSource).toContain('buildAllOrdersQuery')
    expect(backendContractSource).toContain('beginArrivalTime')
    expect(backendContractSource).toContain('endArrivalTime')
    expect(backendContractSource).toContain('pageSize: 100')
    expect(backendContractSource).toContain('pageSize: 5000')
    expect(backendContractSource).toContain("source: 'DOUYIN_LIFE'")
    expect(backendContractSource).toContain('beginOrderTime')
    expect(backendContractSource).toContain('endOrderTime')
    expect(backendSource).not.toContain('pageSize: 1000')
  })

  it('maps readable slot route params to backend slot query fields', () => {
    expect(backendTypesContractSource).toContain('slotDate?: string')
    expect(backendTypesContractSource).toContain('slotStartTime?: string')
    expect(backendTypesContractSource).toContain('slotEndTime?: string')
    expect(backendContractSource).toContain('type OrderListQueryWithRouteSlot = OrderListQuery & { slotStart?: string; slotEnd?: string }')
    expect(backendContractSource).toContain('slotDate: query.slotDate')
    expect(backendContractSource).toContain('slotStartTime: query.slotStartTime || query.slotStart')
    expect(backendContractSource).toContain('slotEndTime: query.slotEndTime || query.slotEnd')
  })

  it('exports staff orders through the authoritative RuoYi Excel endpoint', () => {
    expect(backendTypesContractSource).toContain('export type OrderExportQuery')
    expect(backendSource).toContain('async exportOrders(query: OrderExportQuery)')
    expect(backendSource).toContain("apiRequestBlob('/yy/order/export'")
    expect(backendSource).toContain('mapOrderExportQuery(query)')
    expect(backendSource).toContain("method: 'POST'")
    expect(backendTypesContractSource).toContain('keyword?: string')
    expect(backendTypesContractSource).toContain('bookingMethod?: string')
    expect(backendContractSource).toContain('keyword: query.keyword')
    expect(backendContractSource).toContain('bookingMethod: query.bookingMethod')
  })

  it('uses the dedicated staff order transition endpoint with expected status', () => {
    expect(backendSource).toContain('/transition')
    expect(backendSource).toContain('expectedStatus')
    expect(backendSource).toContain('targetStatus')
    expect(backendSource).not.toContain("apiRequestRaw<RuoyiResponse<void>>('/yy/order', { method: 'PUT', body: JSON.stringify(body) })")
  })

  it('can transition and reschedule orders loaded from the 30-day ledger cache', () => {
    const transitionBlock = backendSource.slice(
      backendSource.indexOf('async updateOrderStatus'),
      backendSource.indexOf('async rescheduleOrder'),
    )
    expect(transitionBlock).toContain('cachedOrders.find(order => order.id === payload.id)')
    expect(transitionBlock).toContain('?? cachedLedgerOrders.find(order => order.id === payload.id)')
    expect(transitionBlock).toContain('payload.expectedStatus || current?.status')
    expect(transitionBlock).toContain('`/yy/order/${payload.id}/transition`')
    expect(transitionBlock).toContain('cachedLedgerOrders = cachedLedgerOrders.map(order => (order.id === payload.id ? next : order))')

    const rescheduleBlock = backendSource.slice(
      backendSource.indexOf('async rescheduleOrder'),
      backendSource.indexOf('...workOrdersApi'),
    )
    expect(rescheduleBlock).toContain('cachedLedgerOrders = cachedLedgerOrders.map(order => (order.id === payload.id ? next : order))')
  })

  it('uses the dedicated staff order reschedule endpoint with expected status', () => {
    expect(backendSource).toContain('rescheduleOrder')
    expect(backendSource).toContain('/reschedule')
    expect(backendSource).toContain('arrivalTime')
    expect(backendSource).toContain('slotDate')
    expect(backendSource).toContain('slotStartTime')
    expect(backendSource).toContain('slotEndTime')
  })

  it('creates staff manual bookings through the dedicated inventory-aware endpoint', () => {
    expect(backendTypesContractSource).toContain('serviceGroupId: BackendId')
    expect(backendTypesContractSource).toContain('customerId?: BackendId | null')
    expect(backendTypesContractSource).toContain('gender?: string')
    expect(backendTypesContractSource).toContain('email?: string')
    expect(backendTypesContractSource).toContain("scheduleMode?: 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE'")
    expect(backendTypesContractSource).toContain("submitMode?: 'SAVE' | 'SAVE_AND_RECEIVE'")
    expect(backendTypesContractSource).toContain('notifyEnabled?: boolean')
    expect(backendTypesContractSource).toContain('slotDate: string')
    expect(backendTypesContractSource).toContain('slotStartTime: string')
    expect(backendTypesContractSource).toContain('slotEndTime: string')
    expect(backendTypesContractSource).toContain('payStatus?: string')
    expect(backendTypesContractSource).toContain('status?: string')
    expect(backendSource).toContain("'/yy/order/staff-booking'")
    expect(backendSource).toContain('serviceGroupId: payload.serviceGroupId')
    expect(backendSource).toContain('productId: payload.productId ?? null')
    expect(backendSource).toContain('customerId: payload.customerId ?? null')
    expect(backendSource).toContain('gender: payload.gender')
    expect(backendSource).toContain('email: payload.email')
    expect(backendSource).toContain("scheduleMode: payload.scheduleMode || 'SCHEDULED'")
    expect(backendSource).toContain("submitMode: payload.submitMode || 'SAVE'")
    expect(backendSource).toContain('notifyEnabled: payload.notifyEnabled ?? false')
    expect(backendSource).toContain('slotDate: payload.slotDate')
    expect(backendSource).toContain('slotStartTime: payload.slotStartTime')
    expect(backendSource).toContain('slotEndTime: payload.slotEndTime')
    expect(backendSource).toContain("payStatus: payload.payStatus || 'UNPAID'")
    expect(backendSource).not.toContain("apiRequestRaw<RuoyiResponse<void>>('/yy/order', { method: 'POST'")
  })

  it('prewires work order backend facade without switching the staff page data source', () => {
    expect(backendTypesNormalized).toContain('export type WorkOrderDto = {\n  id: BackendId')
    expect(backendTypesNormalized).toContain('export type WorkOrderEventDto = {\n  id: BackendId')
    expect(backendTypesContractSource).toContain('export type WorkOrderTransitionPayload')
    expect(backendSource).toContain('...workOrdersApi')
    expect(backendContractSource).toContain('async listWorkOrders(query: WorkOrderListQuery = {})')
    expect(backendContractSource).toContain("'/yy/workOrder/list'")
    expect(backendContractSource).toContain('async getWorkOrder(id: BackendId)')
    expect(backendContractSource).toContain('`/yy/workOrder/${id}`')
    expect(backendContractSource).toContain('async listWorkOrderEvents(id: BackendId)')
    expect(backendContractSource).toContain('`/yy/workOrder/${id}/events`')
    expect(backendContractSource).toContain('async transitionWorkOrder(payload: WorkOrderTransitionPayload)')
    expect(backendContractSource).toContain('`/yy/workOrder/${payload.id}/transition`')
    expect(backendContractSource).toContain('mapWorkOrderRow')
    expect(backendContractSource).toContain('mapWorkOrderEventRow')
  })

  it('exposes merchant service groups and booking inventory apis', () => {
    expect(backendSource).toContain('...masterDataApi')
    expect(backendContractSource).toContain('listServiceGroups')
    expect(backendContractSource).toContain("'/yy/serviceGroup/list'")
    expect(backendSource).toContain('listBookingInventory')
    expect(backendSource).toContain("'/yy/bookingSlotInventory/list'")
    expect(backendSource).toContain('updateBookingInventory')
    expect(backendSource).toContain('serviceGroupId: query?.serviceGroupId')
  })

  it('persists album photo selection state through yy_photo_asset updates', () => {
    expect(backendSource).toContain('...createAlbumsApi')
    expect(backendContractSource).toContain('markAlbumPhotosSelected')
    expect(backendContractSource).toContain('isSelected: item.selected ?')
    expect(backendContractSource).toContain('/yy/photoAsset/${item.photoId}')
    expect(backendContractSource).toContain("method: 'PUT'")
  })

  it('refreshes authoritative album detail after photo delivery actions instead of reusing stale list cache', () => {
    const getAlbumBlock = backendAlbumsApiSource.slice(
      backendAlbumsApiSource.indexOf('async getAlbum(id: BackendId)'),
      backendAlbumsApiSource.indexOf('confirmAlbumSelection:'),
    )
    expect(getAlbumBlock).toContain('await getData<YyPhotoAlbumVo>(`/yy/photoAlbum/${id}`)')
    expect(getAlbumBlock).toContain('const sourceIndex = cachedAlbumSources.findIndex')
    expect(getAlbumBlock).toContain('cachedAlbumSources = [source, ...cachedAlbumSources]')
    expect(getAlbumBlock).toContain('cachedAlbumSources[sourceIndex] = source')
    expect(getAlbumBlock).not.toContain('cachedAlbumSources.find(album => sameId(album.id, id)) ??')
  })

  it('exposes reusable OSS upload for product card covers', () => {
    expect(backendSource).toContain('...assetsApi')
    expect(backendContractSource).toContain('async uploadOssFile(file: File)')
    expect(backendContractSource).toContain("apiRequestRaw<RuoyiResponse<OssUploadData>>('/resource/oss/upload'")
    expect(backendContractSource).toContain('return oss.url || uploadResponse.data?.url || getApiAssetUrl(`/resource/oss/${currentOssId}`)')
  })

  it('exposes employee and customer management apis', () => {
    expect(backendContractSource).toContain('listEmployees')
    expect(backendContractSource).toContain("'/yy/employee/list'")
    expect(backendContractSource).toContain('listCustomers')
    expect(backendContractSource).toContain("'/yy/customer/list'")
    expect(backendContractSource).toContain('listCustomerRecentOrders')
    expect(backendContractSource).toContain('/orders')
  })

  it('exposes notification template and log apis', () => {
    expect(backendContractSource).toContain('listNotificationTemplates')
    expect(backendContractSource).toContain("'/yy/notificationTemplate/list'")
    expect(backendContractSource).toContain('listNotificationLogs')
    expect(backendContractSource).toContain("'/yy/notificationLog/list'")
    expect(backendContractSource).toContain('updateNotificationTemplate')
  })

  it('reloads authoritative records after create instead of synthesizing database ids', () => {
    const createBlocks = [
      ['async createServiceGroup', 'async updateServiceGroup'],
      ['async createEmployee', 'async updateEmployee'],
      ['async createCustomer', 'async updateCustomer'],
      ['async createNotificationTemplate', 'async updateNotificationTemplate'],
      ['async createProduct', 'async updateProduct'],
    ] as const

    for (const [start, end] of createBlocks) {
      const block = backendContractSource.slice(backendContractSource.indexOf(start), backendContractSource.indexOf(end))
      expect(block).toContain('findCreatedRecord')
      expect(block).not.toContain('Date.now()')
    }
    const orderCreateBlock = backendSource.slice(
      backendSource.indexOf('async createOrder'),
      backendSource.indexOf('async updateOrderStatus'),
    )
    expect(orderCreateBlock).toContain("apiRequest<YyOrderVo>('/yy/order/staff-booking'")
    expect(orderCreateBlock).not.toContain('Date.now()')
    expect(backendContractSource).toContain('const findCreatedRecord')
    expect(backendContractSource).toContain('服务端未返回新建')
  })

  it('exposes Douyin Life product mapping and acceptance diagnostics apis', () => {
    expect(backendSource).toContain('listChannelProductMappings')
    expect(backendSource).toContain("'/yy/channelProductMapping/list'")
    expect(backendSource).toContain('listDouyinAcceptanceCases')
    expect(backendSource).toContain("'/yy/channel/DOUYIN_LIFE/acceptance-cases'")
    expect(backendSource).toContain('getDouyinSyncHealth')
    expect(backendSource).toContain("'/yy/channel/DOUYIN_LIFE/sync-health'")
  })

  it('exposes the real Douyin Life order sync endpoint for staff refresh flows', () => {
    expect(backendTypesContractSource).toContain('export type DouyinLifeOrderSyncQuery')
    expect(backendTypesContractSource).toContain('export type DouyinLifeOrderSyncResult')
    expect(backendSource).toContain('async syncDouyinLifeOrders(query: DouyinLifeOrderSyncQuery = {})')
    expect(backendSource).toContain("'/yy/channel/DOUYIN_LIFE/orders/sync'")
    expect(backendSource).toContain("method: 'POST'")
    expect(backendSource).toContain('mapDouyinLifeSyncQuery(query)')
    expect(backendSource).toContain('mapDouyinLifeSyncResult(row)')
    expect(backendContractSource).toContain('maxPages: query.maxPages ?? 2')
    expect(backendContractSource).toContain('maxTotal: query.maxTotal ?? 80')
  })

  it('exposes micro-form submission detail for safe manual booking conversion', () => {
    expect(backendContractSource).toContain('const mapMicroFormSubmissionRow')
    expect(backendSource).toContain('...merchantContentApi')
    expect(backendContractSource).toContain('async getMicroFormSubmission(id: BackendId)')
    expect(backendContractSource).toContain('`/yy/microFormSubmission/${id}`')
    expect(backendContractSource).toContain('mapMicroFormSubmissionRow(row)')
    expect(backendContractSource).toContain('async updateMicroFormSubmissionFollow')
  })
})

