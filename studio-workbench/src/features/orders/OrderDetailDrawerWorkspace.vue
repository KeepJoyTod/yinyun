<template>
  <Transition name="fade">
    <OrderDetailDrawerShell
      :order="order"
      :show-back-to-slot="showBackToSlot"
      :next-action-label="selectedOrderNextActionLabel"
      :advancing="advancing"
      @close="$emit('close')"
      @back-to-slot="$emit('backToSlot')"
      @advance="$emit('advanceOrder', order)"
    >
      <OrderActionNoticePanel v-if="orderActionNotice" :notice="orderActionNotice" />

      <div class="space-y-5 px-6 py-5">
        <OrderOperationalSummaryPanel
          :order="order"
          :status-class="statusStyles[order.status]"
          :slot-time-label="selectedOrderSlotTimeLabel"
          :capacity-summary="selectedOrderCapacitySummary"
          :store-scope-text="selectedOrderStoreScopeText"
          :next-action-label="selectedOrderNextActionLabel"
          :operational-hint="selectedOrderOperationalHint"
          :evidence-cards="selectedOrderOperationEvidenceCards"
          :operation-logs-loading="operationLogsLoading"
          :operation-logs-state-text="operationLogsStateText"
          :can-advance="canAdvance"
          :advancing="advancing"
          :show-back-to-slot="showBackToSlot"
          :copy-saving="copySaving"
          @refresh-logs="$emit('refreshLogs')"
          @advance="$emit('advanceOrder', $event)"
          @back-to-slot="$emit('backToSlot')"
          @copy-order="$emit('submitCopyOrder')"
          @copy-order-id="$emit('copyField', order.id, 'orderId')"
        />

        <OrderDetailSummaryCards
          :order="order"
          :status-class="statusStyles[order.status]"
          :payment-tone="paymentTone(order.payment)"
          :copied-field="copiedField"
          @copy="(value, key) => $emit('copyField', value, key)"
        />

        <OrderFlowChipGrid :steps="orderFlowSteps" />

        <OrderAttributeOrderSection :order="order" />

        <OrderDetailActionSections
          :order="order"
          :reschedule-date="rescheduleDraft.date"
          :reschedule-time="rescheduleDraft.time"
          :reschedule-duration-minutes="rescheduleDraft.durationMinutes"
          :reschedule-remark="rescheduleDraft.remark"
          :reschedule-reason-options="rescheduleReasonOptions"
          :reschedule-slot-options="rescheduleSlotOptions"
          :reschedule-preview-slot="reschedulePreviewSlot"
          :reschedule-preview-conflict-message="reschedulePreviewConflictMessage"
          :reschedule-conflict="rescheduleConflict"
          :reschedule-saving="rescheduling"
          :is-reschedule-slot-selected="isRescheduleSlotSelected"
          :build-reschedule-slot-meta="buildRescheduleSlotOptionMeta"
          :source-context="selectedOrderSourceContext"
          :tone-styles="orderTimelineToneStyles"
          :cancel-guidance="selectedOrderCancelGuidance"
          :cancel-reason="cancelReason"
          :cancel-reason-options="cancelReasonOptions"
          :cancel-saving="cancelling"
          :cancel-disabled="order.status === '已取消' || order.status === '已退单'"
          :show-confirm-payment="order.payment === '待支付' && order.status !== '已取消' && order.status !== '已退单' && !order.refundStatus && order.source !== '抖音来客' && order.channelType !== 'DOUYIN_LIFE'"
          :confirm-payment-saving="false"
          :show-refund-request="false"
          :refund-saving="false"
          refund-reason=""
          :copy-schedule-mode="copyScheduleMode"
          :copy-date="copyDate"
          :copy-time="copyTime"
          :copy-duration-minutes="copyDurationMinutes"
          :copy-remark="copyRemark"
          :copy-saving="copySaving"
          :can-reuse-source-slot="canReuseSourceSlot"
          @update-reschedule-date="$emit('updateRescheduleDate', $event)"
          @update-reschedule-time="$emit('updateRescheduleTime', $event)"
          @update-reschedule-duration-minutes="$emit('updateRescheduleDurationMinutes', $event)"
          @update-reschedule-remark="$emit('updateRescheduleRemark', $event)"
          @apply-reschedule-reason="$emit('applyRescheduleReason', $event)"
          @apply-reschedule-slot="$emit('applyRescheduleSlot', $event)"
          @submit-reschedule="$emit('submitReschedule')"
          @update-cancel-reason="$emit('updateCancelReason', $event)"
          @apply-cancel-reason="$emit('applyCancelReason', $event)"
          @submit-cancel="$emit('submitCancel')"
          @submit-confirm-payment="$emit('submitConfirmPayment')"
          @update-copy-schedule-mode="$emit('updateCopyScheduleMode', $event)"
          @update-copy-date="$emit('updateCopyDate', $event)"
          @update-copy-time="$emit('updateCopyTime', $event)"
          @update-copy-duration-minutes="$emit('updateCopyDurationMinutes', $event)"
          @update-copy-remark="$emit('updateCopyRemark', $event)"
          @submit-copy-order="$emit('submitCopyOrder')"
        />

        <OrderAlbumSection
          :album="selectedOrderAlbum"
          :stage="selectedOrderPhotoStage"
          :stage-class="photoDeliveryStageStyles[selectedOrderPhotoStage.key]"
          :availability="selectedOrderAlbumActionAvailability"
          :can-notify="canNotifySelectedOrderAlbum"
          :can-confirm="canConfirmSelectedOrderAlbum"
          :can-deliver="canDeliverSelectedOrderAlbum"
          :action-loading="orderAlbumActionLoading"
          :status-class="statusStyles[order.status]"
          :photo-access-logs="selectedOrderPhotoAccessLogs"
          :photo-access-loading="orderPhotoAccessLoading"
          :photo-access-error="orderPhotoAccessError"
          @open-album="$emit('openAlbum', $event)"
          @notify="$emit('notifyAlbum')"
          @confirm="$emit('confirmAlbum')"
          @deliver="$emit('deliverAlbum')"
          @open-photo-management="$emit('openPhotoManagement')"
          @view-more-photo-access="$emit('openAlbum', $event)"
        />

        <OrderDetailAuxiliarySections
          :order="order"
          :product="selectedOrderProduct"
          :addon-summary="selectedOrderAddonSummary"
          :sync-logs="selectedOrderSyncLogs"
          :channel-diagnostic-copied="copiedField === 'channelDiagnostic'"
          :timeline="selectedOrderTimeline"
          :operation-logs-loading="operationLogsLoading"
          :operation-logs-state-text="operationLogsStateText"
          :timeline-tone-styles="orderTimelineToneStyles"
          @copy-channel-diagnostic="$emit('copyChannelDiagnostic')"
          @refresh-operation-logs="$emit('refreshLogs')"
        />
      </div>
    </OrderDetailDrawerShell>
  </Transition>
