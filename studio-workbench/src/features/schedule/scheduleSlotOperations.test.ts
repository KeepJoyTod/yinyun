import { describe, expect, it } from 'vitest'
import {
  buildJianyueSlotGroups,
  buildQuickScheduleFilters,
  filterBookingInventoryForScheduleFilter,
  filterScheduleItemsForScheduleFilter,
} from './scheduleOperations'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { BookingInventorySlot } from '../../shared/stores/appStoreTypes'

describe('schedule slot operations', () => {
  it('groups appointment slots by morning afternoon and evening with full badge state', () => {
    const scheduleItems: ScheduleItemDto[] = [
      {
        bookingId: '9001',
        orderId: '9001',
        orderNo: 'DYL-1001',
        customerName: '王女士',
        customerPhone: '138****0000',
        storeId: '101',
        studioId: '101',
        studioName: '滨州万达店 · 默认工位',
        startAt: '2026-06-16T10:30:00',
        endAt: '2026-06-16T11:00:00',
        bookingStatus: '已确认',
        serviceName: '证件照',
        orderStatus: '已确认',
      },
      {
        bookingId: '9002',
        orderId: '9002',
        orderNo: 'DYL-1002',
        customerName: '李女士',
        customerPhone: '139****0000',
        storeId: '101',
        studioId: '101',
        studioName: '滨州万达店 · 默认工位',
        startAt: '2026-06-16T18:30:00',
        endAt: '2026-06-16T19:00:00',
        bookingStatus: '待确认',
        serviceName: '形象照',
        orderStatus: '待确认',
      },
    ]
    const inventory: BookingInventorySlot[] = [
      {
        backendId: 'slot-1000',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupName: '证件照组',
        date: '2026-06-16',
        startTime: '10:00',
        endTime: '10:30',
        capacity: 2,
        confirmedCount: 0,
        conflictCount: 0,
        status: 'OPEN',
        remark: '',
        externalSkuId: 'sku-1',
      },
      {
        backendId: 'slot-1030',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupName: '证件照组',
        date: '2026-06-16',
        startTime: '10:30',
        endTime: '11:00',
        capacity: 1,
        confirmedCount: 1,
        conflictCount: 0,
        status: 'OPEN',
        remark: '',
        externalSkuId: 'sku-1',
      },
      {
        backendId: 'slot-1830',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupName: '形象照组',
        date: '2026-06-16',
        startTime: '18:30',
        endTime: '19:00',
        capacity: 2,
        confirmedCount: 1,
        conflictCount: 0,
        status: 'OPEN',
        remark: '',
        externalSkuId: 'sku-2',
      },
    ]

    const groups = buildJianyueSlotGroups({
      date: '2026-06-16',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    })

    expect(groups.map(group => [group.key, group.label, group.slots.length])).toEqual([
      ['morning', '上午', 2],
      ['afternoon', '下午', 0],
      ['evening', '晚上', 1],
    ])
    expect(groups[0]?.slots.map(slot => [slot.time, slot.orderCount, slot.confirmedCount, slot.capacity, slot.isFull])).toEqual([
      ['10:00', 0, 0, 2, false],
      ['10:30', 1, 1, 1, true],
    ])
    expect(groups[0]?.slots.map(slot => [slot.time, slot.remainingCount])).toEqual([
      ['10:00', 2],
      ['10:30', 0],
    ])
    expect(groups[0]?.slots[0]).toMatchObject({
      storeBackendIds: ['101'],
      serviceGroupBackendIds: [],
    })
    expect(groups[2]?.slots[0]).toMatchObject({
      time: '18:30',
      orderCount: 1,
      capacityLabel: '1/2',
      orderNos: ['DYL-1002'],
      storeBackendIds: ['101'],
    })
  })

  it('keeps order-only real slots visible when inventory is missing', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-16',
      scheduleItems: [
        {
          bookingId: '9003',
          orderId: '9003',
          orderNo: 'DYL-1003',
          customerName: '赵先生',
          customerPhone: '137****0000',
          storeId: '202',
          studioId: '202',
          studioName: '威海智慧谷店 · 默认工位',
          startAt: '2026-06-16T14:00:00',
          endAt: '2026-06-16T15:00:00',
          bookingStatus: '已确认',
          serviceName: '证件照',
          orderStatus: '已确认',
        },
      ],
      inventory: [],
      storeBackendId: '202',
    })

    expect(groups[1]?.slots).toHaveLength(1)
    expect(groups[1]?.slots[0]).toMatchObject({
      time: '14:00',
      orderCount: 1,
      confirmedCount: 1,
      capacity: 0,
      capacityLabel: '1/-',
      hasInventory: false,
      isFull: false,
    })
  })

  it('normalizes non-half-hour raw times into half-hour buckets', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-18',
      scheduleItems: [
        {
          bookingId: '9006',
          orderId: '9006',
          orderNo: 'JY-9006',
          customerName: '孙女士',
          customerPhone: '134****0000',
          storeId: '101',
          studioId: '101',
          studioName: '滨州万达店',
          startAt: '2026-06-18T10:20:00',
          endAt: '2026-06-18T10:50:00',
          bookingStatus: '待确认',
          serviceName: '证件照',
          orderStatus: '待确认',
        },
      ],
      inventory: [
        {
          backendId: 'slot-c',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-1',
          serviceGroupName: '证件照组',
          date: '2026-06-18',
          startTime: '10:20',
          endTime: '10:50',
          capacity: 1,
          confirmedCount: 0,
          conflictCount: 0,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-1',
        },
      ],
      storeBackendId: '101',
    })

    expect(groups[0]?.slots[0]).toMatchObject({
      time: '10:00',
      label: '10:00',
      endTime: '10:50',
      orderCount: 1,
      capacity: 1,
    })
  })

  it('does not merge inventory slots that only share the same start time', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-18',
      scheduleItems: [],
      inventory: [
        {
          backendId: 'slot-a',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-1',
          serviceGroupName: '证件照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:00',
          capacity: 1,
          confirmedCount: 1,
          conflictCount: 0,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-1',
        },
        {
          backendId: 'slot-b',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-2',
          serviceGroupName: '形象照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:30',
          capacity: 2,
          confirmedCount: 0,
          conflictCount: 1,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-2',
        },
      ],
      storeBackendId: '101',
    })

    expect(groups[0]?.slots).toHaveLength(1)
    expect(groups[0]?.slots.map(slot => [slot.time, slot.endTime, slot.capacity, slot.confirmedCount, slot.conflictCount])).toEqual([
      ['10:30', '11:00', 3, 1, 1],
    ])
    expect(groups[0]?.slots[0]).toMatchObject({
      storeBackendIds: ['101'],
      serviceGroupBackendIds: ['sg-1', 'sg-2'],
    })
  })

  it('merges same-store 30 minute buckets into one card like JianYue', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-18',
      scheduleItems: [
        {
          bookingId: '9005',
          orderId: '9005',
          orderNo: 'JY-9005',
          customerName: '周女士',
          customerPhone: '135****0000',
          storeId: '101',
          studioId: '101',
          studioName: '滨州万达店',
          startAt: '2026-06-18T10:30:00',
          endAt: '2026-06-18T11:00:00',
          bookingStatus: '待确认',
          serviceName: '证件照',
          orderStatus: '待确认',
        },
      ],
      inventory: [
        {
          backendId: 'slot-a',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-1',
          serviceGroupName: '证件照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:00',
          capacity: 1,
          confirmedCount: 0,
          conflictCount: 0,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-1',
        },
        {
          backendId: 'slot-b',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-2',
          serviceGroupName: '形象照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:00',
          capacity: 2,
          confirmedCount: 1,
          conflictCount: 0,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-2',
        },
      ],
      storeBackendId: '101',
    })

    expect(groups[0]?.slots).toHaveLength(1)
    expect(groups[0]?.slots[0]).toMatchObject({
      time: '10:30',
      endTime: '11:00',
      orderCount: 1,
      confirmedCount: 1,
      capacity: 3,
      remainingCount: 2,
      capacityLabel: '1/3',
      isFull: false,
    })
  })

  it('keeps service group capacity breakdown inside a merged half-hour slot', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-18',
      scheduleItems: [],
      inventory: [
        {
          backendId: 'slot-id-photo',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-id-photo',
          serviceGroupName: '证件照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:00',
          capacity: 1,
          confirmedCount: 1,
          conflictCount: 0,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-id-photo',
        },
        {
          backendId: 'slot-portrait',
          storeBackendId: '101',
          storeName: '滨州万达店',
          serviceGroupBackendId: 'sg-portrait',
          serviceGroupName: '形象照组',
          date: '2026-06-18',
          startTime: '10:30',
          endTime: '11:00',
          capacity: 2,
          confirmedCount: 0,
          conflictCount: 1,
          status: 'OPEN',
          remark: '',
          externalSkuId: 'sku-portrait',
        },
      ],
      storeBackendId: '101',
    })

    expect(groups[0]?.slots[0]?.serviceGroupBreakdown).toEqual([
      {
        serviceGroupBackendId: 'sg-id-photo',
        serviceGroupName: '证件照组',
        capacity: 1,
        confirmedCount: 1,
        remainingCount: 0,
        conflictCount: 0,
        capacityLabel: '1/1',
        isFull: true,
      },
      {
        serviceGroupBackendId: 'sg-portrait',
        serviceGroupName: '形象照组',
        capacity: 2,
        confirmedCount: 0,
        remainingCount: 2,
        conflictCount: 1,
        capacityLabel: '0/2',
        isFull: false,
      },
    ])
  })

  it('fills empty half-hour slots from the selected store business hours', () => {
    const groups = buildJianyueSlotGroups({
      date: '2026-06-18',
      scheduleItems: [],
      inventory: [],
      storeBackendId: '101',
      storeHours: '10:00 - 12:00',
      storeName: '滨州万达店',
      defaultCapacity: 1,
    })

    expect(groups[0]?.slots.map(slot => [slot.time, slot.endTime, slot.capacityLabel, slot.orderCount])).toEqual([
      ['10:00', '10:30', '0/1', 0],
      ['10:30', '11:00', '0/1', 0],
      ['11:00', '11:30', '0/1', 0],
      ['11:30', '12:00', '0/1', 0],
    ])
    expect(groups[1]?.slots).toEqual([])
    expect(groups[2]?.slots).toEqual([])
  })

  it('counts and filters conflict slots from booking inventory, not only pending orders', () => {
    const scheduleItems: ScheduleItemDto[] = [
      {
        bookingId: '9004',
        orderId: '9004',
        orderNo: 'JY-12152139',
        customerName: '钱女士',
        customerPhone: '136****0000',
        storeId: '101',
        studioId: '101',
        studioName: '滨州万达店 · 默认工位',
        startAt: '2026-06-17T11:00:00',
        endAt: '2026-06-17T11:30:00',
        bookingStatus: '已确认',
        serviceName: '证件照',
        orderStatus: '拍摄中',
      },
    ]
    const inventory: BookingInventorySlot[] = [
      {
        backendId: 'slot-1100',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupName: '证件照组',
        date: '2026-06-17',
        startTime: '11:00',
        endTime: '11:30',
        capacity: 1,
        confirmedCount: 1,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '',
        externalSkuId: 'sku-real',
      },
      {
        backendId: 'slot-1130',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupName: '证件照组',
        date: '2026-06-17',
        startTime: '11:30',
        endTime: '12:00',
        capacity: 1,
        confirmedCount: 0,
        conflictCount: 0,
        status: 'ACTIVE',
        remark: '',
        externalSkuId: 'sku-real',
      },
    ]

    expect(buildQuickScheduleFilters({
      date: '2026-06-17',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    }).find(item => item.key === 'conflict')?.count).toBe(1)

    expect(filterBookingInventoryForScheduleFilter({
      date: '2026-06-17',
      filter: 'conflict',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    }).map(item => item.backendId)).toEqual(['slot-1100'])

    expect(filterScheduleItemsForScheduleFilter({
      date: '2026-06-17',
      filter: 'conflict',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    }).map(item => item.orderNo)).toEqual(['JY-12152139'])
  })

  it('matches pending and conflict filters by slot end time instead of start time only', () => {
    const scheduleItems: ScheduleItemDto[] = [
      {
        bookingId: '9010',
        orderId: '9010',
        orderNo: 'JY-EDGE-1',
        customerName: '周女士',
        customerPhone: '135****0000',
        storeId: '101',
        studioId: '101',
        studioName: '滨州万达店 · 默认工位',
        startAt: '2026-06-19T10:30:00',
        endAt: '2026-06-19T11:30:00',
        bookingStatus: '待确认',
        serviceName: '形象照',
        orderStatus: '待确认',
      },
    ]
    const inventory: BookingInventorySlot[] = [
      {
        backendId: 'slot-short',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupBackendId: 'sg-short',
        serviceGroupName: '证件照组',
        date: '2026-06-19',
        startTime: '10:30',
        endTime: '11:00',
        capacity: 1,
        confirmedCount: 0,
        conflictCount: 0,
        status: 'OPEN',
        remark: '',
        externalSkuId: 'sku-short',
      },
      {
        backendId: 'slot-long',
        storeBackendId: '101',
        storeName: '滨州万达店',
        serviceGroupBackendId: 'sg-long',
        serviceGroupName: '形象照组',
        date: '2026-06-19',
        startTime: '10:30',
        endTime: '11:30',
        capacity: 1,
        confirmedCount: 0,
        conflictCount: 1,
        status: 'OPEN',
        remark: '',
        externalSkuId: 'sku-long',
      },
    ]

    expect(filterBookingInventoryForScheduleFilter({
      date: '2026-06-19',
      filter: 'pending',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    }).map(item => item.backendId)).toEqual(['slot-long'])

    expect(filterScheduleItemsForScheduleFilter({
      date: '2026-06-19',
      filter: 'conflict',
      scheduleItems,
      inventory,
      storeBackendId: '101',
    }).map(item => item.orderNo)).toEqual(['JY-EDGE-1'])
  })
})
