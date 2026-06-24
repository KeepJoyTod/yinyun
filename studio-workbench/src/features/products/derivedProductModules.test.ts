import { describe, expect, it } from 'vitest'
import type { ChannelProductMappingInfo, ProductConfig } from '../../shared/stores/appStore'
import { buildDerivedProductItems, getDerivedProductModule } from './derivedProductModules'

const product = (input: Partial<ProductConfig> = {}): ProductConfig => ({
  backendId: '101',
  id: 'YY_PHOTO_IDCARD_001',
  name: '证件照精修套餐',
  image: '/demo.jpg',
  spec: '证件照',
  price: '129',
  unitPrice: '39',
  includedCount: 6,
  active: true,
  desc: '含拍摄、精修、电子底片交付',
  storeNames: ['滨州万达店'],
  ...input,
})

const mapping = (input: Partial<ChannelProductMappingInfo> = {}): ChannelProductMappingInfo => ({
  backendId: 'm1',
  storeName: '影约云深圳旗舰店',
  productName: '证件照精修套餐',
  channelType: 'MEITUAN',
  externalProductId: 'mt-product-1',
  externalSkuId: 'mt-sku-1',
  externalPoiId: 'mt-poi-1',
  landingUrl: 'https://m.dianping.com/demo',
  landingPath: '',
  externalName: '美团 · 证件照快拍',
  mappingStatus: 'ENABLED',
  remark: '美团团购入口',
  ready: true,
  ...input,
})

describe('derived product modules', () => {
  it('derives add-on products from service product selection rules without a second product ledger', () => {
    const module = getDerivedProductModule('product-addon')
    const items = buildDerivedProductItems(module, [
      product({ name: '个人形象照套餐', unitPrice: '89', includedCount: 12 }),
      product({ id: 'missing-rule', name: '待补规则套餐', unitPrice: '0', includedCount: 0 }),
    ], [])

    expect(items).toHaveLength(2)
    expect(items[0].title).toContain('加片')
    expect(items[0].stage).toBe('可售')
    expect(items[1].stage).toBe('待补规则')
    expect(items[0].boundary).toContain('yy_product')
  })

  it('expands product-derived items by concrete store names instead of one all-store row', () => {
    const module = getDerivedProductModule('product-addon')
    const items = buildDerivedProductItems(module, [
      product({
        id: 'multi-store-product',
        name: '多门店形象照套餐',
        storeNames: ['滨州万达店', '滨州吾悦店'],
      }),
      product({
        id: 'missing-store-product',
        name: '未绑定门店套餐',
        storeNames: [],
      }),
    ], [])

    expect(items.map(item => item.id)).toEqual([
      'product-addon:multi-store-product:滨州万达店',
      'product-addon:multi-store-product:滨州吾悦店',
    ])
    expect(items.map(item => item.storeName)).toEqual(['滨州万达店', '滨州吾悦店'])
    expect(items).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ storeName: '全部门店' }),
    ]))
  })

  it('classifies group and print products by business category first, then falls back to keywords', () => {
    const groupModule = getDerivedProductModule('product-group')
    const printModule = getDerivedProductModule('product-print')
    const products = [
      product({ id: 'group', bizCategory: 'GROUP_BUY', name: '企业团体形象照', spec: '商务写真', desc: '适合多人公司拍摄' }),
      product({ id: 'print', bizCategory: 'PRINT', name: '证照打印加洗', spec: '标准冲印', desc: '相纸打印与到店交付' }),
      product({ id: 'portrait', name: '个人形象照套餐', spec: '形象照', desc: '职业头像' }),
    ]

    expect(buildDerivedProductItems(groupModule, products, []).map(item => item.product!.id)).toEqual(['group'])
    expect(buildDerivedProductItems(printModule, products, []).map(item => item.product!.id)).toEqual(['print'])
  })

  it('classifies album products from the unified product ledger', () => {
    const module = getDerivedProductModule('product-album')
    const items = buildDerivedProductItems(module, [
      product({
        id: 'album',
        bizCategory: 'ALBUM',
        name: '亲子入册 12 张',
        nickname: '轻奢相册',
        spec: 'ALBUM',
        includedCount: 12,
        price: '699',
        desc: '含精修入册与相册排版',
      }),
      product({
        id: 'portrait',
        bizCategory: 'SERVICE',
        name: '个人形象照套餐',
        spec: 'SERVICE',
        desc: '职业头像',
      }),
    ], [])

    expect(items.map(item => item.product!.id)).toEqual(['album'])
    expect(items[0].title).toBe('轻奢相册')
    expect(items[0].stage).toBe('可售')
  })

  it('keeps Meituan products as channel mappings and never fabricates readiness', () => {
    const module = getDerivedProductModule('product-meituan')
    const items = buildDerivedProductItems(module, [], [
      mapping({ backendId: 'ready', ready: true }),
      mapping({ backendId: 'missing', externalSkuId: '', ready: false, mappingStatus: 'DRAFT' }),
      mapping({ backendId: 'douyin', channelType: 'DOUYIN_LIFE' }),
    ])

    expect(items.map(item => item.mapping?.backendId)).toEqual(['ready', 'missing'])
    expect(items[0].stage).toBe('可投放')
    expect(items[1].stage).toBe('待补齐')
    expect(items[1].boundary).toContain('/yy/channelProductMapping/list')
  })
})
