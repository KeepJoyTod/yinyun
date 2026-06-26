import { describe, expect, it } from 'vitest'
import brandInfoSource from './PlatformBrandInfoView.vue?raw'
import integrationSource from './PlatformIntegrationView.vue?raw'
import loginRiskSource from './PlatformLoginRiskView.vue?raw'
import openApiSource from './PlatformOpenApiView.vue?raw'
import taskCenterSource from './PlatformTaskCenterView.vue?raw'
import bookingSource from './PlatformBookingPolicyView.vue?raw'
import notificationSource from './PlatformNotificationCenterView.vue?raw'
import backupRecoverySource from './PlatformBackupRecoveryView.vue?raw'
import meituanReviewTraceSource from './PlatformMeituanReviewTraceView.vue?raw'
import servicePackagesSource from './PlatformServicePackagesView.vue?raw'
import phase1PanelSource from './components/PlatformPhase1StatusPanel.vue?raw'
import composableSource from './composables/usePlatformSettingsList.ts?raw'
import scaffoldsSource from './platformSettingsScaffolds.ts?raw'

describe('platform settings scaffold contract', () => {
  it('uses the shared scaffold view for platform setting domains', () => {
    for (const source of [brandInfoSource, integrationSource, loginRiskSource, openApiSource, taskCenterSource, bookingSource, notificationSource, backupRecoverySource, meituanReviewTraceSource]) {
      expect(source).toContain('ModuleScaffoldView')
      expect(source).toContain('useModuleScaffold')
    }
    expect(scaffoldsSource).toContain("featureKey: 'platform-brand-info'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-login-risk'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-open-api'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-task-center'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-backup-recovery'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-meituan-review-trace'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-notification-center'")
    expect(scaffoldsSource).toContain("featureKey: 'platform-service-packages'")
    expect(scaffoldsSource).toContain("phase: 'Phase 3'")
    expect(scaffoldsSource).toContain("phase: 'Phase 4'")
    expect(scaffoldsSource).toContain('ownerLayers')
    expect(scaffoldsSource).toContain('backendPlatformApi.ts')
  })

  it('mounts phase1 read-only panels for platform facade domains', () => {
    expect(integrationSource).toContain('usePlatformIntegrationList')
    expect(loginRiskSource).toContain('usePlatformLoginRiskList')
    expect(openApiSource).toContain('usePlatformOpenApiList')
    expect(taskCenterSource).toContain('usePlatformAsyncTaskList')
    expect(notificationSource).toContain('usePlatformNotificationList')
    expect(backupRecoverySource).toContain('usePlatformBackupRecoveryList')
    expect(servicePackagesSource).toContain('usePlatformServicePackageList')
    expect(meituanReviewTraceSource).toContain('usePlatformMeituanReviewTraceList')
    expect(phase1PanelSource).toContain('Reload')
    expect(composableSource).toContain('backendApi.listPlatformIntegrations()')
    expect(composableSource).toContain('backendApi.listPlatformLoginRiskPolicies()')
    expect(composableSource).toContain('backendApi.listPlatformOpenApiApps()')
    expect(composableSource).toContain('backendApi.listPlatformAsyncTasks()')
    expect(composableSource).toContain('backendApi.listPlatformNotificationCenters()')
    expect(composableSource).toContain('backendApi.listPlatformBackupRecoveryPlans()')
    expect(composableSource).toContain('backendApi.listPlatformServicePackages()')
    expect(composableSource).toContain('backendApi.listPlatformMeituanReviewTraces()')
  })
})
