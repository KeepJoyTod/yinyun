import { apiRequest } from './request'
import type {
  MarketingCampaignParticipationDto,
  MarketingParticipationListQuery,
  MarketingParticipationRowDto,
} from './backendTypes'
import { listMarketingRows, toBackendId, toOptionalBackendId } from './backendMarketingShared'

type RawParticipationRow = Omit<MarketingParticipationRowDto, 'participationId' | 'campaignId' | 'customerId' | 'orderId'> & {
  participationId: string | number
  campaignId: string | number
  customerId?: string | number | null
  orderId?: string | number | null
}

const mapParticipation = (row: RawParticipationRow): MarketingParticipationRowDto => ({
  ...row,
  participationId: toBackendId(row.participationId),
  campaignId: toBackendId(row.campaignId),
  customerId: toOptionalBackendId(row.customerId),
  orderId: toOptionalBackendId(row.orderId),
  payableAmountCent: Number(row.payableAmountCent ?? 0),
  finalAmountCent: Number(row.finalAmountCent ?? 0),
})

export const marketingParticipationsApi = {
  getCampaignParticipationScaffold() {
    return apiRequest<MarketingCampaignParticipationDto[]>('/yy/campaignParticipation/scaffold')
  },
  async listCampaignParticipations(query: MarketingParticipationListQuery = {}) {
    const rows = await listMarketingRows<RawParticipationRow>('/yy/campaignParticipation/list', query)
    return rows.map(mapParticipation)
  },
}
