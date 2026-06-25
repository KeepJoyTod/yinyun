import { definePhaseModuleScaffold } from '../system/phaseModuleRegistry'

const serviceProductionBase = {
  phase: 'Phase 2' as const,
  ownerStatus: 'ready' as const,
  domain: '服务生产',
  owner: 'studio-workbench/src/features/service-production',
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendServiceProductionApi.ts',
  ],
  ownerLayers: {
    presentation: [
      'studio-workbench/src/features/service-production/RetouchCenterView.vue',
      'studio-workbench/src/features/service-production/RetouchProvidersView.vue',
    ],
    control: [
      'studio-workbench/src/features/service-production/composables/useServiceProduction.ts',
      'studio-workbench/src/features/service-production/serviceProductionOperations.ts',
      'studio-workbench/src/shared/api/backendServiceProductionApi.ts',
    ],
    data: ['yy_retouch_task', 'yy_retouch_provider', 'yy_collaboration_policy', 'yy_service_license_binding'],
  },
}

export const serviceProductionScaffolds = [
  definePhaseModuleScaffold({
    ...serviceProductionBase,
    featureKey: 'service-selection',
    title: '在线选片',
    summary: '在线选片继续以相册和底片事实为唯一来源，不在服务生产域复制第二套选片账本。',
    nextPhase: 'Phase 2 继续补选片提交、加修和交付节点联动。',
    routes: ['/service/selection'],
    apis: ['backendApi.listAlbums()', 'backendApi.updateSelectionStatus()'],
    ledgers: ['yy_photo_album', 'yy_photo_asset'],
    ownerLayers: {
      presentation: ['studio-workbench/src/features/selection/OnlineSelectionView.vue'],
      control: ['studio-workbench/src/shared/api/backend.ts', 'studio-workbench/src/shared/stores/appStore.ts'],
      data: ['yy_photo_album', 'yy_photo_asset'],
    },
  }),
  definePhaseModuleScaffold({
    ...serviceProductionBase,
    featureKey: 'service-photos',
    title: '客片管理',
    summary: '客片上传、整理、交付和访问日志继续收口到客片管理 owner。',
    nextPhase: 'Phase 2 继续补交付通知、客户确认和导出审计。',
    routes: ['/service/photos'],
    apis: ['backendApi.listPhotoAssets()', 'backendApi.listPhotoAccessLogs()', 'backendApi.batchUpdatePhotoAssets()'],
    ledgers: ['yy_photo_album', 'yy_photo_asset', 'yy_photo_access_log'],
    ownerLayers: {
      presentation: ['studio-workbench/src/features/albums/PhotoMgmtView.vue'],
      control: ['studio-workbench/src/shared/api/backend.ts', 'studio-workbench/src/shared/stores/appStore.ts'],
      data: ['yy_photo_album', 'yy_photo_asset', 'yy_photo_access_log'],
    },
  }),
  definePhaseModuleScaffold({
    ...serviceProductionBase,
    featureKey: 'service-retouch-center',
    title: '三方修图中心',
    summary: '修图任务队列、派单和验收继续走真实任务 owner。',
    nextPhase: 'Phase 2 继续补阻塞回滚、报价确认和到期提醒。',
    routes: ['/service/retouch-center'],
    apis: ['serviceProductionApi.listRetouchTasks()', 'serviceProductionApi.updateRetouchTask()'],
    ledgers: ['yy_retouch_task', 'yy_photo_album', 'yy_photo_asset'],
  }),
  definePhaseModuleScaffold({
    ...serviceProductionBase,
    featureKey: 'service-retouch-providers',
    title: '三方修图服务商',
    summary: '服务商资料、门店范围和接单规则继续走服务商 owner。',
    nextPhase: 'Phase 2 继续补资费、停用、门店范围和许可证联动。',
    routes: ['/service/retouch-providers'],
    apis: ['serviceProductionApi.listRetouchProviders()', 'serviceProductionApi.saveRetouchProvider()'],
    ledgers: ['yy_retouch_provider', 'yy_service_license_binding'],
  }),
]
