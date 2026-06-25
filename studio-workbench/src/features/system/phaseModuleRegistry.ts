import type { WorkbenchFeatureStatus } from '../../app/router/featureRegistry'
import type { ModuleScaffoldConfig, ModuleScaffoldOwnerLayers } from './moduleScaffold'

export type FullProductPhase = 'Phase 2' | 'Phase 3' | 'Phase 4'

export type PhaseModuleScaffold = ModuleScaffoldConfig & {
  phase: FullProductPhase
  ownerStatus: WorkbenchFeatureStatus
  ownerLayers: ModuleScaffoldOwnerLayers
}

export const definePhaseModuleScaffold = (config: PhaseModuleScaffold) => config

export const collectPhaseModuleScaffolds = (...groups: readonly PhaseModuleScaffold[][]) => groups.flat()

export const mapPhaseModulesByFeature = (items: readonly PhaseModuleScaffold[]) =>
  Object.fromEntries(items.map(item => [item.featureKey, item]))

export const groupPhaseModulesByPhase = (items: readonly PhaseModuleScaffold[]) => ({
  phase2: items.filter(item => item.phase === 'Phase 2'),
  phase3: items.filter(item => item.phase === 'Phase 3'),
  phase4: items.filter(item => item.phase === 'Phase 4'),
})
