<template>
  <section class="orders-ops-board border-b border-hairline/60 bg-surface-1 px-5 py-4">
    <div class="flex gap-2 mb-3 flex-wrap" v-if="hasOrders">
      <button
        v-for="f in anomalyFilters"
        :key="f.key"
        class="px-2 py-1 text-xs rounded cursor-pointer transition-colors"
        :class="selectedAnomalies.has(f.key)
          ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40'
          : 'bg-surface-1/5 text-ink-muted/40 hover:bg-surface-1/10 hover:text-ink-muted/60'"
        @click="$emit('toggle-anomaly', f.key)"
      >
        {{ f.label }} ({{ f.count }})
      </button>
    </div>

    <div class="mb-4 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
      <div>
        <span class="text-[10px] text-ink-muted">订单流转</span>
        <h3 class="mt-1 text-[17px] font-sans font-semibold text-ink">门店订单处理顺序</h3>
        <p class="mt-1.5 text-[12px] font-sans leading-relaxed text-ink-muted">
          先确认今日到店，再处理待确认订单；完成服务后进入客片交付。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action px-3 py-1.5 border rounded-md text-[10.5px] font-sans transition-all"
          :class="activeFilter === filter.key ? 'border-accent bg-accent text-white' : 'border-hairline text-ink-muted hover:bg-surface-1'"
          type="button"
          @click="$emit('update:activeFilter', filter.key)"
        >
          {{ filter.label }} · {{ filter.count }}
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="item in pipelineCards"
        :key="item.label"
        class="yy-action yy-surface border border-hairline bg-surface-1 p-3 text-left transition hover:border-accent/25"
        :class="activeFilter === item.filter ? 'border-accent bg-surface-1' : ''"
        type="button"
        @click="$emit('update:activeFilter', item.filter)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-[13px] font-sans font-semibold text-ink">{{ item.label }}</div>
            <div class="mt-1 text-[11px] font-sans leading-relaxed text-ink-muted">{{ item.hint }}</div>
          </div>
          <span class="border border-hairline bg-black/[0.03] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-ink-muted">
            {{ item.scope }}
          </span>
        </div>
        <div class="mt-3 flex items-end justify-between gap-3">
          <strong class="text-[26px] font-sans font-semibold tabular-nums leading-none text-ink">{{ item.value }}</strong>
          <span class="text-[11px] font-sans text-ink-muted">{{ item.action }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  hasOrders: boolean
  anomalyFilters: Array<{ key: string; label: string; count: number }>
  quickFilters: Array<{ key: string; label: string; count: number }>
  pipelineCards: any[]
  activeFilter: string
  selectedAnomalies: Set<string>
}>()

defineEmits<{
  (e: 'update:activeFilter', key: string): void
  (e: 'toggle-anomaly', key: string): void
}>()
</script>