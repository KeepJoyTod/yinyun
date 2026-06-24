<template>
  <section class="rounded-3xl border border-amber-100 bg-amber-50/70 px-5 py-4 text-amber-950">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-semibold">门店确认收款</p>
        <p class="text-xs leading-5 text-amber-800">
          这是门店确认收款，不是第三方平台支付。仅对待支付、未取消、未退款的本地订单开放。
        </p>
      </div>
      <button
        v-if="showConfirmPayment"
        type="button"
        class="rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="confirmPaymentSaving"
        @click="emit('submitConfirmPayment')"
      >
        {{ confirmPaymentSaving ? '确认中...' : '确认收款' }}
      </button>
    </div>
  </section>

  <OrderReschedulePanel
    :order="order"
    :date="rescheduleDate"
    :time="rescheduleTime"
    :duration-minutes="rescheduleDurationMinutes"
    :remark="rescheduleRemark"
    :reason-options="rescheduleReasonOptions"
    :slot-options="rescheduleSlotOptions"
    :preview-slot="reschedulePreviewSlot"
    :preview-conflict-message="reschedulePreviewConflictMessage"
    :conflict="rescheduleConflict"
    :saving="rescheduleSaving"
    :is-slot-selected="isRescheduleSlotSelected"
    :build-slot-meta="buildRescheduleSlotMeta"
    @update-date="emit('updateRescheduleDate', $event)"
    @update-time="emit('updateRescheduleTime', $event)"
    @update-duration-minutes="emit('updateRescheduleDurationMinutes', $event)"
    @update-remark="emit('updateRescheduleRemark', $event)"
    @apply-reason="emit('applyRescheduleReason', $event)"
    @apply-slot="emit('applyRescheduleSlot', $event)"
    @submit="emit('submitReschedule')"
  />

  <OrderChannelInfoPanel
    label="渠道信息"
    :source="order.source"
    :method="order.method"
    :payment="order.payment"
  />

  <OrderSourceContextPanel
    :context="sourceContext"
    :tone-styles="toneStyles"
  />

  <OrderCancelPanel
    :order="order"
    :guidance="cancelGuidance"
    :reason="cancelReason"
    :reason-options="cancelReasonOptions"
    :saving="cancelSaving"
    :disabled="cancelDisabled"
    @update-reason="emit('updateCancelReason', $event)"
    @apply-reason="emit('applyCancelReason', $event)"
    @submit="emit('submitCancel')"
  />
</template>

<script setup lang="ts">
import type { BookingInventorySlot, BookingOrder } from '../../shared/stores/appStore'
import OrderCancelPanel from './OrderCancelPanel.vue'
import OrderChannelInfoPanel from './OrderChannelInfoPanel.vue'
import OrderReschedulePanel from './OrderReschedulePanel.vue'
import OrderSourceContextPanel from './OrderSourceContextPanel.vue'
import type { OrderCancelGuidance, OrderSourceContext } from './orderOperations'

defineProps<{
  order: BookingOrder
  rescheduleDate: string
  rescheduleTime: string
  rescheduleDurationMinutes: number
  rescheduleRemark: string
  rescheduleReasonOptions: string[]
  rescheduleSlotOptions: BookingInventorySlot[]
  reschedulePreviewSlot: BookingInventorySlot | null
  reschedulePreviewConflictMessage: string
  rescheduleConflict: string
  rescheduleSaving: boolean
  isRescheduleSlotSelected: (slot: BookingInventorySlot) => boolean
  buildRescheduleSlotMeta: (slot: BookingInventorySlot) => string
  sourceContext: OrderSourceContext
  toneStyles: Record<OrderSourceContext['tone'], string>
  cancelGuidance: OrderCancelGuidance
  cancelReason: string
  cancelReasonOptions: string[]
  cancelSaving: boolean
  cancelDisabled: boolean
  showConfirmPayment: boolean
  confirmPaymentSaving: boolean
}>()

const emit = defineEmits<{
  updateRescheduleDate: [value: string]
  updateRescheduleTime: [value: string]
  updateRescheduleDurationMinutes: [value: number]
  updateRescheduleRemark: [value: string]
  applyRescheduleReason: [reason: string]
  applyRescheduleSlot: [slot: BookingInventorySlot]
  submitReschedule: []
  updateCancelReason: [value: string]
  applyCancelReason: [reason: string]
  submitCancel: []
  submitConfirmPayment: []
}>()
</script>
