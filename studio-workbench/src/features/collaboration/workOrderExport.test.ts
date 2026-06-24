import { describe, expect, it } from 'vitest'
import type { WorkOrder } from './workOrders'
import { buildWorkOrderCsv } from './workOrderExport'

const workOrder = (id: string, stageLabel: string, status: WorkOrder['status']): WorkOrder => ({
  id,
  workOrderNo: `WO-${id}`,
  stage: 'SHOOT',
  stageLabel,
  status,
  priority: status === '阻塞' ? 'HIGH' : 'NORMAL',
  priorityLabel: status === '阻塞' ? '高优先' : '普通',
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
    stage: 'SHOOT',
    stageLabel,
    businessDate: '2026-06-13',
    dueAt: '2026-06-13T14:00:00',
    dueLabel: '06-13 14:00',
    owner: '摄影组',
    progress: 20,
    overdue: false,
    nextAction: '确认到店时间并进入拍摄。',
    actionPath: '/order/appointment',
    order: {} as WorkOrder['order'],
    statusLabel: '待到店拍摄',
  },
})

describe('work order export', () => {
  it('exports filtered work orders as utf-8 bom csv', () => {
    const csv = buildWorkOrderCsv([workOrder('1', '拍摄', '阻塞')])

    expect(csv.startsWith('\ufeff')).toBe(true)
    expect(csv).toContain('工单号,订单号,客户,手机号,门店,服务,环节,工单状态,优先级,负责人,要求时间,是否超时,阻塞原因,下一步')
    expect(csv).toContain('WO-1,YY-1,陈女士,13800003333,深圳旗舰店,证件照套餐,拍摄,阻塞,高优先,摄影组,06-13 14:00,否,订单待支付,确认到店时间并进入拍摄。')
  })

  it('escapes commas and line breaks in csv cells', () => {
    const item = workOrder('2', '客户选片', '待处理')
    item.order.customer = '陈,女士'
    item.execution.nextAction = '第一行\n第二行'

    const csv = buildWorkOrderCsv([item])

    expect(csv).toContain('"陈,女士"')
    expect(csv).toContain('"第一行\n第二行"')
  })
})
