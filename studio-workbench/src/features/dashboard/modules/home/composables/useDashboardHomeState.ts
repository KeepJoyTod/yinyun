import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ScheduleItemDto } from '../../../../../shared/api/backendTypes'
import type { JianyueSlotCard } from '../../../../../shared/components/schedule/jianyueSlotTypes'
import { appStore } from '../../../../../shared/stores/appStore'
import type { StaffBookingInitial } from '../../../../orders/StaffBookingModal.vue'
import { buildDashboardScheduleItems } from '../../../dashboardOperations'
import { useDashboardNavigation, type DashboardTrendGranularity } from '../../../useDashboardNavigation'
import { useDashboardOperationCards } from '../../../useDashboardOperationCards'
import { useDashboardOrderScope } from '../../../useDashboardOrderScope'
import { useDashboardSelectionScope } from '../../../useDashboardSelectionScope'
import { useDashboardSlotDetail } from '../../../useDashboardSlotDetail'
import { useDashboardSummaries } from '../../../useDashboardSummaries'
import {
  buildWorkbenchUrl as resolveDashboardWorkbenchUrl,
} from '../../../useDashboardNavigation'
import { formatDateKey, toDateFromKey } from '../dashboardHomeOperations'
import { useDashboardHomeExport } from './useDashboardHomeExport'
import { useDashboardHomeInsights } from './useDashboardHomeInsights'
import { useDashboardHomeRouting } from './useDashboardHomeRouting'

export const useDashboardHomeState = () => {
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

  const router = useRouter()
  const trendGranularity = ref<DashboardTrendGranularity>('月 / 周 / 日')
  const dashboardStaffBookingOpen = ref(false)
  const dashboardStaffBookingInitial = ref<StaffBookingInitial | null>(null)
  const dashboardSelectedSlot = ref<JianyueSlotCard | null>(null)
  const dashboardSlotSelectionError = ref('')
  const dashboardDeepLinkSlot = ref<{ start: string; end: string }>({ start: '', end: '' })

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
    businessDateLabel,
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
  } = useDashboardHomeInsights({
    selectedDateValue,
    selectedDashboardStoreId,
    selectedDashboardStoreBackendId,
    scopedLedgerOrders,
    resolveOrderForSelectionLink,
    matchesDashboardDate,
    formatDateKey,
    toDateFromKey,
    buildWorkbenchUrl,
  })

  const {
    dashboardExporting,
    dashboardExportBeginDate,
    dashboardExportEndDate,
    dashboardExportStoreId,
    dashboardExportChannelType,
    dashboardExportRangeDays,
    dashboardExportInvalidRange,
    dashboardExportDisabled,
    dashboardExportTitle,
    updateDashboardExportStoreId,
    exportDashboardSummary,
  } = useDashboardHomeExport({
    selectedDashboardStoreBackendId,
    businessDateKey,
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

  const reloadDashboard = () => {
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

  useDashboardHomeRouting({
    selectedDate,
    todayKey,
    selectedDateValue,
    selectedDashboardStoreId,
    selectedDashboardStore,
    fallbackDashboardStoreId,
    selectedDashboardStoreScopeId,
    dashboardDeepLinkSlot,
    restoreDashboardSlotFromQuery,
  })

  watch([selectedDateValue, selectedDashboardStoreId], async ([date]) => {
    await loadDashboardFor(date)
  }, { immediate: true })

  watch([businessDateKey, selectedDashboardStoreId], async () => {
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

  const trendStats = computed(() => appStore.trendStats)

  return {
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
    dashboardExportRangeDays,
    dashboardExportInvalidRange,
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
  }
}
