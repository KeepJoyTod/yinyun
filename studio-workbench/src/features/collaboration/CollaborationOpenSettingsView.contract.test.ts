import { describe, expect, it } from 'vitest'
import viewSource from './CollaborationOpenSettingsView.vue?raw'
import composableSource from './composables/useCollaborationOpenSettings.ts?raw'

describe('collaboration open settings contract', () => {
  it('keeps the page on the collaboration owner chain instead of the service production facade', () => {
    expect(viewSource).toContain('useCollaborationOpenSettings')
    expect(composableSource).toContain('collaborationStore.loadLicenses()')
    expect(composableSource).toContain('collaborationStore.saveLicense(')
    expect(composableSource).toContain('collaborationStore.bindLicenseStore(')
    expect(composableSource).toContain('collaborationStore.unbindLicenseStore(')
    expect(viewSource).not.toContain('useServiceProduction')
    expect(composableSource).not.toContain('loadLicenseBindings')
    expect(composableSource).not.toContain('saveLicenseBinding')
  })

  it('loads feature scope before the real license list and keeps advisory license access', () => {
    expect(composableSource).toContain("backendApi.listFeatureScopes([featureKey])")
    expect(composableSource).toContain("licenseMode: 'advisory'")
    expect(viewSource).toContain('FeatureGateStatusCard')
  })
})
