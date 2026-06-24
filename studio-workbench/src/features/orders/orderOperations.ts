/**
 * @deprecated Migration barrel - split into domain modules:
 *   - orderStatusOperations.ts       (status helpers, groups, flow steps)
 *   - orderFilterOperations.ts       (quick filters, search query, deep link matching)
 *   - orderSlotOperations.ts         (OrderSlotRange, schedule mapping, slot matching)
 *   - orderExportOperations.ts       (export query building, unsupported filters)
 *   - orderPhotoDeliveryOperations.ts (photo delivery stage helpers)
 *   - orderOperationLogEvidence.ts   (operation log filtering, evidence cards)
 *
 * Existing consumers should continue importing from this file during migration.
 * New code must import from the domain modules above.
 */
export {
  getOrderOperationalDate,
  hasCustomerContact,
  isDouyinLifeOrder,
  isMissingArrivalSchedule,
  isOperationalOrder,
} from '../../shared/stores/orderIssueRules'

export {
  todayOperationalStatuses,
  isRefundedOrder,
  isCancelledOrder,
  isCompletedOrder,
  isEffectiveOrder,
  orderStatusGroupKeys,
  matchesOrderStatusGroup,
  buildOrderStatusGroupCounts,
  nextOrderActions,
  orderFlowSequence,
  buildOrderFlowSteps,
  isTodayArrivalOrder,
  isTodayOperationalOrder,
  isTodayPendingConfirmOrder,
  isSelectionFollowOrder,
  getNextOrderAction,
  getNextOrderHint,
  normalizeOrderStatusTab,
} from './orderStatusOperations'

export {
  quickOrderFilterKeys,
  matchesQuickOrderFilter,
  matchesOrderDeepLinkQuery,
  matchesOrderDeepLinkId,
  buildQuickOrderFilters,
  buildOrderOperationCards,
  shouldAcceptOrderSearchInput,
  resolveOrderSearchQueryState,
} from './orderFilterOperations'

export type {
  OrderOperationCard,
  OrderSearchQueryStateInput,
  OrderSearchQueryState,
  OrderSearchInputGuard,
  QuickOrderFilter,
  OrderStatusGroupKey,
  OrderStatusGroupCount,
  OrderFlowStep,
} from './orderFilterOperations'

export {
  matchesOrderSlotRange,
  mapScheduleItemToSlotOrder,
  isInventoryConflictMessage,
  getOrderFilterDate,
  parseMDHMToISODate,
  getOrderInventoryConflictSlot,
  getOrderRescheduleInventorySlot,
  buildOrderRescheduleConflictMessage,
} from './orderSlotOperations'

export type {
  OrderSlotRange,
  RescheduleInventoryDraft,
} from './orderSlotOperations'

export {
  getUnsupportedOrderExportFilters,
  getOrderExportSyncNotice,
  buildOrderExportQuery,
} from './orderExportOperations'

export type {
  OrderExportQueryInput,
  OrderExportSyncNoticeInput,
} from './orderExportOperations'

export {
  buildOrderPhotoDeliveryStage,
  buildOrderCancelGuidance,
} from './orderPhotoDeliveryOperations'

export type {
  OrderPhotoDeliveryStageKey,
  OrderPhotoDeliveryStage,
  OrderCancelGuidance,
} from './orderPhotoDeliveryOperations'

export {
  buildOrderSourceContext,
  buildOrderOperationEvidenceCards,
  isOrderOperationLog,
  getOrderOperationLogs,
  isOrderChannelSyncLog,
  getOrderChannelSyncLogs,
  buildOrderChannelDiagnosticText,
  buildOrderDetailTimeline,
} from './orderOperationLogEvidence'

export type {
  OrderOperationEvidenceCard,
  OrderDetailTimelineItem,
  OrderSourceContext,
} from './orderOperationLogEvidence'
