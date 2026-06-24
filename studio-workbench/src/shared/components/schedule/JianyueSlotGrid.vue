<template>
  <div class="jianyue-slot-grid space-y-6" aria-label="上午 / 下午 / 晚上预约时段">
    <section v-for="group in groups" :key="group.key" class="space-y-3">
      <div class="flex items-center justify-between gap-3 border-b border-amber-topbar-border/70 pb-2.5">
        <div class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full"
            :class="group.key === 'morning' ? 'bg-emerald-50 text-emerald-600' : group.key === 'afternoon' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'"
          >
            <Sunrise v-if="group.key === 'morning'" :size="14" :stroke-width="1.8" />
            <Sun v-else-if="group.key === 'afternoon'" :size="14" :stroke-width="1.8" />
            <Moon v-else :size="14" :stroke-width="1.8" />
          </span>
          <h4 class="text-[15px] font-sans font-medium text-amber-dark">{{ group.label }}</h4>
          <span class="text-[12px] font-sans text-amber-text-muted tabular-nums">
            {{ group.orderCount }} 单 · 工位 {{ group.confirmedCount }}/{{ group.capacity || '-' }}
          </span>
        </div>
        <span v-if="group.fullCount > 0" class="rounded bg-[#FFF1E8] px-2 py-0.5 text-[11px] font-sans font-medium text-[#FF7540]">
          {{ group.fullCount }} 满
        </span>
      </div>

      <div
        v-if="group.slots.length"
        class="jianyue-slot-grid-list grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-3"
      >
        <button
          v-for="slot in group.slots"
          :key="slot.id"
          class="yy-action group/slot relative min-h-[92px] w-full overflow-hidden rounded-md border px-3.5 py-3.5 text-center transition duration-150 hover:border-amber-dark/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-accent/50"
          :class="slotClasses(slot)"
          type="button"
          :aria-label="`查看 ${group.label} ${slot.time} 预约，订单 ${slot.orderCount}，工位 ${slot.capacityLabel}，剩余 ${slot.hasInventory ? slot.remainingCount : '-'}`"
          @click="$emit('select-slot', slot)"
        >
          <span
            v-if="slot.isFull"
            class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7540] text-[13px] font-sans font-semibold text-white"
          >
            满
          </span>
          <span v-if="slot.conflictCount > 0" class="absolute left-3 top-3 rounded bg-[#B8543B]/10 px-1.5 py-0.5 text-[10px] text-[#8C3E2C]">
            冲突 {{ slot.conflictCount }}
          </span>

          <div class="flex items-baseline justify-center gap-2">
            <strong class="font-sans text-[23px] font-semibold leading-none tabular-nums text-[#7893A3]">{{ slot.time }}</strong>
            <span class="text-[11px] font-sans text-amber-text-muted">{{ slot.endTime }}</span>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12.5px] font-sans text-[#7893A3]">
            <span>订单： <b class="font-sans tabular-nums" :class="slot.orderCount > 0 ? 'text-[#FF7540]' : 'text-[#7893A3]'">{{ slot.orderCount }}</b></span>
            <span>工位： <b class="font-sans tabular-nums" :class="slot.isFull ? 'text-[#FF7540]' : 'text-[#7893A3]'">{{ slot.capacityLabel }}</b></span>
            <span>剩余： <b class="font-sans tabular-nums" :class="slot.isFull ? 'text-[#FF7540]' : 'text-[#7893A3]'">{{ slot.hasInventory ? slot.remainingCount : '-' }}</b></span>
          </div>

          <p class="mt-2.5 truncate text-[11px] font-sans text-amber-text-muted/70">
            {{ slot.storeNames[0] || slot.serviceGroupNames[0] || (slot.hasInventory ? '库存已同步' : '来自真实订单') }}
          </p>
        </button>
      </div>

      <div v-else class="rounded-md border border-dashed border-amber-topbar-border bg-[#FBF8F2]/50 px-4 py-4 text-[12px] font-sans text-amber-text-muted">
        这个时段暂无可展示预约。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Moon, Sun, Sunrise } from 'lucide-vue-next'
import type { JianyueSlotCard, JianyueSlotGroup } from './jianyueSlotTypes'

defineProps<{
  groups: JianyueSlotGroup[]
}>()

defineEmits<{
  'select-slot': [slot: JianyueSlotCard]
}>()

const slotClasses = (slot: JianyueSlotCard) => {
  if (slot.isFull) return 'border-transparent bg-[#E9ECEF] shadow-sm'
  if (slot.orderCount > 0) return 'border-[#AAB9C4] bg-white shadow-sm'
  return 'border-[#AAB9C4] bg-white'
}
</script>
