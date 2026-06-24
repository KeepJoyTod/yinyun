import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { StoreInfo } from '../../shared/stores/appStoreTypes'
import type {
  ScheduleBookingSelection,
  ScheduleFilterKey,
  ScheduleNavigationTarget,
  ScheduleOperationCard,
  ScheduleOperationCardAction,
} from './scheduleOperationTypes'

export type {
  ScheduleBookingSelection,
  ScheduleFilterKey,
  ScheduleNavigationTarget,
  ScheduleOperationCard,
  ScheduleOperationCardAction,
}

const escapeCsvCell = (value: string | number | null | undefined) => {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const buildScheduleOrderQuery = (
  date: string,
  quick: 'today' | 'pending' | 'all' = 'today',
  storeName?: string,
  keyword?: string,
  storeBackendId?: string,
) => ({
  quick,
  time: 'arrival',
  start: date,
  end: date,
  storeId: storeBackendId || undefined,
  dm: storeName && storeName !== '全部门店' ? storeName : undefined,
  astore: storeName && storeName !== '全部门店' ? storeName : undefined,
  q: keyword?.trim() || undefined,
})

export const buildScheduleInventoryQuery = (
  date: string,
  storeBackendId?: string,
  conflictOnly = false,
) => ({
  date,
  storeId: storeBackendId || undefined,
  conflictOnly: conflictOnly ? '1' : undefined,
})

export const buildScheduleEntryQuery = (
  storeBackendId?: string,
  entry: 'BOOKING' | 'STORE' = 'BOOKING',
) => ({
  storeId: storeBackendId || undefined,
  entry,
  channel: 'STORE',
})

export const buildScheduleCsv = (items: ScheduleItemDto[], stores: Pick<StoreInfo, 'backendId' | 'name'>[]) => {
  const storeName = (storeId: string | number) =>
    stores.find(store => String(store.backendId) === String(storeId))?.name ?? `门店 #${storeId}`
  const rows = [
    ['订单ID', '客户', '门店', '开始时间', '结束时间', '预约状态', '订单状态', '服务'],
    ...items.map(item => [
      item.bookingId,
      item.customerName,
      storeName(item.storeId),
      item.startAt,
      item.endAt,
      item.bookingStatus,
      item.orderStatus,
      item.serviceName,
    ]),
  ]
  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n')
}

export const resolveSelectedScheduleBooking = (
  bookings: ScheduleBookingSelection[],
  bookingId: string | number,
) => bookings.find(booking => String(booking.bookingId ?? booking.id) === String(bookingId)) ?? null

export const buildScheduleOperationCards = ({
  date,
  storeName,
  storeBackendId,
  totalCount,
  pendingCount,
  occupiedCount,
  availableCount,
}: {
  date: string
  storeName: string
  storeBackendId?: string
  totalCount: number
  pendingCount: number
  occupiedCount: number
  availableCount: number
}): ScheduleOperationCard[] => [
  {
    label: '今日预约',
    value: String(totalCount),
    hint: '当前日期下已排入工位的预约时段。',
    action: '进订单',
    scope: 'BOOK',
    filter: 'all',
    go: { target: 'orders', query: buildScheduleOrderQuery(date, 'today', storeName, undefined, storeBackendId) },
  },
  {
    label: '待确认时段',
    value: String(pendingCount),
    hint: '还未确认的预约时段，需要优先联系客户。',
    action: '先确认',
    scope: 'WAIT',
    filter: 'pending',
    go: { target: 'orders', query: buildScheduleOrderQuery(date, 'pending', storeName, undefined, storeBackendId) },
  },
  {
    label: '已占用工位',
    value: String(occupiedCount),
    hint: '当前筛选下已有预约占用的工位数量。',
    action: '看冲突',
    scope: 'USED',
    filter: 'conflict',
    go: { target: 'inventory', query: buildScheduleInventoryQuery(date, storeBackendId, true) },
  },
  {
    label: '可接待工位',
    value: String(availableCount),
    hint: '仍可安排预约或调整服务组容量。',
    action: '调容量',
    scope: 'FREE',
    go: { target: 'inventory', query: buildScheduleInventoryQuery(date, storeBackendId) },
  },
]
