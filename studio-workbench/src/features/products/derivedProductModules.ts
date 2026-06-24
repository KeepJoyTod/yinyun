import type { ChannelProductMappingInfo, ProductConfig } from '../../shared/stores/appStore'

export type DerivedProductFeatureKey =
  | 'product-addon'
  | 'product-group'
  | 'product-print'
  | 'product-album'
  | 'product-card-catalog'
  | 'product-meituan'
export type DerivedProductStage = '可售' | '待补规则' | '已下架' | '可投放' | '待补齐'

export type DerivedProductModule = {
  key: DerivedProductFeatureKey
  title: string
  eyebrow: string
  description: string
  addLabel?: string
  priceLabel?: string
  quantityLabel?: string
  emptyTitle: string
  emptyHint: string
  source: 'product' | 'channel'
  channelType?: string
  matchProduct?: (product: ProductConfig) => boolean
  titleForProduct?: (product: ProductConfig) => string
  subtitleForProduct?: (product: ProductConfig) => string
  metricValueForProduct?: (product: ProductConfig) => string
  quantityValueForProduct?: (product: ProductConfig) => string
  nextActionForProduct?: (product: ProductConfig) => string
}

export type DerivedProductItem = {
  id: string
  title: string
  subtitle: string
  module: DerivedProductModule
  product?: ProductConfig
  mapping?: ChannelProductMappingInfo
  stage: DerivedProductStage
  priceLabel: string
  ruleHint: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
  storeName: string
  sourceLabel: string
}

const includesAny = (value: string, keywords: string[]) => keywords.some(keyword => value.includes(keyword))

const productText = (product: ProductConfig) =>
  `${product.id} ${product.name} ${product.spec} ${product.desc}`.toLowerCase()

const normalizedBizCategory = (product: ProductConfig) => String(product.bizCategory ?? '').trim().toUpperCase()

const moneyNumber = (value: string) => Number(String(value).replace(/,/g, '')) || 0

const hasProductRuleIssue = (product: ProductConfig) =>
  moneyNumber(product.unitPrice) <= 0 || product.includedCount <= 0 || !product.desc.trim()

const productStage = (product: ProductConfig): DerivedProductStage => {
  if (!product.active) return '已下架'
  if (hasProductRuleIssue(product)) return '待补规则'
  return '可售'
}

const mappingStage = (mapping: ChannelProductMappingInfo): DerivedProductStage =>
  mapping.ready ? '可投放' : '待补齐'

const concreteStoreNames = (storeNames: Array<string | undefined>) =>
  Array.from(new Set(storeNames.map(store => String(store ?? '').trim()).filter(store => store && store !== '全部门店')))

