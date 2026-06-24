import { computed, type Ref } from 'vue'
import { appStore } from '../../../../shared/stores/appStore'

export const useConcreteStoreScope = (storeFilter: Ref<string>) => {
  const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

  const normalizeStoreFilter = (preferred = storeFilter.value) => {
    const matched = concreteStoreOptions.value.find(store =>
      store.name === preferred || String(store.backendId) === preferred,
    )
    return String(matched?.backendId ?? concreteStoreOptions.value[0]?.backendId ?? '')
  }

  const ensureWorkbenchStores = async () => {
    while (appStore.loading) {
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    if (!appStore.initialized && !appStore.loading) {
      await appStore.bootstrap()
    }
  }

  const applyStoreScope = (preferred = storeFilter.value) => {
    const normalized = normalizeStoreFilter(preferred)
    storeFilter.value = normalized
    return normalized
  }

  return {
    concreteStoreOptions,
    normalizeStoreFilter,
    ensureWorkbenchStores,
    applyStoreScope,
  }
}
