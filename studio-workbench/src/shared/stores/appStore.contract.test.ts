import { describe, expect, it } from 'vitest'
import albumsStoreSource from './albumsStore.ts?raw'
import appStoreSource from './appStore.ts?raw'
import appStoreTransformsSource from './appStoreTransforms.ts?raw'
import appStoreTypesSource from './appStoreTypes.ts?raw'
import channelStoreSource from './channelStore.ts?raw'
import customersStoreSource from './customersStore.ts?raw'
import operationLogStoreSource from './operationLogStore.ts?raw'
import orderActionStoreSource from './orderActionStore.ts?raw'
import productStoreSource from './productStore.ts?raw'
import productStoreTransformsSource from './productStoreTransforms.ts?raw'
import settingsStoreSource from './settingsStore.ts?raw'
import workbenchFacadeStoreSource from './workbenchFacadeStore.ts?raw'
import workbenchLifecycleStoreSource from './workbenchLifecycleStore.ts?raw'
import workbenchOperationalStoreSource from './workbenchOperationalStore.ts?raw'

const appStoreContractSource = [
  albumsStoreSource,
  appStoreSource,
  channelStoreSource,
  customersStoreSource,
  operationLogStoreSource,
  orderActionStoreSource,
  productStoreSource,
  productStoreTransformsSource,
  settingsStoreSource,
  workbenchFacadeStoreSource,
  workbenchLifecycleStoreSource,
  workbenchOperationalStoreSource,
].join('\n')

