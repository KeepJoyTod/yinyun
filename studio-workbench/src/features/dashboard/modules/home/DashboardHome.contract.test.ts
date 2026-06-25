import { describe, expect, it } from 'vitest'
import dashboardHomeViewSource from './DashboardHomeView.vue?raw'
import dashboardHomeStateSource from './composables/useDashboardHomeState.ts?raw'
import dashboardHomeRoutingSource from './composables/useDashboardHomeRouting.ts?raw'
import dashboardHomeExportSource from './composables/useDashboardHomeExport.ts?raw'
import dashboardHomeOperationsSource from './dashboardHomeOperations.ts?raw'
import dashboardHomeInsightsSource from './composables/useDashboardHomeInsights.ts?raw'
import dashboardOperationsPanelSource from '../../DashboardOperationsPanel.vue?raw'
import dashboardFinanceOverviewSource from '../../DashboardFinanceOverview.vue?raw'
import dashboardQuickEntriesSource from '../../DashboardQuickEntries.vue?raw'
import dashboardScheduleSectionSource from '../../DashboardScheduleSection.vue?raw'

const dashboardHomeFullSource = [
  dashboardHomeViewSource,
  dashboardHomeStateSource,
  dashboardHomeRoutingSource,
  dashboardHomeExportSource,
  dashboardHomeOperationsSource,
  dashboardHomeInsightsSource,
].join('\n')

describe('dashboard home owner contract', () => {
  it('mounts the existing dashboard panels from a dedicated owner view', () => {
    expect(dashboardHomeViewSource).toContain('DashboardOperationsPanel')
    expect(dashboardHomeViewSource).toContain('DashboardFinanceOverview')
    expect(dashboardHomeViewSource).toContain('DashboardScheduleSection')
    expect(dashboardHomeViewSource).toContain('DashboardQuickEntries')
    expect(dashboardHomeViewSource).toContain('StaffBookingModal')
    expect(dashboardHomeViewSource).toContain('useDashboardHomeState')
  })

  it('keeps dashboard state orchestration in the owner composable', () => {
    expect(dashboardHomeStateSource).toContain('useDashboardSelectionScope')
    expect(dashboardHomeStateSource).toContain('useDashboardOrderScope')
    expect(dashboardHomeStateSource).toContain('useDashboardOperationCards')
    expect(dashboardHomeStateSource).toContain('useDashboardHomeInsights')
    expect(dashboardHomeStateSource).toContain('useDashboardHomeExport')
    expect(dashboardHomeStateSource).toContain('useDashboardHomeRouting')
    expect(dashboardHomeStateSource).toContain('useDashboardSlotDetail')
    expect(dashboardHomeStateSource).toContain('useDashboardSummaries')
    expect(dashboardHomeStateSource).toContain('watch([selectedDateValue, selectedDashboardStoreId]')
  })

  it('reloads dashboard data from the existing compatible facades', () => {
    expect(dashboardHomeStateSource).toContain('appStore.loadReportOrders(buildDashboardOrderQuery(date))')
    expect(dashboardHomeStateSource).toContain('appStore.loadDashboardStats(date, selectedDashboardStoreScopeId.value)')
    expect(dashboardHomeStateSource).toContain('appStore.loadSchedule(date, selectedDashboardStoreName.value, selectedDashboardStoreScopeId.value)')
    expect(dashboardHomeStateSource).toContain('appStore.loadBookingInventory({ date, storeBackendId: selectedDashboardStoreScopeId.value })')
    expect(dashboardHomeStateSource).toContain('appStore.trendStats')
  })

  it('keeps route query sync and slot deep links in a dedicated routing composable', () => {
    expect(dashboardHomeRoutingSource).toContain('useRouteQueryFilters')
    expect(dashboardHomeRoutingSource).toContain("selectedDate.value === todayKey ? '' : selectedDate.value")
    expect(dashboardHomeRoutingSource).toContain("const slotStart = get('slotStart')")
    expect(dashboardHomeRoutingSource).toContain("const slotEnd = get('slotEnd')")
    expect(dashboardHomeRoutingSource).toContain('watch(')
    expect(dashboardHomeRoutingSource).toContain('route.fullPath')
  })

  it('keeps export state and download flow in a dedicated export composable', () => {
    expect(dashboardHomeExportSource).toContain('dashboardExportRangeDays')
    expect(dashboardHomeExportSource).toContain('dashboardExportInvalidRange')
    expect(dashboardHomeExportSource).toContain('appStore.exportDashboard({')
    expect(dashboardHomeExportSource).toContain('storeId: dashboardExportStoreId.value || undefined')
    expect(dashboardHomeExportSource).toContain('channelType: dashboardExportChannelType.value || undefined')
    expect(dashboardHomeExportSource).toContain('buildDashboardExportFallbackName')
  })

  it('keeps dashboard-specific pure functions in the owner operations file', () => {
    expect(dashboardHomeOperationsSource).toContain('buildDashboardDateTabs')
    expect(dashboardHomeOperationsSource).toContain('buildChannelOrderSummary')
    expect(dashboardHomeOperationsSource).toContain('buildDashboardExportRangeDays')
    expect(dashboardHomeOperationsSource).toContain('isDashboardExportInvalidRange')
    expect(dashboardHomeOperationsSource).toContain('buildDashboardExportFallbackName')
  })

  it('keeps business insights in the owner module instead of the page shell', () => {
    expect(dashboardHomeInsightsSource).toContain('backendApi.dashboardProductRanking')
    expect(dashboardHomeInsightsSource).toContain('backendApi.dashboardConversion')
    expect(dashboardHomeInsightsSource).toContain('buildEntryPayload')
    expect(dashboardHomeInsightsSource).toContain('appStore.selectionLinks')
    expect(dashboardHomeFullSource).toContain('quickEntries')
    expect(dashboardHomeFullSource).toContain('copyEntryUrl')
  })

  it('preserves panel contracts while the owner becomes modular', () => {
    expect(dashboardOperationsPanelSource).toContain('@select="$emit(\'select-date\', $event)"')
    expect(dashboardOperationsPanelSource).toContain('@shift="$emit(\'shift-date\', $event)"')
    expect(dashboardFinanceOverviewSource).toContain("$emit('export-dashboard')")
    expect(dashboardQuickEntriesSource).toContain('@click.stop="$emit(\'copy-entry\', entry.key, entry.url)"')
    expect(dashboardScheduleSectionSource).toContain("@select-slot=\"emit('open-dashboard-slot', $event)\"")
  })
})
