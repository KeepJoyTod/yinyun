<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">经营概况</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ businessDateScopeLabel }} · 本地 yy_order 已同步账本</p>
      </div>
      <div class="flex items-center gap-1 border border-amber-topbar-border bg-amber-content-bg p-0.5 rounded-md">
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="businessDateMode === 'today' ? 'bg-amber-dark text-[#F4EFE6] font-semibold' : 'text-amber-text-muted hover:text-amber-dark'"
          type="button"
          @click="$emit('update:business-date-mode', 'today')"
        >今天</button>
        <button
          class="yy-action px-3 py-1.5 text-[12px] font-sans transition-all rounded"
          :class="businessDateMode === 'yesterday' ? 'bg-amber-dark text-[#F4EFE6] font-semibold' : 'text-amber-text-muted hover:text-amber-dark'"
          type="button"
          @click="$emit('update:business-date-mode', 'yesterday')"
        >昨天</button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm p-6">
        <div class="flex items-baseline gap-4">
          <div>
            <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">实际收入</div>
            <div class="mt-1 text-[40px] font-sans font-bold leading-none tabular-nums text-amber-dark">¥ {{ financeOverview.actualIncome.toLocaleString('zh-CN') }}</div>
          </div>
          <div class="border-l border-amber-topbar-border pl-4">
            <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">预计收入</div>
            <div class="mt-1 text-[24px] font-sans font-medium leading-none tabular-nums text-amber-text-muted">¥ {{ financeOverview.expectedIncome.toLocaleString('zh-CN') }}</div>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-amber-topbar-border pt-4 sm:grid-cols-4">
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-amber-text-muted">商品金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-amber-dark">¥ {{ financeOverview.productAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-amber-text-muted">优惠减免</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-amber-dark">¥ {{ financeOverview.discountAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-amber-text-muted">订单金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-amber-dark">¥ {{ financeOverview.orderAmount.toLocaleString('zh-CN') }}</div>
          </div>
          <div>
            <div class="text-[11px] font-mono uppercase tracking-wider text-amber-text-muted">退款金额</div>
            <div class="mt-1 text-[16px] font-sans font-semibold tabular-nums text-[#B8543B]">¥ {{ financeOverview.refundAmount.toLocaleString('zh-CN') }}</div>
          </div>
        </div>
        <p v-if="!financeOverview.hasBackendFinanceApi" class="mt-4 border-l-2 border-amber-accent/40 bg-[#FBF8F2] pl-3 py-2 text-[12px] font-sans leading-relaxed text-amber-text-muted">
          当前使用本地订单缓存汇总。商品金额/优惠减免暂无独立口径，显示为订单金额/0。
        </p>
      </div>

      <div class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm p-6">
        <div class="flex items-baseline justify-between">
          <div class="text-[15px] font-sans font-semibold text-amber-dark">服务订单</div>
          <div class="text-[28px] font-sans font-bold tabular-nums text-amber-dark leading-none">{{ financeOverview.orderCount }}<span class="text-[13px] font-sans font-normal text-amber-text-muted ml-1">单</span></div>
        </div>
        <div class="mt-4 space-y-2.5">
          <div
            v-for="item in serviceOrderBreakdown.filter(r => r.label !== '总订单')"
            :key="item.label"
            class="flex items-center justify-between border-b border-amber-topbar-border/50 pb-2 last:border-0 last:pb-0"
          >
            <span class="text-[13px] font-sans text-amber-text-muted">{{ item.label }}</span>
            <span class="text-[16px] font-mono font-semibold text-amber-dark">{{ item.count }} 单</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type BusinessDateMode = 'today' | 'yesterday'

defineProps<{
  businessDateScopeLabel: string
  businessDateMode: BusinessDateMode
  financeOverview: {
    hasBackendFinanceApi: boolean
    actualIncome: number
    expectedIncome: number
    productAmount: number
    discountAmount: number
    orderAmount: number
    refundAmount: number
    orderCount: number
  }
  serviceOrderBreakdown: Array<{ label: string; count: number }>
}>()

defineEmits<{
  'update:business-date-mode': [mode: BusinessDateMode]
}>()
</script>
