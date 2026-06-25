import { accountCenterScaffolds } from '../account-center/accountCenterScaffolds'
import { collaborationScaffolds } from '../collaboration/collaborationScaffolds'
import { financeCenterScaffolds } from '../finance-center/financeCenterScaffolds'
import { marketingScaffolds } from '../marketing/marketingScaffolds'
import { memberScaffolds } from '../member/memberScaffolds'
import { platformSettingsScaffolds } from '../platform-settings/platformSettingsScaffolds'
import { reportScaffolds } from '../reports/reportScaffolds'
import { resourceScaffolds } from '../resources/resourceScaffolds'
import { serviceProductionScaffolds } from '../service-production/serviceProductionScaffolds'
import { toolScaffolds } from '../tools/toolScaffolds'
import { collectPhaseModuleScaffolds, groupPhaseModulesByPhase, mapPhaseModulesByFeature } from './phaseModuleRegistry'

const phase3ToolScaffolds = toolScaffolds.map(item => ({
  ...item,
  phase: 'Phase 3' as const,
  ownerStatus: 'building' as const,
  ownerLayers: {
    presentation: ['studio-workbench/src/features/tools'],
    control: ['studio-workbench/src/shared/api/backendPlatformApi.ts'],
    data: item.ledgers,
  },
}))

const phase3PlatformScaffolds = platformSettingsScaffolds.map(item => ({
  ...item,
  phase: item.featureKey === 'platform-service-packages' ? 'Phase 4' as const : 'Phase 3' as const,
  ownerStatus: 'building' as const,
  ownerLayers: {
    presentation: ['studio-workbench/src/features/platform-settings'],
    control: ['studio-workbench/src/shared/api/backendPlatformApi.ts'],
    data: item.ledgers,
  },
}))

const phase3AccountScaffolds = accountCenterScaffolds.map(item => ({
  ...item,
  phase: 'Phase 3' as const,
  ownerStatus: 'building' as const,
  ownerLayers: {
    presentation: ['studio-workbench/src/features/account-center'],
    control: ['studio-workbench/src/shared/api/backendAccountApi.ts'],
    data: item.ledgers,
  },
}))

const phase3FinanceScaffolds = financeCenterScaffolds.map(item => ({
  ...item,
  phase: 'Phase 3' as const,
  ownerStatus: 'building' as const,
  ownerLayers: {
    presentation: ['studio-workbench/src/features/finance-center'],
    control: ['studio-workbench/src/shared/api/backendFinanceApi.ts'],
    data: item.ledgers,
  },
}))

export const phase234ModuleScaffolds = collectPhaseModuleScaffolds(
  memberScaffolds,
  marketingScaffolds,
  resourceScaffolds,
  reportScaffolds,
  collaborationScaffolds,
  serviceProductionScaffolds,
  phase3ToolScaffolds,
  phase3PlatformScaffolds,
  phase3AccountScaffolds,
  phase3FinanceScaffolds,
)

export const phase234ModulesByFeature = mapPhaseModulesByFeature(phase234ModuleScaffolds)
export const phase234ModulesByPhase = groupPhaseModulesByPhase(phase234ModuleScaffolds)
