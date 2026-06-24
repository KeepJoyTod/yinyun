import { computed, reactive } from 'vue'
import {
  backendApi,
  type OrderStatusStatDto,
  type PhotoAlbumActionPayload,
  type ScheduleItemDto,
  type TodaySlotDto,
  type TrendStatDto,
} from '../api/backend'
import type { BackendId } from '../api/backendId'
import type {
  Album,
  BookingInventorySlot,
  BookingOrder,
  BookingOrderStatus,
  ChannelProductMappingInfo,
  ChannelSyncLogInfo,
  CustomerInfo,
  DashboardFinanceInfo,
  DouyinAcceptanceCaseInfo,
  DouyinLifeOrderSyncInfo,
  DouyinSyncHealthInfo,
  EmployeeInfo,
  NotificationLogInfo,
  NotificationTemplateInfo,
  OperationLogInfo,
  ProductConfig,
  PhotoAccessLogInfo,
  ReportSnapshotInfo,
  SelectionLink,
  ServiceGroupInfo,
  StoreInfo,
  StudioInfo,
} from './appStoreTypes'
export type {
  Album,
  AlbumNegative,
  AlbumStatus,
  BookingInventorySlot,
  BookingOrder,
  BookingOrderStatus,
  CardProductItem,
  ChannelProductMappingInfo,
  ChannelSyncLogInfo,
  CustomerInfo,
  DashboardFinanceInfo,
  DouyinAcceptanceCaseInfo,
  DouyinLifeOrderSyncInfo,
  DouyinSyncHealthInfo,
  EmployeeInfo,
  NotificationLogInfo,
  NotificationTemplateInfo,
  OperationLogInfo,
  PaymentStatus,
  PhotoAccessLogInfo,
  ProductConfig,
  ReportSnapshotInfo,
  SelectionLink,
  SelectionLinkStatus,
  ServiceGroupInfo,
  StoreInfo,
  StudioInfo,
} from './appStoreTypes'
import {
  buildWorkbenchStoreNames,
  currentMonthOrderQuery,
  emptySelectionStats,
  mapOrder,
  mapStudio,
  todayKey,
} from './appStoreTransforms'
import { albumsStore } from './albumsStore'
import { isMissingArrivalSchedule } from './orderIssueRules'
import { channelStore } from './channelStore'
import { customersStore } from './customersStore'
import { operationLogStore } from './operationLogStore'
import { productStore } from './productStore'
import { settingsStore } from './settingsStore'
import {
  createOrderAction,
  findOrderInCaches,
  rememberOrderForOperations as rememberOrderForOperationCaches,
  rescheduleOrderAction,
  type StaffOrderConfirmPaymentInput,
  type StaffOrderCreateInput,
  type StaffOrderRescheduleInput,
  updateOrderStatusAction,
} from './orderActionStore'
import {
  exportOrdersAction,
  loadAllOrdersAction,
  loadBookingInventoryAction,
  loadDashboardFinanceAction,
  loadDashboardStatsAction,
  loadReportOrdersAction,
  loadReportSnapshotsAction,
  loadScheduleAction,
  loadTodayOrdersAction,
  refreshOrderOperationalScopeAction,
  syncDouyinLifeOrdersAndRefreshAction,
  updateBookingInventoryAction,
  type BookingInventoryQuery,
  type BookingInventoryUpdateInput,
  type OperationalOrderExportQuery,
  type OperationalOrderListQuery,
  type OperationalSyncDouyinLifeQuery,
} from './workbenchOperationalStore'
import {
  bootstrapAction,
  refreshCoreDataAction,
  resetRuntimeAction,
  useDemoDataAction,
} from './workbenchLifecycleStore'
import {
  deleteServiceGroupFacade,
  loadChannelProductMappingsFacade,
  loadChannelSyncLogsFacade,
  loadCustomerRecentOrdersFacade,
  loadCustomersFacade,
  loadDouyinAcceptanceCasesFacade,
  loadDouyinSyncHealthFacade,
  loadEmployeesFacade,
  loadNotificationLogsFacade,
  loadNotificationTemplatesFacade,
  loadOperationLogsFacade,
  loadSelectionStatsFacade,
  loadServiceGroupsFacade,
  saveCustomerFacade,
  saveEmployeeFacade,
  saveNotificationTemplateFacade,
  saveServiceGroupFacade,
  toggleProductActiveFacade,
  updateProductFacade,
} from './workbenchFacadeStore'

