import { describe, expect, it } from 'vitest'
import { buildScheduleGridFallback, createScheduleGridDates } from './scheduleGridFallback'

describe('schedule grid fallback', () => {
  it('builds 14 dates from the requested start date', () => {
    expect(createScheduleGridDates('2026-06-24', 3)).toEqual([
      '2026-06-24',
      '2026-06-25',
      '2026-06-26',
    ])
  })

  it('aggregates inventory and slot orders into the same half-hour cell', () => {
    const grid = buildScheduleGridFallback({
      startDate: '2026-06-24',
      storeId: '900000000000000100',
      inventory: [
        {
          id: 'slot-1',
          storeId: '900000000000000100',
          serviceGroupId: 'g-1',
          externalSkuId: '',
          bizDate: '2026-06-24',
          startTime: '10:00',
          endTime: '10:30',
          capacity: 2,
          paidCount: 1,
          conflictCount: 0,
          status: 'ACTIVE',
          remark: '',
        },
      ],
      orders: [
        {
          id: 'order-1',
          orderNo: 'YY-001',
          customerName: '王女士',
          customerPhone: '13800000000',
          storeId: '900000000000000100',
          productId: 'product-1',
          serviceNameSnapshot: '证件照',
          source: 'MANUAL',
          serviceMethod: 'STORE',
          orderAt: '2026-06-23 12:00:00',
          arrivalAt: '2026-06-24 10:00:00',
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          amountCents: 100,
          slotDate: '2026-06-24',
          slotStartTime: '10:00',
          slotEndTime: '10:30',
          remark: '',
        },
      ],
    })

    const slot = grid.slotsByDate['2026-06-24']?.[0]
    expect(slot).toMatchObject({
      id: 'slot-1',
      storeId: '900000000000000100',
      bizDate: '2026-06-24',
      startTime: '10:00',
      endTime: '10:30',
      capacity: 2,
      paidCount: 1,
      remainCount: 1,
      slotStatus: 'SLOT_PARTIAL',
    })
    expect(slot?.orders).toEqual([
      {
        orderId: 'order-1',
        orderNo: 'YY-001',
        customerName: '王女士',
        status: 'PENDING',
        paidAmountCent: 100,
        source: 'MANUAL',
      },
    ])
  })

  it('creates order-backed fallback cells when inventory api has no slot row yet', () => {
    const grid = buildScheduleGridFallback({
      startDate: '2026-06-24',
      storeId: '900000000000000100',
      inventory: [],
      orders: [
        {
          id: 'order-2',
          orderNo: 'YY-002',
          customerName: '李先生',
          customerPhone: '13900000000',
          storeId: '900000000000000100',
          productId: 'product-2',
          serviceNameSnapshot: '写真',
          source: 'DOUYIN_LIFE',
          serviceMethod: 'ONLINE',
          orderAt: '2026-06-23 18:00:00',
          arrivalAt: '2026-06-24 18:30:00',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          amountCents: 200,
          slotDate: '2026-06-24',
          slotStartTime: '18:30',
          slotEndTime: '',
          remark: '',
        },
      ],
    })

    expect(grid.slotsByDate['2026-06-24']).toContainEqual(
      expect.objectContaining({
        startTime: '18:30',
        endTime: '19:00',
        paidCount: 1,
        capacity: 1,
        remainCount: 0,
        slotStatus: 'SLOT_FULL',
      }),
    )
  })
})
