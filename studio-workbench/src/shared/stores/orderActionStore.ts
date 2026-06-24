import { backendApi, type ScheduleItemDto, type TodaySlotDto } from '../api/backend'
import type { BackendId } from '../api/backendId'
import {
  addMinutesToClock,
  createDemoBackendId,
  formatClock,
  formatDate,
  mapOrder,
  normalizeClock,
  parseMoneyToCents,
  todayKey,
  toBackendDateTime,
  toIsoArrival,
  toMDHM,
} from './appStoreTransforms'
import type { BookingOrder, BookingOrderStatus, ProductConfig, ServiceGroupInfo, StoreInfo } from './appStoreTypes'
import { getOrderOperationalDate } from './orderIssueRules'

export type StaffOrderCreateInput = {
  name: string
  phone: string
  store: string
  product?: string
  productId?: BackendId | null
  customerId?: BackendId | null
  gender?: string
  email?: string
  date: string
  time: string
  serviceGroupId?: BackendId
  scheduleMode?: 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE'
  submitMode?: 'SAVE' | 'SAVE_AND_RECEIVE'
  notifyEnabled?: boolean
  durationMinutes?: number
  slotDate?: string
  slotStartTime?: string
  slotEndTime?: string
  payStatus?: string
  status?: string
  remark?: string
}

export type StaffOrderRescheduleInput = {
  date: string
  time: string
  durationMinutes?: number
  remark?: string
}

type OrderActionContext = {
  demoMode: boolean
  stores: StoreInfo[]
  products: ProductConfig[]
  serviceGroups: ServiceGroupInfo[]
  orders: BookingOrder[]
  ledgerOrders: BookingOrder[]
  reportOrders: BookingOrder[]
  demoScheduleItems: ScheduleItemDto[]
  scheduleItems: ScheduleItemDto[]
  todaySlots: TodaySlotDto[]
  loadServiceGroups: () => Promise<unknown>
  refreshOrderOperationalScope: (order: BookingOrder) => Promise<unknown>
}

export const findOrderInCaches = (ctx: Pick<OrderActionContext, 'orders' | 'reportOrders' | 'ledgerOrders'>, orderId: string) => {
  const pools = [ctx.orders, ctx.reportOrders, ctx.ledgerOrders]
  for (const orders of pools) {
    const order = orders.find(order => order.id === orderId || order.backendId === orderId)
    if (order) return order
  }
  return undefined
}

export const rememberOrderForOperations = (
  ctx: Pick<OrderActionContext, 'orders' | 'reportOrders' | 'ledgerOrders'>,
  order: BookingOrder,
) => {
  const sameOrder = (item: BookingOrder) => item.id === order.id || item.backendId === order.backendId
  ctx.reportOrders = [order, ...ctx.reportOrders.filter(item => !sameOrder(item))]
  ctx.orders = ctx.orders.map(item => (sameOrder(item) ? order : item))
  ctx.ledgerOrders = ctx.ledgerOrders.map(item => (sameOrder(item) ? order : item))
}

