import { describe, expect, it } from 'vitest'
import actionsSource from './useMemberDetailActions.ts?raw'

describe('member detail actions contract', () => {
  it('keeps member detail actions on one reusable composable facade', () => {
    expect(actionsSource).toContain('goToEditCustomer')
    expect(actionsSource).toContain('goToBooking')
    expect(actionsSource).toContain('goToIssueCoupon')
    expect(actionsSource).toContain('goToTransactions')
    expect(actionsSource).toContain('goToCardBatch')
  })

  it('uses explicit query contracts across owners', () => {
    expect(actionsSource).toContain("customerId: String(customer.backendId)")
    expect(actionsSource).toContain("mode: 'edit'")
    expect(actionsSource).toContain("q: findCustomerKeyword(customer)")
    expect(actionsSource).toContain("quick: 'all'")
  })

  it('keeps delete action behind confirm and permission guard', () => {
    expect(actionsSource).toContain('yy:customer:remove')
    expect(actionsSource).toContain('globalThis.confirm')
    expect(actionsSource).toContain('appStore.deleteCustomer')
    expect(actionsSource).toContain('deleteCurrentCustomer')
  })
})
