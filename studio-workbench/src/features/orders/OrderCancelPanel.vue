<template>
  <section class="order-cancel-section border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <div>
        <div class="font-sans text-[14px] font-medium text-amber-dark">取消预约</div>
        <p class="mt-1 text-[10.5px] font-sans text-amber-text-muted">
          当前状态：{{ order.status }}
        </p>
      </div>
      <span class="border border-[var(--color-status-danger-border)] bg-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-status-danger)]">取消</span>
    </div>
    <details
      class="cancel-guidance-foldout rounded-md border bg-white/70 text-[10.5px] leading-relaxed"
      :class="guidance.tone === 'danger'
        ? 'border-[var(--color-status-danger-border)] text-[var(--color-status-danger)]'
        : guidance.tone === 'warn'
          ? 'border-[var(--color-status-pending-border)] text-[var(--color-status-pending)]'
          : 'border-amber-topbar-border text-amber-text-muted'"
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
        <span class="font-sans text-[11px] font-semibold text-amber-dark">{{ guidance.title }}</span>
        <span class="border border-current/25 bg-white px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.14em]">提示</span>
      </summary>
      <p class="border-t border-black/10 px-3 py-2">{{ guidance.body }}</p>
    </details>
    <label class="mt-3 flex flex-col gap-1 text-[10px] font-sans text-amber-text-muted">
      取消原因
      <textarea
        :value="reason"
        class="min-h-[64px] border border-[var(--color-status-danger-border)] bg-white px-3 py-2 text-[11px] text-amber-dark focus:outline-none focus:border-amber-dark/40"
        placeholder="请输入取消原因"
        @input="emit('update-reason', readTextarea($event))"
      ></textarea>
    </label>
    <details class="cancel-reason-foldout mt-2 rounded-md border border-[var(--color-status-danger-border)] bg-white/55">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[10.5px] font-sans text-amber-dark">
        <span class="font-medium">快捷原因</span>
        <span class="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-text-muted">
          {{ reason || '可选' }}
        </span>
      </summary>
      <div class="flex flex-wrap gap-1.5 border-t border-[var(--color-status-danger-border)] px-3 py-2">
        <button
          v-for="item in reasonOptions"
          :key="item"
          class="yy-action rounded-full border border-[var(--color-status-danger-border)] bg-white/80 px-2.5 py-1 text-[10px] font-sans text-[var(--color-status-danger)] hover:bg-white"
          type="button"
          @click="emit('apply-reason', item)"
        >
          {{ item }}
        </button>
      </div>
    </details>
    <button
      class="yy-action mt-3 w-full border border-[var(--color-status-danger-border)] bg-white px-4 py-2.5 text-[11px] font-sans font-medium text-[var(--color-status-danger)] hover:bg-black/5 disabled:bg-amber-bg disabled:text-amber-text-muted"
      type="button"
      :disabled="saving || disabled"
      @click="emit('submit')"
    >
      {{ saving ? '取消中...' : '取消预约' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { BookingOrder } from '../../shared/stores/appStore'
import type { OrderCancelGuidance } from './orderOperations'

defineProps<{
  order: BookingOrder
  guidance: OrderCancelGuidance
  reason: string
  reasonOptions: string[]
  saving: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  'update-reason': [value: string]
  'apply-reason': [reason: string]
  submit: []
}>()

const readTextarea = (event: Event) => {
  return event.target instanceof HTMLTextAreaElement ? event.target.value : ''
}
</script>
