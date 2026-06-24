<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Campaigns</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">活动清单脚手架</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        固定路由不变，内部改为真实活动域 owner。活动商品、来源承接和活动订单联动都从这里统一接出去。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="campaignCapability" :capability="campaignCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-[14px] font-semibold text-amber-dark">活动清单</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">{{ scaffold.boundary }}</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="loadCampaignScaffold">
            刷新
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <article v-for="campaign in scaffold.campaigns" :key="campaign.campaignId" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ campaign.campaignName }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ campaign.timeRangeLabel }}</div>
              </div>
              <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-dark">{{ campaign.campaignType }}</span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3 text-[10.5px] text-amber-text-muted">
              <div>{{ campaign.storeScopeLabel }}</div>
              <div>{{ campaign.productScopeLabel }}</div>
              <div>参与 {{ campaign.participantCount }} 人</div>
              <div>支付 {{ formatMarketingMoney(campaign.paidAmountCent) }}</div>
            </div>
          </article>
        </div>
      </div>

      <CampaignOrderLinkPanel :summary="summary" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { buildCampaignOrderBridgeSummary } from './campaignOrderBridge'
import { useCampaignEditor } from './composables/useCampaignEditor'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'
import CampaignOrderLinkPanel from './components/CampaignOrderLinkPanel.vue'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import { formatMarketingMoney } from './marketingScaffoldData'

const { scaffold, error: campaignError, loadCampaignScaffold } = useCampaignEditor()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const campaignCapability = computed(() => capabilityMap.value.get('CAMPAIGN_MANAGEMENT'))
const error = computed(() => capabilityError.value || campaignError.value)
const summary = computed(() => buildCampaignOrderBridgeSummary(appStore.orders))
</script>
