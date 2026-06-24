import { computed, onMounted, ref } from 'vue'
import { backendApi, type MarketingCapabilityDto } from '../../../shared/api/backend'
import { resolveFeatureGate, type FeatureGateResult } from '../../system/featureGate'
import { buildFallbackMarketingCapabilities } from '../marketingScaffoldData'

const marketingCapabilityFeatureKeyMap: Record<string, string> = {
  MARKETING_CENTER: 'marketing-center',
  COUPON_TEMPLATE: 'marketing-coupons',
  CAMPAIGN_MANAGEMENT: 'marketing-campaigns',
  PROMOTION_TRIAL: 'marketing-participations',
}

export type MarketingCapabilityGateViewModel = FeatureGateResult

export const useMarketingCapabilityGate = () => {
  const loading = ref(false)
  const error = ref('')
  const rawCapabilities = ref<MarketingCapabilityDto[]>([])

  const capabilities = computed<MarketingCapabilityGateViewModel[]>(() =>
    rawCapabilities.value.map(capability =>
      resolveFeatureGate({
        featureKey: marketingCapabilityFeatureKeyMap[capability.capabilityCode] || 'marketing-center',
        capability,
        requireStoreScope: true,
      }),
    ),
  )

  const capabilityMap = computed(() => new Map(capabilities.value.map(item => [item.capabilityCode, item])))

  const loadCapabilities = async () => {
    loading.value = true
    error.value = ''
    try {
      rawCapabilities.value = await backendApi.listMarketingCapabilities()
    } catch (err) {
      rawCapabilities.value = buildFallbackMarketingCapabilities()
      error.value = err instanceof Error ? err.message : '营销能力加载失败，已切到本地脚手架。'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCapabilities)

  return {
    loading,
    error,
    capabilities,
    capabilityMap,
    loadCapabilities,
  }
}
