import { apiRequest, apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { mapWorkOrderListQuery, pageQuery } from './backendQueryMappers'
import { mapWorkOrderEventRow, mapWorkOrderRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type { PageResponse } from './request'
import type { WorkOrderDto, WorkOrderEventDto, WorkOrderListQuery, WorkOrderTransitionPayload } from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

let cachedWorkOrders: WorkOrderDto[] = []
let cachedWorkOrderEvents: Record<string, WorkOrderEventDto[]> = {}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const getData = async <T>(path: string) => {
  const response = await apiRequestRaw<RuoyiResponse<T>>(path)
  if (!response.data) throw new Error(`Empty response data: ${path}`)
  return response.data
}

export const workOrdersApi = {
  async listWorkOrders(query: WorkOrderListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/workOrder/list', mapWorkOrderListQuery(query))
    cachedWorkOrders = rows.map(mapWorkOrderRow)
    return {
      items: cachedWorkOrders,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      total: cachedWorkOrders.length,
    } satisfies PageResponse<WorkOrderDto>
  },
  async getWorkOrder(id: BackendId) {
    const row = await getData<Record<string, any>>(`/yy/workOrder/${id}`)
    const workOrder = mapWorkOrderRow(row)
    cachedWorkOrders = [
      workOrder,
      ...cachedWorkOrders.filter(item => item.id !== workOrder.id),
    ]
    return workOrder
  },
  async listWorkOrderEvents(id: BackendId) {
    const rows = await getData<Record<string, any>[]>(`/yy/workOrder/${id}/events`)
    const events = rows.map(mapWorkOrderEventRow)
    cachedWorkOrderEvents = {
      ...cachedWorkOrderEvents,
      [String(id)]: events,
    }
    return events
  },
  async transitionWorkOrder(payload: WorkOrderTransitionPayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/workOrder/${payload.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({
        expectedStatus: payload.expectedStatus,
        targetStatus: payload.targetStatus,
        remark: payload.remark || '',
      }),
    })
    const next = mapWorkOrderRow(row)
    cachedWorkOrders = cachedWorkOrders.map(item => (item.id === next.id ? next : item))
    return next
  },
}
