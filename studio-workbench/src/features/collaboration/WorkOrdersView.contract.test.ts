import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import workOrdersSource from './WorkOrdersView.vue?raw'
import composableSource from './useCollaborationWorkOrders.ts?raw'

describe('work orders page contract', () => {
  it('replaces the collaboration work order placeholder with a real route', () => {
    expect(routerSource).toContain('WorkOrdersView.vue')
    expect(getWorkbenchFeature('collaboration-work-orders')?.component).toBe('work-orders')
    expect(getWorkbenchFeature('collaboration-work-orders')?.status).toBe('ready')
    expect(getWorkbenchFeature('collaboration-work-orders')?.permission).toBe('yy:order:list')
  })

  it('reads and transitions real work orders through the collaboration owner api', () => {
    expect(workOrdersSource).toContain('useCollaborationWorkOrders')
    expect(workOrdersSource).toContain('transitionWorkOrder')
    expect(workOrdersSource).toContain('yy_work_order')
    expect(composableSource).toContain('workOrdersApi.listWorkOrders')
    expect(composableSource).toContain('workOrdersApi.transitionWorkOrder')
    expect(workOrdersSource).not.toContain('buildWorkOrders')
    expect(workOrdersSource).not.toContain('appStore.updateOrderStatus')
  })

  it('keeps staff focused on existing work order processing', () => {
    expect(workOrdersSource).toContain('primaryActionLabel')
    expect(workOrdersSource).toContain('selectedWorkOrder.actionPath')
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
    expect(workOrdersSource).not.toContain('<option value="all">全部门店')
  })

  it('loads feature scope and event rows through collaboration owners', () => {
    expect(workOrdersSource).toContain('FeatureGateStatusCard')
    expect(workOrdersSource).toContain('v-if="canLoadData"')
    expect(workOrdersSource).toContain('workOrderEvents')
    expect(composableSource).toContain("featureKey: 'collaboration-work-orders'")
    expect(composableSource).toContain('featureGate.loadGate()')
    expect(composableSource).toContain('workOrdersApi.listWorkOrderEvents')
  })
})
