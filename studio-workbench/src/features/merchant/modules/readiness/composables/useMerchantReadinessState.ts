import { computed, onMounted, ref } from 'vue'
import { useConcreteStoreScope } from '../../shared/useConcreteStoreScope'
import { merchantReadinessApi } from '../../../../../shared/api/backendMerchantReadinessApi'
import type { MerchantReadinessItemDto } from '../../../../../shared/api/backendTypes'
import {
  buildReadinessSummary,
  getMerchantReadinessSection,
  merchantReadinessSections,
  type MerchantReadinessSectionKey,
} from '../merchantReadinessOperations'

export const useMerchantReadinessState = (initialSection: MerchantReadinessSectionKey = 'summary') => {
  const loading = ref(false)
  const errorMessage = ref('')
  const selectedStoreId = ref('')
  const activeSection = ref<MerchantReadinessSectionKey>(initialSection)
  const summaryItems = ref<MerchantReadinessItemDto[]>([])
  const scheduleItems = ref<MerchantReadinessItemDto[]>([])
  const channelItems = ref<MerchantReadinessItemDto[]>([])
  const governanceItems = ref<MerchantReadinessItemDto[]>([])
  const dependencyItems = ref<MerchantReadinessItemDto[]>([])

  const { concreteStoreOptions, ensureWorkbenchStores, applyStoreScope } = useConcreteStoreScope(selectedStoreId)

  const currentItems = computed(() => {
    switch (activeSection.value) {
      case 'schedule':
        return scheduleItems.value
      case 'channels':
        return channelItems.value
      case 'governance':
        return governanceItems.value
      case 'dependencies':
        return dependencyItems.value
      default:
        return summaryItems.value
    }
  })

  const summary = computed(() => buildReadinessSummary(currentItems.value))
  const currentSection = computed(() => getMerchantReadinessSection(activeSection.value))
  const selectedStore = computed(() =>
    concreteStoreOptions.value.find(store => String(store.backendId) === selectedStoreId.value) ?? null,
  )
  const selectedStoreLabel = computed(() => selectedStore.value?.name || '全部门店')

  const reload = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      await ensureWorkbenchStores()
      applyStoreScope()
      const [summaryList, scheduleList, channelList, governanceList, dependencyList] = await Promise.all([
        merchantReadinessApi.getMerchantReadinessSummary(),
        merchantReadinessApi.getMerchantScheduleReadiness(),
        merchantReadinessApi.getMerchantChannelReadiness(),
        merchantReadinessApi.getMerchantGovernanceReadiness(),
        merchantReadinessApi.getMerchantDependencyReadiness(),
      ])
      summaryItems.value = summaryList
      scheduleItems.value = scheduleList
      channelItems.value = channelList
      governanceItems.value = governanceList
      dependencyItems.value = dependencyList
      if (!activeSection.value || !merchantReadinessSections.some(section => section.key === activeSection.value)) {
        activeSection.value = 'summary'
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '商家 readiness 加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void reload()
  })

  return {
    loading,
    errorMessage,
    selectedStoreId,
    activeSection,
    concreteStoreOptions,
    summaryItems,
    scheduleItems,
    channelItems,
    governanceItems,
    dependencyItems,
    currentItems,
    currentSection,
    selectedStoreLabel,
    summary,
    reload,
  }
}
