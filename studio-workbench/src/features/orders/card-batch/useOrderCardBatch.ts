import { computed, ref } from 'vue'
import { backendApi, type CardBatchOrderDto } from '../../../shared/api/backend'
import {
  buildOrderCardBatchSummaryCards,
  createEmptyOrderCardBatchDraft,
  createEmptyOrderCardBatchFilters,
  normalizeOrderCardBatchQuery,
  toOrderCardBatchPayload,
} from './orderCardBatchScaffold'

export const useOrderCardBatch = () => {
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const filters = ref(createEmptyOrderCardBatchFilters())
  const draft = ref(createEmptyOrderCardBatchDraft())
  const orders = ref<CardBatchOrderDto[]>([])

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const load = async () => {
    loading.value = true
    clearMessages()
    try {
      orders.value = await backendApi.listCardBatchOrders(normalizeOrderCardBatchQuery(filters.value))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '加载批量开卡申请失败'
    } finally {
      loading.value = false
    }
  }

  const createCardBatchOrder = async () => {
    saving.value = true
    clearMessages()
    try {
      const created = await backendApi.createCardBatchOrder(toOrderCardBatchPayload(draft.value))
      successMessage.value = `批量开卡申请 ${created.batchNo} 已创建并进入审批队列`
      draft.value = createEmptyOrderCardBatchDraft()
      await load()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '创建批量开卡申请失败'
    } finally {
      saving.value = false
    }
  }

  const summaryCards = computed(() => buildOrderCardBatchSummaryCards(orders.value))

  return {
    loading,
    saving,
    errorMessage,
    successMessage,
    filters,
    draft,
    orders,
    summaryCards,
    load,
    createCardBatchOrder,
  }
}
