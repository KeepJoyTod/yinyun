import { definePhaseModuleScaffold } from '../system/phaseModuleRegistry'

const resourceBase = {
  phase: 'Phase 2' as const,
  domain: '资源',
  owner: 'studio-workbench/src/features/resources',
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendResourcesApi.ts',
  ],
  ownerLayers: {
    presentation: [
      'studio-workbench/src/features/resources/ResourceManageView.vue',
      'studio-workbench/src/features/resources/ResourceTagsView.vue',
      'studio-workbench/src/features/resources/ResourceUsageView.vue',
      'studio-workbench/src/features/resources/DerivedResourceModuleView.vue',
    ],
    control: ['studio-workbench/src/shared/api/backendResourcesApi.ts'],
    data: ['yy_photo_album', 'yy_photo_asset', 'yy_photo_tag', 'yy_photo_asset_tag'],
  },
}

export const resourceScaffolds = [
  definePhaseModuleScaffold({
    ...resourceBase,
    featureKey: 'resource-manage',
    ownerStatus: 'ready',
    title: '资源管理',
    summary: '底片资源、相册归属和客户可见边界继续统一收口到资源管理 owner。',
    nextPhase: 'Phase 2 继续补批量处理、公开边界审计和 OSS 排障闭环。',
    routes: ['/resource/manage'],
    apis: ['resourcesApi.listResources()', 'resourcesApi.batchUpdateResources()', 'resourcesApi.deleteResource()'],
    ledgers: ['yy_photo_album', 'yy_photo_asset'],
  }),
  definePhaseModuleScaffold({
    ...resourceBase,
    featureKey: 'resource-tags',
    ownerStatus: 'ready',
    title: '资源标签',
    summary: '资源标签字典、门店范围和标签计数继续走标签 owner。',
    nextPhase: 'Phase 2 继续补标签关联批处理和标签来源审计。',
    routes: ['/resource/tags'],
    apis: [
      'resourcesApi.listResourceTags()',
      'resourcesApi.createResourceTag()',
      'resourcesApi.updateResourceTag()',
      'resourcesApi.deleteResourceTag()',
    ],
    ledgers: ['yy_photo_tag', 'yy_photo_asset_tag'],
  }),
  definePhaseModuleScaffold({
    ...resourceBase,
    featureKey: 'resource-usage',
    ownerStatus: 'ready',
    title: '资源用量',
    summary: '容量、清理计划和配额配置统一收口到资源用量 owner。',
    nextPhase: 'Phase 2 继续补清理任务、导出和门店额度联动。',
    routes: ['/resource/usage'],
    apis: ['resourcesApi.getResourceUsageSummary()'],
    ledgers: ['yy_photo_asset', 'yy_photo_album'],
  }),
]
