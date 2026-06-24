import { describe, expect, it } from 'vitest'
import { buildDashboardScheduleItems } from './dashboardOperations'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { BookingOrder } from '../../shared/stores/appStoreTypes'

const baseOrder = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
  backendId: '900000000000001001',
  storeBackendId: '900000000000000100',
  id: 'JY-20260618-001',
  customer: '王女士',
  phone: '138****0000',
  store: '滨州万达店',
  service: '证件照',
  source: '门店录入',
  method: '到店拍摄',
  orderTime: '06-18 09:30',
  orderDate: '2026-06-18',
  orderClock: '09:30',
  arrivalTime: '06-18 10:00',
  status: '已确认',
  payment: '已支付',
  amount: 99,
  arrivalDate: '2026-06-18',
  arrivalClock: '10:00',
  ...overrides,
})

const baseScheduleItem = (overrides: Partial<ScheduleItemDto> = {}): ScheduleItemDto => ({
  bookingId: '900000000000001001',
  orderId: '900000000000001001',
  storeId: '900000000000000100',
  studioId: '900000000000000100',
  studioName: '滨州万达店',
  startAt: '2026-06-18T10:00:00',
  endAt: '2026-06-18T10:30:00',
  bookingStatus: '已确认',
  orderNo: 'JY-20260618-001',
  customerName: '王女士',
  customerPhone: '138****0000',
  serviceName: '证件照',
  orderStatus: '已确认',
  ...overrides,
})

describe('dashboard operations', () => {
  it('does not duplicate schedule rows when ledger order matches schedule by backend id', () => {
    const rows = buildDashboardScheduleItems({
      scheduleItems: [baseScheduleItem({ orderNo: '平台订单号不同也不影响' })],
      selectedDateOrders: [baseOrder()],
      selectedStoreBackendId: '900000000000000100',
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.bookingId).toBe('900000000000001001')
  })

  it('does not duplicate schedule rows when ledger order matches schedule by order number', () => {
    const rows = buildDashboardScheduleItems({
      scheduleItems: [baseScheduleItem({ bookingId: 'schedule-row-id', orderId: 'schedule-row-id' })],
      selectedDateOrders: [baseOrder({ backendId: 'ledger-backend-id' })],
      selectedStoreBackendId: '900000000000000100',
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.bookingId).toBe('schedule-row-id')
  })

  it('does not fabricate dashboard slot rows from ledger orders without real slot records', () => {
    const rows = buildDashboardScheduleItems({
      scheduleItems: [],
      selectedDateOrders: [
        baseOrder(),
        baseOrder({ backendId: 'other-store-order', id: 'JY-OTHER', storeBackendId: '900000000000000200' }),
        baseOrder({ backendId: 'missing-time-order', id: 'JY-NO-TIME', arrivalClock: '' }),
      ],
      selectedStoreBackendId: '900000000000000100',
      selectedDate: '2026-06-18',
    })

    expect(rows).toEqual([])
  })

  it('keeps the dashboard slot board scoped to concrete store and date from real schedule rows only', () => {
    const rows = buildDashboardScheduleItems({
      scheduleItems: [
        baseScheduleItem(),
        baseScheduleItem({
          bookingId: 'other-date',
          orderId: 'other-date',
          orderNo: 'JY-20260619-001',
          startAt: '2026-06-19T10:00:00',
          endAt: '2026-06-19T10:30:00',
        }),
        baseScheduleItem({
          bookingId: 'other-store',
          orderId: 'other-store',
          orderNo: 'JY-20260618-101',
          storeId: '900000000000000200',
          studioId: '900000000000000200',
          studioName: '威海智慧谷店',
        }),
      ],
      selectedDateOrders: [
        baseOrder({ backendId: 'legacy-no-slot', id: 'JY-LEGACY-001', arrivalClock: '11:00' }),
      ],
      selectedStoreBackendId: '900000000000000100',
      selectedDate: '2026-06-18',
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      bookingId: '900000000000001001',
      storeId: '900000000000000100',
      startAt: '2026-06-18T10:00:00',
      endAt: '2026-06-18T10:30:00',
    })
    expect(rows.map(item => item.orderNo)).not.toContain('JY-LEGACY-001')
  })
})
