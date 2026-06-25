import { describe, expect, it } from 'vitest'
import profileSource from './AccountProfileView.vue?raw'
import brandsSource from './AccountBrandsView.vue?raw'
import helpSource from './AccountHelpCenterView.vue?raw'
import scaffoldsSource from './accountCenterScaffolds.ts?raw'

describe('account center scaffold contract', () => {
  it('keeps account center pages on the shared scaffold owner', () => {
    for (const source of [profileSource, brandsSource, helpSource]) {
      expect(source).toContain('ModuleScaffoldView')
      expect(source).toContain('useModuleScaffold')
    }
    expect(scaffoldsSource).toContain("featureKey: 'account-profile'")
    expect(scaffoldsSource).toContain("featureKey: 'account-brands'")
    expect(scaffoldsSource).toContain("featureKey: 'account-help'")
    expect(scaffoldsSource).toContain("phase: 'Phase 3'")
    expect(scaffoldsSource).toContain('ownerLayers')
    expect(scaffoldsSource).toContain('backendAccountApi.ts')
  })
})
