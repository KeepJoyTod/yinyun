import { apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { mapServiceGroupRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type { ServiceGroupDto, ServiceGroupPayload } from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type MerchantConfigApiDeps = {
  getServiceGroups: () => ServiceGroupDto[]
  setServiceGroups: (items: ServiceGroupDto[]) => void
}

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

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

const serviceGroupToPayload = (payload: ServiceGroupPayload) => ({
  id: payload.id,
  storeId: payload.storeId,
  groupCode: payload.groupCode,
  groupName: payload.groupName,
  capacity: payload.capacity,
  durationMinutes: payload.durationMinutes,
  serviceMode: payload.serviceMode,
  status: payload.status,
  sort: payload.sort,
  remark: payload.remark,
})

export const createMerchantConfigApi = (deps: MerchantConfigApiDeps) => ({
  async listServiceGroups() {
    const rows = await listRows<Record<string, any>>('/yy/serviceGroup/list')
    const serviceGroups = rows.map(mapServiceGroupRow)
    deps.setServiceGroups(serviceGroups)
    return serviceGroups
  },
  async createServiceGroup(payload: ServiceGroupPayload) {
    const body = serviceGroupToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/serviceGroup', { method: 'POST', body: JSON.stringify(body) })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/serviceGroup/list',
      { storeId: body.storeId, groupCode: body.groupCode },
      item => sameId(item.storeId, body.storeId) && String(item.groupCode ?? '') === body.groupCode,
      '服务组',
    )
    const created = mapServiceGroupRow(row)
    deps.setServiceGroups([created, ...deps.getServiceGroups()])
    return created
  },
  async updateServiceGroup(payload: ServiceGroupPayload) {
    const body = serviceGroupToPayload(payload)
    await apiRequestRaw<RuoyiResponse<void>>('/yy/serviceGroup', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapServiceGroupRow(body)
    deps.setServiceGroups(deps.getServiceGroups().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async deleteServiceGroup(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/serviceGroup/${id}`, { method: 'DELETE' })
    deps.setServiceGroups(deps.getServiceGroups().filter(item => !sameId(item.id, id)))
  },
})