export async function createOrderAction(ctx: OrderActionContext, input: StaffOrderCreateInput) {
  const now = new Date()
  const arrivalDate = (input.slotDate || input.date).trim() || formatDate(now)
  const arrivalClock = normalizeClock((input.slotStartTime || input.time).trim() || '10:30')
  const store = ctx.stores.find(s => s.name === input.store) ?? ctx.stores[0]
  const product = ctx.products.find(p => input.productId && p.backendId === input.productId)
    ?? ctx.products.find(p => p.name === input.product)
    ?? ctx.products.find(p => p.active)
  if (!store) throw new Error('请先配置门店')
  if (!ctx.serviceGroups.length) await ctx.loadServiceGroups()
  const serviceGroup = ctx.serviceGroups.find(group => input.serviceGroupId && group.backendId === input.serviceGroupId)
    ?? ctx.serviceGroups.find(group => group.storeBackendId === store.backendId && input.product && group.name === input.product)
    ?? ctx.serviceGroups.find(group => group.storeBackendId === store.backendId && group.status === 'ACTIVE')
    ?? ctx.serviceGroups.find(group => group.storeBackendId === store.backendId)
    ?? ctx.serviceGroups[0]
  if (!serviceGroup) throw new Error('请先配置服务组')
  const durationMinutes = Number(input.durationMinutes || serviceGroup.durationMinutes || 30)
  const slotEndTime = normalizeClock(input.slotEndTime || addMinutesToClock(arrivalDate, arrivalClock, durationMinutes))

  if (ctx.demoMode) {
    const nextBackendId = createDemoBackendId('order')
    const order: BookingOrder = {
      backendId: nextBackendId,
      storeBackendId: store.backendId,
      productBackendId: product?.backendId,
      serviceGroupBackendId: serviceGroup.backendId,
      id: `YY-DEMO-${nextBackendId.slice(-12).toUpperCase()}`,
      customer: requireValue(input.name, '请输入客户姓名'),
      phone: requireValue(input.phone, '请输入手机号'),
      store: store.name,
      service: serviceGroup.name || product?.name || input.product || '到店预约',
      source: '手工录入',
      method: '到店拍摄',
      orderTime: toMDHM(now.toISOString()),
      orderDate: formatDate(now),
      orderClock: formatClock(now),
      arrivalTime: `${arrivalDate.slice(5)} ${arrivalClock}`,
      status: input.status === 'CONFIRMED' ? '已确认' : '待确认',
      payment: input.payStatus === 'PAID' ? '已支付' : '待支付',
      amount: parseMoneyToCents(product?.price ?? 0) / 100,
      arrivalDate,
      arrivalClock,
    }
    ctx.orders = [order, ...ctx.orders]
    return order
  }

  const dto = await backendApi.createOrder({
    customerName: requireValue(input.name, '请输入客户姓名'),
    customerPhone: requireValue(input.phone, '请输入手机号'),
    storeId: store.backendId,
    serviceGroupId: serviceGroup.backendId,
    productId: input.productId ?? product?.backendId ?? null,
    customerId: input.customerId ?? null,
    gender: input.gender,
    email: input.email,
    arrivalAt: toIsoArrival(arrivalDate, arrivalClock),
    scheduleMode: input.scheduleMode ?? 'SCHEDULED',
    slotDate: arrivalDate,
    slotStartTime: arrivalClock,
    slotEndTime,
    notifyEnabled: input.notifyEnabled ?? false,
    submitMode: input.submitMode ?? 'SAVE',
    payStatus: input.payStatus ?? 'UNPAID',
    status: input.status ?? 'PENDING',
    remark: input.remark ?? '',
  })
  const order = mapOrder(dto, ctx.stores)
  const operationalDate = getOrderOperationalDate(order)
  ctx.orders = operationalDate === todayKey()
    ? [order, ...ctx.orders.filter(o => o.backendId !== order.backendId)]
    : ctx.orders.filter(o => o.backendId !== order.backendId)
  ctx.reportOrders = [order, ...ctx.reportOrders.filter(o => o.backendId !== order.backendId)]
  await ctx.refreshOrderOperationalScope(order)
  return order
}

export async function updateOrderStatusAction(
  ctx: OrderActionContext,
  orderId: string,
  status: BookingOrderStatus,
  remark?: string,
) {
  const order = findOrderInCaches(ctx, orderId)
  if (!order) throw new Error('未找到订单')
  const originalStatus = order.status

  if (ctx.demoMode) {
    order.status = status
    syncOrderStatusToDerivedData(ctx, order, status)
    return order
  }

  order.status = status
  syncOrderStatusToDerivedData(ctx, order, status)
  try {
    const dto = await backendApi.updateOrderStatus({
      id: order.backendId,
      status,
      expectedStatus: originalStatus,
      remark,
    })
    const next = mapOrder(dto, ctx.stores)
    ctx.orders = ctx.orders.map(item => (item.backendId === next.backendId ? next : item))
    ctx.ledgerOrders = ctx.ledgerOrders.map(item => (item.backendId === next.backendId ? next : item))
    ctx.reportOrders = ctx.reportOrders.map(item => (item.backendId === next.backendId ? next : item))
    syncOrderStatusToDerivedData(ctx, next, next.status)
    void ctx.refreshOrderOperationalScope(next).catch(() => {})
    return next
  } catch (error) {
    order.status = originalStatus
    syncOrderStatusToDerivedData(ctx, order, originalStatus)
    throw error
  }
}

