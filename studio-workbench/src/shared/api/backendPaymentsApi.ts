import { apiRequest } from './request'
import type { ProductDto } from './backendTypes'
import type { OrderDto, OrderPaymentConfirmPayload } from './backendTypes'
import { mapYyOrder, type YyOrderVo } from './yingyueAdapter'
import type { BackendId } from './backendId'

type OrderPresentation = {
  productId: BackendId | null
  serviceNameSnapshot: string
}

type PaymentsApiDeps = {
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

export const createPaymentsApi = (deps: PaymentsApiDeps) => ({
  async confirmOrderPayment(payload: OrderPaymentConfirmPayload) {
    const body = {
      amountCent: payload.amountCent,
      remark: payload.remark,
    }
    const response = await apiRequest<YyOrderVo>(`/yy/order/${payload.id}/payment/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const next = mapYyOrder(response, deps.getProducts(), deps.resolveOrderPresentation(response))
    const nextCaches = replaceOrderInCaches(deps.getOrders(), deps.getLedgerOrders(), next, payload.id)
    deps.setOrders(nextCaches.orders)
    deps.setLedgerOrders(nextCaches.ledgerOrders)
    return next
  },
})
