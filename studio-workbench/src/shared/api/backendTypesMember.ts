import type { BackendId } from './backendId'

export type MemberOverviewDto = {
  customerId: BackendId
  customerName: string
  mobile: string
  memberLevel: string
  tagSummary: string
  totalOrderCount: number
  totalSpendAmount: number
  activeCardCount: number
  activeCouponCount: number
  activeBenefitCount: number
  pointsBalance: number
  growthValue: number
  balanceAmount: number
  pendingRechargeCount: number
  lastTradeTime: string
  remark: string
}

export type MemberCardDto = {
  id: BackendId
  customerId: BackendId
  cardName: string
  cardType: string
  status: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  balanceAmount: number
  effectiveFrom: string
  effectiveTo: string
  sourceOrderId?: BackendId | null
  remark: string
}

export type MemberBenefitDto = {
  id: BackendId
  customerId: BackendId
  benefitName: string
  benefitType: string
  status: string
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  sourceType: string
  sourceId?: BackendId | null
  expireTime: string
  remark: string
}

export type MemberCouponDto = {
  id: BackendId
  customerId: BackendId
  couponName: string
  couponType: string
  status: string
  discountAmount: number
  thresholdAmount: number
  sourceType: string
  sourceId?: BackendId | null
  expireTime: string
  remark: string
}

export type MemberPointsLedgerDto = {
  id: BackendId
  customerId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceId?: BackendId | null
  happenedAt: string
  remark: string
}

export type MemberGrowthLedgerDto = {
  id: BackendId
  customerId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceId?: BackendId | null
  happenedAt: string
  remark: string
}

export type MemberBalanceLedgerDto = {
  id: BackendId
  customerId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceId?: BackendId | null
  happenedAt: string
  remark: string
}

export type MemberRechargeOrderDto = {
  id: BackendId
  customerId: BackendId
  approvalId?: BackendId | null
  rechargeOrderNo: string
  rechargeAmount: number
  giftAmount: number
  creditedAmount: number
  balanceAfter: number
  status: string
  channelType: string
  paidTime: string
  externalTradeNo: string
  remark: string
}

export type MemberRechargeCreatePayload = {
  storeId?: BackendId | null
  rechargeAmount: number
  giftAmount?: number
  channelType?: string
  externalTradeNo?: string
  remark?: string
}
