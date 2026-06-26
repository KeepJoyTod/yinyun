import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedProductModuleView.vue?raw'

describe('derived product module pages contract', () => {
  it('replaces the remaining product placeholders with one real derived product module route', () => {
    expect(routerSource).toContain('DerivedProductModuleView.vue')
    for (const key of ['product-addon', 'product-group', 'product-print']) {
      expect(getWorkbenchFeature(key)?.component).toBe('derived-product-module')
      expect(getWorkbenchFeature(key)?.status).toBe('building')
    }
    expect(getWorkbenchFeature('product-meituan')?.component).toBe('derived-product-module')
    expect(getWorkbenchFeature('product-meituan')?.status).toBe('derived')
    expect(getWorkbenchFeature('product-addon')?.permission).toBe('yy:product:list')
    expect(getWorkbenchFeature('product-group')?.permission).toBe('yy:product:list')
    expect(getWorkbenchFeature('product-print')?.permission).toBe('yy:product:list')
    expect(getWorkbenchFeature('product-meituan')?.permission).toBe('yy:channel:list')
  })

  it('uses unified product and channel mapping data without creating staff-side products', () => {
    expect(viewSource).toContain('buildDerivedProductItems')
    expect(viewSource).toContain('appStore.products')
    expect(viewSource).toContain('appStore.channelProductMappings')
    expect(viewSource).toContain('统一产品表 yy_product')
    expect(viewSource).toContain('/yy/channelProductMapping/list')
    expect(viewSource).toContain('空态仍显示边界')
    expect(viewSource).not.toContain('addProduct')
    expect(viewSource).not.toContain('saveChannelProductMapping')
  })

  it('shows all four product module labels', () => {
    expect(viewSource).toContain('附加产品')
    expect(viewSource).toContain('团单产品')
    expect(viewSource).toContain('冲印产品')
    expect(viewSource).toContain('美团产品')
  })

  it('scopes derived product modules to one concrete store instead of all-store browsing', () => {
    expect(viewSource).toContain('concreteStoreOptions')
    expect(viewSource).toContain('normalizeStoreFilter')
    expect(viewSource).toContain('storeFilter.value = normalizeStoreFilter()')
    expect(viewSource).not.toContain('<option value="all">全部门店</option>')
    expect(viewSource).not.toContain("storeFilter.value !== 'all'")
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

  it('uses Chinese visible labels in detail and operation cards', () => {
    for (const label of ['产品详情', '规则', '下一步', '渠道入口', "'渠道'", "'产品'", "'可用'", "'处理'", "'边界'"]) {
      expect(viewSource).toContain(label)
    }
    for (const label of ['Product Detail', '>Rule<', 'Next Action', 'Channel Entry', "'CHANNEL'", "'READY'", "'ACTION'", "'BOUNDARY'"]) {
      expect(viewSource).not.toContain(label)
    }
  })
})
