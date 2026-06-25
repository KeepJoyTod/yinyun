import type { BackendId } from './backendId'

export type MarketingScaffoldStatus = 'scaffold' | 'ready' | 'disabled' | 'expired'

export type MarketingCapabilityDto = {
  capabilityCode: string
  capabilityName: string
  enabled: boolean
  status: MarketingScaffoldStatus
  scopeLabel: string
  gateCopy: string
  expiresAt?: string
}

export type MarketingDashboardMetricDto = {
  metricCode: string
  label: string
  value: string
  hint: string
}

export type MarketingChannelSummaryDto = {
  sourceLabel: string
  orderCount: number
  paidOrderCount: number
  pendingCount: number
  paidAmountCent: number
}

export type MarketingDashboardDto = {
  status: MarketingScaffoldStatus
  boundary: string
  metrics: MarketingDashboardMetricDto[]
  channels: MarketingChannelSummaryDto[]
}

export type MarketingCouponTemplateType = 'DISCOUNT' | 'CASH' | 'REDEEM'
export type MarketingCouponTemplateStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | string
export type MarketingCampaignType =
  | 'BARGAIN'
  | 'SECKILL'
  | 'GROUP_BUY'
  | 'LIMITED_DISCOUNT'
  | 'SHARE_GIFT'
  | 'LOTTERY'
  | string
export type MarketingCampaignStatus = 'DRAFT' | 'ONLINE' | 'OFFLINE' | string

export type MarketingCouponTemplateDto = {
  templateId: BackendId
  templateName: string
  templateType: MarketingCouponTemplateType
  status: MarketingCouponTemplateStatus
  storeIds: BackendId[]
  productIds: BackendId[]
  storeScopeLabel: string
  productScopeLabel: string
  faceValueCent: number
  minSpendCent: number
  stackPolicy: string
  restoreOnRefund: boolean
  issuedCount: number
  writeoffCount: number
  startAt?: string
  endAt?: string
}

export type MarketingCouponTemplatePayload = {
  templateName: string
  templateType: MarketingCouponTemplateType
  storeIds: BackendId[]
  productIds: BackendId[]
  faceValueCent: number
  minSpendCent: number
  stackPolicy: string
  restoreOnRefund: boolean
  startAt: string
  endAt: string
  status: MarketingCouponTemplateStatus
}

export type MarketingCouponTemplateListQuery = {
  templateName?: string
  templateType?: MarketingCouponTemplateType | ''
  status?: MarketingCouponTemplateStatus | ''
  queryStoreId?: BackendId | ''
  pageNum?: number
  pageSize?: number
}

export type MarketingCouponGrantRecordDto = {
  grantId: BackendId
  templateId: BackendId
  templateName: string
  customerId?: BackendId
  customerName: string
  customerMobile: string
  issueSource: string
  issueCount: number
  status: string
  remark: string
  createTime?: string
}

export type MarketingCouponGrantDto = MarketingCouponGrantRecordDto

export type MarketingCouponIssuePayload = {
  templateId: BackendId
  customerIds: BackendId[]
  issueSource: string
  issueCount: number
  remark: string
}

export type MarketingCouponInstanceDto = {
  instanceId: BackendId
  templateId: BackendId
  templateName: string
  customerId?: BackendId
  holderName: string
  status: 'UNUSED' | 'USED' | 'EXPIRED' | 'RESTORE_PENDING' | string
  restoreStatus?: string
  orderId?: BackendId
  expiresAt?: string
}

export type MarketingCouponWriteoffDto = {
  writeoffId: BackendId
  instanceId: BackendId
  templateName: string
  orderId?: BackendId
  writeoffAmountCent: number
  restoreStatus?: string
  restoreReason?: string
  createTime?: string
}

