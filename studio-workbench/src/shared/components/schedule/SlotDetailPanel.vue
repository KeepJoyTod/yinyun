<template>
  <section
    class="slot-detail-panel border-t border-amber-topbar-border bg-[#FBF8F2]/70 px-5 py-4"
    :aria-label="ariaLabel"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">时段详情</span>
        <h3 class="mt-1 text-[17px] font-sans font-semibold text-amber-dark">
          {{ slot.time }}{{ slot.endTime ? ` - ${slot.endTime}` : '' }} · {{ statusLabel }}
        </h3>
        <p class="mt-1 truncate text-[11px] font-sans text-amber-text-muted">
          {{ storeLabel }} · {{ serviceLabel }}
        </p>
      </div>
      <button
        class="yy-action rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-sans text-amber-text-muted hover:bg-black/5"
        type="button"
        @click="$emit('close')"
      >
        关闭
      </button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-md border border-amber-topbar-border bg-white/80 p-3">
        <div class="text-[10px] font-sans text-amber-text-muted">订单</div>
        <div class="mt-1 font-mono text-[22px] text-amber-dark">{{ slot.orderCount }}</div>
      </div>
      <div class="rounded-md border border-amber-topbar-border bg-white/80 p-3">
        <div class="text-[10px] font-sans text-amber-text-muted">工位</div>
        <div class="mt-1 font-mono text-[22px]" :class="slot.isFull ? 'text-amber-accent' : 'text-amber-dark'">{{ slot.capacityLabel }}</div>
      </div>
      <div class="rounded-md border border-amber-topbar-border bg-white/80 p-3">
        <div class="text-[10px] font-sans text-amber-text-muted">剩余</div>
        <div class="mt-1 font-mono text-[22px]" :class="remainingCount <= 0 ? 'text-amber-accent' : 'text-amber-dark'">{{ remainingLabel }}</div>
      </div>
      <div class="rounded-md border border-amber-topbar-border bg-white/80 p-3">
        <div class="text-[10px] font-sans text-amber-text-muted">冲突</div>
        <div class="mt-1 font-mono text-[22px]" :class="slot.conflictCount > 0 ? 'text-[#8C3E2C]' : 'text-amber-dark'">{{ slot.conflictCount }}</div>
      </div>
    </div>

    <div v-if="selectionError" class="mt-3 rounded-md border border-[#D8A58E] bg-[#FFF6F1] px-3 py-2 text-[11px] font-sans text-[#8C3E2C]">
      {{ selectionError }}
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button
        class="yy-action rounded-md bg-amber-dark px-4 py-2 text-[11px] font-sans font-medium text-[#F4EFE6] hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        :disabled="Boolean(selectionError)"
        @click="$emit('primaryAction')"
      >
        {{ blocked ? '去处理库存' : '新增预约' }}
      </button>
      <button
        class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[11px] font-sans font-medium text-amber-dark hover:bg-black/5"
        type="button"
        @click="$emit('openOrders')"
      >
        查看该时段订单
      </button>
      <button
        class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[11px] font-sans font-medium text-amber-dark hover:bg-black/5"
        type="button"
        @click="$emit('openInventory')"
      >
        调整容量
      </button>
    </div>
    <div v-if="blockedReason" class="mt-3 rounded-md border border-[#D8A58E] bg-[#FFF6F1] px-3 py-2 text-[11px] font-sans text-[#8C3E2C]">
      {{ blockedReason }}
    </div>

    <div v-if="serviceBreakdown.length > 0" class="mt-4 overflow-hidden rounded-md border border-amber-topbar-border bg-white/80">
      <div class="border-b border-amber-topbar-border px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">
        服务组拆分
      </div>
      <div class="divide-y divide-amber-topbar-border/60">
        <div
          v-for="group in serviceBreakdown"
          :key="group.serviceGroupBackendId"
          class="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] items-center gap-2 px-3 py-2 text-[11px] font-sans text-amber-dark"
        >
          <span class="min-w-0 truncate font-medium">{{ group.serviceGroupName }}</span>
          <span class="text-amber-text-muted">工位 {{ group.capacityLabel }}</span>
          <span :class="group.remainingCount <= 0 ? 'text-amber-accent' : 'text-amber-text-muted'">剩余 {{ group.remainingCount }}</span>
          <span :class="group.conflictCount > 0 ? 'text-[#8C3E2C]' : 'text-amber-text-muted'">冲突 {{ group.conflictCount }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-md border border-amber-topbar-border bg-white/80">
      <div class="grid grid-cols-[1fr_96px_82px] border-b border-amber-topbar-border px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">
        <span>订单 / 客户</span>
        <span>到店</span>
        <span>状态</span>
      </div>
      <button
        v-for="item in orders"
        :key="String(item.bookingId)"
        class="yy-action grid w-full grid-cols-[1fr_96px_82px] items-center gap-2 px-3 py-2 text-left text-[11px] font-sans text-amber-dark hover:bg-[#FBF8F2]"
        type="button"
        @click="$emit('openOrder', item)"
      >
        <span class="min-w-0">
          <b class="block truncate font-mono text-[11px]">{{ item.orderNo }}</b>
          <span class="block truncate text-amber-text-muted">{{ item.customerName || '未留姓名' }} · {{ item.customerPhone || '缺手机号' }}</span>
          <span class="block truncate text-amber-text-muted/80">{{ item.serviceName }}</span>
        </span>
        <span class="font-mono text-amber-text-muted">{{ formatClock(item.startAt) || item.bookingStatus }}</span>
        <span class="text-amber-text-muted">{{ item.orderStatus }}</span>
      </button>
      <div v-if="orders.length === 0" class="px-3 py-4 text-[11px] font-sans text-amber-text-muted">
        当前时段还没有预约订单，可直接新增预约。
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScheduleItemDto } from '../../api/backendTypes'
import type { JianyueSlotCard, JianyueSlotServiceGroupBreakdown } from './jianyueSlotTypes'

defineProps<{
  slot: JianyueSlotCard
  statusLabel: string
  storeLabel: string
  serviceLabel: string
  remainingCount: number
  remainingLabel: string
  blocked: boolean
  blockedReason?: string
  selectionError?: string
  serviceBreakdown: JianyueSlotServiceGroupBreakdown[]
  orders: ScheduleItemDto[]
  formatClock: (value: string) => string
  ariaLabel?: string
}>()

defineEmits<{
  close: []
  primaryAction: []
  openOrders: []
  openInventory: []
  openOrder: [item: ScheduleItemDto]
}>()
</script>
