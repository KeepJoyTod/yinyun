import { apiRequest, apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import { mapBookingInventoryRow, mapRiskApprovalRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  BookingInventoryDto,
  BookingInventoryListQuery,
  BookingInventoryUpdatePayload,
  ScheduleGovernancePayload,
  ScheduleGovernancePreviewDto,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type InventoryApiDeps = {
  getBookingInventory: () => BookingInventoryDto[]
  setBookingInventory: (items: BookingInventoryDto[]) => void
}

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const createInventoryApi = (deps: InventoryApiDeps) => ({
  async listBookingInventory(query: BookingInventoryListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/bookingSlotInventory/list', {
      bizDate: query.bizDate,
      beginBizDate: query.beginBizDate,
      endBizDate: query.endBizDate,
      storeId: query.storeId,
      serviceGroupId: query.serviceGroupId,
      conflictOnly: query.conflictOnly,
    })
    const inventory = rows.map(mapBookingInventoryRow)
    deps.setBookingInventory(inventory)
    return inventory
  },
  async updateBookingInventory(payload: BookingInventoryUpdatePayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId,
      serviceGroupId: payload.serviceGroupId ?? null,
      externalSkuId: payload.externalSkuId || '',
      bizDate: payload.bizDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      capacity: payload.capacity,
      status: payload.status,
      remark: payload.remark || '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/bookingSlotInventory', { method: 'PUT', body: JSON.stringify(body) })
    const updated = mapBookingInventoryRow({
      ...deps.getBookingInventory().find(item => item.id === payload.id),
      ...body,
    })
    deps.setBookingInventory(deps.getBookingInventory().map(item => (item.id === updated.id ? updated : item)))
    return updated
  },
  async previewScheduleGovernance(payload: ScheduleGovernancePayload) {
    const response = await apiRequest<Record<string, any>>('/yy/bookingSlotInventory/governance/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapScheduleGovernancePreview(response)
  },
  async applyScheduleGovernance(payload: ScheduleGovernancePayload) {
    const response = await apiRequest<Record<string, any>>('/yy/bookingSlotInventory/governance/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const preview = mapScheduleGovernancePreview(response)
    if (preview.slots.length) {
      deps.setBookingInventory(preview.slots)
    }
    return preview
  },
})

const mapScheduleGovernancePreview = (row: Record<string, any>): ScheduleGovernancePreviewDto => ({
  affectedSlotCount: Number(row.affectedSlotCount ?? 0),
  paidSlotCount: Number(row.paidSlotCount ?? 0),
  conflictSlotCount: Number(row.conflictSlotCount ?? 0),
  approvalRequired: Boolean(row.approvalRequired),
  message: String(row.message ?? ''),
  approval: row.approval && typeof row.approval === 'object' ? mapRiskApprovalRow(row.approval) : null,
  slots: Array.isArray(row.slots) ? row.slots.map((slot: Record<string, any>) => mapBookingInventoryRow(slot)) : [],
})
