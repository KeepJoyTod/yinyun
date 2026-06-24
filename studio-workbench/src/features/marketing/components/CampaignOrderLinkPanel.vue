<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Campaign Bridge</span>
        <h3 class="mt-1 text-[14px] font-semibold text-amber-dark">活动订单联动</h3>
      </div>
      <RouterLink class="yy-action border border-amber-dark px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" to="/order/campaign">
        打开活动订单
      </RouterLink>
    </div>
    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
        <div class="text-[10px] text-amber-text-muted">活动相关订单</div>
        <div class="mt-2 text-[22px] font-semibold text-amber-dark">{{ summary.totalOrders }}</div>
      </article>
      <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
        <div class="text-[10px] text-amber-text-muted">待跟进</div>
        <div class="mt-2 text-[22px] font-semibold text-amber-dark">{{ summary.pendingOrders }}</div>
      </article>
      <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
        <div class="text-[10px] text-amber-text-muted">已支付金额</div>
        <div class="mt-2 text-[22px] font-semibold text-amber-dark">{{ money }}</div>
      </article>
    </div>
    <div class="mt-4 space-y-2">
      <div v-for="source in summary.sources" :key="source.sourceLabel" class="flex items-center justify-between border-b border-amber-topbar-border/60 pb-2 text-[10.5px] text-amber-text-muted">
        <span>{{ source.sourceLabel }}</span>
        <strong class="text-amber-dark">{{ source.orderCount }} 单</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CampaignOrderBridgeSummary } from '../campaignOrderBridge'
import { formatMarketingMoney } from '../marketingScaffoldData'

const props = defineProps<{
  summary: CampaignOrderBridgeSummary
}>()

const money = computed(() => formatMarketingMoney(props.summary.paidAmountCent))
</script>
