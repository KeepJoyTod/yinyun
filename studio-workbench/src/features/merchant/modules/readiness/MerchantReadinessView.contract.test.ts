import { describe, expect, it } from 'vitest'
import merchantReadinessViewSource from './MerchantReadinessView.vue?raw'
import merchantReadinessBoardSource from './components/MerchantReadinessBoard.vue?raw'
import merchantReadinessOperationsSource from './merchantReadinessOperations.ts?raw'
import merchantReadinessStateSource from './composables/useMerchantReadinessState.ts?raw'

describe('merchant readiness scaffold contract', () => {
  it('keeps the readiness page wired to one module chrome and board owner', () => {
    expect(merchantReadinessViewSource).toContain('MerchantModuleChrome')
    expect(merchantReadinessViewSource).toContain('MerchantReadinessBoard')
    expect(merchantReadinessViewSource).toContain('useMerchantReadinessState')
  })

  it('keeps the readiness board and operations split from the page shell', () => {
    expect(merchantReadinessBoardSource).toContain('readinessStatusClass')
    expect(merchantReadinessBoardSource).toContain('readinessPriorityClass')
    expect(merchantReadinessOperationsSource).toContain('merchantReadinessSections')
    expect(merchantReadinessOperationsSource).toContain('buildReadinessSummary')
    expect(merchantReadinessStateSource).toContain('merchantReadinessApi.getMerchantReadinessSummary')
  })
})
