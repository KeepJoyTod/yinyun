import { describe, expect, it } from 'vitest'
import {
  buildInventoryCards,
  getInventoryServiceGroupOptions,
} from './inventoryOperations'
import type { BookingInventorySlot, ServiceGroupInfo } from '../../shared/stores/appStore'

const makeGroup = (overrides: Partial<ServiceGroupInfo> = {}): ServiceGroupInfo => ({
  backendId: '1101',
  storeBackendId: '1',
  storeName: '影约云深圳旗舰店',
  code: 'SZ-ID',
  name: '证件照快拍组',
  capacity: 6,
  durationMinutes: 30,
  status: 'ACTIVE',
  sort: 10,
  remark: '',
  ...overrides,
})

const makeSlot = (overrides: Partial<BookingInventorySlot> = {}): BookingInventorySlot => ({
  backendId: '2101',
  storeBackendId: '1',
  storeName: '影约云深圳旗舰店',
  serviceGroupBackendId: '1101',
  serviceGroupName: '证件照快拍组',
  date: '2026-06-15',
  startTime: '14:00',
  endTime: '14:30',
  capacity: 6,
  confirmedCount: 4,
  conflictCount: 0,
  status: 'ACTIVE',
  remark: '',
  externalSkuId: '',
  ...overrides,
})

describe('inventory operations helpers', () => {
  it('builds service group options scoped to the selected store', () => {
    const groups = [
      makeGroup(),
      makeGroup({ backendId: '1102', name: '形象照主棚', sort: 20 }),
      makeGroup({ backendId: '1103', storeBackendId: '2', name: '交付与取片组', sort: 30 }),
      makeGroup({ backendId: '1104', storeBackendId: '1', name: '停用服务组', status: 'DISABLED', sort: 40 }),
    ]

    expect(getInventoryServiceGroupOptions(groups, '1')).toEqual([
      { value: 'all', label: '全部服务组' },
      { value: '1101', label: '证件照快拍组' },
      { value: '1102', label: '形象照主棚' },
    ])
  })

  it('keeps inventory cards derived from the currently loaded slots', () => {
    const cards = buildInventoryCards([
      makeSlot({ capacity: 6, confirmedCount: 6, conflictCount: 0 }),
      makeSlot({ backendId: '2102', serviceGroupBackendId: '1102', serviceGroupName: '形象照主棚', capacity: 3, confirmedCount: 3, conflictCount: 1 }),
      makeSlot({ backendId: '2103', serviceGroupBackendId: '1103', serviceGroupName: '交付与取片组', capacity: 2, confirmedCount: 1, conflictCount: 0 }),
    ])

    expect(cards).toEqual([
      expect.objectContaining({ label: '时段总数', value: '3' }),
      expect.objectContaining({ label: '库存冲突', value: '1' }),
      expect.objectContaining({ label: '满载时段', value: '2' }),
      expect.objectContaining({ label: '总容量', value: '11' }),
    ])
  })
})
