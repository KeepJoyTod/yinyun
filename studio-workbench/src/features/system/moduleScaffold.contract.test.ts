import { describe, expect, it } from 'vitest'
import moduleScaffoldViewSource from './ModuleScaffoldView.vue?raw'
import moduleScaffoldSource from './moduleScaffold.ts?raw'

describe('module scaffold contract', () => {
  it('derives scaffold runtime state from feature registry and access store', () => {
    expect(moduleScaffoldSource).toContain('getWorkbenchFeature')
    expect(moduleScaffoldSource).toContain('getEffectiveFeatureStatus')
    expect(moduleScaffoldSource).toContain('canAccessWorkbenchFeature')
    expect(moduleScaffoldSource).toContain('storeScopeLabel')
    expect(moduleScaffoldSource).toContain('permissionCode')
  })

  it('exposes phase-aware three-layer owner metadata to shared scaffold pages', () => {
    expect(moduleScaffoldSource).toContain('ModuleScaffoldPhase')
    expect(moduleScaffoldSource).toContain('ModuleScaffoldOwnerLayers')
    expect(moduleScaffoldSource).toContain('ownerStatus')
    expect(moduleScaffoldSource).toContain('inventoryCodes?: string[]')
    expect(moduleScaffoldSource).toContain('acceptanceLabel?: string')
    expect(moduleScaffoldSource).toContain('boundaryNotes?: string[]')
    expect(moduleScaffoldSource).toContain('nextActions?: string[]')
    expect(moduleScaffoldSource).toContain("phase: config.phase ?? 'Phase 0'")
    expect(moduleScaffoldViewSource).toContain('{{ domain }} / {{ phase }} Scaffold')
    expect(moduleScaffoldViewSource).toContain('功能清单编号')
    expect(moduleScaffoldViewSource).toContain('边界说明')
    expect(moduleScaffoldViewSource).toContain('下一步动作')
    expect(moduleScaffoldViewSource).toContain('表现层 owner')
    expect(moduleScaffoldViewSource).toContain('控制逻辑层 owner')
    expect(moduleScaffoldViewSource).toContain('持久数据层 owner')
  })
})
