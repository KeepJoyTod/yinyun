import { onMounted, ref } from 'vue'
import {
  backendApi,
  type MarketingParticipationListQuery,
  type MarketingParticipationRowDto,
} from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackParticipations } from '../marketingScaffoldData'

export const useCampaignParticipation = () => {
  const loading = ref(false)
  const error = ref('')
  const filters = ref<MarketingParticipationListQuery>({})
  const participations = ref<MarketingParticipationRowDto[]>([])

  const loadParticipations = async () => {
    loading.value = true
    error.value = ''
    try {
      if (appStore.demoMode) {
        await Promise.all([
          appStore.orders.length ? Promise.resolve(appStore.orders) : appStore.loadAllOrders(),
          appStore.customers.length ? Promise.resolve(appStore.customers) : appStore.ensureCustomersLoaded(),
        ])
        participations.value = buildFallbackParticipations(appStore.orders, appStore.customers).map(item => ({
          participationId: item.participationId,
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          customerName: item.customerName,
          orderId: item.orderId,
          participationStatus: item.stage,
          conversionStatus: item.stage,
          refundStatus: item.stage === '已退款' ? 'REFUNDED' : 'NONE',
          invalidReason: item.nextAction,
          participatedAt: '',
          payableAmountCent: item.payableAmountCent,
          finalAmountCent: item.finalAmountCent,
        }))
      } else {
        participations.value = await backendApi.listCampaignParticipations(filters.value)
      }
    } catch (err) {
      participations.value = []
      error.value = err instanceof Error ? err.message : '活动参与记录加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadParticipations)

  return {
    loading,
    error,
    filters,
    participations,
    loadParticipations,
  }
}
