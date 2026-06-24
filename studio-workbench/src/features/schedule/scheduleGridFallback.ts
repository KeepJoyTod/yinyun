import type { BackendId } from '../../shared/api/backendId'
import type {
  BookingInventoryDto,
  DashboardScheduleGridDto,
  OrderDto,
  ScheduleGridOrderSummaryDto,
  ScheduleGridSlotDto,
} from '../../shared/api/backendTypes'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const pad2 = (value: number) => String(value).padStart(2, '0')

const normalizeDateKey = (value?: string | null) => {
  const candidate = String(value ?? '').trim().slice(0, 10)
  return datePattern.test(candidate) ? candidate : ''
}

const normalizeClock = (value?: string | null) => {
  const match = String(value ?? '').trim().match(/(\d{1,2}):(\d{2})/)
  if (!match) return ''
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

const addMinutesToClock = (clock: string, minutes: number) => {
  const [hour, minute] = normalizeClock(clock).split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return ''
  const total = hour * 60 + minute + minutes
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60)
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`
}

const compareClocks = (left: string, right: string) => normalizeClock(left).localeCompare(normalizeClock(right))

export const createScheduleGridDates = (startDate: string, days = 14) => {
  const normalized = normalizeDateKey(startDate)
  const base = normalized ? new Date(`${normalized}T00:00:00`) : new Date()
  return Array.from({ length: days }, (_, index) => {
    const next = new Date(base)
    next.setDate(base.getDate() + index)
    return `${next.getFullYear()}-${pad2(next.getMonth() + 1)}-${pad2(next.getDate())}`
  })
}

type GridSlotAccumulator = ScheduleGridSlotDto & {
  hasInventory: boolean
}

const resolveSlotStatus = (slot: Pick<ScheduleGridSlotDto, 'capacity' | 'paidCount' | 'conflictCount'>) => {
  if (slot.conflictCount > 0) return 'SLOT_CONFLICT'
  if (slot.capacity > 0 && slot.paidCount >= slot.capacity) return 'SLOT_FULL'
  if (slot.paidCount > 0) return 'SLOT_PARTIAL'
  return 'SLOT_EMPTY'
}

const toOrderSummary = (order: OrderDto): ScheduleGridOrderSummaryDto => ({
  orderId: order.id,
  orderNo: order.orderNo,
  customerName: order.customerName,
  status: order.status,
  paidAmountCent: order.amountCents,
  source: order.source ?? '',
})

const buildSlotKey = (storeId: BackendId | null | undefined, date: string, startTime: string, endTime: string) =>
  [String(storeId ?? ''), date, startTime, endTime].join('|')

export const buildScheduleGridFallback = ({
  startDate,
  storeId,
  inventory,
  orders,
}: {
  startDate: string
  storeId?: BackendId | null
  inventory: BookingInventoryDto[]
  orders: OrderDto[]
}): DashboardScheduleGridDto => {
  const dates = createScheduleGridDates(startDate)
  const validDates = new Set(dates)
  const slotMap = new Map<string, GridSlotAccumulator>()
  const slotsByDate = Object.fromEntries(dates.map(date => [date, [] as ScheduleGridSlotDto[]])) as Record<string, ScheduleGridSlotDto[]>

  for (const row of inventory) {
    const date = normalizeDateKey(row.bizDate)
    const startTime = normalizeClock(row.startTime)
    const endTime = normalizeClock(row.endTime)
    if (!date || !startTime || !endTime || !validDates.has(date)) continue
    if (storeId && String(row.storeId) !== String(storeId)) continue
    const key = buildSlotKey(row.storeId, date, startTime, endTime)
    const current = slotMap.get(key) ?? {
      id: row.id,
      storeId: row.storeId,
      bizDate: date,
      startTime,
      endTime,
      capacity: 0,
      paidCount: 0,
      conflictCount: 0,
      remainCount: 0,
      slotStatus: 'SLOT_EMPTY',
      orders: [],
      hasInventory: false,
    }
    current.capacity += Number(row.capacity) || 0
    current.paidCount += Number(row.paidCount) || 0
    current.conflictCount += Number(row.conflictCount) || 0
    current.hasInventory = true
    slotMap.set(key, current)
  }

  for (const order of orders) {
    const date = normalizeDateKey(order.slotDate)
    const startTime = normalizeClock(order.slotStartTime)
    const endTime = normalizeClock(order.slotEndTime) || addMinutesToClock(startTime, 30)
    if (!date || !startTime || !endTime || !validDates.has(date)) continue
    if (storeId && String(order.storeId) !== String(storeId)) continue
    const key = buildSlotKey(order.storeId, date, startTime, endTime)
    const current = slotMap.get(key) ?? {
      id: order.inventorySlotId ?? order.id,
      storeId: order.storeId,
      bizDate: date,
      startTime,
      endTime,
      capacity: 0,
      paidCount: 0,
      conflictCount: 0,
      remainCount: 0,
      slotStatus: 'SLOT_EMPTY',
      orders: [],
      hasInventory: false,
    }
    current.orders.push(toOrderSummary(order))
    if (!current.hasInventory) {
      current.paidCount += 1
      current.capacity = Math.max(current.capacity, current.paidCount)
    }
    slotMap.set(key, current)
  }

  for (const slot of slotMap.values()) {
    slot.remainCount = Math.max(0, slot.capacity - slot.paidCount)
    slot.slotStatus = resolveSlotStatus(slot)
    slotsByDate[slot.bizDate]?.push({
      id: slot.id,
      storeId: slot.storeId,
      bizDate: slot.bizDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      paidCount: slot.paidCount,
      conflictCount: slot.conflictCount,
      remainCount: slot.remainCount,
      slotStatus: slot.slotStatus,
      orders: slot.orders,
    })
  }

  for (const date of dates) {
    slotsByDate[date] = (slotsByDate[date] ?? []).sort((left, right) => compareClocks(left.startTime, right.startTime))
  }

  return {
    storeId: storeId ?? null,
    dates,
    slotsByDate,
  }
}
