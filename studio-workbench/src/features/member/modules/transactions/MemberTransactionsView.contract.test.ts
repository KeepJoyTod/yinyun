import { describe, expect, it } from 'vitest'
import routerSource from '../../../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../../../app/router/featureRegistry'
import viewSource from './MemberTransactionsView.vue?raw'
import composableSource from './useMemberTransactions.ts?raw'
import memberStoreSource from '../../../../shared/stores/memberStore.ts?raw'

const transactionsContractSource = `${viewSource}\n${composableSource}\n${memberStoreSource}`

describe('member transactions view contract', () => {
  it('mounts a dedicated member transactions owner route', () => {
    expect(routerSource).toContain('MemberTransactionsView.vue')
    expect(getWorkbenchFeature('member-consumption')?.component).toBe('member-transactions')
    expect(getWorkbenchFeature('member-consumption')?.status).toBe('ready')
    expect(getWorkbenchFeature('member-consumption')?.permission).toBe('yy:customer:list')
  })

  it('keeps order and value ledgers on independent owner tabs', () => {
    expect(viewSource).toContain("activeTab === 'orders'")
    expect(viewSource).toContain("activeTab === 'points'")
    expect(viewSource).toContain("activeTab === 'growth'")
    expect(viewSource).toContain("activeTab === 'balance'")
    expect(transactionsContractSource).toContain('loadCustomerRecentOrders')
  })

  it('loads points, growth and balance ledgers through the member store', () => {
    expect(transactionsContractSource).toContain('memberStore.refreshPointsLedger')
    expect(transactionsContractSource).toContain('memberStore.refreshGrowthLedger')
    expect(transactionsContractSource).toContain('memberStore.refreshBalanceLedger')
    expect(transactionsContractSource).toContain('appStore.loadCustomerRecentOrders')
    expect(viewSource).not.toContain('buildDerivedMemberItems')
  })
})
