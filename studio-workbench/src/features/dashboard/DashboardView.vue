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
      @update:mode="v => businessDateMode = v"
    />

    <DashboardProductRanking
      :ranking="effectiveProductRanking"
      :mode="productRankingMode"
      :date-label="selectedDateLabel"
      :has-backend-data="Boolean(productRankingData)"
      @update:mode="v => productRankingMode = v"
      @open-product="openProductRanking"
    />

    <DashboardConversion
      :date-label="selectedDateLabel"
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
      :trend-stats="appStore.trendStats"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { JianyueSlotCard } from '../../shared/components/schedule/jianyueSlotTypes'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import { useRouteQueryFilters } from '../../shared/composables/useRouteQueryFilters'
import { appStore } from '../../shared/stores/appStore'
import StaffBookingModal, { type StaffBookingInitial } from '../orders/StaffBookingModal.vue'
import { buildDashboardScheduleItems } from './dashboardOperations'
import DashboardOperationsPanel from './DashboardOperationsPanel.vue'
import DashboardQuickEntries from './DashboardQuickEntries.vue'
import DashboardFinanceOverview from './DashboardFinanceOverview.vue'
import DashboardProductRanking from './DashboardProductRanking.vue'
import DashboardConversion from './DashboardConversion.vue'
import DashboardChannelSummary from './DashboardChannelSummary.vue'
import DashboardInventoryConflicts from './DashboardInventoryConflicts.vue'
import DashboardAnomalyOverview from './DashboardAnomalyOverview.vue'
import DashboardScheduleSection from './DashboardScheduleSection.vue'
import { formatDateKey, toDateFromKey } from './dashboardPresentation'
import { useDashboardBusinessInsights } from './useDashboardBusinessInsights'
import {
  buildWorkbenchUrl as resolveDashboardWorkbenchUrl,
  useDashboardNavigation,
  type DashboardTrendGranularity,
} from './useDashboardNavigation'
import { useDashboardOperationCards } from './useDashboardOperationCards'
import { useDashboardOrderScope } from './useDashboardOrderScope'
import { useDashboardSelectionScope } from './useDashboardSelectionScope'
import { useDashboardSlotDetail } from './useDashboardSlotDetail'
import { useDashboardSummaries } from './useDashboardSummaries'

const dashboardLoading = ref(false)
const dashboardError = ref('')
const {
  todayKey,
  selectedDate,
  selectedDateValue,
  selectedDateLabel,
  selectedDateShortLabel,
  selectedDatePrefix,
  selectedDashboardStoreId,
  dashboardStoreOptions,
  selectedDashboardStore,
  fallbackDashboardStoreId,
  selectedDashboardStoreScopeId,
  selectedDashboardStoreBackendId,
  selectedDashboardStoreName,
  selectedStoreScopeLabel,
  selectDashboardDate,
  selectDashboardStore,
  shiftDashboardDate,
  dashboardDateTabs,
} = useDashboardSelectionScope()

const { syncing, applyFromQuery, syncToUrl, isDateKey } = useRouteQueryFilters({
  buildQuery: () => ({
    date: selectedDate.value === todayKey ? '' : selectedDate.value,
    storeId: selectedDashboardStoreScopeId.value || '',
    slotStart: dashboardDeepLinkSlot.value.start,
    slotEnd: dashboardDeepLinkSlot.value.end,
  }),
  parseQuery: get => {
    const slotStart = get('slotStart')
    const slotEnd = get('slotEnd')
    dashboardDeepLinkSlot.value = { start: slotStart, end: slotEnd }
    const date = get('date')
    if (date && isDateKey(date)) selectedDate.value = date
    const storeId = get('storeId')
    if (storeId && appStore.stores.some(store => store.backendId === storeId)) {
      selectedDashboardStoreId.value = storeId
    }
  },
})

const route = useRoute()
const router = useRouter()
const trendGranularity = ref<DashboardTrendGranularity>('月 / 周 / 日')
const dashboardStaffBookingOpen = ref(false)
const dashboardStaffBookingInitial = ref<StaffBookingInitial | null>(null)
const dashboardSelectedSlot = ref<JianyueSlotCard | null>(null)
const dashboardSlotSelectionError = ref('')
const dashboardDeepLinkSlot = ref<{ start: string; end: string }>({ start: '', end: '' })

// 重新加载：错误态点击"重试"时触发
const reloadDashboard = () => {
  // 触发 selectedDateValue 的 watch 副作用；若值未变则手动调用一次
  const date = selectedDateValue.value
  void loadDashboardFor(date)
}

const loadDashboardFor = async (date: string) => {
  dashboardError.value = ''
  if (appStore.demoMode) {
    await appStore.loadSchedule(date)
    await nextTick()
    restoreDashboardSlotFromQuery()
    return
  }
  try {
    dashboardLoading.value = true
    await Promise.all([
      appStore.loadReportOrders(buildDashboardOrderQuery(date)),
      appStore.loadDashboardStats(date, selectedDashboardStoreScopeId.value),
      appStore.loadSchedule(date, selectedDashboardStoreName.value, selectedDashboardStoreScopeId.value),
      appStore.loadBookingInventory({ date, storeBackendId: selectedDashboardStoreScopeId.value }),
    ])
    await nextTick()
    restoreDashboardSlotFromQuery()
  } catch (error) {
    dashboardError.value = error instanceof Error ? `运营看板刷新失败：${error.message}` : '运营看板刷新失败'
  } finally {
    dashboardLoading.value = false
  }
}

