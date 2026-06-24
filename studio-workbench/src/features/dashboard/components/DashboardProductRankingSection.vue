<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">产品排行</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ selectedDateLabel }} · 预约服务产品分布 Top 5</p>
      </div>
    </div>

    <div class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm overflow-hidden">
      <StateView
        :empty="rows.length === 0"
        empty-title="所选日期暂无订单"
        empty-hint="切换日期或到「预约订单」页查看全量订单。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-amber-bg/10 border-b border-amber-topbar-border text-left">
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-amber-text-muted w-16">排名</th>
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-amber-text-muted">产品名称</th>
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-amber-text-muted w-32">预约量</th>
              <th class="px-7 py-3 text-[13px] font-sans font-semibold text-amber-text-muted w-32">金额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr
              v-for="row in rows"
              :key="row.product"
              class="yy-clickable-row hover:bg-black/[0.01]"
              tabindex="0"
              @click="$emit('open-product', row.product)"
              @keydown.enter.prevent="$emit('open-product', row.product)"
            >
              <td class="px-7 py-3.5">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-mono font-bold"
                  :class="row.rank <= 3 ? 'bg-amber-accent/15 text-amber-accent' : 'bg-black/[0.04] text-amber-text-muted'"
                >{{ row.rank }}</span>
              </td>
              <td class="px-7 py-3.5 text-[14px] font-sans font-medium text-amber-dark">{{ row.product }}</td>
              <td class="px-7 py-3.5 text-[14px] font-mono font-semibold text-amber-dark">{{ row.count }}</td>
              <td class="px-7 py-3.5 text-[14px] font-mono text-amber-text-muted">¥ {{ row.amount.toLocaleString('zh-CN') }}</td>
            </tr>
          </tbody>
        </table>
      </StateView>
    </div>
  </section>
</template>

<script setup lang="ts">
import StateView from '../../../shared/components/feedback/StateView.vue'

defineProps<{
  selectedDateLabel: string
  rows: Array<{
    rank: number
    product: string
    count: number
    amount: number
  }>
}>()

defineEmits<{
  'open-product': [product: string]
}>()
</script>
