import { describe, expect, it } from 'vitest'
import productConfigSource from './ProductConfigView.vue?raw'
import selectionConfigSource from './components/SelectionConfigModal.vue?raw'

describe('product config page contract', () => {
  it('shows a product operations board before the product list', () => {
    expect(productConfigSource).toContain('product-ops-board')
    expect(productConfigSource).toContain('产品配置承接')
    expect(productConfigSource).toContain('在售产品')
    expect(productConfigSource).toContain('待补规则')
    expect(productConfigSource).toContain('本月加片营收')
    expect(productConfigSource).toContain('平均加片张数')
    for (const scope of ["scope: '在售'", "scope: '规则'", "scope: '加片'", "scope: '均值'"]) {
      expect(productConfigSource).toContain(scope)
    }
    for (const token of ["scope: 'SALE'", "scope: 'RULE'", "scope: 'EXTRA'", "scope: 'AVG'"]) {
      expect(productConfigSource).not.toContain(token)
    }
  })

  it('offers quick product filters for store staff', () => {
    expect(productConfigSource).toContain('quickProductFilters')
    expect(productConfigSource).toContain('全部产品')
    expect(productConfigSource).toContain('已下架')
    expect(productConfigSource).toContain('待补规则')
    expect(productConfigSource).toContain('activeProductFilter')
  })

  it('derives product operations from existing products and selection stats', () => {
    expect(productConfigSource).toContain('appStore.products')
    expect(productConfigSource).toContain('appStore.selectionStats')
    expect(productConfigSource).toContain('product.includedCount <= 0')
    expect(productConfigSource).toContain('monthExtraRevenueCents')
    expect(productConfigSource).toContain('averageExtraCount')
  })

  it('uses truthful product modal copy instead of implying instant selection sync', () => {
    expect(selectionConfigSource).toContain('产品配置')
    expect(selectionConfigSource).toContain('保存后用于预约、选片加购和商品展示')
    expect(selectionConfigSource).not.toContain('Product Config')
    expect(selectionConfigSource).not.toContain('即时同步至选片系统')
  })
})
