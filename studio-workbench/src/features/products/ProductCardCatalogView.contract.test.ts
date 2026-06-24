import { describe, expect, it } from 'vitest'
import catalogSource from './ProductCardCatalogView.vue?raw'
import operationsSource from './productCardCatalogOperations.ts?raw'

const catalogContractSource = `${catalogSource}\n${operationsSource}`

describe('product card catalog contract', () => {
  it('renders the catalog overview with summary cards', () => {
    expect(catalogContractSource).toContain("scope: '商品'")
    expect(catalogContractSource).toContain("scope: '可售'")
    expect(catalogContractSource).toContain("scope: '规则'")
    expect(catalogContractSource).toContain("scope: '下架'")
    expect(catalogContractSource).toContain('已发布')
    expect(catalogContractSource).toContain('待补规则')
    expect(catalogContractSource).toContain('未发布')
    for (const token of ["scope: 'CATALOG'", "scope: 'ACTIVE'", "scope: 'RULE'", "scope: 'INACTIVE'"]) {
      expect(catalogContractSource).not.toContain(token)
    }
  })

  it('provides multi-dimension filtering by store, status, nickname and name', () => {
    expect(catalogSource).toContain('storeFilter')
    expect(catalogSource).toContain('statusFilter')
    expect(catalogSource).toContain('nicknameQuery')
    expect(catalogSource).toContain('nameQuery')
    expect(catalogSource).toContain('全部状态')
  })

  it('scopes card catalog store filters to concrete stores', () => {
    expect(catalogSource).toContain('concreteStoreOptions')
    expect(catalogSource).toContain('normalizeStoreFilter')
    expect(catalogSource).toContain('storeFilter.value = normalizeStoreFilter()')
    expect(catalogSource).toContain('scopedItems')
    expect(catalogContractSource).toContain('item.storeName !== filters.storeFilter')
    expect(catalogSource).not.toContain('<option value="all">全部门店</option>')
    expect(catalogContractSource).not.toContain("storeFilter.value !== 'all'")
    expect(catalogContractSource).not.toContain('(product.storeNames ?? []).includes(storeFilter.value)')
  })

  it('uses derived product module system for data and config', () => {
    expect(catalogSource).toContain('buildDerivedProductItems')
    expect(catalogSource).toContain('getDerivedProductModule')
    expect(catalogSource).toContain('DerivedProductItem')
  })

  it('keeps album and group-buy catalog categories aligned with module defaults', () => {
    expect(operationsSource).toContain("GROUP_BUY: '团单产品'")
    expect(operationsSource).toContain("ALBUM: '入册产品'")
    expect(operationsSource).toContain("if (moduleKey === 'product-group') return 'GROUP_BUY'")
    expect(operationsSource).toContain("if (moduleKey === 'product-album') return 'ALBUM'")
  })

  it('supports batch publish and individual toggle operations', () => {
    expect(catalogSource).toContain('batchPublishFiltered')
    expect(catalogSource).toContain('toggleActive')
    expect(catalogSource).toContain('appStore.toggleProductActive')
  })

  it('integrates ProductCardActionModal for shelf and publish actions', () => {
    expect(catalogSource).toContain('ProductCardActionModal')
    expect(catalogSource).toContain('handleActionSubmit')
    expect(catalogSource).toContain('openActionModal')
  })

  it('adds album-specific readiness and fulfillment configuration hooks', () => {
    expect(catalogSource).toContain('AlbumProductReadinessPanel')
    expect(catalogSource).toContain('AlbumProductFulfillmentModal')
    expect(catalogSource).toContain('buildAlbumProductReadiness')
    expect(catalogSource).toContain('collaborationStore.saveProductConfig')
  })
})
