import { marketingCampaignsApi } from './backendMarketingCampaignsApi'
import { marketingCapabilitiesApi } from './backendMarketingCapabilitiesApi'
import { marketingCouponsApi } from './backendMarketingCouponsApi'
import { marketingParticipationsApi } from './backendMarketingParticipationsApi'

export const marketingApi = {
  ...marketingCapabilitiesApi,
  ...marketingCouponsApi,
  ...marketingCampaignsApi,
  ...marketingParticipationsApi,
}
