import { beforeEach, describe, expect, it } from 'vitest'
import { appDerived, appStore, type BookingOrder } from './appStore'

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

describe('appStore anomaly stats', () => {
  beforeEach(() => {
    appStore.resetRuntime()
    appStore.stores = [
      {
        backendId: '10',
        id: 'STORE-10',
        name: '测试门店',
        status: '营业中',
        manager: '',
        monthlyOrders: '0',
        pendingOrders: '0',
        address: '',
        phone: '',
        hours: '',
      },
    ]
  })

  it('does not count Douyin Life platform orders without appointment slots as missing-arrival anomalies', () => {
    appStore.orders = [
      makeOrder({
        id: 'DOUYIN-1',
        source: 'DOUYIN_LIFE',
        arrivalDate: '',
        arrivalClock: '',
        arrivalTime: '',
      }),
      makeOrder({
        id: 'LOCAL-1',
        source: '微信预约',
        arrivalDate: '',
        arrivalClock: '',
        arrivalTime: '',
      }),
    ]

    expect(appDerived.anomalyPreStats.value.missingArrivalTime).toBe(1)
  })
})
