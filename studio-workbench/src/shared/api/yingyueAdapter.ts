import type {
  AlbumDto,
  AlbumPhotoDto,
  OrderDto,
  OrderStatusStatDto,
  ProductDto,
  ScheduleItemDto,
  SelectionLinkDto,
  SelectionStatsDto,
  StoreDto,
  StudioDto,
  TodaySlotDto,
  TrendStatDto,
} from './backendTypes'
import { normalizeBackendId, optionalBackendId, type BackendId } from './backendId'
import type {
  OssVo,
  RuoyiTableResponse,
  YyOrderVo,
  YyPhotoAlbumVo,
  YyPhotoAssetForm,
  YyPhotoAssetVo,
  YyProductVo,
  YyStoreVo,
} from './yingyueAdapterTypes'

export type {
  OssVo,
  RuoyiTableResponse,
  YyOrderVo,
  YyPhotoAlbumVo,
  YyPhotoAssetForm,
  YyPhotoAssetVo,
  YyProductVo,
  YyStoreVo,
} from './yingyueAdapterTypes'

const sourceLabels: Record<string, string> = {
  LOCAL: '本地',
  DOUYIN: '抖音',
  DOUYIN_LIFE: '抖音来客',
  MEITUAN: '美团',
  WECHAT: '微信',
  IMPORT: '手工导入',
}

const bookingMethodLabels: Record<string, string> = {
  MANUAL: '人工预约',
  H5: 'H5预约',
  MINI_APP: '小程序',
  APP: 'App',
  CHANNEL: '渠道同步',
}

const orderStatusLabels: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  ARRIVED: '已到店',
  SERVING: '服务中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退单',
}

export const orderStatusValues: Record<string, string> = {
  待确认: 'PENDING',
  已确认: 'CONFIRMED',
  已到店: 'ARRIVED',
  服务中: 'SERVING',
  拍摄中: 'SERVING',
  选片中: 'COMPLETED',
  已完成: 'COMPLETED',
  已取消: 'CANCELLED',
  已退单: 'REFUNDED',
}

const albumStatusLabels: Record<string, string> = {
  DRAFT: '待客户选片',
  WAITING: '待客户选片',
  SELECTING: '选片中',
  SUBMITTED: '选片中',
  CONFIRMED: '选片中',
  DELIVERED: '已交付',
  COMPLETED: '已交付',
  EXPIRED: '已交付',
}

const toMoneyCents = (value: string | number | undefined | null) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0
}

const labelFrom = (map: Record<string, string>, value?: string, fallback = '') => {
  const key = String(value ?? '')
  return map[key] ?? key ?? fallback
}

const splitBusinessHours = (value?: string) => {
  const [openTime = '', closeTime = ''] = String(value ?? '').split(/\s*[-~至]\s*/)
  return {
    openTime: openTime || '09:00',
    closeTime: closeTime || '21:00',
  }
}

const extractManagerName = (remark?: string) => {
  const text = String(remark ?? '')
  const match = text.match(/(?:店长|主管|manager)\s*[:：]\s*([^,，;；\s]+)/i)
  return match?.[1] ?? ''
}

const formatDay = (value?: string) => String(value ?? '').slice(0, 10)

const sameDay = (value: string | undefined, date?: string) => {
  if (!date) return true
  return formatDay(value) === date
}

const normalizeClockText = (value?: string) => {
  const text = String(value ?? '').trim()
  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text
  if (/^\d{2}:\d{2}$/.test(text)) return `${text}:00`
  return ''
}

const buildSlotDateTime = (slotDate?: string, slotStartTime?: string) => {
  const date = String(slotDate ?? '').trim()
  const clock = normalizeClockText(slotStartTime)
  if (!date || !clock) return ''
  return `${date} ${clock}`
}

const addMinutes = (value: string | undefined, minutes: number) => {
  const date = new Date(String(value ?? '').replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value ?? ''
  date.setMinutes(date.getMinutes() + minutes)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
}

const toClockPart = (value?: string) => {
  const match = String(value ?? '').match(/(?:T|\s)(\d{2}:\d{2})(?::\d{2})?$/)
  return match?.[1] ?? ''
}

const buildSlotEndClock = (slotDate?: string, slotStartTime?: string, slotEndTime?: string, fallbackMinutes = 60) => {
  const normalizedEnd = normalizeClockText(slotEndTime)
  if (normalizedEnd) return normalizedEnd.slice(0, 5)
  const startAt = buildSlotDateTime(slotDate, slotStartTime)
  if (!startAt) return ''
  return toClockPart(addMinutes(startAt, fallbackMinutes))
}

const hasRealSlotRange = (slotDate?: string, slotStartTime?: string) =>
  Boolean(String(slotDate ?? '').trim() && normalizeClockText(slotStartTime))

const isDouyinLifeChannel = (channelType?: string) =>
  String(channelType ?? '').trim().toUpperCase() === 'DOUYIN_LIFE'

export function extractRuoyiRows<T>(response: RuoyiTableResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(response)) return response
  return response?.rows ?? []
}

