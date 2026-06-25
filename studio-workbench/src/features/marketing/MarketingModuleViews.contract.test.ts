import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import centerViewSource from './MarketingCenterView.vue?raw'
import couponViewSource from './MarketingCouponsView.vue?raw'
import campaignViewSource from './MarketingCampaignsView.vue?raw'
import participationViewSource from './MarketingParticipationsView.vue?raw'
import useCouponTemplatesSource from './composables/useCouponTemplates.ts?raw'
import useCampaignEditorSource from './composables/useCampaignEditor.ts?raw'
import useCampaignParticipationSource from './composables/useCampaignParticipation.ts?raw'
import useMarketingCapabilityGateSource from './composables/useMarketingCapabilityGate.ts?raw'

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

  it('uses leaf owners for merchant marketing CRUD instead of piling forms into views', () => {
    expect(couponViewSource).toContain('CouponTemplateTable')
    expect(couponViewSource).toContain('CouponTemplateDrawer')
    expect(couponViewSource).toContain('CouponIssueDrawer')
    expect(couponViewSource).toContain('CouponInstanceTable')
    expect(campaignViewSource).toContain('CampaignTable')
    expect(campaignViewSource).toContain('CampaignDrawer')
    expect(participationViewSource).toContain('ParticipationTable')
    expect(couponViewSource).not.toContain('backendApi')
    expect(campaignViewSource).not.toContain('backendApi')
    expect(participationViewSource).not.toContain('backendApi')
  })

  it('routes real marketing writes through composables and keeps scaffold fallback demo-only', () => {
    expect(useCouponTemplatesSource).toContain('backendApi.listCouponTemplates')
    expect(useCouponTemplatesSource).toContain('backendApi.createCouponTemplate')
    expect(useCouponTemplatesSource).toContain('backendApi.updateCouponTemplate')
    expect(useCouponTemplatesSource).toContain('appStore.demoMode')
    expect(useCampaignEditorSource).toContain('backendApi.listCampaigns')
    expect(useCampaignEditorSource).toContain('backendApi.createCampaign')
    expect(useCampaignEditorSource).toContain('backendApi.onlineCampaign')
    expect(useCampaignParticipationSource).toContain('backendApi.listCampaignParticipations')
    expect(useMarketingCapabilityGateSource).toContain('appStore.demoMode ? buildFallbackMarketingCapabilities() : []')
  })
})
