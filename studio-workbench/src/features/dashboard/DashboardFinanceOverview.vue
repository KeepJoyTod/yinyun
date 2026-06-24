<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">经营概况</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ scopeLabel }} · 本地 yy_order 已同步账本</p>
      </div>
      <div class="flex items-center gap-1 border border-hairline bg-surface-1 p-0.5 rounded-md">
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="mode === 'today' ? 'bg-accent text-ink font-semibold' : 'text-ink-muted hover:text-ink'"
          type="button"
          @click="$emit('update:mode', 'today')"
        >今天</button>
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="mode === 'yesterday' ? 'bg-accent text-ink font-semibold' : 'text-ink-muted hover:text-ink'"
          type="button"
          @click="$emit('update:mode', 'yesterday')"
        >昨天</button>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm p-6">
        <div class="flex items-baseline gap-4">
          <div>
            <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">实际收入</div>
            <div class="mt-1 text-[40px] font-sans font-bold leading-none tabular-nums text-ink">¥ {{ finance.actualIncome.toLocaleString('zh-CN') }}</div>
          </div>
          <div class="border-l border-hairline pl-4">
            <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">预计收入</div>
            <div class="mt-1 text-[24px] font-sans font-medium leading-none tabular-nums text-ink-muted">¥ {{ finance.expectedIncome.toLocaleString('zh-CN') }}</div>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-hairline pt-4 sm:grid-cols-4">
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-ink-muted">商品金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-ink">¥ {{ finance.productAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-ink-muted">优惠减免</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-ink">¥ {{ finance.discountAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-ink-muted">订单金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-ink">¥ {{ finance.orderAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-ink-muted">退款金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-status-danger">¥ {{ finance.refundAmount.toLocaleString('zh-CN') }}</div>
          </div>
        </div>
        <p v-if="!finance.hasBackendFinanceApi" class="mt-4 border-l-2 border-accent/40 bg-canvas pl-3 py-2 text-[12px] font-sans leading-relaxed text-ink-muted">
          当前使用本地订单缓存汇总。商品金额/优惠减免暂无独立口径，显示为订单金额/0。
        </p>
      </div>
      <div class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm p-6">
        <div class="flex items-baseline justify-between">
          <div class="text-[15px] font-sans font-semibold text-ink">服务订单</div>
          <div class="text-[28px] font-sans font-bold tabular-nums text-ink leading-none">{{ finance.orderCount }}<span class="text-[13px] font-sans font-normal text-ink-muted ml-1">单</span></div>
        </div>
        <div class="mt-4 space-y-2.5">
          <div
            v-for="item in breakdown.filter(r => r.label !== '总订单')"
            :key="item.label"
            class="flex items-center justify-between border-b border-hairline/50 pb-2 last:border-0 last:pb-0"
          >
            <span class="text-[13px] font-sans text-ink-muted">{{ item.label }}</span>
            <span class="text-[16px] font-mono font-semibold text-ink">{{ item.count }} 单</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  finance: {
    actualIncome: number
    expectedIncome: number
    productAmount: number
    discountAmount: number
    orderAmount: number
    refundAmount: number
    hasBackendFinanceApi: boolean
    orderCount: number
  }
  breakdown: Array<{ label: string; count: number }>
  mode: 'today' | 'yesterday'
  scopeLabel: string
}>()

defineEmits<{
  'update:mode': [mode: 'today' | 'yesterday']
}>()
</script>