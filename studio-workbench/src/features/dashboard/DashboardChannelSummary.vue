<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">渠道订单汇总</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · 按订单来源拆分</p>
      </div>
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        合计 ¥ {{ summary.totalAmount.toLocaleString('zh-CN') }}
      </span>
    </div>
    <div class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm overflow-hidden">
      <StateView
        :empty="summary.rows.length === 0"
        empty-title="所选日期暂无订单"
        empty-hint="切换日期或到「预约订单」页查看全量订单。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-canvas/10 border-b border-hairline text-left">
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">渠道来源</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">订单数</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">占比</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">订单金额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/50">
            <tr
              v-for="row in summary.rows"
              :key="row.source"
              class="yy-clickable-row hover:bg-accent-hover/[0.04]"
              tabindex="0"
              @click="$emit('open-channel', row.source)"
              @keydown.enter.prevent="$emit('open-channel', row.source)"
            >
              <td class="px-7 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-[11.5px] font-sans font-medium text-ink">{{ row.source }}</span>
                </div>
              </td>
              <td class="px-7 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="text-[12px] font-mono font-medium text-ink">{{ row.count }}</span>
                  <div class="h-1 w-24 bg-surface-3 overflow-hidden rounded-full">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      style="background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))"
                      :style="{ width: Math.round((row.count / summary.maxCount) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-7 py-3.5 text-[11px] font-mono text-ink-muted">
                {{ summary.totalAmount === 0 ? '—' : ((row.count / summary.rows.reduce((s, r) => s + r.count, 0)) * 100).toFixed(0) + '%' }}
              </td>
              <td class="px-7 py-3.5 text-[12px] font-mono font-medium text-ink">¥ {{ row.amount.toLocaleString('zh-CN') }}</td>
            </tr>
          </tbody>
        </table>
      </StateView>
    </div>
  </section>
</template>

<script setup lang="ts">
import StateView from '../../shared/components/feedback/StateView.vue'

defineProps<{
  dateLabel: string
  summary: { rows: Array<{ source: string; count: number; amount: number }>; totalAmount: number; maxCount: number }
}>()

defineEmits<{
  'open-channel': [source: string]
}>()
</script>