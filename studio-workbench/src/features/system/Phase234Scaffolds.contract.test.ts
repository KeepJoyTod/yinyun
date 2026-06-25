import { describe, expect, it } from 'vitest'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import { phase234ModuleScaffolds, phase234ModulesByFeature, phase234ModulesByPhase } from './phase234ModuleScaffolds'
import phaseRegistrySource from './phase234ModuleScaffolds.ts?raw'

describe('phase 2~4 scaffold registry contract', () => {
  it('keeps one aggregate registry instead of duplicating phase test files per domain', () => {
    expect(phaseRegistrySource).toContain('memberScaffolds')
    expect(phaseRegistrySource).toContain('marketingScaffolds')
    expect(phaseRegistrySource).toContain('resourceScaffolds')
    expect(phaseRegistrySource).toContain('reportScaffolds')
    expect(phaseRegistrySource).toContain('collaborationScaffolds')
    expect(phaseRegistrySource).toContain('serviceProductionScaffolds')
    expect(phaseRegistrySource).toContain('platformSettingsScaffolds')
    expect(phaseRegistrySource).toContain('accountCenterScaffolds')
    expect(phaseRegistrySource).toContain('financeCenterScaffolds')
    expect(phaseRegistrySource).toContain('toolScaffolds')
  })

  it('maps every phase registry entry back to a real workbench feature and layered owner metadata', () => {
    const featureKeys = phase234ModuleScaffolds.map(item => item.featureKey)
    expect(new Set(featureKeys).size).toBe(featureKeys.length)

    for (const item of phase234ModuleScaffolds) {
      const feature = getWorkbenchFeature(item.featureKey)
      expect(feature?.path).toBe(item.routes[0])
      expect(item.ownerLayers.presentation.length).toBeGreaterThan(0)
      expect(item.ownerLayers.control.length).toBeGreaterThan(0)
      expect(item.ownerLayers.data.length).toBeGreaterThan(0)
      expect(phase234ModulesByFeature[item.featureKey]?.title).toBe(item.title)
    }
  })

  it('keeps phase slicing explicit across fulfillment, operator center, and governance modules', () => {
    expect(phase234ModulesByPhase.phase2.length).toBeGreaterThanOrEqual(20)
    expect(phase234ModulesByPhase.phase3.length).toBeGreaterThanOrEqual(10)
    expect(phase234ModulesByPhase.phase4.length).toBeGreaterThanOrEqual(5)
    expect(phase234ModulesByFeature['member-accounts']?.phase).toBe('Phase 2')
    expect(phase234ModulesByFeature['platform-brand-info']?.phase).toBe('Phase 3')
    expect(phase234ModulesByFeature['platform-service-packages']?.phase).toBe('Phase 4')
    expect(phase234ModulesByFeature['collaboration-open-settings']?.phase).toBe('Phase 4')
  })

  it('keeps phase 3 scaffold pages carrying runtime layer metadata', () => {
    for (const key of ['tool-sample-works', 'platform-brand-info', 'account-profile', 'finance-overview']) {
      const item = phase234ModulesByFeature[key]
      expect(item?.ownerStatus).toBe('building')
      expect(item?.ownerLayers.presentation[0]).toContain('studio-workbench/src/features/')
      expect(item?.ownerLayers.control[0]).toContain('studio-workbench/src/shared/api/')
      expect(item?.ownerLayers.data.length).toBeGreaterThan(0)
    }
  })
})
