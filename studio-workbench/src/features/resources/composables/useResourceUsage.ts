import { onMounted, ref } from 'vue'
import { backendApi, type ResourceUsageSummaryDto } from '../../../shared/api/backend'

export const useResourceUsage = () => {
  const loading = ref(false)
  const error = ref('')
  const summary = ref<ResourceUsageSummaryDto | null>(null)

  const refresh = async () => {
    loading.value = true
    error.value = ''
    try {
      summary.value = await backendApi.getResourceUsageSummary()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '资源用量加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    loading,
    error,
    summary,
    refresh,
  }
}
