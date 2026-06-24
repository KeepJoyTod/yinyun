import type { CardProductItem, ProductConfig } from '../../../shared/stores/appStore'

export type CardModalType = 'times' | 'stored'

export type CardFormState = {
  id: string
  name: string
  nickname: string
  intro: string
  desc: string
  publishMode: 'DRAFT' | 'PUBLISHED'
  cardMode: 'TIMES' | 'STORED'
  cardTimesType: 'SINGLE' | 'SHARED'
  cardSalePrice: string
  cardRechargeAmount: string
  cardGiftAmount: string
  cardOpeningGiftAmount: string
  cardProductScope: 'SELECTED' | 'ALL'
  cardServiceItems: CardProductItem[]
  cardGiftItems: CardProductItem[]
  cardValidityMode: 'FOREVER' | 'AFTER_ACTIVATION' | 'FIXED_DATE'
  cardValidityDays: number
  cardValidityDate: string
  cardActivationMode: 'IMMEDIATE' | 'MANUAL'
}

export const defaultCardProductItem = (): CardProductItem => ({
  productId: '',
  productName: '',
  count: 1,
})

export const buildDefaultCardForm = (type: CardModalType): CardFormState => ({
  id: '',
  name: type === 'stored' ? '储值卡' : '次卡',
  nickname: '',
  intro: '',
  desc: '',
  publishMode: 'PUBLISHED',
  cardMode: type === 'stored' ? 'STORED' : 'TIMES',
  cardTimesType: 'SINGLE',
  cardSalePrice: '',
  cardRechargeAmount: '',
  cardGiftAmount: '',
  cardOpeningGiftAmount: '',
  cardProductScope: 'SELECTED',
  cardServiceItems: [defaultCardProductItem()],
  cardGiftItems: [defaultCardProductItem()],
  cardValidityMode: 'FOREVER',
  cardValidityDays: 365,
  cardValidityDate: '',
  cardActivationMode: 'IMMEDIATE',
})

export const normalizeCardItems = (items?: CardProductItem[]) => {
  const normalized = (items ?? []).map(item => ({
    productId: item.productId ?? '',
    productName: item.productName ?? '',
    count: Math.max(1, Number(item.count) || 1),
  }))
  return normalized.length ? normalized : [defaultCardProductItem()]
}

export const buildCardFormFromProduct = (
  type: CardModalType,
  current?: ProductConfig | null,
): CardFormState => {
  const base = buildDefaultCardForm(type)
  if (!current) return base
  const inferredMode = current.cardMode ?? (type === 'stored' ? 'STORED' : 'TIMES')
  return {
    ...base,
    id: current.id ?? '',
    name: current.name ?? base.name,
    nickname: current.nickname ?? '',
    intro: current.intro ?? '',
    desc: current.desc ?? '',
    publishMode: current.publishMode ?? (current.active ? 'PUBLISHED' : 'DRAFT'),
    cardMode: inferredMode,
    cardTimesType: current.cardTimesType ?? 'SINGLE',
    cardSalePrice: current.cardSalePrice ?? (inferredMode === 'TIMES' ? current.price ?? '' : ''),
    cardRechargeAmount: current.cardRechargeAmount ?? (inferredMode === 'STORED' ? current.price ?? '' : ''),
    cardGiftAmount: current.cardGiftAmount ?? (inferredMode === 'STORED' ? current.unitPrice ?? '' : ''),
    cardOpeningGiftAmount: current.cardOpeningGiftAmount ?? '',
    cardProductScope: current.cardProductScope ?? 'SELECTED',
    cardServiceItems: normalizeCardItems(current.cardServiceItems),
    cardGiftItems: normalizeCardItems(current.cardGiftItems),
    cardValidityMode: current.cardValidityMode ?? 'FOREVER',
    cardValidityDays: Math.max(1, Number(current.cardValidityDays) || 365),
    cardValidityDate: current.cardValidityDate ?? '',
    cardActivationMode: current.cardActivationMode ?? 'IMMEDIATE',
  }
}

export const compactCardItems = (items: CardProductItem[]) =>
  items
    .filter(item => item.productName.trim())
    .map(item => ({
      productId: item.productId?.trim() || '',
      productName: item.productName.trim(),
      count: Math.max(1, Number(item.count) || 1),
    }))

export const resolveCardValiditySummary = (form: Pick<CardFormState, 'cardValidityMode' | 'cardValidityDays' | 'cardValidityDate'>) => {
  if (form.cardValidityMode === 'FOREVER') return '永久有效'
  if (form.cardValidityMode === 'AFTER_ACTIVATION') return `激活后 ${Math.max(1, Number(form.cardValidityDays) || 0)} 天`
  return form.cardValidityDate || '未设置'
}