const moduleConfigs: DerivedProductModule[] = [
  {
    key: 'product-addon',
    title: '附加产品',
    eyebrow: 'Addon Products',
    description: '从统一产品表 yy_product 的选片规则派生加片、加急和造型等附加产品视图，不建立第二套附加产品账本。',
    emptyTitle: '当前没有可派生附加产品',
    emptyHint: '服务产品配置加片单价、精修张数和说明后，会自动派生加片类附加产品。',
    source: 'product',
    matchProduct: () => true,
    titleForProduct: product => `${product.name} · 加片服务`,
    subtitleForProduct: product => `套餐含 ${product.includedCount} 张精修，超出后按 ¥${product.unitPrice || 0}/张 处理。`,
    nextActionForProduct: product => {
      if (!product.active) return '产品已下架，确认是否仍允许客户加片。'
      if (hasProductRuleIssue(product)) return '补齐精修张数、加片单价和产品说明后再对外承接。'
      return '可用于客户在线选片后的加片结算。'
    },
  },
  {
    key: 'product-group',
    title: '团单产品',
    eyebrow: 'Group Products',
    description: '从统一产品表 yy_product 派生企业、团体和多人拍摄产品视图，方便店员查看承接规则和后续订单来源。',
    emptyTitle: '当前没有企业或团体产品',
    emptyHint: '产品名称、规格或说明包含企业、团体、团单、多人、公司等关键词时，会自动归入这里。',
    source: 'product',
    matchProduct: product =>
      ['GROUP', 'GROUP_BUY'].includes(normalizedBizCategory(product))
      || includesAny(productText(product), ['企业', '团体', '团单', '多人', '公司']),
    titleForProduct: product => product.name,
    subtitleForProduct: product => `${product.spec || '未配置规格'} · ${product.desc || '暂无说明'}`,
    nextActionForProduct: product => (product.active ? '确认拍摄人数、批次和交付规则，订单仍进入统一订单页处理。' : '产品已下架，先在服务产品里确认是否恢复。'),
  },
  {
    key: 'product-print',
    title: '冲印产品',
    eyebrow: 'Print Products',
    description: '从统一产品表 yy_product 派生冲印、加洗、相纸、打印和证照交付产品视图，生产和交付仍回到统一订单处理。',
    emptyTitle: '当前没有冲印或打印产品',
    emptyHint: '产品名称、规格或说明包含冲印、加洗、打印、相纸、证照等关键词时，会自动归入这里。',
    source: 'product',
    matchProduct: product =>
      normalizedBizCategory(product) === 'PRINT'
      || includesAny(productText(product), ['冲印', '加洗', '打印', '相纸', '证照']),
    titleForProduct: product => product.name,
    subtitleForProduct: product => `${product.spec || '未配置规格'} · 套系价 ¥${product.price || 0}`,
    nextActionForProduct: product => (product.active ? '核对尺寸、相纸和交付要求，订单进入统一订单页跟进。' : '产品已下架，先确认是否仍需保留冲印入口。'),
  },
  {
    key: 'product-album',
    title: '入册产品',
    eyebrow: 'Album Products',
    description: '从统一产品表 yy_product 归集相册、入册、成册和精修入册类产品，沿用统一商品账本，不单独新建第二套入册产品台账。',
    addLabel: '新增入册产品',
    priceLabel: '入册金额',
    quantityLabel: '入册数量',
    emptyTitle: '当前没有入册产品',
    emptyHint: '当产品业务分类为 ALBUM，或商品名称/规格包含入册、相册、成册时，会自动归集到这里。',
    source: 'product',
    matchProduct: product =>
      normalizedBizCategory(product) === 'ALBUM'
      || includesAny(productText(product), ['入册', '相册', '成册']),
    titleForProduct: product => product.nickname || product.name,
    subtitleForProduct: product => product.intro || product.desc || '未配置入册说明',
    metricValueForProduct: product => `¥${product.price || 0}`,
    quantityValueForProduct: product => `${Number(product.includedCount) || 0} 张`,
    nextActionForProduct: product => (product.active ? '确认相册类型、入册张数和上架入口，订单仍进入统一订单链路。' : '产品已下架，先确认是否仍需保留入册入口。'),
  },
  {
    key: 'product-card-catalog',
    title: '商品卡目录',
    eyebrow: 'Card Product Catalog',
    description: '从统一产品表 yy_product 归集计次卡、储值卡和权益卡，售卖订单仍进入统一订单账本。',
    addLabel: '新增卡项',
    priceLabel: '卡项金额',
    quantityLabel: '权益数量',
    emptyTitle: '当前没有商品卡',
    emptyHint: '在商品卡管理中创建计次卡或储值卡后，会显示在这里。',
    source: 'product',
    matchProduct: product => String(product.bizCategory ?? '').toUpperCase() === 'CARD' || product.cardMode === 'TIMES' || product.cardMode === 'STORED',
    titleForProduct: product => product.nickname || product.name,
    subtitleForProduct: product => product.intro || product.desc || '未配置卡项说明',
    metricValueForProduct: product => product.cardMode === 'STORED'
      ? `¥${product.cardRechargeAmount || product.price || 0}`
      : `¥${product.cardSalePrice || product.price || 0}`,
    quantityValueForProduct: product => product.cardMode === 'STORED'
      ? `赠 ${product.cardGiftAmount || 0}`
      : `${(product.cardServiceItems ?? []).reduce((sum, item) => sum + (Number(item.count) || 0), 0)} 次`,
    nextActionForProduct: product => (product.active ? '确认权益范围、有效期和售卡入口，订单仍进入统一订单处理。' : '卡项已下架，先确认是否恢复售卖。'),
  },
  {
    key: 'product-meituan',
    title: '美团产品',
    eyebrow: 'Meituan Products',
    description: '查看美团商品、SKU、POI 与影约云本地产品的映射状态。真实支付和核销由美团渠道处理，同步后进入 yy_order。',
    emptyTitle: '当前没有美团产品映射',
    emptyHint: '美团渠道授权和商品映射完成后，/yy/channelProductMapping/list 的 MEITUAN 记录会显示在这里。',
    source: 'channel',
    channelType: 'MEITUAN',
  },
]

