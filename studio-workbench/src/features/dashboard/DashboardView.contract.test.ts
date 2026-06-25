import { describe, expect, it } from 'vitest'
import dashboardSource from './DashboardView.vue?raw'
import dashboardHomeViewSource from './modules/home/DashboardHomeView.vue?raw'
import dashboardBusinessInsightsSource from './useDashboardBusinessInsights.ts?raw'
import dashboardPresentationSource from './dashboardPresentation.ts?raw'

describe('dashboard shell contract', () => {
  it('keeps DashboardView as a thin shell that mounts the home owner', () => {
    expect(dashboardSource).toContain('<DashboardHomeView />')
    expect(dashboardSource).toContain("import DashboardHomeView from './modules/home/DashboardHomeView.vue'")
    expect(dashboardHomeViewSource).toContain('useDashboardHomeState')
  })

  it('moves dashboard orchestration out of the page shell', () => {
    expect(dashboardSource).not.toContain('appStore.loadDashboardStats')
    expect(dashboardSource).not.toContain('useDashboardSelectionScope')
    expect(dashboardSource).not.toContain('exportDashboardSummary')
  })

  it('keeps legacy dashboard helpers as compatibility facades', () => {
    expect(dashboardBusinessInsightsSource).toContain('useDashboardHomeInsights as useDashboardBusinessInsights')
    expect(dashboardPresentationSource).toContain("from './modules/home/dashboardHomeOperations'")
  })
})
