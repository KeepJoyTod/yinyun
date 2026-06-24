import type { MicroFormSubmissionDto } from '../../shared/api/backend'
import type { BackendId } from '../../shared/api/backendId'
import type { BookingInventorySlot, ServiceGroupInfo, StoreInfo } from '../../shared/stores/appStore'
import { buildSubmissionBookingPrefill, type SubmissionBookingPrefill } from './microFormSubmissionBooking'
import type { StaffBookingInitial } from './StaffBookingModal.vue'

export type StaffBookingEntryDraft = {
  storeName: string
  serviceGroupId: BackendId | ''
  date: string
  startTime: string
}

export type RecommendedSlot = {
  key: string
  storeName: string
  serviceGroupId?: BackendId
  serviceGroupName: string
  date: string
  startTime: string
  endTime?: string
  capacity: number
  confirmedCount: number
  conflictCount: number
  remaining: number
}

export const readQueryString = (value: unknown) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

export const buildPrefillKey = (params: {
  fullPath: string
  stores: StoreInfo[]
  serviceGroups: ServiceGroupInfo[]
}) => [
  params.fullPath,
  params.stores.map(store => store.backendId).join('|'),
  params.serviceGroups.map(group => group.backendId).join('|'),
].join('::')

export const shouldOpenStaffBookingReturnFromQuery = (query: Record<string, unknown>) => {
  if (readQueryString(query.returnTo) !== 'staffBooking') return false
  return Boolean(
    readQueryString(query.date)
    || readQueryString(query.storeId)
    || readQueryString(query.serviceGroupId)
    || readQueryString(query.slotStart)
    || readQueryString(query.slotEnd)
    || readQueryString(query.startTime)
    || readQueryString(query.endTime),
  )
}

export const answerSummary = (answers: Record<string, unknown>) =>
  Object.entries(answers)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('/') : String(value ?? '')}`)
    .join('；')

export const buildSubmissionBookingRemark = (row: MicroFormSubmissionDto) => {
  const prefill = buildSubmissionBookingPrefill(row)
  const summary = answerSummary(row.answers)
  const parts = [
    `来源：微表单「${row.formNameSnapshot || row.formId}」提交 #${row.id}`,
    row.sourceCode ? `来源码：${row.sourceCode}` : '',
    prefill.serviceText ? `客户选择服务：${prefill.serviceText}` : '',
    prefill.date || prefill.startTime ? `客户期望时段：${[prefill.date, prefill.startTime, prefill.endTime ? `-${prefill.endTime}` : ''].join(' ').trim()}` : '',
    summary ? `回答：${summary}` : '',
    row.remark ? `提交备注：${row.remark}` : '',
  ].filter(Boolean)
  return parts.join('\n')
}

export const buildSubmissionInitial = (
  row: MicroFormSubmissionDto,
  params: {
    prefill: SubmissionBookingPrefill
    stores: StoreInfo[]
    selectedStoreName?: string
    draft: StaffBookingEntryDraft
  },
): StaffBookingInitial => {
  const matchedStore = params.prefill.storeId ? params.stores.find(store => store.backendId === params.prefill.storeId) : null
  return {
    sourceSubmissionId: row.id,
    storeName: matchedStore?.name || params.selectedStoreName || params.draft.storeName,
    serviceGroupId: params.prefill.serviceGroupId || params.draft.serviceGroupId || undefined,
    name: params.prefill.name,
    phone: params.prefill.phone,
    scheduleMode: 'UNDECIDED',
    date: params.prefill.date || params.draft.date,
    startTime: params.prefill.startTime || params.draft.startTime,
    endTime: params.prefill.endTime || undefined,
    remark: buildSubmissionBookingRemark(row),
  }
}

