export type PlatformScaffoldStatus = 'scaffold' | 'ready' | 'retired'

export type PlatformBrandInfoDto = {
  brandCode: string
  brandName: string
  logoUrl?: string
  primaryCategory?: string
  summary?: string
  status: PlatformScaffoldStatus
}

export type PlatformIntegrationDto = {
  channelType: string
  channelName: string
  appId?: string
  webhookUrl?: string
  spiBaseUrl?: string
  status: PlatformScaffoldStatus
}

export type PlatformBookingPolicyDto = {
  channelType: string
  feeMode: string
  unpaidCancelMinutes?: number
  allowSelfReschedule: boolean
  allowSelfCancel: boolean
  status: PlatformScaffoldStatus
}

export type PlatformPrintSettingsDto = {
  templateId: string
  templateTitle: string
  storeScopeLabel?: string
  status: PlatformScaffoldStatus
}

export type PlatformScoreSettingsDto = {
  scoreRuleId: string
  scoreRuleName: string
  mandatoryComment: boolean
  status: PlatformScaffoldStatus
}

export type PlatformEmailSettingsDto = {
  senderName?: string
  senderAddress?: string
  provider?: string
  status: PlatformScaffoldStatus
}

export type PlatformNotificationCenterDto = {
  sceneCode: string
  sceneName: string
  channelTypes: string[]
  status: PlatformScaffoldStatus
}

export type PlatformServicePackageDto = {
  packageCode: string
  packageName: string
  versionLabel: string
  status: PlatformScaffoldStatus
}
