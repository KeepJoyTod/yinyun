<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Participations</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">活动参与记录</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        参与记录、转化状态、退款恢复和订单试算统一接到营销域；当前页面先展示真实接口骨架和回退 scaffold。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="campaignCapability" :capability="campaignCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-[14px] font-semibold text-amber-dark">参与记录</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">选中一条记录后，右侧直接查看固定优先级试算结果。</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="loadParticipations">
            刷新
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <article v-for="item in participations" :key="item.participationId" class="cursor-pointer border border-amber-topbar-border bg-[#FBF8F2] p-4" :class="selected?.participationId === item.participationId ? 'ring-1 ring-amber-dark' : ''" @click="selected = item">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ item.customerName }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.campaignName }} · {{ item.channelLabel }}</div>
              </div>
              <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-dark">{{ item.stage }}</span>
            </div>
            <div class="mt-3 text-[10.5px] text-amber-text-muted">
              应付 {{ formatMarketingMoney(item.payableAmountCent) }} · 成交 {{ formatMarketingMoney(item.finalAmountCent) }}
            </div>
          </article>
        </div>
      </div>

      <PromotionTrialPanel :order="selectedOrder" :customer="selectedCustomer" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import type { MarketingCampaignParticipationDto } from '../../shared/api/backend'
import { useCampaignParticipation } from './composables/useCampaignParticipation'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import PromotionTrialPanel from './components/PromotionTrialPanel.vue'
import { formatMarketingMoney } from './marketingScaffoldData'

const { participations, error: participationError, loadParticipations } = useCampaignParticipation()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const selected = ref<MarketingCampaignParticipationDto | null>(null)

watch(participations, value => {
  if (!value.some(item => item.participationId === selected.value?.participationId)) {
    selected.value = value[0] ?? null
  }
}, { immediate: true })

const campaignCapability = computed(() => capabilityMap.value.get('PROMOTION_TRIAL'))
const error = computed(() => capabilityError.value || participationError.value)
const selectedOrder = computed(() => appStore.orders.find(order => order.id === selected.value?.orderId) ?? null)
const selectedCustomer = computed(() => appStore.customers.find(customer => customer.mobile === selectedOrder.value?.phone) ?? null)
</script>
