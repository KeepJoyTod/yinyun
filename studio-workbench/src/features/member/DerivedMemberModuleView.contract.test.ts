import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedMemberModuleView.vue?raw'

describe('derived member module pages contract', () => {
  const featureKeys = ['member-accounts', 'member-tags', 'member-consumption']

  it('replaces member placeholders with one real derived member route', () => {
    expect(routerSource).toContain('DerivedMemberModuleView.vue')
    for (const key of featureKeys) {
      expect(getWorkbenchFeature(key)?.component).toBe('derived-member-module')
      expect(getWorkbenchFeature(key)?.status).toBe('ready')
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:customer:list')
    }
  })

  it('uses unified customer and order data without creating staff-side ledgers', () => {
    expect(viewSource).toContain('buildDerivedMemberItems')
    expect(viewSource).toContain('appStore.customers')
    expect(viewSource).toContain('appStore.reportOrders')
    expect(viewSource).toContain('onMounted(loadModuleData)')
    expect(viewSource).toContain('appStore.ensureCustomersLoaded')
    expect(viewSource).toContain('appStore.loadReportOrders')
    expect(viewSource).toContain('yy_customer')
    expect(viewSource).toContain('yy_order')
    expect(viewSource).toContain('空态仍显示边界')
    expect(viewSource).not.toContain('saveMemberAccount')
    expect(viewSource).not.toContain('createCoupon')
    expect(viewSource).not.toContain('saveCustomerTag')
  })

  it('shows all member module labels', () => {
    expect(viewSource).toContain('会员账户')
    expect(viewSource).toContain('客户标签')
    expect(viewSource).toContain('消费记录')
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
