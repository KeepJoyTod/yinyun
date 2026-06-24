import { reactive } from 'vue'
import { backendApi, type MemberRechargeCreatePayload, type MemberRechargeOrderDto } from '../api/backend'
import type { BackendId } from '../api/backendId'

const keyOf = (customerId: BackendId) => String(customerId)

export const memberRechargeStore = reactive({
  submittingByCustomer: {} as Record<string, boolean>,
  errorByCustomer: {} as Record<string, string>,
  lastRechargeByCustomer: {} as Record<string, MemberRechargeOrderDto | null>,

  reset() {
    this.submittingByCustomer = {}
    this.errorByCustomer = {}
    this.lastRechargeByCustomer = {}
  },

  isSubmitting(customerId: BackendId) {
    return Boolean(this.submittingByCustomer[keyOf(customerId)])
  },

  async submitManualRecharge(customerId: BackendId, payload: MemberRechargeCreatePayload) {
    const key = keyOf(customerId)
    this.submittingByCustomer = { ...this.submittingByCustomer, [key]: true }
    this.errorByCustomer = { ...this.errorByCustomer, [key]: '' }
    try {
      const created = await backendApi.createMemberRechargeOrder(customerId, payload)
      const confirmed = await backendApi.confirmMemberRechargeOrder(created.id)
      this.lastRechargeByCustomer = { ...this.lastRechargeByCustomer, [key]: confirmed }
      return confirmed
    } catch (error) {
      const message = error instanceof Error ? error.message : '会员充值失败'
      this.errorByCustomer = { ...this.errorByCustomer, [key]: message }
      throw error
    } finally {
      this.submittingByCustomer = { ...this.submittingByCustomer, [key]: false }
    }
  },
})
