import { computed, ref } from 'vue'
import { backendApi, type MicroFormDto } from '../../../../../shared/api/backend'
import { appStore } from '../../../../../shared/stores/appStore'
import { useConcreteStoreScope } from '../../shared/useConcreteStoreScope'
import { selectMicroFormId } from '../merchantContentOperations'

type MerchantContentStateInput = {
  pushError: (message: string) => void
}

export const useMerchantContentState = (input: MerchantContentStateInput) => {
  const merchantMicroForms = ref<MicroFormDto[]>([])
  const keyword = ref('')
  const status = ref('')
  const storeFilter = ref('')
  const loading = ref(false)
  const total = ref(0)
  const selectedFormId = ref('')
  const { concreteStoreOptions, ensureWorkbenchStores, applyStoreScope } = useConcreteStoreScope(storeFilter)

  const publicBaseUrl = computed(() => {
    const configured = import.meta.env.VITE_PUBLIC_MICRO_FORM_BASE_URL
    return configured || 'https://weixin.yuyue123.cn/wx/?bid=sg9ix50p#/smallform/index'
  })

  const loadForms = async () => {
    loading.value = true
    try {
      await ensureWorkbenchStores()
      storeFilter.value = applyStoreScope()
      if (!storeFilter.value) {
        merchantMicroForms.value = []
        total.value = 0
        selectedFormId.value = ''
        return
      }
      const page = await backendApi.listMicroForms({
        formName: keyword.value || undefined,
        status: status.value || undefined,
        storeId: storeFilter.value || undefined,
        pageSize: 100,
      })
      merchantMicroForms.value = page.items
      total.value = page.total
      selectedFormId.value = selectMicroFormId(selectedFormId.value, page.items)
    } catch (error) {
      merchantMicroForms.value = []
      total.value = 0
      selectedFormId.value = ''
      input.pushError(error instanceof Error ? `微表单加载失败：${error.message}` : '微表单加载失败')
    } finally {
      loading.value = false
    }
  }

  const resetFilters = async () => {
    keyword.value = ''
    status.value = ''
    storeFilter.value = applyStoreScope()
    await loadForms()
  }

  return {
    appStore,
    merchantMicroForms,
    keyword,
    status,
    storeFilter,
    loading,
    total,
    selectedFormId,
    concreteStoreOptions,
    publicBaseUrl,
    loadForms,
    resetFilters,
  }
}
