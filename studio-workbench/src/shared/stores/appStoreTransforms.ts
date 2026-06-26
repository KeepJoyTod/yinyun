import {
  getApiAssetUrl,
  type AlbumDto,
  type AlbumPhotoDto,
  type BookingInventoryDto,
  type CustomerDto,
  type EmployeeDto,
  type OrderDto,
  type OrderListQuery,
  type PhotoAccessLog,
  type ReportSnapshot,
  type SelectionLinkDto,
  type SelectionStatsDto,
  type ServiceGroupDto,
  type StoreDto,
  type StudioDto,
} from '../api/backend'
import type { BackendId } from '../api/backendId'
import type {
  Album,
  AlbumNegative,
  AlbumStatus,
  BookingInventorySlot,
  BookingOrder,
  BookingOrderStatus,
  CustomerInfo,
  EmployeeInfo,
  PaymentStatus,
  PhotoAccessLogInfo,
  ReportSnapshotInfo,
  SelectionLink,
  SelectionLinkStatus,
  ServiceGroupInfo,
  StoreInfo,
  StudioInfo,
} from './appStoreTypes'
export { mapProduct, parseMoneyToCents, productPayload } from './productStoreTransforms'
export {
  mapMemberBalanceLedger,
  mapMemberBenefit,
  mapMemberCard,
  mapMemberCoupon,
  mapMemberGrowthLedger,
  mapMemberOverview,
  mapMemberPointsLedger,
  mapMemberRechargeOrder,
} from './appStoreTransformsMember'
export {
  mapChannelProductMapping,
  mapChannelSyncLog,
  mapDouyinAcceptanceCase,
  mapDouyinSyncHealth,
  mapNotificationLog,
  mapNotificationTemplate,
  mapOperationLog,
} from './appStoreTransformsDiagnostics'

export const emptySelectionStats = (): SelectionStatsDto => ({
  activeCount: 0,
  newLast7DaysCount: 0,
  completedCount: 0,
  completedThisMonthCount: 0,
  averageSelectionMinutes: 0,
  extraConversionRate: 0,
  averageExtraCount: 0,
  monthExtraRevenueCents: 0,
})

const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const formatClock = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
export const formatMDHM = (d: Date) => `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${formatClock(d)}`
export const todayKey = () => formatDate(new Date())

export const createDemoBackendId = (scope: string): BackendId =>
  `demo-${scope}-${globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`

export const currentMonthOrderQuery = (): OrderListQuery => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    pageNum: 1,
    pageSize: 500,
    beginOrderTime: `${formatDate(firstDay)} 00:00:00`,
    endOrderTime: `${formatDate(lastDay)} 23:59:59`,
  }
}

export const buildWorkbenchStoreNames = (stores: Array<Pick<StoreInfo, 'name'>>) => {
  const names = Array.from(new Set(
    stores
      .map(store => store.name.trim())
      .filter(name => name && name !== '全部门店'),
  ))
  return ['全部门店', ...names]
}

const parseDateTime = (value: string | null | undefined) => {
  if (!value) return null
  const normalized = String(value).trim().replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDatePart = (value: string | null | undefined) => {
  const date = parseDateTime(value)
  return date ? formatDate(date) : ''
}

const toClockPart = (value: string | null | undefined) => {
  const date = parseDateTime(value)
  return date ? formatClock(date) : ''
}

const normalizeSlotClock = (value: string | null | undefined) => {
  const text = String(value ?? '').trim()
  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 5)
  if (/^\d{2}:\d{2}$/.test(text)) return text
  return ''
}

const buildSlotArrivalDateTime = (date: string | null | undefined, startTime: string | null | undefined) => {
  const day = String(date ?? '').trim()
  const clock = normalizeSlotClock(startTime)
  if (!day || !clock) return ''
  return `${day}T${clock}:00`
}

export const toMDHM = (value: string | null | undefined) => {
  const date = parseDateTime(value)
  return date ? formatMDHM(date) : ''
}

const asOrderStatus = (value: string): BookingOrderStatus => {
  if (value === '已确认' || value === '已到店' || value === '服务中' || value === '拍摄中' || value === '选片中' || value === '已完成' || value === '已取消' || value === '已退单') return value
  if (value === 'CONFIRMED') return '已确认'
  if (value === 'ARRIVED') return '已到店'
  if (value === 'SERVING') return '服务中'
  if (value === 'COMPLETED') return '已完成'
  if (value === 'CANCELLED') return '已取消'
  if (value === 'REFUNDED') return '已退单'
  return '待确认'
}

const asPaymentStatus = (value: string): PaymentStatus => {
  if (value === '已支付' || value === '部分支付' || value === '已退款') return value
  if (value === 'PAID') return '已支付'
  if (value === 'PARTIAL_REFUNDED') return '部分支付'
  if (value === 'REFUNDED') return '已退款'
  return '待支付'
}

const asAlbumStatus = (value: string): AlbumStatus => {
  if (value === '选片中' || value === '已交付') return value
  return '待客户选片'
}

