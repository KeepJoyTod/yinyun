<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">服务订单状态</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ selectedDateLabel }} · {{ selectedStoreScopeLabel }}</p>
      </div>
      <button class="yy-action text-[11px] font-sans font-normal text-amber-text-muted hover:text-amber-dark transition-colors uppercase tracking-[0.1em]" type="button" @click="$emit('go-daily-report')">
        导出日报 ↗
      </button>
    </div>

    <div class="grid grid-cols-2 overflow-hidden rounded-lg border border-amber-topbar-border/70 bg-amber-content-bg shadow-sm md:grid-cols-3 xl:grid-cols-6">
      <button
        v-for="item in cards"
        :key="item.key"
        class="yy-action min-w-0 border-b border-r border-amber-topbar-border text-left transition-colors hover:bg-black/[0.015] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-accent/50"
        type="button"
        @click="$emit('open-status', item)"
      >
        <StatItem
          :label="item.label"
          :value="item.value"
          trend="0"
          trendType="neutral"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import StatItem from '../../../shared/components/dashboard/StatItem.vue'

type StatusCard = {
  key: string
  label: string
  value: string
}

defineProps<{
  selectedDateLabel: string
  selectedStoreScopeLabel: string
  cards: StatusCard[]
}>()

defineEmits<{
  'go-daily-report': []
  'open-status': [item: StatusCard]
}>()
</script>
