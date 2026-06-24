import { apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import { mapChannelSyncLogRow, mapOperationLogRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  ChannelSyncLogDto,
  ChannelSyncLogListQuery,
  OperationLogDto,
  OperationLogListQuery,
} from './backendTypes'

type AuditApiDeps = {
  getOperationLogs: () => OperationLogDto[]
  setOperationLogs: (items: OperationLogDto[]) => void
  getChannelSyncLogs: () => ChannelSyncLogDto[]
  setChannelSyncLogs: (items: ChannelSyncLogDto[]) => void
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const createAuditApi = (deps: AuditApiDeps) => ({
  async listOperationLogs(query: OperationLogListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/monitor/operlog/list', {
      orderByColumn: query.orderByColumn ?? 'operTime',
      isAsc: query.isAsc ?? 'descending',
    })
    const logs = rows.map(mapOperationLogRow)
    deps.setOperationLogs(logs)
    return logs
  },
  async listChannelSyncLogs(query: ChannelSyncLogListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/channelSyncLog/list', {
      storeId: query.storeId,
      channelType: query.channelType,
      apiName: query.apiName,
      requestId: query.requestId,
      success: query.success,
    })
    const logs = rows.map(mapChannelSyncLogRow)
    deps.setChannelSyncLogs(logs)
    return logs
  },
})
