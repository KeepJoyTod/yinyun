import {
  backendApi,
  type DouyinLifeOrderSyncQuery,
  type OrderExportQuery,
  type OrderListQuery,
  type ScheduleItemDto,
} from '../api/backend'
import type { BackendId } from '../api/backendId'
import { buildScheduleItemsFromOrders } from '../api/yingyueAdapter'
import {
  currentMonthOrderQuery,
  mapBookingInventory,
  mapOrder,
  mapReportSnapshot,
  todayKey,
} from './appStoreTransforms'
import type {
  BookingInventorySlot,
  BookingOrder,
  DashboardFinanceInfo,
  DouyinLifeOrderSyncInfo,
  ReportSnapshotInfo,
  ServiceGroupInfo,
  StoreInfo,
} from './appStoreTypes'
import { getOrderOperationalDate } from './orderIssueRules'

export type BookingInventoryQuery = {
  date?: string
  storeBackendId?: BackendId
  serviceGroupBackendId?: BackendId
  conflictOnly?: boolean
}

export type BookingInventoryUpdateInput = {
  id: BackendId
  capacity: number
  status: string
  remark: string
}

export type OperationalOrderListQuery = OrderListQuery
export type OperationalOrderExportQuery = OrderExportQuery
export type OperationalSyncDouyinLifeQuery = DouyinLifeOrderSyncQuery & { refreshDate?: string; refreshAllOrders?: boolean }

type OperationalContext = {
  demoMode: boolean
  stores: StoreInfo[]
  serviceGroups: ServiceGroupInfo[]
  orders: BookingOrder[]
  ledgerOrders: BookingOrder[]
  reportOrders: BookingOrder[]
  reportSnapshots: ReportSnapshotInfo[]
  bookingInventory: BookingInventorySlot[]
  scheduleItems: ScheduleItemDto[]
  demoScheduleItems: ScheduleItemDto[]
  orderStatusStats: unknown[]
  trendStats: unknown[]
  todaySlots: unknown[]
  dashboardFinance: DashboardFinanceInfo | null
  lastDouyinLifeOrderSync: DouyinLifeOrderSyncInfo | null
  scheduleLoadSeq: number
  refreshCoreData: () => Promise<unknown>
  loadServiceGroups: () => Promise<unknown>
  loadDouyinSyncHealth: () => Promise<unknown>
  loadChannelSyncLogs: () => Promise<unknown>
  loadOperationLogs: () => Promise<unknown>
}

export async function loadReportOrdersAction(
  ctx: OperationalContext,
  query: OrderListQuery = currentMonthOrderQuery(),
) {
  if (ctx.demoMode) {
    ctx.reportOrders = ctx.ledgerOrders.length ? ctx.ledgerOrders : ctx.orders
    return ctx.reportOrders
  }
  const ordersPage = await backendApi.listOrders(query)
  ctx.reportOrders = ordersPage.items.map(order => mapOrder(order, ctx.stores))
  return ctx.reportOrders
}

export async function loadTodayOrdersAction(ctx: OperationalContext) {
  if (ctx.demoMode) return ctx.orders
  const ordersPage = await backendApi.listTodayOrders()
  ctx.orders = ordersPage.items.map(order => mapOrder(order, ctx.stores))
  return ctx.orders
}

export async function loadAllOrdersAction(ctx: OperationalContext) {
  if (ctx.demoMode) {
    ctx.ledgerOrders = ctx.orders
    return ctx.ledgerOrders
  }
  const ordersPage = await backendApi.listAllOrders()
  ctx.ledgerOrders = ordersPage.items.map(order => mapOrder(order, ctx.stores))
  ctx.reportOrders = ctx.ledgerOrders
  return ctx.ledgerOrders
}

export async function loadReportSnapshotsAction(ctx: OperationalContext, reportType?: string) {
  if (ctx.demoMode) return ctx.reportSnapshots
  const snapshots = await backendApi.listReportSnapshots({
    reportType: reportType && reportType !== 'reviews' ? reportType : undefined,
    pageSize: 100,
  })
  ctx.reportSnapshots = snapshots.map(mapReportSnapshot)
  return ctx.reportSnapshots
}

