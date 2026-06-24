import type { BookingOrder } from '../../shared/stores/appStore'
import { isOperationalOrder } from '../../shared/stores/orderIssueRules'
import {
  isSelectionFollowOrder,
  isTodayArrivalOrder,
  isTodayOperationalOrder,
  isTodayPendingConfirmOrder,
} from './orderStatusOperations'

export type {
  OrderStatusGroupKey,
  OrderStatusGroupCount,
  OrderFlowStep,
} from './orderStatusOperations'

export type QuickOrderFilter = 'todayOps' | 'all' | 'douyin30' | 'today' | 'pending' | 'selection' | 'issues'

export {
  isSelectionFollowOrder,
  isTodayArrivalOrder,
  isTodayOperationalOrder,
  isTodayPendingConfirmOrder,
} from './orderStatusOperations'

export { isOperationalOrder } from '../../shared/stores/orderIssueRules'

export const quickOrderFilterKeys = ['todayOps', 'all', 'douyin30', 'today', 'pending', 'selection', 'issues'] as const

export const matchesQuickOrderFilter = (order: BookingOrder, filter: QuickOrderFilter, todayKey: string) => {
  if (filter === 'todayOps') return isTodayOperationalOrder(order, todayKey)
  if (filter === 'today') return isTodayArrivalOrder(order, todayKey)
  if (filter === 'pending') return isTodayPendingConfirmOrder(order, todayKey)
  if (filter === 'selection') return isSelectionFollowOrder(order)
  if (filter === 'issues') return !isOperationalOrder(order)
  if (filter === 'douyin30') return true
  return true
}

export const matchesOrderDeepLinkQuery = (order: BookingOrder, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return false
  return [
    order.id,
    String(order.backendId),
    order.customer,
    order.phone,
  ].some(value => String(value || '').toLowerCase().includes(normalizedQuery))
}

export const matchesOrderDeepLinkId = (order: BookingOrder, orderId: string) => {
  const normalizedId = orderId.trim()
  if (!normalizedId) return false
  return [order.id, order.backendId].some(value => String(value || '') === normalizedId)
}

export type OrderSearchQueryStateInput = {
  inputValue: string
  routeQueryValue: unknown
  slotScoped?: boolean
  userEdited: boolean
}

export type OrderSearchQueryState = {
  effectiveValue: string
  urlValue: string | undefined
}

export type OrderSearchInputGuard = {
  routeQueryValue: unknown
  userArmed: boolean
}

const readOrderQueryString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

export const shouldAcceptOrderSearchInput = ({
  routeQueryValue,
  userArmed,
}: OrderSearchInputGuard) => {
  return userArmed || readOrderQueryString(routeQueryValue).trim().length > 0
}

export const resolveOrderSearchQueryState = ({
  inputValue,
  routeQueryValue,
  slotScoped = false,
  userEdited,
}: OrderSearchQueryStateInput): OrderSearchQueryState => {
  const routeValue = slotScoped && !userEdited ? '' : readOrderQueryString(routeQueryValue).trim()
  const draftValue = inputValue.trim()
  const effectiveValue = userEdited ? draftValue : routeValue
  return {
    effectiveValue,
    urlValue: effectiveValue || undefined,
  }
}

export const buildQuickOrderFilters = (orders: BookingOrder[], todayKey: string) => [
  {
    key: 'todayOps' as const,
    label: '今日待处理',
    count: orders.filter(order => isTodayOperationalOrder(order, todayKey)).length,
  },
  { key: 'all' as const, label: '全部订单', count: orders.length },
  { key: 'douyin30' as const, label: '近30天来客', count: orders.length },
  {
    key: 'today' as const,
    label: '只看今日',
    count: orders.filter(order => isTodayArrivalOrder(order, todayKey)).length,
  },
  {
    key: 'pending' as const,
    label: '待确认优先',
    count: orders.filter(order => isTodayPendingConfirmOrder(order, todayKey)).length,
  },
  {
    key: 'selection' as const,
    label: '客片交付',
    count: orders.filter(isSelectionFollowOrder).length,
  },
  {
    key: 'issues' as const,
    label: '异常缺资料',
    count: orders.filter(order => !isOperationalOrder(order)).length,
  },
]

export type OrderOperationCard = {
  label: string
  value: string
  hint: string
  action: string
  scope: string
  filter: QuickOrderFilter
}

export const buildOrderOperationCards = (orders: BookingOrder[], todayKey: string): OrderOperationCard[] => {
  const todayArrivalOrders = orders.filter(order => isTodayArrivalOrder(order, todayKey))
  const todayOperationalOrders = orders.filter(order => isTodayOperationalOrder(order, todayKey))
  const todayPendingConfirmOrders = orders.filter(order => isTodayPendingConfirmOrder(order, todayKey))
  const selectionFollowOrders = orders.filter(isSelectionFollowOrder)

  return [
    {
      label: '今日到店',
      value: String(todayArrivalOrders.length),
      hint: '今日预约到店客户，需要核对排期和门店承接。',
      action: '看今日安排',
      scope: '今日',
      filter: 'today',
    },
    {
      label: '今日待确认',
      value: String(todayPendingConfirmOrders.length),
      hint: '今天到店且还未确认的预约，优先电话或微信确认。',
      action: '先确认',
      scope: '确认',
      filter: 'pending',
    },
    {
      label: '待服务',
      value: String(todayOperationalOrders.length),
      hint: '今日处于确认、到店或服务中的订单，避免漏接待。',
      action: '看履约',
      scope: '履约',
      filter: 'today',
    },
    {
      label: '客片交付',
      value: String(selectionFollowOrders.length),
      hint: '服务完成后进入选片、精修或资料发送的订单。',
      action: '看客片',
      scope: '客片',
      filter: 'selection',
    },
  ]
}
