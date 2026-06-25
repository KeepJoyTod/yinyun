import { describe, expect, it } from 'vitest'
import type { WorkOrderDto } from '../../shared/api/backend'
import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'
import { buildCollaborationWorkOrderItems, resolveWorkOrderTransitionPayload } from './workOrderRuntime'

const order: BookingOrder = {
  backendId: '101',
  storeBackendId: '201',
  productBackendId: undefined,
  serviceGroupBackendId: undefined,
  inventorySlotId: undefined,
  id: 'ORD-101',
  customer: '张三',
  phone: '13800000000',
  store: '徐汇店',
  service: '写真拍摄',
  source: 'MANUAL',
  method: 'WORKBENCH',
  channelType: undefined,
  externalProductId: undefined,
  externalPoiId: undefined,
  remark: '',
  orderTime: '2026-06-24 09:00:00',
  orderDate: '2026-06-24',
  orderClock: '09:00',
  arrivalTime: '2026-06-24 10:00:00',
  status: '已确认',
  payment: '已支付',
  amount: 999,
  refundStatus: undefined,
  refundAmountCent: undefined,
  arrivalDate: '2026-06-24',
  arrivalClock: '10:00',
  externalSkuId: undefined,
  inventoryStatus: undefined,
  conflictReason: undefined,
}

const album: Album = {
  backendId: '301',
  orderBackendId: '101',
  id: 'ALB-301',
  orderId: 'ORD-101',
  customer: '张三',
  service: '写真拍摄',
  date: '2026-06-24',
  photographer: '摄影A',
  status: '待客户选片',
  selectedCount: 0,
  totalCount: 30,
  negatives: [],
}

const selectionLink: SelectionLink = {
  backendId: '401',
  token: 'token-401',
  orderBackendId: '101',
  albumBackendId: '301',
  id: '401',
  orderId: 'ORD-101',
  albumId: 'ALB-301',
  display: 'selection/401',
  url: 'https://example.com/selection/401',
  customer: '张三',
  phone: '13800000000',
  product: '写真拍摄',
  selectedCount: 0,
  extraCount: 0,
  visits: 1,
  expire: '06-27',
  status: '进行中',
}

describe('work order runtime', () => {
  it('maps real work orders into collaboration runtime items', () => {
    const workOrders: WorkOrderDto[] = [
      {
        id: '1',
        storeId: '201',
        orderNo: 'WO-1',
        orderId: '101',
        orderType: 'PHOTO_UPLOAD',
        status: 'PENDING',
        priority: 'HIGH',
        handlerId: '501',
        handlerName: '摄影A',
        description: '上传客片底片',
        remark: '',
        createTime: '2026-06-24 09:30:00',
      },
      {
        id: '2',
        storeId: '201',
        orderNo: 'WO-2',
        orderId: '101',
        orderType: 'SELECTION',
        status: 'BLOCKED',
        priority: 'MEDIUM',
        handlerId: '601',
        handlerName: '客服B',
        description: '客户看片',
        remark: '等待重新发送选片链接',
        createTime: '2026-06-24 11:00:00',
      },
    ]

    const items = buildCollaborationWorkOrderItems({
      workOrders,
      orders: [order],
      albums: [album],
      selectionLinks: [selectionLink],
      now: new Date('2026-06-25T12:00:00'),
    })

    expect(items).toHaveLength(2)
    expect(items[0].stage).toBe('PHOTOGRAPHY')
    expect(items[0].order.id).toBe('ORD-101')
    expect(items[0].primaryActionLabel).toBe('开始上传')
    expect(items[1].stage).toBe('SELECTION_REVIEW')
    expect(items[1].statusCode).toBe('BLOCKED')
    expect(items[1].blockReason).toContain('选片链接')
  })

  it('builds transition payloads from runtime status', () => {
    const [item] = buildCollaborationWorkOrderItems({
      workOrders: [{
        id: '3',
        storeId: '201',
        orderNo: 'WO-3',
        orderId: '101',
        orderType: 'RETOUCH',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        handlerId: '701',
        handlerName: '修图C',
        description: '修图处理',
        remark: '',
        createTime: '2026-06-24 13:00:00',
      }],
      orders: [order],
      albums: [album],
      selectionLinks: [selectionLink],
    })

    expect(resolveWorkOrderTransitionPayload(item)).toEqual({
      id: '3',
      expectedStatus: 'IN_PROGRESS',
      targetStatus: 'COMPLETED',
      remark: '',
    })
  })

  it('prefers backend stage code and due time over inferred runtime values', () => {
    const [item] = buildCollaborationWorkOrderItems({
      workOrders: [{
        id: '4',
        storeId: '201',
        orderNo: 'WO-4',
        orderId: '101',
        orderType: 'OTHER',
        stageCode: 'RETOUCH',
        status: 'PENDING',
        priority: 'MEDIUM',
        handlerId: '701',
        handlerName: '修图C',
        dueTime: '2026-06-26 18:00:00',
        description: '不包含可推断岗位的说明',
        remark: '',
        createTime: '2026-06-24 13:00:00',
      }],
      orders: [order],
      albums: [album],
      selectionLinks: [selectionLink],
      now: new Date('2026-06-25T12:00:00'),
    })

    expect(item.stage).toBe('RETOUCH')
    expect(item.execution.dueAt).toBe('2026-06-26T18:00:00')
    expect(item.execution.overdue).toBe(false)
  })
})