export async function exportOrdersAction(query: OrderExportQuery) {
  return backendApi.exportOrders(query)
}

export async function syncDouyinLifeOrdersAndRefreshAction(
  ctx: OperationalContext,
  input: DouyinLifeOrderSyncQuery & { refreshDate?: string; refreshAllOrders?: boolean } = {},
) {
  const refreshDate = input.refreshDate || todayKey()
  if (ctx.demoMode) {
    ctx.lastDouyinLifeOrderSync = {
      channelType: 'DOUYIN_LIFE',
      syncStatus: 'DEMO',
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      lastLogId: '',
      message: 'Demo 模式未调用真实抖音来客同步接口',
      syncedAt: new Date().toISOString(),
    }
    return ctx.lastDouyinLifeOrderSync
  }

  const { refreshDate: _refreshDate, refreshAllOrders: _refreshAllOrders, ...query } = input
  const result = await backendApi.syncDouyinLifeOrders(query)
  ctx.lastDouyinLifeOrderSync = {
    ...result,
    syncedAt: new Date().toISOString(),
  }
  await ctx.refreshCoreData()
  const refreshStoreBackendId = query.storeId
  const refreshStoreName = ctx.stores.find(store => store.backendId === refreshStoreBackendId)?.name ?? '全部门店'
  await Promise.all([
    loadDashboardStatsAction(ctx, refreshDate, refreshStoreBackendId),
    loadScheduleAction(ctx, refreshDate, refreshStoreName, refreshStoreBackendId),
    ctx.loadDouyinSyncHealth(),
    ctx.loadChannelSyncLogs(),
  ])
  if (input.refreshAllOrders) {
    await loadAllOrdersAction(ctx)
  }
  return ctx.lastDouyinLifeOrderSync
}

export async function loadBookingInventoryAction(ctx: OperationalContext, input?: BookingInventoryQuery) {
  if (ctx.demoMode) {
    const date = input?.date
    const storeBackendId = input?.storeBackendId
    const serviceGroupBackendId = input?.serviceGroupBackendId
    const conflictOnly = input?.conflictOnly
    return ctx.bookingInventory.filter(item =>
      (!date || item.date === date)
      && (!storeBackendId || item.storeBackendId === storeBackendId)
      && (!serviceGroupBackendId || item.serviceGroupBackendId === serviceGroupBackendId)
      && (!conflictOnly || item.conflictCount > 0),
    )
  }
  if (!ctx.serviceGroups.length) await ctx.loadServiceGroups()
  const inventory = await backendApi.listBookingInventory({
    bizDate: input?.date,
    beginBizDate: input?.date,
    endBizDate: input?.date,
    storeId: input?.storeBackendId,
    serviceGroupId: input?.serviceGroupBackendId,
    conflictOnly: input?.conflictOnly ? '1' : undefined,
  })
  ctx.bookingInventory = inventory.map(item => mapBookingInventory(item, ctx.stores, ctx.serviceGroups))
  return ctx.bookingInventory
}

export async function updateBookingInventoryAction(ctx: OperationalContext, input: BookingInventoryUpdateInput) {
  const current = ctx.bookingInventory.find(item => item.backendId === input.id)
  if (!current) throw new Error('未找到库存时段')
  if (ctx.demoMode) {
    const next = {
      ...current,
      capacity: Number(input.capacity) || 0,
      status: input.status || current.status,
      remark: input.remark.trim(),
    }
    ctx.bookingInventory = ctx.bookingInventory.map(item => (item.backendId === next.backendId ? next : item))
    return next
  }
  const dto = await backendApi.updateBookingInventory({
    id: current.backendId,
    storeId: current.storeBackendId,
    serviceGroupId: current.serviceGroupBackendId ?? null,
    externalSkuId: current.externalSkuId,
    bizDate: current.date,
    startTime: current.startTime,
    endTime: current.endTime,
    capacity: Number(input.capacity) || 0,
    status: input.status || current.status,
    remark: input.remark.trim(),
  })
  const next = mapBookingInventory(dto, ctx.stores, ctx.serviceGroups)
  ctx.bookingInventory = ctx.bookingInventory.map(item => (item.backendId === next.backendId ? next : item))
  return next
}

