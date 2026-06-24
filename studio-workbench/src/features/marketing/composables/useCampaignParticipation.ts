import { onMounted, ref } from 'vue'
import { backendApi, type MarketingCampaignParticipationDto } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackParticipations } from '../marketingScaffoldData'

export const useCampaignParticipation = () => {
  const loading = ref(false)
  const error = ref('')
  const participations = ref<MarketingCampaignParticipationDto[]>([])

  const loadParticipations = async () => {
    loading.value = true
    error.value = ''
    try {
      participations.value = await backendApi.getCampaignParticipationScaffold()
    } catch (err) {
      await Promise.all([
        appStore.orders.length ? Promise.resolve(appStore.orders) : appStore.loadAllOrders(),
        appStore.customers.length ? Promise.resolve(appStore.customers) : appStore.ensureCustomersLoaded(),
      ])
      participations.value = buildFallbackParticipations(appStore.orders, appStore.customers)
      error.value = err instanceof Error ? err.message : '活动参与记录加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadParticipations)

  return {
    loading,
    error,
    participations,
    loadParticipations,
  }
}
