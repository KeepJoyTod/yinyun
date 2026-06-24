import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { BookingInventorySlot } from '../../shared/stores/appStoreTypes'
import type { JianyueSlotCard, JianyueSlotGroup, JianyueSlotGroupKey, JianyueSlotServiceGroupBreakdown } from '../../shared/components/schedule/jianyueSlotTypes'
import type { ScheduleFilterKey } from './scheduleOperationTypes'

const normalizeClock = (value: string) => {
  const match = value.match(/(?:T|\s)?(\d{1,2}):(\d{2})/)
  if (!match) return '00:00'
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

const normalizeHalfHourClock = (value: string) => {
  const [hour, minute] = normalizeClock(value).split(':').map(Number)
  const normalizedMinute = minute >= 30 ? 30 : 0
  return `${String(hour || 0).padStart(2, '0')}:${String(normalizedMinute).padStart(2, '0')}`
}

const clockMinutes = (clock: string) => {
  const [hour, minute] = normalizeClock(clock).split(':').map(Number)
  return (hour || 0) * 60 + (minute || 0)
}

const resolveJianyuePeriod = (clock: string): JianyueSlotGroupKey => {
  const minutes = clockMinutes(clock)
  if (minutes < 12 * 60) return 'morning'
  if (minutes < 18 * 60) return 'afternoon'
  return 'evening'
}

const matchesStore = (storeBackendId: string | number | undefined, value: string | number | undefined | null) =>
  !storeBackendId || String(value ?? '') === String(storeBackendId)

const scheduleDateKey = (value: string) => String(value).slice(0, 10)

const scheduleClockKey = (value: string) => normalizeHalfHourClock(value)

const inventoryTimeBucketKey = (item: Pick<BookingInventorySlot, 'storeBackendId' | 'date' | 'startTime'>) =>
  [
    String(item.storeBackendId ?? ''),
    item.date,
    scheduleClockKey(item.startTime),
  ].join('|')

const inventoryTimeKey = (item: Pick<BookingInventorySlot, 'storeBackendId' | 'date' | 'startTime' | 'endTime'>) =>
  [
    inventoryTimeBucketKey(item),
    item.endTime ? normalizeClock(item.endTime) : '',
  ].join('|')

const scheduleItemTimeBucketKey = (item: Pick<ScheduleItemDto, 'storeId' | 'startAt'>) =>
  [
    String(item.storeId ?? ''),
    scheduleDateKey(item.startAt),
    scheduleClockKey(item.startAt),
  ].join('|')

const scheduleItemTimeKey = (item: Pick<ScheduleItemDto, 'storeId' | 'startAt' | 'endAt'>) =>
  [
    scheduleItemTimeBucketKey(item),
    normalizeClock(item.endAt),
  ].join('|')

type InternalServiceGroupBreakdown = Omit<JianyueSlotServiceGroupBreakdown, 'remainingCount' | 'capacityLabel' | 'isFull'>

type InternalJianyueSlot = Omit<JianyueSlotCard, 'storeBackendIds' | 'serviceGroupBackendIds' | 'storeNames' | 'serviceGroupNames' | 'serviceGroupBreakdown'> & {
  storeBackendIds: Set<string>
  serviceGroupBackendIds: Set<string>
  storeNames: Set<string>
  serviceGroupNames: Set<string>
  serviceGroupBreakdown: Map<string, InternalServiceGroupBreakdown>
}

const createInternalSlot = (time: string): InternalJianyueSlot => ({
  id: time,
  time: normalizeHalfHourClock(time),
  endTime: '',
  label: normalizeHalfHourClock(time),
  orderCount: 0,
  confirmedCount: 0,
  capacity: 0,
  remainingCount: 0,
  capacityLabel: '0/-',
  conflictCount: 0,
  hasInventory: false,
  isFull: false,
  orderNos: [],
  storeBackendIds: new Set<string>(),
  serviceGroupBackendIds: new Set<string>(),
  storeNames: new Set<string>(),
  serviceGroupNames: new Set<string>(),
  serviceGroupBreakdown: new Map<string, InternalServiceGroupBreakdown>(),
})

const periodLabels: Record<JianyueSlotGroupKey, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
}

const emptyJianyueGroups = (): Record<JianyueSlotGroupKey, JianyueSlotGroup> => ({
  morning: { key: 'morning', label: periodLabels.morning, slots: [], orderCount: 0, confirmedCount: 0, capacity: 0, fullCount: 0 },
  afternoon: { key: 'afternoon', label: periodLabels.afternoon, slots: [], orderCount: 0, confirmedCount: 0, capacity: 0, fullCount: 0 },
  evening: { key: 'evening', label: periodLabels.evening, slots: [], orderCount: 0, confirmedCount: 0, capacity: 0, fullCount: 0 },
})

const parseBusinessHours = (hours: string): { start: string; end: string } => {
  const match = hours.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/)
  if (!match) return { start: '09:00', end: '21:00' }
  return { start: normalizeHalfHourClock(match[1]), end: normalizeHalfHourClock(match[2]) }
}

