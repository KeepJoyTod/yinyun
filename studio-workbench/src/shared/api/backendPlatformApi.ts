import type {
  PlatformBookingPolicyDto,
  PlatformBrandInfoDto,
  PlatformEmailSettingsDto,
  PlatformIntegrationDto,
  PlatformNotificationCenterDto,
  PlatformPrintSettingsDto,
  PlatformScoreSettingsDto,
  PlatformServicePackageDto,
} from './backendTypes'

const platformBrandInfo: PlatformBrandInfoDto = {
  brandCode: 'YY-STUDIO',
  brandName: '影约云工作台',
  summary: '平台设置域脚手架 owner 已就位，待接真实品牌资料与配置。',
  status: 'scaffold',
}

const platformIntegrations: PlatformIntegrationDto[] = [
  {
    channelType: 'DOUYIN_LIFE',
    channelName: '抖音来客',
    spiBaseUrl: 'https://api.evanshine.me',
    status: 'scaffold',
  },
  {
    channelType: 'MEITUAN',
    channelName: '美团',
    status: 'scaffold',
  },
]

const platformBookingPolicies: PlatformBookingPolicyDto[] = [
  {
    channelType: 'DEFAULT',
    feeMode: 'UNIFIED',
    allowSelfReschedule: true,
    allowSelfCancel: true,
    status: 'scaffold',
  },
]

const platformPrintSettings: PlatformPrintSettingsDto[] = [
  {
    templateId: 'print-default',
    templateTitle: '默认打印模板',
    storeScopeLabel: '全部门店',
    status: 'scaffold',
  },
]

const platformScoreSettings: PlatformScoreSettingsDto[] = [
  {
    scoreRuleId: 'score-default',
    scoreRuleName: '默认评价规则',
    mandatoryComment: false,
    status: 'scaffold',
  },
]

const platformEmailSettings: PlatformEmailSettingsDto = {
  senderName: '影约云通知中心',
  provider: 'SMTP',
  status: 'scaffold',
}

const platformNotificationCenters: PlatformNotificationCenterDto[] = [
  {
    sceneCode: 'ORDER_ARRIVAL',
    sceneName: '客户到店提醒',
    channelTypes: ['SMS', 'WECHAT'],
    status: 'scaffold',
  },
]

const platformServicePackages: PlatformServicePackageDto[] = [
  {
    packageCode: 'YY-BASE',
    packageName: '基础服务包',
    versionLabel: 'Phase 0',
    status: 'scaffold',
  },
]

export const platformApi = {
  async getPlatformBrandInfo(): Promise<PlatformBrandInfoDto> {
    return { ...platformBrandInfo }
  },
  async listPlatformIntegrations(): Promise<PlatformIntegrationDto[]> {
    return platformIntegrations.map(item => ({ ...item }))
  },
  async listPlatformBookingPolicies(): Promise<PlatformBookingPolicyDto[]> {
    return platformBookingPolicies.map(item => ({ ...item }))
  },
  async listPlatformPrintSettings(): Promise<PlatformPrintSettingsDto[]> {
    return platformPrintSettings.map(item => ({ ...item }))
  },
  async listPlatformScoreSettings(): Promise<PlatformScoreSettingsDto[]> {
    return platformScoreSettings.map(item => ({ ...item }))
  },
  async getPlatformEmailSettings(): Promise<PlatformEmailSettingsDto> {
    return { ...platformEmailSettings }
  },
  async listPlatformNotificationCenters(): Promise<PlatformNotificationCenterDto[]> {
    return platformNotificationCenters.map(item => ({ ...item }))
  },
  async listPlatformServicePackages(): Promise<PlatformServicePackageDto[]> {
    return platformServicePackages.map(item => ({ ...item }))
  },
}
