<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">产品排行</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · 预约服务产品分布 Top 10</p>
      </div>
      <div class="flex items-center gap-1 border border-hairline bg-surface-1 p-0.5 rounded-md" v-if="hasBackendData">
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="mode === 'byOrderCount' ? 'bg-accent text-ink font-semibold' : 'text-ink-muted hover:text-ink'"
          type="button"
          @click="$emit('update:mode', 'byOrderCount')"
        >按预约量</button>
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="mode === 'byAmount' ? 'bg-accent text-ink font-semibold' : 'text-ink-muted hover:text-ink'"
          type="button"
          @click="$emit('update:mode', 'byAmount')"
        >按金额</button>
      </div>
    </div>
    <div class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm overflow-hidden">
      <StateView
        :empty="ranking.length === 0"
        empty-title="所选日期暂无订单"
        empty-hint="切换日期或到「预约订单」页查看全量订单。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-canvas/10 border-b border-hairline text-left">
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-ink-muted w-16">排名</th>
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-ink-muted">产品名称</th>
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-ink-muted w-32">{{ mode === 'byAmount' ? '金额' : '预约量' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/50">
            <tr
              v-for="row in ranking"
              :key="row.productName || row.product"
              class="yy-clickable-row hover:bg-accent-hover/[0.04]"
              tabindex="0"
              @click="$emit('open-product', row.productName || row.product)"
              @keydown.enter.prevent="$emit('open-product', row.productName || row.product)"
            >
              <td class="px-7 py-3.5">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-mono font-bold"
                  :class="row.rank <= 3 ? 'bg-accent/15 text-accent' : 'bg-black/[0.04] text-ink-muted'"
                >{{ row.rank }}</span>
              </td>
              <td class="px-7 py-3.5 text-[14px] font-sans font-medium text-ink">{{ row.productName || row.product }}</td>
              <td class="px-7 py-3.5 text-[14px] font-mono font-semibold text-ink">{{ mode === 'byAmount' ? '¥ ' + (row.amount ?? row.value ?? 0).toLocaleString('zh-CN') : (row.count ?? row.value ?? 0) }}</td>
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
  ranking: Array<{ rank: number; productName: string; product: string; value: number; count?: number; amount?: number }>
  mode: 'byOrderCount' | 'byAmount'
  dateLabel: string
  hasBackendData: boolean
}>()

defineEmits<{
  'update:mode': [mode: 'byOrderCount' | 'byAmount']
  'open-product': [product: string]
}>()
</script>