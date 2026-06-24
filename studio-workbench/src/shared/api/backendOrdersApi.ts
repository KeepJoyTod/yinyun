import { apiRequest, apiRequestBlob, type BlobResponse, type PageResponse } from './request'
import type { BackendId } from './backendId'
import {
  buildAllOrdersQuery,
  buildTodayArrivalOrderQuery,
  mapOrderExportQuery,
  mapOrderListQuery,
  toFormBody,
  type OrderListQueryWithRouteSlot,
} from './backendQueryMappers'
import {
  mapYyOrder,
  orderStatusValues,
  type YyOrderVo,
} from './yingyueAdapter'
import type {
  OrderCreatePayload,
  OrderDto,
  OrderExportQuery,
  OrderListQuery,
  OrderReschedulePayload,
  OrderStatusPayload,
  ProductDto,
} from './backendTypes'

type OrderPresentation = {
  productId: BackendId | null
  serviceNameSnapshot: string
}

type OrdersApiDeps = {
  listRows: <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => Promise<T[]>
  ensureChannelProductMappingsLoaded: (channelType?: string) => Promise<void>
  resolveOrderPresentation: (row: YyOrderVo) => OrderPresentation
  getProducts: () => ProductDto[]
  getOrders: () => OrderDto[]
  setOrders: (items: OrderDto[]) => void
  getLedgerOrders: () => OrderDto[]
  setLedgerOrders: (items: OrderDto[]) => void
}

const replaceOrderInCaches = (
  orders: OrderDto[],
  ledgerOrders: OrderDto[],
  next: OrderDto,
  id: BackendId,
) => ({
  orders: orders.map(order => (order.id === id ? next : order)),
  ledgerOrders: ledgerOrders.map(order => (order.id === id ? next : order)),
})

export const createOrdersApi = (deps: OrdersApiDeps) => {
  const ordersApi = {
    async listTodayOrders() {
      const page = await ordersApi.listOrders(buildTodayArrivalOrderQuery())
      deps.setOrders(page.items)
      return page
    },
    async listAllOrders() {
      const page = await ordersApi.listOrders(buildAllOrdersQuery())
      deps.setLedgerOrders(page.items)
      return page
    },
    async listOrders(query: OrderListQuery = {}) {
      try {
        await deps.ensureChannelProductMappingsLoaded('DOUYIN_LIFE')
      } catch {
        // Order list should still render even if mapping metadata is temporarily unavailable.
      }
      const rows = await deps.listRows<YyOrderVo>('/yy/order/list', mapOrderListQuery(query as OrderListQueryWithRouteSlot))
      const orders = rows.map(row => mapYyOrder(row, deps.getProducts(), deps.resolveOrderPresentation(row)))
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
      const order = mapYyOrder(row, deps.getProducts(), deps.resolveOrderPresentation(row))
      deps.setOrders([order, ...deps.getOrders()])
      return order
    },
    async updateOrderStatus(payload: OrderStatusPayload) {
      const orders = deps.getOrders()
      const ledgerOrders = deps.getLedgerOrders()
      const current = orders.find(order => order.id === payload.id)
        ?? ledgerOrders.find(order => order.id === payload.id)
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
      const next = mapYyOrder(response, deps.getProducts(), deps.resolveOrderPresentation(response))
      const nextCaches = replaceOrderInCaches(orders, ledgerOrders, next, payload.id)
      deps.setOrders(nextCaches.orders)
      deps.setLedgerOrders(nextCaches.ledgerOrders)
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
      const next = mapYyOrder(response, deps.getProducts(), deps.resolveOrderPresentation(response))
      const nextCaches = replaceOrderInCaches(deps.getOrders(), deps.getLedgerOrders(), next, payload.id)
      deps.setOrders(nextCaches.orders)
      deps.setLedgerOrders(nextCaches.ledgerOrders)
      return next
    },
  }

  return ordersApi
}
