import { onMounted, ref } from 'vue'
import { backendApi, type MarketingCampaignScaffoldDto, type MarketingDashboardDto } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackCampaignScaffold, buildFallbackMarketingDashboard } from '../marketingScaffoldData'

const emptyCampaignScaffold = (): MarketingCampaignScaffoldDto => ({
  status: 'scaffold',
  boundary: '活动脚手架尚未接入。',
  campaigns: [],
  sources: [],
})

const emptyDashboard = (): MarketingDashboardDto => ({
  status: 'scaffold',
  boundary: '营销总览脚手架尚未接入。',
  metrics: [],
  channels: [],
})

export const useCampaignEditor = () => {
  const loading = ref(false)
  const error = ref('')
  const dashboard = ref<MarketingDashboardDto>(emptyDashboard())
  const scaffold = ref<MarketingCampaignScaffoldDto>(emptyCampaignScaffold())

  const loadCampaignScaffold = async () => {
    loading.value = true
    error.value = ''
    try {
      const [dashboardRow, campaignRow] = await Promise.all([
        backendApi.getMarketingDashboard(),
        backendApi.getCampaignScaffold(),
      ])
      dashboard.value = dashboardRow
      scaffold.value = campaignRow
    } catch (err) {
      const orders = appStore.orders.length ? appStore.orders : await appStore.loadAllOrders()
      dashboard.value = buildFallbackMarketingDashboard(orders)
      scaffold.value = buildFallbackCampaignScaffold(orders)
      error.value = err instanceof Error ? err.message : '活动脚手架加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCampaignScaffold)

  return {
    loading,
    error,
    dashboard,
    scaffold,
    loadCampaignScaffold,
  }
}
