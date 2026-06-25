import { onMounted, ref } from 'vue'
import {
  type ResourceSizeBackfillPayload,
  type ResourceSizeBackfillResultDto,
  type ResourceUsageSummaryDto,
} from '../../../shared/api/backend'
import { resourcesApi } from '../../../shared/api/backendResourcesApi'
import { useFeatureScopeGate } from '../../system/useFeatureScopeGate'

export const useResourceUsage = () => {
  const featureGate = useFeatureScopeGate({
    featureKey: 'resource-usage',
    requireStoreScope: true,
  })
  const loading = ref(false)
  const error = ref('')
  const summary = ref<ResourceUsageSummaryDto | null>(null)
  const backfilling = ref(false)
  const backfillError = ref('')
  const backfillResult = ref<ResourceSizeBackfillResultDto | null>(null)

  const refresh = async () => {
    loading.value = true
    error.value = ''
    try {
      await featureGate.loadGate()
      if (!featureGate.canLoadData.value) {
        summary.value = null
        return
      }
      summary.value = await resourcesApi.getResourceUsageSummary()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '资源用量加载失败'
    } finally {
      loading.value = false
    }
  }

  const runSizeBackfill = async (payload: ResourceSizeBackfillPayload = { limit: 50 }) => {
    backfilling.value = true
    backfillError.value = ''
    backfillResult.value = null
    try {
      if (!featureGate.canLoadData.value) {
        await featureGate.loadGate()
      }
      if (!featureGate.canLoadData.value) return
      backfillResult.value = await resourcesApi.backfillResourceSizes(payload)
      await refresh()
    } catch (caught) {
      backfillError.value = caught instanceof Error ? caught.message : '历史资源大小回填失败'
    } finally {
      backfilling.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    loading,
    error,
    gate: featureGate.gate,
    gateLoading: featureGate.gateLoading,
    gateError: featureGate.gateError,
    canLoadData: featureGate.canLoadData,
    summary,
    backfilling,
    backfillError,
    backfillResult,
    refresh,
    runSizeBackfill,
  }
}
