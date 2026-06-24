import { describe, expect, it } from 'vitest'
import moduleScaffoldSource from './moduleScaffold.ts?raw'

describe('module scaffold contract', () => {
  it('derives scaffold runtime state from feature registry and access store', () => {
    expect(moduleScaffoldSource).toContain('getWorkbenchFeature')
    expect(moduleScaffoldSource).toContain('getEffectiveFeatureStatus')
    expect(moduleScaffoldSource).toContain('canAccessWorkbenchFeature')
    expect(moduleScaffoldSource).toContain('storeScopeLabel')
    expect(moduleScaffoldSource).toContain('permissionCode')
  })
})
