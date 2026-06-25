import { apiRequest, apiRequestRaw } from './request'
import type {
  MarketingCouponGrantRecordDto,
  MarketingCouponInstanceDto,
  MarketingCouponIssuePayload,
  MarketingCouponScaffoldDto,
  MarketingCouponTemplateDto,
  MarketingCouponTemplateListQuery,
  MarketingCouponTemplatePayload,
  MarketingCouponWriteoffDto,
} from './backendTypes'
import { listMarketingRows, toBackendId, toBackendIds, toOptionalBackendId } from './backendMarketingShared'

type RawCouponTemplateRow = Omit<MarketingCouponTemplateDto, 'templateId' | 'storeIds' | 'productIds'> & {
  templateId: string | number
  storeIds?: Array<string | number | null> | null
  productIds?: Array<string | number | null> | null
}

type RawCouponGrantRecordRow = Omit<MarketingCouponGrantRecordDto, 'grantId' | 'templateId' | 'customerId'> & {
  grantId: string | number
  templateId: string | number
  customerId?: string | number | null
}

type RawCouponInstanceRow = Omit<MarketingCouponInstanceDto, 'instanceId' | 'templateId' | 'customerId' | 'orderId'> & {
  instanceId: string | number
  templateId: string | number
  customerId?: string | number | null
  orderId?: string | number | null
}

type RawCouponWriteoffRow = Omit<MarketingCouponWriteoffDto, 'writeoffId' | 'instanceId' | 'orderId'> & {
  writeoffId: string | number
  instanceId: string | number
  orderId?: string | number | null
}

const mapCouponTemplate = (row: RawCouponTemplateRow): MarketingCouponTemplateDto => ({
  ...row,
  templateId: toBackendId(row.templateId),
  storeIds: toBackendIds(row.storeIds),
  productIds: toBackendIds(row.productIds),
  faceValueCent: Number(row.faceValueCent ?? 0),
  minSpendCent: Number(row.minSpendCent ?? 0),
  issuedCount: Number(row.issuedCount ?? 0),
  writeoffCount: Number(row.writeoffCount ?? 0),
  restoreOnRefund: Boolean(row.restoreOnRefund),
})

const mapGrantRecord = (row: RawCouponGrantRecordRow): MarketingCouponGrantRecordDto => ({
  ...row,
  grantId: toBackendId(row.grantId),
  templateId: toBackendId(row.templateId),
  customerId: toOptionalBackendId(row.customerId),
  issueCount: Number(row.issueCount ?? 0),
})

const mapInstance = (row: RawCouponInstanceRow): MarketingCouponInstanceDto => ({
  ...row,
  instanceId: toBackendId(row.instanceId),
  templateId: toBackendId(row.templateId),
  customerId: toOptionalBackendId(row.customerId),
  orderId: toOptionalBackendId(row.orderId),
})

const mapWriteoff = (row: RawCouponWriteoffRow): MarketingCouponWriteoffDto => ({
  ...row,
  writeoffId: toBackendId(row.writeoffId),
  instanceId: toBackendId(row.instanceId),
  orderId: toOptionalBackendId(row.orderId),
  writeoffAmountCent: Number(row.writeoffAmountCent ?? 0),
})

export const marketingCouponsApi = {
  getCouponTemplateScaffold() {
    return apiRequest<MarketingCouponScaffoldDto>('/yy/couponTemplate/scaffold')
  },
  async listCouponTemplates(query: MarketingCouponTemplateListQuery = {}) {
    const rows = await listMarketingRows<RawCouponTemplateRow>('/yy/couponTemplate/list', query)
    return rows.map(mapCouponTemplate)
  },
  createCouponTemplate(payload: MarketingCouponTemplatePayload) {
    return apiRequestRaw('/yy/couponTemplate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateCouponTemplate(templateId: string, payload: MarketingCouponTemplatePayload) {
    return apiRequestRaw('/yy/couponTemplate', {
      method: 'PUT',
      body: JSON.stringify({ ...payload, id: templateId }),
    })
  },
  issueCouponTemplate(templateId: string, payload: MarketingCouponIssuePayload) {
    return apiRequestRaw(`/yy/couponTemplate/${templateId}/issue`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, templateId }),
    })
  },
  async listCouponGrantRecords(templateId: string) {
    const rows = await apiRequest<RawCouponGrantRecordRow[]>(`/yy/couponTemplate/${templateId}/grants`)
    return rows.map(mapGrantRecord)
  },
  async listCouponInstances(templateId: string) {
    const rows = await apiRequest<RawCouponInstanceRow[]>(`/yy/couponTemplate/${templateId}/instances`)
    return rows.map(mapInstance)
  },
  async listCouponWriteoffs(templateId: string) {
    const rows = await apiRequest<RawCouponWriteoffRow[]>(`/yy/couponTemplate/${templateId}/writeoffs`)
    return rows.map(mapWriteoff)
  },
}
