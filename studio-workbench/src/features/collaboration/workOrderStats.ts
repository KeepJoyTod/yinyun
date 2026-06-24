import type { CollaborationStageCode } from '../../shared/api/backend'
import { collaborationWorkOrderStageOptions, type CollaborationWorkOrderItem } from './workOrderRuntime'

export type WorkOrderStageStat = {
  stage: CollaborationStageCode
  stageLabel: string
  total: number
  blocked: number
  overdue: number
  active: number
  averageProgress: number
  activeRatio: number
}

const stageMeta = collaborationWorkOrderStageOptions.map(option => ({
  stage: option.code,
  stageLabel: option.label,
}))

export const buildWorkOrderStageStats = (workOrders: CollaborationWorkOrderItem[]): WorkOrderStageStat[] =>
  stageMeta.map(meta => {
    const rows = workOrders.filter(item => item.stage === meta.stage)
    const total = rows.length
    const active = rows.filter(item => item.statusCode === 'IN_PROGRESS').length
    const progressSum = rows.reduce((sum, item) => sum + item.execution.progress, 0)
    return {
      ...meta,
      total,
      blocked: rows.filter(item => item.statusCode === 'BLOCKED').length,
      overdue: rows.filter(item => item.execution.overdue).length,
      active,
      averageProgress: total ? Math.round(progressSum / total) : 0,
      activeRatio: total ? active / total : 0,
    }
  })
