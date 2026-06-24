import { computed, ref, watch } from 'vue'
import { backendApi, type WorkOrderDto } from '../../shared/api/backend'
import { appStore } from '../../shared/stores/appStore'
import {
  buildCollaborationWorkOrderItems,
  resolveWorkOrderTransitionPayload,
  type CollaborationWorkOrderItem,
} from './workOrderRuntime'

const toErrorMessage = (error: unknown) => error instanceof Error ? error.message : '真实工单加载失败，请稍后重试。'

export const useCollaborationWorkOrders = (pageSize = 200) => {
  const storeFilter = ref('')
  const rawWorkOrders = ref<WorkOrderDto[]>([])
  const loading = ref(false)
  const error = ref('')
  const loadSeq = ref(0)

  const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))
  const selectedStoreId = computed(() =>
    concreteStoreOptions.value.find(store => String(store.backendId) === storeFilter.value)?.backendId ?? null,
  )

  const normalizeStoreFilter = (preferred = storeFilter.value) => {
    const matched = concreteStoreOptions.value.find(store => store.name === preferred || String(store.backendId) === preferred)
    return matched?.backendId ? String(matched.backendId) : String(concreteStoreOptions.value[0]?.backendId ?? '')
  }

  const ensureWorkbenchStores = async () => {
    while (appStore.loading) {
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    if (!appStore.initialized && !appStore.loading) {
      await appStore.bootstrap()
    }
  }

  const workOrders = computed<CollaborationWorkOrderItem[]>(() => {
    const items = buildCollaborationWorkOrderItems({
      workOrders: rawWorkOrders.value,
      orders: appStore.orders,
      albums: appStore.albums,
      selectionLinks: appStore.selectionLinks,
    })
    if (!storeFilter.value) return []
    return items.filter(item => String(item.order.storeBackendId) === storeFilter.value)
  })

  const reload = async () => {
    const currentStoreId = selectedStoreId.value
    const seq = loadSeq.value + 1
    loadSeq.value = seq
    if (!currentStoreId) {
      rawWorkOrders.value = []
      error.value = ''
      loading.value = false
      return
    }
    loading.value = true
    error.value = ''
    try {
      const response = await backendApi.listWorkOrders({
        storeId: currentStoreId,
        pageNum: 1,
        pageSize,
      })
      if (seq !== loadSeq.value) return
      rawWorkOrders.value = response.items
    } catch (nextError) {
      if (seq !== loadSeq.value) return
      rawWorkOrders.value = []
      error.value = toErrorMessage(nextError)
    } finally {
      if (seq === loadSeq.value) loading.value = false
    }
  }

  const transitionWorkOrder = async (item: CollaborationWorkOrderItem, remark = '') => {
    const payload = resolveWorkOrderTransitionPayload(item, remark)
    if (!payload) return null
    const next = await backendApi.transitionWorkOrder(payload)
    rawWorkOrders.value = rawWorkOrders.value.map(entry => (entry.id === next.id ? next : entry))
    return next
  }

  watch(selectedStoreId, () => {
    void reload()
  })

  watch(
    () => concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|'),
    () => {
      const next = normalizeStoreFilter()
      if (next !== storeFilter.value) {
        storeFilter.value = next
      }
    },
  )

  return {
    storeFilter,
    concreteStoreOptions,
    normalizeStoreFilter,
    ensureWorkbenchStores,
    workOrders,
    loading,
    error,
    reload,
    transitionWorkOrder,
  }
}
