import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedMarketingModuleView.vue?raw'

describe('derived marketing module pages contract', () => {
  const featureKeys = ['marketing-center', 'marketing-coupons', 'marketing-campaigns', 'marketing-participations']

  it('replaces marketing placeholders with one real derived marketing route', () => {
    expect(routerSource).toContain('DerivedMarketingModuleView.vue')
    for (const key of featureKeys) {
      expect(getWorkbenchFeature(key)?.component).toBe('derived-marketing-module')
      expect(getWorkbenchFeature(key)?.status).toBe('ready')
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:order:list')
    }
  })

  it('uses unified orders and customers without fabricating campaign or coupon ledgers', () => {
    expect(viewSource).toContain('buildDerivedMarketingItems')
    expect(viewSource).toContain('appStore.orders')
    expect(viewSource).toContain('appStore.customers')
    expect(viewSource).toContain('yy_order')
    expect(viewSource).toContain('空态仍显示边界')
    expect(viewSource).not.toContain('createCouponTemplate')
    expect(viewSource).not.toContain('redeemCoupon')
    expect(viewSource).not.toContain('saveMarketingCampaign')
  })

  it('shows all marketing module labels', () => {
    expect(viewSource).toContain('营销中心')
    expect(viewSource).toContain('优惠券')
    expect(viewSource).toContain('活动清单')
    expect(viewSource).toContain('活动参与记录')
  })

  it('uses the shared console visual primitives and semantic status colors', () => {
    expect(viewSource).toContain('yy-glass-panel yy-console-hero')
    expect(viewSource).toContain('yy-console-card')
    expect(viewSource).toContain('yy-console-table')
    expect(viewSource).toContain('var(--color-status-done-bg)')
    expect(viewSource).toContain('var(--color-status-danger-bg)')
    expect(viewSource).not.toContain('bg-[#EBF4ED]')
    expect(viewSource).not.toContain('bg-[#B8543B]/10')
  })
})
