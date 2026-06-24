import { ref, watch, type Ref } from 'vue'
import type { BookingOrder, CustomerInfo } from '../../../shared/stores/appStore'
import { buildPromotionTrialPayloadFromOrder, runPromotionTrialFacade } from '../promotionPricingFacade'
import type { PromotionTrialResultDto } from '../../../shared/api/backend'

export const usePromotionTrial = (
  orderRef: Ref<BookingOrder | null | undefined>,
  customerRef?: Ref<CustomerInfo | null | undefined>,
) => {
  const loading = ref(false)
  const error = ref('')
  const result = ref<PromotionTrialResultDto | null>(null)

  const runTrial = async () => {
    const order = orderRef.value
    if (!order) {
      result.value = null
      return
    }
    loading.value = true
    error.value = ''
    try {
      result.value = await runPromotionTrialFacade(
        buildPromotionTrialPayloadFromOrder(order, customerRef?.value),
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : '优惠试算失败'
      result.value = null
    } finally {
      loading.value = false
    }
  }

  watch(orderRef, () => {
    void runTrial()
  }, { immediate: true })

  return {
    loading,
    error,
    result,
    runTrial,
  }
}
