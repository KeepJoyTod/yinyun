import { describe, expect, it } from 'vitest'
import exportSource from './WorkOrderExportView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('work order export page contract', () => {
  it('replaces the collaboration export placeholder with a real route', () => {
    expect(routerSource).toContain('WorkOrderExportView.vue')
    expect(getWorkbenchFeature('collaboration-export')?.component).toBe('work-order-export')
    expect(getWorkbenchFeature('collaboration-export')?.status).toBe('ready')
    expect(getWorkbenchFeature('collaboration-export')?.permission).toBe('yy:order:list')
  })

  it('exports from the same real work order runtime', () => {
    expect(exportSource).toContain('useCollaborationWorkOrders')
    expect(exportSource).toContain('downloadWorkOrderCsv')
    expect(exportSource).toContain('yy_work_order')
    expect(exportSource).not.toContain('buildWorkOrders')
  })

  it('keeps export read-only for staff', () => {
    expect(exportSource).toContain('导出 CSV')
    expect(exportSource).toContain('当前门店真实工单筛选结果')
    expect(exportSource).not.toContain('createOrder')
    expect(exportSource).not.toContain('新建预约')
  })

  it('scopes exports to a concrete staff store instead of all-store browsing', () => {
    expect(exportSource).toContain('concreteStoreOptions')
    expect(exportSource).toContain('normalizeStoreFilter')
    expect(exportSource).toContain('ensureWorkbenchStores')
    expect(exportSource).toContain('await ensureWorkbenchStores()')
    expect(exportSource).toContain(':value="String(store.backendId)"')
    expect(exportSource).toContain('String(item.order.storeBackendId) === storeFilter.value')
    expect(exportSource).not.toContain('<option value="all">全部门店</option>')
  })
})
