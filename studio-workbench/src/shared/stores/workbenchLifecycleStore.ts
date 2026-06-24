import { backendApi, type OrderStatusStatDto, type ScheduleItemDto, type TodaySlotDto, type TrendStatDto } from '../api/backend'
import type { BackendId } from '../api/backendId'
import { albumsStore } from './albumsStore'
import {
  createDemoBookingInventory,
  createDemoOrderStatusStats,
  createDemoOrders,
  createDemoScheduleItems,
  createDemoStores,
  createDemoStudios,
  createDemoTodaySlots,
  createDemoTrendStats,
} from './appStoreDemoData'
import { emptySelectionStats, formatDate, mapOrder, mapStore, todayKey } from './appStoreTransforms'
import type {
  Album,
  BookingInventorySlot,
  BookingOrder,
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
  PhotoAccessLogInfo,
  ProductConfig,
  ReportSnapshotInfo,
  SelectionLink,
  ServiceGroupInfo,
  StoreInfo,
  StudioInfo,
} from './appStoreTypes'
import { channelStore } from './channelStore'
import { customersStore } from './customersStore'
import { operationLogStore } from './operationLogStore'
import { productStore } from './productStore'
import { settingsStore } from './settingsStore'

type WorkbenchLifecycleContext = {
  loading: boolean
  initialized: boolean
  apiError: string
  demoMode: boolean
  stores: StoreInfo[]
  products: ProductConfig[]
  productSpecOptions: string[]
  orders: BookingOrder[]
  ledgerOrders: BookingOrder[]
  reportOrders: BookingOrder[]
  albums: Album[]
  selectionLinks: SelectionLink[]
  photoAccessLogsByAlbum: Record<string, PhotoAccessLogInfo[]>
  reportSnapshots: ReportSnapshotInfo[]
  selectionStats: ReturnType<typeof emptySelectionStats>
  studios: StudioInfo[]
  serviceGroups: ServiceGroupInfo[]
  bookingInventory: BookingInventorySlot[]
  employees: EmployeeInfo[]
  customers: CustomerInfo[]
  customerRecentOrders: Record<BackendId, BookingOrder[]>
  notificationTemplates: NotificationTemplateInfo[]
  notificationLogs: NotificationLogInfo[]
  operationLogs: OperationLogInfo[]
  channelSyncLogs: ChannelSyncLogInfo[]
  channelProductMappings: ChannelProductMappingInfo[]
  douyinAcceptanceCases: DouyinAcceptanceCaseInfo[]
  douyinSyncHealth: DouyinSyncHealthInfo | null
  lastDouyinLifeOrderSync: DouyinLifeOrderSyncInfo | null
  scheduleItems: ScheduleItemDto[]
  scheduleLoadSeq: number
  demoScheduleItems: ScheduleItemDto[]
  orderStatusStats: OrderStatusStatDto[]
  trendStats: TrendStatDto[]
  todaySlots: TodaySlotDto[]
  dashboardFinance: DashboardFinanceInfo | null
  refreshCoreData: () => Promise<unknown>
  loadStudios: () => Promise<unknown>
  loadDashboardStats: (date?: string, storeBackendId?: BackendId) => Promise<unknown>
  syncProductsFromOwner: () => ProductConfig[]
  syncAlbumsFromOwner: () => void
  syncSettingsFromOwner: () => void
  syncCustomersFromOwner: () => CustomerInfo[]
  syncOperationLogsFromOwner: () => OperationLogInfo[]
  syncChannelFromOwner: () => void
}

