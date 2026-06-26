import type { Ref } from 'vue'
import type { StatusBadgeTone } from '../../../shared/components/data/StatusBadge.vue'
import type { BookingOrder } from '../../../shared/stores/appStore'
import type { OrderDetailDrawerHostContext } from '../OrderDetailDrawerHost.vue'
import { useOrderDetail } from './useOrderDetail'
import type { CopyOrderDraft } from './useOrdersViewState'
import { useOrderDetailDrawerContext } from './useOrderDetailDrawerContext'

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

export function useOrdersViewDetailContext(options: {
  selectedOrder: Ref<BookingOrder | null>
  rescheduleDraft: RescheduleDraft
  operationLogsLoading: Ref<boolean>
  operationLogsNotice: Ref<string>
  slotRange: RefLike<SlotRange>
  updatingOrderId: RefLike<string>
  orderActionNotice: RefLike<OrderDetailDrawerHostContext['notice']>
  statusStyles: Record<string, string>
  paymentTone: (payment: string) => StatusBadgeTone
  copiedField: RefLike<string>
  rescheduleReasonOptions: string[]
  rescheduleConflict: RefLike<string>
  reschedulingOrderId: RefLike<string>
  orderTimelineToneStyles: OrderDetailDrawerHostContext['toneStyles']
  cancelReason: RefLike<string>
  cancelReasonOptions: string[]
  cancellingOrderId: RefLike<string>
  confirmingPaymentOrderId: RefLike<string>
  refundingOrderId: RefLike<string>
  refundReason: RefLike<string>
  photoDeliveryStageStyles: Record<string, string>
  orderAlbumActionLoading: RefLike<OrderDetailDrawerHostContext['albumActionLoading']>
  orderPhotoAccessLoading: RefLike<boolean>
  orderPhotoAccessError: RefLike<string>
  copyOrderDraft: CopyOrderDraft
  copyingOrderId: RefLike<string>
  canReuseSourceSlot: RefLike<boolean>
}) {
  const detail = useOrderDetail({
    selectedOrder: options.selectedOrder,
    rescheduleDraft: options.rescheduleDraft,
    operationLogsLoading: options.operationLogsLoading,
    operationLogsNotice: options.operationLogsNotice,
  })

  const orderDetailDrawerContext = useOrderDetailDrawerContext({
    selectedOrder: options.selectedOrder,
    slotRange: options.slotRange,
    selectedOrderNextActionLabel: detail.selectedOrderNextActionLabel,
    updatingOrderId: options.updatingOrderId,
    orderActionNotice: options.orderActionNotice,
    statusStyles: options.statusStyles,
    selectedOrderSlotTimeLabel: detail.selectedOrderSlotTimeLabel,
    selectedOrderCapacitySummary: detail.selectedOrderCapacitySummary,
    selectedOrderStoreScopeText: detail.selectedOrderStoreScopeText,
    selectedOrderOperationalHint: detail.selectedOrderOperationalHint,
    selectedOrderOperationEvidenceCards: detail.selectedOrderOperationEvidenceCards,
    operationLogsLoading: options.operationLogsLoading,
    paymentTone: options.paymentTone,
    copiedField: options.copiedField,
    orderFlowSteps: detail.orderFlowSteps,
    rescheduleDraft: options.rescheduleDraft,
    rescheduleReasonOptions: options.rescheduleReasonOptions,
    rescheduleSlotOptions: detail.rescheduleSlotOptions,
    reschedulePreviewSlot: detail.reschedulePreviewSlot,
    reschedulePreviewConflictMessage: detail.reschedulePreviewConflictMessage,
    rescheduleConflict: options.rescheduleConflict,
    reschedulingOrderId: options.reschedulingOrderId,
    isRescheduleSlotSelected: detail.isRescheduleSlotSelected,
    buildRescheduleSlotMeta: detail.buildRescheduleSlotOptionMeta,
    selectedOrderSourceContext: detail.selectedOrderSourceContext,
    orderTimelineToneStyles: options.orderTimelineToneStyles,
    selectedOrderCancelGuidance: detail.selectedOrderCancelGuidance,
    cancelReason: options.cancelReason,
    cancelReasonOptions: options.cancelReasonOptions,
    cancellingOrderId: options.cancellingOrderId,
    confirmingPaymentOrderId: options.confirmingPaymentOrderId,
    refundingOrderId: options.refundingOrderId,
    refundReason: options.refundReason,
    selectedOrderAlbum: detail.selectedOrderAlbum,
    selectedOrderPhotoStage: detail.selectedOrderPhotoStage,
    photoDeliveryStageStyles: options.photoDeliveryStageStyles,
    selectedOrderAlbumActionAvailability: detail.selectedOrderAlbumActionAvailability,
    canNotifySelectedOrderAlbum: detail.canNotifySelectedOrderAlbum,
    canConfirmSelectedOrderAlbum: detail.canConfirmSelectedOrderAlbum,
    canDeliverSelectedOrderAlbum: detail.canDeliverSelectedOrderAlbum,
    orderAlbumActionLoading: options.orderAlbumActionLoading,
    selectedOrderPhotoAccessLogs: detail.selectedOrderPhotoAccessLogs,
    orderPhotoAccessLoading: options.orderPhotoAccessLoading,
    orderPhotoAccessError: options.orderPhotoAccessError,
    selectedOrderProduct: detail.selectedOrderProduct,
    selectedOrderAddonSummary: detail.selectedOrderAddonSummary,
    selectedOrderSyncLogs: detail.selectedOrderSyncLogs,
    selectedOrderTimeline: detail.selectedOrderTimeline,
    operationLogsStateText: detail.operationLogsStateText,
    copyOrderDraft: options.copyOrderDraft,
    copyingOrderId: options.copyingOrderId,
    canReuseSourceSlot: options.canReuseSourceSlot,
  })

  return {
    ...detail,
    orderDetailDrawerContext,
  }
}
