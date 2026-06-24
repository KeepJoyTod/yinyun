<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div class="p-[17.5px_21px] border-b border-amber-topbar-border flex items-center justify-between">
        <div>
          <span class="text-[11px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">预约趋势</span>
          <h3 class="text-[15px] font-sans font-semibold text-amber-dark mt-0.5">预约趋势 · 截至 {{ selectedDateShortLabel }}</h3>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-4 text-[11px] font-medium">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-accent"></span>
              <span>预约</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-dark"></span>
              <span>到店</span>
            </div>
          </div>
          <button class="yy-action pl-4 border-l border-amber-topbar-border text-[11px] font-sans text-amber-text-muted uppercase tracking-wider" type="button" @click="$emit('toggle-trend-granularity')">
            {{ trendGranularity }}
          </button>
        </div>
      </div>
      <div class="p-6">
        <Suspense>
          <TrendChart :data="trendStats" />
          <template #fallback>
            <div class="flex h-[300px] items-center justify-center border border-dashed border-amber-topbar-border bg-black/[0.015] text-[11px] text-amber-text-muted">
              正在加载趋势图
            </div>
          </template>
        </Suspense>
      </div>
    </section>

    <section class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div class="p-[17.5px_21px] border-b border-amber-topbar-border flex items-center justify-between">
        <div>
          <span class="text-[11px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">Day · 工位时段</span>
          <h3 class="text-[15px] font-sans font-semibold text-amber-dark mt-0.5">预约时段工位 · 上午 / 下午 / 晚上</h3>
        </div>
        <button class="yy-action p-1.5 hover:bg-black/5 rounded-md transition-colors" type="button" aria-label="筛选工位时段" @click="$emit('open-slot-filter')">
          <img src="../../../assets/icons/filter.svg" class="w-4 h-4 opacity-40" />
        </button>
      </div>
      <div class="flex-1 overflow-auto p-5">
        <JianyueSlotGrid :groups="slotGroups" @select-slot="$emit('select-slot', $event)" />
      </div>
      <SlotDetailPanel
        v-if="selectedSlot"
        :slot="selectedSlot"
        :status-label="selectedSlotStatusLabel"
        :store-label="selectedSlotStoreLabel"
        :service-label="selectedSlotServiceLabel"
        :remaining-count="selectedSlotRemaining"
        :remaining-label="selectedSlotRemainingLabel"
        :blocked="selectedSlotBlocked"
        :blocked-reason="selectedSlotBlocked ? selectedSlotBlockedReason : ''"
        :selection-error="slotSelectionError"
        :service-breakdown="selectedSlotServiceBreakdown"
        :orders="selectedSlotOrders"
        :format-clock="formatClock"
        aria-label="首页时段详情"
        @close="$emit('close-slot')"
        @primary-action="$emit('primary-slot-action')"
        @open-orders="$emit('open-slot-orders')"
        @open-inventory="$emit('open-slot-inventory')"
        @open-order="$emit('open-slot-order', $event)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { ScheduleItemDto, TrendStatDto } from '../../../shared/api/backendTypes'
import JianyueSlotGrid from '../../../shared/components/schedule/JianyueSlotGrid.vue'
import SlotDetailPanel from '../../../shared/components/schedule/SlotDetailPanel.vue'
import type { JianyueSlotCard, JianyueSlotGroup } from '../../../shared/components/schedule/jianyueSlotTypes'

const TrendChart = defineAsyncComponent(() => import('../../../shared/components/dashboard/TrendChart.vue'))

defineProps<{
  selectedDateShortLabel: string
  trendGranularity: string
  trendStats: TrendStatDto[]
  slotGroups: JianyueSlotGroup[]
  selectedSlot: JianyueSlotCard | null
  selectedSlotStatusLabel: string
  selectedSlotStoreLabel: string
  selectedSlotServiceLabel: string
  selectedSlotRemaining: number
  selectedSlotRemainingLabel: string
  selectedSlotBlocked: boolean
  selectedSlotBlockedReason: string
  slotSelectionError: string
  selectedSlotServiceBreakdown: JianyueSlotCard['serviceGroupBreakdown']
  selectedSlotOrders: ScheduleItemDto[]
  formatClock: (value: string) => string
}>()

defineEmits<{
  'toggle-trend-granularity': []
  'open-slot-filter': []
  'select-slot': [slot: JianyueSlotCard]
  'close-slot': []
  'primary-slot-action': []
  'open-slot-orders': []
  'open-slot-inventory': []
  'open-slot-order': [item: ScheduleItemDto]
}>()
</script>
