import { apiRequest, apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { mapDouyinLifeSyncQuery, pageQuery } from './backendQueryMappers'
import {
  mapChannelProductMappingRow,
  mapDouyinLifeSyncResult,
  mapNotificationLogRow,
  mapNotificationTemplateRow,
} from './backendRowMappers'
import { mapChannelAcceptanceCaseRow, mapChannelSyncHealthRow } from './backendChannelInsights'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  DouyinLifeOrderSyncQuery,
  NotificationLogDto,
  NotificationTemplateDto,
  NotificationTemplatePayload,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type MerchantOpsApiDeps = {
  getNotificationTemplates: () => NotificationTemplateDto[]
  setNotificationTemplates: (items: NotificationTemplateDto[]) => void
  getNotificationLogs: () => NotificationLogDto[]
  setNotificationLogs: (items: NotificationLogDto[]) => void
  getChannelProductMappings: () => ChannelProductMappingDto[]
  setChannelProductMappings: (items: ChannelProductMappingDto[]) => void
  getDouyinAcceptanceCases: () => ChannelAcceptanceCaseDto[]
  setDouyinAcceptanceCases: (items: ChannelAcceptanceCaseDto[]) => void
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const findCreatedRecord = async <T>(
  path: string,
  query: Record<string, string | number | boolean | null | undefined>,
  predicate: (row: T) => boolean,
  label: string,
) => {
  const rows = await listRows<T>(path, query)
  const created = rows.find(predicate)
  if (!created) throw new Error(`链路未返回新建${label}，请刷新后确认`)
  return created
}

const notificationTemplateToPayload = (payload: NotificationTemplatePayload) => ({
  id: payload.id,
  templateCode: payload.templateCode,
  scene: payload.scene,
  channelType: payload.channelType,
  title: payload.title || '',
  content: payload.content,
  providerTemplateId: payload.providerTemplateId || '',
  enabled: payload.enabled || '1',
  remark: payload.remark || '',
})

export const createMerchantOpsApi = (deps: MerchantOpsApiDeps) => ({
  async listNotificationTemplates() {
    const rows = await listRows<Record<string, any>>('/yy/notificationTemplate/list')
    const templates = rows.map(mapNotificationTemplateRow)
    deps.setNotificationTemplates(templates)
    return templates
  },
  async createNotificationTemplate(payload: NotificationTemplatePayload) {
    const body = notificationTemplateToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/notificationTemplate', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/notificationTemplate/list',
      { templateCode: body.templateCode },
      item => String(item.templateCode ?? '') === body.templateCode,
      '通知模板',
    )
    const created = mapNotificationTemplateRow(row)
    deps.setNotificationTemplates([created, ...deps.getNotificationTemplates()])
    return created
  },
  async updateNotificationTemplate(payload: NotificationTemplatePayload) {
    const body = notificationTemplateToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/notificationTemplate', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapNotificationTemplateRow(body)
    deps.setNotificationTemplates(deps.getNotificationTemplates().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async listNotificationLogs() {
    const rows = await listRows<Record<string, any>>('/yy/notificationLog/list')
    const logs = rows.map(mapNotificationLogRow)
    deps.setNotificationLogs(logs)
    return logs
  },
  async listChannelProductMappings(query?: { channelType?: string; storeId?: BackendId }) {
    const rows = await listRows<Record<string, any>>('/yy/channelProductMapping/list', query)
    const mappings = rows.map(mapChannelProductMappingRow)
    deps.setChannelProductMappings(mappings)
    return mappings
  },
  async listDouyinAcceptanceCases() {
    const rows = await apiRequest<unknown[]>('/yy/channel/DOUYIN_LIFE/acceptance-cases')
    const cases = rows.map(row => mapChannelAcceptanceCaseRow(row as Record<string, any>))
    deps.setDouyinAcceptanceCases(cases)
    return cases
  },
  async getDouyinSyncHealth() {
    const row = await apiRequest<Record<string, any>>('/yy/channel/DOUYIN_LIFE/sync-health')
    return mapChannelSyncHealthRow(row)
  },
  async syncDouyinLifeOrders(query: DouyinLifeOrderSyncQuery = {}) {
    const row = await apiRequest<Record<string, any>>('/yy/channel/DOUYIN_LIFE/orders/sync', {
      method: 'POST',
      body: JSON.stringify(mapDouyinLifeSyncQuery(query)),
    })
    return mapDouyinLifeSyncResult(row)
  },
})