export const derivedProductModules = moduleConfigs

export const getDerivedProductModule = (key: string | undefined): DerivedProductModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

export const buildDerivedProductItems = (
  module: DerivedProductModule,
  products: ProductConfig[],
  mappings: ChannelProductMappingInfo[],
): DerivedProductItem[] => {
  if (module.source === 'channel') {
    return mappings
      .filter(mapping => !module.channelType || mapping.channelType === module.channelType)
      .flatMap(mapping => {
        const [storeName] = concreteStoreNames([mapping.storeName])
        if (!storeName) return []
        return [{
          id: `${module.key}:${mapping.backendId}:${storeName}`,
          title: mapping.externalName || mapping.productName || '未命名渠道商品',
          subtitle: `${mapping.productName || '未绑定本地产品'} · ${storeName}`,
          module,
          mapping,
          stage: mappingStage(mapping),
          priceLabel: mapping.externalSkuId ? `SKU ${mapping.externalSkuId}` : '缺 SKU',
          ruleHint: `商品 ${mapping.externalProductId || '缺失'} · POI ${mapping.externalPoiId || '缺失'} · ${mapping.mappingStatus || '未配置'}`,
          nextAction: mapping.ready ? '可复制入口给运营确认投放，支付后同步到统一订单。' : '先在系统后台补齐商品、SKU、POI、入口和授权状态。',
          actionLabel: '打开渠道配置',
          actionPath: '/settings/channels?channel=MEITUAN',
          boundary: '渠道商品只读取 /yy/channelProductMapping/list；真实订单仍同步到 yy_order，不在工作台新建第二套商品或订单账本。',
          storeName,
          sourceLabel: mapping.channelType,
        }]
      })
  }

  return products
    .filter(product => module.matchProduct?.(product) ?? true)
    .flatMap(product => {
      const storeNames = concreteStoreNames(product.storeNames ?? [])
      if (!storeNames.length) return []
      const stage = productStage(product)
      return storeNames.map(storeName => ({
        id: `${module.key}:${product.id}:${storeName}`,
        title: module.titleForProduct?.(product) ?? product.name,
        subtitle: module.subtitleForProduct?.(product) ?? product.desc,
        module,
        product,
        stage,
        priceLabel: `¥${product.price || 0}`,
        ruleHint: `含精修 ${product.includedCount} 张 · 加片 ¥${product.unitPrice || 0}/张 · ${product.active ? '上架' : '下架'}`,
        nextAction: module.nextActionForProduct?.(product) ?? '在服务产品中维护后，订单继续进入统一订单处理。',
        actionLabel: '打开服务产品',
        actionPath: `/product/service?q=${encodeURIComponent(product.id)}`,
        boundary: '统一产品表 yy_product 是当前页面唯一产品来源；门店工作台只做查看和处理建议，不新建客户预约。',
        storeName,
        sourceLabel: 'yy_product',
      }))
    })
}
