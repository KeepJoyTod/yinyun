import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { BookingInventorySlot, BookingOrder, StoreInfo } from '../../shared/stores/appStore'
import { isDouyinLifeOrder } from '../../shared/stores/orderIssueRules'

export type OrderSlotRange = {
  start?: string
  end?: string
}

const toClockMinutes = (clock: string) => {
  const match = clock.trim().match(/^(\d{2}):(\d{2})$/)
  if (!match) return Number.NaN
  return Number(match[1]) * 60 + Number(match[2])
}

export const matchesOrderSlotRange = (order: BookingOrder, slotRange: OrderSlotRange) => {
  const start = slotRange.start?.trim() || ''
  const end = slotRange.end?.trim() || ''
  if (!start && !end) return true
  const arrival = toClockMinutes(order.arrivalClock || '')
  if (!Number.isFinite(arrival)) return false
  const startMinutes = toClockMinutes(start)
  if (!Number.isFinite(startMinutes)) return true
  if (!end) return arrival === startMinutes
  const endMinutes = toClockMinutes(end)
  if (!Number.isFinite(endMinutes)) return arrival === startMinutes
  return arrival >= startMinutes && arrival < endMinutes
}

const toScheduleDatePart = (value: string) => value.slice(0, 10)

const toScheduleClockPart = (value: string) => value.match(/T(\d{2}:\d{2})/)?.[1] ?? ''

const normalizeScheduleStatus = (value: string): BookingOrder['status'] => {
  if (['待确认', '已确认', '已到店', '服务中', '拍摄中', '选片中', '已完成', '已取消', '已退单'].includes(value)) {
    return value as BookingOrder['status']
  }
  if (value === '待服务') return '待确认'
  if (value === 'ARRIVED') return '已到店'
  if (value === 'SERVING') return '服务中'
  if (value === 'COMPLETED') return '已完成'
  if (value === 'CANCELLED') return '已取消'
  if (value === 'REFUNDED') return '已退单'
  if (value === 'CONFIRMED') return '已确认'
  return '待确认'
}

export const mapScheduleItemToSlotOrder = (item: ScheduleItemDto, stores: StoreInfo[] = []): BookingOrder => {
  const store = stores.find(row => row.backendId === item.storeId)
  const arrivalDate = toScheduleDatePart(item.startAt)
  const arrivalClock = toScheduleClockPart(item.startAt)
  return {
    backendId: item.orderId || item.bookingId,
    storeBackendId: item.storeId,
    id: item.orderNo || String(item.orderId || item.bookingId),
    customer: item.customerName,
    phone: item.customerPhone,
    store: store?.name || item.studioName || `门店 #${item.storeId}`,
    service: item.serviceName,
    source: item.serviceName?.includes('简约网') ? '简约网' : '排期',
    method: '时段排期',
    orderTime: '',
    orderDate: arrivalDate,
    orderClock: '',
    arrivalTime: arrivalDate && arrivalClock ? `${arrivalDate.slice(5)} ${arrivalClock}` : '',
    status: normalizeScheduleStatus(item.orderStatus || item.bookingStatus),
    payment: '已支付',
    amount: 0,
    arrivalDate,
    arrivalClock,
  }
}

const isInventoryConflictMessage = (message: string) =>
  /库存|冲突|超卖|capacity|inventory|slot/i.test(message)

export { isInventoryConflictMessage }

export const getOrderFilterDate = (
  order: BookingOrder,
  selectedTimeType: 'order' | 'arrival',
  fallbackDateKey: string,
) => {
  if (selectedTimeType === 'order') {
    if (order.orderDate) return order.orderDate
    const year = (order.arrivalDate || fallbackDateKey).slice(0, 4)
    return parseMDHMToISODate(order.orderTime, year)
  }
  if (order.arrivalDate) return order.arrivalDate
  const year = (order.orderDate || fallbackDateKey).slice(0, 4)
  const parsedArrivalDate = parseMDHMToISODate(order.arrivalTime, year)
  return parsedArrivalDate || (isDouyinLifeOrder(order) ? order.orderDate : '')
}

export const parseMDHMToISODate = (value: string, fallbackYear: string) => {
  const match = value.match(/^(\d{2})-(\d{2})\s+\d{2}:\d{2}$/)
  if (!match) return ''
  return `${fallbackYear}-${match[1]}-${match[2]}`
}