export type MarketingCouponScaffoldDto = {
  status: MarketingScaffoldStatus
  boundary: string
  templates: Array<{
    templateId: string
    templateName: string
    templateType: MarketingCouponTemplateType
    status: MarketingScaffoldStatus
    storeScopeLabel: string
    productScopeLabel: string
    faceValueCent: number
    discountRate?: number
    stackedWith: string
    restoreOnRefund: boolean
    issuedCount: number
    writeoffCount: number
    expiresAt?: string
  }>
  grantRecords: Array<{
    grantId: string
    templateId: string
    templateName: string
    targetCustomer: string
    targetMobile: string
    grantSource: string
    status: MarketingScaffoldStatus
  }>
  instances: Array<{
    instanceId: string
    templateId: string
    templateName: string
    holderName: string
    status: 'UNUSED' | 'USED' | 'EXPIRED' | 'RESTORE_PENDING'
    orderId?: string
    expiresAt?: string
  }>
}

export type MarketingCampaignDto = {
  campaignId: BackendId
  campaignName: string
  campaignType: MarketingCampaignType
  status: MarketingCampaignStatus
  storeIds: BackendId[]
  productIds: BackendId[]
  storeScopeLabel: string
  productScopeLabel: string
  startAt?: string
  endAt?: string
  timeRangeLabel: string
  participantCount: number
  orderCount: number
  paidAmountCent: number
  ruleSummary: string
}

export type MarketingCampaignPayload = {
  campaignName: string
  campaignType: MarketingCampaignType
  storeIds: BackendId[]
  productIds: BackendId[]
  startAt: string
  endAt: string
  status: MarketingCampaignStatus
  ruleSummary: string
}

export type MarketingCampaignListQuery = {
  campaignName?: string
  campaignType?: MarketingCampaignType | ''
  status?: MarketingCampaignStatus | ''
  queryStoreId?: BackendId | ''
  pageNum?: number
  pageSize?: number
}

export type MarketingCampaignProductBindPayload = {
  productIds: BackendId[]
}

export type MarketingCampaignScaffoldDto = {
  status: MarketingScaffoldStatus
  boundary: string
  campaigns: Array<{
    campaignId: string
    campaignName: string
    campaignType: MarketingCampaignType
    status: MarketingScaffoldStatus
    storeScopeLabel: string
    productScopeLabel: string
    timeRangeLabel: string
    participantCount: number
    orderCount: number
    paidAmountCent: number
  }>
  sources: MarketingChannelSummaryDto[]
}

export type MarketingCampaignParticipationDto = {
  participationId: string
  campaignId: string
  campaignName: string
  customerName: string
  customerMobile: string
  channelLabel: string
  orderId?: string
  stage: string
  payableAmountCent: number
  finalAmountCent: number
  nextAction: string
}

export type MarketingParticipationRowDto = {
  participationId: BackendId
  campaignId: BackendId
  campaignName: string
  customerId?: BackendId
  customerName: string
  orderId?: BackendId
  participationStatus: string
  conversionStatus: string
  refundStatus: string
  invalidReason: string
  participatedAt?: string
  payableAmountCent: number
  finalAmountCent: number
}

export type MarketingParticipationListQuery = {
  campaignId?: BackendId | ''
  customerName?: string
  orderId?: BackendId | ''
  participationStatus?: string
  conversionStatus?: string
  refundStatus?: string
  pageNum?: number
  pageSize?: number
}

export type PromotionCandidateType =
  | 'REDEEM_VOUCHER'
  | 'CAMPAIGN'
  | 'COUPON'
  | 'COUPON_CODE'
  | 'CARD_RIGHT'

export type PromotionTrialCandidateDto = {
  candidateId: string
  candidateType: PromotionCandidateType
  title: string
  applicable: boolean
  priority: number
  discountAmountCent: number
  finalAmountCent: number
  conflictSource?: string
  reason?: string
}

export type PromotionTrialPayload = {
  orderId?: string
  storeId?: string
  customerId?: string
  productId?: string
  productName?: string
  orderSource?: string
  customerLevel?: string
  originalAmountCent: number
}

export type PromotionTrialResultDto = {
  status: 'eligible' | 'blocked'
  appliedRuleCode?: string
  originalAmountCent: number
  finalAmountCent: number
  discountAmountCent: number
  conflictSource?: string
  restorePolicy: string
  blockedReasons: string[]
  candidates: PromotionTrialCandidateDto[]
}
