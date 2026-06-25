import { computed, ref, watch } from 'vue'
import type { WorkOrderDto, WorkOrderEventDto } from '../../shared/api/backend'
import type { BackendId } from '../../shared/api/backendId'
import { workOrdersApi } from '../../shared/api/backendWorkOrdersApi'
import { appStore } from '../../shared/stores/appStore'
import { useFeatureScopeGate } from '../system/useFeatureScopeGate'
import {
  buildCollaborationWorkOrderItems,
  resolveWorkOrderTransitionPayload,
  type CollaborationWorkOrderItem,
} from './workOrderRuntime'

const toErrorMessage = (error: unknown) => error instanceof Error ? error.message : '真实工单加载失败，请稍后重试。'

export const useCollaborationWorkOrders = (pageSize = 200) => {
  const featureGate = useFeatureScopeGate({
    featureKey: 'collaboration-work-orders',
    requireStoreScope: true,
  })
  const storeFilter = ref('')
  const rawWorkOrders = ref<WorkOrderDto[]>([])
  const workOrderEvents = ref<WorkOrderEventDto[]>([])
  const loading = ref(false)
  const eventsLoading = ref(false)
  const error = ref('')
  const eventsError = ref('')
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
    const seq = loadSeq.value + 1
    loadSeq.value = seq
    loading.value = true
    error.value = ''
    try {
      await featureGate.loadGate()
      if (!featureGate.canLoadData.value) {
        rawWorkOrders.value = []
        return
      }
    } catch (nextError) {
      if (seq !== loadSeq.value) return
      rawWorkOrders.value = []
      error.value = toErrorMessage(nextError)
      return
    } finally {
      if (seq === loadSeq.value) loading.value = false
    }
    const currentStoreId = selectedStoreId.value
    if (!currentStoreId) {
      rawWorkOrders.value = []
      error.value = ''
      return
    }
    loading.value = true
    error.value = ''
    try {
      const response = await workOrdersApi.listWorkOrders({
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
    const next = await workOrdersApi.transitionWorkOrder(payload)
    rawWorkOrders.value = rawWorkOrders.value.map(entry => (entry.id === next.id ? next : entry))
    return next
  }

  const loadWorkOrderEvents = async (id: BackendId | null | undefined) => {
    workOrderEvents.value = []
    eventsError.value = ''
    if (!id || !featureGate.canLoadData.value) return
    eventsLoading.value = true
    try {
      workOrderEvents.value = await workOrdersApi.listWorkOrderEvents(id)
    } catch (nextError) {
      eventsError.value = toErrorMessage(nextError)
    } finally {
      eventsLoading.value = false
    }
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
    workOrderEvents,
    loading,
    eventsLoading,
    error,
    eventsError,
    gate: featureGate.gate,
    gateLoading: featureGate.gateLoading,
    gateError: featureGate.gateError,
    canLoadData: featureGate.canLoadData,
    reload,
    transitionWorkOrder,
    loadWorkOrderEvents,
  }
}
