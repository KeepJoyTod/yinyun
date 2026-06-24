import { describe, expect, it } from 'vitest'
import viewSource from './DerivedOrderModuleView.vue?raw'
import operationsSource from './derivedOrderModules.ts?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('derived order module pages contract', () => {
  const featureKeys = ['order-print', 'order-enterprise', 'order-card', 'order-coupon']

  it('replaces the remaining order placeholders with one real derived order module route', () => {
    expect(routerSource).toContain('DerivedOrderModuleView.vue')
    for (const key of featureKeys) {
      expect(getWorkbenchFeature(key)?.component).toBe('derived-order-module')
      expect(getWorkbenchFeature(key)?.status).toBe('ready')
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:order:list')
    }
  })

  it('uses unified order and album data without creating bookings', () => {
    expect(viewSource).toContain('buildDerivedOrderItems')
    expect(viewSource).toContain('appStore.orders')
    expect(viewSource).toContain('appStore.albums')
    expect(viewSource).toContain('统一订单表 yy_order')
    expect(viewSource).not.toContain('createOrder')
    expect(viewSource).not.toContain('新建预约')
  })

  it('shows all five order module labels', () => {
    expect(viewSource).toContain('冲印订单')
    expect(viewSource).toContain('企业团单')
    expect(viewSource).toContain('售卡订单')
    expect(viewSource).toContain('售券订单')
    expect(viewSource).toContain('表单管理')
  })

  it('scopes derived order module filters and deep links to concrete stores', () => {
    expect(viewSource).toContain('concreteStoreOptions')
    expect(viewSource).toContain('normalizeStoreFilter')
    expect(viewSource).toContain('ensureWorkbenchStores')
    expect(viewSource).toContain('storeFilter.value = normalizeStoreFilter()')
    expect(viewSource).toContain('String(item.order.storeBackendId) !== storeFilter.value')
    expect(viewSource).toContain('openUnifiedOrders')
    expect(viewSource).toContain("path: '/order/appointment'")
    expect(viewSource).toContain('storeId: storeFilter.value || undefined')
    expect(operationsSource).toContain('storeId=${encodeURIComponent(String(order.storeBackendId))}')
    expect(viewSource).not.toContain('<option value="all">全部门店</option>')
    expect(viewSource).not.toContain("router.push('/order/appointment')")
    expect(viewSource).not.toContain("storeFilter.value !== 'all'")
  })
})
