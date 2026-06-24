import { backendApi, type PromotionTrialPayload, type PromotionTrialResultDto } from '../../shared/api/backend'
import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'
import { buildFallbackPromotionTrial } from './marketingScaffoldData'

export const buildPromotionTrialPayloadFromOrder = (
  order: BookingOrder,
  customer?: CustomerInfo | null,
): PromotionTrialPayload => ({
  orderId: order.id,
  storeId: String(order.storeBackendId || ''),
  customerId: customer?.backendId ? String(customer.backendId) : undefined,
  productId: order.productBackendId ? String(order.productBackendId) : undefined,
  productName: order.service,
  orderSource: order.source,
  customerLevel: customer?.memberLevel,
  originalAmountCent: order.amount * 100,
})

export const runPromotionTrialFacade = async (
  payload: PromotionTrialPayload,
): Promise<PromotionTrialResultDto> => {
  try {
    return await backendApi.runPromotionTrial(payload)
  } catch {
    return buildFallbackPromotionTrial(payload)
  }
}
