<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Participations</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] text-amber-dark">活动参与记录</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        本页是只读查询页，读取真实活动参与、转化、退款和失效状态；后台不提供手工新增参与记录。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="campaignCapability" :capability="campaignCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <ParticipationTable
        :participations="participations"
        :filters="filters"
        :selected-id="selectedParticipationId"
        :loading="loading"
        @refresh="loadParticipations"
        @reset-filters="resetFilters"
        @select="selectedParticipationId = $event"
      />

      <PromotionTrialPanel :order="selectedOrder" :customer="selectedCustomer" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import ParticipationTable from './components/ParticipationTable.vue'
import PromotionTrialPanel from './components/PromotionTrialPanel.vue'
import { useCampaignParticipation } from './composables/useCampaignParticipation'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'

const { loading, error: participationError, filters, participations, loadParticipations } = useCampaignParticipation()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const selectedParticipationId = ref('')

watch(participations, value => {
  if (!value.some(item => item.participationId === selectedParticipationId.value)) {
    selectedParticipationId.value = value[0]?.participationId ?? ''
  }
}, { immediate: true })

const selectedParticipation = computed(() =>
  participations.value.find(item => item.participationId === selectedParticipationId.value) ?? null,
)
const campaignCapability = computed(() => capabilityMap.value.get('PROMOTION_TRIAL'))
const error = computed(() => capabilityError.value || participationError.value)
const selectedOrder = computed(() => appStore.orders.find(order => order.id === selectedParticipation.value?.orderId) ?? null)
const selectedCustomer = computed(() => appStore.customers.find(customer => customer.mobile === selectedOrder.value?.phone) ?? null)

const resetFilters = async () => {
  filters.value = {}
  await loadParticipations()
}
</script>
