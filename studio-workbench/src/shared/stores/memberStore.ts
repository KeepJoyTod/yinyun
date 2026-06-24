import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { BackendId } from '../api/backendId'
import type {
  MemberBalanceLedgerInfo,
  MemberBenefitInfo,
  MemberCardInfo,
  MemberCouponInfo,
  MemberGrowthLedgerInfo,
  MemberOverviewInfo,
  MemberPointsLedgerInfo,
} from './appStoreTypes'
import {
  mapMemberBalanceLedger,
  mapMemberBenefit,
  mapMemberCard,
  mapMemberCoupon,
  mapMemberGrowthLedger,
  mapMemberOverview,
  mapMemberPointsLedger,
} from './appStoreTransforms'

const keyOf = (customerId: BackendId) => String(customerId)

export const memberStore = reactive({
  overviews: {} as Record<string, MemberOverviewInfo>,
  cards: {} as Record<string, MemberCardInfo[]>,
  benefits: {} as Record<string, MemberBenefitInfo[]>,
  coupons: {} as Record<string, MemberCouponInfo[]>,
  pointsLedger: {} as Record<string, MemberPointsLedgerInfo[]>,
  growthLedger: {} as Record<string, MemberGrowthLedgerInfo[]>,
  balanceLedger: {} as Record<string, MemberBalanceLedgerInfo[]>,

  reset() {
    this.overviews = {}
    this.cards = {}
    this.benefits = {}
    this.coupons = {}
    this.pointsLedger = {}
    this.growthLedger = {}
    this.balanceLedger = {}
  },

  async refreshOverview(customerId: BackendId) {
    const overview = mapMemberOverview(await backendApi.getMemberOverview(customerId))
    this.overviews = { ...this.overviews, [keyOf(customerId)]: overview }
    return overview
  },

  async refreshCards(customerId: BackendId) {
    const cards = (await backendApi.listMemberCards(customerId)).map(mapMemberCard)
    this.cards = { ...this.cards, [keyOf(customerId)]: cards }
    return cards
  },

  async refreshBenefits(customerId: BackendId) {
    const benefits = (await backendApi.listMemberBenefits(customerId)).map(mapMemberBenefit)
    this.benefits = { ...this.benefits, [keyOf(customerId)]: benefits }
    return benefits
  },

  async refreshCoupons(customerId: BackendId) {
    const coupons = (await backendApi.listMemberCoupons(customerId)).map(mapMemberCoupon)
    this.coupons = { ...this.coupons, [keyOf(customerId)]: coupons }
    return coupons
  },

  async refreshPointsLedger(customerId: BackendId, limit = 20) {
    const ledger = (await backendApi.listMemberPointsLedger(customerId, limit)).map(mapMemberPointsLedger)
    this.pointsLedger = { ...this.pointsLedger, [keyOf(customerId)]: ledger }
    return ledger
  },

  async refreshGrowthLedger(customerId: BackendId, limit = 20) {
    const ledger = (await backendApi.listMemberGrowthLedger(customerId, limit)).map(mapMemberGrowthLedger)
    this.growthLedger = { ...this.growthLedger, [keyOf(customerId)]: ledger }
    return ledger
  },

  async refreshBalanceLedger(customerId: BackendId, limit = 20) {
    const ledger = (await backendApi.listMemberBalanceLedger(customerId, limit)).map(mapMemberBalanceLedger)
    this.balanceLedger = { ...this.balanceLedger, [keyOf(customerId)]: ledger }
    return ledger
  },
})
