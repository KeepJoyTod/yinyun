import { defineModuleScaffold } from '../system/moduleScaffold'

export const sampleWorksScaffold = defineModuleScaffold({
  featureKey: 'tool-sample-works',
  domain: '工具中心',
  title: '样片作品',
  summary: '为样片作品、公开展示授权和上下架策略建立独立 owner。',
  owner: 'studio-workbench/src/features/tools',
  nextPhase: 'Phase 3 接真实样片作品、相册授权和公开发布规则。',
  routes: ['/tools/photo/sample'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['GET /yy/tools/sample-works', 'PUT /yy/tools/sample-works/publish'],
  ledgers: ['样片作品授权记录', '相册公开发布证据'],
})

export const precisionDeliveryScaffold = defineModuleScaffold({
  featureKey: 'tool-precision-delivery',
  domain: '工具中心',
  title: '精准投放',
  summary: '为会员圈选、微信触达、优惠券投放和触达日志建立独立 owner。',
  owner: 'studio-workbench/src/features/tools',
  nextPhase: 'Phase 3 接真实人群圈选、投放任务和触达日志。',
  routes: ['/tools/precision-delivery'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['GET /yy/tools/precision-delivery', 'POST /yy/tools/precision-delivery/tasks'],
  ledgers: ['投放任务账本', '触达结果日志'],
})
