<template>
  <OrdersViewConsoleShell
      :filtered-count="filteredOrders.length"
      :total-amount="totalAmount"
      :order-scope-label="orderScopeLabel"
      :demo-mode="appStore.demoMode"
      :syncing-douyin-orders="syncingDouyinOrders"
      :active-dropdown="activeDropdown"
      :can-export-orders="canExportOrders"
      :exporting-orders="exportingOrders"
      :order-export-title="orderExportTitle"
      :order-export-sync-notice="orderExportSyncNotice"
      :unsupported-order-export-filters="unsupportedOrderExportFilters"
      :last-douyin-life-order-sync="lastDouyinLifeOrderSync"
      :notice="orderActionNotice"
      :store-name="storeNameForOrderScope"
      :store-options="storeOptions"
      :source-options="sourceOptions"
      :dropdown-filters="dropdownFilters"
      :day-cards="dayCommandCards"
      :conflict-orders="inventoryConflictOrders"
      :missing-orders="missingInfoOrders"
      :orders="filteredOrders"
      :anomaly-filters="anomalyFilterOptions"
      :quick-filters="quickOrderFilters"
      :pipeline-cards="orderPipelineCards"
      :active-filter="activeQuickFilter"
      :selected-anomalies="anomalyFilters"
      :search-query="effectiveSearchQuery"
      :method-options="methodOptions"
      :method="advanced.method"
      :time-type="selectedTimeType"
      :start-date="activeStartDate"
      :end-date="activeEndDate"
      :calendar-title="calendarTitle"
      :calendar-cells="calendarCells"
      :filter-tags="activeFilterTags"
      :has-filters="hasActiveFilters"
      :get-dropdown-caption="getDropdownCaption"
      :get-calendar-cell-class="getCalendarCellClass"
      :status-tabs="statusTabItems.map(t => ({ status: t.key, label: t.label, count: t.count }))"
      :status-tab="statusTab"
      :table-columns="tableColumns"
      :status-styles="statusStyles"
      :empty-title="emptyStateTitle"
      :empty-hint="emptyStateHint"
      :pagination-start="paginationStart"
      :can-advance="order => Boolean(getNextOrderAction(order))"
      :advancing-id="updatingOrderId"
      :get-next-label="order => getNextOrderAction(order)?.label ?? ''"
      :get-next-hint="getNextOrderHint"
      @open-staff-booking="openStaffBookingModal"
      @open-schedule="router.push('/dashboard/today')"
      @sync-douyin-life-orders="syncDouyinLifeOrders"
      @show-all-orders="showAllOrders"
      @open-meituan-verify="router.push('/tools/meituan-verify')"
      @toggle-export-dropdown="activeDropdown = activeDropdown === 'export' ? null : 'export'"
      @export-orders="exportOrders"
      @export-coupons="exportCoupons"
      @export-rights="exportRights"
      @open-advanced="advancedOpen = true"
      @select-store="selectOrderStore"
      @set-filter="selectDropdown"
      @open-order-filter="activeQuickFilter = $event as QuickOrderFilter"
      @update-active-filter="activeQuickFilter = $event as QuickOrderFilter"
      @toggle-anomaly="toggleAnomalyFilter"
      @update-time-type="selectedTimeType = $event"
      @set-active-dropdown="activeDropdown = $event"
      @select-dropdown="selectDropdown"
      @select-date="selectDate"
      @reset="resetFilters"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @open-calendar="openCalendar"
      @arm-search="armSearchQueryInput"
      @handle-search="handleSearchInput"
      @select-status="statusTab = $event"
      @open-detail="openOrderDetailWithRouteSync"
      @advance="advanceOrder"
      @print="openPrintDialog"
      @show-all="showAllOrders"
    />

  <OrdersViewOverlays
    :advanced-open="advancedOpen"
    :advanced="advanced"
    :advanced-store-options="advancedStoreOptions"
    :source-options="sourceOptions"
    :payment-options="paymentOptions"
    :service-options="serviceOptions"
    :method-options="methodOptions"
    :status-options="statusOptions"
    :match-count="filteredOrders.length"
    :order-detail-drawer-context="orderDetailDrawerContext"
    :print-dialog-open="printDialogOpen"
    :print-dialog-order-id="printDialogOrderId"
    :staff-booking-open="staffBookingOpen"
    :staff-booking-initial="staffBookingInitial"
    @update:advanced-open="advancedOpen = $event"
    @update:advanced="advanced = $event"
    @toggle-status="toggleAdvancedStatus"
    @reset-advanced="resetAdvanced"
    @close-detail="closeOrderDetail"
    @back-to-slot="goBackToDashboardSlot"
    @advance="advanceOrder"
    @refresh-logs="loadOrderOperationLogs"
    @copy-order-id="selectedOrder && copyField(selectedOrder.id, 'orderId')"
    @copy="copyField"
    @update-reschedule-date="rescheduleDraft.date = $event"
    @update-reschedule-time="rescheduleDraft.time = $event"
    @update-reschedule-duration-minutes="rescheduleDraft.durationMinutes = $event"
    @update-reschedule-remark="rescheduleDraft.remark = $event"
    @apply-reschedule-reason="applyRescheduleReason"
    @apply-reschedule-slot="applyRescheduleSlot"
    @submit-reschedule="rescheduleSelectedOrder"
    @update-cancel-reason="cancelReason = $event"
    @apply-cancel-reason="applyCancelReason"
    @submit-cancel="cancelSelectedOrder"
    @submit-confirm-payment="confirmSelectedOrderPayment"
    @open-album="goToAlbum"
    @notify-album="handleOrderAlbumNotify"
    @confirm-album="handleOrderAlbumConfirm"
    @deliver-album="handleOrderAlbumDeliver"
    @open-photo-management="goToPhotoManagement"
    @copy-channel-diagnostic="copyOrderChannelDiagnostic"
    @refresh-operation-logs="loadOrderOperationLogs"
    @close-print-dialog="printDialogOpen = false"
    @close-staff-booking="staffBookingOpen = false"
    @staff-booking-created="handleStaffBookingCreated"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import OrdersViewConsoleShell from './OrdersViewConsoleShell.vue'
