export type ProductModuleScaffoldKey =
  | 'catalog'
  | 'sku'
  | 'category'
  | 'relation'
  | 'booking-rules'
  | 'channel'
  | 'cards'

export type ProductModuleScaffold = {
  key: ProductModuleScaffoldKey
  title: string
  subtitle: string
  apiPath: string
  owner: string
  readiness: string
  chips: string[]
}

export const productModuleScaffolds: Record<ProductModuleScaffoldKey, ProductModuleScaffold> = {
  catalog: {
    key: 'catalog',
    title: '商品目录',
    subtitle: '聚合 yy_product 与 SKU、展示、预约、关联、渠道、履约规则。',
    apiPath: '/yy/productCatalog/{productId}',
    owner: 'features/products/catalog',
    readiness: '脚手架补齐/待真实验收',
    chips: ['yy_product 主账本', '聚合 DTO', 'readiness'],
  },
  sku: {
    key: 'sku',
    title: '规格价格',
    subtitle: '维护规格、原价、现价、工位消耗和线上展示状态。',
    apiPath: '/yy/productSku',
    owner: 'features/products/sku',
    readiness: '脚手架补齐/待真实验收',
    chips: ['SKU CRUD', '价格配置', '线上展示'],
  },
  category: {
    key: 'category',
    title: '分类运营',
    subtitle: '承载商品分类、排序、门店范围和启停状态。',
    apiPath: '/yy/productCategory',
    owner: 'features/products/category',
    readiness: '分类与批量运营骨架补齐/批量写入待验收',
    chips: ['分类', '排序', '门店范围'],
  },
  relation: {
    key: 'relation',
    title: '关联产品',
    subtitle: '配置加购、入册、加修、冲印联动关系。',
    apiPath: '/yy/productRelation',
    owner: 'features/products/relation',
    readiness: '脚手架补齐/待真实验收',
    chips: ['加购', '入册', '冲印联动'],
  },
  'booking-rules': {
    key: 'booking-rules',
    title: '预约规则',
    subtitle: '配置可预约门店、服务组、预付模式、预计耗时和限制。',
    apiPath: '/yy/productBookingRule',
    owner: 'features/products/booking-rules',
    readiness: '脚手架补齐/待真实验收',
    chips: ['服务组', '预付模式', '绑定状态'],
  },
  channel: {
    key: 'channel',
    title: '渠道商品',
    subtitle: '承载抖音/美团商品映射补充配置，不调用真实平台写接口。',
    apiPath: '/yy/productChannelConfig',
    owner: 'features/products/channel',
    readiness: '渠道插件配置骨架已补齐/真实授权待验收',
    chips: ['抖音', '美团', '映射状态'],
  },
  cards: {
    key: 'cards',
    title: '卡项产品',
    subtitle: '保留卡券/权益适用状态骨架，不改变权益高风险状态机。',
    apiPath: '/yy/productCatalog/{productId}/benefit-binding',
    owner: 'features/products/cards',
    readiness: '脚手架补齐/待真实验收',
    chips: ['计次卡', '储值卡', '权益 readiness'],
  },
}
