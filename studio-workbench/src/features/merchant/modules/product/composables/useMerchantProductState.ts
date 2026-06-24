import { computed, ref } from 'vue'
import { appStore, type ChannelProductMappingInfo } from '../../../../../shared/stores/appStore'
import { useConcreteStoreScope } from '../../shared/useConcreteStoreScope'
import {
  buildMerchantProductCards,
  buildMerchantProductFilters,
  getCopyableProductEntry,
  getProductMissingList,
  getProductReadiness,
  type MerchantProductFilter,
} from '../merchantProductOperations'

type MerchantProductStateInput = {
  pushError: (message: string) => void
}

export const useMerchantProductState = (input: MerchantProductStateInput) => {
  const loading = ref(false)
  const activeFilter = ref<MerchantProductFilter>('all')
  const storeFilter = ref('')
  const searchQuery = ref('')
  const mappings = ref<ChannelProductMappingInfo[]>([])
  const { concreteStoreOptions, ensureWorkbenchStores } = useConcreteStoreScope(storeFilter)

  const filteredMappings = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return mappings.value.filter(mapping => {
      if (!storeFilter.value) return false
      if (activeFilter.value === 'ready' && !getProductReadiness(mapping).ready) return false
      if (activeFilter.value === 'missing' && getProductReadiness(mapping).ready) return false
      if (activeFilter.value === 'link' && !getCopyableProductEntry(mapping)) return false
      if (mapping.storeName !== storeFilter.value) return false
      if (!query) return true
      const haystack = `${mapping.storeName} ${mapping.productName} ${mapping.channelType} ${mapping.externalName} ${mapping.externalProductId} ${mapping.externalSkuId} ${mapping.externalPoiId} ${getCopyableProductEntry(mapping)} ${mapping.remark}`.toLowerCase()
      return haystack.includes(query)
    })
  })

  const quickFilters = computed(() => buildMerchantProductFilters(mappings.value))
  const cards = computed(() => buildMerchantProductCards(mappings.value))

  const reload = async () => {
    loading.value = true
    try {
      await ensureWorkbenchStores()
      const next = await appStore.loadChannelProductMappings('DOUYIN_LIFE')
      mappings.value = [...next]
      const storeOptions = concreteStoreOptions.value
        .map(store => store.name)
        .filter(name => next.some(item => item.storeName === name))
      if (!storeOptions.includes(storeFilter.value)) {
        storeFilter.value = storeOptions[0] ?? ''
      }
    } catch (error) {
      input.pushError(error instanceof Error ? `抖音产品加载失败：${error.message}` : '抖音产品加载失败')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    activeFilter,
    storeFilter,
    searchQuery,
    mappings,
    concreteStoreOptions,
    filteredMappings,
    quickFilters,
    cards,
    getCopyableProductEntry,
    getProductReadiness,
    getProductMissingList,
    reload,
  }
}