import OrdersViewOverlays from './OrdersViewOverlays.vue'
import { useOrderConsoleActions } from './composables/useOrderConsoleActions'
import { useOrderCalendar } from './composables/useOrderCalendar'
import { useOrderDataFetching } from './composables/useOrderDataFetching'
import { useOrderDetailActions } from './composables/useOrderDetailActions'
import { useOrderDetailNavigation } from './composables/useOrderDetailNavigation'
import { useOrderExport } from './composables/useOrderExport'
import { useOrderFilters } from './composables/useOrderFilters'
import { useOrderPresentation } from './composables/useOrderPresentation'
import { useOrderRouteEffects } from './composables/useOrderRouteEffects'
import { useOrderRouteSync } from './composables/useOrderRouteSync'
import { useOrderStoreScope } from './composables/useOrderStoreScope'
import { useOrdersViewDetailContext } from './composables/useOrdersViewDetailContext'
import { useOrdersViewState } from './composables/useOrdersViewState'
import {
  buildOrderOperationCards,
  getOrderInventoryConflictSlot,
  getNextOrderAction,
  getNextOrderHint,
  hasCustomerContact,
  isMissingArrivalSchedule,
  isTodayPendingConfirmOrder,
  type QuickOrderFilter,
} from './orderOperations'

const {
  searchQuery, searchQueryArmed, searchQueryTouched, selectedTimeType,
  activeDropdown, advancedOpen, activeQuickFilter, slotRange, slotScopedOrders,
  slotScopedDashboardContext, statusTab, anomalyFilters, syncingFromQuery,
  lastOpenedOrderQuery, cancelReason, cancellingOrderId, updatingOrderId, confirmingPaymentOrderId,
  orderAlbumActionLoading, orderPhotoAccessLoading, orderPhotoAccessError,
  orderPhotoAccessRequestId, orderActionNotice, selectedOrder, reschedulingOrderId,
  rescheduleConflict, syncingDouyinOrders, operationLogsLoading, operationLogsReloadQueued,
  operationLogsNotice, staffBookingOpen, staffBookingInitial, printDialogOpen,
  printDialogOrderId, rescheduleDraft, cancelReasonOptions, rescheduleReasonOptions,
  todayKey, orderRange, arrivalRange, activeStartDate, activeEndDate,
  calendarMonth, advanced, dropdownFilters, toggleAdvancedStatus,
} = useOrdersViewState()

const toggleAnomalyFilter = (key: string) => {
  if (anomalyFilters.value.has(key)) {
    anomalyFilters.value.delete(key)
  } else {
    anomalyFilters.value.add(key)
  }
}
const route = useRoute()
const router = useRouter()
const { copiedKey: copiedField, copyText: copyFieldText } = useCopyWithState()

const {
  calendarTitle,
  calendarCells,
  getCalendarCellClass,
  openCalendar,
  prevMonth,
  nextMonth,
  selectDate,
} = useOrderCalendar(calendarMonth, activeStartDate, activeEndDate, activeDropdown)

