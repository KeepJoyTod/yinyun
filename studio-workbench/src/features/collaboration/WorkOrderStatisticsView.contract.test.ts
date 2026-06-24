import { describe, expect, it } from 'vitest'
import statsSource from './WorkOrderStatisticsView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('work order statistics page contract', () => {
  it('replaces the collaboration statistics placeholder with a real route', () => {
    expect(routerSource).toContain('WorkOrderStatisticsView.vue')
    expect(getWorkbenchFeature('collaboration-statistics')?.component).toBe('work-order-statistics')
    expect(getWorkbenchFeature('collaboration-statistics')?.status).toBe('ready')
    expect(getWorkbenchFeature('collaboration-statistics')?.permission).toBe('yy:order:list')
  })

  it('aggregates stage stats from the real work order runtime', () => {
    expect(statsSource).toContain('useCollaborationWorkOrders')
    expect(statsSource).toContain('buildWorkOrderStageStats')
    expect(statsSource).toContain('真实工单主链')
    expect(statsSource).not.toContain('buildWorkOrders')
  })

  it('keeps statistics read-only', () => {
    expect(statsSource).toContain('岗位统计')
    expect(statsSource).toContain('当前页只读真实工单统计')
    expect(statsSource).not.toContain('createOrder')
    expect(statsSource).not.toContain('新建预约')
  })
})