const asSelectionLinkStatus = (value: string): SelectionLinkStatus => {
  if (value === '已完成' || value === '已失效') return value
  return '进行中'
}

export const toIsoArrival = (date: string, time: string) => `${date}T${time.length === 5 ? `${time}:00` : time}`

export const normalizeClock = (time: string) => {
  const trimmed = time.trim()
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5)
  return trimmed
}

export const toBackendDateTime = (date: string, time: string) => {
  const clock = normalizeClock(time)
  return `${date} ${clock.length === 5 ? `${clock}:00` : clock}`
}

export const addMinutesToClock = (date: string, time: string, minutes: number) => {
  const clock = normalizeClock(time)
  const parsed = new Date(`${date}T${clock.length === 5 ? `${clock}:00` : clock}`)
  if (Number.isNaN(parsed.getTime())) return clock
  parsed.setMinutes(parsed.getMinutes() + minutes)
  return formatClock(parsed)
}

export const splitTags = (value: string | null | undefined) =>
  String(value ?? '')
    .split(/[，,]/)
    .map(item => item.trim())
    .filter(Boolean)

export const mapStore = (dto: StoreDto): StoreInfo => ({
  backendId: dto.id,
  id: dto.storeCode,
  name: dto.name,
  status: dto.status,
  manager: dto.managerName ? `主管 · ${dto.managerName}` : '主管 · 未配置',
  monthlyOrders: String(dto.monthlyOrders ?? 0),
  pendingOrders: String(dto.pendingOrders ?? 0),
  address: dto.address,
  phone: dto.phone,
  hours: `${dto.openTime?.slice(0, 5) ?? '--:--'} - ${dto.closeTime?.slice(0, 5) ?? '--:--'}`,
})

export const mapOrder = (dto: OrderDto, stores: StoreInfo[]): BookingOrder => {
  const derivedArrivalAt = buildSlotArrivalDateTime(dto.slotDate, dto.slotStartTime) || dto.arrivalAt
  const orderDate = toDatePart(dto.orderAt) || dto.slotDate || ''
  const arrivalDate = toDatePart(derivedArrivalAt) || dto.slotDate || ''
  const arrivalClock = toClockPart(derivedArrivalAt) || normalizeSlotClock(dto.slotStartTime)
  const store = stores.find(s => s.backendId === dto.storeId)
  return {
    backendId: dto.id,
    storeBackendId: dto.storeId,
    productBackendId: dto.productId ?? undefined,
    serviceGroupBackendId: dto.serviceGroupId ?? undefined,
    inventorySlotId: dto.inventorySlotId ?? undefined,
    id: dto.orderNo,
    customer: dto.customerName,
    phone: dto.customerPhone,
    store: store?.name ?? `门店 #${dto.storeId}`,
    service: dto.serviceNameSnapshot,
    source: dto.source ?? '',
    method: dto.serviceMethod ?? '',
    channelType: dto.channelType || '',
    externalProductId: dto.externalProductId || '',
    externalPoiId: dto.externalPoiId || '',
    remark: dto.remark || '',
    orderTime: toMDHM(dto.orderAt),
    orderDate,
    orderClock: toClockPart(dto.orderAt),
    arrivalTime: derivedArrivalAt ? toMDHM(derivedArrivalAt) : '',
    status: asOrderStatus(dto.status),
    payment: asPaymentStatus(dto.paymentStatus),
    amount: Math.round((dto.amountCents ?? 0) / 100),
    refundStatus: dto.refundStatus || '',
    refundAmountCent: Number(dto.refundAmountCent ?? 0),
    arrivalDate,
    arrivalClock,
    externalSkuId: dto.externalSkuId || '',
    inventoryStatus: dto.inventoryStatus || '',
    conflictReason: dto.conflictReason || '',
    orderAttributeJson: dto.orderAttributeJson || '',
    orderAttributes: dto.orderAttributes || [],
  }
}

export const mapAlbumPhoto = (dto: AlbumPhotoDto): AlbumNegative => ({
  backendId: dto.id,
  id: String(dto.id),
  name: dto.displayName || dto.originalName,
  url: getApiAssetUrl(dto.url),
  uploadedAt: dto.uploadedAt,
  selected: dto.selected,
})

export const mapAlbum = (dto: AlbumDto, orders: BookingOrder[]): Album => {
  const order = dto.orderId ? orders.find(o => o.backendId === dto.orderId) : undefined
  return {
    backendId: dto.id,
    orderBackendId: dto.orderId ?? undefined,
    id: dto.albumNo,
    orderId: order?.id ?? (dto.orderId ? String(dto.orderId) : ''),
    customer: dto.customerName,
    service: dto.serviceName,
    date: dto.shootDate,
    photographer: dto.photographer,
    status: asAlbumStatus(dto.status),
    selectedCount: dto.selectedCount,
    totalCount: dto.totalCount,
    negatives: (dto.photos ?? []).map(mapAlbumPhoto),
  }
}

