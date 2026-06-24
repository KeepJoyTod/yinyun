import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import centerViewSource from './MarketingCenterView.vue?raw'
import couponViewSource from './MarketingCouponsView.vue?raw'
import campaignViewSource from './MarketingCampaignsView.vue?raw'
import participationViewSource from './MarketingParticipationsView.vue?raw'

describe('marketing module views contract', () => {
  it('mounts dedicated marketing views instead of the old derived placeholder', () => {
    expect(routerSource).toContain('MarketingCenterView.vue')
    expect(routerSource).toContain('MarketingCouponsView.vue')
    expect(routerSource).toContain('MarketingCampaignsView.vue')
    expect(routerSource).toContain('MarketingParticipationsView.vue')
    expect(getWorkbenchFeature('marketing-center')?.component).toBe('marketing-center-view')
    expect(getWorkbenchFeature('marketing-coupons')?.component).toBe('marketing-coupons-view')
    expect(getWorkbenchFeature('marketing-campaigns')?.component).toBe('marketing-campaigns-view')
    expect(getWorkbenchFeature('marketing-participations')?.component).toBe('marketing-participations-view')
  })

  it('uses capability gate, campaign bridge and promotion trial owners', () => {
    expect(centerViewSource).toContain('MarketingCapabilityGateCard')
    expect(centerViewSource).toContain('CampaignOrderLinkPanel')
    expect(couponViewSource).toContain('MarketingCapabilityGateCard')
    expect(campaignViewSource).toContain('CampaignOrderLinkPanel')
    expect(participationViewSource).toContain('PromotionTrialPanel')
  })
})
