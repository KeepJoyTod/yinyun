import { describe, expect, it } from 'vitest'
import type { BookingOrder } from './appStoreTypes'
import {
  getOrderOperationalDate,
  hasCustomerContact,
  isMissingArrivalSchedule,
  isOperationalOrder,
} from './orderIssueRules'

const makeOrder = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
  backendId: '1',
  storeBackendId: '10',
  id: 'ORDER-1',
  customer: '张三',
  phone: '13800000000',
  store: '测试门店',
  service: '证件照套餐',
  source: '微信预约',
  method: '到店拍摄',
  orderTime: '06-16 10:00',
  orderDate: '2026-06-16',
  orderClock: '10:00',
  arrivalTime: '06-16 14:00',
  status: '待确认',
  payment: '已支付',
  amount: 199,
  arrivalDate: '2026-06-16',
  arrivalClock: '14:00',
  ...overrides,
})

describe('order issue rules', () => {
  it('uses Douyin Life order date as the operational date when the platform order has no appointment slot', () => {
    const order = makeOrder({
      source: 'DOUYIN_LIFE',
      arrivalDate: '',
      arrivalClock: '',
      arrivalTime: '',
    })

    expect(getOrderOperationalDate(order)).toBe('2026-06-16')
    expect(isOperationalOrder(order)).toBe(true)
    expect(isMissingArrivalSchedule(order)).toBe(false)
  })

  it('keeps non-Douyin orders without an appointment slot in the missing schedule flow', () => {
    const order = makeOrder({
      source: '微信预约',
      arrivalDate: '',
      arrivalClock: '',
      arrivalTime: '',
    })

    expect(getOrderOperationalDate(order)).toBe('')
    expect(isOperationalOrder(order)).toBe(false)
    expect(isMissingArrivalSchedule(order)).toBe(true)
  })

  it('still requires real customer contact before an order enters the staff work queue', () => {
    const order = makeOrder({
      source: '抖音来客',
      phone: '',
      arrivalDate: '',
      arrivalClock: '',
      arrivalTime: '',
    })

    expect(hasCustomerContact(order)).toBe(false)
    expect(isOperationalOrder(order)).toBe(false)
  })
})
