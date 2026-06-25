import { defineModuleScaffold } from '../system/moduleScaffold'

const toolOwnerLayers = (data: string[]) => ({
  presentation: ['studio-workbench/src/features/tools'],
  control: ['studio-workbench/src/shared/api/backendToolsApi.ts'],
  data,
})

export const sampleWorksScaffold = defineModuleScaffold({
  featureKey: 'tool-sample-works',
  domain: '工具中心',
  title: '样片作品',
  summary: '为样片作品、公开展示授权和上下架策略建立独立 owner。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/tools',
  nextPhase: 'Phase 3 接真实样片作品、相册授权和公开发布规则。',
  routes: ['/tools/sample-works'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendToolsApi.ts',
  ],
  apis: ['backendApi.listToolSampleWorks()', 'backendApi.publishToolSampleWork()'],
  ledgers: ['样片作品授权记录', '相册公开发布证据'],
  ownerLayers: toolOwnerLayers(['样片作品授权记录', '相册公开发布证据']),
})

export const precisionDeliveryScaffold = defineModuleScaffold({
  featureKey: 'tool-precision-delivery',
  domain: '工具中心',
  title: '精准投放',
  summary: '为会员圈选、微信触达、优惠券投放和触达日志建立独立 owner。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/tools',
  nextPhase: 'Phase 3 接真实人群圈选、投放任务和触达日志。',
  routes: ['/tools/precision-delivery'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendToolsApi.ts',
  ],
  apis: ['backendApi.getPrecisionDeliverySummary()', 'backendApi.listPrecisionDeliveryTasks()'],
  ledgers: ['投放任务账本', '触达结果日志'],
  ownerLayers: toolOwnerLayers(['投放任务账本', '触达结果日志']),
})

export const toolScaffolds = [
  sampleWorksScaffold,
  precisionDeliveryScaffold,
]
