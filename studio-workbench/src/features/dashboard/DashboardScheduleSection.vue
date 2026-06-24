<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div class="px-5 py-4 border-b border-hairline flex items-center justify-between">
        <div>
          <span class="text-[11px] font-mono text-ink-muted uppercase tracking-[0.18em]">预约趋势</span>
          <h3 class="text-[15px] font-sans font-semibold text-ink mt-0.5">预约趋势 · 截至 {{ selectedDateShortLabel }}</h3>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-4 text-[11px] font-medium">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>预约</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>到店</span>
            </div>
          </div>
          <button class="yy-action pl-4 border-l border-hairline text-[11px] font-sans text-ink-muted uppercase tracking-wider" type="button" @click="emit('toggle-trend-granularity')">
            {{ trendGranularity }}
          </button>
        </div>
      </div>
      <div class="p-6">
        <Suspense>
          <TrendChart :data="trendStats" />
          <template #fallback>
            <div class="flex h-[300px] items-center justify-center border border-dashed border-hairline bg-black/[0.015] text-[11px] text-ink-muted">
              正在加载趋势图
            </div>
          </template>
        </Suspense>
      </div>
    </section>

    <section class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div class="px-5 py-4 border-b border-hairline flex items-center justify-between">
        <div>
          <span class="text-[11px] font-mono text-ink-muted uppercase tracking-[0.18em]">Day · 工位时段</span>
          <h3 class="text-[15px] font-sans font-semibold text-ink mt-0.5">预约时段工位 · 上午 / 下午 / 晚上</h3>
        </div>
        <button class="yy-action p-1.5 hover:bg-accent-hover/5 rounded-md transition-colors" type="button" aria-label="筛选工位时段" @click="emit('open-slot-filter')">
          <img src="../../assets/icons/filter.svg" class="w-4 h-4 opacity-40" />
        </button>
      </div>
      <div class="flex-1 overflow-auto p-5">
        <JianyueSlotGrid :groups="dashboardSlotGroups" @select-slot="emit('open-dashboard-slot', $event)" />
      </div>
      <SlotDetailPanel
        v-if="dashboardSelectedSlot"
        :slot="dashboardSelectedSlot"
        :status-label="dashboardSelectedSlotStatusLabel"
        :store-label="dashboardSelectedSlotStoreLabel"
        :service-label="dashboardSelectedSlotServiceLabel"
        :remaining-count="dashboardSelectedSlotRemaining"
        :remaining-label="dashboardSelectedSlotRemainingLabel"
        :blocked="dashboardSelectedSlotBlocked"
        :blocked-reason="dashboardSelectedSlotBlocked ? dashboardSelectedSlotBlockedReason : ''"
        :selection-error="dashboardSlotSelectionError"
        :service-breakdown="dashboardSelectedSlotServiceBreakdown"
        :orders="dashboardSelectedSlotOrders"
        :format-clock="formatDashboardClock"
        aria-label="首页时段详情"
        @close="emit('close-dashboard-slot')"
        @primary-action="emit('dashboard-slot-primary-action')"
        @open-orders="emit('go-dashboard-selected-slot-orders')"
        @open-inventory="emit('go-dashboard-selected-slot-inventory')"
        @open-order="emit('open-dashboard-selected-slot-order', $event)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import JianyueSlotGrid from '../../shared/components/schedule/JianyueSlotGrid.vue'
import SlotDetailPanel from '../../shared/components/schedule/SlotDetailPanel.vue'
import type { JianyueSlotCard, JianyueSlotGroup, JianyueSlotServiceGroupBreakdown } from '../../shared/components/schedule/jianyueSlotTypes'
import type { DashboardTrendGranularity } from './useDashboardNavigation'

const TrendChart = defineAsyncComponent(() => import('../../shared/components/dashboard/TrendChart.vue'))

type DashboardTrendRow = {
  day: string
  bookedCount: number
  arrivedCount: number
}

defineProps<{
  selectedDateShortLabel: string
  trendGranularity: DashboardTrendGranularity
  trendStats: DashboardTrendRow[]
  dashboardSlotGroups: JianyueSlotGroup[]
  dashboardSelectedSlot: JianyueSlotCard | null
  dashboardSelectedSlotStatusLabel: string
  dashboardSelectedSlotStoreLabel: string
  dashboardSelectedSlotServiceLabel: string
  dashboardSelectedSlotRemaining: number
  dashboardSelectedSlotRemainingLabel: string
  dashboardSelectedSlotBlocked: boolean
  dashboardSelectedSlotBlockedReason: string
  dashboardSlotSelectionError: string
  dashboardSelectedSlotServiceBreakdown: JianyueSlotServiceGroupBreakdown[]
  dashboardSelectedSlotOrders: ScheduleItemDto[]
  formatDashboardClock: (value: string) => string
}>()

const emit = defineEmits<{
  'toggle-trend-granularity': []
  'open-slot-filter': []
  'open-dashboard-slot': [slot: JianyueSlotCard]
  'close-dashboard-slot': []
  'dashboard-slot-primary-action': []
  'go-dashboard-selected-slot-orders': []
  'go-dashboard-selected-slot-inventory': []
  'open-dashboard-selected-slot-order': [item: ScheduleItemDto]
}>()
</script>
