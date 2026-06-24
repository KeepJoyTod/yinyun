import { describe, expect, it } from 'vitest'
import overviewSource from './MerchantOverviewView.vue?raw'
import moduleViewSource from './modules/core/MerchantCoreView.vue?raw'
import metricsPanelSource from './modules/core/components/MerchantOverviewMetricsPanel.vue?raw'
import stateSource from './modules/core/composables/useMerchantCoreState.ts?raw'
import operationsSource from './modules/core/merchantCoreOperations.ts?raw'

const overviewContractSource = `${overviewSource}\n${moduleViewSource}\n${metricsPanelSource}\n${stateSource}\n${operationsSource}`

describe('merchant overview contract', () => {
  it('uses the merchant chrome and current appStore ledgers through the core module owner', () => {
    expect(overviewSource).toContain('MerchantModuleChrome')
    expect(overviewSource).toContain('MerchantOverviewMetricsPanel')
    expect(overviewContractSource).toContain('useMerchantCoreState')
    expect(overviewContractSource).toContain('appStore.orders')
    expect(overviewContractSource).toContain('appStore.bookingInventory')
    expect(overviewContractSource).toContain('appStore.channelProductMappings')
  })

  it('summarizes real merchant operations without mock placeholders', () => {
    expect(overviewSource).toContain('商户总览')
    expect(overviewSource).toContain('抖音来客映射')
    expect(overviewSource).not.toContain('merchantMockData')
    expect(overviewSource).not.toContain('fallbackMerchantStores')
  })

  it('scopes merchant overview to one concrete store in the staff workbench', () => {
    expect(overviewSource).toContain('selectedStoreId')
    expect(overviewSource).toContain('concreteStoreOptions')
    expect(overviewContractSource).toContain('applyStoreScope')
    expect(overviewContractSource).toContain('ensureWorkbenchStores')
    expect(overviewContractSource).toContain('String(order.storeBackendId) === selectedStoreId')
    expect(overviewContractSource).toContain('storeId: selectedStoreId.value || undefined')
    expect(overviewContractSource).toContain('storeBackendId: normalized')
  })
})
