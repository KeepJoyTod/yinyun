import { apiRequest, apiRequestBlob, type BlobResponse } from './request'
import type {
  PlatformAsyncTaskDto,
  PlatformAsyncTaskDetailDto,
  PlatformAsyncTaskRunDto,
  PlatformBackupRecoveryDto,
  PlatformBookingPolicyDto,
  PlatformBrandInfoDto,
  PlatformEmailSettingsDto,
  PlatformIntegrationStatusDto,
  PlatformLoginRiskPolicyDto,
  PlatformMeituanReviewTraceDto,
  PlatformNotificationRuleDto,
  PlatformOpenApiAppDto,
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

const fallbackLoginRiskPolicies: PlatformLoginRiskPolicyDto[] = [
  {
    policyCode: 'STAFF_LOGIN_RISK',
    policyName: 'Staff login risk baseline',
    riskDimension: 'DEVICE/IP/MFA',
    guardScope: '员工工作台登录',
    status: 'scaffold',
    nextActions: [{ actionKey: 'enable_device_fingerprint', label: 'Enable device fingerprint', enabled: false, reason: 'Demo fallback' }],
  },
]

const fallbackOpenApiApps: PlatformOpenApiAppDto[] = [
  {
    appCode: 'ERP-SANDBOX',
    appName: 'ERP sandbox app',
    authMode: 'API_KEY + SIGNATURE',
    rateLimitLabel: '60 req/min',
    sandboxBaseUrl: 'https://sandbox.api.evanshine.me/open',
    status: 'scaffold',
    nextActions: [{ actionKey: 'issue_api_key', label: 'Issue API key', enabled: false, reason: 'Demo fallback' }],
  },
]

const fallbackAsyncTasks: PlatformAsyncTaskDto[] = [
  {
    taskType: 'EXPORT',
    taskName: 'Order export queue',
    queueName: 'platform-export',
    latestRunStatus: 'NOT_CONNECTED',
    retentionPolicy: '7 days',
    status: 'scaffold',
    nextActions: [{ actionKey: 'bind_task_worker', label: 'Bind worker', enabled: false, reason: 'Demo fallback' }],
  },
]

const fallbackBackupRecoveryPlans: PlatformBackupRecoveryDto[] = [
  {
    planCode: 'PITR-PRIMARY',
    planName: 'Primary DB backup plan',
    backupScope: 'PostgreSQL + object storage',
    recoveryTarget: 'RPO <= 15m / RTO <= 4h',
    status: 'scaffold',
    nextActions: [{ actionKey: 'run_drill', label: 'Run recovery drill', enabled: false, reason: 'Demo fallback' }],
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

const fallbackMeituanReviewTraces: PlatformMeituanReviewTraceDto[] = [
  {
    pluginCode: 'MEITUAN_REVIEW_TRACE',
    pluginName: 'Meituan negative-review trace',
    reviewChannel: 'MEITUAN',
    traceStatus: 'PLUGIN_NOT_OPENED',
    status: 'scaffold',
    nextActions: [{ actionKey: 'open_plugin', label: 'Open plugin', enabled: false, reason: 'Demo fallback' }],
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

const mapLoginRiskPolicy = (row: Record<string, any>): PlatformLoginRiskPolicyDto => ({
  policyCode: text(row.policyCode),
  policyName: text(row.policyName || row.policyCode),
  riskDimension: text(row.riskDimension),
  guardScope: text(row.guardScope),
  latestEventTime: text(row.latestEventTime),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const mapOpenApiApp = (row: Record<string, any>): PlatformOpenApiAppDto => ({
  appCode: text(row.appCode),
  appName: text(row.appName || row.appCode),
  authMode: text(row.authMode),
  rateLimitLabel: text(row.rateLimitLabel),
  sandboxBaseUrl: text(row.sandboxBaseUrl),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const mapAsyncTask = (row: Record<string, any>): PlatformAsyncTaskDto => ({
  taskType: text(row.taskType),
  taskName: text(row.taskName || row.taskType),
  queueName: text(row.queueName),
  latestRunStatus: text(row.latestRunStatus),
  retentionPolicy: text(row.retentionPolicy),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  nextActions: mapActions(row.nextActions),
})

const mapAsyncTaskRun = (row: Record<string, any>): PlatformAsyncTaskRunDto => ({
  taskId: text(row.taskId),
  status: text(row.status),
  runStatus: text(row.runStatus),
  createdTime: text(row.createdTime),
  startedTime: text(row.startedTime),
  finishedTime: text(row.finishedTime),
  expireTime: text(row.expireTime),
  downloadUrl: text(row.downloadUrl),
  fileName: text(row.fileName),
  contentType: text(row.contentType),
  errorMessage: text(row.errorMessage),
  auditNote: text(row.auditNote),
})

const mapAsyncTaskDetail = (row: Record<string, any>): PlatformAsyncTaskDetailDto => ({
  taskType: text(row.taskType),
  taskName: text(row.taskName || row.taskType),
  queueName: text(row.queueName),
  latestRunStatus: text(row.latestRunStatus),
  retentionPolicy: text(row.retentionPolicy),
  status: normalizeStatus(row.status),
  evidence: mapEvidence(row.evidence),
  runs: Array.isArray(row.runs) ? row.runs.map(item => mapAsyncTaskRun(item as Record<string, any>)) : [],
})

const mapBackupRecovery = (row: Record<string, any>): PlatformBackupRecoveryDto => ({
  planCode: text(row.planCode),
  planName: text(row.planName || row.planCode),
  backupScope: text(row.backupScope),
  recoveryTarget: text(row.recoveryTarget),
  lastDrillTime: text(row.lastDrillTime),
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

const mapMeituanReviewTrace = (row: Record<string, any>): PlatformMeituanReviewTraceDto => ({
  pluginCode: text(row.pluginCode),
  pluginName: text(row.pluginName || row.pluginCode),
  reviewChannel: text(row.reviewChannel),
  traceStatus: text(row.traceStatus),
  latestSyncTime: text(row.latestSyncTime),
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
  async listPlatformLoginRiskPolicies(): Promise<PlatformLoginRiskPolicyDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/login-risk-policies')).map(mapLoginRiskPolicy),
      fallbackLoginRiskPolicies.map(item => ({ ...item })),
    )
  },
  async listPlatformOpenApiApps(): Promise<PlatformOpenApiAppDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/open-api-apps')).map(mapOpenApiApp),
      fallbackOpenApiApps.map(item => ({ ...item })),
    )
  },
  async listPlatformAsyncTasks(): Promise<PlatformAsyncTaskDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/async-tasks')).map(mapAsyncTask),
      fallbackAsyncTasks.map(item => ({ ...item })),
    )
  },
  async getPlatformAsyncTaskDetail(taskType: string): Promise<PlatformAsyncTaskDetailDto> {
    return readOrFallback(
      async () => mapAsyncTaskDetail(await apiRequest<Record<string, any>>(`/yy/platform-settings/async-tasks/${encodeURIComponent(taskType)}`)),
      {
        taskType,
        taskName: taskType,
        queueName: 'platform-export',
        latestRunStatus: 'NOT_CONNECTED',
        retentionPolicy: 'not configured',
        status: 'scaffold',
        evidence: [],
        runs: [],
      },
    )
  },
  async downloadPlatformAsyncTaskByUrl(downloadUrl: string): Promise<BlobResponse> {
    return apiRequestBlob(downloadUrl)
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
  async listPlatformBackupRecoveryPlans(): Promise<PlatformBackupRecoveryDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/backup-recovery-plans')).map(mapBackupRecovery),
      fallbackBackupRecoveryPlans.map(item => ({ ...item })),
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
  async listPlatformMeituanReviewTraces(): Promise<PlatformMeituanReviewTraceDto[]> {
    return readOrFallback(
      async () => (await apiRequest<Record<string, any>[]>('/yy/platform-settings/meituan-review-traces')).map(mapMeituanReviewTrace),
      fallbackMeituanReviewTraces.map(item => ({ ...item })),
    )
  },
}
