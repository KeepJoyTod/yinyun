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

export type MarketingCouponTemplateDto = {
  templateId: string
  templateName: string
  templateType: 'DISCOUNT' | 'CASH' | 'REDEEM'
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
}

export type MarketingCouponGrantDto = {
  grantId: string
  templateId: string
  templateName: string
  targetCustomer: string
  targetMobile: string
  grantSource: string
  status: MarketingScaffoldStatus
}

export type MarketingCouponInstanceDto = {
  instanceId: string
  templateId: string
  templateName: string
  holderName: string
  status: 'UNUSED' | 'USED' | 'EXPIRED' | 'RESTORE_PENDING'
  orderId?: string
  expiresAt?: string
}

export type MarketingCouponScaffoldDto = {
  status: MarketingScaffoldStatus
  boundary: string
  templates: MarketingCouponTemplateDto[]
  grantRecords: MarketingCouponGrantDto[]
  instances: MarketingCouponInstanceDto[]
}

export type MarketingCampaignDto = {
  campaignId: string
  campaignName: string
  campaignType: 'BARGAIN' | 'SECKILL' | 'GROUP_BUY' | 'LIMITED_DISCOUNT' | 'SHARE_GIFT'
  status: MarketingScaffoldStatus
  storeScopeLabel: string
  productScopeLabel: string
  timeRangeLabel: string
  participantCount: number
  orderCount: number
  paidAmountCent: number
}

export type MarketingCampaignScaffoldDto = {
  status: MarketingScaffoldStatus
  boundary: string
  campaigns: MarketingCampaignDto[]
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
  stage: '待转化' | '已转化' | '已退款' | '待跟进'
  payableAmountCent: number
  finalAmountCent: number
  nextAction: string
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
