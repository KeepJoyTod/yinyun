<template>
  <div class="grid grid-cols-4 border-t border-amber-topbar-border max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
    <article
      v-for="metric in metrics"
      :key="metric.label"
      class="min-h-[104px] border-r border-b border-amber-topbar-border px-5 py-5 last:border-r-0 max-[980px]:even:border-r-0 max-[560px]:border-r-0"
    >
      <div class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">{{ metric.eyebrow }}</div>
      <div class="mt-3 text-[28px] font-semibold leading-none" :class="metric.danger ? 'text-[#B8543B]' : 'text-amber-dark'">
        {{ metric.value }}
      </div>
      <div class="mt-2 text-[12px] text-amber-dark">{{ metric.label }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { MerchantOverviewMetric } from '../merchantCoreOperations'

defineProps<{
  metrics: MerchantOverviewMetric[]
}>()
</script>
