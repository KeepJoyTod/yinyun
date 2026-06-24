import { apiRequestRaw } from './request'
import { normalizeBackendId, type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type { ScheduleRuleDto, ScheduleRulePayload } from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const scheduleRuleToPayload = (payload: ScheduleRulePayload) => ({
  id: payload.id,
  storeId: payload.storeId,
  serviceGroupId: payload.serviceGroupId,
  weekday: payload.weekday,
  startTime: payload.startTime,
  endTime: payload.endTime,
  capacity: payload.capacity ?? 0,
  enabled: payload.enabled ?? 'Y',
  remark: payload.remark ?? '',
})

export const scheduleRulesApi = {
  async listScheduleRules(query: { storeId?: BackendId; serviceGroupId?: BackendId }) {
    const rows = await listRows<Record<string, any>>('/yy/scheduleRule/list', {
      storeId: query.storeId,
      serviceGroupId: query.serviceGroupId,
    })
    return rows.map((row: Record<string, any>): ScheduleRuleDto => ({
      id: normalizeBackendId(row.id),
      storeId: normalizeBackendId(row.storeId),
      serviceGroupId: normalizeBackendId(row.serviceGroupId),
      weekday: Number(row.weekday ?? 0),
      startTime: String(row.startTime ?? ''),
      endTime: String(row.endTime ?? ''),
      capacity: Number(row.capacity ?? 0),
      enabled: String(row.enabled ?? 'Y'),
      remark: String(row.remark ?? ''),
    }))
  },
  async createScheduleRule(payload: ScheduleRulePayload) {
    const body = scheduleRuleToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/scheduleRule', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return body
  },
  async updateScheduleRule(payload: ScheduleRulePayload) {
    const body = scheduleRuleToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/scheduleRule', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return body
  },
  async deleteScheduleRule(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/scheduleRule/${id}`, {
      method: 'DELETE',
    })
  },
}