export const mapSelectionLink = (dto: SelectionLinkDto, orders: BookingOrder[], albums: Album[]): SelectionLink => {
  const order = orders.find(o => o.backendId === dto.orderId)
  const album = albums.find(a => a.backendId === dto.albumId)
  return {
    backendId: dto.id,
    token: dto.token,
    orderBackendId: dto.orderId ?? undefined,
    albumBackendId: dto.albumId,
    id: String(dto.id),
    orderId: order?.id,
    albumId: album?.id,
    display: dto.publicUrl.replace(/^\/api\/public\/selection\//, 'selection/'),
    url: getApiAssetUrl(dto.publicUrl),
    customer: dto.customerName,
    phone: dto.customerPhone,
    product: dto.product,
    selectedCount: dto.selectedCount,
    extraCount: dto.extraCount,
    visits: dto.visits,
    expire: dto.expireAt?.slice(5, 10) ?? '',
    status: asSelectionLinkStatus(dto.status),
  }
}

export const mapPhotoAccessLog = (dto: PhotoAccessLog): PhotoAccessLogInfo => ({
  backendId: dto.id,
  storeBackendId: dto.storeId ?? undefined,
  albumBackendId: dto.albumId ?? undefined,
  assetBackendId: dto.assetId ?? undefined,
  action: dto.action || 'ACCESS',
  platform: dto.platform || '未知平台',
  success: dto.success,
  happenedAt: dto.createTime || dto.remark || '',
  remark: dto.remark || '',
})

export const mapReportSnapshot = (dto: ReportSnapshot): ReportSnapshotInfo => ({
  backendId: dto.id,
  storeBackendId: dto.storeId ?? undefined,
  reportDate: dto.reportDate,
  reportType: dto.reportType,
  orderTotal: dto.orderTotal,
  arrivedTotal: dto.arrivedTotal,
  completedTotal: dto.completedTotal,
  revenueTotal: dto.revenueTotal,
  selectionTotal: dto.selectionTotal,
  sourceSummary: dto.sourceSummary,
  remark: dto.remark,
})

export const mapStudio = (dto: StudioDto): StudioInfo => ({
  backendId: dto.id,
  storeBackendId: dto.storeId,
  id: String(dto.id),
  name: dto.name,
  status: dto.status,
})

export const mapServiceGroup = (dto: ServiceGroupDto, stores: StoreInfo[]): ServiceGroupInfo => {
  const store = stores.find(item => item.backendId === dto.storeId)
  return {
    backendId: dto.id,
    storeBackendId: dto.storeId,
    storeName: store?.name ?? `门店 #${dto.storeId}`,
    code: dto.groupCode,
    name: dto.groupName,
    capacity: dto.capacity,
    durationMinutes: dto.durationMinutes,
    serviceMode: dto.serviceMode || 'HORIZONTAL',
    status: dto.status || 'ACTIVE',
    sort: dto.sort,
    remark: dto.remark,
  }
}

export const mapBookingInventory = (
  dto: BookingInventoryDto,
  stores: StoreInfo[],
  serviceGroups: ServiceGroupInfo[],
): BookingInventorySlot => {
  const store = stores.find(item => item.backendId === dto.storeId)
  const group = serviceGroups.find(item => item.backendId === dto.serviceGroupId)
  return {
    backendId: dto.id,
    storeBackendId: dto.storeId,
    storeName: store?.name ?? `门店 #${dto.storeId}`,
    serviceGroupBackendId: dto.serviceGroupId ?? undefined,
    serviceGroupName: group?.name ?? (dto.externalSkuId ? `SKU ${dto.externalSkuId}` : '未绑定服务组'),
    date: dto.bizDate,
    startTime: dto.startTime,
    endTime: dto.endTime,
    capacity: dto.capacity,
    confirmedCount: dto.paidCount,
    conflictCount: dto.conflictCount,
    status: dto.status || 'ACTIVE',
    remark: dto.remark,
    externalSkuId: dto.externalSkuId,
  }
}

export const mapEmployee = (dto: EmployeeDto, stores: StoreInfo[]): EmployeeInfo => {
  const store = stores.find(item => item.backendId === dto.storeId)
  return {
    backendId: dto.id,
    storeBackendId: dto.storeId,
    storeName: store?.name ?? `门店 #${dto.storeId}`,
    employeeNo: dto.employeeNo,
    name: dto.employeeName,
    mobile: dto.mobile,
    roleType: dto.roleType || '未配置',
    skillTags: splitTags(dto.skillTags),
    status: dto.status || 'ACTIVE',
    sort: dto.sort,
    remark: dto.remark,
    userId: dto.userId ?? undefined,
  }
}

export const mapCustomer = (dto: CustomerDto): CustomerInfo => ({
  backendId: dto.id,
  name: dto.customerName,
  mobile: dto.mobile,
  gender: dto.gender || '未设置',
  birthday: dto.birthday || '',
  source: dto.source || '未标记',
  memberLevel: dto.memberLevel || '普通',
  totalOrderCount: dto.totalOrderCount,
  totalSpend: dto.totalSpendAmount,
  lastOrderTime: dto.lastOrderTime || '',
  tags: splitTags(dto.tags),
  remark: dto.remark,
})
