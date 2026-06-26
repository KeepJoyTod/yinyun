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

  <section class="rounded-md border border-red-100 bg-red-50/70 px-5 py-4 text-red-950" data-testid="order-refund-request-panel">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-semibold">内部退款审批</p>
        <p class="text-xs leading-5 text-red-800">
          这里只创建影约云退款审批；审批通过后更新订单和支付记录退款状态，不调用微信、抖音或美团真实退款 API。
        </p>
        <p class="text-xs text-red-800">当前退款状态：{{ order.refundStatus || '未申请' }}，已退金额：{{ ((order.refundAmountCent || 0) / 100).toFixed(2) }}</p>
      </div>
      <button
        v-if="showRefundRequest"
        type="button"
        class="rounded-md bg-red-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="refundSaving"
        @click="emit('submitRefundRequest')"
      >
        {{ refundSaving ? '提交中...' : '申请退款' }}
      </button>
    </div>
    <textarea
      v-if="showRefundRequest"
      class="mt-3 min-h-[72px] w-full border border-red-100 bg-white px-3 py-2 text-xs text-red-950 outline-none focus:border-red-800"
      :value="refundReason"
      placeholder="退款原因，默认按订单实付金额发起内部审批"
      @input="emit('updateRefundReason', ($event.target as HTMLTextAreaElement).value)"
    />
  </section>

  <OrderCopyPanel
    :schedule-mode="copyScheduleMode"
    :date="copyDate"
    :time="copyTime"
    :duration-minutes="copyDurationMinutes"
    :remark="copyRemark"
    :saving="copySaving"
    :can-reuse-source-slot="canReuseSourceSlot"
    @update-schedule-mode="emit('updateCopyScheduleMode', $event)"
    @update-date="emit('updateCopyDate', $event)"
    @update-time="emit('updateCopyTime', $event)"
    @update-duration-minutes="emit('updateCopyDurationMinutes', $event)"
    @update-remark="emit('updateCopyRemark', $event)"
    @submit="emit('submitCopyOrder')"
  />

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
import OrderCopyPanel from './OrderCopyPanel.vue'
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
  showRefundRequest: boolean
  refundSaving: boolean
  refundReason: string
  copyScheduleMode: 'REUSE_SLOT' | 'UNDECIDED'
  copyDate: string
  copyTime: string
  copyDurationMinutes: number
  copyRemark: string
  copySaving: boolean
  canReuseSourceSlot: boolean
}>()

const emit = defineEmits<{
  updateCopyScheduleMode: [value: 'REUSE_SLOT' | 'UNDECIDED']
  updateCopyDate: [value: string]
  updateCopyTime: [value: string]
  updateCopyDurationMinutes: [value: number]
  updateCopyRemark: [value: string]
  submitCopyOrder: []
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
  submitRefundRequest: []
  updateRefundReason: [value: string]
}>()
</script>
