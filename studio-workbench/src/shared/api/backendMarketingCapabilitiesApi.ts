import { apiRequest } from './request'
import type {
  MarketingCapabilityDto,
  MarketingDashboardDto,
  PromotionTrialPayload,
  PromotionTrialResultDto,
} from './backendTypes'

export const marketingCapabilitiesApi = {
  listMarketingCapabilities() {
    return apiRequest<MarketingCapabilityDto[]>('/yy/marketingCapability/list')
  },
  getMarketingDashboard() {
    return apiRequest<MarketingDashboardDto>('/yy/marketing/dashboard')
  },
  runPromotionTrial(payload: PromotionTrialPayload) {
    return apiRequest<PromotionTrialResultDto>('/yy/promotionTrial/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
