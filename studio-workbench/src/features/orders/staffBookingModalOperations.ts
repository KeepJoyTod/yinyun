import type { BackendId } from '../../shared/api/backendId'
import type { BookingInventorySlot } from '../../shared/stores/appStore'
import type { ServiceGroupInfo, StoreInfo } from '../../shared/stores/appStoreTypes'
import type { StaffOrderCreateInput } from '../../shared/stores/orderActionStore'
import { formatDate, normalizeClock } from '../../shared/stores/appStoreTransforms'

export type StaffBookingScheduleMode = 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE'

export type StaffBookingInitial = {
  storeName?: string
  serviceGroupId?: BackendId
  sourceSubmissionId?: BackendId
  name?: string
  phone?: string
  remark?: string
  scheduleMode?: StaffBookingScheduleMode
  date?: string
  startTime?: string
  endTime?: string
  durationMinutes?: number
}

export type StaffBookingDraft = {
  storeName: string
  serviceGroupId: BackendId | ''
  productId: BackendId | ''
  customerId: BackendId | ''
  name: string
  phone: string
  gender: string
  email: string
  scheduleMode: StaffBookingScheduleMode
  date: string
  startTime: string
  durationMinutes: number
  notifyEnabled: boolean
  payStatus: 'UNPAID' | 'PAID'
  status: 'PENDING' | 'CONFIRMED'
  remark: string
  sourceSubmissionId?: BackendId
}

export const standardDurationOptions = [15, 20, 30, 45, 60, 90, 120]

export const today = () => formatDate(new Date())

export const clockMinutes = (value?: string) => {
  const [hour = '0', minute = '0'] = normalizeClock(value || '00:00').split(':')
  return Number(hour) * 60 + Number(minute)
}

export const minutesBetweenClocks = (startTime?: string, endTime?: string) => {
  const start = clockMinutes(startTime)
  let end = clockMinutes(endTime)
  if (end <= start) end += 24 * 60
  return Math.max(15, end - start)
}

export const deriveInitialDurationMinutes = (initial: StaffBookingInitial | null | undefined, fallback: number) => {
  if (Number(initial?.durationMinutes) > 0) return Number(initial?.durationMinutes)
  if (initial?.startTime && initial?.endTime) return minutesBetweenClocks(initial.startTime, initial.endTime)
  return Number(fallback) || 30
}

export const buildStaffBookingDraftDefaults = (
  initial: StaffBookingInitial | null | undefined,
  stores: StoreInfo[],
  serviceGroups: ServiceGroupInfo[],
): StaffBookingDraft => {
  const storeName = initial?.storeName || stores[0]?.name || ''
  const store = stores.find(item => item.name === storeName) ?? stores[0]
  const group = serviceGroups.find(item => initial?.serviceGroupId && item.backendId === initial.serviceGroupId)
    ?? serviceGroups.find(item => store && item.storeBackendId === store.backendId)
    ?? serviceGroups[0]
  return {
    storeName: store?.name || storeName,
    serviceGroupId: group?.backendId || '',
    productId: '',
    customerId: '',
    name: initial?.name || '',
    phone: initial?.phone || '',
    gender: '',
    email: '',
    scheduleMode: initial?.scheduleMode || 'SCHEDULED',
    date: initial?.date || today(),
    startTime: normalizeClock(initial?.startTime || '10:00'),
    durationMinutes: deriveInitialDurationMinutes(initial, group?.durationMinutes || 30),
    notifyEnabled: true,
    payStatus: 'UNPAID',
    status: 'PENDING',
    remark: initial?.remark || '',
    sourceSubmissionId: initial?.sourceSubmissionId,
  }
}

export const buildDurationOptions = (durationMinutes: number) => [...new Set([...standardDurationOptions, Number(durationMinutes)])]
  .filter(item => Number.isFinite(item) && item > 0)
  .sort((a, b) => a - b)

export const isSlotBlocked = (slot: BookingInventorySlot) => slot.confirmedCount >= slot.capacity || slot.conflictCount > 0

export const findBlockedInventorySlot = (
  inventorySlots: BookingInventorySlot[],
  params: {
    date: string
    startTime: string
    endTime: string
  },
) => {
  const draftStart = clockMinutes(params.startTime)
  const draftEnd = clockMinutes(params.endTime)
  if (!Number.isFinite(draftStart) || !Number.isFinite(draftEnd)) return null
  const blockedSlot = inventorySlots.find(slot => {
    if (slot.date !== params.date) return false
    const slotStart = clockMinutes(slot.startTime)
    const slotEnd = clockMinutes(slot.endTime)
    if (!Number.isFinite(slotStart) || !Number.isFinite(slotEnd)) return false
    return draftStart < slotEnd && draftEnd > slotStart && isSlotBlocked(slot)
  })
  return blockedSlot ?? null
}

export const validateStaffBookingDraft = (
  draft: StaffBookingDraft,
  params: {
    hasStore: boolean
    hasServiceGroup: boolean
  },
) => {
  if (!params.hasStore) return '请选择门店'
  if (!params.hasServiceGroup) return '请选择服务组'
  if (!draft.name.trim()) return '请输入客户姓名'
  if (!/^1\d{10}$/.test(draft.phone.replace(/\D/g, ''))) return '请输入正确的客户手机号'
  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return '请输入正确的邮箱'
  if (draft.scheduleMode !== 'UNDECIDED' && !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return '请输入正确的预约日期'
  if (draft.scheduleMode !== 'UNDECIDED' && !/^\d{2}:\d{2}$/.test(normalizeClock(draft.startTime))) return '请输入正确的开始时间'
  return ''
}

export const buildStaffOrderCreateInput = (
  draft: StaffBookingDraft,
  params: {
    serviceGroup: ServiceGroupInfo
    product?: { name: string, backendId?: BackendId } | null
    slotEndTime: string
    submitMode: StaffOrderCreateInput['submitMode']
  },
): StaffOrderCreateInput => ({
  name: draft.name,
  phone: draft.phone,
  gender: draft.gender,
  email: draft.email,
  customerId: draft.customerId || null,
  store: draft.storeName,
  product: params.product?.name || params.serviceGroup.name,
  productId: params.product?.backendId ?? null,
  date: draft.date,
  time: normalizeClock(draft.startTime),
  serviceGroupId: params.serviceGroup.backendId,
  scheduleMode: draft.scheduleMode,
  durationMinutes: Number(draft.durationMinutes) || params.serviceGroup.durationMinutes || 30,
  slotDate: draft.date,
  slotStartTime: draft.startTime,
  slotEndTime: params.slotEndTime,
  notifyEnabled: draft.notifyEnabled,
  submitMode: params.submitMode,
  payStatus: draft.payStatus,
  status: draft.status,
  remark: draft.remark,
})