export const appStore = reactive({
  loading: false,
  initialized: false,
  apiError: '',
  demoMode: false,
  stores: [] as StoreInfo[],
  products: [] as ProductConfig[],
  productSpecOptions: [] as string[],
  orders: [] as BookingOrder[],
  ledgerOrders: [] as BookingOrder[],
  reportOrders: [] as BookingOrder[],
  albums: [] as Album[],
  selectionLinks: [] as SelectionLink[],
  photoAccessLogsByAlbum: {} as Record<string, PhotoAccessLogInfo[]>,
  reportSnapshots: [] as ReportSnapshotInfo[],
  selectionStats: emptySelectionStats(),
  studios: [] as StudioInfo[],
  serviceGroups: [] as ServiceGroupInfo[],
  bookingInventory: [] as BookingInventorySlot[],
  employees: [] as EmployeeInfo[],
  customers: [] as CustomerInfo[],
  customerRecentOrders: {} as Record<BackendId, BookingOrder[]>,
  notificationTemplates: [] as NotificationTemplateInfo[],
  notificationLogs: [] as NotificationLogInfo[],
  operationLogs: [] as OperationLogInfo[],
  channelSyncLogs: [] as ChannelSyncLogInfo[],
  channelProductMappings: [] as ChannelProductMappingInfo[],
  douyinAcceptanceCases: [] as DouyinAcceptanceCaseInfo[],
  douyinSyncHealth: null as DouyinSyncHealthInfo | null,
  lastDouyinLifeOrderSync: null as DouyinLifeOrderSyncInfo | null,
  scheduleItems: [] as ScheduleItemDto[],
  scheduleLoadSeq: 0,
  demoScheduleItems: [] as ScheduleItemDto[],
  orderStatusStats: [] as OrderStatusStatDto[],
  trendStats: [] as TrendStatDto[],
  todaySlots: [] as TodaySlotDto[],
  dashboardFinance: null as DashboardFinanceInfo | null,

  resetRuntime() {
    resetRuntimeAction(this)
  },

  syncProductsFromOwner() {
    this.products = productStore.products
    this.productSpecOptions = productStore.productSpecOptions
    return this.products
  },

  syncOperationLogsFromOwner() {
    this.operationLogs = operationLogStore.operationLogs
    return this.operationLogs
  },

  syncChannelFromOwner() {
    this.channelSyncLogs = channelStore.channelSyncLogs
    this.channelProductMappings = channelStore.channelProductMappings
    this.douyinAcceptanceCases = channelStore.douyinAcceptanceCases
    this.douyinSyncHealth = channelStore.douyinSyncHealth
  },

  syncCustomersFromOwner() {
    this.customers = customersStore.customers
    this.customerRecentOrders = customersStore.customerRecentOrders
    return this.customers
  },

  syncSettingsFromOwner() {
    this.serviceGroups = settingsStore.serviceGroups
    this.employees = settingsStore.employees
    this.notificationTemplates = settingsStore.notificationTemplates
    this.notificationLogs = settingsStore.notificationLogs
  },

  syncAlbumsFromOwner() {
    this.albums = albumsStore.albums
    this.selectionLinks = albumsStore.selectionLinks
    this.photoAccessLogsByAlbum = albumsStore.photoAccessLogsByAlbum
    this.selectionStats = albumsStore.selectionStats
  },

  syncAlbumsToOwner() {
    albumsStore.albums = this.albums
    albumsStore.selectionLinks = this.selectionLinks
    albumsStore.photoAccessLogsByAlbum = this.photoAccessLogsByAlbum
    albumsStore.selectionStats = this.selectionStats
  },

  async bootstrap() {
    return bootstrapAction(this)
  },

  useDemoData(error?: unknown) {
    return useDemoDataAction(this, error)
  },

  async refreshCoreData() {
    return refreshCoreDataAction(this)
  },

  async loadReportOrders(query: OperationalOrderListQuery = currentMonthOrderQuery()) {
    return loadReportOrdersAction(this, query)
  },

  async loadTodayOrders() {
    return loadTodayOrdersAction(this)
  },

  async loadAllOrders() {
    return loadAllOrdersAction(this)
  },

  async loadReportSnapshots(reportType?: string) {
    return loadReportSnapshotsAction(this, reportType)
  },

  async loadPhotoAccessLogs(albumId: string) {
    this.syncAlbumsToOwner()
    const logs = this.demoMode
      ? albumsStore.loadDemoPhotoAccessLogs(albumId)
      : await albumsStore.loadPhotoAccessLogs(albumId)
    this.syncAlbumsFromOwner()
    return logs
  },

  async exportOrders(query: OperationalOrderExportQuery) {
    if (this.demoMode) throw new Error('Demo 模式不可导出')
    return exportOrdersAction(query)
  },

  async syncDouyinLifeOrdersAndRefresh(input: OperationalSyncDouyinLifeQuery = {}) {
    return syncDouyinLifeOrdersAndRefreshAction(this, input)
  },

  async ensureReportDataLoaded(source: string) {
    const loadSnapshots = () => this.loadReportSnapshots(source)
    if (source === 'customers' || source === 'reviews') {
      await Promise.all([this.ensureCustomersLoaded(), loadSnapshots()])
      return this.customers
    }
    if (source === 'employees') {
      await Promise.all([this.ensureEmployeesLoaded(), loadSnapshots()])
      return this.employees
    }
    if (source === 'retouch') {
      await loadSnapshots()
      return this.albums
    }
    await Promise.all([
      this.reportOrders.length ? Promise.resolve(this.reportOrders) : this.loadReportOrders(currentMonthOrderQuery()),
      loadSnapshots(),
    ])
    return this.reportOrders
  },

  async loadStudios() {
    if (this.demoMode) return
    const studios = await backendApi.listStudios()
    this.studios = studios.map(mapStudio)
  },

  async loadServiceGroups() {
    return loadServiceGroupsFacade(this)
  },

  async saveServiceGroup(input: {
    id?: BackendId
    storeBackendId: BackendId
    code: string
    name: string
    capacity: number
    durationMinutes: number
    status: string
    sort: number
    remark: string
  }) {
    return saveServiceGroupFacade(this, input)
  },

  async deleteServiceGroup(id: BackendId) {
    return deleteServiceGroupFacade(this, id)
  },

  async loadBookingInventory(input?: BookingInventoryQuery) {
    return loadBookingInventoryAction(this, input)
  },

  async updateBookingInventory(input: BookingInventoryUpdateInput) {
    return updateBookingInventoryAction(this, input)
  },

  async loadEmployees() {
    return loadEmployeesFacade(this)
  },

  async ensureEmployeesLoaded() {
    if (this.employees.length) return this.employees
    return this.loadEmployees()
  },

  async saveEmployee(input: {
    id?: BackendId
    storeBackendId: BackendId
    employeeNo: string
    name: string
    mobile: string
    roleType: string
    skillTags: string
    status: string
    sort: number
    remark: string
  }) {
    return saveEmployeeFacade(this, input)
  },

  async loadCustomers(keyword = '') {
    return loadCustomersFacade(this, keyword)
  },

  async ensureCustomersLoaded() {
    if (this.customers.length) return this.customers
    return this.loadCustomers()
  },

  async saveCustomer(input: {
    id?: BackendId
    name: string
    mobile: string
    gender: string
    birthday: string
    source: string
    memberLevel: string
    tags: string
    remark: string
  }) {
    return saveCustomerFacade(this, input)
  },

  async loadCustomerRecentOrders(customerBackendId: BackendId, limit = 5) {
    return loadCustomerRecentOrdersFacade(this, customerBackendId, limit)
  },

  async loadNotificationTemplates() {
    return loadNotificationTemplatesFacade(this)
  },

  async saveNotificationTemplate(input: {
    id?: BackendId
    templateCode: string
    scene: string
    channelType: string
    title: string
    content: string
    providerTemplateId: string
    enabled: string
    remark: string
  }) {
    return saveNotificationTemplateFacade(this, input)
  },

  async loadNotificationLogs() {
    return loadNotificationLogsFacade(this)
  },

  async loadOperationLogs() {
    return loadOperationLogsFacade(this)
  },

  async loadChannelSyncLogs() {
    return loadChannelSyncLogsFacade(this)
  },

  async loadChannelProductMappings(channelType = 'DOUYIN_LIFE') {
    return loadChannelProductMappingsFacade(this, channelType)
  },

  async loadDouyinAcceptanceCases() {
    return loadDouyinAcceptanceCasesFacade(this)
  },

  async loadDouyinSyncHealth() {
    return loadDouyinSyncHealthFacade(this)
  },

  async loadDashboardFinance(date = todayKey(), storeBackendId?: BackendId) {
    return loadDashboardFinanceAction(this, date, storeBackendId)
  },

  async loadDashboardStats(date = todayKey(), storeBackendId?: BackendId) {
    return loadDashboardStatsAction(this, date, storeBackendId)
  },

  findOrderById(orderId: string) {
    return findOrderInCaches(this, orderId)
  },

  rememberOrderForOperations(order: BookingOrder) {
    rememberOrderForOperationCaches(this, order)
  },

  async refreshOrderOperationalScope(order: BookingOrder) {
    return refreshOrderOperationalScopeAction(this, order)
  },

  async loadSelectionStats() {
    return loadSelectionStatsFacade(this)
  },

  async loadSchedule(date = todayKey(), storeName = '全部门店', storeBackendId?: BackendId) {
    return loadScheduleAction(this, date, storeName, storeBackendId)
  },

  async loadAlbumDetails(albumId: string) {
    const album = this.albums.find(a => a.id === albumId || a.backendId === albumId)
    if (!album || this.demoMode) return album ?? null
    this.syncAlbumsToOwner()
    const next = await albumsStore.refreshAlbumDetails(albumId, this.orders)
    this.syncAlbumsFromOwner()
    return next
  },

  async confirmAlbumSelection(albumId: string, payload: PhotoAlbumActionPayload = {}) {
    this.syncAlbumsToOwner()
    const result = this.demoMode
      ? albumsStore.confirmAlbumSelectionDemo(albumId)
      : await albumsStore.confirmAlbumSelection(albumId, this.orders, payload)
    this.syncAlbumsFromOwner()
    return result
  },

  async deliverAlbum(albumId: string, payload: PhotoAlbumActionPayload = {}) {
    this.syncAlbumsToOwner()
    const result = this.demoMode
      ? albumsStore.deliverAlbumDemo(albumId)
      : await albumsStore.deliverAlbum(albumId, this.orders, payload)
    this.syncAlbumsFromOwner()
    return result
  },

  async notifyAlbum(albumId: string, payload: PhotoAlbumActionPayload = {}) {
    this.syncAlbumsToOwner()
    const result = this.demoMode
      ? albumsStore.notifyAlbumDemo(albumId, payload)
      : await albumsStore.notifyAlbum(albumId, this.orders, payload)
    this.syncAlbumsFromOwner()
    return result
  },

  async createOrder(input: StaffOrderCreateInput) {
    return createOrderAction(this, input)
  },

  async updateOrderStatus(orderId: string, status: BookingOrderStatus, remark?: string) {
    return updateOrderStatusAction(this, orderId, status, remark)
  },

  async rescheduleOrder(orderId: string, input: StaffOrderRescheduleInput) {
    return rescheduleOrderAction(this, orderId, input)
  },

  async confirmOrderPayment(input: StaffOrderConfirmPaymentInput) {
    const dto = await backendApi.confirmOrderPayment(input)
    const next = mapOrder(dto, this.stores)
    this.orders = this.orders.map(order => (order.id === next.id ? next : order))
    this.ledgerOrders = this.ledgerOrders.map(order => (order.id === next.id ? next : order))
    this.reportOrders = this.reportOrders.map(order => (order.id === next.id ? next : order))
    return next
  },

  async updateProduct(data: ProductConfig) {
    return updateProductFacade(this, data)
  },

  async addProduct(data: Omit<ProductConfig, 'active'>) {
    return this.updateProduct({ ...data, active: true })
  },

  async toggleProductActive(product: ProductConfig) {
    return toggleProductActiveFacade(this, product)
  },

  async uploadProductCover(file: File) {
    if (this.demoMode) {
      return URL.createObjectURL(file)
    }
    return productStore.uploadProductCover(file)
  },

  async generateSelectionLink(input: {
    orderId?: string
    albumId?: string
    customer?: string
    phone?: string
    product?: string
  }) {
    this.syncAlbumsToOwner()
    const link = this.demoMode
      ? albumsStore.generateSelectionLinkDemo(input, this.orders)
      : await albumsStore.generateSelectionLink(input, this.orders)
    this.syncAlbumsFromOwner()
    return link
  },

  async uploadAlbumPhotos(albumId: string, files: File[]) {
    this.syncAlbumsToOwner()
    const photos = this.demoMode
      ? albumsStore.uploadAlbumPhotosDemo(albumId, files)
      : await albumsStore.uploadAlbumPhotos(albumId, files)
    this.syncAlbumsFromOwner()
    return photos
  },

  async sortAlbumPhotos(albumId: string) {
    this.syncAlbumsToOwner()
    if (this.demoMode) return
    await albumsStore.sortAlbumPhotos(albumId)
    this.syncAlbumsFromOwner()
  },

  async renameAlbumPhoto(albumId: string, photoId: string, displayName: string) {
    this.syncAlbumsToOwner()
    const next = this.demoMode
      ? albumsStore.renameAlbumPhotoDemo(albumId, photoId, displayName)
      : await albumsStore.renameAlbumPhoto(albumId, photoId, displayName, this.orders)
    this.syncAlbumsFromOwner()
    return next
  },

  async markAlbumPhotosSelected(albumId: string, updates: { photoId: string; selected: boolean }[]) {
    this.syncAlbumsToOwner()
    const updatedPhotos = this.demoMode
      ? albumsStore.markAlbumPhotosSelectedDemo(albumId, updates)
      : await albumsStore.markAlbumPhotosSelected(albumId, updates)
    this.syncAlbumsFromOwner()
    return updatedPhotos
  },

  async deleteAlbumPhoto(albumId: string, photoId: string) {
    this.syncAlbumsToOwner()
    const next = this.demoMode
      ? albumsStore.deleteAlbumPhotoDemo(albumId, photoId)
      : await albumsStore.deleteAlbumPhoto(albumId, photoId, this.orders)
    this.syncAlbumsFromOwner()
    return next
  },

  findSelectionLink(id: string) {
    return this.selectionLinks.find(l => l.id === id || l.token === id || l.display.endsWith(id) || l.url.endsWith(id))
  },
})

export const appDerived = {
  storeNames: computed(() => buildWorkbenchStoreNames(appStore.stores)),
  activeProducts: computed(() => appStore.products.filter(p => p.active)),
  productSpecOptions: computed(() =>
    Array.from(new Set([...appStore.productSpecOptions, ...appStore.products.map(p => p.spec)].filter(Boolean))),
  ),
  anomalyPreStats: computed(() => {
    const orders = appStore.ledgerOrders.length ? appStore.ledgerOrders : appStore.orders
    return {
      missingStoreMapping: orders.filter(o => {
        if (!o.storeBackendId) return true
        return !appStore.stores.some(s => s.backendId === o.storeBackendId)
      }).length,
      missingArrivalTime: orders.filter(isMissingArrivalSchedule).length,
      missingProductName: orders.filter(o => !o.service || o.service === '未知产品' || o.service === '-').length,
    }
  }),
}
