<template>
  <Transition name="fade">
    <OrderDetailDrawer
      v-if="context.order"
      :addon-summary="context.addonSummary"
      :advancing="context.advancing"
      :album="context.album"
      :album-action-availability="context.albumActionAvailability"
      :album-action-loading="context.albumActionLoading"
      :build-reschedule-slot-meta="context.buildRescheduleSlotMeta"
      :cancel-disabled="context.cancelDisabled"
      :cancel-guidance="context.cancelGuidance"
      :cancel-reason="context.cancelReason"
      :cancel-reason-options="context.cancelReasonOptions"
      :cancel-saving="context.cancelSaving"
      :confirm-payment-saving="context.confirmPaymentSaving"
      :refund-reason="context.refundReason"
      :refund-saving="context.refundSaving"
      :can-advance="context.canAdvance"
      :can-confirm-album="context.canConfirmAlbum"
      :can-deliver-album="context.canDeliverAlbum"
      :can-notify-album="context.canNotifyAlbum"
      :capacity-summary="context.capacitySummary"
      :channel-diagnostic-copied="context.channelDiagnosticCopied"
      :copied-field="context.copiedField"
      :evidence-cards="context.evidenceCards"
      :flow-steps="context.flowSteps"
      :is-reschedule-slot-selected="context.isRescheduleSlotSelected"
      :next-action-label="context.nextActionLabel"
      :notice="context.notice"
      :operation-logs-loading="context.operationLogsLoading"
      :operation-logs-state-text="context.operationLogsStateText"
      :operational-hint="context.operationalHint"
      :order="context.order"
      :payment-tone="context.paymentTone"
      :photo-access-error="context.photoAccessError"
      :photo-access-loading="context.photoAccessLoading"
      :photo-access-logs="context.photoAccessLogs"
      :photo-stage="context.photoStage"
      :photo-stage-class="context.photoStageClass"
      :product="context.product"
      :copy-date="context.copyDate"
      :copy-duration-minutes="context.copyDurationMinutes"
      :copy-remark="context.copyRemark"
      :copy-saving="context.copySaving"
      :copy-schedule-mode="context.copyScheduleMode"
      :copy-time="context.copyTime"
      :can-reuse-source-slot="context.canReuseSourceSlot"
      :reschedule-conflict="context.rescheduleConflict"
      :reschedule-date="context.rescheduleDate"
      :reschedule-duration-minutes="context.rescheduleDurationMinutes"
      :reschedule-preview-conflict-message="context.reschedulePreviewConflictMessage"
      :reschedule-preview-slot="context.reschedulePreviewSlot"
      :reschedule-reason-options="context.rescheduleReasonOptions"
      :reschedule-remark="context.rescheduleRemark"
      :reschedule-saving="context.rescheduleSaving"
      :reschedule-slot-options="context.rescheduleSlotOptions"
      :reschedule-time="context.rescheduleTime"
      :show-confirm-payment="context.showConfirmPayment"
      :show-refund-request="context.showRefundRequest"
      :show-back-to-slot="context.showBackToSlot"
      :slot-time-label="context.slotTimeLabel"
      :source-context="context.sourceContext"
      :status-class="context.statusClass"
      :store-scope-text="context.storeScopeText"
      :sync-logs="context.syncLogs"
      :timeline="context.timeline"
      :timeline-tone-styles="context.timelineToneStyles"
      :tone-styles="context.toneStyles"
      @advance="emit('advance', $event)"
      @apply-cancel-reason="emit('applyCancelReason', $event)"
      @apply-reschedule-reason="emit('applyRescheduleReason', $event)"
      @apply-reschedule-slot="emit('applyRescheduleSlot', $event)"
      @back-to-slot="emit('backToSlot')"
      @close="emit('close')"
      @confirm-album="emit('confirmAlbum')"
      @copy="(value, key) => emit('copy', value, key)"
      @copy-channel-diagnostic="emit('copyChannelDiagnostic')"
      @submit-copy-order="emit('submitCopyOrder')"
      @copy-order-id="emit('copyOrderId')"
      @deliver-album="emit('deliverAlbum')"
      @notify-album="emit('notifyAlbum')"
      @open-album="emit('openAlbum', $event)"
      @open-photo-management="emit('openPhotoManagement')"
      @refresh-logs="emit('refreshLogs')"
      @refresh-operation-logs="emit('refreshOperationLogs')"
      @submit-cancel="emit('submitCancel')"
      @submit-confirm-payment="emit('submitConfirmPayment')"
      @submit-refund-request="emit('submitRefundRequest')"
      @submit-reschedule="emit('submitReschedule')"
      @update-cancel-reason="emit('updateCancelReason', $event)"
      @update-copy-schedule-mode="emit('updateCopyScheduleMode', $event)"
      @update-copy-date="emit('updateCopyDate', $event)"
      @update-copy-time="emit('updateCopyTime', $event)"
      @update-copy-duration-minutes="emit('updateCopyDurationMinutes', $event)"
      @update-copy-remark="emit('updateCopyRemark', $event)"
      @update-refund-reason="emit('updateRefundReason', $event)"
      @update-reschedule-date="emit('updateRescheduleDate', $event)"
      @update-reschedule-duration-minutes="emit('updateRescheduleDurationMinutes', $event)"
      @update-reschedule-remark="emit('updateRescheduleRemark', $event)"
      @update-reschedule-time="emit('updateRescheduleTime', $event)"
    />
  </Transition>