applyFromQuery()

// 日期变化同步到 URL（在 syncing 期间跳过，避免回环）
watch([selectedDateValue, selectedDashboardStoreId], () => {
  if (syncing.value) return
  syncToUrl()
})

onMounted(async () => {
  if (!selectedDashboardStoreId.value && appStore.stores[0]?.backendId) {
    selectedDashboardStoreId.value = appStore.stores[0].backendId
  }
  applyFromQuery()
  await nextTick()
  restoreDashboardSlotFromQuery()
})

watch(
  () => appStore.stores.map(store => store.backendId).join('|'),
  () => {
    if (!selectedDashboardStore.value && fallbackDashboardStoreId.value) {
      selectedDashboardStoreId.value = fallbackDashboardStoreId.value
    }
  },
  { immediate: true },
)

watch(() => route.fullPath, () => {
  applyFromQuery()
  if (!selectedDashboardStore.value && fallbackDashboardStoreId.value) {
    selectedDashboardStoreId.value = fallbackDashboardStoreId.value
  }
  restoreDashboardSlotFromQuery()
})

const {
  scopedLedgerOrders,
  matchesSelectedStore,
  resolveOrderForAlbum,
  resolveOrderForSelectionLink,
  matchesDashboardDate,
  selectedDateOrders,
} = useDashboardOrderScope({
  selectedDateValue,
  selectedDashboardStoreBackendId,
})

const { todayOperationCards } = useDashboardOperationCards({
  selectedDateValue,
  selectedDateOrders,
  matchesSelectedStore,
  resolveOrderForAlbum,
  resolveOrderForSelectionLink,
})

const buildWorkbenchUrl = (path: string, query?: Record<string, string | undefined>) =>
  resolveDashboardWorkbenchUrl(router, path, query)

const {
  businessDateMode,
  businessDateKey,
  businessDateScopeLabel,
  productRankingData,
  loadDashboardPhase2Data,
  financeOverview,
  serviceOrderBreakdown,
  productRankingMode,
  effectiveProductRanking,
  conversionDisplay,
  quickEntries,
  copiedEntryKey,
  copyEntryUrl,
  anomalyPreStats,
  syncStatusClass,
  syncStatusLabel,
} = useDashboardBusinessInsights({
  selectedDateValue,
  selectedDashboardStoreId,
  selectedDashboardStoreBackendId,
  scopedLedgerOrders,
  matchesDashboardDate,
  formatDateKey,
  toDateFromKey,
  buildWorkbenchUrl,
})

const {
  buildDateOrderQuery,
  buildDashboardOrderQuery,
  goInventory,
  goShareLinks,
  goDailyReport,
  toggleTrendGranularity,
  openSlotFilter,
  openOperationCard,
  openStatusCard,
  openProductRanking,
  openChannelSummary,
  openQuickEntry,
} = useDashboardNavigation({
  router,
  selectedDateValue,
  selectedDashboardStoreBackendId,
  selectedDashboardStoreScopeId,
  businessDateKey,
  trendGranularity,
})

const dashboardScheduleItems = computed<ScheduleItemDto[]>(() => buildDashboardScheduleItems({
  scheduleItems: appStore.scheduleItems,
  selectedDateOrders: selectedDateOrders.value,
  selectedStoreBackendId: selectedDashboardStoreBackendId.value,
  selectedDate: selectedDateValue.value,
}))

const {
  dashboardSlotGroups,
  restoreDashboardSlotFromQuery,
  formatDashboardClock,
  dashboardSelectedSlotOrders,
  dashboardSelectedSlotRemaining,
  dashboardSelectedSlotRemainingLabel,
  dashboardSelectedSlotStatusLabel,
  dashboardSelectedSlotStoreLabel,
  dashboardSelectedSlotServiceLabel,
  dashboardSelectedSlotServiceBreakdown,
  dashboardSelectedSlotBlocked,
  dashboardSelectedSlotBlockedReason,
  goDashboardSelectedSlotOrders,
  openDashboardSelectedSlotOrder,
  goDashboardSelectedSlotInventory,
  openDashboardStaffBookingFromSelectedSlot,
  openDashboardSlot,
  handleDashboardStaffBookingCreated,
} = useDashboardSlotDetail({
  router,
  selectedDateValue,
  selectedDashboardStoreBackendId,
  selectedDashboardStoreScopeId,
  selectedDashboardStoreName,
  dashboardScheduleItems,
  dashboardDeepLinkSlot,
  dashboardSelectedSlot,
  dashboardSlotSelectionError,
  dashboardStaffBookingOpen,
  dashboardStaffBookingInitial,
  buildDateOrderQuery,
  loadDashboardFor,
})

watch([selectedDateValue, selectedDashboardStoreId], async ([date]) => {
  await loadDashboardFor(date)
  await loadDashboardPhase2Data()
}, { immediate: true })

const {
  channelOrderSummary,
  inventoryConflicts,
  pendingTaskNotice,
  statusCards,
} = useDashboardSummaries({
  selectedDateValue,
  selectedDateOrders,
})

</script>