export const getOrderInventoryConflictSlot = (
  order: BookingOrder,
  slots: BookingInventorySlot[],
) => {
  const orderLevelConflict = order.inventoryStatus === 'CONFLICT'
  if (!order.storeBackendId || !order.arrivalDate || !order.arrivalClock) {
    return orderLevelConflict
      ? {
          backendId: order.inventorySlotId,
          storeBackendId: order.storeBackendId,
          date: order.arrivalDate,
          startTime: order.arrivalClock,
          endTime: order.arrivalClock,
          capacity: 0,
          confirmedCount: 0,
          conflictCount: 1,
          status: 'CONFLICT',
          remark: order.conflictReason || '订单库存冲突',
        }
      : null
  }
  const arrivalMinutes = toClockMinutes(order.arrivalClock)
  if (!Number.isFinite(arrivalMinutes)) return null

  const slot = slots.find(slot => {
    if (slot.conflictCount <= 0) return false
    if (slot.storeBackendId !== order.storeBackendId) return false
    if (slot.date !== order.arrivalDate) return false
    if (order.inventorySlotId && slot.backendId !== order.inventorySlotId) return false
    if (order.serviceGroupBackendId && slot.serviceGroupBackendId && slot.serviceGroupBackendId !== order.serviceGroupBackendId) {
      return false
    }
    if (order.externalSkuId && slot.externalSkuId && slot.externalSkuId !== order.externalSkuId) return false
    const start = toClockMinutes(slot.startTime)
    const end = toClockMinutes(slot.endTime)
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false
    return arrivalMinutes >= start && arrivalMinutes < end
  })
  if (slot) return slot
  if (!orderLevelConflict) return null
  return {
    backendId: order.inventorySlotId,
    storeBackendId: order.storeBackendId,
    serviceGroupBackendId: order.serviceGroupBackendId,
    date: order.arrivalDate,
    startTime: order.arrivalClock,
    endTime: order.arrivalClock,
    capacity: 0,
    confirmedCount: 0,
    conflictCount: 1,
    status: 'CONFLICT',
    remark: order.conflictReason || '订单库存冲突',
    externalSkuId: order.externalSkuId,
  }
}

export type RescheduleInventoryDraft = {
  date: string
  time: string
  durationMinutes?: number
}

const addMinutesToClock = (clock: string, minutes: number) => {
  const start = toClockMinutes(clock)
  if (!Number.isFinite(start)) return Number.NaN
  return start + Math.max(15, Number(minutes) || 60)
}

const matchesOrderInventoryDimension = (order: BookingOrder, slot: BookingInventorySlot) => {
  if (order.serviceGroupBackendId && slot.serviceGroupBackendId && slot.serviceGroupBackendId !== order.serviceGroupBackendId) {
    return false
  }
  if (order.externalSkuId && slot.externalSkuId && slot.externalSkuId !== order.externalSkuId) return false
  return true
}

export const getOrderRescheduleInventorySlot = (
  order: BookingOrder,
  slots: BookingInventorySlot[],
  draft: RescheduleInventoryDraft,
) => {
  if (!order.storeBackendId || !draft.date || !draft.time) return null
  const draftStart = toClockMinutes(draft.time)
  const draftEnd = addMinutesToClock(draft.time, draft.durationMinutes ?? 60)
  if (!Number.isFinite(draftStart) || !Number.isFinite(draftEnd)) return null

  return slots.find(slot => {
    if (slot.storeBackendId !== order.storeBackendId) return false
    if (slot.date !== draft.date) return false
    if (!matchesOrderInventoryDimension(order, slot)) return false
    const slotStart = toClockMinutes(slot.startTime)
    const slotEnd = toClockMinutes(slot.endTime)
    if (!Number.isFinite(slotStart) || !Number.isFinite(slotEnd)) return false
    return draftStart < slotEnd && draftEnd > slotStart
  }) ?? null
}

export const buildOrderRescheduleConflictMessage = (
  order: BookingOrder,
  slots: BookingInventorySlot[],
  draft: RescheduleInventoryDraft,
) => {
  const slot = getOrderRescheduleInventorySlot(order, slots, draft)
  if (!slot) return ''
  const reasons: string[] = []
  if (slot.confirmedCount >= slot.capacity) reasons.push('已满')
  if (slot.conflictCount > 0) reasons.push(`有 ${slot.conflictCount} 条冲突`)
  if (slot.status && slot.status !== 'ACTIVE') reasons.push(`状态 ${slot.status}`)
  if (!reasons.length) return ''
  const detail = `目标时段 ${slot.startTime}-${slot.endTime} ${reasons.join('且')}；容量 ${slot.capacity}，已确认 ${slot.confirmedCount}。`
  return `${detail}${slot.remark ? slot.remark : ''}`.trim()
}
