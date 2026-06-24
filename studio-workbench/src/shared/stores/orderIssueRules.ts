import type { BookingOrder } from './appStoreTypes'

export const hasCustomerContact = (order: BookingOrder) =>
  Boolean(String(order.customer ?? '').trim() && String(order.phone ?? '').trim())

export const isDouyinLifeOrder = (order: BookingOrder) => {
  const source = String(order.source ?? '').trim().toUpperCase()
  return source === 'DOUYIN_LIFE' || String(order.source ?? '').includes('抖音来客')
}

export const getOrderOperationalDate = (order: BookingOrder) =>
  order.arrivalDate || (isDouyinLifeOrder(order) ? order.orderDate : '')

export const isMissingArrivalSchedule = (order: BookingOrder) =>
  !isDouyinLifeOrder(order) && (!order.arrivalDate || !order.arrivalClock || !order.arrivalTime || order.arrivalTime === '-')

export const isOperationalOrder = (order: BookingOrder) =>
  hasCustomerContact(order) && Boolean(getOrderOperationalDate(order))
