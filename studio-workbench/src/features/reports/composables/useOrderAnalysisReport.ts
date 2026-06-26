import { computed, ref } from 'vue'
import { backendApi, type OrderAnalysisScaffoldDto } from '../../../shared/api/backend'
import { studioAccessStore } from '../../../shared/stores/studioAccessStore'

const toDateKey = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    dateFrom: toDateKey(start),
    dateTo: toDateKey(end),
  }
}

const resolveDefaultStoreId = () => {
  if (studioAccessStore.globalStoreScope) return ''
  const identityStoreId = String(studioAccessStore.identity?.storeId ?? '').trim()
  if (identityStoreId) return identityStoreId
  return studioAccessStore.stores.find(store => store.primary)?.storeId
    ?? studioAccessStore.stores[0]?.storeId
    ?? ''
}

const emptyScaffold = (): OrderAnalysisScaffoldDto => ({
  overview: {
    orderedCount: 0,
    paidOrderCount: 0,
    paidAmountCent: 0,
    refundOrderCount: 0,
    refundAmountCent: 0,
    pendingAttentionCount: 0,
    boundaryNote: '订购分析优先读取 yy_payment_record；无支付流水时回退 yy_order.paidAmountCent/refundAmountCent，不写第二套统计账本。',
  },
  funnel: [],
  channels: [],
  refunds: [],
})

export const useOrderAnalysisReport = () => {
  const { dateFrom, dateTo } = currentMonthRange()
  const selectedStoreId = ref(resolveDefaultStoreId())
  const dateStart = ref(dateFrom)
  const dateEnd = ref(dateTo)
  const loading = ref(false)
  const error = ref('')
  const data = ref<OrderAnalysisScaffoldDto>(emptyScaffold())

  const storeOptions = computed(() => [
    { value: '', label: '全部门店' },
    ...studioAccessStore.stores.map(store => ({
      value: store.storeId,
      label: store.storeName,
    })),
  ])

  const hasData = computed(() =>
    data.value.overview.orderedCount > 0
    || data.value.funnel.length > 0
    || data.value.channels.length > 0
    || data.value.refunds.length > 0,
  )

  const reload = async () => {
    loading.value = true
    error.value = ''
    try {
      data.value = await backendApi.getOrderAnalysisOverview({
        storeId: selectedStoreId.value || undefined,
        dateFrom: dateStart.value || undefined,
        dateTo: dateEnd.value || undefined,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '订购分析加载失败'
      data.value = emptyScaffold()
    } finally {
      loading.value = false
    }
  }

  return {
    selectedStoreId,
    dateStart,
    dateEnd,
    loading,
    error,
    data,
    storeOptions,
    hasData,
    reload,
  }
}
