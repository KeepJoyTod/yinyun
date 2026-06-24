<template>
  <button
    class="yy-action group relative min-h-[72px] w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition duration-150"
    :class="cellClasses"
    type="button"
    :aria-label="`${slot.bizDate} ${slot.startTime}-${slot.endTime}，容量 ${slot.capacity}，已约 ${slot.paidCount}，剩余 ${slot.remainCount}`"
    @click="$emit('select', slot)"
  >
    <div class="flex items-baseline justify-between gap-1">
      <span class="font-mono text-[15px] font-semibold leading-none tabular-nums text-ink">{{ slot.startTime }}</span>
      <span v-if="slot.slotStatus === 'SLOT_FULL'" class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-sans font-medium text-white">满</span>
      <span v-else-if="slot.slotStatus === 'SLOT_CONFLICT'" class="rounded bg-status-danger px-1.5 py-0.5 text-[9px] font-sans font-medium text-white">冲突</span>
    </div>

    <div class="mt-2 flex items-center gap-2 text-[11px] font-sans text-ink-muted">
      <span>约<b class="tabular-nums text-ink" :class="slot.paidCount > 0 ? 'text-accent' : ''">{{ slot.paidCount }}</b></span>
      <span class="text-hairline">/</span>
      <span>容<b class="tabular-nums text-ink">{{ slot.capacity }}</b></span>
      <span class="text-hairline">·</span>
      <span>余<b class="tabular-nums" :class="slot.remainCount <= 0 ? 'text-status-danger' : 'text-status-done'">{{ slot.remainCount }}</b></span>
    </div>

    <div v-if="slot.orders.length > 0" class="mt-1.5 truncate text-[10px] font-sans text-ink-muted/70">
      {{ slot.orders[0].customerName }}{{ slot.orders.length > 1 ? ` 等${slot.orders.length}单` : '' }}
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleGridSlotDto } from '../../../shared/api/backendTypes'

const props = defineProps<{ slot: ScheduleGridSlotDto }>()
defineEmits<{ select: [slot: ScheduleGridSlotDto] }>()

const cellClasses = computed(() => {
  const s = props.slot
  if (s.slotStatus === 'SLOT_CONFLICT') return 'border-status-danger/40 bg-status-danger/[0.04] hover:border-status-danger/60'
  if (s.slotStatus === 'SLOT_FULL') return 'border-accent/30 bg-accent/[0.04] hover:border-accent/50'
  if (s.slotStatus === 'SLOT_PARTIAL') return 'border-hairline bg-surface-1 hover:border-accent/30'
  return 'border-hairline/60 bg-canvas hover:border-accent/20'
})
</script>
