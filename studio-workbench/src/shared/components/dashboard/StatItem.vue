<template>
  <div class="flex-1 p-6 flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <span class="text-[13px] font-semibold text-amber-text-muted">{{ label }}</span>
      <div
        class="flex items-center gap-0.5"
        :class="[
          trendType === 'up' ? 'text-amber-accent' :
          'text-amber-text-muted/60'
        ]"
      >
        <svg v-if="trendType === 'up'" width="12" height="12" viewBox="0 0 11 11" fill="none" class="w-3 h-3">
          <path d="M3.20833 3.20833H7.79167V7.79167" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.20833 7.79167L7.79167 3.20833" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="trendType === 'down'" width="12" height="12" viewBox="0 0 11 11" fill="none" class="w-3 h-3">
          <path d="M3.20833 3.20833L7.79167 7.79167" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7.79167 3.20833V7.79167H3.20833" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="trendType === 'neutral'" width="12" height="12" viewBox="0 0 11 11" fill="none" class="w-3 h-3 opacity-50">
          <path d="M3.20833 3.20833H7.79167V7.79167" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.20833 7.79167L7.79167 3.20833" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-[12px] font-mono font-medium">{{ trend }}</span>
      </div>
    </div>
    <div class="text-[36px] font-sans font-bold text-amber-dark leading-none mt-1 tabular-nums">
      {{ value }}
    </div>
    <div class="text-[11px] text-amber-text-muted/70 font-mono font-medium mt-1 uppercase tracking-tight">较昨日</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  trend: string
  trendType: 'up' | 'down' | 'neutral' | 'none'
}>()
</script>