export function mapYyStore(row: YyStoreVo): StoreDto {
  const hours = splitBusinessHours(row.businessHours)
  return {
    id: normalizeBackendId(row.id),
    storeCode: row.storeCode || `YY_STORE_${row.id}`,
    name: row.storeName || `门店 #${row.id}`,
    status: row.status === '0' ? '营业中' : '停业',
    managerName: extractManagerName(row.remark),
    address: row.address || '',
    phone: row.phone || '',
    openTime: hours.openTime,
    closeTime: hours.closeTime,
    monthlyOrders: 0,
    pendingOrders: 0,
  }
}

export function mapYyProduct(row: YyProductVo): ProductDto {
  return {
    id: normalizeBackendId(row.id),
    storeId: row.storeId == null || row.storeId === '' ? null : normalizeBackendId(row.storeId),
    productCode: `YY_PRODUCT_${row.id}`,
    name: row.productName || `产品 #${row.id}`,
    coverUrl: null,
    spec: row.productType || row.albumProductName || '摄影服务',
    priceCents: toMoneyCents(row.price),
    unitPriceCents: toMoneyCents(row.selectionPrice),
    includedCount: 0,
    active: row.status === '0',
    description: row.remark || row.albumProductName || '',
  }
}

export function mapYyOrder(
  row: YyOrderVo,
  products: ProductDto[] = [],
  resolved?: { productId?: BackendId | null; serviceNameSnapshot?: string },
): OrderDto {
  const product = resolved?.productId ? products.find(item => item.id === resolved.productId) : undefined
  const totalAmountCents = Number(row.totalAmountCent ?? row.paidAmountCent ?? product?.priceCents ?? 0)
  const arrivalAt = buildSlotDateTime(row.slotDate, row.slotStartTime) || row.arrivalTime || ''
  const slotEndTime = row.slotEndTime || buildSlotEndClock(row.slotDate, row.slotStartTime)
  const refundAmountCent = Number(row.refundAmountCent ?? 0)
  const refundStatus = String(row.refundStatus || '').trim()
  const payStatus = String(row.payStatus || '').trim().toUpperCase()
  const orderStatus = String(row.status || '').trim().toUpperCase()
  const hasRefundFact = payStatus === 'REFUNDED' || orderStatus === 'REFUNDED' || Boolean(refundStatus) || refundAmountCent > 0
  const fallbackServiceName = resolved?.serviceNameSnapshot
    || product?.name
    || row.serviceNameSnapshot
    || row.serviceName
    || row.productName
    || row.albumProductName
    || (row.externalSkuId ? `抖音SKU ${row.externalSkuId}` : '摄影服务')
  return {
    id: normalizeBackendId(row.id),
    orderNo: row.orderNo || `YY_ORDER_${row.id}`,
    customerName: row.customerName || '',
    customerPhone: row.customerPhone || '',
    storeId: normalizeBackendId(row.storeId),
    productId: resolved?.productId ?? product?.id ?? null,
    serviceGroupId: row.serviceGroupId == null || row.serviceGroupId === '' ? null : normalizeBackendId(row.serviceGroupId),
    inventorySlotId: row.inventorySlotId == null || row.inventorySlotId === '' ? null : normalizeBackendId(row.inventorySlotId),
    serviceNameSnapshot: fallbackServiceName,
    channelType: row.channelType || '',
    source: labelFrom(sourceLabels, row.source, '本地'),
    serviceMethod: labelFrom(bookingMethodLabels, row.bookingMethod, '人工预约'),
    orderAt: row.orderTime || '',
    arrivalAt,
    status: labelFrom(orderStatusLabels, row.status, '待确认'),
    paymentStatus: hasRefundFact
      ? '已退款'
      : payStatus === 'PARTIAL_REFUNDED'
        ? '部分支付'
        : payStatus === 'UNPAID' || orderStatus === 'CANCELLED'
            ? '待支付'
            : '已支付',
    amountCents: Number.isFinite(totalAmountCents) ? totalAmountCents : 0,
    refundStatus,
    refundAmountCent,
    externalProductId: row.externalProductId || '',
    externalSkuId: row.externalSkuId || '',
    externalPoiId: row.externalPoiId || '',
    slotDate: row.slotDate || '',
    slotStartTime: row.slotStartTime || '',
    slotEndTime,
    inventoryStatus: row.inventoryStatus || '',
    conflictReason: row.conflictReason || '',
    remark: row.remark || row.workstationNo || row.externalOrderId || '',
  }
}

