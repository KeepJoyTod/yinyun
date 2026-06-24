import type { WorkExecutionStage } from './workExecution'
import type { WorkOrder } from './workOrders'

export type WorkOrderStageStat = {
  stage: WorkExecutionStage
  stageLabel: string
  total: number
  blocked: number
  overdue: number
  active: number
  averageProgress: number
  activeRatio: number
}

const stageMeta: { stage: WorkExecutionStage; stageLabel: string }[] = [
  { stage: 'SHOOT', stageLabel: '拍摄' },
  { stage: 'UPLOAD', stageLabel: '上传' },
  { stage: 'SELECTION', stageLabel: '客户选片' },
  { stage: 'DELIVERY', stageLabel: '精修交付' },
]

export const buildWorkOrderStageStats = (workOrders: WorkOrder[]): WorkOrderStageStat[] =>
  stageMeta.map(meta => {
    const rows = workOrders.filter(item => item.stage === meta.stage)
    const total = rows.length
    const active = rows.filter(item => item.status === '进行中').length
    const progressSum = rows.reduce((sum, item) => sum + item.execution.progress, 0)
    return {
      ...meta,
      total,
      blocked: rows.filter(item => item.status === '阻塞').length,
      overdue: rows.filter(item => item.execution.overdue).length,
      active,
      averageProgress: total ? Math.round(progressSum / total) : 0,
      activeRatio: total ? active / total : 0,
    }
  })
