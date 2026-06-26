import type {
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  ChannelSyncHealthDto,
  ChannelSyncLogDto,
  NotificationLogDto,
  NotificationTemplateDto,
  OperationLogDto,
} from '../api/backend'
import type {
  ChannelProductMappingInfo,
  ChannelSyncLogInfo,
  DouyinAcceptanceCaseInfo,
  DouyinSyncHealthInfo,
  NotificationLogInfo,
  NotificationTemplateInfo,
  OperationLogInfo,
  ProductConfig,
  StoreInfo,
} from './appStoreTypes'

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

export const mapNotificationTemplate = (dto: NotificationTemplateDto): NotificationTemplateInfo => ({
  backendId: dto.id,
  templateCode: dto.templateCode,
  scene: dto.scene,
  channelType: dto.channelType,
  title: dto.title,
  content: dto.content,
  providerTemplateId: dto.providerTemplateId,
  enabled: dto.enabled || '1',
  remark: dto.remark,
})

export const mapNotificationLog = (dto: NotificationLogDto, stores: StoreInfo[]): NotificationLogInfo => {
  const store = stores.find(item => item.backendId === dto.storeId)
  return {
    backendId: dto.id,
    storeName: store?.name ?? (dto.storeId ? `门店 #${dto.storeId}` : '全局模板'),
    templateBackendId: dto.templateId ?? undefined,
    channelType: dto.channelType,
    receiver: dto.receiver,
    sendStatus: dto.sendStatus,
    requestId: dto.requestId,
    errorMessage: dto.errorMessage,
    sentTime: dto.sentTime || '',
    rawPayload: dto.rawPayload,
    remark: dto.remark,
  }
}

const isSuccessValue = (value: string | number | boolean | null | undefined) => {
  const normalized = String(value ?? '').toLowerCase()
  return value === true || ['1', 'true', 'success', '成功', 'yes', 'y'].includes(normalized)
}

const isRetryableValue = (value: string | number | boolean | null | undefined) => {
  const normalized = String(value ?? '').toLowerCase()
  return value === true || ['1', 'true', 'yes', 'retryable', '可重试'].includes(normalized)
}

export const mapOperationLog = (dto: OperationLogDto): OperationLogInfo => ({
  backendId: dto.operId,
  title: dto.title || '系统操作',
  action: dto.method || dto.requestMethod || '未记录方法',
  operator: dto.operName || '系统',
  operatorType: dto.operatorType,
  deptName: dto.deptName || '未标记部门',
  requestMethod: dto.requestMethod || 'GET',
  url: dto.operUrl || '',
  ip: dto.operIp || '',
  status: dto.status === 0 ? 'SUCCESS' : 'FAILED',
  errorMessage: dto.errorMsg || '',
  requestPayload: dto.operParam || '',
  responsePayload: dto.jsonResult || '',
  happenedAt: dto.operTime || '',
  durationMs: dto.costTime,
})

export const mapChannelSyncLog = (dto: ChannelSyncLogDto, stores: StoreInfo[]): ChannelSyncLogInfo => {
  const store = stores.find(item => item.backendId === dto.storeId)
  const success = isSuccessValue(dto.success)
  return {
    backendId: dto.id,
    storeName: store?.name ?? (dto.storeId ? `门店 #${dto.storeId}` : '全部门店'),
    channelType: dto.channelType || 'UNKNOWN',
    apiName: dto.apiName || '未记录接口',
    requestId: dto.requestId,
    status: success ? 'SUCCESS' : 'FAILED',
    errorMessage: dto.errorMessage,
    durationMs: dto.durationMs,
    retryable: isRetryableValue(dto.retryable),
    remark: dto.remark,
  }
}

const isActiveMappingStatus = (value: string | null | undefined) => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  return ['0', '1', 'active', 'enabled', 'enable', 'normal', 'online', 'ready', 'valid', '启用', '正常'].includes(normalized)
}

export const mapChannelProductMapping = (
  dto: ChannelProductMappingDto,
  stores: StoreInfo[],
  products: ProductConfig[],
): ChannelProductMappingInfo => {
  const store = stores.find(item => dto.storeId != null && item.backendId === dto.storeId)
  const product = products.find(item => sameId(item.backendId, dto.productId) || sameId(item.id, dto.productId))
  const requiredFields = [
    dto.externalProductId,
    dto.externalSkuId,
    dto.externalPoiId,
    dto.landingUrl || dto.landingPath,
  ]
  return {
    backendId: dto.id,
    productBackendId: dto.productId || undefined,
    storeBackendId: dto.storeId || undefined,
    storeName: store?.name ?? (dto.storeId ? `门店 #${dto.storeId}` : '全部门店'),
    productName: product?.name ?? (dto.productId ? `本地产品 #${dto.productId}` : '未绑定本地产品'),
    channelType: dto.channelType || 'UNKNOWN',
    externalProductId: dto.externalProductId,
    externalSkuId: dto.externalSkuId,
    externalPoiId: dto.externalPoiId,
    landingUrl: dto.landingUrl,
    landingPath: dto.landingPath,
    externalName: dto.externalName,
    mappingStatus: dto.mappingStatus || '未配置',
    remark: dto.remark,
    ready: ['DOUYIN_LIFE', 'MEITUAN'].includes(dto.channelType)
      && isActiveMappingStatus(dto.mappingStatus)
      && requiredFields.every(Boolean),
  }
}

export const mapDouyinAcceptanceCase = (dto: ChannelAcceptanceCaseDto): DouyinAcceptanceCaseInfo => ({
  caseKey: dto.caseKey,
  label: dto.label,
  apiName: dto.apiName,
  publicUrl: dto.publicUrl,
  endpoint: dto.endpoint,
  logidSource: dto.logidSource,
  status: dto.status,
  statusText: dto.statusText,
  requestId: dto.requestId,
  success: dto.success,
  errorMessage: dto.errorMessage,
  createTime: dto.createTime,
  hint: dto.hint,
})

export const mapDouyinSyncHealth = (dto: ChannelSyncHealthDto): DouyinSyncHealthInfo => ({
  channelType: dto.channelType || 'DOUYIN_LIFE',
  healthStatus: dto.healthStatus || 'UNKNOWN',
  message: dto.message,
  failedEventCount: dto.failedEventCount,
  retryableEventCount: dto.retryableEventCount,
  deadEventCount: dto.deadEventCount,
  latestLogId: dto.latestLogId,
  latestWebhookTime: dto.latestWebhookTime,
  latestAutoSyncTime: dto.latestAutoSyncTime,
})
