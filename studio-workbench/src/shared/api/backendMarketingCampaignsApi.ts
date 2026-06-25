import { apiRequest, apiRequestRaw } from './request'
import type {
  MarketingCampaignDto,
  MarketingCampaignListQuery,
  MarketingCampaignPayload,
  MarketingCampaignProductBindPayload,
  MarketingCampaignScaffoldDto,
} from './backendTypes'
import { listMarketingRows, toBackendId, toBackendIds } from './backendMarketingShared'

type RawCampaignRow = Omit<MarketingCampaignDto, 'campaignId' | 'storeIds' | 'productIds'> & {
  campaignId: string | number
  storeIds?: Array<string | number | null> | null
  productIds?: Array<string | number | null> | null
}

const mapCampaign = (row: RawCampaignRow): MarketingCampaignDto => ({
  ...row,
  campaignId: toBackendId(row.campaignId),
  storeIds: toBackendIds(row.storeIds),
  productIds: toBackendIds(row.productIds),
  participantCount: Number(row.participantCount ?? 0),
  orderCount: Number(row.orderCount ?? 0),
  paidAmountCent: Number(row.paidAmountCent ?? 0),
})

export const marketingCampaignsApi = {
  getCampaignScaffold() {
    return apiRequest<MarketingCampaignScaffoldDto>('/yy/campaign/scaffold')
  },
  async listCampaigns(query: MarketingCampaignListQuery = {}) {
    const rows = await listMarketingRows<RawCampaignRow>('/yy/campaign/list', query)
    return rows.map(mapCampaign)
  },
  createCampaign(payload: MarketingCampaignPayload) {
    return apiRequestRaw('/yy/campaign', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateCampaign(campaignId: string, payload: MarketingCampaignPayload) {
    return apiRequestRaw('/yy/campaign', {
      method: 'PUT',
      body: JSON.stringify({ ...payload, id: campaignId }),
    })
  },
  onlineCampaign(campaignId: string) {
    return apiRequestRaw(`/yy/campaign/${campaignId}/online`, { method: 'POST' })
  },
  offlineCampaign(campaignId: string) {
    return apiRequestRaw(`/yy/campaign/${campaignId}/offline`, { method: 'POST' })
  },
  bindCampaignProducts(campaignId: string, payload: MarketingCampaignProductBindPayload) {
    return apiRequestRaw(`/yy/campaign/${campaignId}/products`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}
