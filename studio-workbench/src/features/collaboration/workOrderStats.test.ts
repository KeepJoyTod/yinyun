import { describe, expect, it } from 'vitest'
import type { WorkOrder } from './workOrders'
import { buildWorkOrderStageStats } from './workOrderStats'

const workOrder = (
  id: string,
  stage: WorkOrder['stage'],
  status: WorkOrder['status'],
  overdue = false,
  progress = 20,
): WorkOrder => ({
  id,
  workOrderNo: `WO-${id}`,
  stage,
  stageLabel: stage === 'SHOOT' ? '拍摄' : stage === 'UPLOAD' ? '上传' : stage === 'SELECTION' ? '客户选片' : '精修交付',
  status,
  priority: overdue || status === '阻塞' ? 'HIGH' : 'NORMAL',
  priorityLabel: overdue || status === '阻塞' ? '高优先' : '普通',
  assignee: '摄影组',
  blockReason: status === '阻塞' ? '订单待支付' : '',
  primaryActionLabel: '打开订单处理',
  actionMode: 'ORDER',
  actionPath: '/order/appointment',
  order: {
    backendId: '1',
    storeBackendId: '1',
    id: `YY-${id}`,
    customer: '陈女士',
    phone: '13800003333',
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
  },
  execution: {
    id,
    stage,
    stageLabel: stage === 'SHOOT' ? '拍摄' : stage === 'UPLOAD' ? '上传' : stage === 'SELECTION' ? '客户选片' : '精修交付',
    businessDate: '2026-06-13',
    dueAt: '2026-06-13T14:00:00',
    dueLabel: '06-13 14:00',
    owner: '摄影组',
    progress,
    overdue,
    nextAction: '确认到店时间并进入拍摄。',
    actionPath: '/order/appointment',
    order: {} as WorkOrder['order'],
    statusLabel: '待到店拍摄',
  },
})

describe('work order stage stats', () => {
  it('returns all four stages even when some stages have no work orders', () => {
    const stats = buildWorkOrderStageStats([
      workOrder('1', 'SHOOT', '阻塞', true, 20),
      workOrder('2', 'DELIVERY', '进行中', false, 85),
    ])

    expect(stats.map(item => item.stage)).toEqual(['SHOOT', 'UPLOAD', 'SELECTION', 'DELIVERY'])
    expect(stats.find(item => item.stage === 'SHOOT')).toMatchObject({
      total: 1,
      blocked: 1,
      overdue: 1,
      averageProgress: 20,
    })
    expect(stats.find(item => item.stage === 'UPLOAD')).toMatchObject({
      total: 0,
      blocked: 0,
      overdue: 0,
      averageProgress: 0,
    })
  })

  it('calculates active ratio per stage', () => {
    const stats = buildWorkOrderStageStats([
      workOrder('1', 'DELIVERY', '进行中', false, 80),
      workOrder('2', 'DELIVERY', '待处理', false, 60),
    ])

    expect(stats.find(item => item.stage === 'DELIVERY')?.activeRatio).toBe(0.5)
    expect(stats.find(item => item.stage === 'DELIVERY')?.averageProgress).toBe(70)
  })
})
