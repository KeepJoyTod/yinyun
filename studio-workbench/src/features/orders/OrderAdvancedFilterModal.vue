<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-accent/40 backdrop-blur-sm flex items-start justify-center p-4"
      @click.self="$emit('update:open', false)"
    >
      <div class="w-full max-w-[770px] bg-surface-1 border border-hairline rounded-xl overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] mt-[70.66px]">
        <div class="px-7 py-5 border-b border-hairline flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.22em] leading-none">高级查询</span>
            <h2 class="text-[17.5px] font-sans font-medium text-ink leading-[24.5px] tracking-[-0.01em]">高级筛选</h2>
            <p class="text-[10.5px] font-sans text-ink-muted leading-[15.75px] mt-[3.5px] opacity-70">支持按状态、门店、来源、支付与金额区间筛选</p>
          </div>
          <button @click="$emit('update:open', false)" class="p-2 hover:bg-accent-hover/5 rounded-md transition-all">
            <img src="../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <div class="p-7 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-3 gap-x-3.5 gap-y-6">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">门店选择</label>
              <select
                :value="advanced.store"
                @change="$emit('update:advanced', { ...advanced, store: ($event.target as HTMLSelectElement).value })"
                class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-sans text-ink/80 focus:outline-none focus:border-accent/30"
              >
                <option v-for="opt in storeOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">订单来源</label>
              <select
                :value="advanced.source"
                @change="$emit('update:advanced', { ...advanced, source: ($event.target as HTMLSelectElement).value })"
                class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-sans text-ink/80 focus:outline-none focus:border-accent/30"
              >
                <option v-for="opt in sourceOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">支付状态</label>
              <select
                :value="advanced.payment"
                @change="$emit('update:advanced', { ...advanced, payment: ($event.target as HTMLSelectElement).value })"
                class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-sans text-ink/80 focus:outline-none focus:border-accent/30"
              >
                <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">服务产品</label>
              <select
                :value="advanced.service"
                @change="$emit('update:advanced', { ...advanced, service: ($event.target as HTMLSelectElement).value })"
                class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-sans text-ink/80 focus:outline-none focus:border-accent/30"
              >
                <option v-for="opt in serviceOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">来源方式</label>
              <select
                :value="advanced.method"
                @change="$emit('update:advanced', { ...advanced, method: ($event.target as HTMLSelectElement).value })"
                class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-sans text-ink/80 focus:outline-none focus:border-accent/30"
              >
                <option v-for="opt in methodOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">金额区间 (¥)</label>
              <div class="grid grid-cols-2 gap-2.5">
                <input
                  :value="advanced.amountMin"
                  type="number"
                  placeholder="最低"
                  @input="$emit('update:advanced', { ...advanced, amountMin: ($event.target as HTMLInputElement).value })"
                  class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-mono placeholder:text-ink-muted/60 focus:outline-none focus:border-accent/30"
                />
                <input
                  :value="advanced.amountMax"
                  type="number"
                  placeholder="最高"
                  @input="$emit('update:advanced', { ...advanced, amountMax: ($event.target as HTMLInputElement).value })"
                  class="w-full px-3 py-2 bg-surface-1 border border-hairline rounded-md text-[11.375px] font-mono placeholder:text-ink-muted/60 focus:outline-none focus:border-accent/30"
                />
              </div>
            </div>

            <div class="col-span-3 flex flex-col gap-2">
              <label class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em] leading-none">订单状态</label>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="opt in statusOptions"
                  :key="opt"
                  type="button"
                  class="px-3 py-2 border rounded-md text-[10.5px] font-sans transition-all"
                  :class="advanced.status.includes(opt) ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-hairline text-ink-muted hover:border-accent/30'"
                  @click="$emit('toggle-status', opt)"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-7 py-5 border-t border-hairline flex items-center justify-between bg-surface-1">
          <div class="text-[10px] font-mono text-ink-muted uppercase tracking-[0.18em]">
            已匹配 <span class="text-ink">{{ matchCount }}</span> 条
          </div>
          <div class="flex items-center gap-3.5">
            <button class="px-6 py-2 text-[11px] font-sans font-medium text-ink-muted hover:text-ink transition-colors" @click="$emit('reset')">
              重置
            </button>
            <button class="px-6 py-2 bg-accent text-white rounded-md text-[11px] font-sans font-medium hover:bg-accent-hover transition-all" @click="$emit('update:open', false)">
              应用
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  advanced: { store: string; source: string; payment: string; service: string; method: string; amountMin: string; amountMax: string; status: string[] }
  storeOptions: string[]
  sourceOptions: string[]
  paymentOptions: string[]
  serviceOptions: string[]
  methodOptions: string[]
  statusOptions: string[]
  matchCount: number
}>()

defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'update:advanced', v: any): void
  (e: 'toggle-status', opt: string): void
  (e: 'reset'): void
}>()
</script>