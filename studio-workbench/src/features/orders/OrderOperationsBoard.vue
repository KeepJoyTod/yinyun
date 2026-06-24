<template>
  <section class="orders-ops-board border-b border-amber-topbar-border/60 bg-amber-content-bg px-5 py-4">
    <div class="flex gap-2 mb-3 flex-wrap" v-if="ordersLength > 0">
      <button
        v-for="f in anomalyFilterOptions"
        :key="f.key"
        class="px-2 py-1 text-xs rounded cursor-pointer transition-colors"
        :class="anomalyFilters.has(f.key)
          ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40'
          : 'bg-white/5 text-amber-text-muted/40 hover:bg-white/10 hover:text-amber-text-muted/60'"
        @click="$emit('toggleAnomalyFilter', f.key)"
      >
        {{ f.label }} ({{ f.count }})
      </button>
    </div>

    <div class="mb-4 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">订单流转</span>
        <h3 class="mt-1 text-[17px] font-sans font-semibold text-amber-dark">门店订单处理顺序</h3>
        <p class="mt-1.5 text-[12px] font-sans leading-relaxed text-amber-text-muted">
          先确认今日到店，再处理待确认订单；完成服务后进入客片交付。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="filter in quickOrderFilters"
          :key="filter.key"
          class="yy-action px-3 py-1.5 border rounded-md text-[10.5px] font-sans transition-all"
          :class="activeQuickFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="$emit('selectQuickFilter', filter.key)"
        >
          {{ filter.label }} · {{ filter.count }}
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="item in orderPipelineCards"
        :key="item.label"
        class="yy-action yy-surface border border-amber-topbar-border bg-white p-3 text-left transition hover:border-amber-dark/25"
        :class="activeQuickFilter === item.filter ? 'border-amber-dark bg-white' : ''"
        type="button"
        @click="$emit('selectQuickFilter', item.filter)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-[13px] font-sans font-semibold text-amber-dark">{{ item.label }}</div>
            <div class="mt-1 text-[11px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
          </div>
          <span class="border border-amber-topbar-border bg-black/[0.03] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-amber-text-muted">
            {{ item.scope }}
          </span>
        </div>
        <div class="mt-3 flex items-end justify-between gap-3">
          <strong class="text-[26px] font-sans font-semibold tabular-nums leading-none text-amber-dark">{{ item.value }}</strong>
          <span class="text-[11px] font-sans text-amber-text-muted">{{ item.action }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QuickOrderFilter, OrderOperationCard } from './orderOperations'

defineProps<{
  ordersLength: number
  anomalyFilterOptions: Array<{ key: string; label: string; count: number }>
  anomalyFilters: Set<string>
  quickOrderFilters: Array<{ key: QuickOrderFilter; label: string; count: number }>
  activeQuickFilter: QuickOrderFilter
  orderPipelineCards: OrderOperationCard[]
}>()

defineEmits<{
  toggleAnomalyFilter: [key: string]
  selectQuickFilter: [filter: QuickOrderFilter]
}>()
</script>
