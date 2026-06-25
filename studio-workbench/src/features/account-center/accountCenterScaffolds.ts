import { defineModuleScaffold } from '../system/moduleScaffold'

const accountOwnerLayers = (data: string[]) => ({
  presentation: ['studio-workbench/src/features/account-center'],
  control: ['studio-workbench/src/shared/api/backendAccountApi.ts'],
  data,
})

export const accountProfileScaffold = defineModuleScaffold({
  featureKey: 'account-profile',
  domain: '账号中心',
  title: '个人中心',
  summary: '统一承接账号资料、密码、手机号、微信解绑等个人资料入口。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/account-center',
  nextPhase: 'Phase 3 接真实账号资料、校验流程和安全审计。',
  routes: ['/account/profile'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendAccountApi.ts',
  ],
  apis: ['backendApi.getAccountProfile()', 'backendApi.updateAccountProfile()'],
  ledgers: ['账号资料账本', '安全审计日志'],
  ownerLayers: accountOwnerLayers(['账号资料账本', '安全审计日志']),
})

export const accountBrandsScaffold = defineModuleScaffold({
  featureKey: 'account-brands',
  domain: '账号中心',
  title: '我的品牌',
  summary: '统一承接品牌切换、默认品牌和账号可见范围的 owner 模块。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/account-center',
  nextPhase: 'Phase 3 接真实品牌授权关系、门店范围和切换审计。',
  routes: ['/account/brands'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendAccountApi.ts',
  ],
  apis: ['backendApi.listAccountBrands()', 'backendApi.switchAccountBrand()'],
  ledgers: ['品牌授权关系', '品牌切换审计日志'],
  ownerLayers: accountOwnerLayers(['品牌授权关系', '品牌切换审计日志']),
})

export const accountHelpCenterScaffold = defineModuleScaffold({
  featureKey: 'account-help',
  domain: '账号中心',
  title: '帮助中心',
  summary: '统一承接帮助文档、产品版本说明和常见问题检索入口。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/account-center',
  nextPhase: 'Phase 3 接真实帮助中心文章、搜索和版本发布记录。',
  routes: ['/account/help'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendAccountApi.ts',
  ],
  apis: ['backendApi.listHelpCenterArticles()'],
  ledgers: ['帮助中心文章索引', '版本发布记录'],
  ownerLayers: accountOwnerLayers(['帮助中心文章索引', '版本发布记录']),
})

export const accountCenterScaffolds = [
  accountProfileScaffold,
  accountBrandsScaffold,
  accountHelpCenterScaffold,
]
