import { apiRequest } from './request'
import type {
  MarketingCampaignParticipationDto,
  MarketingCampaignScaffoldDto,
  MarketingCapabilityDto,
  MarketingCouponScaffoldDto,
  MarketingDashboardDto,
  PromotionTrialPayload,
  PromotionTrialResultDto,
} from './backendTypes'

export const marketingApi = {
  listMarketingCapabilities() {
    return apiRequest<MarketingCapabilityDto[]>('/yy/marketingCapability/list')
  },
  getMarketingDashboard() {
    return apiRequest<MarketingDashboardDto>('/yy/marketing/dashboard')
  },
  getCouponTemplateScaffold() {
    return apiRequest<MarketingCouponScaffoldDto>('/yy/couponTemplate/scaffold')
  },
  getCampaignScaffold() {
    return apiRequest<MarketingCampaignScaffoldDto>('/yy/campaign/scaffold')
  },
  getCampaignParticipationScaffold() {
    return apiRequest<MarketingCampaignParticipationDto[]>('/yy/campaignParticipation/scaffold')
  },
  runPromotionTrial(payload: PromotionTrialPayload) {
    return apiRequest<PromotionTrialResultDto>('/yy/promotionTrial/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
