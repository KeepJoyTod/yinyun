import { apiRequest } from './request'
import type { BackendId } from './backendId'
import type {
  MemberBalanceLedgerDto,
  MemberBenefitDto,
  MemberCardDto,
  MemberCouponDto,
  MemberGrowthLedgerDto,
  MemberRechargeCreatePayload,
  MemberRechargeOrderDto,
  MemberOverviewDto,
  MemberPointsLedgerDto,
} from './backendTypes'

type MemberApiDeps = {
  getOverviews: () => Record<string, MemberOverviewDto>
  setOverviews: (next: Record<string, MemberOverviewDto>) => void
  getCards: () => Record<string, MemberCardDto[]>
  setCards: (next: Record<string, MemberCardDto[]>) => void
  getBenefits: () => Record<string, MemberBenefitDto[]>
  setBenefits: (next: Record<string, MemberBenefitDto[]>) => void
  getCoupons: () => Record<string, MemberCouponDto[]>
  setCoupons: (next: Record<string, MemberCouponDto[]>) => void
  getPointsLedger: () => Record<string, MemberPointsLedgerDto[]>
  setPointsLedger: (next: Record<string, MemberPointsLedgerDto[]>) => void
  getGrowthLedger: () => Record<string, MemberGrowthLedgerDto[]>
  setGrowthLedger: (next: Record<string, MemberGrowthLedgerDto[]>) => void
  getBalanceLedger: () => Record<string, MemberBalanceLedgerDto[]>
  setBalanceLedger: (next: Record<string, MemberBalanceLedgerDto[]>) => void
}

const keyOf = (customerId: BackendId) => String(customerId)

export const createMemberApi = (deps: MemberApiDeps) => ({
  async getMemberOverview(customerId: BackendId) {
    const data = await apiRequest<MemberOverviewDto>(`/yy/member/customer/${customerId}/overview`)
    deps.setOverviews({ ...deps.getOverviews(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberCards(customerId: BackendId) {
    const data = await apiRequest<MemberCardDto[]>(`/yy/member/customer/${customerId}/cards`)
    deps.setCards({ ...deps.getCards(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberBenefits(customerId: BackendId) {
    const data = await apiRequest<MemberBenefitDto[]>(`/yy/member/customer/${customerId}/benefits`)
    deps.setBenefits({ ...deps.getBenefits(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberCoupons(customerId: BackendId) {
    const data = await apiRequest<MemberCouponDto[]>(`/yy/member/customer/${customerId}/coupons`)
    deps.setCoupons({ ...deps.getCoupons(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberPointsLedger(customerId: BackendId, limit = 20) {
    const data = await apiRequest<MemberPointsLedgerDto[]>(`/yy/member/customer/${customerId}/points-ledger`, {}, { limit })
    deps.setPointsLedger({ ...deps.getPointsLedger(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberGrowthLedger(customerId: BackendId, limit = 20) {
    const data = await apiRequest<MemberGrowthLedgerDto[]>(`/yy/member/customer/${customerId}/growth-ledger`, {}, { limit })
    deps.setGrowthLedger({ ...deps.getGrowthLedger(), [keyOf(customerId)]: data })
    return data
  },
  async listMemberBalanceLedger(customerId: BackendId, limit = 20) {
    const data = await apiRequest<MemberBalanceLedgerDto[]>(`/yy/member/customer/${customerId}/balance-ledger`, {}, { limit })
    deps.setBalanceLedger({ ...deps.getBalanceLedger(), [keyOf(customerId)]: data })
    return data
  },
  async createMemberRechargeOrder(customerId: BackendId, payload: MemberRechargeCreatePayload) {
    return apiRequest<MemberRechargeOrderDto>(`/yy/member/customer/${customerId}/recharge-orders`, {
      method: 'POST',
      body: JSON.stringify({
        storeId: payload.storeId ?? null,
        rechargeAmount: payload.rechargeAmount,
        giftAmount: payload.giftAmount ?? 0,
        channelType: payload.channelType,
        externalTradeNo: payload.externalTradeNo,
        remark: payload.remark,
      }),
    })
  },
  async confirmMemberRechargeOrder(rechargeOrderId: BackendId) {
    return apiRequest<MemberRechargeOrderDto>(`/yy/member/recharge-orders/${rechargeOrderId}/confirm`, {
      method: 'POST',
    })
  },
})
