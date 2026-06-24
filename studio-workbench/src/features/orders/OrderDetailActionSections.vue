<template>
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
}>()
</script>
