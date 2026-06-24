import { describe, expect, it } from 'vitest'
import dashboardSource from './DashboardView.vue?raw'
import dashboardOperationsPanelSource from './DashboardOperationsPanel.vue?raw'
import dashboardQuickEntriesSource from './DashboardQuickEntries.vue?raw'
import dashboardScheduleSectionSource from './DashboardScheduleSection.vue?raw'
import dashboardPresentationSource from './dashboardPresentation.ts?raw'
import dashboardBusinessInsightsSource from './useDashboardBusinessInsights.ts?raw'
import dashboardNavigationSource from './useDashboardNavigation.ts?raw'
import dashboardOperationCardsSource from './useDashboardOperationCards.ts?raw'
import dashboardOrderScopeSource from './useDashboardOrderScope.ts?raw'
import dashboardSelectionScopeSource from './useDashboardSelectionScope.ts?raw'
import dashboardSlotDetailSource from './useDashboardSlotDetail.ts?raw'
import dashboardSummariesSource from './useDashboardSummaries.ts?raw'
import slotDetailPanelSource from '../../shared/components/schedule/SlotDetailPanel.vue?raw'
import inventoryConflictsSource from './DashboardInventoryConflicts.vue?raw'
import financeOverviewSource from './DashboardFinanceOverview.vue?raw'
import productRankingSource from './DashboardProductRanking.vue?raw'

const dashboardFullSource = [
  dashboardSource,
  dashboardOperationsPanelSource,
  dashboardQuickEntriesSource,
  dashboardScheduleSectionSource,
  dashboardPresentationSource,
  dashboardBusinessInsightsSource,
  dashboardNavigationSource,
  dashboardOperationCardsSource,
  dashboardOrderScopeSource,
  dashboardSelectionScopeSource,
  dashboardSlotDetailSource,
  dashboardSummariesSource,
].join('\n')

