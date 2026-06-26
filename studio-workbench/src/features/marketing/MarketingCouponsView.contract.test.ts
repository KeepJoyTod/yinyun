import { describe, expect, it } from 'vitest'
import marketingCouponsSource from './MarketingCouponsView.vue?raw'
import issuanceSource from './composables/useCouponIssuance.ts?raw'

describe('marketing coupons owner contract', () => {
  it('can prefill issue customers from member detail route query', () => {
    expect(marketingCouponsSource).toContain('useRoute')
    expect(marketingCouponsSource).toContain('route.query.customerId')
    expect(marketingCouponsSource).toContain('buildIssueDraft(templateId, routeCustomerId.value ? [routeCustomerId.value] : [])')
    expect(issuanceSource).toContain('buildIssueDraft = (templateId = \'\', customerIds: string[] = [])')
  })
})
