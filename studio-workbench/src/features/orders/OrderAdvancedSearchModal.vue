<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-[#1A1814]/40 backdrop-blur-sm flex items-start justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[770px] bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] mt-[70.66px]">
        <div class="px-7 py-5 border-b border-amber-topbar-border flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">高级查询</span>
            <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-[24.5px] tracking-[-0.01em]">高级筛选</h2>
            <p class="text-[10.5px] font-sans text-amber-text-muted leading-[15.75px] mt-[3.5px] opacity-70">支持按状态、门店、来源、支付与金额区间筛选</p>
          </div>
          <button class="p-2 hover:bg-black/5 rounded-md transition-all" type="button" @click="$emit('close')">
            <img src="../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <div class="p-7 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-3 gap-x-3.5 gap-y-6">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">门店选择</label>
              <select v-model="advanced.store" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans text-amber-dark/80 focus:outline-none focus:border-amber-dark/30">
                <option v-for="opt in advancedStoreOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">订单来源</label>
              <select v-model="advanced.source" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans text-amber-dark/80 focus:outline-none focus:border-amber-dark/30">
                <option v-for="opt in sourceOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">支付状态</label>
              <select v-model="advanced.payment" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans text-amber-dark/80 focus:outline-none focus:border-amber-dark/30">
                <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">服务产品</label>
              <select v-model="advanced.service" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans text-amber-dark/80 focus:outline-none focus:border-amber-dark/30">
                <option v-for="opt in serviceOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">来源方式</label>
              <select v-model="advanced.method" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans text-amber-dark/80 focus:outline-none focus:border-amber-dark/30">
                <option v-for="opt in methodOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">金额区间 (¥)</label>
              <div class="grid grid-cols-2 gap-2.5">
                <input v-model="advanced.amountMin" type="number" placeholder="最低" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-mono placeholder:text-amber-text-muted/60 focus:outline-none focus:border-amber-dark/30" />
                <input v-model="advanced.amountMax" type="number" placeholder="最高" class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-mono placeholder:text-amber-text-muted/60 focus:outline-none focus:border-amber-dark/30" />
              </div>
            </div>

            <div class="col-span-3 flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-none">订单状态</label>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="opt in statusOptions"
                  :key="opt"
                  type="button"
                  class="px-3 py-2 border rounded-md text-[10.5px] font-sans transition-all"
                  :class="advanced.status.includes(opt) ? 'bg-amber-accent/10 border-amber-accent text-amber-accent' : 'bg-transparent border-amber-topbar-border text-amber-text-muted hover:border-amber-dark/30'"
                  @click="$emit('toggleAdvancedStatus', opt)"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-7 py-5 border-t border-amber-topbar-border flex items-center justify-between bg-amber-content-bg">
          <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">
            已匹配 <span class="text-amber-dark">{{ filteredCount }}</span> 条
          </div>
          <div class="flex items-center gap-3.5">
            <button class="px-6 py-2 text-[11px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors" type="button" @click="$emit('resetAdvanced')">
              重置
            </button>
            <button class="px-6 py-2 bg-amber-dark text-[#F4EFE6] rounded-md text-[11px] font-sans font-medium hover:bg-black transition-all" type="button" @click="$emit('close')">
              应用
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { AdvancedFilters } from './composables/useOrderFilters'

defineProps<{
  open: boolean
  advanced: AdvancedFilters
  advancedStoreOptions: string[]
  sourceOptions: string[]
  paymentOptions: string[]
  serviceOptions: string[]
  methodOptions: string[]
  statusOptions: string[]
  filteredCount: number
}>()

defineEmits<{
  close: []
  resetAdvanced: []
  toggleAdvancedStatus: [status: string]
}>()
</script>