const {
  storeOptions,
  lastDouyinLifeOrderSync,
  selectDropdown,
  getDropdownCaption,
  storeNameForOrderScope,
  selectOrderStore,
  ensureConcreteStoreScope,
} = useOrderStoreScope({
  advanced,
  dropdownFilters,
  activeDropdown,
  orderRange,
  arrivalRange,
})

const {
  readQueryString,
  armSearchQueryInput,
  setSearchQuery,
  handleSearchInput,
  effectiveSearchQuery,
  applyFiltersFromQuery,
  syncFiltersToUrl,
  buildSlotScopedOrderQuery,
  resolveStoreNameFromBackendId,
} = useOrderRouteSync({
  searchQuery,
  searchQueryArmed,
  searchQueryTouched,
  activeQuickFilter,
  selectedTimeType,
  activeStartDate,
  activeEndDate,
  slotRange,
  slotScopedDashboardContext,
  statusTab,
  storeNameForOrderScope,
  advanced,
  dropdownFilters,
  syncingFromQuery,
})

const {
  orders,
  orderScopeLabel,
  advancedStoreOptions,
  serviceOptions,
  paymentOptions,
  sourceOptions,
  methodOptions,
  statusOptions,
  filteredOrders,
  anomalyFilterOptions,
  quickOrderFilters,
  statusTabItems,
  activeFilterTags,
  hasActiveFilters,
  emptyStateTitle,
  emptyStateHint,
  paginationStart,
  totalAmount,
  resetAdvanced,
  resetFilters,
} = useOrderFilters({
  selectedTimeType,
  activeQuickFilter,
  activeDropdown,
  slotRange,
  slotScopedOrders,
  statusTab,
  effectiveSearchQuery,
  setSearchQuery,
  externalOrderRange: orderRange,
  externalArrivalRange: arrivalRange,
  externalAdvanced: advanced,
  externalDropdownFilters: dropdownFilters,
})

const todayPendingConfirmOrders = computed(() =>
  orders.value.filter(order => isTodayPendingConfirmOrder(order, todayKey)),
)

const orderPipelineCards = computed(() => buildOrderOperationCards(orders.value, todayKey))

const inventoryConflictOrders = computed(() =>
  orders.value.filter(order => getOrderInventoryConflictSlot(order, appStore.bookingInventory)),
)

const missingInfoOrders = computed(() =>
  orders.value.filter(order => !hasCustomerContact(order) || isMissingArrivalSchedule(order)),
)

const dayCommandCards = computed(() => [
  {
    label: '按天处理',
    value: String(todayPendingConfirmOrders.value.length),
    hint: '今天到店待确认，优先做电话 / 微信确认。',
    action: '先确认',
    scope: '日期',
    filter: 'pending' as QuickOrderFilter,
  },
  {
    label: '门店筛选',
    value: String(new Set(orders.value.map(order => order.store)).size),
    hint: '按门店把当天订单收拢到同一队列。',
    action: '看门店',
    scope: '门店',
    filter: 'todayOps' as QuickOrderFilter,
  },
  {
    label: '渠道筛选',
    value: String(new Set(orders.value.map(order => order.source)).size),
    hint: '抖音、微信、手工录入分开看，避免混单。',
    action: '看渠道',
    scope: '渠道',
    filter: 'todayOps' as QuickOrderFilter,
  },
  {
    label: '冲突提示',
    value: String(inventoryConflictOrders.value.length),
    hint: '库存冲突时先改期，再处理后续动作。',
    action: '查看冲突',
    scope: '异常',
    filter: 'issues' as QuickOrderFilter,
  },
])

const {
  exportingOrders,
  orderExportSyncNotice,
  unsupportedOrderExportFilters,
  canExportOrders,
  orderExportTitle,
  exportOrders,
} = useOrderExport({
  selectedTimeType,
  activeStartDate,
  activeEndDate,
  storeNameForOrderScope,
  effectiveSearchQuery,
  statusTab,
  advanced,
  dropdownFilters,
  filteredOrders,
}, notifyOrderAction)

const { loadSlotScopedOrdersFromQuery } = useOrderDataFetching({
  activeStartDate,
  activeEndDate,
  effectiveSearchQuery,
  storeNameForOrderScope,
  slotRange,
  slotScopedOrders,
  buildSlotScopedOrderQuery,
}, notifyOrderAction)

const {
  tableColumns,
  statusStyles,
  photoDeliveryStageStyles,
  orderTimelineToneStyles,
  paymentTone,
} = useOrderPresentation()

