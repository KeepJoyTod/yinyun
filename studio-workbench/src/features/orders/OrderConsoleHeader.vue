<template>
  <section class="orders-hero yy-glass-panel yy-console-hero rounded-2xl px-5 py-4">
    <div class="flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
      <div class="flex items-start gap-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-dark text-[#F4EFE6] shadow-sm">
          <CalendarClock :size="20" :stroke-width="1.8" />
        </div>
        <div class="flex flex-col">
          <span class="text-[11px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[14px]">预约订单</span>
          <h2 class="mt-1 text-[24px] font-sans font-bold text-amber-dark leading-[1.12]">订单处理台</h2>
          <div class="mt-1.5 text-[13px] font-sans text-amber-text-muted leading-[15.75px]">
            共 <span class="font-mono font-semibold text-amber-dark">{{ filteredCount }}</span> 条 · 累计金额
            <span class="font-mono font-semibold text-amber-dark">¥ {{ totalAmount }}</span>
          </div>
          <div class="mt-1 text-[12px] font-sans text-amber-text-muted">{{ orderScopeLabel }}</div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-[7px] max-[720px]:w-full max-[720px]:justify-between">
        <span
          class="border px-2.5 py-[7px] text-[10px] font-mono uppercase tracking-[0.16em]"
          :class="demoMode ? 'border-amber-topbar-border bg-amber-content-bg text-amber-text-muted' : 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'"
        >
          {{ demoMode ? 'Demo 可视演示' : 'API 已连接' }}
        </span>
        <button
          class="yy-action flex items-center gap-[5.25px] rounded-md border border-amber-dark bg-amber-dark px-[10.5px] py-[7px] text-[#F4EFE6] transition-colors hover:bg-black/90"
          type="button"
          @click="$emit('openStaffBooking')"
        >
          <CalendarPlus :size="13" :stroke-width="2" />
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.16em] leading-[16.5px]">新增预约</span>
          <span class="sr-only">新增预约</span>
        </button>
        <button
          class="yy-action flex items-center gap-[5.25px] rounded-md border border-amber-topbar-border bg-white px-[10.5px] py-[7px] text-amber-dark transition-colors hover:bg-black/5"
          type="button"
          @click="$emit('openSchedule')"
        >
          <CalendarClock :size="13" :stroke-width="2" />
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.16em] leading-[16.5px]">预约看板</span>
        </button>
        <button
          class="yy-action flex items-center gap-[5.25px] rounded-md border border-amber-dark bg-amber-dark px-[10.5px] py-[7px] text-[#F4EFE6] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          :disabled="syncingDouyinOrders"
          @click="$emit('syncDouyinLifeOrders')"
        >
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.16em] leading-[16.5px]">{{ syncingDouyinOrders ? '同步中...' : '同步订单' }}</span>
        </button>
        <button
          class="yy-action flex items-center gap-[5.25px] rounded-md border border-amber-topbar-border bg-white px-[10.5px] py-[7px] text-amber-dark transition-colors hover:bg-black/5"
          type="button"
          @click="$emit('showAllOrders')"
        >
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.16em] leading-[16.5px]">近30天来客</span>
        </button>
        <button
          class="yy-action flex items-center gap-[5.25px] rounded-md border border-amber-topbar-border px-[10.5px] py-[7px] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="canExportOrders ? 'bg-white text-amber-dark hover:bg-black/5' : 'bg-amber-content-bg text-amber-text-muted'"
          type="button"
          :title="orderExportTitle"
          :disabled="!canExportOrders || exportingOrders"
          @click="$emit('exportOrders')"
        >
          <img src="../../assets/icons/export.svg" class="h-[12.25px] w-[12.25px]" :class="canExportOrders ? '' : 'opacity-60'" />
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.18em] leading-[16.5px]">
            {{ exportingOrders ? '导出中...' : demoMode ? 'Demo 模式不可导出' : unsupportedOrderExportFilters.length ? '筛选不可导出' : '导出 Excel' }}
          </span>
        </button>
        <button
          class="yy-action flex items-center gap-[5.25px] px-[10.5px] py-[7px] bg-amber-dark text-[#F4EFE6] rounded-md hover:bg-black/90 transition-colors"
          type="button"
          @click="$emit('openAdvanced')"
        >
          <img src="../../assets/icons/advanced-filter.svg" class="w-[12.25px] h-[12.25px]" />
          <span class="text-[11px] font-mono font-medium uppercase tracking-[0.18em] leading-[16.5px]">高级查询</span>
        </button>
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-topbar-border/60 pt-3 text-[11px] font-sans leading-relaxed text-amber-text-muted">
      <span class="font-mono uppercase tracking-[0.18em] text-amber-dark">抖音来客近24小时补偿同步</span>
      <span v-if="lastDouyinLifeOrderSync" class="rounded-full border border-amber-topbar-border/60 bg-white/70 px-2.5 py-1 text-[10px] font-mono text-amber-text-muted">
        created {{ lastDouyinLifeOrderSync.created }} · updated {{ lastDouyinLifeOrderSync.updated }} · lastLogId {{ lastDouyinLifeOrderSync.lastLogId || '暂无' }}
      </span>
    </div>
    <div
      class="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-sans leading-relaxed text-amber-text-muted"
      title="本地 yy_order 已同步订单"
    >
      <span class="font-mono uppercase tracking-[0.18em] text-amber-dark">导出范围</span>
      <span>{{ orderExportSyncNotice }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CalendarClock, CalendarPlus } from 'lucide-vue-next'
import type { DouyinLifeOrderSyncInfo } from '../../shared/stores/appStore'

defineProps<{
  filteredCount: number
  totalAmount: string
  orderScopeLabel: string
  demoMode: boolean
  syncingDouyinOrders: boolean
  lastDouyinLifeOrderSync: DouyinLifeOrderSyncInfo | null
  canExportOrders: boolean
  orderExportTitle: string
  exportingOrders: boolean
  unsupportedOrderExportFilters: string[]
  orderExportSyncNotice: string
}>()

defineEmits<{
  openStaffBooking: []
  openSchedule: []
  syncDouyinLifeOrders: []
  showAllOrders: []
  exportOrders: []
  openAdvanced: []
}>()
</script>
