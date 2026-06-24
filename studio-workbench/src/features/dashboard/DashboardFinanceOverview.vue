<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 px-1 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-[26px] font-sans font-bold leading-[1.2] tracking-tight text-ink">经营概况</h2>
        <p class="mt-1.5 text-[13px] font-medium text-ink-muted">{{ scopeLabel }} · 本地 yy_order 同步账本</p>
      </div>
      <div class="flex flex-col gap-2 sm:items-end">
        <div class="flex items-center gap-1 rounded-md border border-hairline bg-surface-1 p-0.5">
          <button
            class="yy-action rounded px-3 py-1.5 text-[12px] font-sans transition-all"
            :class="mode === 'today' ? 'bg-accent font-semibold text-ink' : 'text-ink-muted hover:text-ink'"
            type="button"
            @click="$emit('update:mode', 'today')"
          >今天</button>
          <button
            class="yy-action rounded px-3 py-1.5 text-[12px] font-sans transition-all"
            :class="mode === 'yesterday' ? 'bg-accent font-semibold text-ink' : 'text-ink-muted hover:text-ink'"
            type="button"
            @click="$emit('update:mode', 'yesterday')"
          >昨天</button>
        </div>
        <div class="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <label class="flex h-9 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 text-[12px] text-ink-muted">
            <span class="shrink-0">开始</span>
            <input
              class="h-7 w-[128px] bg-transparent text-[12px] text-ink outline-none"
              type="date"
              :value="exportBeginDate"
              @input="$emit('update:exportBeginDate', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="flex h-9 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 text-[12px] text-ink-muted">
            <span class="shrink-0">结束</span>
            <input
              class="h-7 w-[128px] bg-transparent text-[12px] text-ink outline-none"
              type="date"
              :value="exportEndDate"
              @input="$emit('update:exportEndDate', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <select
            class="h-9 w-[144px] rounded-md border border-hairline bg-surface-1 px-2 text-[12px] text-ink outline-none"
            :value="exportStoreId"
            @change="$emit('update:exportStoreId', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">全部门店</option>
            <option
              v-for="option in exportStoreOptions"
              :key="option.id"
              :value="option.id"
            >{{ option.name }}</option>
          </select>
          <select
            class="h-9 w-[132px] rounded-md border border-hairline bg-surface-1 px-2 text-[12px] text-ink outline-none"
            :value="exportChannelType"
            @change="$emit('update:exportChannelType', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="option in exportChannelOptions"
              :key="option.value || 'all'"
              :value="option.value"
            >{{ option.label }}</option>
          </select>
          <button
            class="yy-action inline-flex h-9 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[12px] font-semibold text-ink transition hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            :disabled="exportDisabled"
            :title="exportTitle"
            @click="$emit('export-dashboard')"
          >
            <img src="../../assets/icons/export.svg" class="h-[13px] w-[13px]" :class="exportDisabled ? 'opacity-60' : ''" />
            <span>{{ exporting ? '导出中' : '导出' }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="rounded-xl border border-hairline/70 bg-surface-1 p-6 shadow-sm">
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
        <p v-if="finance.warningMessage" class="mt-4 border-l-2 border-accent/40 bg-canvas py-2 pl-3 text-[12px] font-sans leading-relaxed text-ink-muted">
          {{ finance.warningMessage }}
        </p>
      </div>
      <div class="rounded-xl border border-hairline/70 bg-surface-1 p-6 shadow-sm">
        <div class="flex items-baseline justify-between">
          <div class="text-[15px] font-sans font-semibold text-ink">服务订单</div>
          <div class="text-[28px] font-sans font-bold leading-none tabular-nums text-ink">{{ finance.orderCount }}<span class="ml-1 text-[13px] font-normal text-ink-muted">单</span></div>
        </div>
        <div class="mt-4 space-y-2.5">
          <div
            v-for="item in breakdown.filter(row => row.label !== '总订单')"
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
    warningMessage: string
  }
  breakdown: Array<{ label: string; count: number }>
  mode: 'today' | 'yesterday'
  scopeLabel: string
  exporting: boolean
  exportDisabled: boolean
  exportTitle: string
  exportBeginDate: string
  exportEndDate: string
  exportStoreId: string
  exportStoreOptions: Array<{ id: string; name: string }>
  exportChannelType: string
}>()

const exportChannelOptions = [
  { label: '全部渠道', value: '' },
  { label: '抖音来客', value: 'DOUYIN_LIFE' },
  { label: '微信', value: 'WECHAT' },
  { label: '美团', value: 'MEITUAN' },
  { label: 'H5', value: 'H5' },
  { label: '手工', value: 'MANUAL' },
]

defineEmits<{
  'update:mode': [mode: 'today' | 'yesterday']
  'update:exportBeginDate': [date: string]
  'update:exportEndDate': [date: string]
  'update:exportStoreId': [storeId: string]
  'update:exportChannelType': [channelType: string]
  'export-dashboard': []
}>()
</script>
