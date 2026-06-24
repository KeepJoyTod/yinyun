<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">异常概览</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">数据质量预检 · 同步前统计</p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="rounded-md bg-amber-content-bg border border-amber-topbar-border/70 p-4">
        <div class="text-xs text-amber-text-muted">缺门店映射</div>
        <div class="text-xl font-semibold mt-1" :class="anomalyPreStats.missingStoreMapping > 0 ? 'text-red-400' : 'text-emerald-400'">
          {{ anomalyPreStats.missingStoreMapping }}
        </div>
      </div>
      <div class="rounded-md bg-amber-content-bg border border-amber-topbar-border/70 p-4">
        <div class="text-xs text-amber-text-muted">缺预约时间</div>
        <div class="text-xl font-semibold mt-1" :class="anomalyPreStats.missingArrivalTime > 0 ? 'text-red-400' : 'text-emerald-400'">
          {{ anomalyPreStats.missingArrivalTime }}
        </div>
      </div>
      <div class="rounded-md bg-amber-content-bg border border-amber-topbar-border/70 p-4">
        <div class="text-xs text-amber-text-muted">缺产品名</div>
        <div class="text-xl font-semibold mt-1" :class="anomalyPreStats.missingProductName > 0 ? 'text-red-400' : 'text-emerald-400'">
          {{ anomalyPreStats.missingProductName }}
        </div>
      </div>
      <div class="rounded-md bg-amber-content-bg border border-amber-topbar-border/70 p-4">
        <div class="text-xs text-amber-text-muted">同步安全闸</div>
        <div class="text-xl font-semibold mt-1" :class="syncStatusClass">
          {{ syncStatusLabel }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  anomalyPreStats: {
    missingStoreMapping: number
    missingArrivalTime: number
    missingProductName: number
  }
  syncStatusClass: string
  syncStatusLabel: string
}>()
</script>
