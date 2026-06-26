import { apiRequest } from './request'
import type {
  CardBatchOrderCreatePayload,
  CardBatchOrderDto,
  CardBatchOrderListQuery,
} from './backendTypes'

export const cardBatchOrderApi = {
  listCardBatchOrders(query: CardBatchOrderListQuery = {}) {
    return apiRequest<CardBatchOrderDto[]>('/yy/card-batch-orders', {}, query)
  },
  createCardBatchOrder(payload: CardBatchOrderCreatePayload) {
    return apiRequest<CardBatchOrderDto>('/yy/card-batch-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
