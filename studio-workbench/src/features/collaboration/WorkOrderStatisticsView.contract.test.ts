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

  it('aggregates stage stats from the same derived work orders', () => {
    expect(statsSource).toContain('buildWorkOrders')
    expect(statsSource).toContain('buildWorkOrderStageStats')
    expect(statsSource).toContain('appStore.orders')
    expect(statsSource).toContain('appStore.albums')
    expect(statsSource).toContain('appStore.selectionLinks')
  })

  it('keeps statistics read-only', () => {
    expect(statsSource).toContain('环节统计')
    expect(statsSource).toContain('只读统计视图')
    expect(statsSource).not.toContain('createOrder')
    expect(statsSource).not.toContain('新建预约')
  })
})