const {
  selectedOrderAlbum,
  selectedOrderAlbumActionAvailability,
  reschedulePreviewConflictMessage,
  applyRescheduleSlot,
  orderDetailDrawerContext,
} = useOrdersViewDetailContext({
  selectedOrder,
  rescheduleDraft,
  operationLogsLoading,
  operationLogsNotice,
  slotRange,
  updatingOrderId,
  orderActionNotice,
  statusStyles,
  paymentTone,
  copiedField,
  rescheduleReasonOptions,
  rescheduleConflict,
  reschedulingOrderId,
  orderTimelineToneStyles,
  cancelReason,
  cancelReasonOptions,
  cancellingOrderId,
  confirmingPaymentOrderId,
  photoDeliveryStageStyles,
  orderAlbumActionLoading,
  orderPhotoAccessLoading,
  orderPhotoAccessError,
})

const {
  applyCancelReason,
  applyRescheduleReason,
  loadOrderOperationLogs,
  openOrderDetail,
  goToAlbum,
  goToPhotoManagement,
  loadSelectedOrderPhotoAccessLogs,
  handleOrderAlbumNotify,
  handleOrderAlbumConfirm,
  handleOrderAlbumDeliver,
  copyField,
  copyOrderChannelDiagnostic,
  advanceOrder,
  cancelSelectedOrder,
  confirmSelectedOrderPayment,
  rescheduleSelectedOrder,
} = useOrderDetailActions({
  router,
  todayKey,
  selectedOrder,
  slotRange,
  slotScopedDashboardContext,
  cancelReason,
  cancellingOrderId,
  updatingOrderId,
  confirmingPaymentOrderId,
  reschedulingOrderId,
  rescheduleConflict,
  rescheduleDraft,
  orderAlbumActionLoading,
  orderPhotoAccessLoading,
  orderPhotoAccessError,
  orderPhotoAccessRequestId,
  operationLogsLoading,
  operationLogsReloadQueued,
  operationLogsNotice,
  selectedOrderAlbum,
  selectedOrderAlbumActionAvailability,
  reschedulePreviewConflictMessage,
  loadSlotScopedOrdersFromQuery,
  copyFieldText,
  notifyOrderAction,
})

const syncSelectedOrderQuery = (orderId?: string) => {
  const nextOrderId = orderId || undefined
  if (readQueryString(route.query.orderId) === (nextOrderId || '')) return
  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      orderId: nextOrderId,
    },
  })
}

const openOrderDetailWithRouteSync = (order: BookingOrder) => {
  openOrderDetail(order)
  syncSelectedOrderQuery(order.id)
}

const closeOrderDetail = () => {
  selectedOrder.value = null
  syncSelectedOrderQuery()
}

const {
  openStaffBookingModal, handleStaffBookingCreated, openPrintDialog,
  exportCoupons, exportRights, syncDouyinLifeOrders, showAllOrders,
} = useOrderConsoleActions({
  activeStartDate, selectedTimeType, activeQuickFilter, slotRange, orderRange, arrivalRange,
  orders, syncingDouyinOrders, staffBookingOpen, staffBookingInitial, printDialogOpen,
  printDialogOrderId, todayKey, storeNameForOrderScope,
  readDouyin30Query: () => readQueryString(route.query.quick) === 'douyin30',
  notifyOrderAction,
})

const { goBackToDashboardSlot, openOrderFromQuery } = useOrderDetailNavigation({
  route, router, filteredOrders, selectedOrder, lastOpenedOrderQuery,
  slotScopedDashboardContext, slotRange, activeStartDate, todayKey,
  readQueryString, openOrderDetail: openOrderDetailWithRouteSync,
})

function notifyOrderAction(type: 'success' | 'error', message: string) {
  orderActionNotice.value = { type, message }
  window.setTimeout(() => {
    if (orderActionNotice.value?.message === message) orderActionNotice.value = null
  }, 4200)
}

useOrderRouteEffects({
  route,
  activeDropdown,
  activeQuickFilter,
  selectedTimeType,
  arrivalRange,
  effectiveSearchQuery,
  activeStartDate,
  activeEndDate,
  statusTab,
  slotRange,
  dropdownFilters,
  advanced,
  filteredOrders,
  todayPendingConfirmOrders,
  selectedOrderAlbum,
  orderPhotoAccessError,
  orderPhotoAccessLoading,
  readQueryString,
  resolveStoreNameFromBackendId,
  ensureConcreteStoreScope,
  applyFiltersFromQuery,
  syncFiltersToUrl,
  openOrderFromQuery,
  loadSelectedOrderPhotoAccessLogs,
  notifyOrderAction,
})
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