export async function loadDashboardFinanceAction(ctx: OperationalContext, date = todayKey(), storeBackendId?: BackendId) {
  if (ctx.demoMode) return
  const dto = await backendApi.dashboardFinance({ date, storeId: storeBackendId })
  ctx.dashboardFinance = {
    date: dto.date,
    storeBackendId: dto.storeId ?? undefined,
    actualIncomeCent: dto.actualIncomeCent,
    expectedIncomeCent: dto.expectedIncomeCent,
    productAmountCent: dto.productAmountCent,
    discountAmountCent: dto.discountAmountCent,
    orderAmountCent: dto.orderAmountCent,
    refundAmountCent: dto.refundAmountCent,
    orderCount: dto.orderCount,
    pendingOrderCount: dto.pendingOrderCount,
    servingOrderCount: dto.servingOrderCount,
    completedOrderCount: dto.completedOrderCount,
    canceledOrderCount: dto.canceledOrderCount,
  }
}

export async function loadDashboardStatsAction(ctx: OperationalContext, date = todayKey(), storeBackendId?: BackendId) {
  if (ctx.demoMode) return
  const [orderStatusStats, trendStats, todaySlots] = await Promise.all([
    backendApi.orderStatusStats({ date, storeId: storeBackendId }),
    backendApi.trendStats({ endDate: date, days: 20, storeId: storeBackendId }),
    backendApi.todaySlots({ date, storeId: storeBackendId }),
    loadDashboardFinanceAction(ctx, date, storeBackendId),
  ])
  ctx.orderStatusStats = orderStatusStats
  ctx.trendStats = trendStats
  ctx.todaySlots = todaySlots
}

export async function refreshOrderOperationalScopeAction(ctx: OperationalContext, order: BookingOrder) {
  const store = ctx.stores.find(item => item.backendId === order.storeBackendId)
  const storeName = store?.name || order.store || '全部门店'
  const refreshDate = getOrderOperationalDate(order) || todayKey()
  await Promise.all([
    loadScheduleAction(ctx, refreshDate, storeName, order.storeBackendId),
    loadBookingInventoryAction(ctx, { date: refreshDate, storeBackendId: order.storeBackendId }),
    loadDashboardStatsAction(ctx, refreshDate, order.storeBackendId),
    loadTodayOrdersAction(ctx),
    loadAllOrdersAction(ctx),
    ctx.loadOperationLogs(),
  ])
}

export async function loadScheduleAction(
  ctx: OperationalContext,
  date = todayKey(),
  storeName = '全部门店',
  storeBackendId?: BackendId,
) {
  const scheduleLoadSeq = ++ctx.scheduleLoadSeq
  if (ctx.demoMode) {
    if (scheduleLoadSeq !== ctx.scheduleLoadSeq) return
    ctx.scheduleItems = ctx.demoScheduleItems.filter(item => {
      const store = ctx.stores.find(s => s.backendId === item.storeId)
      return item.startAt.startsWith(date) && (!storeBackendId || item.storeId === storeBackendId) && (storeName === '全部门店' || store?.name === storeName)
    })
    return
  }
  const store = ctx.stores.find(s => s.name === storeName)
  const resolvedStoreId = storeBackendId ?? (storeName === '全部门店' ? undefined : store?.backendId)
  const [scheduleItems, scheduleOrdersPage] = await Promise.all([
    backendApi.listSchedules({
      date,
      storeId: resolvedStoreId,
    }),
    backendApi.listOrders({
      pageNum: 1,
      pageSize: 500,
      storeId: resolvedStoreId,
      slotDate: date,
    }),
  ])
  const scheduleOrders = scheduleOrdersPage.items
  const orderScheduleItems = buildScheduleItemsFromOrders(scheduleOrders, date, resolvedStoreId)
  if (scheduleLoadSeq !== ctx.scheduleLoadSeq) return
  const seen = new Set<string>()
  ctx.scheduleItems = [...scheduleItems, ...orderScheduleItems].filter(item => {
    const key = [
      item.bookingId,
      item.orderId,
      item.orderNo,
      item.storeId,
      item.startAt,
      item.endAt,
    ].filter(Boolean).join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
