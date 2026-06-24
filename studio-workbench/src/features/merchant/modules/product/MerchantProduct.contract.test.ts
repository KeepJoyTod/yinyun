import { describe, expect, it } from 'vitest'
import wrapperSource from './MerchantProductView.vue?raw'
import boardSource from './components/MerchantProductReadinessBoard.vue?raw'
import stateSource from './composables/useMerchantProductState.ts?raw'
import operationsSource from './merchantProductOperations.ts?raw'

describe('merchant product module scaffold', () => {
  it('owns product entry, readiness board, state, and operations files', () => {
    const source = `${wrapperSource}\n${boardSource}\n${stateSource}\n${operationsSource}`
    expect(source).toContain('DouyinProductsView')
    expect(source).toContain('useMerchantProductState')
    expect(source).toContain('buildMerchantProductFilters')
    expect(source).toContain('checkDouyinProductReadiness')
  })
})
