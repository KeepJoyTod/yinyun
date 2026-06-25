<template>
  <div class="space-y-6">
    <DashboardOperationsPanel
      :date-label="selectedDateLabel"
      :date-prefix="selectedDatePrefix"
      :store-scope-label="selectedStoreScopeLabel"
      :selected-store-id="selectedDashboardStoreId"
      :store-options="dashboardStoreOptions"
      :date-tabs="dashboardDateTabs"
      :pending-task-notice="pendingTaskNotice"
      :loading="dashboardLoading"
      :error="dashboardError"
      :on-retry="reloadDashboard"
      :operation-cards="todayOperationCards"
      :status-cards="statusCards"
      @select-store="selectDashboardStore"
      @select-date="selectDashboardDate"
      @shift-date="shiftDashboardDate"
      @open-operation="openOperationCard"
      @open-status="openStatusCard"
      @go-daily-report="goDailyReport"
    />

    <DashboardFinanceOverview
      :finance="financeOverview"
      :breakdown="serviceOrderBreakdown"
      :mode="businessDateMode"
      :scope-label="businessDateScopeLabel"
      :exporting="dashboardExporting"
      :export-disabled="dashboardExportDisabled"
      :export-title="dashboardExportTitle"
      :export-begin-date="dashboardExportBeginDate"
      :export-end-date="dashboardExportEndDate"
      :export-store-id="dashboardExportStoreId"
      :export-store-options="dashboardStoreOptions"
      :export-channel-type="dashboardExportChannelType"
      @update:mode="v => businessDateMode = v"
      @update:export-begin-date="v => dashboardExportBeginDate = v"
      @update:export-end-date="v => dashboardExportEndDate = v"
      @update:export-store-id="updateDashboardExportStoreId"
      @update:export-channel-type="v => dashboardExportChannelType = v"
      @export-dashboard="exportDashboardSummary"
    />

    <DashboardProductRanking
      :ranking="effectiveProductRanking"
      :mode="productRankingMode"
      :date-label="businessDateLabel"
      :has-backend-data="Boolean(productRankingData)"
      @update:mode="v => productRankingMode = v"
      @open-product="openProductRanking"
    />

    <DashboardConversion
      :date-label="businessDateLabel"
      v-bind="conversionDisplay"
    />

    <DashboardChannelSummary
      :date-label="selectedDateLabel"
      :summary="channelOrderSummary"
      @open-channel="openChannelSummary"
    />

    <DashboardInventoryConflicts
      :date-label="selectedDateLabel"
      :conflicts="inventoryConflicts"
      @go-inventory="goInventory()"
      @go-inventory-item="goInventory"
    />

    <DashboardScheduleSection
      :dashboard-selected-slot="dashboardSelectedSlot"
      :dashboard-selected-slot-blocked="dashboardSelectedSlotBlocked"
      :dashboard-selected-slot-blocked-reason="dashboardSelectedSlotBlockedReason"
      :dashboard-selected-slot-orders="dashboardSelectedSlotOrders"
      :dashboard-selected-slot-remaining="dashboardSelectedSlotRemaining"
      :dashboard-selected-slot-remaining-label="dashboardSelectedSlotRemainingLabel"
      :dashboard-selected-slot-service-breakdown="dashboardSelectedSlotServiceBreakdown"
      :dashboard-selected-slot-service-label="dashboardSelectedSlotServiceLabel"
      :dashboard-selected-slot-status-label="dashboardSelectedSlotStatusLabel"
      :dashboard-selected-slot-store-label="dashboardSelectedSlotStoreLabel"
      :dashboard-slot-groups="dashboardSlotGroups"
      :dashboard-slot-selection-error="dashboardSlotSelectionError"
      :format-dashboard-clock="formatDashboardClock"
      :selected-date-short-label="selectedDateShortLabel"
      :trend-granularity="trendGranularity"
      :trend-stats="trendStats"
      @close-dashboard-slot="dashboardSelectedSlot = null"
      @dashboard-slot-primary-action="dashboardSelectedSlotBlocked ? goDashboardSelectedSlotInventory() : openDashboardStaffBookingFromSelectedSlot()"
      @go-dashboard-selected-slot-inventory="goDashboardSelectedSlotInventory"
      @go-dashboard-selected-slot-orders="goDashboardSelectedSlotOrders()"
      @open-dashboard-selected-slot-order="openDashboardSelectedSlotOrder"
      @open-dashboard-slot="openDashboardSlot"
      @open-slot-filter="openSlotFilter"
      @toggle-trend-granularity="toggleTrendGranularity"
    />

    <DashboardAnomalyOverview
      :stats="anomalyPreStats"
      :sync-status-class="syncStatusClass"
      :sync-status-label="syncStatusLabel"
    />

    <DashboardQuickEntries
      :entries="quickEntries"
      :copied-entry-key="copiedEntryKey"
      @go-share-links="goShareLinks"
      @open-entry="openQuickEntry"
      @copy-entry="copyEntryUrl"
    />
    <StaffBookingModal
      :open="dashboardStaffBookingOpen"
      :initial="dashboardStaffBookingInitial"
      @close="dashboardStaffBookingOpen = false"
      @created="handleDashboardStaffBookingCreated"
    />
  </div>
