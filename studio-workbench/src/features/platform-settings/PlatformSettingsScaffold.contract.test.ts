import { describe, expect, it } from 'vitest'
import brandInfoSource from './PlatformBrandInfoView.vue?raw'
import integrationSource from './PlatformIntegrationView.vue?raw'
import bookingSource from './PlatformBookingPolicyView.vue?raw'
import notificationSource from './PlatformNotificationCenterView.vue?raw'
import servicePackagesSource from './PlatformServicePackagesView.vue?raw'
import phase1PanelSource from './components/PlatformPhase1StatusPanel.vue?raw'
import composableSource from './composables/usePlatformSettingsList.ts?raw'
import scaffoldsSource from './platformSettingsScaffolds.ts?raw'

describe('platform settings scaffold contract', () => {
  it('uses the shared scaffold view for platform setting domains', () => {
    for (const source of [brandInfoSource, integrationSource, bookingSource, notificationSource]) {
      expect(source).toContain('ModuleScaffoldView')
      expect(source).toContain('useModuleScaffold')
    }
    expect(scaffoldsSource).toContain("featureKey: 'platform-brand-info'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-notification-center'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-service-packages'")
    expect(scaffoldsSource).toContain("phase: 'Phase 3'")
    expect(scaffoldsSource).toContain("phase: 'Phase 4'")
    expect(scaffoldsSource).toContain('ownerLayers')
    expect(scaffoldsSource).toContain('backendPlatformApi.ts')
  })

  it('mounts phase1 read-only panels for platform facade domains', () => {
    expect(integrationSource).toContain('usePlatformIntegrationList')
    expect(notificationSource).toContain('usePlatformNotificationList')
    expect(servicePackagesSource).toContain('usePlatformServicePackageList')
    expect(phase1PanelSource).toContain('Reload')
    expect(composableSource).toContain('backendApi.listPlatformIntegrations()')
    expect(composableSource).toContain('backendApi.listPlatformNotificationCenters()')
    expect(composableSource).toContain('backendApi.listPlatformServicePackages()')
  })
})
