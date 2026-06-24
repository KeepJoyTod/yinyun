<template>
  <div class="overflow-x-auto">
    <div v-if="loading" class="px-7 py-12 text-center text-[12px] font-sans text-ink-muted">
      加载档期数据…
    </div>
    <div v-else-if="loadError" class="px-7 py-12 text-center text-[12px] font-sans text-status-danger">
      {{ loadError }}
    </div>
    <table v-else class="w-full min-w-[900px] border-collapse">
      <thead>
        <tr class="border-b border-hairline">
          <th class="sticky left-0 z-10 bg-surface-2 w-[100px] px-3 py-2 text-left text-[10px] font-sans font-medium text-ink-muted uppercase tracking-wider border-r border-hairline">
            时段
          </th>
          <th
            v-for="d in gridDates"
            :key="d"
            class="px-2 py-2 text-center border-r border-hairline/50 last:border-r-0"
            :class="d === todayKey ? 'bg-accent/[0.04]' : ''"
          >
            <div class="text-[10px] font-sans font-medium text-ink-muted">{{ weekdayLabel(d) }}</div>
            <div class="text-[13px] font-sans font-semibold tabular-nums" :class="d === todayKey ? 'text-accent' : 'text-ink'">{{ dateLabel(d) }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="group in timeGroups" :key="group.key">
          <tr class="border-b border-hairline/50">
            <td
              :rowspan="1"
              class="sticky left-0 z-10 bg-surface-2 px-3 py-2 border-r border-hairline"
            >
              <div class="flex items-center gap-1.5">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
                  :class="group.key === 'morning' ? 'bg-emerald-50 text-emerald-600' : group.key === 'afternoon' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'"
                >
                  {{ group.key === 'morning' ? '上午' : group.key === 'afternoon' ? '下午' : '晚上' }}
                </span>
                <span class="text-[11px] font-sans font-medium text-ink">{{ group.label }}</span>
              </div>
            </td>
            <td
              v-for="d in gridDates"
              :key="d + group.key"
              class="px-1.5 py-1.5 border-r border-hairline/30 last:border-r-0 align-top"
              :class="d === todayKey ? 'bg-accent/[0.02]' : ''"
            >
              <div class="flex flex-col gap-1">
                <ScheduleGridCell
                  v-for="slot in slotsForDateAndGroup(d, group.key)"
                  :key="slot.id"
                  :slot="slot"
                  @select="$emit('openSlotDetail', $event)"
                />
                <button
                  v-if="slotsForDateAndGroup(d, group.key).length === 0"
                  class="yy-action min-h-[52px] w-full rounded-lg border border-dashed border-hairline/40 bg-canvas/50 text-[10px] font-sans text-ink-muted/50 hover:border-accent/30 hover:text-ink-muted transition-all"
                  type="button"
                  @click="$emit('openStaffBookingForSlot', d, group.key)"
                >
                  + 新增
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ScheduleGridSlotDto } from '../../shared/api/backendTypes'
import ScheduleGridCell from '../../shared/components/schedule/ScheduleGridCell.vue'

export type ScheduleTimeGroup = {
  key: 'morning' | 'afternoon' | 'evening'
  label: string
  start: string
  end: string
}

defineProps<{
  loading: boolean
  loadError: string
  gridDates: string[]
  todayKey: string
  timeGroups: readonly ScheduleTimeGroup[]
  weekdayLabel: (date: string) => string
  dateLabel: (date: string) => string
  slotsForDateAndGroup: (date: string, groupKey: string) => ScheduleGridSlotDto[]
}>()

defineEmits<{
  openSlotDetail: [slot: ScheduleGridSlotDto]
  openStaffBookingForSlot: [date: string, groupKey: ScheduleTimeGroup['key']]
}>()
</script>
