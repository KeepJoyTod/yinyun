<template>
  <div ref="tableScrollRef" class="flex-1 overflow-x-auto bg-surface-1">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-canvas/10 border-b border-hairline text-left">
          <th v-for="col in columns" :key="col" class="px-7 py-3.5 text-[13px] font-sans font-semibold text-ink-muted leading-[16.5px]">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-hairline/50">
        <tr
          v-for="order in orders"
          :key="order.id"
          class="yy-clickable-row group transition-colors"
          :class="order.status === '待确认' ? 'bg-surface-1/70 hover:bg-surface-1' : 'hover:bg-accent-hover/[0.01]'"
          @click="$emit('open-detail', order)"
        >
          <td class="px-7 py-4 text-[13px] font-mono text-ink leading-[16.5px]">{{ order.id }}</td>
          <td class="px-7 py-4">
            <div class="flex flex-col">
              <span class="text-[14px] font-sans font-semibold text-ink leading-[17.25px]">{{ order.customer }}</span>
              <span class="text-[12.5px] font-sans text-ink-muted leading-[15px] mt-1">{{ order.phone }}</span>
            </div>
          </td>
          <td class="px-7 py-4 text-[14px] font-sans font-medium text-ink leading-[17.25px]">{{ order.store }}</td>
          <td class="px-7 py-4 text-[14px] font-sans font-medium text-ink leading-[17.25px]">{{ order.service }}</td>
          <td class="px-7 py-4">
            <div class="flex flex-col">
              <span class="text-[14px] font-sans font-medium text-ink leading-[17.25px]">{{ order.source }}</span>
              <span class="text-[12.5px] font-sans text-ink-muted leading-[15px] mt-1">{{ order.method }}</span>
            </div>
          </td>
          <td class="px-7 py-4 text-[13px] font-mono text-ink-muted leading-[16.5px]">{{ order.orderTime }}</td>
          <td class="px-7 py-4 text-[13px] font-mono text-ink leading-[16.5px] font-semibold">{{ order.arrivalTime }}</td>
          <td class="px-7 py-4">
            <span class="px-2 py-0.5 rounded-md text-[10.5px] font-sans font-medium" :class="statusStyles[order.status]">
              {{ order.status }}
            </span>
          </td>
          <td class="px-7 py-4">
            <div class="flex min-w-[118px] flex-col items-start gap-1.5">
              <OrderRowActions
                :can-advance="Boolean(canAdvance(order))"
                :advancing="advancingId === order.id"
                :next-label="getNextLabel(order)"
                @advance="$emit('advance', order)"
                @print="$emit('print', order)"
                @detail="$emit('open-detail', order)"
              />
              <span class="text-[9.5px] font-sans text-ink-muted">{{ getNextHint(order) }}</span>
              <span v-if="!isDemo && canAdvance(order)" class="text-[9.5px] font-sans text-status-done">
                点击后写入影约云订单库
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="orders.length === 0" class="m-7 border border-dashed border-hairline bg-surface-1/70 px-6 py-8 text-center">
      <div class="text-[13px] font-sans font-medium text-ink">{{ emptyTitle }}</div>
      <p class="mx-auto mt-2 max-w-[360px] text-[10.5px] font-sans leading-relaxed text-ink-muted">{{ emptyHint }}</p>
      <div class="mt-4 flex justify-center gap-2">
        <button
          class="yy-action border border-accent bg-accent px-4 py-2 text-[10.5px] font-sans font-medium text-ink hover:bg-accent-hover"
          type="button"
          @click="$emit('show-all')"
        >
          查看近30天来客
        </button>
        <button
          class="yy-action border border-hairline px-4 py-2 text-[10.5px] font-sans font-medium text-ink-muted hover:bg-accent-hover/5"
          type="button"
          @click="$emit('reset')"
        >
          重置筛选
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHorizontalWheel } from '../../shared/composables/useHorizontalWheel'
import OrderRowActions from './OrderRowActions.vue'

const tableScrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(tableScrollRef)

defineProps<{
  columns: string[]
  orders: any[]
  statusStyles: Record<string, string>
  emptyTitle: string
  emptyHint: string
  hasMore: boolean
  canAdvance: (order: any) => boolean
  advancingId: string
  getNextLabel: (order: any) => string
  getNextHint: (order: any) => string
  isDemo: boolean
}>()

defineEmits<{
  (e: 'open-detail', order: any): void
  (e: 'advance', order: any): void
  (e: 'print', order: any): void
  (e: 'show-all'): void
  (e: 'reset'): void
}>()
</script>
