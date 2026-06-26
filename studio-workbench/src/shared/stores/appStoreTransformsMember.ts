import type {
  MemberBalanceLedgerDto,
  MemberBenefitDto,
  MemberCardDto,
  MemberCouponDto,
  MemberGrowthLedgerDto,
  MemberOverviewDto,
  MemberPointsLedgerDto,
  MemberRechargeOrderDto,
} from '../api/backend'
import type {
  MemberBalanceLedgerInfo,
  MemberBenefitInfo,
  MemberCardInfo,
  MemberCouponInfo,
  MemberGrowthLedgerInfo,
  MemberOverviewInfo,
  MemberPointsLedgerInfo,
  MemberRechargeOrderInfo,
} from './appStoreTypes'

export const mapMemberOverview = (dto: MemberOverviewDto): MemberOverviewInfo => ({
  customerBackendId: dto.customerId,
  customerName: dto.customerName,
  mobile: dto.mobile,
  memberLevel: dto.memberLevel || '普通',
  tagSummary: dto.tagSummary || '',
  totalOrderCount: dto.totalOrderCount,
  totalSpend: dto.totalSpendAmount,
  activeCardCount: dto.activeCardCount,
  activeCouponCount: dto.activeCouponCount,
  activeBenefitCount: dto.activeBenefitCount,
  pointsBalance: dto.pointsBalance,
  growthValue: dto.growthValue,
  balanceAmount: dto.balanceAmount,
  pendingRechargeCount: dto.pendingRechargeCount,
  lastTradeTime: dto.lastTradeTime || '',
  remark: dto.remark || '',
})

export const mapMemberCard = (dto: MemberCardDto): MemberCardInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  cardName: dto.cardName,
  cardType: dto.cardType,
  status: dto.status,
  totalQuota: dto.totalQuota,
  usedQuota: dto.usedQuota,
  remainingQuota: dto.remainingQuota,
  balanceAmount: dto.balanceAmount,
  effectiveFrom: dto.effectiveFrom || '',
  effectiveTo: dto.effectiveTo || '',
  sourceOrderBackendId: dto.sourceOrderId ?? undefined,
  remark: dto.remark || '',
})

export const mapMemberBenefit = (dto: MemberBenefitDto): MemberBenefitInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  benefitName: dto.benefitName,
  benefitType: dto.benefitType,
  status: dto.status,
  totalAmount: dto.totalAmount,
  usedAmount: dto.usedAmount,
  remainingAmount: dto.remainingAmount,
  sourceType: dto.sourceType,
  sourceBackendId: dto.sourceId ?? undefined,
  expireTime: dto.expireTime || '',
  remark: dto.remark || '',
})

export const mapMemberCoupon = (dto: MemberCouponDto): MemberCouponInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  couponName: dto.couponName,
  couponType: dto.couponType,
  status: dto.status,
  discountAmount: dto.discountAmount,
  thresholdAmount: dto.thresholdAmount,
  sourceType: dto.sourceType,
  sourceBackendId: dto.sourceId ?? undefined,
  expireTime: dto.expireTime || '',
  remark: dto.remark || '',
})

export const mapMemberPointsLedger = (dto: MemberPointsLedgerDto): MemberPointsLedgerInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  changeType: dto.changeType,
  changeAmount: dto.changeAmount,
  balanceAfter: dto.balanceAfter,
  sourceType: dto.sourceType,
  sourceBackendId: dto.sourceId ?? undefined,
  happenedAt: dto.happenedAt || '',
  remark: dto.remark || '',
})

export const mapMemberGrowthLedger = (dto: MemberGrowthLedgerDto): MemberGrowthLedgerInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  changeType: dto.changeType,
  changeAmount: dto.changeAmount,
  balanceAfter: dto.balanceAfter,
  sourceType: dto.sourceType,
  sourceBackendId: dto.sourceId ?? undefined,
  happenedAt: dto.happenedAt || '',
  remark: dto.remark || '',
})

export const mapMemberBalanceLedger = (dto: MemberBalanceLedgerDto): MemberBalanceLedgerInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  changeType: dto.changeType,
  changeAmount: dto.changeAmount,
  balanceAfter: dto.balanceAfter,
  sourceType: dto.sourceType,
  sourceBackendId: dto.sourceId ?? undefined,
  happenedAt: dto.happenedAt || '',
  remark: dto.remark || '',
})

export const mapMemberRechargeOrder = (dto: MemberRechargeOrderDto): MemberRechargeOrderInfo => ({
  backendId: dto.id,
  customerBackendId: dto.customerId,
  approvalId: dto.approvalId ?? null,
  rechargeOrderNo: dto.rechargeOrderNo,
  rechargeAmount: dto.rechargeAmount,
  giftAmount: dto.giftAmount,
  creditedAmount: dto.creditedAmount,
  balanceAfter: dto.balanceAfter,
  status: dto.status,
  channelType: dto.channelType,
  paidTime: dto.paidTime || '',
  externalTradeNo: dto.externalTradeNo || '',
  remark: dto.remark || '',
})
