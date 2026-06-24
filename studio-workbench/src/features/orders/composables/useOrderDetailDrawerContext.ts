import { computed, type Ref } from 'vue'
import type { StatusBadgeTone } from '../../../shared/components/data/StatusBadge.vue'
import type { BookingOrder } from '../../../shared/stores/appStore'
import type { OrderDetailDrawerHostContext } from '../OrderDetailDrawerHost.vue'
import { getNextOrderAction } from '../orderOperations'

type RefLike<T> = Ref<T> | { value: T }

type RescheduleDraft = {
  date: string
  time: string
  durationMinutes: number
  remark: string
}

type SlotRange = {
  start: string
}

export const useOrderDetailDrawerContext = (options: {
  selectedOrder: RefLike<BookingOrder | null>
  slotRange: RefLike<SlotRange>
  selectedOrderNextActionLabel: RefLike<string>
  updatingOrderId: RefLike<string>
  orderActionNotice: RefLike<OrderDetailDrawerHostContext['notice']>
  statusStyles: Record<string, string>
  selectedOrderSlotTimeLabel: RefLike<string>
  selectedOrderCapacitySummary: RefLike<string>
  selectedOrderStoreScopeText: RefLike<string>
  selectedOrderOperationalHint: RefLike<string>
  selectedOrderOperationEvidenceCards: RefLike<OrderDetailDrawerHostContext['evidenceCards']>
  operationLogsLoading: RefLike<boolean>
  paymentTone: (payment: string) => StatusBadgeTone
  copiedField: RefLike<string>
  orderFlowSteps: RefLike<OrderDetailDrawerHostContext['flowSteps']>
  rescheduleDraft: RescheduleDraft
  rescheduleReasonOptions: string[]
  rescheduleSlotOptions: RefLike<OrderDetailDrawerHostContext['rescheduleSlotOptions']>
  reschedulePreviewSlot: RefLike<OrderDetailDrawerHostContext['reschedulePreviewSlot']>
  reschedulePreviewConflictMessage: RefLike<string>
  rescheduleConflict: RefLike<string>
  reschedulingOrderId: RefLike<string>
  isRescheduleSlotSelected: OrderDetailDrawerHostContext['isRescheduleSlotSelected']
  buildRescheduleSlotMeta: OrderDetailDrawerHostContext['buildRescheduleSlotMeta']
  selectedOrderSourceContext: RefLike<OrderDetailDrawerHostContext['sourceContext']>
  orderTimelineToneStyles: OrderDetailDrawerHostContext['toneStyles']
  selectedOrderCancelGuidance: RefLike<OrderDetailDrawerHostContext['cancelGuidance']>
  cancelReason: RefLike<string>
  cancelReasonOptions: string[]
  cancellingOrderId: RefLike<string>
  selectedOrderAlbum: RefLike<OrderDetailDrawerHostContext['album']>
  selectedOrderPhotoStage: RefLike<OrderDetailDrawerHostContext['photoStage']>
  photoDeliveryStageStyles: Record<string, string>
  selectedOrderAlbumActionAvailability: RefLike<OrderDetailDrawerHostContext['albumActionAvailability']>
  canNotifySelectedOrderAlbum: RefLike<boolean>
  canConfirmSelectedOrderAlbum: RefLike<boolean>
  canDeliverSelectedOrderAlbum: RefLike<boolean>
  orderAlbumActionLoading: RefLike<OrderDetailDrawerHostContext['albumActionLoading']>
  selectedOrderPhotoAccessLogs: RefLike<OrderDetailDrawerHostContext['photoAccessLogs']>
  orderPhotoAccessLoading: RefLike<boolean>
  orderPhotoAccessError: RefLike<string>
  selectedOrderProduct: RefLike<OrderDetailDrawerHostContext['product']>
  selectedOrderAddonSummary: RefLike<string>
  selectedOrderSyncLogs: RefLike<OrderDetailDrawerHostContext['syncLogs']>
  selectedOrderTimeline: RefLike<OrderDetailDrawerHostContext['timeline']>
  operationLogsStateText: RefLike<string>
}) => computed<OrderDetailDrawerHostContext>(() => {
  const order = options.selectedOrder.value
  return {
    order,
    showBackToSlot: Boolean(options.slotRange.value.start),
    nextActionLabel: options.selectedOrderNextActionLabel.value,
    advancing: order ? options.updatingOrderId.value === order.id : false,
    notice: options.orderActionNotice.value,
    statusClass: order ? options.statusStyles[order.status] : '',
    slotTimeLabel: options.selectedOrderSlotTimeLabel.value,
    capacitySummary: options.selectedOrderCapacitySummary.value,
    storeScopeText: options.selectedOrderStoreScopeText.value,
    operationalHint: options.selectedOrderOperationalHint.value,
    evidenceCards: options.selectedOrderOperationEvidenceCards.value,
    operationLogsLoading: options.operationLogsLoading.value,
    canAdvance: order ? Boolean(getNextOrderAction(order)) : false,
    paymentTone: order ? options.paymentTone(order.payment) : 'neutral',
    copiedField: options.copiedField.value,
    flowSteps: options.orderFlowSteps.value,
    rescheduleDate: options.rescheduleDraft.date,
    rescheduleTime: options.rescheduleDraft.time,
    rescheduleDurationMinutes: options.rescheduleDraft.durationMinutes,
    rescheduleRemark: options.rescheduleDraft.remark,
    rescheduleReasonOptions: options.rescheduleReasonOptions,
    rescheduleSlotOptions: options.rescheduleSlotOptions.value,
    reschedulePreviewSlot: options.reschedulePreviewSlot.value,
    reschedulePreviewConflictMessage: options.reschedulePreviewConflictMessage.value,
    rescheduleConflict: options.rescheduleConflict.value,
    rescheduleSaving: order ? options.reschedulingOrderId.value === order.id : false,
    isRescheduleSlotSelected: options.isRescheduleSlotSelected,
    buildRescheduleSlotMeta: options.buildRescheduleSlotMeta,
    sourceContext: options.selectedOrderSourceContext.value,
    toneStyles: options.orderTimelineToneStyles,
    cancelGuidance: options.selectedOrderCancelGuidance.value,
    cancelReason: options.cancelReason.value,
    cancelReasonOptions: options.cancelReasonOptions,
    cancelSaving: order ? options.cancellingOrderId.value === order.id : false,
    cancelDisabled: order ? order.status === '已取消' || order.status === '已退单' : true,
    album: options.selectedOrderAlbum.value,
    photoStage: options.selectedOrderPhotoStage.value,
    photoStageClass: options.photoDeliveryStageStyles[options.selectedOrderPhotoStage.value.key],
    albumActionAvailability: options.selectedOrderAlbumActionAvailability.value,
    canNotifyAlbum: options.canNotifySelectedOrderAlbum.value,
    canConfirmAlbum: options.canConfirmSelectedOrderAlbum.value,
    canDeliverAlbum: options.canDeliverSelectedOrderAlbum.value,
    albumActionLoading: options.orderAlbumActionLoading.value,
    photoAccessLogs: options.selectedOrderPhotoAccessLogs.value,
    photoAccessLoading: options.orderPhotoAccessLoading.value,
    photoAccessError: options.orderPhotoAccessError.value,
    product: options.selectedOrderProduct.value,
    addonSummary: options.selectedOrderAddonSummary.value,
    syncLogs: options.selectedOrderSyncLogs.value,
    channelDiagnosticCopied: options.copiedField.value === 'channelDiagnostic',
    timeline: options.selectedOrderTimeline.value,
    operationLogsStateText: options.operationLogsStateText.value,
    timelineToneStyles: options.orderTimelineToneStyles,
  }
})
