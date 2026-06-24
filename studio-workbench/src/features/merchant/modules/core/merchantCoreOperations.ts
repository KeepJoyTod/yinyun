import type { BookingInventorySlot, BookingOrder, StoreInfo } from '../../../../shared/stores/appStoreTypes'

export type MerchantOverviewMetric = {
  eyebrow: string
  value: string
  label: string
  danger?: boolean
}

const toCount = (value: string) => Number(value.replace(/,/g, '')) || 0

export const buildMerchantOverviewMetrics = (input: {
  storeRows: StoreInfo[]
  openStoreCount: number
  todayBookings: number
  pendingOrders: number
  fullSlots: number
  readyDouyinStoreCount: number
  scopedBookingInventoryCount: number
}): MerchantOverviewMetric[] => [
  { eyebrow: '门店', value: String(input.storeRows.length), label: '当前门店' },
  { eyebrow: '营业', value: String(input.openStoreCount), label: '营业门店' },
  { eyebrow: '今日', value: String(input.todayBookings), label: '今日预约' },
  { eyebrow: '待服', value: String(input.pendingOrders), label: '待服务订单', danger: true },
  { eyebrow: '满员', value: String(input.fullSlots), label: '满员时段', danger: input.fullSlots > 0 },
  { eyebrow: '来客', value: String(input.readyDouyinStoreCount), label: '来客可投放门店' },
  { eyebrow: '本月', value: String(input.storeRows.reduce((sum, store) => sum + toCount(store.monthlyOrders), 0)), label: '本月订单' },
  {
    eyebrow: '填充',
    value: `${Math.min(100, Math.round((input.todayBookings / Math.max(input.scopedBookingInventoryCount, 1)) * 100))}%`,
    label: '今日排期填充',
  },
]

export const resolveStoreTodayOrders = (storeBackendId: string, scheduleItems: Array<{ storeId: string; startAt: string }>, todayKey: string) =>
  scheduleItems.filter(item => item.storeId === storeBackendId && item.startAt.startsWith(todayKey)).length

export const resolveStoreFillRate = (
  storeBackendId: string,
  bookingInventory: BookingInventorySlot[],
  todayKey: string,
) => {
  const slots = bookingInventory.filter(slot => slot.storeBackendId === storeBackendId && slot.date === todayKey)
  const capacity = slots.reduce((sum, slot) => sum + slot.capacity, 0)
  const confirmed = slots.reduce((sum, slot) => sum + slot.confirmedCount, 0)
  return capacity > 0 ? Math.min(100, Math.round((confirmed / capacity) * 100)) : 0
}

export const resolveMerchantStatusClass = (status: string) => {
  if (status.includes('停') || status.includes('关闭')) return 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'
  if (status.includes('满')) return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
}

export const buildScopedMerchantOrders = (orders: BookingOrder[], selectedStoreId: string) =>
  orders.filter(order => String(order.storeBackendId) === selectedStoreId)

export const buildScopedBookingInventory = (inventory: BookingInventorySlot[], selectedStoreId: string) =>
  inventory.filter(slot => slot.storeBackendId === selectedStoreId)

export const buildScopedScheduleItems = (items: Array<{ storeId: string; startAt: string }>, selectedStoreId: string) =>
  items.filter(item => item.storeId === selectedStoreId)

export const buildScopedStoreRows = (store: StoreInfo | null) => (store ? [store] : [])
