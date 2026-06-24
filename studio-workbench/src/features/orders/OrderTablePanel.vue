<template>
  <div ref="ordersTableScrollRef" class="flex-1 overflow-x-auto bg-amber-content-bg">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-amber-bg/10 border-b border-amber-topbar-border text-left">
          <th v-for="col in tableColumns" :key="col" class="px-7 py-3.5 text-[13px] font-sans font-semibold text-amber-text-muted leading-[16.5px]">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-amber-topbar-border/50">
        <tr
          v-for="order in filteredOrders"
          :key="order.id"
          class="yy-clickable-row group transition-colors"
          :class="order.status === '待确认' ? 'bg-amber-content-bg/70 hover:bg-amber-content-bg' : 'hover:bg-black/[0.01]'"
          @click="$emit('openOrder', order)"
        >
          <td class="px-7 py-4 text-[13px] font-mono text-amber-dark leading-[16.5px]">{{ order.id }}</td>
          <td class="px-7 py-4">
            <div class="flex flex-col">
              <span class="text-[14px] font-sans font-semibold text-amber-dark leading-[17.25px]">{{ order.customer }}</span>
              <span class="text-[12.5px] font-sans text-amber-text-muted leading-[15px] mt-1">{{ order.phone }}</span>
            </div>
          </td>
          <td class="px-7 py-4 text-[14px] font-sans font-medium text-amber-dark leading-[17.25px]">{{ order.store }}</td>
          <td class="px-7 py-4 text-[14px] font-sans font-medium text-amber-dark leading-[17.25px]">{{ order.service }}</td>
          <td class="px-7 py-4">
            <div class="flex flex-col">
              <span class="text-[14px] font-sans font-medium text-amber-dark leading-[17.25px]">{{ order.source }}</span>
              <span class="text-[12.5px] font-sans text-amber-text-muted leading-[15px] mt-1">{{ order.method }}</span>
            </div>
          </td>
          <td class="px-7 py-4 text-[13px] font-mono text-amber-text-muted leading-[16.5px]">{{ order.orderTime }}</td>
          <td class="px-7 py-4 text-[13px] font-mono text-amber-dark leading-[16.5px] font-semibold">{{ order.arrivalTime }}</td>
          <td class="px-7 py-4">
            <span
              class="px-2 py-0.5 rounded-md text-[10.5px] font-sans font-medium"
              :class="statusStyles[order.status]"
            >
              {{ order.status }}
            </span>
          </td>
          <td class="px-7 py-4">
            <div class="flex min-w-[118px] flex-col items-start gap-1.5">
              <span class="text-[9.5px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
                {{ getOrderSyncLabel() }}
              </span>
              <button
                v-if="getNextOrderAction(order)"
                class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] font-sans font-medium text-[#F4EFE6] hover:bg-black disabled:border-amber-topbar-border disabled:bg-amber-bg disabled:text-amber-text-muted"
                type="button"
                :disabled="updatingOrderId === order.id"
                @click.stop="$emit('advanceOrder', order)"
              >
                {{ updatingOrderId === order.id ? '处理中...' : getNextOrderAction(order)?.label }}
              </button>
              <span
                v-else
                class="border border-amber-topbar-border bg-black/[0.02] px-2 py-1 text-[10px] font-sans text-amber-text-muted"
              >
                等待客户选片
              </span>
              <span class="text-[9.5px] font-sans text-amber-text-muted">{{ getNextOrderHint(order) }}</span>
              <span v-if="!demoMode && getNextOrderAction(order)" class="text-[9.5px] font-sans text-[#2D7A4D]">
                点击后写入影约云订单库
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="filteredOrders.length === 0"
      class="m-7 border border-dashed border-amber-topbar-border bg-amber-content-bg/70 px-6 py-8 text-center"
    >
      <div class="text-[13px] font-sans font-medium text-amber-dark">{{ emptyStateTitle }}</div>
      <p class="mx-auto mt-2 max-w-[360px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
        {{ emptyStateHint }}
      </p>
      <div class="mt-4 flex justify-center gap-2">
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[10.5px] font-sans font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="$emit('showAllOrders')"
        >
          查看近30天来客
        </button>
        <button
          class="yy-action border border-amber-topbar-border px-4 py-2 text-[10.5px] font-sans font-medium text-amber-text-muted hover:bg-black/5"
          type="button"
          @click="$emit('resetFilters')"
        >
          重置筛选
        </button>
      </div>
    </div>
  </div>

  <div class="px-7 py-4 border-t border-amber-topbar-border flex items-center justify-between bg-amber-bg/5">
    <div class="text-[11px] text-amber-text-muted font-mono">
      Showing {{ paginationStart }} to {{ filteredOrders.length }} of {{ filteredOrders.length }} entries
    </div>
    <div class="flex items-center gap-1">
      <button
        class="px-3 py-1 text-[11px] font-mono rounded-md border border-transparent bg-amber-dark text-[#F4EFE6] hover:border-amber-topbar-border transition-all"
        type="button"
      >
        1
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHorizontalWheel } from '../../shared/composables/useHorizontalWheel'
import type { BookingOrder } from '../../shared/stores/appStore'

const ordersTableScrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(ordersTableScrollRef)

defineProps<{
  filteredOrders: BookingOrder[]
  tableColumns: string[]
  statusStyles: Record<string, string>
  getOrderSyncLabel: () => string
  getNextOrderAction: (order: BookingOrder) => { label: string } | null | undefined
  getNextOrderHint: (order: BookingOrder) => string
  updatingOrderId: string
  demoMode: boolean
  emptyStateTitle: string
  emptyStateHint: string
  paginationStart: number
}>()

defineEmits<{
  openOrder: [order: BookingOrder]
  advanceOrder: [order: BookingOrder]
  showAllOrders: []
  resetFilters: []
}>()
</script>