export const expectedStoreCount = () => {
  const raw = import.meta.env.VITE_STUDIO_MIN_STORE_COUNT ?? import.meta.env.VITE_STUDIO_EXPECTED_STORE_COUNT
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export const assertMinimumStoreCount = (actual: number) => {
  const expected = expectedStoreCount()
  if (!expected || actual >= expected) return
  throw new Error(`真实门店数据不足：至少需要 ${expected} 个可用门店，接口返回 ${actual} 个，请检查 /yy/store/list、账号权限或租户门店数据`)
}

export const isVisibleWorkbenchStore = (store: { storeCode?: string; name?: string }) => {
  const code = String(store.storeCode ?? '').toUpperCase()
  const name = String(store.name ?? '')
  if (name.includes('默认门店')) return false
  if (code.includes('DEFAULT')) return false
  return true
}

export const resetRuntimeAction = (ctx: WorkbenchLifecycleContext) => {
  albumsStore.reset()
  channelStore.reset()
  customersStore.reset()
  operationLogStore.reset()
  productStore.reset()
  settingsStore.reset()
  ctx.loading = false
  ctx.initialized = false
  ctx.apiError = ''
  ctx.demoMode = false
  ctx.stores = []
  ctx.products = []
  ctx.productSpecOptions = []
  ctx.orders = []
  ctx.ledgerOrders = []
  ctx.reportOrders = []
  ctx.albums = []
  ctx.selectionLinks = []
  ctx.photoAccessLogsByAlbum = {}
  ctx.reportSnapshots = []
  ctx.selectionStats = emptySelectionStats()
  ctx.studios = []
  ctx.serviceGroups = []
  ctx.bookingInventory = []
  ctx.employees = []
  ctx.customers = []
  ctx.customerRecentOrders = {}
  ctx.notificationTemplates = []
  ctx.notificationLogs = []
  ctx.operationLogs = []
  ctx.channelSyncLogs = []
  ctx.channelProductMappings = []
  ctx.douyinAcceptanceCases = []
  ctx.douyinSyncHealth = null
  ctx.lastDouyinLifeOrderSync = null
  ctx.scheduleItems = []
  ctx.scheduleLoadSeq = 0
  ctx.demoScheduleItems = []
  ctx.orderStatusStats = []
  ctx.trendStats = []
  ctx.todaySlots = []
  ctx.dashboardFinance = null
}

export const useDemoDataAction = (ctx: WorkbenchLifecycleContext, error?: unknown) => {
  const today = todayKey()
  const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
  ctx.demoMode = true
  ctx.initialized = true
  ctx.apiError = error instanceof Error ? `已切换本地演示数据：${error.message}` : '已切换本地演示数据'

  ctx.stores = createDemoStores()

  productStore.loadDemo()
  ctx.syncProductsFromOwner()

  ctx.orders = createDemoOrders(today, tomorrow)
  ctx.ledgerOrders = ctx.orders
  ctx.reportOrders = ctx.orders

  albumsStore.loadDemo(today, tomorrow)
  ctx.syncAlbumsFromOwner()
  ctx.reportSnapshots = []

  ctx.studios = createDemoStudios()

  settingsStore.loadDemoServiceGroups(ctx.stores)
  ctx.syncSettingsFromOwner()

  ctx.bookingInventory = createDemoBookingInventory(today)

  settingsStore.loadDemoEmployees(ctx.stores)
  ctx.syncSettingsFromOwner()

  customersStore.loadDemo(today, ctx.orders)
  ctx.syncCustomersFromOwner()

  settingsStore.loadDemoNotificationTemplates()
  settingsStore.loadDemoNotificationLogs(today, ctx.stores)
  ctx.syncSettingsFromOwner()

  operationLogStore.loadDemo(today)
  ctx.syncOperationLogsFromOwner()
  channelStore.loadDemoChannelSyncLogs(ctx.stores)
  channelStore.loadDemoChannelProductMappings(ctx.stores, ctx.products)
  channelStore.loadDemoDouyinAcceptanceCases(today)
  channelStore.loadDemoDouyinSyncHealth(today)
  ctx.syncChannelFromOwner()

  ctx.demoScheduleItems = createDemoScheduleItems(today)
  ctx.scheduleItems = [...ctx.demoScheduleItems]
  ctx.orderStatusStats = createDemoOrderStatusStats()
  ctx.trendStats = createDemoTrendStats()
  ctx.todaySlots = createDemoTodaySlots(ctx.scheduleItems, ctx.stores)
}

export const refreshCoreDataAction = async (ctx: WorkbenchLifecycleContext) => {
  ctx.demoMode = false
  ctx.apiError = ''
  const stores = await backendApi.listStores()
  const visibleStores = stores.filter(isVisibleWorkbenchStore)
  assertMinimumStoreCount(visibleStores.length)
  ctx.stores = visibleStores.map(mapStore)
  await productStore.refresh()
  ctx.syncProductsFromOwner()

  const [todayOrdersPage, ledgerOrdersPage] = await Promise.all([
    backendApi.listTodayOrders(),
    backendApi.listAllOrders(),
  ])
  ctx.orders = todayOrdersPage.items.map(order => mapOrder(order, ctx.stores))
  ctx.ledgerOrders = ledgerOrdersPage.items.map(order => mapOrder(order, ctx.stores))
  ctx.reportOrders = ctx.ledgerOrders

  await albumsStore.refreshCore(ctx.orders)
  ctx.syncAlbumsFromOwner()
}

export const bootstrapAction = async (ctx: WorkbenchLifecycleContext) => {
  ctx.loading = true
  ctx.initialized = false
  ctx.apiError = ''
  if (import.meta.env.VITE_STUDIO_DEMO !== 'false') {
    useDemoDataAction(ctx)
    ctx.loading = false
    ctx.initialized = true
    return
  }
  try {
    await ctx.refreshCoreData()
    await Promise.all([
      ctx.loadStudios(),
      ctx.loadDashboardStats(todayKey()),
    ])
    ctx.initialized = true
  } catch (error) {
    ctx.demoMode = false
    ctx.apiError = error instanceof Error ? `影约云后端连接失败：${error.message}` : '影约云后端连接失败'
    throw error
  } finally {
    ctx.loading = false
  }
}
