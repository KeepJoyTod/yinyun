import { describe, expect, it } from 'vitest'
import {
  buildScheduleCsv,
  buildScheduleEntryQuery,
  buildScheduleInventoryQuery,
  buildScheduleOperationCards,
  buildScheduleOrderQuery,
  resolveSelectedScheduleBooking,
} from './scheduleOperations'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'

describe('schedule operations', () => {
  it('builds order query params that open the real appointment order page scoped to the day', () => {
    expect(buildScheduleOrderQuery('2026-06-15', 'pending', '深圳南山店', 'YY20260615001')).toEqual({
      quick: 'pending',
      time: 'arrival',
      start: '2026-06-15',
      end: '2026-06-15',
      dm: '深圳南山店',
      astore: '深圳南山店',
      q: 'YY20260615001',
    })
  })

  it('omits all-store and empty keyword query params', () => {
    expect(buildScheduleOrderQuery('2026-06-15', 'today', '全部门店', '  ')).toEqual({
      quick: 'today',
      time: 'arrival',
      start: '2026-06-15',
      end: '2026-06-15',
      dm: undefined,
      astore: undefined,
      q: undefined,
    })
  })

  it('builds inventory query params for date, store and conflict-only deep links', () => {
    expect(buildScheduleInventoryQuery('2026-06-15', '7407304729216157722', true)).toEqual({
      date: '2026-06-15',
      storeId: '7407304729216157722',
      conflictOnly: '1',
    })
  })

  it('builds booking entry query params without creating a staff-side customer reservation', () => {
    expect(buildScheduleEntryQuery('7407304729216157722')).toEqual({
      storeId: '7407304729216157722',
      entry: 'BOOKING',
      channel: 'STORE',
    })
  })

  it('builds schedule operation cards with real navigation targets', () => {
    const cards = buildScheduleOperationCards({
      date: '2026-06-15',
      storeName: '深圳南山店',
      storeBackendId: '101',
      totalCount: 8,
      pendingCount: 2,
      occupiedCount: 3,
      availableCount: 5,
    })

    expect(cards.map(card => [card.label, card.action, card.go.target])).toEqual([
      ['今日预约', '进订单', 'orders'],
      ['待确认时段', '先确认', 'orders'],
      ['已占用工位', '看冲突', 'inventory'],
      ['可接待工位', '调容量', 'inventory'],
    ])
    expect(cards[1]?.go.query).toMatchObject({ quick: 'pending', start: '2026-06-15', dm: '深圳南山店' })
    expect(cards[2]?.go.query).toMatchObject({ date: '2026-06-15', storeId: '101', conflictOnly: '1' })
  })

  it('resolves a clicked schedule booking by string-safe booking id', () => {
    expect(resolveSelectedScheduleBooking([
      { bookingId: '9001', customer: '王女士', status: 'pending' },
    ], 9001)).toEqual({ bookingId: '9001', customer: '王女士', status: 'pending' })
  })

  it('keeps the external order number on a clicked schedule booking for order deep links', () => {
    expect(resolveSelectedScheduleBooking([
      { bookingId: '9001', orderNo: 'DYL-202606160001', customer: '王女士', status: 'pending' },
    ], 9001)).toEqual({
      bookingId: '9001',
      orderNo: 'DYL-202606160001',
      customer: '王女士',
      status: 'pending',
    })
  })

  it('exports the current schedule as escaped csv text', () => {
    const rows: ScheduleItemDto[] = [
      {
        bookingId: '9001',
        orderId: '9001',
        orderNo: 'YY20260615001',
        customerName: '王女士',
        customerPhone: '138****0000',
        storeId: '101',
        studioId: '101',
        studioName: '默认工位',
        startAt: '2026-06-15T10:00:00',
        endAt: '2026-06-15T11:00:00',
        bookingStatus: '待确认',
        serviceName: '证件照,精修',
        orderStatus: '待确认',
      },
    ]

    expect(buildScheduleCsv(rows, [{ backendId: '101', name: '深圳南山店' }])).toContain(
      '9001,王女士,深圳南山店,2026-06-15T10:00:00,2026-06-15T11:00:00,待确认,待确认,"证件照,精修"',
    )
  })

})
