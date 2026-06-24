<template>
  <OrderDetailDrawerShell
    :order="order"
    :show-back-to-slot="showBackToSlot"
    :next-action-label="nextActionLabel"
    :advancing="advancing"
    @close="emit('close')"
    @back-to-slot="emit('backToSlot')"
    @advance="emit('advance', order)"
  >
    <OrderActionNoticePanel v-if="notice" :notice="notice" />

    <div class="space-y-5 px-6 py-5">
      <OrderOperationalSummaryPanel
        :order="order"
        :status-class="statusClass"
        :slot-time-label="slotTimeLabel"
        :capacity-summary="capacitySummary"
        :store-scope-text="storeScopeText"
        :next-action-label="nextActionLabel"
        :operational-hint="operationalHint"
        :evidence-cards="evidenceCards"
        :operation-logs-loading="operationLogsLoading"
        :operation-logs-state-text="operationLogsStateText"
        :can-advance="canAdvance"
        :advancing="advancing"
        :show-back-to-slot="showBackToSlot"
        @refresh-logs="emit('refreshLogs')"
        @advance="emit('advance', order)"
        @back-to-slot="emit('backToSlot')"
        @copy-order-id="emit('copyOrderId')"
      />

      <OrderDetailSummaryCards
        :order="order"
        :status-class="statusClass"
        :payment-tone="paymentTone"
        :copied-field="copiedField"
        @copy="(value, key) => emit('copy', value, key)"
      />

      <OrderFlowChipGrid :steps="flowSteps" />

      <OrderDetailActionSections
        :order="order"
        :reschedule-date="rescheduleDate"
        :reschedule-time="rescheduleTime"
        :reschedule-duration-minutes="rescheduleDurationMinutes"
        :reschedule-remark="rescheduleRemark"
        :reschedule-reason-options="rescheduleReasonOptions"
        :reschedule-slot-options="rescheduleSlotOptions"
        :reschedule-preview-slot="reschedulePreviewSlot"
        :reschedule-preview-conflict-message="reschedulePreviewConflictMessage"
        :reschedule-conflict="rescheduleConflict"
        :reschedule-saving="rescheduleSaving"
        :is-reschedule-slot-selected="isRescheduleSlotSelected"
        :build-reschedule-slot-meta="buildRescheduleSlotMeta"
        :source-context="sourceContext"
        :tone-styles="toneStyles"
        :cancel-guidance="cancelGuidance"
        :cancel-reason="cancelReason"
        :cancel-reason-options="cancelReasonOptions"
        :cancel-saving="cancelSaving"
        :cancel-disabled="cancelDisabled"
        :show-confirm-payment="showConfirmPayment"
        :confirm-payment-saving="confirmPaymentSaving"
        @update-reschedule-date="emit('updateRescheduleDate', $event)"
        @update-reschedule-time="emit('updateRescheduleTime', $event)"
        @update-reschedule-duration-minutes="emit('updateRescheduleDurationMinutes', $event)"
        @update-reschedule-remark="emit('updateRescheduleRemark', $event)"
        @apply-reschedule-reason="emit('applyRescheduleReason', $event)"
        @apply-reschedule-slot="emit('applyRescheduleSlot', $event)"
        @submit-reschedule="emit('submitReschedule')"
        @update-cancel-reason="emit('updateCancelReason', $event)"
        @apply-cancel-reason="emit('applyCancelReason', $event)"
        @submit-cancel="emit('submitCancel')"
        @submit-confirm-payment="emit('submitConfirmPayment')"
      />

      <OrderAlbumSection
        :album="album"
        :stage="photoStage"
        :stage-class="photoStageClass"
        :availability="albumActionAvailability"
        :can-notify="canNotifyAlbum"
        :can-confirm="canConfirmAlbum"
        :can-deliver="canDeliverAlbum"
        :action-loading="albumActionLoading"
        :status-class="statusClass"
        :photo-access-logs="photoAccessLogs"
        :photo-access-loading="photoAccessLoading"
        :photo-access-error="photoAccessError"
        @open-album="emit('openAlbum', $event)"
        @notify="emit('notifyAlbum')"
        @confirm="emit('confirmAlbum')"
        @deliver="emit('deliverAlbum')"
        @open-photo-management="emit('openPhotoManagement')"
        @view-more-photo-access="emit('openAlbum', $event)"
      />

      <OrderDetailAuxiliarySections
        :order="order"
        :product="product"
        :addon-summary="addonSummary"
        :sync-logs="syncLogs"
        :channel-diagnostic-copied="channelDiagnosticCopied"
        :timeline="timeline"
        :operation-logs-loading="operationLogsLoading"
        :operation-logs-state-text="operationLogsStateText"
        :timeline-tone-styles="timelineToneStyles"
        @copy-channel-diagnostic="emit('copyChannelDiagnostic')"
        @refresh-operation-logs="emit('refreshOperationLogs')"
      />
    </div>
  </OrderDetailDrawerShell>
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
import OrderActionNoticePanel from './OrderActionNoticePanel.vue'
import OrderAlbumSection from './OrderAlbumSection.vue'
import OrderDetailActionSections from './OrderDetailActionSections.vue'
import OrderDetailAuxiliarySections from './OrderDetailAuxiliarySections.vue'
import OrderDetailDrawerShell from './OrderDetailDrawerShell.vue'
import OrderDetailSummaryCards from './OrderDetailSummaryCards.vue'
import OrderFlowChipGrid from './OrderFlowChipGrid.vue'
import OrderOperationalSummaryPanel from './OrderOperationalSummaryPanel.vue'
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

defineProps<{
  order: BookingOrder
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
}>()

const emit = defineEmits<{
  close: []
  backToSlot: []
  advance: [order: BookingOrder]
  refreshLogs: []
  copyOrderId: []
  copy: [value: string, key: string]
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
  openAlbum: [albumId: string]
  notifyAlbum: []
  confirmAlbum: []
  deliverAlbum: []
  openPhotoManagement: []
  copyChannelDiagnostic: []
  refreshOperationLogs: []
}>()
</script>
