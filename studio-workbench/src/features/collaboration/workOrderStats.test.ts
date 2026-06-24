import { describe, expect, it } from 'vitest'
import type { CollaborationWorkOrderItem } from './workOrderRuntime'
import { buildWorkOrderStageStats } from './workOrderStats'

const workOrder = (
  id: string,
  stage: CollaborationWorkOrderItem['stage'],
  statusCode: CollaborationWorkOrderItem['statusCode'],
  overdue = false,
  progress = 20,
): CollaborationWorkOrderItem => ({
  id,
  backendId: id,
  workOrderNo: `WO-${id}`,
  order: {
    backendId: '1',
    storeBackendId: '1',
    productBackendId: undefined,
    serviceGroupBackendId: undefined,
    inventorySlotId: undefined,
    id: `YY-${id}`,
    customer: '测试客户',
    phone: '13800003333',
    store: '深圳旗舰店',
    service: '证件照套餐',
    source: '微信预约',
    method: '到店拍摄',
    channelType: undefined,
    externalProductId: undefined,
    externalPoiId: undefined,
    remark: '',
    orderTime: '2026-06-13 09:00:00',
    orderDate: '2026-06-13',
    orderClock: '09:00',
    arrivalTime: '2026-06-13 14:00:00',
    status: '已确认',
    payment: '已支付',
    amount: 129,
    refundStatus: undefined,
    refundAmountCent: undefined,
    arrivalDate: '2026-06-13',
    arrivalClock: '14:00',
    externalSkuId: undefined,
    inventoryStatus: undefined,
    conflictReason: undefined,
  },
  stage,
  stageLabel: stage,
  orderType: 'PHOTO_UPLOAD',
  status: statusCode,
  statusCode,
  priority: overdue || statusCode === 'BLOCKED' ? 'HIGH' : 'MEDIUM',
  priorityLabel: overdue || statusCode === 'BLOCKED' ? '高优先' : '中优先',
  assignee: '摄影组',
  blockReason: statusCode === 'BLOCKED' ? '订单待支付' : '',
  primaryActionLabel: '打开工单处理',
  canTransition: statusCode !== 'COMPLETED' && statusCode !== 'CANCELLED',
  actionPath: '/collaboration/work-orders',
  execution: {
    businessDate: '2026-06-13',
    dueAt: '2026-06-13T14:00:00',
    dueLabel: '06-13 14:00',
    owner: '摄影组',
    progress,
    overdue,
    nextAction: '确认到店时间并进入拍摄',
    statusLabel: statusCode,
  },
})

describe('work order stage stats', () => {
  it('returns all collaboration stages even when some stages have no work orders', () => {
    const stats = buildWorkOrderStageStats([
      workOrder('1', 'PHOTOGRAPHY', 'BLOCKED', true, 20),
      workOrder('2', 'PICKUP', 'IN_PROGRESS', false, 85),
    ])

    expect(stats.map(item => item.stage)).toEqual(['RECEPTION', 'MAKEUP', 'PHOTOGRAPHY', 'RETOUCH', 'REVIEW', 'SELECTION_REVIEW', 'PICKUP'])
    expect(stats.find(item => item.stage === 'PHOTOGRAPHY')).toMatchObject({
      total: 1,
      blocked: 1,
      overdue: 1,
      averageProgress: 20,
    })
    expect(stats.find(item => item.stage === 'RECEPTION')).toMatchObject({
      total: 0,
      blocked: 0,
      overdue: 0,
      averageProgress: 0,
    })
  })

  it('calculates active ratio per stage', () => {
    const stats = buildWorkOrderStageStats([
      workOrder('1', 'PICKUP', 'IN_PROGRESS', false, 80),
      workOrder('2', 'PICKUP', 'PENDING', false, 60),
    ])

    expect(stats.find(item => item.stage === 'PICKUP')?.activeRatio).toBe(0.5)
    expect(stats.find(item => item.stage === 'PICKUP')?.averageProgress).toBe(70)
  })
})
