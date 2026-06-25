<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Marketing Center</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">营销总览</h2>
          <p class="mt-2 max-w-[820px] text-[13.5px] leading-relaxed text-amber-text-muted">
            用真实营销域脚手架替换只读派生页，保留当前路由外观，并为券模板、活动、参与和试算预留正式账本接口。
          </p>
        </div>
        <RouterLink class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] hover:bg-black" to="/order/campaign">
          打开活动订单
        </RouterLink>
      </div>
    </section>

    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-4">
      <MarketingCapabilityGateCard v-for="capability in capabilities" :key="capability.capabilityCode" :capability="capability" />
    </section>

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="metric in dashboard.metrics" :key="metric.metricCode" class="yy-console-card border border-amber-topbar-border bg-[#FBF8F2] p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ metric.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ metric.hint }}</div>
          <div class="mt-4 text-[24px] font-semibold text-amber-dark">{{ metric.value }}</div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-[14px] font-semibold text-amber-dark">来源承接</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">{{ dashboard.boundary }}</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="reload">
            刷新
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <article v-for="channel in dashboard.channels" :key="channel.sourceLabel" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ channel.sourceLabel }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">订单 {{ channel.orderCount }} 单 · 已支付 {{ channel.paidOrderCount }} 单</div>
              </div>
              <span class="font-mono text-[10px] text-amber-dark">{{ formatMarketingMoney(channel.paidAmountCent) }}</span>
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
import { formatMarketingMoney } from './marketingScaffoldData'
import CampaignOrderLinkPanel from './components/CampaignOrderLinkPanel.vue'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'

const { capabilities, error: capabilityError } = useMarketingCapabilityGate()
const { dashboard, error: dashboardError, loadCampaigns: reload } = useCampaignEditor()

const error = computed(() => capabilityError.value || dashboardError.value)
const summary = computed(() => buildCampaignOrderBridgeSummary(appStore.orders))
</script>
