import { describe, expect, it } from 'vitest'
import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'
import { buildWorkOrders } from './workOrders'

const order = (id: number, orderNo: string, status: BookingOrder['status'] = '已确认'): BookingOrder => ({
  backendId: String(id),
  storeBackendId: id % 2 === 0 ? '2' : '1',
  id: orderNo,
  customer: `客户${id}`,
  phone: `1380000000${id}`,
  store: id % 2 === 0 ? '香港交付点' : '深圳旗舰店',
  service: '证件照套餐',
  source: '微信预约',
  method: '到店拍摄',
  orderTime: '06-13 09:00',
  orderDate: '2026-06-13',
  orderClock: '09:00',
  arrivalTime: '06-13 14:00',
  status,
  payment: id === 3 ? '待支付' : '已支付',
  amount: 129,
  arrivalDate: '2026-06-13',
  arrivalClock: '14:00',
})

const album = (backendId: number, orderBackendId: number, totalCount: number, selectedCount: number): Album => ({
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

describe('derived work orders', () => {
  it('builds one actionable work order per current execution item', () => {
    const workOrders = buildWorkOrders({
      orders: [order(1, 'YY-1'), order(2, 'YY-2'), order(3, 'YY-3', '待确认')],
      albums: [album(102, 2, 0, 0), album(103, 3, 5, 2)],
      selectionLinks: [selectionLink(3, 103)],
      now: new Date('2026-06-13T16:00:00'),
    })

    expect(workOrders).toHaveLength(3)
    expect(workOrders.map(item => item.workOrderNo)).toEqual([
      'WO-SHOOT-YY-1',
      'WO-UPLOAD-YY-2',
      'WO-DELIVERY-YY-3',
    ])
    expect(new Set(workOrders.map(item => item.order.id)).size).toBe(3)
  })

  it('classifies priority and action mode from source order evidence', () => {
    const [workOrder] = buildWorkOrders({
      orders: [order(3, 'YY-3', '待确认')],
      albums: [],
      selectionLinks: [],
      now: new Date('2026-06-13T16:00:00'),
    })

    expect(workOrder.priority).toBe('HIGH')
    expect(workOrder.status).toBe('阻塞')
    expect(workOrder.blockReason).toContain('待支付')
    expect(workOrder.primaryActionLabel).toBe('打开订单处理')
    expect(workOrder.actionPath).toContain('/order/appointment')
  })
})
