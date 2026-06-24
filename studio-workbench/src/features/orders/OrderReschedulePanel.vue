<template>
  <section class="order-reschedule-section border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 flex items-start justify-between gap-3">
      <div>
        <div class="font-sans text-[14px] font-medium text-amber-dark">改期</div>
        <p class="mt-1 text-[10.5px] font-sans text-amber-text-muted">
          当前到店：{{ order.arrivalDate || '未排期' }} {{ order.arrivalClock || '' }}
        </p>
      </div>
      <span class="border border-amber-topbar-border bg-white px-2 py-1 text-[9px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
        改期
      </span>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <label class="flex flex-col gap-1 text-[10px] font-sans text-amber-text-muted">
        日期
        <input
          :value="date"
          class="h-8 border border-amber-topbar-border bg-white px-2 text-[11px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40"
          type="date"
          @input="emit('update-date', readInput($event))"
        />
      </label>
      <label class="flex flex-col gap-1 text-[10px] font-sans text-amber-text-muted">
        时间
        <input
          :value="time"
          class="h-8 border border-amber-topbar-border bg-white px-2 text-[11px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40"
          type="time"
          @input="emit('update-time', readInput($event))"
        />
      </label>
      <label class="flex flex-col gap-1 text-[10px] font-sans text-amber-text-muted">
        时长
        <input
          :value="durationMinutes"
          class="h-8 border border-amber-topbar-border bg-white px-2 text-[11px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40"
          min="15"
          step="15"
          type="number"
          @input="emit('update-duration-minutes', readNumber($event))"
        />
      </label>
      <label class="flex flex-col gap-1 text-[10px] font-sans text-amber-text-muted">
        备注
        <input
          :value="remark"
          class="h-8 border border-amber-topbar-border bg-white px-2 text-[11px] text-amber-dark focus:outline-none focus:border-amber-dark/40"
          placeholder="客户要求 / 门店调整"
          type="text"
          @input="emit('update-remark', readInput($event))"
        />
      </label>
    </div>
    <details class="reschedule-reason-foldout mt-3 rounded-md border border-amber-topbar-border/70 bg-white/45">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[10.5px] font-sans text-amber-dark">
        <span class="font-medium">快捷原因</span>
        <span class="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-text-muted">
          {{ remark || '可选' }}
        </span>
      </summary>
      <div class="flex flex-wrap gap-1.5 border-t border-amber-topbar-border/70 px-3 py-2">
        <button
          v-for="reason in reasonOptions"
          :key="reason"
          class="yy-action rounded-full border border-amber-topbar-border/70 bg-white/70 px-2.5 py-1 text-[10px] font-sans text-amber-text-muted hover:border-amber-dark/30 hover:text-amber-dark"
          type="button"
          @click="emit('apply-reason', reason)"
        >
          {{ reason }}
        </button>
      </div>
    </details>
    <div class="mt-3 rounded-md border border-amber-topbar-border/70 bg-white/65 p-3">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div>
          <div class="text-[11px] font-sans font-medium text-amber-dark">半小时时段</div>
          <p class="mt-0.5 text-[10.5px] leading-relaxed text-amber-text-muted">从当前门店和服务组容量账本选择，提交时后端仍会最终校验。</p>
        </div>
        <span class="shrink-0 rounded border border-amber-topbar-border/70 bg-amber-content-bg px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.12em] text-amber-text-muted">
          {{ slotOptions.length }} slots
        </span>
      </div>
      <div v-if="slotOptions.length" class="reschedule-slot-grid grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2">
        <button
          v-for="slot in slotOptions"
          :key="slot.backendId"
          class="yy-action rounded-md border px-2.5 py-2 text-left transition"
          :class="isSlotSelected(slot)
            ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
            : slot.conflictCount > 0 || slot.confirmedCount >= slot.capacity
              ? 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
              : 'border-amber-topbar-border bg-white text-amber-dark hover:border-amber-dark/30'"
          type="button"
          @click="emit('apply-slot', slot)"
        >
          <span class="block font-mono text-[12px] font-semibold">{{ slot.startTime }}-{{ slot.endTime }}</span>
          <span class="mt-1 block text-[10px] opacity-80">{{ buildSlotMeta(slot) }}</span>
        </button>
      </div>
      <p v-else class="rounded-md border border-dashed border-amber-topbar-border bg-amber-content-bg/70 px-3 py-3 text-[10.5px] leading-relaxed text-amber-text-muted">
        当前日期或门店还没有加载半小时时段；可先手动输入时间，或回到今日看板/库存页刷新容量。
      </p>
    </div>
    <div
      v-if="previewSlot"
      class="mt-3 border px-3 py-2 text-[10.5px] font-sans leading-relaxed"
      :class="previewConflictMessage
        ? 'border-[#B8543B]/30 bg-[#B8543B]/10 text-[#8C3E2C]'
        : 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'"
    >
      <div class="font-medium text-amber-dark">
        目标时段：{{ previewSlot.serviceGroupName }} · {{ previewSlot.startTime }}-{{ previewSlot.endTime }}
      </div>
      <div class="mt-1">
        容量 {{ previewSlot.capacity }}，已确认 {{ previewSlot.confirmedCount }}，冲突 {{ previewSlot.conflictCount }}。
        {{ previewConflictMessage ? '请先调整改期时段。' : '可提交，后端仍会最终校验。' }}
      </div>
      <div v-if="previewSlot.remark" class="mt-1 text-amber-text-muted">
        {{ previewSlot.remark }}
      </div>
    </div>
    <p v-if="conflict" class="mt-3 border border-[#B8543B]/30 bg-[#B8543B]/10 px-3 py-2 text-[10.5px] font-sans leading-relaxed text-[#8C3E2C]">
      库存冲突：{{ conflict }}
    </p>
    <button
      class="yy-action mt-3 w-full border border-amber-topbar-border bg-white px-4 py-2.5 text-[11px] font-sans font-medium text-amber-dark hover:bg-black/5 disabled:bg-amber-bg disabled:text-amber-text-muted"
      type="button"
      :disabled="saving || Boolean(previewConflictMessage)"
      @click="emit('submit')"
    >
      {{ previewConflictMessage ? '请先调整改期时段' : saving ? '改期中...' : '保存改期' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { BookingInventorySlot, BookingOrder } from '../../shared/stores/appStore'

defineProps<{
  order: BookingOrder
  date: string
  time: string
  durationMinutes: number
  remark: string
  reasonOptions: string[]
  slotOptions: BookingInventorySlot[]
  previewSlot: BookingInventorySlot | null
  previewConflictMessage: string
  conflict: string
  saving: boolean
  isSlotSelected: (slot: BookingInventorySlot) => boolean
  buildSlotMeta: (slot: BookingInventorySlot) => string
}>()

const emit = defineEmits<{
  'update-date': [value: string]
  'update-time': [value: string]
  'update-duration-minutes': [value: number]
  'update-remark': [value: string]
  'apply-reason': [reason: string]
  'apply-slot': [slot: BookingInventorySlot]
  submit: []
}>()

const readInput = (event: Event) => {
  return event.target instanceof HTMLInputElement ? event.target.value : ''
}

const readNumber = (event: Event) => {
  const value = event.target instanceof HTMLInputElement ? Number(event.target.value) : 0
  return Number.isFinite(value) ? value : 0
}
</script>
