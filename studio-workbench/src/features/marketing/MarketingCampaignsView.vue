<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Campaigns</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] text-amber-dark">活动管理</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        活动创建、编辑、上下线和商品绑定已经接到真实营销域；订单联动仍读取统一 yy_order。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="campaignCapability" :capability="campaignCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <CampaignTable
        :campaigns="campaigns"
        :selected-id="selectedCampaignId"
        :loading="loading"
        @create="openCampaignDrawer()"
        @edit="openCampaignDrawer"
        @refresh="loadCampaigns"
        @select="selectedCampaignId = $event"
        @online="onlineCampaign"
        @offline="offlineCampaign"
      />

      <CampaignOrderLinkPanel :summary="summary" />
    </section>

    <CampaignDrawer
      :show="drawerOpen"
      :campaign-id="editingCampaignId"
      :initial-draft="campaignDraft"
      :stores="appStore.stores"
      :products="appStore.products"
      :submitting="submitting"
      @close="drawerOpen = false"
      @submit="submitCampaign"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { buildCampaignOrderBridgeSummary } from './campaignOrderBridge'
import CampaignDrawer from './components/CampaignDrawer.vue'
import CampaignOrderLinkPanel from './components/CampaignOrderLinkPanel.vue'
import CampaignTable from './components/CampaignTable.vue'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import { useCampaignEditor, type CampaignDraft } from './composables/useCampaignEditor'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'

const {
  loading,
  submitting,
  error: campaignError,
  campaigns,
  selectedCampaignId,
  buildDraft,
  loadCampaigns,
  saveCampaign,
  setCampaignOnline,
  setCampaignOffline,
} = useCampaignEditor()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const drawerOpen = ref(false)
const editingCampaignId = ref('')
const campaignDraft = ref<CampaignDraft>(buildDraft())

const campaignCapability = computed(() => capabilityMap.value.get('CAMPAIGN_MANAGEMENT'))
const error = computed(() => capabilityError.value || campaignError.value)
const summary = computed(() => buildCampaignOrderBridgeSummary(appStore.orders))

const openCampaignDrawer = (campaignId = '') => {
  editingCampaignId.value = campaignId
  campaignDraft.value = buildDraft(campaigns.value.find(item => item.campaignId === campaignId) ?? null)
  drawerOpen.value = true
}

const submitCampaign = async (draft: CampaignDraft) => {
  await saveCampaign(draft, editingCampaignId.value || undefined)
  drawerOpen.value = false
}

const onlineCampaign = async (campaignId: string) => {
  const campaign = campaigns.value.find(item => item.campaignId === campaignId)
  if (campaign) await setCampaignOnline(campaign)
}

const offlineCampaign = async (campaignId: string) => {
  const campaign = campaigns.value.find(item => item.campaignId === campaignId)
  if (campaign) await setCampaignOffline(campaign)
}

onMounted(async () => {
  if (!appStore.initialized && !appStore.loading) await appStore.bootstrap().catch(() => undefined)
})
</script>
