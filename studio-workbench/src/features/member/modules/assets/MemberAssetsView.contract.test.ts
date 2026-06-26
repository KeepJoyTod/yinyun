import { describe, expect, it } from 'vitest'
import routerSource from '../../../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../../../app/router/featureRegistry'
import viewSource from './MemberAssetsView.vue?raw'
import composableSource from './useMemberAssetOverview.ts?raw'
import rechargeComposableSource from './useMemberRecharge.ts?raw'
import detailActionsSource from './useMemberDetailActions.ts?raw'

const assetsContractSource = `${viewSource}\n${composableSource}\n${rechargeComposableSource}\n${detailActionsSource}`

describe('member assets view contract', () => {
  it('mounts a dedicated member assets owner route', () => {
    expect(routerSource).toContain('MemberAssetsView.vue')
    expect(getWorkbenchFeature('member-accounts')?.component).toBe('member-assets')
    expect(getWorkbenchFeature('member-accounts')?.status).toBe('ready')
    expect(getWorkbenchFeature('member-accounts')?.permission).toBe('yy:customer:list')
  })

  it('loads customer archive and member asset ledgers through the member store', () => {
    expect(assetsContractSource).toContain('appStore.ensureCustomersLoaded')
    expect(assetsContractSource).toContain('memberStore.refreshOverview')
    expect(assetsContractSource).toContain('memberStore.refreshCards')
    expect(assetsContractSource).toContain('memberStore.refreshBenefits')
    expect(assetsContractSource).toContain('memberStore.refreshCoupons')
    expect(assetsContractSource).toContain('memberStore.refreshRechargeOrders')
  })

  it('exposes a dedicated manual recharge entry and write owner', () => {
    expect(viewSource).toContain('MemberRechargeModal')
    expect(viewSource).toContain('@click="openRecharge"')
    expect(rechargeComposableSource).toContain('memberRechargeStore.submitManualRecharge')
    expect(rechargeComposableSource).toContain('memberStore.refreshBalanceLedger')
    expect(rechargeComposableSource).toContain('approvalId')
    expect(viewSource).toContain('approval #')
  })

  it('exposes a member detail action bar with cross-owner contracts', () => {
    expect(viewSource).toContain('编辑会员')
    expect(viewSource).toContain('删除会员')
    expect(viewSource).toContain('预约')
    expect(viewSource).toContain('办卡')
    expect(viewSource).toContain('发券')
    expect(viewSource).toContain('查看交易明细')
    expect(detailActionsSource).toContain("path: '/member/customers'")
    expect(detailActionsSource).toContain("mode: 'edit'")
    expect(detailActionsSource).toContain("path: '/member/consumption'")
    expect(detailActionsSource).toContain("path: '/marketing/coupons'")
    expect(detailActionsSource).toContain("path: '/order/appointment'")
    expect(detailActionsSource).toContain("path: '/order/card-batch'")
  })

  it('guards detail actions by permission and supports customer deletion', () => {
    expect(detailActionsSource).toContain('yy:customer:edit')
    expect(detailActionsSource).toContain('yy:customer:remove')
    expect(detailActionsSource).toContain('yy:order:add')
    expect(detailActionsSource).toContain('yy:order:list')
    expect(detailActionsSource).toContain('globalThis.confirm')
    expect(detailActionsSource).toContain('appStore.deleteCustomer')
  })

  it('renders summary cards, recharge orders, and three asset sections instead of the old derived placeholder', () => {
    expect(viewSource).toContain('summaryCards')
    expect(viewSource).toContain('Recent Recharge Orders')
    expect(viewSource).toContain('selectedRechargeOrders')
    expect(viewSource).toContain('MemberConsumerAssetPreview')
    expect(viewSource).not.toContain('buildDerivedMemberItems')
  })

  it('supports selecting a customer from route query before loading ledgers', () => {
    expect(composableSource).toContain('route.query.customerId')
    expect(composableSource).toContain('matchedRouteCustomer')
  })
})
