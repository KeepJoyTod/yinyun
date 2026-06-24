import { describe, expect, it } from 'vitest'
import type { ChannelProductMappingInfo } from '../../shared/stores/appStoreTypes'
import { checkDouyinProductReadiness, formatDouyinMissingList } from './douyinProductReadiness'

const makeMapping = (overrides: Partial<ChannelProductMappingInfo> = {}): ChannelProductMappingInfo => ({
  backendId: 'map-001',
  productBackendId: 'prod-001',
  storeName: '影约云深圳旗舰店',
  productName: '证件照精修套餐',
  channelType: 'DOUYIN_LIFE',
  externalProductId: '1867049893048363',
  externalSkuId: '1867049646914595',
  externalPoiId: '7647419894213445642',
  landingUrl: 'https://www.douyin.com/life/goods/1867049893048363',
  landingPath: 'aweme://life_goods_detail',
  externalName: '证件照快拍精修',
  mappingStatus: 'ENABLED',
  remark: '用于真实来客商品页下单',
  ready: true,
  ...overrides,
})

describe('douyin product readiness checks', () => {
  it('marks a fully configured mapping as ready', () => {
    const mapping = makeMapping({ ready: true })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(true)
    expect(result.missingFields).toEqual([])
    expect(result.fields.every(f => !f.missing)).toBe(true)
  })

  it('detects missing externalProductId', () => {
    const mapping = makeMapping({ externalProductId: '', ready: false })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toContain('商品 ID')
    expect(result.fields[0].missing).toBe(true)
  })

  it('detects missing externalSkuId', () => {
    const mapping = makeMapping({ externalSkuId: '', ready: false })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toContain('SKU ID')
  })

  it('detects missing externalPoiId', () => {
    const mapping = makeMapping({ externalPoiId: '', ready: false })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toContain('POI')
  })

  it('detects missing landing page (both url and path)', () => {
    const mapping = makeMapping({ landingUrl: '', landingPath: '', ready: false })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toContain('落地页')
  })

  it('detects inactive mapping status', () => {
    const mapping = makeMapping({ mappingStatus: 'DRAFT', ready: false })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toContain('映射状态')
  })

  it('considers landingPath as valid when landingUrl is empty', () => {
    const mapping = makeMapping({ landingUrl: '', landingPath: 'aweme://life_goods_detail', ready: true })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(true)
    expect(result.missingFields).not.toContain('落地页')
  })

  it('lists all missing fields when multiple are absent', () => {
    const mapping = makeMapping({
      externalProductId: '',
      externalSkuId: '',
      externalPoiId: '',
      landingUrl: '',
      landingPath: '',
      mappingStatus: 'DRAFT',
      ready: false,
    })
    const result = checkDouyinProductReadiness(mapping)
    expect(result.ready).toBe(false)
    expect(result.missingFields).toHaveLength(5)
  })
})

describe('formatDouyinMissingList', () => {
  it('includes product name, store, mappingId and missing fields', () => {
    const mapping = makeMapping({
      externalProductId: '',
      externalPoiId: '',
      ready: false,
    })
    const formatted = formatDouyinMissingList(mapping)
    expect(formatted).toContain('证件照精修套餐')
    expect(formatted).toContain('影约云深圳旗舰店')
    expect(formatted).toContain('map-001')
    expect(formatted).toContain('productId：prod-001')
    expect(formatted).toContain('缺商品 ID')
    expect(formatted).toContain('缺POI')
  })

  it('does not use remark as productId in the copy text', () => {
    const mapping = makeMapping({
      productBackendId: '',
      remark: '这是一段运营备注',
    })
    const formatted = formatDouyinMissingList(mapping)
    expect(formatted).toContain('productId：-')
    expect(formatted).not.toContain('productId：这是一段运营备注')
  })

  it('shows "可投放" when no fields are missing', () => {
    const mapping = makeMapping({ ready: true })
    const formatted = formatDouyinMissingList(mapping)
    expect(formatted).toContain('可投放')
    expect(formatted).not.toContain('缺商品 ID')
    expect(formatted).not.toContain('缺SKU ID')
    expect(formatted).not.toContain('缺POI')
    expect(formatted).not.toContain('缺落地页')
  })

  it('includes suggested fix locations', () => {
    const mapping = makeMapping({ ready: false })
    const formatted = formatDouyinMissingList(mapping)
    expect(formatted).toContain('系统后台渠道商品映射')
    expect(formatted).toContain('抖音来客商品后台')
  })
})