export const buildReturnInitialFromQuery = (
  query: Record<string, unknown>,
  params: {
    stores: StoreInfo[]
    selectedStoreName?: string
    draft: StaffBookingEntryDraft
  },
): StaffBookingInitial | null => {
  const date = readQueryString(query.date)
  const storeId = readQueryString(query.storeId)
  const serviceGroupId = readQueryString(query.serviceGroupId)
  const slotStart = readQueryString(query.slotStart)
  const slotEnd = readQueryString(query.slotEnd)
  const startTime = slotStart || readQueryString(query.startTime)
  const endTime = slotEnd || readQueryString(query.endTime)
  const matchedStore = storeId ? params.stores.find(store => String(store.backendId) === storeId) : null
  if (!shouldOpenStaffBookingReturnFromQuery(query)) return null
  return {
    storeName: matchedStore?.name || params.selectedStoreName || params.draft.storeName,
    serviceGroupId: serviceGroupId ? serviceGroupId as BackendId : params.draft.serviceGroupId || undefined,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : params.draft.date,
    startTime: /^\d{2}:\d{2}$/.test(startTime) ? startTime : params.draft.startTime,
    endTime: /^\d{2}:\d{2}$/.test(endTime) ? endTime : undefined,
  }
}

export const buildManualBookingInitial = (
  draft: StaffBookingEntryDraft,
  selectedStoreName?: string,
): StaffBookingInitial => ({
  storeName: selectedStoreName || draft.storeName,
  serviceGroupId: draft.serviceGroupId || undefined,
  date: draft.date,
  startTime: draft.startTime,
})

export const buildSlotBookingInitial = (slot: RecommendedSlot): StaffBookingInitial => ({
  storeName: slot.storeName,
  serviceGroupId: slot.serviceGroupId,
  date: slot.date,
  startTime: slot.startTime,
  endTime: slot.endTime,
})

export const buildSlotInventoryQuery = (
  slot: RecommendedSlot,
  selectedStoreId?: BackendId,
) => ({
  date: slot.date,
  storeId: selectedStoreId,
  serviceGroupId: slot.serviceGroupId,
  slotStart: slot.startTime,
  slotEnd: slot.endTime,
  returnTo: 'staffBooking',
  conflictOnly: slot.conflictCount > 0 ? '1' : undefined,
})

export const buildSubmissionRequestedSlotInventoryQuery = (
  prefill: SubmissionBookingPrefill,
  params: {
    selectedStoreId?: BackendId
    draftServiceGroupId?: BackendId | ''
    sourceSubmissionId?: BackendId
    conflictCount?: number
  },
) => ({
  date: prefill.date,
  storeId: prefill.storeId || params.selectedStoreId,
  serviceGroupId: prefill.serviceGroupId || params.draftServiceGroupId || undefined,
  slotStart: prefill.startTime,
  slotEnd: prefill.endTime || undefined,
  returnTo: 'staffBooking',
  fromSubmissionId: params.sourceSubmissionId,
  conflictOnly: params.conflictCount ? '1' : undefined,
})

export const toRecommendedSlot = (slot: BookingInventorySlot, fallbackStoreName = ''): RecommendedSlot => ({
  key: `${slot.storeBackendId}-${slot.serviceGroupBackendId}-${slot.date}-${slot.startTime}`,
  storeName: slot.storeName || fallbackStoreName,
  serviceGroupId: slot.serviceGroupBackendId,
  serviceGroupName: slot.serviceGroupName || '未命名服务组',
  date: slot.date,
  startTime: slot.startTime,
  endTime: slot.endTime,
  capacity: Number(slot.capacity || 0),
  confirmedCount: Number(slot.confirmedCount || 0),
  conflictCount: Number(slot.conflictCount || 0),
  remaining: Math.max(0, Number(slot.capacity || 0) - Number(slot.confirmedCount || 0)),
})

export const slotBlocked = (slot: RecommendedSlot) => slot.remaining <= 0 || slot.conflictCount > 0

export const slotBlockedReason = (slot: RecommendedSlot) => {
  if (slot.remaining <= 0 && slot.conflictCount > 0) {
    return `容量已满且有 ${slot.conflictCount} 单冲突；先扩容或处理冲突单，再回到同一时段录入。`
  }
  if (slot.conflictCount > 0) {
    return `该时段有 ${slot.conflictCount} 单库存冲突；先处理冲突后再录入，避免继续叠加异常。`
  }
  return `容量已满（容量 ${slot.capacity} / 已约 ${slot.confirmedCount}）；先调整容量后再录入。`
}
