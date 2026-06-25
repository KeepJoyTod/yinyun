import { apiRequest } from './request'
import type {
  PlatformBookingPolicyDto,
  PlatformBrandInfoDto,
  PlatformEmailSettingsDto,
  PlatformIntegrationStatusDto,
  PlatformNotificationRuleDto,
  PlatformPrintSettingsDto,
  PlatformScoreSettingsDto,
  PlatformServicePackageStatusDto,
} from './backendTypes'

const demoMode = () => import.meta.env.VITE_STUDIO_DEMO === 'true'

const normalizeStatus = (value: unknown) => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'ready' || normalized === 'active' || normalized === 'enabled' || normalized === 'y') return 'ready'
  if (normalized === 'retired' || normalized === 'disabled' || normalized === 'n') return 'retired'
  return 'scaffold'
}

const text = (value: unknown) => String(value ?? '')

const fallbackIntegrations: PlatformIntegrationStatusDto[] = [
  {
    channelType: 'DOUYIN_LIFE',
    channelName: 'Douyin Life',
    spiBaseUrl: 'https://api.evanshine.me',
    status: 'scaffold',
    nextActions: [{ actionKey: 'open_authorization', label: 'Open authorization', enabled: false, reason: 'Demo fallback' }],
  },
  {
    channelType: 'MEITUAN',
    channelName: 'Meituan',
    status: 'scaffold',
    nextActions: [{ actionKey: 'open_authorization', label: 'Open authorization', enabled: false, reason: 'Demo fallback' }],
  },
]

const fallbackNotifications: PlatformNotificationRuleDto[] = [
  {
    sceneCode: 'ORDER_REMINDER',
    sceneName: 'Order reminder',
    channelTypes: ['SMS', 'WECHAT'],
    enabled: 'N',
    status: 'scaffold',
    nextActions: [{ actionKey: 'edit_template', label: 'Edit template', enabled: false, reason: 'Demo fallback' }],
  },
]

const fallbackServicePackages: PlatformServicePackageStatusDto[] = [
  {
    packageCode: 'YY-BASE',
    packageName: 'Yingyue base package',
    versionLabel: 'Phase 1',
    status: 'scaffold',
    nextActions: [{ actionKey: 'renew_or_upgrade', label: 'Renew or upgrade', enabled: false, reason: 'Demo fallback' }],
  },
]

const platformBrandInfo: PlatformBrandInfoDto = {
  brandCode: 'YY-STUDIO',
  brandName: 'Yingyue Cloud Workbench',
  summary: 'Platform settings owner is connected to Phase 1 read-only scaffolds.',
  status: 'scaffold',
}

const mapEvidence = (items: any[] | undefined) => (Array.isArray(items) ? items : []).map(item => ({
  sourceType: text(item.sourceType),
  sourceKey: text(item.sourceKey),
  status: text(item.status),
  message: text(item.message),
  requestId: text(item.requestId),
  eventTime: text(item.eventTime),
}))

const mapActions = (items: any[] | undefined) => (Array.isArray(items) ? items : []).map(item => ({
  actionKey: text(item.actionKey),
  label: text(item.label),
  enabled: Boolean(item.enabled),
  reason: text(item.reason),
}))

const mapIntegration = (row: Record<string, any>): PlatformIntegrationStatusDto => ({
  channelType: text(row.channelType),
  channelName: text(row.channelName || row.channelType),
  accountName: text(row.accountName),
  appId: text(row.appId),
  webhookUrl: text(row.webhookUrl),
  spiBaseUrl: text(row.spiBaseUrl),
  latestLogId: text(row.latestLogId),
  latestSyncTime: text(row.latestSyncTime),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const mapNotification = (row: Record<string, any>): PlatformNotificationRuleDto => ({
  sceneCode: text(row.sceneCode),
  sceneName: text(row.sceneName || row.sceneCode),
  channelTypes: Array.isArray(row.channelTypes) ? row.channelTypes.map(text).filter(Boolean) : [],
  enabled: text(row.enabled),
  latestSendStatus: text(row.latestSendStatus),
  latestSentTime: text(row.latestSentTime),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const mapServicePackage = (row: Record<string, any>): PlatformServicePackageStatusDto => ({
  packageCode: text(row.packageCode),
  packageName: text(row.packageName || row.packageCode),
  versionLabel: text(row.versionLabel),
  expireTime: text(row.expireTime),
  boundStoreIds: text(row.boundStoreIds),
  seatCount: Number(row.seatCount ?? 0),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const readOrFallback = async <T>(reader: () => Promise<T>, fallback: T) => {
  if (demoMode()) return fallback
  try {
    return await reader()
  } catch (error) {
    if (demoMode()) return fallback
    throw error
  }
}

export const platformApi = {
  async getPlatformBrandInfo(): Promise<PlatformBrandInfoDto> {
    return { ...platformBrandInfo }
  },
  async listPlatformIntegrations(): Promise<PlatformIntegrationStatusDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/integrations')).map(mapIntegration),
      fallbackIntegrations.map(item => ({ ...item })),
    )
  },
  async listPlatformBookingPolicies(): Promise<PlatformBookingPolicyDto[]> {
    return [
      {
        channelType: 'DEFAULT',
        feeMode: 'UNIFIED',
        allowSelfReschedule: true,
        allowSelfCancel: true,
        status: 'scaffold',
      },
    ]
  },
  async listPlatformPrintSettings(): Promise<PlatformPrintSettingsDto[]> {
    return [
      {
        templateId: 'print-default',
        templateTitle: 'Default print template',
        storeScopeLabel: 'All stores',
        status: 'scaffold',
      },
    ]
  },
  async listPlatformScoreSettings(): Promise<PlatformScoreSettingsDto[]> {
    return [
      {
        scoreRuleId: 'score-default',
        scoreRuleName: 'Default review rule',
        mandatoryComment: false,
        status: 'scaffold',
      },
    ]
  },
  async getPlatformEmailSettings(): Promise<PlatformEmailSettingsDto> {
    return {
      senderName: 'Yingyue notification center',
      provider: 'SMTP',
      status: 'scaffold',
    }
  },
  async listPlatformNotificationCenters(): Promise<PlatformNotificationRuleDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/notifications')).map(mapNotification),
      fallbackNotifications.map(item => ({ ...item })),
    )
  },
  async listPlatformServicePackages(storeId?: string): Promise<PlatformServicePackageStatusDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>(
        '/yy/platform-settings/service-packages',
        {},
        { storeId },
      )).map(mapServicePackage),
      fallbackServicePackages.map(item => ({ ...item })),
    )
  },
}
