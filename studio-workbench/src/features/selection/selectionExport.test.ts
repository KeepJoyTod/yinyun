import { describe, expect, it } from 'vitest'
import { buildSelectionResultCsv } from './selectionExport'

describe('selection result export', () => {
  it('exports only selected photos with customer and album context', () => {
    const csv = buildSelectionResultCsv(
      {
        backendId: '8001',
        token: 'token',
        albumBackendId: '7001',
        id: '8001',
        albumId: 'ALB-001',
        display: 'selection/ALB-001',
        url: 'https://example.com/selection/ALB-001',
        customer: '陈女士',
        phone: '13800003333',
        product: '证件照精修套餐',
        selectedCount: 1,
        extraCount: 0,
        visits: 6,
        expire: '06-30',
        status: '进行中',
      },
      {
        backendId: '7001',
        id: 'ALB-001',
        orderId: 'YY001',
        customer: '陈女士',
        service: '证件照精修套餐',
        date: '2026-06-13',
        photographer: '阿杰',
        status: '选片中',
        selectedCount: 1,
        totalCount: 2,
        negatives: [
          { backendId: '1', id: '1', name: 'selected.jpg', url: '', uploadedAt: '2026-06-13T10:00:00', selected: true },
          { backendId: '2', id: '2', name: 'pending.jpg', url: '', uploadedAt: '2026-06-13T10:01:00', selected: false },
        ],
      },
    )

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('陈女士')
    expect(csv).toContain('ALB-001')
    expect(csv).toContain('selected.jpg')
    expect(csv).not.toContain('pending.jpg')
  })

  it('escapes commas and quotes in photo names', () => {
    const csv = buildSelectionResultCsv(
      {
        backendId: '1',
        token: 'token',
        id: '1',
        display: 'selection/1',
        url: '',
        customer: '客户',
        phone: '',
        product: '套餐',
        selectedCount: 1,
        extraCount: 0,
        visits: 1,
        expire: '06-30',
        status: '进行中',
      },
      {
        backendId: '1',
        id: 'ALB-1',
        orderId: 'ORDER-1',
        customer: '客户',
        service: '套餐',
        date: '2026-06-13',
        photographer: '',
        status: '选片中',
        selectedCount: 1,
        totalCount: 1,
        negatives: [
          { backendId: '1', id: '1', name: '精修,\"01\".jpg', url: '', uploadedAt: '', selected: true },
        ],
      },
    )

    expect(csv).toContain('"精修,""01"".jpg"')
  })
})
