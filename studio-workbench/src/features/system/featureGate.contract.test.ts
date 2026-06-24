import { describe, expect, it } from 'vitest'
import featureGateSource from './featureGate.ts?raw'

describe('feature gate contract', () => {
  it('keeps unified permission, role, store, license, plugin and approval gate fields together', () => {
    expect(featureGateSource).toContain('canAccessWorkbenchFeature')
    expect(featureGateSource).toContain('studioAccessStore.rolePermissions')
    expect(featureGateSource).toContain('resolveLicenseState')
    expect(featureGateSource).toContain('pluginState')
    expect(featureGateSource).toContain('approvalState')
    expect(featureGateSource).toContain('storeScopeLabel')
  })
})
