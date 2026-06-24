import type { BookingInventorySlot, BookingOrder } from '../../shared/stores/appStore'

export type DashboardDateTab = {
  date: string
  shortLabel: string
  dateLabel: string
  active: boolean
  today: boolean
}

export type DashboardChannelOrderRow = {
  source: string
  count: number
  amount: number
}

export type DashboardChannelOrderSummary = {
  rows: DashboardChannelOrderRow[]
  totalAmount: number
  maxCount: number
}

export type DashboardInventoryConflict = {
  backendId: string
  storeName: string
  serviceGroupName: string
  window: string
  conflictCount: number
  remark: string
}

export type DashboardPendingTaskNotice = {
  type: 'success'
  message: string
} | null

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const toDateFromKey = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export const buildDashboardDateTabs = (
  selectedDateValue: string,
  todayKey: string,
): DashboardDateTab[] => {
  const selected = toDateFromKey(selectedDateValue)
  return Array.from({ length: 7 }, (_, idx) => {
    const item = new Date(selected)
    item.setDate(selected.getDate() + idx)
    const key = formatDateKey(item)
    return {
      date: key,
      shortLabel: key === todayKey ? '今天' : weekdayLabels[item.getDay()],
      dateLabel: `${pad2(item.getMonth() + 1)}月${pad2(item.getDate())}日`,
      active: key === selectedDateValue,
      today: key === todayKey,
    }
  })
}

export const buildChannelOrderSummary = (
  orders: Array<Pick<BookingOrder, 'source' | 'amount'>>,
): DashboardChannelOrderSummary => {
  const buckets = new Map<string, DashboardChannelOrderRow>()
  for (const order of orders) {
    const bucket = buckets.get(order.source) ?? { source: order.source, count: 0, amount: 0 }
    bucket.count += 1
    bucket.amount += order.amount
    buckets.set(order.source, bucket)
  }
  const rows = [...buckets.values()].sort((a, b) => b.count - a.count)
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0)
  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0)
  return { rows, totalAmount, maxCount: maxCount || 1 }
}

export const buildInventoryConflicts = (
  inventory: BookingInventorySlot[],
  selectedDateValue: string,
): DashboardInventoryConflict[] =>
  inventory
    .filter(item => item.date === selectedDateValue && item.conflictCount > 0)
    .map(item => ({
      backendId: item.backendId,
      storeName: item.storeName,
      serviceGroupName: item.serviceGroupName,
      window: `${item.startTime} - ${item.endTime}`,
      conflictCount: item.conflictCount,
      remark: item.remark,
    }))

export const buildPendingTaskNotice = (
  conflicts: number,
  pending: number,
): DashboardPendingTaskNotice => {
  if (conflicts === 0 && pending === 0) return null
  const parts: string[] = []
  if (pending > 0) parts.push(`${pending} 个订单待确认`)
  if (conflicts > 0) parts.push(`${conflicts} 个时段库存冲突`)
  return { type: 'success', message: `当前待处理：${parts.join('，')}` }
}