</template>

<script setup lang="ts">
import type { AlbumActionAvailability, PhotoAccessLogRow } from '../albums/photoMgmtOperations'
import type { StatusBadgeTone } from '../../shared/components/data/StatusBadge.vue'
import type {
  Album,
  BookingInventorySlot,
  BookingOrder,
  ChannelSyncLogInfo,
  ProductConfig,
} from '../../shared/stores/appStore'
import OrderDetailDrawer from './OrderDetailDrawer.vue'
import type {
  OrderCancelGuidance,
  OrderDetailTimelineItem,
  OrderFlowStep,
  OrderOperationEvidenceCard,
  OrderPhotoDeliveryStage,
  OrderSourceContext,
} from './orderOperations'

type OrderActionNotice = {
  type: 'success' | 'error'
  message: string
}

export type OrderDetailDrawerHostContext = {
  order: BookingOrder | null
  showBackToSlot: boolean
  nextActionLabel: string
  advancing: boolean
  notice: OrderActionNotice | null
  statusClass: string
  slotTimeLabel: string
  capacitySummary: string
  storeScopeText: string
  operationalHint: string
  evidenceCards: OrderOperationEvidenceCard[]
  operationLogsLoading: boolean
  canAdvance: boolean
  paymentTone: StatusBadgeTone
  copiedField: string
  flowSteps: OrderFlowStep[]
  copyScheduleMode: 'REUSE_SLOT' | 'UNDECIDED'
  copyDate: string
  copyTime: string
  copyDurationMinutes: number
  copyRemark: string
  copySaving: boolean
  canReuseSourceSlot: boolean
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
  album: Album | null
  photoStage: OrderPhotoDeliveryStage
  photoStageClass: string
  albumActionAvailability: AlbumActionAvailability
  canNotifyAlbum: boolean
  canConfirmAlbum: boolean
  canDeliverAlbum: boolean
  albumActionLoading: '' | 'notify' | 'confirm' | 'deliver'
  photoAccessLogs: PhotoAccessLogRow[]
  photoAccessLoading: boolean
  photoAccessError: string
  product: ProductConfig | null
  addonSummary: string
  syncLogs: ChannelSyncLogInfo[]
  channelDiagnosticCopied: boolean
  timeline: OrderDetailTimelineItem[]
  operationLogsStateText: string
  timelineToneStyles: Record<OrderDetailTimelineItem['tone'], string>
}

defineProps<{
  context: OrderDetailDrawerHostContext
}>()

const emit = defineEmits<{
  close: []
  backToSlot: []
  advance: [order: BookingOrder]
  refreshLogs: []
  submitCopyOrder: []
  copyOrderId: []
  copy: [value: string, key: string]
  updateCopyScheduleMode: [value: 'REUSE_SLOT' | 'UNDECIDED']
  updateCopyDate: [value: string]
  updateCopyTime: [value: string]
  updateCopyDurationMinutes: [value: number]
  updateCopyRemark: [value: string]
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
  openAlbum: [albumId: string]
  notifyAlbum: []
  confirmAlbum: []
  deliverAlbum: []
  openPhotoManagement: []
  copyChannelDiagnostic: []
  refreshOperationLogs: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
