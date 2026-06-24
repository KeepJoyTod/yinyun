import { describe, expect, it } from 'vitest'
import workOrdersSource from './WorkOrdersView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('work orders page contract', () => {
  it('replaces the collaboration work order placeholder with a real route', () => {
    expect(routerSource).toContain('WorkOrdersView.vue')
    expect(getWorkbenchFeature('collaboration-work-orders')?.component).toBe('work-orders')
    expect(getWorkbenchFeature('collaboration-work-orders')?.status).toBe('ready')
    expect(getWorkbenchFeature('collaboration-work-orders')?.permission).toBe('yy:order:list')
  })

  it('derives work orders from the unified execution pipeline', () => {
    expect(workOrdersSource).toContain('buildWorkOrders')
    expect(workOrdersSource).toContain('appStore.orders')
    expect(workOrdersSource).toContain('appStore.albums')
    expect(workOrdersSource).toContain('appStore.selectionLinks')
    expect(workOrdersSource).toContain('统一订单、相册和选片数据派生')
  })

  it('keeps staff focused on existing order processing', () => {
    expect(workOrdersSource).toContain('打开订单处理')
    expect(workOrdersSource).toContain('进入关联页面')
    expect(workOrdersSource).not.toContain('新建预约')
    expect(workOrdersSource).not.toContain('createOrder')
  })

  it('scopes work orders to a concrete staff store instead of all-store browsing', () => {
    expect(workOrdersSource).toContain('concreteStoreOptions')
    expect(workOrdersSource).toContain('normalizeStoreFilter')
    expect(workOrdersSource).toContain('ensureWorkbenchStores')
    expect(workOrdersSource).toContain('await ensureWorkbenchStores()')
    expect(workOrdersSource).toContain('scopedWorkOrders')
    expect(workOrdersSource).toContain(':value="String(store.backendId)"')
    expect(workOrdersSource).toContain('String(item.order.storeBackendId) === storeFilter.value')
    expect(workOrdersSource).not.toContain('<option value="all">全部门店</option>')
    expect(workOrdersSource).not.toContain("storeFilter.value !== 'all'")
  })
})
