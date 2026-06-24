import {
  getApiAssetUrl,
  type ProductDto,
  type ProductPayload,
} from '../api/backend'
import type { ProductConfig } from './appStoreTypes'
import { getProductFallbackImage, isWorkbenchFallbackImage } from './workbenchAssets'

const toMoney = (cents: number | null | undefined) => ((cents ?? 0) / 100).toLocaleString('zh-CN')

export const parseMoneyToCents = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return Math.round(value * 100)
  const normalized = String(value ?? '').replace(/,/g, '').trim()
  const amount = Number(normalized)
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

const inferCardFields = (dto: ProductDto) => {
  const spec = String(dto.spec ?? '').trim()
  const isStoredCard = spec.includes('储值卡')
  const isSharedTimesCard = spec.includes('共享次卡')
  const isTimesCard = spec.includes('次卡')
  if (!isStoredCard && !isTimesCard) return {}

  const price = toMoney(dto.priceCents)
  const unitPrice = toMoney(dto.unitPriceCents)
  return {
    bizCategory: 'CARD' as const,
    cardMode: isStoredCard ? 'STORED' as const : 'TIMES' as const,
    cardTimesType: isStoredCard ? undefined : isSharedTimesCard ? 'SHARED' as const : 'SINGLE' as const,
    cardSalePrice: isStoredCard ? '' : price,
    cardRechargeAmount: isStoredCard ? price : '',
    cardGiftAmount: isStoredCard ? unitPrice : '',
    cardProductScope: 'ALL' as const,
    cardServiceItems: [],
    cardGiftItems: [],
    cardValidityMode: 'FOREVER' as const,
    cardActivationMode: 'IMMEDIATE' as const,
    publishMode: dto.active ? 'PUBLISHED' as const : 'DRAFT' as const,
    publishStatus: dto.active ? 'PUBLISHED' as const : 'UNPUBLISHED' as const,
  }
}

const inferBizCategory = (dto: ProductDto) => {
  const spec = String(dto.spec ?? '').trim().toUpperCase()
  const rawProductType = String(dto.rawProductType ?? '').trim().toUpperCase()
  const description = String(dto.description ?? '').trim()
  if (rawProductType === 'CARD' || spec === 'CARD') return 'CARD'
  if (rawProductType === 'ALBUM' || spec === 'ALBUM' || /入册|相册|成册/.test(description)) return 'ALBUM'
  if (rawProductType === 'PRINT' || spec === 'PRINT' || /冲印|加洗|打印|相纸|证照/.test(description)) return 'PRINT'
  if (rawProductType === 'GROUP_BUY' || rawProductType === 'GROUP' || spec === 'GROUP_BUY' || spec === 'GROUP' || /企业|团体|团单|多人|公司/.test(description)) return 'GROUP_BUY'
  if (rawProductType === 'ADDON' || spec === 'ADDON' || /加片|加急|造型/.test(description)) return 'ADDON'
  return 'SERVICE'
}

export const mapProduct = (dto: ProductDto): ProductConfig => {
  const bizCategory = inferBizCategory(dto)
  return {
    backendId: dto.id,
    storeBackendId: dto.storeId ?? null,
    id: dto.productCode,
    bizCategory,
    name: dto.name,
    image: getApiAssetUrl(dto.coverUrl) || getProductFallbackImage(Number(dto.id ?? 0)),
    spec: dto.spec,
    price: toMoney(dto.priceCents),
    unitPrice: toMoney(dto.unitPriceCents),
    includedCount: dto.includedCount,
    active: dto.active,
    desc: dto.description,
    supportSelection: dto.unitPriceCents > 0,
    giftAlbum: bizCategory === 'ALBUM' && dto.includedCount > 0,
    storeNames: dto.storeName ? [dto.storeName] : [],
    ...inferCardFields(dto),
  }
}

export const productPayload = (product: ProductConfig): ProductPayload => ({
  storeId: product.storeBackendId ?? null,
  productCode: product.id,
  bizCategory: product.bizCategory,
  name: product.name,
  coverUrl: product.image && !isWorkbenchFallbackImage(product.image) && !product.image.startsWith('data:') ? product.image : null,
  spec: product.spec,
  priceCents: parseMoneyToCents(product.price),
  unitPriceCents: parseMoneyToCents(product.unitPrice),
  includedCount: Number(product.includedCount) || 0,
  active: product.active,
  description: product.desc,
})
