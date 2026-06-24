<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">渠道订单汇总</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ selectedDateLabel }} · 按订单来源拆分</p>
      </div>
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-text-muted">
        合计 ¥ {{ summary.totalAmount.toLocaleString('zh-CN') }}
      </span>
    </div>

    <div class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm overflow-hidden">
      <StateView
        :empty="summary.rows.length === 0"
        empty-title="所选日期暂无订单"
        empty-hint="切换日期或到「预约订单」页查看全量订单。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-amber-bg/10 border-b border-amber-topbar-border text-left">
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">渠道来源</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">订单数</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">占比</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">订单金额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr
              v-for="row in summary.rows"
              :key="row.source"
              class="yy-clickable-row hover:bg-black/[0.01]"
              tabindex="0"
              @click="$emit('open-channel', row.source)"
              @keydown.enter.prevent="$emit('open-channel', row.source)"
            >
              <td class="px-7 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-[11.5px] font-sans font-medium text-amber-dark">{{ row.source }}</span>
                </div>
              </td>
              <td class="px-7 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="text-[12px] font-mono font-medium text-amber-dark">{{ row.count }}</span>
                  <div class="h-1 w-24 bg-amber-topbar-border/40 overflow-hidden rounded-full">
                    <div
                      class="h-full bg-amber-accent transition-all duration-500"
                      :style="{ width: Math.round((row.count / summary.maxCount) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-7 py-3.5 text-[11px] font-mono text-amber-text-muted">
                {{ summary.totalAmount === 0 ? '-' : ((row.count / totalCount) * 100).toFixed(0) + '%' }}
              </td>
              <td class="px-7 py-3.5 text-[12px] font-mono font-medium text-amber-dark">¥ {{ row.amount.toLocaleString('zh-CN') }}</td>
            </tr>
          </tbody>
        </table>
      </StateView>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StateView from '../../../shared/components/feedback/StateView.vue'

const props = defineProps<{
  selectedDateLabel: string
  summary: {
    rows: Array<{
      source: string
      count: number
      amount: number
    }>
    totalAmount: number
    maxCount: number
  }
}>()

defineEmits<{
  'open-channel': [source: string]
}>()

const totalCount = computed(() => props.summary.rows.reduce((sum, row) => sum + row.count, 0) || 1)
</script>