export function mapYyPhotoAsset(row: YyPhotoAssetVo): AlbumPhotoDto {
  return {
    id: normalizeBackendId(row.id),
    albumId: normalizeBackendId(row.albumId),
    fileId: normalizeBackendId(row.id),
    originalName: row.fileName || row.objectKey || `photo-${row.id}`,
    displayName: row.fileName || row.objectKey || `photo-${row.id}`,
    sortOrder: Number(row.sort ?? 0),
    selected: row.isSelected === '1',
    url: row.fileUrl || null,
    uploadedAt: row.createTime || '',
  }
}

export function mapYyAlbum(row: YyPhotoAlbumVo, assets: AlbumPhotoDto[] = [], orders: OrderDto[] = []): AlbumDto {
  const albumId = normalizeBackendId(row.id)
  const orderBackendId = optionalBackendId(row.orderId) ?? null
  const albumAssets = assets
    .filter(asset => asset.albumId === albumId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const order = orderBackendId ? orders.find(item => item.id === orderBackendId) : undefined
  const selectedCount = albumAssets.filter(asset => asset.selected).length
  return {
    id: albumId,
    albumNo: `ALB-${row.id}`,
    orderId: orderBackendId,
    customerName: row.customerName || order?.customerName || '',
    serviceName: row.albumName || order?.serviceNameSnapshot || '客户相册',
    shootDate: formatDay(order?.arrivalAt || row.expireTime),
    photographer: row.remark || '',
    status: labelFrom(albumStatusLabels, row.selectionStatus || row.status, '待客户选片'),
    selectedCount,
    totalCount: albumAssets.length,
    photos: albumAssets,
  }
}

export function resolveNextAssetSort(rows: AlbumPhotoDto[], fallbackTotal = 0) {
  const numericSorts = rows
    .map(item => Number(item.sortOrder))
    .filter(value => Number.isFinite(value))
  if (!numericSorts.length) return Number(fallbackTotal || 0)
  return Math.max(...numericSorts) + 1
}

export function buildYyPhotoAssetFormFromOss(
  album: Pick<YyPhotoAlbumVo, 'id' | 'storeId'>,
  oss: OssVo,
  fallbackName: string,
  sort: number,
  ossId: string | number,
): YyPhotoAssetForm {
  if (!oss.fileName) {
    throw new Error('OSS Key 获取失败，请检查 system:oss:query 权限或 OSS 记录')
  }
  return {
    storeId: album.storeId || '',
    albumId: album.id || '',
    fileName: oss.originalName || fallbackName,
    fileUrl: oss.url || '',
    objectKey: oss.fileName,
    thumbnailObjectKey: '',
    sort,
    isSelected: '0',
    visible: '1',
    remark: `OSS ID: ${ossId}`,
  }
}

export function buildSelectionLinksFromAlbums(albums: AlbumDto[], sourceAlbums: YyPhotoAlbumVo[] = []): SelectionLinkDto[] {
  return albums.map(album => {
    const source = sourceAlbums.find(item => normalizeBackendId(item.id) === album.id)
    return {
      id: album.id,
      token: source?.publicToken || source?.accessCode || String(album.id),
      orderId: album.orderId,
      albumId: album.id,
      customerName: album.customerName,
      customerPhone: source?.customerPhone || '',
      product: album.serviceName,
      selectedCount: album.selectedCount,
      extraCount: Math.max(0, album.selectedCount - 1),
      visits: 0,
      expireAt: source?.expireTime || '',
      status: album.status === '已交付' ? '已完成' : album.status === '待客户选片' ? '进行中' : '进行中',
      publicUrl: `/client/photo/albums/${album.id}`,
    }
  })
}

export function buildSelectionStats(links: SelectionLinkDto[]): SelectionStatsDto {
  return {
    activeCount: links.filter(link => link.status === '进行中').length,
    newLast7DaysCount: links.length,
    completedCount: links.filter(link => link.status === '已完成').length,
    completedThisMonthCount: links.filter(link => link.status === '已完成').length,
    averageSelectionMinutes: 0,
    extraConversionRate: links.length ? links.filter(link => link.extraCount > 0).length / links.length : 0,
    averageExtraCount: links.length ? links.reduce((sum, link) => sum + link.extraCount, 0) / links.length : 0,
    monthExtraRevenueCents: links.reduce((sum, link) => sum + link.extraCount * 3900, 0),
  }
}

export function buildStudiosFromStores(stores: StoreDto[]): StudioDto[] {
  return stores.map(store => ({
    id: store.id,
    storeId: store.id,
    name: `${store.name} · 默认工位`,
    status: store.status,
  }))
}

export function buildScheduleItemsFromOrders(orders: OrderDto[], date?: string, storeId?: BackendId): ScheduleItemDto[] {
  return orders
    .filter(order => !isDouyinLifeChannel(order.channelType) || hasRealSlotRange(order.slotDate, order.slotStartTime))
    .filter(order => sameDay(buildSlotDateTime(order.slotDate, order.slotStartTime) || order.arrivalAt, date) && (!storeId || order.storeId === storeId))
    .map(order => {
      const startAt = buildSlotDateTime(order.slotDate, order.slotStartTime) || order.arrivalAt
      const derivedEndAt = buildSlotDateTime(order.slotDate, order.slotEndTime) || addMinutes(startAt, 60)
      return {
        bookingId: order.id,
        orderId: order.id,
        storeId: order.storeId,
        studioId: order.storeId,
        studioName: `门店 #${order.storeId} · 默认工位`,
        startAt,
        endAt: derivedEndAt,
        bookingStatus: order.status,
        orderNo: order.orderNo,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        serviceName: order.serviceNameSnapshot,
        orderStatus: order.status,
      }
    })
}

export function buildOrderStatusStats(orders: OrderDto[]): OrderStatusStatDto[] {
  const isRefundedOrder = (order: OrderDto) =>
    order.paymentStatus === '已退款' || order.status === '已退单'

  const isCancelledOrder = (order: OrderDto) =>
    order.status === '已取消'

  const isEffectiveOrder = (order: OrderDto) =>
    !isRefundedOrder(order) && !isCancelledOrder(order)

  const definitions = [
    {
      status: '待服务',
      label: '待服务',
      match: (order: OrderDto) => isEffectiveOrder(order) && order.status === '待确认',
    },
    {
      status: '服务中',
      label: '服务中',
      match: (order: OrderDto) => isEffectiveOrder(order) && ['已确认', '已到店', '服务中', '拍摄中'].includes(order.status),
    },
    {
      status: '已完成',
      label: '已完成',
      match: (order: OrderDto) => isEffectiveOrder(order) && ['已完成', '选片中'].includes(order.status),
    },
    {
      status: '已取消',
      label: '已取消',
      match: isCancelledOrder,
    },
    {
      status: '已退单',
      label: '已退单',
      match: (order: OrderDto) => isRefundedOrder(order) && !isCancelledOrder(order),
    },
  ] as const

  return definitions.map(({ status, label, match }) => {
    const rows = orders.filter(match)
    return {
      status,
      label,
      count: rows.length,
      amountCents: rows.reduce((sum, row) => sum + row.amountCents, 0),
    }
  })
}

export function buildTrendStats(orders: OrderDto[], endDate: string, days = 20): TrendStatDto[] {
  const end = new Date(`${endDate}T00:00:00`)
  const safeEnd = Number.isNaN(end.getTime()) ? new Date() : end
  return Array.from({ length: days }, (_, idx) => {
    const day = new Date(safeEnd)
    day.setDate(safeEnd.getDate() - (days - idx - 1))
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    const bookedCount = orders.filter(order => formatDay(order.orderAt) === key).length
    const arrivedCount = orders.filter(order => formatDay(order.arrivalAt) === key).length
    return {
      day: key,
      bookedCount,
      arrivedCount,
      amountCents: orders
        .filter(order => formatDay(order.orderAt) === key)
        .reduce((sum, row) => sum + row.amountCents, 0),
    }
  })
}

export function buildTodaySlots(orders: OrderDto[], date: string): TodaySlotDto[] {
  return buildScheduleItemsFromOrders(orders, date).map(item => ({
    bookingId: item.bookingId,
    storeId: item.storeId,
    storeName: `门店 #${item.storeId}`,
    studioId: item.studioId,
    studioName: item.studioName,
    startAt: item.startAt,
    endAt: item.endAt,
    bookingStatus: item.bookingStatus,
    orderId: item.orderId,
    orderNo: item.orderNo,
    customerName: item.customerName,
    orderStatus: item.orderStatus,
  }))
}
