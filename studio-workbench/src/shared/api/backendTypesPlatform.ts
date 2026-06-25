export type PlatformScaffoldStatus = 'scaffold' | 'ready' | 'retired'

export type PlatformEvidenceDto = {
  sourceType: string
  sourceKey: string
  status: string
  message?: string
  requestId?: string
  eventTime?: string
}

export type PlatformActionHintDto = {
  actionKey: string
  label: string
  enabled: boolean
  reason?: string
}

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
  accountName?: string
  appId?: string
  webhookUrl?: string
  spiBaseUrl?: string
  status: PlatformScaffoldStatus
  latestLogId?: string
  latestSyncTime?: string
  evidence?: PlatformEvidenceDto[]
  nextActions?: PlatformActionHintDto[]
}

export type PlatformIntegrationStatusDto = PlatformIntegrationDto

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
  enabled?: string
  latestSendStatus?: string
  latestSentTime?: string
  status: PlatformScaffoldStatus
  evidence?: PlatformEvidenceDto[]
  nextActions?: PlatformActionHintDto[]
}

export type PlatformNotificationRuleDto = PlatformNotificationCenterDto

export type PlatformServicePackageDto = {
  packageCode: string
  packageName: string
  versionLabel: string
  status: PlatformScaffoldStatus
  expireTime?: string
  boundStoreIds?: string
  seatCount?: number
  evidence?: PlatformEvidenceDto[]
  nextActions?: PlatformActionHintDto[]
}

export type PlatformServicePackageStatusDto = PlatformServicePackageDto
