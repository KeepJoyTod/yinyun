import ordersViewRootSource from './OrdersView.vue?raw'
import ordersViewConsoleShellSource from './OrdersViewConsoleShell.vue?raw'
import ordersViewOverlaysSource from './OrdersViewOverlays.vue?raw'
import orderWorkspaceSource from './OrderWorkspace.vue?raw'
import orderOpsBoardSource from './OrderOpsBoard.vue?raw'
import orderAdvancedSearchModalSource from './OrderAdvancedSearchModal.vue?raw'
import orderConsoleHeaderSource from './OrderConsoleHeader.vue?raw'
import orderDayBoardSource from './OrderDayBoard.vue?raw'
import orderDetailDrawerWorkspaceSource from './OrderDetailDrawerWorkspace.vue?raw'
import orderDetailDrawerSource from './OrderDetailDrawer.vue?raw'
import orderFilterBarSource from './OrderFilterBar.vue?raw'
import orderOperationsBoardSource from './OrderOperationsBoard.vue?raw'
import orderStatusTabsSource from './OrderStatusTabs.vue?raw'
import orderTablePanelSource from './OrderTablePanel.vue?raw'
import useOrderDetailStateSource from './composables/useOrderDetailState.ts?raw'
import useOrderCalendarSource from './composables/useOrderCalendar.ts?raw'
import useOrderConsoleActionsSource from './composables/useOrderConsoleActions.ts?raw'
import useOrderDataFetchingSource from './composables/useOrderDataFetching.ts?raw'
import useOrderDetailActionsSource from './composables/useOrderDetailActions.ts?raw'
import useOrderDetailNavigationSource from './composables/useOrderDetailNavigation.ts?raw'
import useOrderExportSource from './composables/useOrderExport.ts?raw'
import orderFilterUiConfigSource from './composables/orderFilterUiConfig.ts?raw'
import useOrderFilterCalendarSource from './composables/useOrderFilterCalendar.ts?raw'
import useOrderFiltersSource from './composables/useOrderFilters.ts?raw'
import useOrderFilterTypesSource from './composables/useOrderFilterTypes.ts?raw'
import useOrderHeaderActionsSource from './composables/useOrderHeaderActions.ts?raw'
import useOrderAlbumActionsSource from './composables/useOrderAlbumActions.ts?raw'
import useOrderCopyActionsSource from './composables/useOrderCopyActions.ts?raw'
import useOrderDetailRoutingSource from './composables/useOrderDetailRouting.ts?raw'
import useOrderPresentationSource from './composables/useOrderPresentation.ts?raw'
import useOrderStaffBookingSource from './composables/useOrderStaffBooking.ts?raw'
import useOrderMutationsSource from './composables/useOrderMutations.ts?raw'
import useOrderOperationLogsSource from './composables/useOrderOperationLogs.ts?raw'
import useOrderRouteScopeSource from './composables/useOrderRouteScope.ts?raw'
import useOrderRouteEffectsSource from './composables/useOrderRouteEffects.ts?raw'
import useOrderRouteSyncSource from './composables/useOrderRouteSync.ts?raw'
import useOrderSlotScopeSource from './composables/useOrderSlotScope.ts?raw'
import useOrderStoreScopeSource from './composables/useOrderStoreScope.ts?raw'
import useOrdersViewDetailContextSource from './composables/useOrdersViewDetailContext.ts?raw'
import useOrdersViewLifecycleSource from './composables/useOrdersViewLifecycle.ts?raw'
import useOrderPageStateSource from './composables/useOrderPageState.ts?raw'
import useOrdersViewStateSource from './composables/useOrdersViewState.ts?raw'
import orderDetailFoldoutSource from './OrderDetailFoldout.vue?raw'
import orderDetailDrawerShellSource from './OrderDetailDrawerShell.vue?raw'
import orderAlbumActionButtonSource from './OrderAlbumActionButton.vue?raw'
import orderAlbumActionGroupSource from './OrderAlbumActionGroup.vue?raw'
import orderAlbumSectionSource from './OrderAlbumSection.vue?raw'
import orderChannelSyncPanelSource from './OrderChannelSyncPanel.vue?raw'
import orderPhotoAccessListSource from './OrderPhotoAccessList.vue?raw'
import orderAlbumInfoGridSource from './OrderAlbumInfoGrid.vue?raw'
import orderPhotoDeliveryStageCardSource from './OrderPhotoDeliveryStageCard.vue?raw'
import orderDetailSummaryCardsSource from './OrderDetailSummaryCards.vue?raw'
import orderDetailActionSectionsSource from './OrderDetailActionSections.vue?raw'
import orderDetailAuxiliarySectionsSource from './OrderDetailAuxiliarySections.vue?raw'
import orderSourceContextPanelSource from './OrderSourceContextPanel.vue?raw'
import orderOperationTimelinePanelSource from './OrderOperationTimelinePanel.vue?raw'
import orderOperationalSummaryPanelSource from './OrderOperationalSummaryPanel.vue?raw'
import orderFlowChipGridSource from './OrderFlowChipGrid.vue?raw'
import orderActionNoticePanelSource from './OrderActionNoticePanel.vue?raw'
import orderProductInfoPanelSource from './OrderProductInfoPanel.vue?raw'
import orderReschedulePanelSource from './OrderReschedulePanel.vue?raw'
import orderCancelPanelSource from './OrderCancelPanel.vue?raw'
import orderStatusOpsSource from './orderStatusOperations.ts?raw'
import orderFilterOpsSource from './orderFilterOperations.ts?raw'
import orderSlotOpsSource from './orderSlotOperations.ts?raw'
import orderPhotoDeliveryOpsSource from './orderPhotoDeliveryOperations.ts?raw'
import orderOperationEvidenceTypesSource from './orderOperationEvidenceTypes.ts?raw'
import orderOperationLogEvidenceSource from './orderOperationLogEvidence.ts?raw'
import backendAlbumsApiSource from '../../shared/api/backendAlbumsApi.ts?raw'
import appStoreSource from '../../shared/stores/appStore.ts?raw'
import orderActionStoreSource from '../../shared/stores/orderActionStore.ts?raw'
import backendSource from '../../shared/api/backend.ts?raw'
import realClickSmokeSource from '../../../../tools/studio-workbench-real-click-smoke.mjs?raw'

