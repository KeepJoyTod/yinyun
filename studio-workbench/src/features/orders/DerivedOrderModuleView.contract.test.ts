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
      expect(getWorkbenchFeature(key)?.status).toBe('derived')
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:order:list')
    }
  })

  it('uses unified order and album data without creating bookings', () => {
    expect(viewSource).toContain('buildDerivedOrderItems')
    expect(viewSource).toContain('appStore.orders')
    expect(viewSource).toContain('appStore.albums')
    expect(viewSource).toContain('selectedItem.boundary')
    expect(viewSource).not.toContain('createOrder')
    expect(viewSource).not.toContain('createBooking')
  })

  it('keeps only four derived order module keys after moving order forms to dedicated owner', () => {
    expect(operationsSource).toContain("key: 'order-print'")
    expect(operationsSource).toContain("key: 'order-enterprise'")
    expect(operationsSource).toContain("key: 'order-card'")
    expect(operationsSource).toContain("key: 'order-coupon'")
    expect(operationsSource).not.toContain("key: 'order-forms'")
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
    expect(viewSource).not.toContain("storeFilter.value !== 'all'")
  })
})
