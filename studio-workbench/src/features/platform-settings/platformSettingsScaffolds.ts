import { defineModuleScaffold } from '../system/moduleScaffold'
import { collectScaffoldAcceptanceMeta } from '../system/scaffoldAcceptanceMappings'

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

export const platformLoginRiskScaffold = defineModuleScaffold({
  featureKey: 'platform-login-risk',
  domain: '平台设置',
  title: '登录风控',
  summary: '统一维护设备指纹、异常 IP、二次校验和登录风险审计 owner。',
  phase: 'Phase 4',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 4 接真实设备指纹、异常登录事件、短信验证码和二次校验策略。',
  routes: ['/platform/login-risk'],
  contracts: [
    'docs/contracts/platform-enterprise-scaffold-contract-20260625.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformLoginRiskPolicies()'],
  ledgers: ['登录风险策略账本', '设备指纹证据', '二次校验审计记录'],
  ownerLayers: platformOwnerLayers(['登录风险策略账本', '设备指纹证据', '二次校验审计记录']),
})

export const platformOpenApiScaffold = defineModuleScaffold({
  featureKey: 'platform-open-api',
  domain: '平台设置',
  title: '开放 API',
  summary: '统一维护 API key、签名、限流和沙箱环境 owner。',
  phase: 'Phase 4',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 4 接真实 API key 发放、签名校验、限流配额和开放文档门户。',
  routes: ['/platform/open-api'],
  contracts: [
    'docs/contracts/platform-enterprise-scaffold-contract-20260625.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformOpenApiApps()'],
  ledgers: ['开放应用账本', 'API key 审计记录', '开放接口限流证据'],
  ownerLayers: platformOwnerLayers(['开放应用账本', 'API key 审计记录', '开放接口限流证据']),
})

export const platformTaskCenterScaffold = defineModuleScaffold({
  featureKey: 'platform-task-center',
  domain: '平台设置',
  title: '任务中心',
  summary: '统一维护导出、图片处理、通知和报表汇总任务账本 owner。',
  phase: 'Phase 3',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 3 接真实任务状态机、失败重试、下载过期和任务审计。',
  routes: ['/platform/task-center'],
  contracts: [
    'docs/contracts/platform-enterprise-scaffold-contract-20260625.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformAsyncTasks()'],
  ledgers: ['异步任务账本', '任务执行日志', '下载过期证据'],
  ownerLayers: platformOwnerLayers(['异步任务账本', '任务执行日志', '下载过期证据']),
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
  ...collectScaffoldAcceptanceMeta(['B-115']),
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
  ...collectScaffoldAcceptanceMeta(['B-116']),
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
  ...collectScaffoldAcceptanceMeta(['B-117']),
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
  ...collectScaffoldAcceptanceMeta(['B-118']),
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
  ...collectScaffoldAcceptanceMeta(['B-085']),
  ownerLayers: platformOwnerLayers(['通知规则账本', '触达日志证据']),
})

export const platformBackupRecoveryScaffold = defineModuleScaffold({
  featureKey: 'platform-backup-recovery',
  domain: '平台设置',
  title: '备份恢复',
  summary: '统一维护主库 PITR、对象版本化和恢复演练证据 owner。',
  phase: 'Phase 4',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 4 接真实备份计划、恢复演练记录和告警通知。',
  routes: ['/platform/backup-recovery'],
  contracts: [
    'docs/contracts/platform-enterprise-scaffold-contract-20260625.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformBackupRecoveryPlans()'],
  ledgers: ['备份策略账本', '恢复演练记录', '对象存储版本化证据'],
  ownerLayers: platformOwnerLayers(['备份策略账本', '恢复演练记录', '对象存储版本化证据']),
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

export const platformMeituanReviewTraceScaffold = defineModuleScaffold({
  featureKey: 'platform-meituan-review-trace',
  domain: '平台设置',
  title: '美团差评溯源',
  summary: '统一维护美团评价拉取、差评归因、处理记录和插件授权 owner。',
  phase: 'Phase 4',
  ownerStatus: 'building',
  owner: 'studio-workbench/src/features/platform-settings',
  nextPhase: 'Phase 4 接真实美团评价同步、差评工单、处理闭环和插件授权边界。',
  routes: ['/platform/meituan-review-trace'],
  contracts: [
    'docs/contracts/platform-enterprise-scaffold-contract-20260625.md',
    'studio-workbench/src/shared/api/backendPlatformApi.ts',
  ],
  apis: ['backendApi.listPlatformMeituanReviewTraces()'],
  ledgers: ['美团评价同步账本', '差评归因记录', '差评插件授权证据'],
  ownerLayers: platformOwnerLayers(['美团评价同步账本', '差评归因记录', '差评插件授权证据']),
})

export const platformSettingsScaffolds = [
  platformBrandInfoScaffold,
  platformIntegrationScaffold,
  platformLoginRiskScaffold,
  platformOpenApiScaffold,
  platformTaskCenterScaffold,
  platformBookingPolicyScaffold,
  platformPrintSettingsScaffold,
  platformScoreSettingsScaffold,
  platformMeituanReviewTraceScaffold,
  platformEmailSettingsScaffold,
  platformNotificationCenterScaffold,
  platformBackupRecoveryScaffold,
  platformServicePackagesScaffold,
]
