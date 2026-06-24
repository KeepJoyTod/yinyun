import { describe, expect, it } from 'vitest'
import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'
import { buildWorkExecutionItems } from './workExecution'

const order = (id: number, orderNo: string): BookingOrder => ({
  backendId: String(id),
  storeBackendId: '1',
  id: orderNo,
  customer: `客户${id}`,
  phone: `1380000000${id}`,
  store: '深圳旗舰店',
  service: '证件照套餐',
  source: '微信预约',
  method: '到店拍摄',
  orderTime: '06-13 09:00',
  orderDate: '2026-06-13',
  orderClock: '09:00',
  arrivalTime: '06-13 14:00',
  status: '已确认',
  payment: '已支付',
  amount: 129,
  arrivalDate: '2026-06-13',
  arrivalClock: '14:00',
})

const album = (
  backendId: number,
  orderBackendId: number,
  totalCount: number,
  selectedCount: number,
): Album => ({
  backendId: String(backendId),
  orderBackendId: String(orderBackendId),
  id: `ALB-${backendId}`,
  orderId: `YY-${orderBackendId}`,
  customer: `客户${orderBackendId}`,
  service: '证件照套餐',
  date: '2026-06-13',
  photographer: '阿杰',
  status: selectedCount > 0 ? '选片中' : '待客户选片',
  selectedCount,
  totalCount,
  negatives: Array.from({ length: totalCount }, (_, index) => ({
    backendId: String(backendId * 10 + index),
    id: String(backendId * 10 + index),
    name: `${index + 1}.jpg`,
    url: '',
    uploadedAt: '2026-06-13T15:00:00',
    selected: index < selectedCount,
  })),
})

const selectionLink = (orderBackendId: number, albumBackendId: number): SelectionLink => ({
  backendId: String(albumBackendId + 100),
  token: 'token',
  orderBackendId: String(orderBackendId),
  albumBackendId: String(albumBackendId),
  id: String(albumBackendId + 100),
  orderId: `YY-${orderBackendId}`,
  albumId: `ALB-${albumBackendId}`,
  display: `selection/ALB-${albumBackendId}`,
  url: 'https://example.com',
  customer: `客户${orderBackendId}`,
  phone: `1380000000${orderBackendId}`,
  product: '证件照套餐',
  selectedCount: 2,
  extraCount: 1,
  visits: 3,
  expire: '06-30',
  status: '进行中',
})

describe('work execution queue', () => {
  it('keeps one current stage per order and lets downstream evidence win', () => {
    const orders = [order(1, 'YY-1'), order(2, 'YY-2'), order(3, 'YY-3'), order(4, 'YY-4')]
    const albums = [
      album(102, 2, 0, 0),
      album(103, 3, 4, 0),
      album(104, 4, 4, 2),
    ]
    const links = [selectionLink(4, 104)]

    const items = buildWorkExecutionItems({ orders, albums, selectionLinks: links, now: new Date('2026-06-13T16:00:00') })

    expect(items).toHaveLength(4)
    expect(Object.fromEntries(items.map(item => [item.order.id, item.stage]))).toEqual({
      'YY-1': 'SHOOT',
      'YY-2': 'UPLOAD',
      'YY-3': 'SELECTION',
      'YY-4': 'DELIVERY',
    })
    expect(new Set(items.map(item => item.order.id)).size).toBe(4)
  })

  it('marks past due work and gives each stage a real workbench destination', () => {
    const items = buildWorkExecutionItems({
      orders: [order(1, 'YY-1')],
      albums: [],
      selectionLinks: [],
      now: new Date('2026-06-13T16:00:00'),
    })

    expect(items[0].overdue).toBe(true)
    expect(items[0].actionPath).toContain('/order/appointment')
    expect(items[0].nextAction).toContain('拍摄')
  })
})
