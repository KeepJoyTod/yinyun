import { describe, it, expect } from 'vitest'
import type { BookingOrder } from '../../shared/stores/appStore'
import { isMissingArrivalSchedule } from '../../shared/stores/orderIssueRules'

describe('anomalyFilter', () => {
  const createOrder = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
    backendId: '1',
    storeBackendId: '1',
    id: 'ORDER-1',
    customer: '张三',
    phone: '13800000000',
    store: 'Test Store',
    service: '摄影套餐A',
    source: '微信预约',
    method: '到店拍摄',
    orderTime: '01-01 09:00',
    orderDate: '2026-01-01',
    orderClock: '09:00',
    arrivalTime: '01-01 10:00',
    status: '待确认',
    payment: '已支付',
    amount: 199,
    arrivalDate: '2026-01-01',
    arrivalClock: '10:00',
    ...overrides,
  })

  it('counts missing store mapping orders', () => {
    const orders = [
      createOrder({ storeBackendId: '999' }), // store 999 not in stores
      createOrder({ storeBackendId: '' }),
      createOrder(), // valid
    ]
    const stores = [{ backendId: '1', name: 'Test Store' }]

    const missing = orders.filter(o =>
      !o.storeBackendId || !stores.some(s => s.backendId === o.storeBackendId),
    )
    expect(missing).toHaveLength(2)
  })

  it('counts missing appointment time only for channels that require an appointment slot', () => {
    const orders = [
      createOrder({ arrivalTime: '01-01 10:00' }),
      createOrder({ id: 'LOCAL-1', arrivalTime: '', arrivalDate: '', arrivalClock: '' }),
      createOrder({ id: 'LOCAL-2', arrivalTime: '-', arrivalDate: '', arrivalClock: '' }),
      createOrder({ id: 'DOUYIN-1', source: 'DOUYIN_LIFE', arrivalTime: '', arrivalDate: '', arrivalClock: '' }),
    ]

    const missing = orders.filter(isMissingArrivalSchedule)
    expect(missing).toHaveLength(2)
  })

  it('counts missing product name', () => {
    const orders = [
      createOrder({ service: '摄影套餐A' }),
      createOrder({ service: '' }),
      createOrder({ service: '未知产品' }),
      createOrder({ service: '-' }),
    ]

    const missing = orders.filter(o => !o.service || o.service === '未知产品' || o.service === '-')
    expect(missing).toHaveLength(3)
  })

  it('filters orders by anomaly type combination', () => {
    const orders = [
      createOrder({ storeBackendId: '999', arrivalTime: '', service: '' }), // all anomalies
      createOrder({ storeBackendId: '1', arrivalTime: '2026-01-01 10:00', service: 'A' }), // clean
      createOrder({ storeBackendId: '2', arrivalTime: '2026-01-01 10:00', service: 'B' }), // missing store only
    ]
    const stores = [{ backendId: '1', name: 'Test' }]

    const missingStore = orders.filter(o =>
      !o.storeBackendId || !stores.some(s => s.backendId === o.storeBackendId),
    )
    expect(missingStore).toHaveLength(2)
  })
})
