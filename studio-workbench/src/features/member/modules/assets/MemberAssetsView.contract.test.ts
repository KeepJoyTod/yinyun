import { describe, expect, it } from 'vitest'
import routerSource from '../../../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../../../app/router/featureRegistry'
import viewSource from './MemberAssetsView.vue?raw'
import composableSource from './useMemberAssetOverview.ts?raw'
import rechargeComposableSource from './useMemberRecharge.ts?raw'
import memberStoreSource from '../../../../shared/stores/memberStore.ts?raw'
import memberRechargeStoreSource from '../../../../shared/stores/memberRechargeStore.ts?raw'

const assetsContractSource = `${viewSource}\n${composableSource}\n${rechargeComposableSource}\n${memberStoreSource}\n${memberRechargeStoreSource}`

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
  })

  it('exposes a dedicated manual recharge entry and write owner', () => {
    expect(viewSource).toContain('MemberRechargeModal')
    expect(viewSource).toContain('@click="openRecharge"')
    expect(rechargeComposableSource).toContain('memberRechargeStore.submitManualRecharge')
    expect(rechargeComposableSource).toContain('memberStore.refreshBalanceLedger')
  })

  it('renders summary cards and three asset sections instead of the old derived placeholder', () => {
    expect(viewSource).toContain('summaryCards')
    expect(viewSource).toContain('会员卡')
    expect(viewSource).toContain('权益')
    expect(viewSource).toContain('优惠券')
    expect(viewSource).not.toContain('buildDerivedMemberItems')
  })
})
