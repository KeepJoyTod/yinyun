import { ref } from 'vue'
import { appStore, type ServiceGroupInfo } from '../../../../../shared/stores/appStore'
import { useConcreteStoreScope } from '../../shared/useConcreteStoreScope'
import type { ServiceGroupStatusFilter } from '../merchantConfigOperations'

type MerchantConfigStateInput = {
  initialStoreId?: string
  pushError: (message: string) => void
}

export const useMerchantConfigState = (input: MerchantConfigStateInput) => {
  const loading = ref(false)
  const searchQuery = ref('')
  const storeFilter = ref(String(input.initialStoreId ?? ''))
  const activeFilter = ref<ServiceGroupStatusFilter>('all')
  const groups = ref<ServiceGroupInfo[]>([])
  const { concreteStoreOptions, ensureWorkbenchStores, applyStoreScope } = useConcreteStoreScope(storeFilter)

  const reload = async () => {
    loading.value = true
    try {
      await ensureWorkbenchStores()
      storeFilter.value = applyStoreScope()
      if (!storeFilter.value) {
        groups.value = []
        return
      }
      groups.value = [...await appStore.loadServiceGroups()]
    } catch (error) {
      input.pushError(error instanceof Error ? error.message : '服务组加载失败')
    } finally {
      loading.value = false
    }
  }

  const resetFilters = () => {
    storeFilter.value = applyStoreScope()
    searchQuery.value = ''
    activeFilter.value = 'all'
  }

  return {
    loading,
    searchQuery,
    storeFilter,
    activeFilter,
    groups,
    concreteStoreOptions,
    reload,
    resetFilters,
  }
}