export const validateCardForm = (form: CardFormState) => {
  if (!form.name.trim()) return '请先填写卡项名称'
  if (form.cardMode === 'TIMES') {
    const salePrice = Number(form.cardSalePrice)
    if (!form.cardSalePrice.trim()) return '请填写次卡售价'
    if (!Number.isFinite(salePrice) || salePrice < 0) return '次卡售价不能小于 0'
    if (!compactCardItems(form.cardServiceItems).length) return '请至少添加一个服务项目'
  }
  if (form.cardMode === 'STORED') {
    const rechargeAmount = Number(form.cardRechargeAmount)
    if (!form.cardRechargeAmount.trim()) return '请填写充值金额'
    if (!Number.isFinite(rechargeAmount) || rechargeAmount < 0) return '充值金额不能小于 0'
    if (form.cardProductScope === 'SELECTED' && !compactCardItems(form.cardServiceItems).length) return '请至少选择一个适用产品'
  }
  if (form.cardValidityMode === 'AFTER_ACTIVATION' && (!Number.isFinite(Number(form.cardValidityDays)) || Number(form.cardValidityDays) <= 0)) {
    return '请填写有效天数'
  }
  if (form.cardValidityMode === 'FIXED_DATE' && !form.cardValidityDate) return '请选择有效截止日期'
  if (!form.desc.trim()) return '请填写详情介绍'
  return ''
}

export const buildCardProductPayload = ({
  form,
  initialData,
  validitySummary,
}: {
  form: CardFormState
  initialData?: ProductConfig | null
  validitySummary: string
}): ProductConfig => {
  const serviceItems = compactCardItems(form.cardServiceItems)
  const giftItems = compactCardItems(form.cardGiftItems)
  const cardModeValue = form.cardMode
  const isPublished = form.publishMode === 'PUBLISHED'
  const amountLabel = cardModeValue === 'TIMES' ? form.cardSalePrice.trim() : form.cardRechargeAmount.trim()
  const typeLabel = cardModeValue === 'STORED'
    ? '储值卡'
    : form.cardTimesType === 'SHARED'
      ? '共享次卡'
      : '单项次卡'

  return {
    ...(initialData ?? {}),
    id: form.id.trim() || `CARD_${Date.now()}`,
    bizCategory: 'CARD',
    name: form.name.trim(),
    nickname: form.nickname.trim() || form.name.trim(),
    image: initialData?.image ?? '',
    listImage: initialData?.listImage ?? '',
    halfImage: initialData?.halfImage ?? '',
    channels: [...(initialData?.channels ?? ['WECHAT'])],
    categoryName: '卡项产品',
    allowOnlineBooking: false,
    showInApp: true,
    allowStoreOrder: true,
    selfPayMode: 'PAY',
    fullSlotMode: 'ALLOW',
    durationLabel: validitySummary,
    supportSelection: false,
    giftAlbum: false,
    originalPriceLabel: '原价',
    currentPriceLabel: cardModeValue === 'TIMES' ? '售价' : '充值金额',
    priceLabelText: '',
    hasSpecs: false,
    consumeCredit: 0,
    ladderPricingText: '',
    depositMode: 'BRAND',
    depositAmount: '',
    intro: form.intro.trim(),
    detailButtonMode: 'CUSTOM',
    detailButtonText: cardModeValue === 'STORED' ? '立即开卡' : '立即购卡',
    detailModules: initialData?.detailModules ?? ['TITLE', 'TEXT_NAV'],
    publishMode: form.publishMode,
    spec: typeLabel,
    price: amountLabel,
    unitPrice: cardModeValue === 'STORED' ? form.cardGiftAmount.trim() : '0',
    includedCount: serviceItems.reduce((sum, item) => sum + Math.max(1, Number(item.count) || 1), 0),
    active: isPublished,
    desc: form.desc.trim(),
    storeNames: [...(initialData?.storeNames ?? [])],
    publishStatus: isPublished ? 'PUBLISHED' : 'UNPUBLISHED',
    mutuallyExclusiveRule: initialData?.mutuallyExclusiveRule ?? '',
    linkedProductIds: [...(initialData?.linkedProductIds ?? [])],
    linkedProductNames: [...(initialData?.linkedProductNames ?? [])],
    shelfConfig: initialData?.shelfConfig ?? '',
    orderLimitRule: initialData?.orderLimitRule ?? '',
    cardMode: cardModeValue,
    cardTimesType: cardModeValue === 'TIMES' ? form.cardTimesType : undefined,
    cardSalePrice: form.cardSalePrice.trim(),
    cardRechargeAmount: form.cardRechargeAmount.trim(),
    cardGiftAmount: form.cardGiftAmount.trim(),
    cardOpeningGiftAmount: form.cardOpeningGiftAmount.trim(),
    cardProductScope: form.cardProductScope,
    cardServiceItems: serviceItems,
    cardGiftItems: giftItems,
    cardValidityMode: form.cardValidityMode,
    cardValidityDays: form.cardValidityMode === 'AFTER_ACTIVATION' ? Math.max(1, Number(form.cardValidityDays) || 1) : undefined,
    cardValidityDate: form.cardValidityMode === 'FIXED_DATE' ? form.cardValidityDate : '',
    cardActivationMode: form.cardActivationMode,
  }
}
