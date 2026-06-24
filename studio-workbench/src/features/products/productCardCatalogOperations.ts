import type { ProductConfig } from '../../shared/stores/appStore'
import type { DerivedProductItem, DerivedProductModule } from './derivedProductModules'

export type CatalogFilter = 'all' | 'active' | 'inactive' | 'incomplete'

export type ModalSubmitPayload = {
  values: {
    id: string
    bizCategory: string
    name: string
    nickname: string
    image: string
    listImage: string
    halfImage: string
    channels: string[]
    categoryName: string
    allowOnlineBooking: boolean
    showInApp: boolean
    allowStoreOrder: boolean
    selfPayMode: 'PAY' | 'NO_PAY'
    fullSlotMode: 'ALLOW' | 'BLOCK'
    durationLabel: string
    supportSelection: boolean
    giftAlbum: boolean
    originalPriceLabel: string
    currentPriceLabel: string
    priceLabelText: string
    hasSpecs: boolean
    consumeCredit: number
    ladderPricingText: string
    depositMode: 'BRAND' | 'PRODUCT'
    depositAmount: string
    intro: string
    detailButtonMode: 'BOOK_NOW' | 'CUSTOM' | 'HIDE' | 'PAY_NOW' | 'BOTH'
    detailButtonText: string
    detailModules: string[]
    publishMode: 'DRAFT' | 'PUBLISHED'
    spec: string
    price: string
    unitPrice: string
    includedCount: number
    desc: string
    storeNames: string[]
  }
  imageFiles: {
    image: File | null
    listImage: File | null
    halfImage: File | null
  }
}

export const bizCategoryLabels: Record<string, string> = {
  SERVICE: '服务产品',
  ADDON: '附加产品',
  GROUP: '团单产品',
  GROUP_BUY: '团单产品',
  PRINT: '冲印产品',
  ALBUM: '入册产品',
  CARD: '卡项产品',
}

export const defaultBizCategoryForModule = (moduleKey: string) => {
  if (moduleKey === 'product-group') return 'GROUP_BUY'
  if (moduleKey === 'product-print') return 'PRINT'
  if (moduleKey === 'product-album') return 'ALBUM'
  return 'ADDON'
}

export const normalizeStoreFilter = (preferred: string, concreteStoreOptions: string[]) => {
  if (preferred && concreteStoreOptions.includes(preferred)) return preferred
  return concreteStoreOptions[0] ?? ''
}

export const filterCatalogItems = (
  items: DerivedProductItem[],
  filters: {
    storeFilter: string
    statusFilter: CatalogFilter
    nicknameQuery: string
    nameQuery: string
  },
) => {
  const nick = filters.nicknameQuery.trim().toLowerCase()
  const name = filters.nameQuery.trim().toLowerCase()
  return items.filter(item => {
    const product = item.product
    if (!product) return false
    if (filters.statusFilter === 'active' && !product.active) return false
    if (filters.statusFilter === 'inactive' && product.active) return false
    if (filters.statusFilter === 'incomplete' && item.stage !== '待补规则') return false
    if (!filters.storeFilter || item.storeName !== filters.storeFilter) return false
    if (nick && !`${product.nickname || ''}`.toLowerCase().includes(nick)) return false
    if (name) {
      const haystack = `${product.name} ${product.id} ${product.spec} ${product.desc}`.toLowerCase()
      if (!haystack.includes(name)) return false
    }
    return true
  })
}

export const buildCatalogSummaryCards = (moduleTitle: string, scopedItems: DerivedProductItem[]) => {
  const active = scopedItems.filter(item => item.product?.active).length
  const inactive = scopedItems.filter(item => !item.product?.active).length
  const incomplete = scopedItems.filter(item => item.stage === '待补规则').length
  return [
    { label: moduleTitle, value: String(scopedItems.length), hint: '当前门店分类下已归集的商品数量。', scope: '商品' },
    { label: '已发布', value: String(active), hint: '当前可以继续对外承接销售的商品。', scope: '可售' },
    { label: '待补规则', value: String(incomplete), hint: '仍需补齐价格、规则或说明的商品。', scope: '规则' },
    { label: '未发布', value: String(inactive), hint: '当前已下架或暂停发布的商品。', scope: '下架' },
  ]
}

export const bizCategoryLabel = (item: DerivedProductItem) =>
  bizCategoryLabels[String(item.product?.bizCategory ?? 'SERVICE').toUpperCase()] ?? '服务产品'

export const metricValue = (module: DerivedProductModule, item: DerivedProductItem) =>
  module.metricValueForProduct?.(item.product!) ?? item.priceLabel

export const quantityValue = (module: DerivedProductModule, item: DerivedProductItem) =>
  module.quantityValueForProduct?.(item.product!) ?? `${item.product?.includedCount ?? 0}`

export const storeLabel = (item: DerivedProductItem) => item.storeName || '未绑定门店'

export const statusBadgeClass = (item: DerivedProductItem) =>
  item.product?.active
    ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
    : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'

export const buildDefaultProductCardConfig = (
  module: DerivedProductModule,
  defaultBizCategory: string,
): ProductConfig => {
  const isAlbumProduct = defaultBizCategory === 'ALBUM'
  return {
    id: '',
    bizCategory: defaultBizCategory,
    name: '',
    nickname: '',
    image: '',
    listImage: '',
    halfImage: '',
    channels: ['WECHAT'],
    categoryName: module.title,
    allowOnlineBooking: true,
    showInApp: true,
    allowStoreOrder: true,
    selfPayMode: 'PAY',
    fullSlotMode: 'ALLOW',
    durationLabel: '',
    supportSelection: isAlbumProduct,
    giftAlbum: isAlbumProduct,
    originalPriceLabel: '原价',
    currentPriceLabel: '现价',
    priceLabelText: '',
    hasSpecs: false,
    consumeCredit: 0,
    ladderPricingText: '',
    depositMode: 'BRAND',
    depositAmount: '',
    intro: '',
    detailButtonMode: 'BOOK_NOW',
    detailButtonText: '立即预约',
    detailModules: [],
    publishMode: 'PUBLISHED',
    spec: isAlbumProduct ? '轻奢相册' : defaultBizCategory,
    price: '',
    unitPrice: '',
    includedCount: isAlbumProduct ? 12 : 1,
    active: true,
    desc: '',
    storeNames: [],
    publishStatus: 'PUBLISHED',
    mutuallyExclusiveRule: '',
    linkedProductIds: [],
    linkedProductNames: [],
    shelfConfig: isAlbumProduct ? '预约页、选片加购区、门店工作台' : '',
    orderLimitRule: '',
  }
}
