<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">异常概览</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">数据质量预检 · 同步前统计</p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 yy-stagger">
      <div class="yy-double-bezel p-4">
        <div class="text-xs text-ink-muted">缺门店映射</div>
        <div class="text-xl font-semibold mt-1" :class="stats.missingStoreMapping > 0 ? 'text-status-danger' : 'text-status-done'">
          {{ stats.missingStoreMapping }}
        </div>
      </div>
      <div class="yy-double-bezel p-4">
        <div class="text-xs text-ink-muted">缺预约时间</div>
        <div class="text-xl font-semibold mt-1" :class="stats.missingArrivalTime > 0 ? 'text-status-danger' : 'text-status-done'">
          {{ stats.missingArrivalTime }}
        </div>
      </div>
      <div class="yy-double-bezel p-4">
        <div class="text-xs text-ink-muted">缺产品名</div>
        <div class="text-xl font-semibold mt-1" :class="stats.missingProductName > 0 ? 'text-status-danger' : 'text-status-done'">
          {{ stats.missingProductName }}
        </div>
      </div>
      <div class="yy-double-bezel p-4">
        <div class="text-xs text-ink-muted">同步安全闸</div>
        <div class="text-xl font-semibold mt-1" :class="syncStatusClass">
          {{ syncStatusLabel }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type DashboardAnomalyStats = {
  missingStoreMapping: number
  missingArrivalTime: number
  missingProductName: number
}

defineProps<{
  stats: DashboardAnomalyStats
  syncStatusClass: string
  syncStatusLabel: string
}>()
</script>