</template>

<script setup lang="ts">
import StaffBookingModal from '../../../orders/StaffBookingModal.vue'
import DashboardAnomalyOverview from '../../DashboardAnomalyOverview.vue'
import DashboardChannelSummary from '../../DashboardChannelSummary.vue'
import DashboardConversion from '../../DashboardConversion.vue'
import DashboardFinanceOverview from '../../DashboardFinanceOverview.vue'
import DashboardInventoryConflicts from '../../DashboardInventoryConflicts.vue'
import DashboardOperationsPanel from '../../DashboardOperationsPanel.vue'
import DashboardProductRanking from '../../DashboardProductRanking.vue'
import DashboardQuickEntries from '../../DashboardQuickEntries.vue'
import DashboardScheduleSection from '../../DashboardScheduleSection.vue'
import { useDashboardHomeState } from './composables/useDashboardHomeState'

const {
  dashboardLoading,
  dashboardError,
  selectedDateLabel,
  selectedDatePrefix,
  selectedStoreScopeLabel,
  selectedDashboardStoreId,
  dashboardStoreOptions,
  dashboardDateTabs,
  pendingTaskNotice,
  reloadDashboard,
  todayOperationCards,
  statusCards,
  selectDashboardStore,
  selectDashboardDate,
  shiftDashboardDate,
  financeOverview,
  serviceOrderBreakdown,
  businessDateMode,
  businessDateScopeLabel,
  dashboardExporting,
  dashboardExportDisabled,
  dashboardExportTitle,
  dashboardExportBeginDate,
  dashboardExportEndDate,
  dashboardExportStoreId,
  dashboardExportChannelType,
  updateDashboardExportStoreId,
  exportDashboardSummary,
  effectiveProductRanking,
  productRankingMode,
  businessDateLabel,
  productRankingData,
  conversionDisplay,
  channelOrderSummary,
  inventoryConflicts,
  goInventory,
  goDailyReport,
  openOperationCard,
  openStatusCard,
  dashboardSelectedSlot,
  dashboardSelectedSlotBlocked,
  dashboardSelectedSlotBlockedReason,
  dashboardSelectedSlotOrders,
  dashboardSelectedSlotRemaining,
  dashboardSelectedSlotRemainingLabel,
  dashboardSelectedSlotServiceBreakdown,
  dashboardSelectedSlotServiceLabel,
  dashboardSelectedSlotStatusLabel,
  dashboardSelectedSlotStoreLabel,
  dashboardSlotGroups,
  dashboardSlotSelectionError,
  formatDashboardClock,
  selectedDateShortLabel,
  trendGranularity,
  trendStats,
  goDashboardSelectedSlotInventory,
  openDashboardStaffBookingFromSelectedSlot,
  goDashboardSelectedSlotOrders,
  openDashboardSelectedSlotOrder,
  openDashboardSlot,
  openSlotFilter,
  toggleTrendGranularity,
  anomalyPreStats,
  syncStatusClass,
  syncStatusLabel,
  quickEntries,
  copiedEntryKey,
  goShareLinks,
  openProductRanking,
  openChannelSummary,
  openQuickEntry,
  copyEntryUrl,
  dashboardStaffBookingOpen,
  dashboardStaffBookingInitial,
  handleDashboardStaffBookingCreated,
} = useDashboardHomeState()
</script>
