import { computed, ref } from 'vue'
import type { FeatureScopeDto } from '../../shared/api/backend'
import { featureScopeApi } from '../../shared/api/backendFeatureScopeApi'
import { resolveFeatureGate, type FeatureGateInput } from './featureGate'

type FeatureScopeGateInput = Omit<FeatureGateInput, 'featureScope'>

export const useFeatureScopeGate = (input: FeatureScopeGateInput) => {
  const gate = ref(resolveFeatureGate(input))
  const gateLoading = ref(false)
  const gateError = ref('')
  const featureScope = ref<FeatureScopeDto | null>(null)

  const loadGate = async () => {
    gateLoading.value = true
    gateError.value = ''
    try {
      const scopes = await featureScopeApi.listFeatureScopes([input.featureKey])
      featureScope.value = scopes[0] ?? null
      gate.value = resolveFeatureGate({
        ...input,
        featureScope: featureScope.value,
      })
    } catch (caught) {
      featureScope.value = null
      gateError.value = caught instanceof Error ? caught.message : '授权门禁加载失败'
      gate.value = resolveFeatureGate(input)
    } finally {
      gateLoading.value = false
    }
  }

  const canLoadData = computed(() => gate.value.enabled && !gateError.value)

  return {
    gate,
    gateLoading,
    gateError,
    featureScope,
    canLoadData,
    loadGate,
  }
}
