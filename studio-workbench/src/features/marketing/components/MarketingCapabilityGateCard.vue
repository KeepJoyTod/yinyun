<template>
  <FeatureGateStatusCard :gate="capability" />
</template>

<script setup lang="ts">
import FeatureGateStatusCard from '../../system/FeatureGateStatusCard.vue'
import type { MarketingCapabilityGateViewModel } from '../composables/useMarketingCapabilityGate'

defineProps<{
  capability: MarketingCapabilityGateViewModel
}>()
</script>