describe('appStore runtime contract', () => {
  it('stores backend identifiers as strings', () => {
    expect(appStoreTypesSource).toContain("type { BackendId }")
    expect(appStoreTypesSource).toContain('backendId: BackendId')
    expect(appStoreTypesSource).toContain('storeBackendId: BackendId')
    expect(appStoreTypesSource).not.toContain('backendId: number')
    expect(appStoreSource).toContain("from './appStoreTypes'")
  })

  it('leaves demo mode after real API core data is loaded', () => {
    const refreshCoreDataBlock = workbenchLifecycleStoreSource.slice(
      workbenchLifecycleStoreSource.indexOf('export const refreshCoreDataAction'),
      workbenchLifecycleStoreSource.indexOf('export const bootstrapAction'),
    )
    expect(refreshCoreDataBlock).toContain('ctx.demoMode = false')
    expect(refreshCoreDataBlock).toContain("ctx.apiError = ''")
    expect(refreshCoreDataBlock).toContain('const stores = await backendApi.listStores()')
    expect(refreshCoreDataBlock).toContain('const visibleStores = stores.filter(isVisibleWorkbenchStore)')
    expect(refreshCoreDataBlock).toContain('assertMinimumStoreCount(visibleStores.length)')
    expect(refreshCoreDataBlock).toContain('backendApi.listTodayOrders')
    expect(refreshCoreDataBlock).not.toContain('backendApi.listOrders()')
  })

  it('keeps real api mode store data authoritative and configurable', () => {
    expect(workbenchLifecycleStoreSource).toContain('VITE_STUDIO_EXPECTED_STORE_COUNT')
    expect(workbenchLifecycleStoreSource).toContain('VITE_STUDIO_MIN_STORE_COUNT')
    expect(workbenchLifecycleStoreSource).toContain('isVisibleWorkbenchStore')
    expect(workbenchLifecycleStoreSource).toContain("name.includes('默认门店')")
    expect(workbenchLifecycleStoreSource).toContain('真实门店数据不足')
    expect(workbenchLifecycleStoreSource).toContain('至少需要')
    expect(workbenchLifecycleStoreSource).toContain('请检查 /yy/store/list、账号权限或租户门店数据')
    expect(workbenchLifecycleStoreSource).toContain('const expected = expectedStoreCount()')
  })

  it('keeps report order data separate from today operations data', () => {
    expect(appStoreSource).toContain('ledgerOrders: [] as BookingOrder[]')
    expect(appStoreSource).toContain('reportOrders: [] as BookingOrder[]')
    expect(appStoreSource).toContain('reportSnapshots: [] as ReportSnapshotInfo[]')
    expect(appStoreSource).toContain('async loadReportOrders')
    expect(appStoreSource).toContain('async loadReportSnapshots')
    expect(appStoreSource).toContain('async ensureCustomersLoaded')
    expect(appStoreSource).toContain('async ensureEmployeesLoaded')
    expect(appStoreSource).toContain('async ensureReportDataLoaded')
    expect(appStoreSource).toContain('async loadReportOrders(query: OperationalOrderListQuery = currentMonthOrderQuery())')
    expect(appStoreSource).toContain('return loadReportOrdersAction(this, query)')
    expect(appStoreSource).toContain('return loadReportSnapshotsAction(this, reportType)')
    expect(workbenchOperationalStoreSource).toContain('backendApi.listOrders(query)')
    expect(workbenchOperationalStoreSource).toContain('backendApi.listReportSnapshots')
    expect(workbenchOperationalStoreSource).toContain('ctx.reportOrders = ordersPage.items.map')
    expect(appStoreTypesSource).toContain('export type ReportSnapshotInfo')
  })

  it('can load all locally synchronized orders for the appointment all view', () => {
    expect(appStoreSource).toContain('async loadAllOrders()')
    expect(appStoreSource).toContain('return loadAllOrdersAction(this)')
    expect(workbenchOperationalStoreSource).toContain('backendApi.listAllOrders()')
    expect(workbenchOperationalStoreSource).toContain('ctx.ledgerOrders = ordersPage.items.map')
    expect(workbenchOperationalStoreSource).toContain('ctx.reportOrders = ctx.ledgerOrders')
  })

  it('creates staff bookings with service group and slot metadata then refreshes schedule and inventory', () => {
    const block = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export type StaffOrderCreateInput'),
      orderActionStoreSource.indexOf('export async function updateOrderStatusAction'),
    )
    expect(block).toContain('serviceGroupId?: BackendId')
    expect(block).toContain('productId?: BackendId | null')
    expect(block).toContain('customerId?: BackendId | null')
    expect(block).toContain('gender?: string')
    expect(block).toContain('email?: string')
    expect(block).toContain("scheduleMode?: 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE'")
    expect(block).toContain("submitMode?: 'SAVE' | 'SAVE_AND_RECEIVE'")
    expect(block).toContain('notifyEnabled?: boolean')
    expect(block).toContain('durationMinutes?: number')
    expect(block).toContain('slotDate')
    expect(block).toContain('slotStartTime')
    expect(block).toContain('slotEndTime')
    expect(block).toContain('serviceGroup.backendId')
    expect(block).toContain('backendApi.createOrder')
    expect(block).toContain('serviceGroupId: serviceGroup.backendId')
    expect(block).toContain('productId: input.productId ?? product?.backendId ?? null')
    expect(block).toContain('customerId: input.customerId ?? null')
    expect(block).toContain('gender: input.gender')
    expect(block).toContain('email: input.email')
    expect(block).toContain("scheduleMode: input.scheduleMode ?? 'SCHEDULED'")
    expect(block).toContain("submitMode: input.submitMode ?? 'SAVE'")
    expect(block).toContain('notifyEnabled: input.notifyEnabled ?? false')
    expect(block).toContain("payStatus: input.payStatus ?? 'UNPAID'")
    expect(block).toContain("status: input.status ?? 'PENDING'")
    expect(block).toContain('await ctx.refreshOrderOperationalScope(order)')
    expect(block).not.toContain('this.refreshCoreData()')
    expect(appStoreSource).toContain('async createOrder(input: StaffOrderCreateInput)')
    expect(appStoreSource).toContain('return createOrderAction(this, input)')
  })

  it('refreshes only order operational scope after staff booking instead of full core data', () => {
    const block = workbenchOperationalStoreSource.slice(
      workbenchOperationalStoreSource.indexOf('export async function refreshOrderOperationalScopeAction'),
      workbenchOperationalStoreSource.indexOf('export async function loadScheduleAction'),
    )
    expect(appStoreSource).toContain('return refreshOrderOperationalScopeAction(this, order)')
    expect(block).toContain('loadScheduleAction(ctx, refreshDate, storeName, order.storeBackendId)')
    expect(block).toContain('loadBookingInventoryAction(ctx, { date: refreshDate, storeBackendId: order.storeBackendId })')
    expect(block).toContain('loadDashboardStatsAction(ctx, refreshDate, order.storeBackendId)')
    expect(block).toContain('loadTodayOrdersAction(ctx)')
    expect(block).toContain('loadAllOrdersAction(ctx)')
    expect(block).toContain('ctx.loadOperationLogs()')
  })

  it('uploads product card cover images through real OSS instead of local object URLs', () => {
    const block = appStoreSource.slice(appStoreSource.indexOf('async uploadProductCover'), appStoreSource.indexOf('async uploadAlbumPhotos'))
    expect(block).toContain('if (this.demoMode)')
    expect(block).toContain('productStore.uploadProductCover(file)')
    expect(productStoreSource).toContain('backendApi.uploadOssFile(file)')
  })

  it('passes selected store scope into dashboard finance aggregation', () => {
    const block = workbenchOperationalStoreSource.slice(
      workbenchOperationalStoreSource.indexOf('export async function loadDashboardStatsAction'),
      workbenchOperationalStoreSource.indexOf('export async function refreshOrderOperationalScopeAction'),
    )
    expect(appStoreSource).toContain('async loadDashboardStats(date = todayKey(), storeBackendId?: BackendId)')
    expect(appStoreSource).toContain('return loadDashboardStatsAction(this, date, storeBackendId)')
    expect(block).toContain('backendApi.orderStatusStats({ date, storeId: storeBackendId })')
    expect(block).toContain('backendApi.trendStats({ endDate: date, days: 20, storeId: storeBackendId })')
    expect(block).toContain('backendApi.todaySlots({ date, storeId: storeBackendId })')
    expect(block).toContain('loadDashboardFinanceAction(ctx, date, storeBackendId)')
  })

  it('can load schedule by store backend id before store metadata is fully resolved', () => {
    const block = workbenchOperationalStoreSource.slice(
      workbenchOperationalStoreSource.indexOf('export async function loadScheduleAction'),
      workbenchOperationalStoreSource.length,
    )
    expect(appStoreSource).toContain('async loadSchedule(date = todayKey(), storeName = \'全部门店\', storeBackendId?: BackendId)')
    expect(block).toContain('export async function loadScheduleAction')
    expect(appStoreSource).toContain('return loadScheduleAction(this, date, storeName, storeBackendId)')
    expect(block).toContain('const scheduleLoadSeq = ++ctx.scheduleLoadSeq')
    expect(block).toContain('const resolvedStoreId = storeBackendId ?? (storeName === \'全部门店\' ? undefined : store?.backendId)')
    expect(block).toContain('storeId: resolvedStoreId')
    expect(block).toContain('backendApi.listOrders({')
    expect(block).toContain('slotDate: date')
    expect(block).toContain('if (scheduleLoadSeq !== ctx.scheduleLoadSeq) return')
    expect(block).not.toContain('this.reportOrders = scheduleOrders.map(order => mapOrder(order, this.stores))')
    expect(block).toContain('buildScheduleItemsFromOrders(scheduleOrders, date, resolvedStoreId)')
    expect(block).toContain('item.startAt.startsWith(date) && (!storeBackendId || item.storeId === storeBackendId)')
  })

  it('does not let bootstrap prefetch the default today schedule over route-scoped schedules', () => {
    const block = workbenchLifecycleStoreSource.slice(workbenchLifecycleStoreSource.indexOf('export const bootstrapAction'), workbenchLifecycleStoreSource.length)
    expect(block).toContain('await ctx.refreshCoreData()')
    expect(block).toContain('ctx.loadStudios()')
    expect(block).toContain('ctx.loadDashboardStats(todayKey())')
    expect(block).not.toContain('ctx.loadSchedule(todayKey())')
  })

  it('refreshes schedule, inventory and dashboard finance after appointment status changes', () => {
    expect(appStoreSource).toContain('async refreshOrderOperationalScope(order: BookingOrder)')
    expect(appStoreSource).toContain('return refreshOrderOperationalScopeAction(this, order)')
    expect(workbenchOperationalStoreSource).toContain('const refreshDate = getOrderOperationalDate(order) || todayKey()')
    expect(workbenchOperationalStoreSource).toContain('loadScheduleAction(ctx, refreshDate, storeName, order.storeBackendId)')
    expect(workbenchOperationalStoreSource).toContain('loadBookingInventoryAction(ctx, { date: refreshDate, storeBackendId: order.storeBackendId })')
    expect(workbenchOperationalStoreSource).toContain('loadDashboardStatsAction(ctx, refreshDate, order.storeBackendId)')
    expect(workbenchOperationalStoreSource).toContain('loadTodayOrdersAction(ctx)')
    expect(workbenchOperationalStoreSource).toContain('loadAllOrdersAction(ctx)')
    expect(workbenchOperationalStoreSource).toContain('ctx.loadOperationLogs()')
    const updateBlock = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export async function updateOrderStatusAction'),
      orderActionStoreSource.indexOf('export async function rescheduleOrderAction'),
    )
    expect(updateBlock).toContain('void ctx.refreshOrderOperationalScope(next)')
    expect(updateBlock).toContain('expectedStatus: originalStatus')
    expect(updateBlock).not.toContain('await Promise.all([this.loadSchedule(next.arrivalDate), this.loadDashboardStats(next.arrivalDate)]')
    expect(appStoreSource).toContain('return updateOrderStatusAction(this, orderId, status, remark)')
  })

  it('does not block order status actions on slow operational scope refreshes', () => {
    const updateBlock = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export async function updateOrderStatusAction'),
      orderActionStoreSource.indexOf('export async function rescheduleOrderAction'),
    )
    const refreshIndex = updateBlock.indexOf('void ctx.refreshOrderOperationalScope(next)')
    const returnIndex = updateBlock.indexOf('return next')
    expect(refreshIndex).toBeGreaterThan(-1)
    expect(returnIndex).toBeGreaterThan(-1)
    expect(refreshIndex).toBeLessThan(returnIndex)
    expect(updateBlock).not.toContain('await ctx.refreshOrderOperationalScope(next)')
  })

  it('finds orders for actions across today report and ledger caches', () => {
    expect(appStoreSource).toContain('findOrderById(orderId: string)')
    expect(appStoreSource).toContain('return findOrderInCaches(this, orderId)')
    const helperBlock = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export const findOrderInCaches'),
      orderActionStoreSource.indexOf('export const rememberOrderForOperations'),
    )
    expect(helperBlock).toContain('ctx.orders')
    expect(helperBlock).toContain('ctx.reportOrders')
    expect(helperBlock).toContain('ctx.ledgerOrders')
    expect(helperBlock).toContain('order.id === orderId || order.backendId === orderId')
    const updateBlock = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export async function updateOrderStatusAction'),
      orderActionStoreSource.indexOf('export async function rescheduleOrderAction'),
    )
    const rescheduleStart = orderActionStoreSource.indexOf('export async function rescheduleOrderAction')
    const rescheduleBlock = orderActionStoreSource.slice(
      rescheduleStart,
      orderActionStoreSource.indexOf('export function syncOrderStatusToDerivedData', rescheduleStart),
    )
    expect(updateBlock).toContain('const order = findOrderInCaches(ctx, orderId)')
    expect(rescheduleBlock).toContain('const order = findOrderInCaches(ctx, orderId)')
  })

  it('refreshes both old and new appointment slots after rescheduling', () => {
    const start = orderActionStoreSource.indexOf('export async function rescheduleOrderAction')
    const end = orderActionStoreSource.indexOf('export function syncOrderStatusToDerivedData', start)
    const block = orderActionStoreSource.slice(start, end)
    expect(block).toContain('const previousScopeOrder = { ...order }')
    expect(block).toContain('const scopeRefreshes = [')
    expect(block).toContain('ctx.refreshOrderOperationalScope(previousScopeOrder)')
    expect(block).toContain('ctx.refreshOrderOperationalScope(next)')
    expect(block).toContain('await Promise.all(scopeRefreshes)')
    expect(appStoreSource).toContain('return rescheduleOrderAction(this, orderId, input)')
  })

  it('marks demo-only identifiers explicitly instead of mimicking database ids', () => {
    const orderCreateBlock = orderActionStoreSource.slice(
      orderActionStoreSource.indexOf('export async function createOrderAction'),
      orderActionStoreSource.indexOf('export async function updateOrderStatusAction'),
    )
    expect(orderCreateBlock).toContain('createDemoBackendId')
    expect(orderCreateBlock).not.toContain('normalizeBackendId(Date.now())')
    const productBlock = productStoreSource.slice(
      productStoreSource.indexOf('updateProductDemo'),
      productStoreSource.indexOf('async toggleProductActive'),
    )
    expect(workbenchFacadeStoreSource).toContain('productStore.updateProductDemo(data)')
    expect(productBlock).toContain('createDemoBackendId')
    expect(productBlock).not.toContain('normalizeBackendId(Date.now())')
    expect(workbenchFacadeStoreSource).toContain('customersStore.saveCustomerDemo(input)')
    expect(customersStoreSource).toContain('createDemoBackendId')
    expect(customersStoreSource).not.toContain('normalizeBackendId(Date.now())')
    expect(workbenchFacadeStoreSource).toContain('settingsStore.saveServiceGroupDemo(input, ctx.stores)')
    expect(workbenchFacadeStoreSource).toContain('settingsStore.saveEmployeeDemo(input, ctx.stores)')
    expect(workbenchFacadeStoreSource).toContain('settingsStore.saveNotificationTemplateDemo(input)')
    expect(settingsStoreSource).toContain('createDemoBackendId')
    expect(settingsStoreSource).not.toContain('normalizeBackendId(Date.now())')
    expect(appStoreTransformsSource).toContain('const createDemoBackendId')
    expect(appStoreTransformsSource).toContain('`demo-${scope}-')
  })

  it('uses separated local visual assets instead of one repeated hero placeholder', () => {
    expect(albumsStoreSource).toContain("from './workbenchAssets'")
    expect(productStoreSource).toContain('getProductFallbackImage(0)')
    expect(productStoreSource).toContain('getProductFallbackImage(1)')
    expect(albumsStoreSource).toContain('getSamplePhotoImage(idx)')
    expect(productStoreTransformsSource).toContain('getProductFallbackImage')
    expect(productStoreTransformsSource).toContain('isWorkbenchFallbackImage(product.image)')
    expect(appStoreContractSource).not.toContain("import fallbackProductImage from '../../assets/hero.png'")
    expect(productStoreTransformsSource).not.toContain("import fallbackProductImage from '../../assets/hero.png'")
  })

  it('does not fall back to demo data in production API mode after bootstrap fails', () => {
    const bootstrapBlock = workbenchLifecycleStoreSource.slice(
      workbenchLifecycleStoreSource.indexOf('export const bootstrapAction'),
      workbenchLifecycleStoreSource.length,
    )
    expect(bootstrapBlock).toContain('影约云后端连接失败')
    expect(bootstrapBlock).toContain('throw error')
    expect(bootstrapBlock).not.toContain('this.useDemoData(error)')
  })

  it('clears cached business data when a staff session logs out', () => {
    expect(appStoreSource).toContain('resetRuntime()')
    expect(workbenchLifecycleStoreSource).toContain('albumsStore.reset()')
    expect(workbenchLifecycleStoreSource).toContain('ctx.stores = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.orders = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.albums = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.employees = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.customers = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.notificationTemplates = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.notificationLogs = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.channelProductMappings = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.photoAccessLogsByAlbum = {}')
    expect(workbenchLifecycleStoreSource).toContain('ctx.reportSnapshots = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.douyinAcceptanceCases = []')
    expect(workbenchLifecycleStoreSource).toContain('ctx.douyinSyncHealth = null')
  })

  it('loads Douyin Life product mappings and acceptance health for staff diagnostics', () => {
    expect(appStoreSource).toContain('loadChannelProductMappings')
    expect(workbenchFacadeStoreSource).toContain('channelStore.refreshChannelProductMappings')
    expect(channelStoreSource).toContain("backendApi.listChannelProductMappings")
    expect(channelStoreSource).toContain('mapChannelProductMapping')
    expect(appStoreSource).toContain('loadDouyinAcceptanceCases')
    expect(appStoreSource).toContain('loadDouyinSyncHealth')
    expect(appStoreContractSource).toContain('20260605131113AF2F064357C9C939F972')
  })

  it('syncs Douyin Life orders and refreshes the shared workbench caches', () => {
    expect(appStoreTypesSource).toContain('export type DouyinLifeOrderSyncInfo')
    expect(appStoreSource).toContain('lastDouyinLifeOrderSync: null as DouyinLifeOrderSyncInfo | null')
    expect(appStoreSource).toContain('async syncDouyinLifeOrdersAndRefresh')
    expect(appStoreSource).toContain('return syncDouyinLifeOrdersAndRefreshAction(this, input)')
    expect(workbenchOperationalStoreSource).toContain('backendApi.syncDouyinLifeOrders')
    expect(workbenchOperationalStoreSource).toContain('ctx.lastDouyinLifeOrderSync =')
    expect(workbenchOperationalStoreSource).toContain('await ctx.refreshCoreData()')
    expect(workbenchOperationalStoreSource).toContain('const refreshStoreBackendId = query.storeId')
    expect(workbenchOperationalStoreSource).toContain('loadDashboardStatsAction(ctx, refreshDate, refreshStoreBackendId)')
    expect(workbenchOperationalStoreSource).toContain('loadScheduleAction(ctx, refreshDate, refreshStoreName, refreshStoreBackendId)')
    expect(workbenchOperationalStoreSource).toContain('refreshAllOrders?: boolean')
    expect(workbenchOperationalStoreSource).toContain('if (input.refreshAllOrders)')
    expect(workbenchOperationalStoreSource).toContain('await loadAllOrdersAction(ctx)')
    expect(workbenchLifecycleStoreSource).toContain('ctx.orders = todayOrdersPage.items.map')
    expect(workbenchLifecycleStoreSource).toContain('ctx.ledgerOrders = ledgerOrdersPage.items.map')
    expect(workbenchLifecycleStoreSource).toContain('ctx.scheduleItems = []')
  })

  it('persists selected photo state through the backend before updating album counters', () => {
    expect(appStoreSource).toContain('async markAlbumPhotosSelected')
    expect(appStoreSource).toContain('albumsStore.markAlbumPhotosSelected(albumId, updates)')
    expect(albumsStoreSource).toContain('backendApi.markAlbumPhotosSelected')
    expect(albumsStoreSource).toContain('photo.selected = selected')
    expect(albumsStoreSource).toContain('album.selectedCount = album.negatives.filter')
  })

  it('loads photo access logs through the backend without exposing raw access fields', () => {
    expect(appStoreSource).toContain('photoAccessLogsByAlbum: {} as Record<string, PhotoAccessLogInfo[]>')
    expect(appStoreSource).toContain('async loadPhotoAccessLogs(albumId: string)')
    expect(appStoreSource).toContain('albumsStore.loadPhotoAccessLogs(albumId)')
    expect(albumsStoreSource).toContain('backendApi.listPhotoAccessLogs')
    expect(albumsStoreSource).toContain('this.photoAccessLogsByAlbum[album.id]')
    expect(appStoreTypesSource).toContain('export type PhotoAccessLogInfo')
  })

  it('keeps album read caches in albumsStore while preserving appStore facade fields', () => {
    expect(appStoreSource).toContain("import { albumsStore } from './albumsStore'")
    expect(appStoreSource).toContain('syncAlbumsFromOwner()')
    expect(appStoreSource).toContain('this.albums = albumsStore.albums')
    expect(appStoreSource).toContain('this.selectionLinks = albumsStore.selectionLinks')
    expect(appStoreSource).toContain('this.selectionStats = albumsStore.selectionStats')
    expect(workbenchLifecycleStoreSource).toContain('albumsStore.loadDemo(today, tomorrow)')
    expect(workbenchLifecycleStoreSource).toContain('await albumsStore.refreshCore(ctx.orders)')
    expect(workbenchFacadeStoreSource).toContain('albumsStore.refreshSelectionStats()')
    expect(appStoreSource).toContain('albumsStore.refreshAlbumDetails(albumId, this.orders)')
    expect(albumsStoreSource).toContain('async refreshAlbums(orders: BookingOrder[])')
    expect(albumsStoreSource).toContain('async refreshSelectionLinks(orders: BookingOrder[])')
    expect(albumsStoreSource).toContain('loadDemo(today: string, tomorrow: string)')
  })

  it('delegates album photo mutations to albumsStore while preserving appStore method names', () => {
    expect(appStoreSource).toContain('async uploadAlbumPhotos(albumId: string, files: File[])')
    expect(appStoreSource).toContain('albumsStore.uploadAlbumPhotosDemo(albumId, files)')
    expect(appStoreSource).toContain('albumsStore.uploadAlbumPhotos(albumId, files)')
    expect(appStoreSource).toContain('albumsStore.sortAlbumPhotos(albumId)')
    expect(appStoreSource).toContain('albumsStore.renameAlbumPhoto(albumId, photoId, displayName, this.orders)')
    expect(appStoreSource).toContain('albumsStore.deleteAlbumPhoto(albumId, photoId, this.orders)')
    expect(albumsStoreSource).toContain('async uploadAlbumPhotos(albumId: string, files: File[])')
    expect(albumsStoreSource).toContain('uploadAlbumPhotosDemo(albumId: string, files: File[])')
    expect(albumsStoreSource).toContain('async renameAlbumPhoto(albumId: string, photoId: string, displayName: string, orders: BookingOrder[] = [])')
    expect(albumsStoreSource).toContain('async deleteAlbumPhoto(albumId: string, photoId: string, orders: BookingOrder[] = [])')
  })
})
