import { computed, onMounted, ref } from 'vue'
import {
  backendApi,
  type MarketingCampaignDto,
  type MarketingCampaignListQuery,
  type MarketingCampaignPayload,
  type MarketingDashboardDto,
} from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackCampaignScaffold, buildFallbackMarketingDashboard } from '../marketingScaffoldData'

export type CampaignDraft = {
  campaignName: string
  campaignType: string
  storeIds: string[]
  productIds: string[]
  startAt: string
  endAt: string
  status: string
  ruleSummary: string
}

const emptyDashboard = (): MarketingDashboardDto => ({
  status: 'ready',
  boundary: '营销总览读取真实营销账本和统一订单账本。',
  metrics: [],
  channels: [],
})

const defaultDraft = (): CampaignDraft => ({
  campaignName: '',
  campaignType: 'SECKILL',
  storeIds: [],
  productIds: [],
  startAt: '',
  endAt: '',
  status: 'DRAFT',
  ruleSummary: '',
})

const scaffoldToCampaigns = (): MarketingCampaignDto[] =>
  buildFallbackCampaignScaffold(appStore.orders).campaigns.map(campaign => ({
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    campaignType: campaign.campaignType,
    status: campaign.status,
    storeIds: [],
    productIds: [],
    storeScopeLabel: campaign.storeScopeLabel,
    productScopeLabel: campaign.productScopeLabel,
    startAt: '',
    endAt: '',
    timeRangeLabel: campaign.timeRangeLabel,
    participantCount: campaign.participantCount,
    orderCount: campaign.orderCount,
    paidAmountCent: campaign.paidAmountCent,
    ruleSummary: '',
  }))

const toPayload = (draft: CampaignDraft): MarketingCampaignPayload => ({
  campaignName: draft.campaignName.trim(),
  campaignType: draft.campaignType,
  storeIds: draft.storeIds,
  productIds: draft.productIds,
  startAt: draft.startAt,
  endAt: draft.endAt,
  status: draft.status || 'DRAFT',
  ruleSummary: draft.ruleSummary.trim(),
})

export const useCampaignEditor = () => {
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const dashboard = ref<MarketingDashboardDto>(emptyDashboard())
  const filters = ref<MarketingCampaignListQuery>({})
  const campaigns = ref<MarketingCampaignDto[]>([])
  const selectedCampaignId = ref('')

  const selectedCampaign = computed(() =>
    campaigns.value.find(item => item.campaignId === selectedCampaignId.value) ?? campaigns.value[0] ?? null,
  )
  const scaffold = computed(() => ({
    status: dashboard.value.status,
    boundary: dashboard.value.boundary,
    campaigns: campaigns.value,
  }))

  const buildDraft = (campaign?: MarketingCampaignDto | null): CampaignDraft => {
    if (!campaign) return defaultDraft()
    return {
      campaignName: campaign.campaignName,
      campaignType: campaign.campaignType,
      storeIds: [...campaign.storeIds],
      productIds: [...campaign.productIds],
      startAt: campaign.startAt ?? '',
      endAt: campaign.endAt ?? '',
      status: campaign.status,
      ruleSummary: campaign.ruleSummary,
    }
  }

  const loadCampaigns = async () => {
    loading.value = true
    error.value = ''
    try {
      if (appStore.demoMode) {
        const orders = appStore.orders.length ? appStore.orders : await appStore.loadAllOrders()
        dashboard.value = buildFallbackMarketingDashboard(orders)
        campaigns.value = scaffoldToCampaigns()
      } else {
        const [dashboardRow, campaignRows] = await Promise.all([
          backendApi.getMarketingDashboard(),
          backendApi.listCampaigns(filters.value),
        ])
        dashboard.value = dashboardRow
        campaigns.value = campaignRows
      }
      if (!campaigns.value.some(item => item.campaignId === selectedCampaignId.value)) {
        selectedCampaignId.value = campaigns.value[0]?.campaignId ?? ''
      }
    } catch (err) {
      campaigns.value = []
      dashboard.value = emptyDashboard()
      error.value = err instanceof Error ? err.message : '活动列表加载失败'
    } finally {
      loading.value = false
    }
  }

  const saveCampaign = async (draft: CampaignDraft, campaignId?: string) => {
    submitting.value = true
    error.value = ''
    try {
      const payload = toPayload(draft)
      if (!appStore.demoMode) {
        if (campaignId) await backendApi.updateCampaign(campaignId, payload)
        else await backendApi.createCampaign(payload)
        if (campaignId) await backendApi.bindCampaignProducts(campaignId, { productIds: payload.productIds })
      }
      await loadCampaigns()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '活动保存失败'
      throw err
    } finally {
      submitting.value = false
    }
  }

  const setCampaignOnline = async (campaign: MarketingCampaignDto) => {
    submitting.value = true
    error.value = ''
    try {
      if (!appStore.demoMode) await backendApi.onlineCampaign(campaign.campaignId)
      await loadCampaigns()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '活动上线失败'
      throw err
    } finally {
      submitting.value = false
    }
  }

  const setCampaignOffline = async (campaign: MarketingCampaignDto) => {
    submitting.value = true
    error.value = ''
    try {
      if (!appStore.demoMode) await backendApi.offlineCampaign(campaign.campaignId)
      await loadCampaigns()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '活动下线失败'
      throw err
    } finally {
      submitting.value = false
    }
  }

  onMounted(loadCampaigns)

  return {
    loading,
    submitting,
    error,
    dashboard,
    filters,
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    buildDraft,
    scaffold,
    loadCampaigns,
    loadCampaignScaffold: loadCampaigns,
    saveCampaign,
    setCampaignOnline,
    setCampaignOffline,
  }
}
