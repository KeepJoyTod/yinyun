import { computed, ref } from 'vue'
import { normalizeStoreScope } from '../../../merchantDecorationOperations'

export const useMerchantDecorationState = (initialStoreId?: string | string[]) => {
  const storeScope = ref(normalizeStoreScope(initialStoreId))
  const isGlobalStoreScope = computed(() => storeScope.value === '0')
  return {
    storeScope,
    isGlobalStoreScope,
  }
}
