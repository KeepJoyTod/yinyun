import { describe, expect, it } from 'vitest'
import overviewSource from './MerchantOverviewView.vue?raw'

describe('merchant overview contract', () => {
  it('uses the merchant chrome and current appStore ledgers', () => {
    expect(overviewSource).toContain('MerchantModuleChrome')
    expect(overviewSource).toContain('appStore.stores')
    expect(overviewSource).toContain('appStore.orders')
    expect(overviewSource).toContain('appStore.bookingInventory')
    expect(overviewSource).toContain('appStore.channelProductMappings')
  })

  it('summarizes real merchant operations without Joe666 mock data', () => {
    expect(overviewSource).toContain('商户总览')
    expect(overviewSource).toContain('商户经营总览')
    expect(overviewSource).toContain('门店运营')
    expect(overviewSource).toContain('门店经营概况')
    expect(overviewSource).toContain('渠道映射')
    expect(overviewSource).toContain('今日预约')
    expect(overviewSource).toContain('待服务订单')
    expect(overviewSource).toContain('抖音来客映射')
    expect(overviewSource).not.toContain('merchantMockData')
    expect(overviewSource).not.toContain('fallbackMerchantStores')
    expect(overviewSource).not.toContain('Merchant Overview')
    expect(overviewSource).not.toContain('Store Operations')
    expect(overviewSource).not.toContain('Channel Mapping')
  })

  it('scopes merchant overview to one concrete store in the staff workbench', () => {
    expect(overviewSource).toContain('selectedStoreId')
    expect(overviewSource).toContain('concreteStoreOptions')
    expect(overviewSource).toContain('normalizeStoreFilter')
    expect(overviewSource).toContain('ensureWorkbenchStores')
    expect(overviewSource).toContain('selectedStore')
    expect(overviewSource).toContain('scopedOrders')
    expect(overviewSource).toContain('scopedBookingInventory')
    expect(overviewSource).toContain('storeBackendId === selectedStoreId.value')
    expect(overviewSource).toContain('storeId: selectedStoreId.value || undefined')
    expect(overviewSource).toContain('storeBackendId: selectedStoreId.value')
    expect(overviewSource).not.toContain('全部门店 ↗')
    expect(overviewSource).not.toContain('const storeRows = computed(() => appStore.stores)')
    expect(overviewSource).not.toContain("loadBookingInventory({ date: todayKey })")
  })
})