</template>

<script setup lang="ts">
import type { StatusBadgeTone } from '../../shared/components/data/StatusBadge.vue'
import type { Album, BookingInventorySlot, BookingOrder, ChannelSyncLogInfo, ProductConfig } from '../../shared/stores/appStore'
import type { AlbumActionAvailability, PhotoAccessLogRow } from '../albums/photoMgmtOperations'
import OrderActionNoticePanel from './OrderActionNoticePanel.vue'
import OrderAlbumSection from './OrderAlbumSection.vue'
import OrderAttributeOrderSection from './OrderAttributeOrderSection.vue'
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

type OrderActionNotice = { type: 'success' | 'error'; message: string }
type RescheduleDraft = { date: string; time: string; durationMinutes: number; remark: string }

defineProps<{
  order: BookingOrder
  showBackToSlot: boolean
  selectedOrderNextActionLabel: string
  advancing: boolean
  orderActionNotice: OrderActionNotice | null
  statusStyles: Record<string, string>
  paymentTone: (payment: string) => StatusBadgeTone
  selectedOrderSlotTimeLabel: string
  selectedOrderCapacitySummary: string
  selectedOrderStoreScopeText: string
  selectedOrderOperationalHint: string
  selectedOrderOperationEvidenceCards: OrderOperationEvidenceCard[]
  operationLogsLoading: boolean
  operationLogsStateText: string
  canAdvance: boolean
  copiedField: string
  copyScheduleMode: 'REUSE_SLOT' | 'UNDECIDED'
  copyDate: string
  copyTime: string
  copyDurationMinutes: number
  copyRemark: string
  copySaving: boolean
  canReuseSourceSlot: boolean
  orderFlowSteps: OrderFlowStep[]
  rescheduleDraft: RescheduleDraft
  rescheduleReasonOptions: string[]
  rescheduleSlotOptions: BookingInventorySlot[]
  reschedulePreviewSlot: BookingInventorySlot | null
  reschedulePreviewConflictMessage: string
  rescheduleConflict: string
  rescheduling: boolean
  isRescheduleSlotSelected: (slot: BookingInventorySlot) => boolean
  buildRescheduleSlotOptionMeta: (slot: BookingInventorySlot) => string
  selectedOrderSourceContext: OrderSourceContext
  orderTimelineToneStyles: Record<OrderSourceContext['tone'], string>
  selectedOrderCancelGuidance: OrderCancelGuidance
  cancelReason: string
  cancelReasonOptions: string[]
  cancelling: boolean
  selectedOrderAlbum: Album | null
  selectedOrderPhotoStage: OrderPhotoDeliveryStage
  photoDeliveryStageStyles: Record<OrderPhotoDeliveryStage['key'], string>
  selectedOrderAlbumActionAvailability: AlbumActionAvailability
  canNotifySelectedOrderAlbum: boolean
  canConfirmSelectedOrderAlbum: boolean
  canDeliverSelectedOrderAlbum: boolean
  orderAlbumActionLoading: '' | 'notify' | 'confirm' | 'deliver'
  selectedOrderPhotoAccessLogs: PhotoAccessLogRow[]
  orderPhotoAccessLoading: boolean
  orderPhotoAccessError: string
  selectedOrderProduct: ProductConfig | null
  selectedOrderAddonSummary: string
  selectedOrderSyncLogs: ChannelSyncLogInfo[]
  selectedOrderTimeline: OrderDetailTimelineItem[]
}>()

defineEmits<{
  close: []
  backToSlot: []
  advanceOrder: [order: BookingOrder]
  refreshLogs: []
  copyField: [value: string, key: string]
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
  updateCopyScheduleMode: [value: 'REUSE_SLOT' | 'UNDECIDED']
  updateCopyDate: [value: string]
  updateCopyTime: [value: string]
  updateCopyDurationMinutes: [value: number]
  updateCopyRemark: [value: string]
  submitCopyOrder: []
  openAlbum: [albumId: string]
  notifyAlbum: []
  confirmAlbum: []
  deliverAlbum: []
  openPhotoManagement: []
  copyChannelDiagnostic: []
}>()
</script>