const buildHalfHourClocks = (start: string, end: string): Array<{ start: string; end: string }> => {
  const slots: Array<{ start: string; end: string }> = []
  let current = clockMinutes(start)
  const endMinutes = clockMinutes(end)
  while (current < endMinutes) {
    const next = current + 30
    const s = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`
    const e = next <= endMinutes
      ? `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`
      : `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
    slots.push({ start: s, end: e })
    current = next
  }
  return slots
}

export const buildJianyueSlotGroups = ({
  date,
  scheduleItems,
  inventory,
  storeBackendId,
  storeHours,
  storeName,
  defaultCapacity,
}: {
  date: string
  scheduleItems: ScheduleItemDto[]
  inventory: BookingInventorySlot[]
  storeBackendId?: string | number
  storeHours?: string
  storeName?: string
  defaultCapacity?: number
}): JianyueSlotGroup[] => {
  const slotMap = new Map<string, InternalJianyueSlot>()
  const slotIdsByTime = new Map<string, string>()
  const getSlot = (key: string, time: string) => {
    const slot = slotMap.get(key) ?? createInternalSlot(normalizeHalfHourClock(time))
    slotMap.set(key, slot)
    return slot
  }

  for (const item of inventory) {
    if (item.date !== date || !matchesStore(storeBackendId, item.storeBackendId)) continue
    const key = inventoryTimeBucketKey(item)
    const slot = getSlot(key, item.startTime)
    const endTime = normalizeClock(item.endTime)
    slot.endTime = !slot.endTime || clockMinutes(endTime) < clockMinutes(slot.endTime)
      ? endTime
      : slot.endTime
    slot.capacity += Number(item.capacity) || 0
    slot.confirmedCount += Number(item.confirmedCount) || 0
    slot.conflictCount += Number(item.conflictCount) || 0
    slot.hasInventory = true
    if (item.storeBackendId) slot.storeBackendIds.add(String(item.storeBackendId))
    if (item.serviceGroupBackendId) slot.serviceGroupBackendIds.add(String(item.serviceGroupBackendId))
    if (item.storeName) slot.storeNames.add(item.storeName)
    if (item.serviceGroupName) slot.serviceGroupNames.add(item.serviceGroupName)
    const serviceGroupBackendId = String(item.serviceGroupBackendId ?? item.serviceGroupName ?? 'ungrouped')
    const serviceGroupName = item.serviceGroupName || '未限定服务组'
    const groupBreakdown = slot.serviceGroupBreakdown.get(serviceGroupBackendId) ?? {
      serviceGroupBackendId,
      serviceGroupName,
      capacity: 0,
      confirmedCount: 0,
      conflictCount: 0,
    }
    groupBreakdown.capacity += Number(item.capacity) || 0
    groupBreakdown.confirmedCount += Number(item.confirmedCount) || 0
    groupBreakdown.conflictCount += Number(item.conflictCount) || 0
    slot.serviceGroupBreakdown.set(serviceGroupBackendId, groupBreakdown)
    slotIdsByTime.set(key, key)
  }

  for (const item of scheduleItems) {
    if (!item.startAt.startsWith(date) || !matchesStore(storeBackendId, item.storeId)) continue
    const bucketTimeKey = scheduleItemTimeBucketKey(item)
    const matchedSlotId = slotIdsByTime.get(bucketTimeKey)
    const slotKey = matchedSlotId
      ?? scheduleItemTimeBucketKey(item)
    const slot = getSlot(slotKey, item.startAt)
    slot.endTime ||= normalizeClock(item.endAt)
    slot.orderCount += 1
    slot.orderNos.push(String(item.orderNo || item.orderId || item.bookingId))
    if (item.storeId) slot.storeBackendIds.add(String(item.storeId))
    if (item.studioName) slot.storeNames.add(item.studioName)
    if (!slot.hasInventory) slot.confirmedCount += 1
  }

  if (storeHours && defaultCapacity && defaultCapacity > 0) {
    const { start, end } = parseBusinessHours(storeHours)
    const clocks = buildHalfHourClocks(start, end)
    for (const clock of clocks) {
      const key = `${String(storeBackendId ?? '')}|${date}|${clock.start}`
      if (!slotMap.has(key)) {
        const slot = createInternalSlot(clock.start)
        slot.endTime = clock.end
        slot.capacity = defaultCapacity
        slot.capacityLabel = `0/${defaultCapacity}`
        if (storeBackendId) slot.storeBackendIds.add(String(storeBackendId))
        if (storeName) slot.storeNames.add(storeName)
        slotMap.set(key, slot)
      }
    }
  }

  const groups = emptyJianyueGroups()
  const cards = [...slotMap.values()]
    .sort((a, b) => clockMinutes(a.time) - clockMinutes(b.time))
    .map<JianyueSlotCard>(slot => {
      const confirmedCount = slot.hasInventory
        ? Math.max(slot.confirmedCount, slot.orderCount)
        : slot.confirmedCount
      const remainingCount = slot.hasInventory && slot.capacity > 0
        ? Math.max(0, slot.capacity - confirmedCount)
        : 0
      const isFull = slot.hasInventory && slot.capacity > 0 && confirmedCount >= slot.capacity
      return {
        ...slot,
        confirmedCount,
        remainingCount,
        capacityLabel: slot.capacity > 0 ? `${confirmedCount}/${slot.capacity}` : `${confirmedCount}/-`,
        isFull,
        storeBackendIds: [...slot.storeBackendIds],
        serviceGroupBackendIds: [...slot.serviceGroupBackendIds],
        storeNames: [...slot.storeNames],
        serviceGroupNames: [...slot.serviceGroupNames],
        serviceGroupBreakdown: [...slot.serviceGroupBreakdown.values()]
          .map(group => {
            const remainingCount = Math.max(0, group.capacity - group.confirmedCount)
            return {
              ...group,
              remainingCount,
              capacityLabel: group.capacity > 0 ? `${group.confirmedCount}/${group.capacity}` : `${group.confirmedCount}/-`,
              isFull: group.capacity > 0 && group.confirmedCount >= group.capacity,
            }
          }),
      }
    })

  for (const slot of cards) {
    const group = groups[resolveJianyuePeriod(slot.time)]
    group.slots.push(slot)
    group.orderCount += slot.orderCount
    group.confirmedCount += slot.confirmedCount
    group.capacity += slot.capacity
    if (slot.isFull) group.fullCount += 1
  }

  return [groups.morning, groups.afternoon, groups.evening]
}

