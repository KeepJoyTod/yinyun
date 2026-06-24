import { describe, expect, it } from 'vitest'
import brandInfoSource from './PlatformBrandInfoView.vue?raw'
import integrationSource from './PlatformIntegrationView.vue?raw'
import bookingSource from './PlatformBookingPolicyView.vue?raw'
import notificationSource from './PlatformNotificationCenterView.vue?raw'
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
    expect(scaffoldsSource).toContain('backendPlatformApi.ts')
  })
})