export {
  appStoreSource,
  backendAlbumsApiSource,
  backendSource,
  orderActionNoticePanelSource,
  orderActionStoreSource,
  orderAdvancedSearchModalSource,
  orderAlbumActionButtonSource,
  orderAlbumActionGroupSource,
  orderAlbumInfoGridSource,
  orderAlbumSectionSource,
  orderCancelPanelSource,
  orderChannelSyncPanelSource,
  orderConsoleHeaderSource,
  orderDayBoardSource,
  orderDetailActionSectionsSource,
  orderDetailAuxiliarySectionsSource,
  orderDetailDrawerShellSource,
  orderDetailDrawerSource,
  orderDetailDrawerWorkspaceSource,
  orderDetailFoldoutSource,
  orderDetailSummaryCardsSource,
  orderFilterBarSource,
  orderFlowChipGridSource,
  orderOpsBoardSource,
  orderOperationTimelinePanelSource,
  orderOperationalSummaryPanelSource,
  orderOperationsBoardSource,
  orderPhotoAccessListSource,
  orderPhotoDeliveryStageCardSource,
  orderProductInfoPanelSource,
  orderReschedulePanelSource,
  orderSourceContextPanelSource,
  orderStatusTabsSource,
  orderTablePanelSource,
  orderWorkspaceSource,
  ordersViewConsoleShellSource,
  ordersViewOverlaysSource,
  ordersViewRootSource,
  realClickSmokeSource,
  useOrderAlbumActionsSource,
  useOrderCalendarSource,
  useOrderConsoleActionsSource,
  useOrderCopyActionsSource,
  useOrderDataFetchingSource,
  useOrderDetailActionsSource,
  useOrderDetailNavigationSource,
  useOrderDetailRoutingSource,
  useOrderDetailStateSource,
  useOrderExportSource,
  orderFilterUiConfigSource,
  useOrderFilterCalendarSource,
  useOrderFilterTypesSource,
  useOrderFiltersSource,
  useOrderHeaderActionsSource,
  useOrderMutationsSource,
  useOrderOperationLogsSource,
  useOrderPageStateSource,
  useOrderPresentationSource,
  useOrderRouteEffectsSource,
  useOrderRouteSyncSource,
  useOrderRouteScopeSource,
  useOrderSlotScopeSource,
  useOrderStaffBookingSource,
  useOrderStoreScopeSource,
  useOrdersViewDetailContextSource,
  useOrdersViewLifecycleSource,
  useOrdersViewStateSource,
}

export const ordersViewSource = [
  ordersViewRootSource,
  ordersViewConsoleShellSource,
  ordersViewOverlaysSource,
  orderWorkspaceSource,
].join('\n')

export const domainModulesSource = [
  orderStatusOpsSource,
  orderFilterOpsSource,
  orderSlotOpsSource,
  orderPhotoDeliveryOpsSource,
  orderOperationEvidenceTypesSource,
  orderOperationLogEvidenceSource,
].join('\n')

export const ordersSource = [
  ordersViewSource,
  orderWorkspaceSource,
  ordersViewConsoleShellSource,
  ordersViewOverlaysSource,
  orderOpsBoardSource,
  orderAdvancedSearchModalSource,
  orderConsoleHeaderSource,
  orderDayBoardSource,
  orderDetailDrawerWorkspaceSource,
  orderDetailDrawerSource,
  orderFilterBarSource,
  orderOperationsBoardSource,
  orderStatusTabsSource,
  orderTablePanelSource,
  orderFilterUiConfigSource,
  useOrderCalendarSource,
  useOrderFilterCalendarSource,
  useOrderFilterTypesSource,
  useOrderConsoleActionsSource,
  useOrderDataFetchingSource,
  useOrderDetailActionsSource,
  useOrderDetailNavigationSource,
  useOrderRouteScopeSource,
  useOrderRouteEffectsSource,
  useOrderRouteSyncSource,
  useOrderDetailStateSource,
  useOrderExportSource,
  useOrderHeaderActionsSource,
  useOrderAlbumActionsSource,
  useOrderCopyActionsSource,
  useOrderDetailRoutingSource,
  useOrderPresentationSource,
  useOrderStaffBookingSource,
  useOrderOperationLogsSource,
  useOrderMutationsSource,
  useOrderFiltersSource,
  useOrderSlotScopeSource,
  useOrderStoreScopeSource,
  useOrdersViewDetailContextSource,
  useOrdersViewStateSource,
  useOrdersViewLifecycleSource,
  useOrderPageStateSource,
].join('\n')