export async function rescheduleOrderAction(
  ctx: OrderActionContext,
  orderId: string,
  input: StaffOrderRescheduleInput,
) {
  const order = findOrderInCaches(ctx, orderId)
  if (!order) throw new Error('未找到订单')

  const arrivalDate = requireValue(input.date, '请选择改期日期')
  const arrivalClock = normalizeClock(requireValue(input.time, '请选择改期时间'))
  if (!/^\d{2}:\d{2}$/.test(arrivalClock)) throw new Error('改期时间格式不正确')
  const durationMinutes = Math.max(15, Number(input.durationMinutes) || 60)
  const slotEndTime = addMinutesToClock(arrivalDate, arrivalClock, durationMinutes)

  if (ctx.demoMode) {
    order.arrivalDate = arrivalDate
    order.arrivalClock = arrivalClock
    order.arrivalTime = `${arrivalDate.slice(5)} ${arrivalClock}`
    syncOrderScheduleToDerivedData(ctx, order, durationMinutes)
    return order
  }

  const dto = await backendApi.rescheduleOrder({
    id: order.backendId,
    expectedStatus: order.status,
    arrivalTime: toBackendDateTime(arrivalDate, arrivalClock),
    serviceGroupId: null,
    slotDate: arrivalDate,
    slotStartTime: arrivalClock,
    slotEndTime,
    remark: input.remark?.trim() || `工作台改期到 ${arrivalDate} ${arrivalClock}`,
  })
  const previousScopeOrder = { ...order }
  const next = mapOrder(dto, ctx.stores)
  ctx.orders = ctx.orders.map(item => (item.backendId === next.backendId ? next : item))
  syncOrderScheduleToDerivedData(ctx, next, durationMinutes)
  const scopeRefreshes = [
    ctx.refreshOrderOperationalScope(previousScopeOrder),
    previousScopeOrder.arrivalDate === next.arrivalDate && previousScopeOrder.storeBackendId === next.storeBackendId
      ? Promise.resolve()
      : ctx.refreshOrderOperationalScope(next),
  ]
  await Promise.all(scopeRefreshes)
  return next
}

export function syncOrderStatusToDerivedData(
  ctx: Pick<OrderActionContext, 'demoScheduleItems' | 'scheduleItems' | 'todaySlots'>,
  order: BookingOrder,
  status: BookingOrderStatus,
) {
  ctx.demoScheduleItems = ctx.demoScheduleItems.map(item =>
    item.orderId === order.backendId || item.orderNo === order.id
      ? { ...item, bookingStatus: status, orderStatus: status }
      : item,
  )
  ctx.scheduleItems = ctx.scheduleItems.map(item =>
    item.orderId === order.backendId || item.orderNo === order.id
      ? { ...item, bookingStatus: status, orderStatus: status }
      : item,
  )
  ctx.todaySlots = ctx.todaySlots.map(item =>
    item.orderId === order.backendId || item.orderNo === order.id
      ? { ...item, bookingStatus: status, orderStatus: status }
      : item,
  )
}

export function syncOrderScheduleToDerivedData(
  ctx: Pick<OrderActionContext, 'demoScheduleItems' | 'scheduleItems' | 'todaySlots'>,
  order: BookingOrder,
  durationMinutes = 60,
) {
  if (!order.arrivalDate || !order.arrivalClock) return
  const startAt = toIsoArrival(order.arrivalDate, order.arrivalClock)
  const endAt = toIsoArrival(order.arrivalDate, addMinutesToClock(order.arrivalDate, order.arrivalClock, durationMinutes))
  const applySchedule = (item: ScheduleItemDto): ScheduleItemDto =>
    item.orderId === order.backendId || item.orderNo === order.id
      ? { ...item, startAt, endAt }
      : item
  ctx.demoScheduleItems = ctx.demoScheduleItems.map(applySchedule)
  ctx.scheduleItems = ctx.scheduleItems.map(applySchedule)
  ctx.todaySlots = ctx.todaySlots.map(item =>
    item.orderId === order.backendId || item.orderNo === order.id
      ? { ...item, startAt, endAt }
      : item,
  )
}

const requireValue = (value: string, message: string) => {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(message)
  return trimmed
}
