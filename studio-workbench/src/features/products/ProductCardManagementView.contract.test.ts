import { describe, expect, it } from 'vitest'
import managementSource from './ProductCardManagementView.vue?raw'

describe('product card management contract', () => {
  it('renders the card product management interface', () => {
    expect(managementSource).toContain('卡项产品')
    expect(managementSource).toContain('添加次卡')
    expect(managementSource).toContain('添加储值卡')
    expect(managementSource).toContain('卡项名称')
    expect(managementSource).not.toContain('Card Products')
  })

  it('filters card products from the appStore by bizCategory CARD', () => {
    expect(managementSource).toContain("bizCategory ?? '').trim().toUpperCase() === 'CARD'")
    expect(managementSource).toContain('bizCategory !== ')
  })

  it('classifies card types into times, shared, and stored', () => {
    expect(managementSource).toContain('cardMode')
    expect(managementSource).toContain('STORED')
    expect(managementSource).toContain('SHARED')
    expect(managementSource).toContain('单项次卡')
    expect(managementSource).toContain('共享次卡')
    expect(managementSource).toContain('储值卡')
  })

  it('provides tab-based filtering with all, times, shared, stored', () => {
    expect(managementSource).toContain("'all'")
    expect(managementSource).toContain("'times'")
    expect(managementSource).toContain("'shared'")
    expect(managementSource).toContain("'stored'")
    expect(managementSource).toContain('全部卡项')
  })

  it('uses appStore for product persistence and state toggle', () => {
    expect(managementSource).toContain('appStore.updateProduct')
    expect(managementSource).toContain('appStore.toggleProductActive')
  })

  it('does not leave card product buttons as no-op controls', () => {
    expect(managementSource).toContain('@click="applySearchFilter"')
    expect(managementSource).toContain('const applySearchFilter')
    expect(managementSource).toContain('客户链接')
    expect(managementSource).toContain('抖音映射')
    expect(managementSource).toContain('cardActionDisabledReasons')
    expect(managementSource).toContain('客户公开卡产品链接暂未接入后端 API')
    expect(managementSource).toContain('前往抖音产品页查看 DOUYIN_LIFE')
    expect(managementSource).toContain(':title="cardActionDisabledReasons.publicLink"')
    expect(managementSource).toContain(':title="cardActionDisabledReasons.douyinMapping"')
    expect(managementSource).toContain('@click="showPublicLinkUnavailable"')
    expect(managementSource).toContain('@click="openDouyinMappingDiagnostics"')
    expect(managementSource).toContain("router.push({ path: '/product/douyin' })")
  })

  it('binds newly created card products to the current concrete workbench store', () => {
    expect(managementSource).toContain('currentConcreteStore')
    expect(managementSource).toContain('storeBackendId: currentConcreteStore.value?.backendId')
    expect(managementSource).toContain('storeNames: currentConcreteStore.value?.name')
    expect(managementSource).toContain('请先加载可用门店后再创建卡项')
  })
})