export const filterBookingInventoryForScheduleFilter = ({
  date,
  filter,
  scheduleItems,
  inventory,
  storeBackendId,
}: {
  date: string
  filter: ScheduleFilterKey
  scheduleItems: ScheduleItemDto[]
  inventory: BookingInventorySlot[]
  storeBackendId?: string | number
}) => {
  const items = inventory.filter(item => item.date === date && matchesStore(storeBackendId, item.storeBackendId))
  if (filter === 'conflict') return items.filter(item => item.conflictCount > 0)
  if (filter === 'pending') {
    const pendingKeys = new Set(
      scheduleItems
        .filter(item => item.startAt.startsWith(date) && matchesStore(storeBackendId, item.storeId) && item.bookingStatus === '待确认')
        .map(scheduleItemTimeKey),
    )
    return items.filter(item => pendingKeys.has(inventoryTimeKey(item)))
  }
  if (filter === 'confirmed') {
    return items.filter(item => item.confirmedCount > 0 || item.conflictCount > 0)
  }
  return items
}

export const filterScheduleItemsForScheduleFilter = ({
  date,
  filter,
  scheduleItems,
  inventory,
  storeBackendId,
}: {
  date: string
  filter: ScheduleFilterKey
  scheduleItems: ScheduleItemDto[]
  inventory: BookingInventorySlot[]
  storeBackendId?: string | number
}) => {
  const items = scheduleItems.filter(item => item.startAt.startsWith(date) && matchesStore(storeBackendId, item.storeId))
  if (filter === 'pending') return items.filter(item => item.bookingStatus === '待确认')
  if (filter === 'confirmed') return items.filter(item => item.bookingStatus !== '待确认')
  if (filter === 'conflict') {
    const conflictKeys = new Set(
      inventory
        .filter(item => item.date === date && matchesStore(storeBackendId, item.storeBackendId) && item.conflictCount > 0)
        .map(inventoryTimeKey),
    )
    return items.filter(item =>
      item.bookingStatus === '待确认'
      || item.orderStatus === '待确认'
      || conflictKeys.has(scheduleItemTimeKey(item)),
    )
  }
  return items
}

export const buildQuickScheduleFilters = ({
  date,
  scheduleItems,
  inventory,
  storeBackendId,
}: {
  date: string
  scheduleItems: ScheduleItemDto[]
  inventory: BookingInventorySlot[]
  storeBackendId?: string | number
}) => {
  const allItems = filterScheduleItemsForScheduleFilter({ date, filter: 'all', scheduleItems, inventory, storeBackendId })
  const pendingItems = filterScheduleItemsForScheduleFilter({ date, filter: 'pending', scheduleItems, inventory, storeBackendId })
  const confirmedItems = filterScheduleItemsForScheduleFilter({ date, filter: 'confirmed', scheduleItems, inventory, storeBackendId })
  const conflictSlots = filterBookingInventoryForScheduleFilter({ date, filter: 'conflict', scheduleItems, inventory, storeBackendId })
  return [
    { key: 'all' as const, label: '全部时段', count: allItems.length },
    { key: 'pending' as const, label: '只看待确认', count: pendingItems.length },
    { key: 'confirmed' as const, label: '只看已确认', count: confirmedItems.length },
    { key: 'conflict' as const, label: '只看冲突', count: conflictSlots.length },
  ]
}
