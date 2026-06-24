import { describe, expect, it } from 'vitest'
import overviewSource from './WorkExecutionOverviewView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('work execution overview contract', () => {
  it('replaces the collaboration overview placeholder with a real route', () => {
    expect(routerSource).toContain('WorkExecutionOverviewView.vue')
    expect(getWorkbenchFeature('collaboration-overview')?.component).toBe('work-execution-overview')
    expect(getWorkbenchFeature('collaboration-overview')?.status).toBe('ready')
    expect(getWorkbenchFeature('collaboration-overview')?.permission).toBe('yy:order:list')
  })

  it('builds a daily queue from the real work order runtime', () => {
    expect(overviewSource).toContain('useCollaborationWorkOrders')
    expect(overviewSource).toContain('selectedDate')
    expect(overviewSource).toContain('真实工单执行队列')
    expect(overviewSource).toContain('collaborationWorkOrderStageOptions')
    expect(overviewSource).not.toContain('buildWorkExecutionItems')
  })

  it('keeps staff focused on processing existing work', () => {
    expect(overviewSource).toContain('进入处理页面')
    expect(overviewSource).not.toContain('新建预约')
    expect(overviewSource).not.toContain('createOrder')
  })

  it('scopes execution overview to a concrete staff store instead of all-store browsing', () => {
    expect(overviewSource).toContain('concreteStoreOptions')
    expect(overviewSource).toContain('normalizeStoreFilter')
    expect(overviewSource).toContain('ensureWorkbenchStores')
    expect(overviewSource).toContain('await ensureWorkbenchStores()')
    expect(overviewSource).toContain('scopedDateItems')
    expect(overviewSource).toContain('countStage = (stage: CollaborationStageCode) => scopedDateItems.value')
    expect(overviewSource).toContain(':value="String(store.backendId)"')
    expect(overviewSource).toContain('String(item.order.storeBackendId) === storeFilter.value')
    expect(overviewSource).not.toContain('<option value="all">全部门店</option>')
  })
})
