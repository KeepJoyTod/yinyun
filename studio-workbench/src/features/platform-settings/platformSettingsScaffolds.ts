import { defineModuleScaffold } from '../system/moduleScaffold'

const platformOwnerLayers = (data: string[]) => ({
  presentation: ['studio-workbench/src/features/platform-settings'],
  control: ['studio-workbench/src/shared/api/backendPlatformApi.ts'],
  data,
})

export const platformBrandInfoScaffold = defineModuleScaffold({
  featureKey: 'platform-brand-info',
  domain: '平台设置',
  title: '品牌信息',
  summary: '统一维护品牌资料、LOGO 和分享展示信息。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实品牌资料、分享图和外显配置。',
  routes: ['/platform/brand-info'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.getPlatformBrandInfo()'],
  ledgers: ['品牌资料账本', '品牌外显审计记录'],
  ownerLayers: platformOwnerLayers(['品牌资料账本', '品牌外显审计记录']),
})

export const platformIntegrationScaffold = defineModuleScaffold({
  featureKey: 'platform-integration',
  domain: '平台设置',
  title: '平台对接',
  summary: '统一维护微信、抖音、美团等平台的接入 owner。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实渠道授权状态、Webhook、SPI 和证据导出。',
  routes: ['/platform/integration'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformIntegrations()'],
  ledgers: ['渠道授权账本', '平台对接证据'],
  ownerLayers: platformOwnerLayers(['渠道授权账本', '平台对接证据']),
})

export const platformBookingPolicyScaffold = defineModuleScaffold({
  featureKey: 'platform-booking-policy',
  domain: '平台设置',
  title: '预约设置',
  summary: '统一维护预约费用、自助改期和退单策略。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实预约规则、渠道差异化策略和门店范围。',
  routes: ['/platform/booking-policy'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformBookingPolicies()'],
  ledgers: ['预约策略账本', '预约规则变更审计'],
  ownerLayers: platformOwnerLayers(['预约策略账本', '预约规则变更审计']),
})

export const platformPrintSettingsScaffold = defineModuleScaffold({
  featureKey: 'platform-print-settings',
  domain: '平台设置',
  title: '打印设置',
  summary: '统一维护打印模板、适用门店和输出策略。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实模板配置、渲染策略和打印审计。',
  routes: ['/platform/print-settings'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformPrintSettings()'],
  ledgers: ['打印模板账本', '打印动作审计记录'],
  ownerLayers: platformOwnerLayers(['打印模板账本', '打印动作审计记录']),
})

export const platformScoreSettingsScaffold = defineModuleScaffold({
  featureKey: 'platform-score-settings',
  domain: '平台设置',
  title: '评分配置',
  summary: '统一维护客户评价开关、评分项和差评通知策略。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实评价规则、通知策略和渠道差异设置。',
  routes: ['/platform/score-settings'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformScoreSettings()'],
  ledgers: ['评价规则账本', '评价配置审计记录'],
  ownerLayers: platformOwnerLayers(['评价规则账本', '评价配置审计记录']),
})

export const platformEmailSettingsScaffold = defineModuleScaffold({
  featureKey: 'platform-email-settings',
  domain: '平台设置',
  title: '邮箱设置',
  summary: '统一维护发件邮箱、SMTP 和失败重试策略。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实邮箱配置、发送凭证和重试证据。',
  routes: ['/platform/email-settings'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.getPlatformEmailSettings()'],
  ledgers: ['邮箱配置账本', '邮件发送审计记录'],
  ownerLayers: platformOwnerLayers(['邮箱配置账本', '邮件发送审计记录']),
})

export const platformNotificationCenterScaffold = defineModuleScaffold({
  featureKey: 'platform-notification-center',
  domain: '平台设置',
  title: '通知中心',
  summary: '统一维护通知规则、提醒对象和多渠道开关。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实通知场景、订阅人和触达日志。',
  routes: ['/platform/notification-center'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformNotificationCenters()'],
  ledgers: ['通知规则账本', '触达日志证据'],
  ownerLayers: platformOwnerLayers(['通知规则账本', '触达日志证据']),
})

export const platformServicePackagesScaffold = defineModuleScaffold({
  featureKey: 'platform-service-packages',
  domain: '平台设置',
  title: '简约服务中心',
  summary: '为套餐版本、续费升级、资源额度和购买记录预留独立 owner。',
  phase: 'Phase 4',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 4 接套餐插件授权、资源额度和账单联动。',
  routes: ['/platform/service-packages'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformServicePackages()'],
  ledgers: ['套餐授权账本', '服务购买记录', '资源额度快照'],
  ownerLayers: platformOwnerLayers(['套餐授权账本', '服务购买记录', '资源额度快照']),
})

export const platformSettingsScaffolds = [
  platformBrandInfoScaffold,
  platformIntegrationScaffold,
  platformBookingPolicyScaffold,
  platformPrintSettingsScaffold,
  platformScoreSettingsScaffold,
  platformEmailSettingsScaffold,
  platformNotificationCenterScaffold,
  platformServicePackagesScaffold,
]