describe('dashboard page contract', () => {
  it('shows date-scoped operation metrics for store staff', () => {
    expect(dashboardFullSource).toContain('dashboard-ops-strip')
    expect(dashboardFullSource).toContain('todayOperationCards')
    expect(dashboardFullSource).toContain('selectedDate')
    expect(dashboardFullSource).toContain('shiftDashboardDate')
    expect(dashboardFullSource).toContain('dashboardDateTabs')
    expect(dashboardFullSource).toContain('今日待拍')
    expect(dashboardFullSource).toContain('待上传')
    expect(dashboardFullSource).toContain('待选片')
    expect(dashboardFullSource).toContain('待交付')
  })

  it('derives dashboard operations from existing store data', () => {
    expect(dashboardFullSource).toContain('appStore.orders')
    expect(dashboardFullSource).toContain('appStore.albums')
    expect(dashboardFullSource).toContain('appStore.selectionLinks')
    expect(dashboardFullSource).toContain('selectedDateOrders.value.filter(')
    expect(dashboardFullSource).toContain('album.date === selectedDateValue.value')
    expect(dashboardFullSource).toContain('selectedCount')
  })

  it('reloads dashboard backend stats when selected day or store changes', () => {
    expect(dashboardFullSource).toContain('watch([selectedDateValue, selectedDashboardStoreId]')
    expect(dashboardFullSource).toContain('appStore.loadDashboardStats(date, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain('appStore.loadSchedule(date, selectedDashboardStoreName.value, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain("}, { immediate: true })")
  })

  it('loads the lightweight trend chart asynchronously', () => {
    expect(dashboardFullSource).toContain('defineAsyncComponent')
    expect(dashboardFullSource).toContain("import('../../shared/components/dashboard/TrendChart.vue')")
    expect(dashboardSource).not.toContain("import TrendChart from '../../shared/components/dashboard/TrendChart.vue'")
  })

  it('syncs the selected date to the URL for shareable links', () => {
    expect(dashboardFullSource).toContain('useRouteQueryFilters')
    expect(dashboardFullSource).toContain('applyFromQuery')
    expect(dashboardFullSource).toContain('syncToUrl')
    expect(dashboardFullSource).toContain("selectedDate.value === todayKey ? '' : selectedDate.value")
  })

  it('applies route query before the immediate dashboard refresh starts', () => {
    const querySyncIndex = dashboardSource.indexOf('const { syncing, applyFromQuery, syncToUrl, isDateKey } = useRouteQueryFilters')
    const initialApplyIndex = dashboardSource.indexOf('applyFromQuery()', querySyncIndex)
    const immediateRefreshIndex = dashboardSource.indexOf("watch([selectedDateValue, selectedDashboardStoreId], async ([date]) =>")
    expect(querySyncIndex).toBeGreaterThan(-1)
    expect(initialApplyIndex).toBeGreaterThan(querySyncIndex)
    expect(immediateRefreshIndex).toBeGreaterThan(initialApplyIndex)
  })

  it('uses the shared reference-style date strip for dashboard date navigation', () => {
    expect(dashboardFullSource).toContain('JianyueDateStrip')
    expect(dashboardFullSource).toContain('dashboardDateTabs')
    expect(dashboardFullSource).toContain('@select-date="selectDashboardDate"')
    expect(dashboardFullSource).toContain('@shift-date="shiftDashboardDate"')
    expect(dashboardOperationsPanelSource).toContain('@select="$emit(\'select-date\', $event)"')
    expect(dashboardOperationsPanelSource).toContain('@shift="$emit(\'shift-date\', $event)"')
  })

  it('aggregates channel orders from existing store data', () => {
    expect(dashboardFullSource).toContain('渠道订单汇总')
    expect(dashboardFullSource).toContain('channelOrderSummary')
    expect(dashboardFullSource).toContain('selectedDateOrders')
    expect(dashboardFullSource).toContain('order.source')
    expect(dashboardFullSource).toContain('order.amount')
  })

  it('surfaces inventory conflicts with a deep link to the inventory page', () => {
    expect(dashboardFullSource).toContain('库存冲突提醒')
    expect(dashboardFullSource).toContain('inventoryConflicts')
    expect(dashboardFullSource).toContain('appStore.bookingInventory')
    expect(dashboardFullSource).toContain('conflictCount')
    expect(dashboardFullSource).toContain('goInventory')
    expect(dashboardFullSource).toContain("path: '/merchant/inventory'")
    expect(dashboardFullSource).toContain("query: { date: selectedDateValue.value")
  })

  it('uses shared loading / error / empty state components', () => {
    expect(dashboardFullSource).toContain('StateView')
    expect(dashboardFullSource).toContain('NoticeBanner')
    expect(inventoryConflictsSource).toContain('StatusBadge')
    expect(dashboardFullSource).toContain('reloadDashboard')
    expect(dashboardFullSource).toContain('dashboardError')
  })

  it('adds a finance overview with today/yesterday toggle and order breakdown', () => {
    expect(dashboardFullSource).toContain('经营概况')
    expect(dashboardFullSource).toContain('DashboardFinanceOverview')
    expect(dashboardFullSource).toContain(':mode="businessDateMode"')
    expect(dashboardFullSource).toContain('@update:mode="v => businessDateMode = v"')
    expect(dashboardFullSource).toContain('financeOverview')
    expect(dashboardFullSource).toContain('serviceOrderBreakdown')
    expect(dashboardFullSource).toContain('buildOrderStatusGroupCounts')
    expect(financeOverviewSource).toContain("$emit('update:mode', 'today')")
    expect(financeOverviewSource).toContain("$emit('update:mode', 'yesterday')")
  })

  it('exports dashboard summaries with date range, store and channel filters', () => {
    expect(dashboardSource).toContain('exportDashboardSummary')
    expect(dashboardSource).toContain('dashboardExportBeginDate')
    expect(dashboardSource).toContain('dashboardExportEndDate')
    expect(dashboardSource).toContain('dashboardExportStoreId')
    expect(dashboardSource).toContain('updateDashboardExportStoreId')
    expect(dashboardSource).toContain('dashboardExportChannelType')
    expect(dashboardSource).toContain('dashboardExportInvalidRange')
    expect(dashboardSource).toContain('dashboardExportRangeDays.value > 31')
    expect(dashboardSource).toContain('appStore.demoMode || dashboardExporting.value || dashboardExportInvalidRange.value')
    expect(dashboardSource).toContain('appStore.exportDashboard({')
    expect(dashboardSource).toContain('storeId: dashboardExportStoreId.value || undefined')
    expect(dashboardSource).toContain('channelType: dashboardExportChannelType.value || undefined')
    expect(dashboardSource).toContain('dashboard-summary-${normalizeDashboardExportDate(beginDate)}-${normalizeDashboardExportDate(endDate)}.xlsx')
    expect(financeOverviewSource).toContain('exportChannelOptions')
    expect(financeOverviewSource).toContain('exportStoreOptions')
    expect(financeOverviewSource).toContain('export.svg')
    expect(financeOverviewSource).toContain("$emit('export-dashboard')")
    expect(financeOverviewSource).toContain("'update:exportBeginDate'")
    expect(financeOverviewSource).toContain("'update:exportEndDate'")
    expect(financeOverviewSource).toContain("'update:exportStoreId'")
    expect(financeOverviewSource).toContain("'update:exportChannelType'")
  })

  it('uses backend dashboard finance data before falling back to local order aggregation', () => {
    expect(dashboardFullSource).toContain('appStore.dashboardFinance')
    expect(dashboardFullSource).toContain('dashboardFinanceDate')
    expect(dashboardFullSource).toContain('dashboardFinanceStoreId')
    expect(dashboardFullSource).toContain('dashboardFinanceMatchesScope')
    expect(dashboardFullSource).toContain('hasBackendFinanceApi: true')
    expect(dashboardSource).not.toContain('后端财务统计接口未接入')
  })

  it('scopes dashboard finance, schedule, inventory and deep links by selected store', () => {
    expect(dashboardFullSource).toContain('selectedDashboardStoreId')
    expect(dashboardFullSource).toContain('dashboardStoreOptions')
    expect(dashboardFullSource).toContain('selectedDashboardStoreBackendId')
    expect(dashboardFullSource).toContain('selectedDashboardStore.value?.backendId || fallbackDashboardStoreId.value')
    expect(dashboardFullSource).toContain('selectedStoreScopeLabel')
    expect(dashboardFullSource).toContain('@select-store="selectDashboardStore"')
    expect(dashboardOperationsPanelSource).toContain('@click="$emit(\'select-store\', option.id)"')
    expect(dashboardFullSource).toContain('storeId: selectedDashboardStoreScopeId.value ||')
    expect(dashboardFullSource).toContain('appStore.loadDashboardStats(date, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain('appStore.loadSchedule(date, selectedDashboardStoreName.value, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain('appStore.loadBookingInventory({ date, storeBackendId: selectedDashboardStoreScopeId.value })')
    expect(dashboardFullSource).toContain('appStore.loadDashboardFinance(date, selectedDashboardStoreBackendId.value)')
    expect(dashboardFullSource).toContain('scopedLedgerOrders')
    expect(dashboardFullSource).toContain('allKnownOrders')
    expect(dashboardFullSource).toContain('matchesSelectedStore')
    expect(dashboardFullSource).toContain('resolveOrderForAlbum')
    expect(dashboardFullSource).toContain('resolveOrderForSelectionLink')
    expect(dashboardFullSource).toContain('matchesSelectedStore(order?.storeBackendId)')
    expect(dashboardFullSource).toContain('storeId: selectedDashboardStoreBackendId.value')
  })

  it('keeps the dashboard appointment grid scoped to one concrete store by default', () => {
    expect(dashboardFullSource).toContain("const selectedDashboardStoreId = ref('')")
    expect(dashboardFullSource).toContain('const fallbackDashboardStoreId = computed(() => appStore.stores[0]?.backendId || \'\')')
    expect(dashboardFullSource).toContain('selectedDashboardStore.value?.backendId || fallbackDashboardStoreId.value')
    expect(dashboardFullSource).toContain("?? '未选择门店'")
    expect(dashboardFullSource).toContain('if (!selectedDashboardStore.value && fallbackDashboardStoreId.value)')
    expect(dashboardSource).not.toContain("{ id: 'all', name: '全部门店' }")
    expect(dashboardSource).not.toContain('全门店汇总')
  })

  it('ignores stale or invalid storeId query values and falls back to a real store', () => {
    expect(dashboardFullSource).toContain("const storeId = get('storeId')")
    expect(dashboardFullSource).toContain('storeId && appStore.stores.some(store => store.backendId === storeId)')
    expect(dashboardFullSource).toContain('if (!selectedDashboardStore.value && fallbackDashboardStoreId.value)')
    expect(dashboardFullSource).toContain('selectedDashboardStoreId.value = fallbackDashboardStoreId.value')
    expect(dashboardFullSource).toContain('selectedDashboardStore.value?.backendId || fallbackDashboardStoreId.value')
  })

  it('keeps dashboard refresh tied to the same order cache used by sync orders', () => {
    expect(dashboardFullSource).toContain('appStore.orders')
    expect(dashboardFullSource).toContain('appStore.ledgerOrders')
    expect(dashboardFullSource).toContain('loadDashboardFor')
    expect(dashboardFullSource).toContain('appStore.loadReportOrders(buildDashboardOrderQuery(date))')
    expect(dashboardFullSource).toContain('slotDate: date')
    expect(dashboardSource).not.toContain('beginArrivalTime: `${date} 00:00:00`')
    expect(dashboardFullSource).toContain('appStore.loadDashboardStats(date, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain('appStore.loadSchedule(date, selectedDashboardStoreName.value, selectedDashboardStoreScopeId.value)')
    expect(dashboardFullSource).toContain('今日待拍')
    expect(dashboardFullSource).toContain('经营概况')
  })

  it('uses operational dates so Douyin orders without arrivalAt still land in the correct day bucket', () => {
    expect(dashboardFullSource).toContain('getOrderOperationalDate')
    expect(dashboardFullSource).toContain('matchesDashboardDate')
    expect(dashboardFullSource).toContain('const selectedDateOrders = computed(() =>')
    expect(dashboardFullSource).toContain('const businessDateOrders = computed(() =>')
    expect(dashboardSource).not.toContain('order.orderDate === businessDateKey.value || order.arrivalDate === businessDateKey.value')
  })

  it('uses the same operational date bucket for dashboard operation card counts', () => {
    expect(dashboardFullSource).toContain('const todayOperationCards = computed<DashboardOperationCard[]>(() =>')
    expect(dashboardFullSource).toContain('selectedDateOrders.value.filter(')
    expect(dashboardSource).not.toContain("order.arrivalDate === selectedDateValue.value && ['待确认', '已确认', '拍摄中'].includes(order.status)")
  })

  it('scopes pending task notice to the selected operational day', () => {
    expect(dashboardFullSource).toContain('const pendingTaskNotice = computed(() =>')
    expect(dashboardFullSource).toContain('const pending = selectedDateOrders.value.filter(')
    expect(dashboardSource).not.toContain("const pending = appStore.orders.filter(order => order.status === '待确认').length")
  })

  it('ranks products by reservation count from existing store data', () => {
    expect(productRankingSource).toContain('产品排行')
    expect(dashboardBusinessInsightsSource).toContain('backendApi.dashboardProductRanking')
    expect(dashboardBusinessInsightsSource).toContain('effectiveProductRanking')
    expect(dashboardBusinessInsightsSource).toContain('productRankingMode')
  })

  it('provides quick entry cards with copy and a deep link to share links', () => {
    expect(dashboardFullSource).toContain('快捷入口')
    expect(dashboardFullSource).toContain('quickEntries')
    expect(dashboardFullSource).toContain('buildWorkbenchUrl')
    expect(dashboardFullSource).toContain('buildEntryPayload')
    expect(dashboardFullSource).toContain('appStore.selectionLinks')
    expect(dashboardFullSource).toContain('copyEntryUrl')
    expect(dashboardFullSource).toContain('@copy-entry="copyEntryUrl"')
    expect(dashboardQuickEntriesSource).toContain('@click.stop="$emit(\'copy-entry\', entry.key, entry.url)"')
    expect(dashboardFullSource).toContain('openQuickEntry')
    expect(dashboardFullSource).toContain("key: 'booking'")
    expect(dashboardFullSource).toContain("key: 'selection'")
    expect(dashboardFullSource).toContain("key: 'pickup'")
    expect(dashboardFullSource).toContain("entryType: 'BOOKING'")
    expect(dashboardFullSource).toContain("entryType: 'PICKUP'")
    expect(dashboardFullSource).toContain("channel: 'WECHAT'")
    expect(dashboardFullSource).toContain("path: '/service/selection'")
  })

  it('loads dashboard conversion from the backend read model and keeps a local fallback', () => {
    expect(dashboardSource).toContain('DashboardConversion')
    expect(dashboardBusinessInsightsSource).toContain('backendApi.dashboardConversion')
    expect(dashboardBusinessInsightsSource).toContain('bookedCount')
    expect(dashboardBusinessInsightsSource).toContain('completedCount')
    expect(dashboardBusinessInsightsSource).toContain('completedRate')
  })

  it('turns dashboard empty controls into real navigation actions', () => {
    expect(dashboardFullSource).toContain('goDailyReport')
    expect(dashboardFullSource).toContain("path: '/report/store-daily'")
    expect(dashboardFullSource).toContain('trendGranularity')
    expect(dashboardFullSource).toContain('toggleTrendGranularity')
    expect(dashboardFullSource).toContain('openSlotFilter')
    expect(dashboardFullSource).toContain("query: { date: selectedDateValue.value, storeId: selectedDashboardStoreBackendId.value }")
  })

  it('uses sans font for section headings instead of serif for a modern admin look', () => {
    expect(dashboardSource).not.toMatch(/font-serif font-bold[^>]*>门店运营看板/)
    expect(dashboardFullSource).toContain('text-[26px] font-sans font-bold')
  })

  it('adds lucide icons to operation cards and uses Chinese scope labels', () => {
    expect(dashboardFullSource).toContain('Camera')
    expect(dashboardFullSource).toContain('UploadCloud')
    expect(dashboardFullSource).toContain('MousePointerClick')
    expect(dashboardFullSource).toContain('Send')
    expect(dashboardFullSource).toContain("scope: '订单'")
    expect(dashboardFullSource).toContain("scope: '相册'")
    expect(dashboardFullSource).toContain("scope: '选片'")
    expect(dashboardFullSource).toContain("scope: '交付'")
    expect(dashboardSource).not.toContain("scope: 'ORDER'")
    expect(dashboardSource).not.toContain("scope: 'ALBUM'")
  })

  it('deep-links every dashboard aggregate into a real workbench page', () => {
    expect(dashboardFullSource).toContain('openOperationCard')
    expect(dashboardFullSource).toContain('openStatusCard')
    expect(dashboardFullSource).toContain('openProductRanking')
    expect(dashboardFullSource).toContain('openChannelSummary')
    expect(dashboardFullSource).toContain('openDashboardSlot')
    expect(dashboardFullSource).toContain('@open-operation="openOperationCard"')
    expect(dashboardFullSource).toContain('@open-status="openStatusCard"')
    expect(dashboardOperationsPanelSource).toContain('@click="$emit(\'open-operation\', item)"')
    expect(dashboardOperationsPanelSource).toContain('@click="$emit(\'open-status\', item)"')
    expect(productRankingSource).toContain('@click="$emit(\'open-product\',')
    expect(dashboardFullSource).toContain('@open-channel="openChannelSummary"')
    expect(dashboardFullSource).toContain('@open-dashboard-slot="openDashboardSlot"')
    expect(dashboardScheduleSectionSource).toContain('@select-slot="emit(\'open-dashboard-slot\', $event)"')
    expect(dashboardFullSource).toContain("path: '/order/appointment'")
    expect(dashboardFullSource).toContain("path: '/service/photos'")
    expect(dashboardFullSource).toContain("path: '/service/selection'")
    expect(dashboardFullSource).toContain("needsUpload: '1'")
    expect(dashboardFullSource).toContain('aservice: product')
    expect(dashboardFullSource).toContain('asource: source')
    expect(dashboardFullSource).toContain('statusTab: item.key')
  })

  it('opens empty dashboard appointment slots as prefilled staff booking', () => {
    expect(dashboardFullSource).toContain('StaffBookingModal')
    expect(dashboardFullSource).toContain('dashboardStaffBookingOpen')
    expect(dashboardFullSource).toContain('slot.orderNos.length === 0')
    expect(dashboardFullSource).toContain('storeName: slot.storeNames[0]')
    expect(dashboardFullSource).toContain('serviceGroupId: slot.serviceGroupBackendIds[0]')
    expect(dashboardFullSource).toContain('startTime: slot.time')
    expect(dashboardFullSource).toContain('endTime: slot.endTime || undefined')
  })

  it('routes full or conflicted dashboard slots to inventory before allowing staff booking', () => {
    expect(dashboardFullSource).toContain('dashboardSelectedSlotBlocked')
    expect(dashboardFullSource).toContain('dashboardSelectedSlotBlockedReason')
    expect(dashboardFullSource).toContain('conflictOnly: dashboardSelectedSlot.value.conflictCount > 0 ? \'1\' : undefined')
    expect(dashboardFullSource).toContain("returnTo: 'staffBooking'")
    expect(dashboardFullSource).toContain('serviceGroupId: dashboardSelectedSlot.value.serviceGroupBackendIds[0]')
    expect(dashboardFullSource).toContain('dashboardSelectedSlotBlocked ? goDashboardSelectedSlotInventory() : openDashboardStaffBookingFromSelectedSlot()')
  })

  it('restores a selected dashboard slot from slot deep links', () => {
    expect(dashboardFullSource).toContain('applyFromQuery()')
    expect(dashboardFullSource).toContain("slotStart = get('slotStart')")
    expect(dashboardFullSource).toContain("slotEnd = get('slotEnd')")
    expect(dashboardFullSource).toContain('dashboardSelectedSlot.value = slot')
    expect(dashboardFullSource).toContain('dashboardSlotSelectionError.value = \'\'')
    expect(dashboardFullSource).toContain('watch(() => route.fullPath')
    expect(dashboardFullSource).toContain('dashboardDeepLinkSlot.value.start')
    expect(dashboardFullSource).toContain('storeBackendId: selectedDashboardStoreBackendId.value')
    expect(dashboardFullSource).toContain('await nextTick()')
    expect(dashboardFullSource).toContain('slotStart: dashboardDeepLinkSlot.value.start')
    expect(dashboardFullSource).toContain('slotEnd: dashboardDeepLinkSlot.value.end')
    expect(dashboardFullSource).toContain('() => dashboardDeepLinkSlot.value.start')
    expect(dashboardFullSource).toContain('() => dashboardDeepLinkSlot.value.end')
    expect(dashboardFullSource).toContain('}, { immediate: true })')
    expect(dashboardFullSource).toContain('candidateSlots')
    expect(dashboardFullSource).toContain('scoreDashboardDeepLinkSlot')
    expect(dashboardFullSource).toContain('slot.orderCount > 0')
    expect(dashboardFullSource.indexOf("slotStart = get('slotStart')")).toBeLessThan(dashboardFullSource.indexOf("if (date && isDateKey(date)) selectedDate.value = date"))
    expect(dashboardFullSource).toContain('restoreDashboardSlotFromQuery()')
  })

  it('opens occupied dashboard slots into scoped slot detail before drilling into orders', () => {
    expect(dashboardFullSource).toContain('dashboardSelectedSlot')
    expect(dashboardFullSource).toContain('dashboardSelectedSlotOrders')
    expect(dashboardFullSource).toContain('SlotDetailPanel')
    expect(dashboardFullSource).toContain(':slot="dashboardSelectedSlot"')
    expect(dashboardFullSource).toContain(':orders="dashboardSelectedSlotOrders"')
    expect(dashboardFullSource).toContain(':format-clock="formatDashboardClock"')
    expect(dashboardFullSource).toContain('@open-dashboard-selected-slot-order="openDashboardSelectedSlotOrder"')
    expect(dashboardScheduleSectionSource).toContain('@open-order="emit(\'open-dashboard-selected-slot-order\', $event)"')
    expect(dashboardFullSource).toContain('orderId')
    expect(dashboardFullSource).toContain('slotOriginDate: selectedDateValue.value')
    expect(dashboardFullSource).toContain('slotOriginStoreId: selectedDashboardStoreBackendId.value || undefined')
    expect(dashboardFullSource).toContain('item.bookingId')
    expect(dashboardFullSource).toContain("buildDateOrderQuery(selectedDateValue.value, { quick: 'all' })")
    expect(dashboardSource).not.toContain("buildDateOrderQuery(selectedDateValue.value, { q: keyword, quick: 'all' })")
    expect(dashboardFullSource).toContain('if (slot.orderCount > 0)')
    expect(dashboardFullSource).toContain('dashboardSelectedSlot.value = slot')
    expect(dashboardSource).not.toContain("buildDateOrderQuery(selectedDateValue.value, { q: slot.orderNos[0], quick: 'all' })")
  })

  it('shows service group capacity breakdown in dashboard slot detail', () => {
    expect(dashboardFullSource).toContain('dashboardSelectedSlotServiceBreakdown')
    expect(dashboardFullSource).toContain(':service-breakdown="dashboardSelectedSlotServiceBreakdown"')
    expect(slotDetailPanelSource).toContain('服务组拆分')
    expect(slotDetailPanelSource).toContain('group.capacityLabel')
    expect(slotDetailPanelSource).toContain('group.remainingCount')
    expect(slotDetailPanelSource).toContain('group.conflictCount')
    expect(dashboardFullSource).toContain('dashboardSelectedSlot.value?.serviceGroupBreakdown')
  })

  it('shows concrete arrival time in the dashboard slot detail order list', () => {
    expect(dashboardFullSource).toContain(':format-clock="formatDashboardClock"')
    expect(slotDetailPanelSource).toContain('<span>到店</span>')
    expect(slotDetailPanelSource).toContain('formatClock(item.startAt) || item.bookingStatus')
    expect(slotDetailPanelSource).toContain('<span>状态</span>')
  })

  it('handles ambiguous empty dashboard slots explicitly before opening staff booking', () => {
    expect(dashboardFullSource).toContain('dashboardSlotSelectionError')
    expect(dashboardFullSource).toContain('slot.storeBackendIds.length !== 1')
    expect(dashboardFullSource).toContain('slot.serviceGroupBackendIds.length !== 1')
    expect(dashboardFullSource).toContain('请先按门店筛选或进入排期页选择具体服务组')
  })

  it('uses the reference-style appointment overview on the dashboard', () => {
    expect(dashboardFullSource).toContain('JianyueSlotGrid')
    expect(dashboardFullSource).toContain('dashboardSlotGroups')
    expect(dashboardFullSource).toContain('buildJianyueSlotGroups')
    expect(dashboardFullSource).toContain('selectedDate: selectedDateValue.value')
    expect(dashboardFullSource).toContain('selectedStoreBackendId: selectedDashboardStoreBackendId.value')
    expect(dashboardFullSource).toContain('上午 / 下午 / 晚上')
    expect(dashboardFullSource).toContain('appStore.bookingInventory')
    expect(dashboardFullSource).toContain('appStore.loadBookingInventory')
  })

  it('uses reference-style service order status groups instead of internal workflow labels', () => {
    expect(dashboardFullSource).toContain('serviceStatusCards')
    expect(dashboardFullSource).toContain('buildOrderStatusGroupCounts(selectedDateOrders.value)')
    expect(dashboardFullSource).toContain("item.key !== '待支付'")
    expect(dashboardFullSource).toContain('key: item.key')
    expect(dashboardSource).not.toContain("const fallback = ['待确认', '已确认', '拍摄中', '选片中']")
  })

  it('uses rounded-md cards with consistent section heading sizes for a dense admin look', () => {
    expect(dashboardFullSource).toContain('rounded-md')
    expect(dashboardFullSource).toContain('text-[26px] font-sans font-bold')
    expect(dashboardFullSource).toContain('border-hairline/70')
    expect(dashboardFullSource).toContain('tabular-nums')
  })

  it('uses staff-facing Chinese labels for trend and slot detail sections', () => {
    expect(dashboardFullSource).toContain('预约趋势')
    expect(dashboardFullSource).toContain('时段详情')
    expect(dashboardSource).not.toContain('Booking Trend')
    expect(dashboardSource).not.toContain('Slot Detail')
  })

  it('uses semantic color tokens for status and chart colors', () => {
    // Dashboard uses StatusBadge component in DashboardInventoryConflicts
    expect(inventoryConflictsSource).toContain('StatusBadge')
    expect(inventoryConflictsSource).toContain('tone="danger"')
  })
})
