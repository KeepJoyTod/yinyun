import type { BackendId } from '../api/backendId'

export type StoreInfo = {
  backendId: BackendId
  id: string
  name: string
  status: string
  manager: string
  monthlyOrders: string
  pendingOrders: string
  address: string
  phone: string
  hours: string
}

export type ProductConfig = {
  backendId?: BackendId
  storeBackendId?: BackendId | null
  id: string
  bizCategory?: string
  name: string
  nickname?: string
  image: string
  listImage?: string
  halfImage?: string
  channels?: string[]
  categoryName?: string
  allowOnlineBooking?: boolean
  showInApp?: boolean
  allowStoreOrder?: boolean
  selfPayMode?: 'PAY' | 'NO_PAY'
  fullSlotMode?: 'ALLOW' | 'BLOCK'
  durationLabel?: string
  supportSelection?: boolean
  giftAlbum?: boolean
  originalPriceLabel?: string
  currentPriceLabel?: string
  priceLabelText?: string
  hasSpecs?: boolean
  consumeCredit?: number
  ladderPricingText?: string
  depositMode?: 'BRAND' | 'PRODUCT'
  depositAmount?: string
  intro?: string
  detailButtonMode?: 'BOOK_NOW' | 'CUSTOM' | 'HIDE' | 'PAY_NOW' | 'BOTH'
  detailButtonText?: string
  detailModules?: string[]
  publishMode?: 'DRAFT' | 'PUBLISHED'
  spec: string
  price: string
  unitPrice: string
  includedCount: number
  active: boolean
  desc: string
  storeNames?: string[]
  publishStatus?: 'PUBLISHED' | 'UNPUBLISHED'
  mutuallyExclusiveRule?: string
  linkedProductIds?: string[]
  linkedProductNames?: string[]
  shelfConfig?: string
  orderLimitRule?: string
  cardMode?: 'TIMES' | 'STORED'
  cardTimesType?: 'SINGLE' | 'SHARED'
  cardSalePrice?: string
  cardRechargeAmount?: string
  cardGiftAmount?: string
  cardOpeningGiftAmount?: string
  cardProductScope?: 'SELECTED' | 'ALL'
  cardServiceItems?: CardProductItem[]
  cardGiftItems?: CardProductItem[]
  cardValidityMode?: 'FOREVER' | 'AFTER_ACTIVATION' | 'FIXED_DATE'
  cardValidityDays?: number
  cardValidityDate?: string
  cardActivationMode?: 'IMMEDIATE' | 'MANUAL'
}

export type CardProductItem = {
  productId?: string
  productName: string
  count?: number
}

export type BookingOrderStatus = '待确认' | '已确认' | '已到店' | '服务中' | '拍摄中' | '选片中' | '已完成' | '已取消' | '已退单'
export type PaymentStatus = '待支付' | '已支付' | '部分支付' | '已退款'

export type BookingOrder = {
  backendId: BackendId
  storeBackendId: BackendId
  productBackendId?: BackendId
  serviceGroupBackendId?: BackendId
  inventorySlotId?: BackendId
  id: string
  customer: string
  phone: string
  store: string
  service: string
  source: string
  method: string
  channelType?: string
  externalProductId?: string
  externalPoiId?: string
  remark?: string
  orderTime: string
  orderDate: string
  orderClock: string
  arrivalTime: string
  status: BookingOrderStatus
  payment: PaymentStatus
  amount: number
  refundStatus?: string
  refundAmountCent?: number
  arrivalDate: string
  arrivalClock: string
  externalSkuId?: string
  inventoryStatus?: string
  conflictReason?: string
}

export type AlbumStatus = '选片中' | '已交付' | '待客户选片'

export type AlbumNegative = {
  backendId: BackendId
  id: string
  name: string
  url: string
  uploadedAt: string
  selected: boolean
}

export type Album = {
  backendId: BackendId
  orderBackendId?: BackendId
  id: string
  orderId: string
  customer: string
  service: string
  date: string
  photographer: string
  status: AlbumStatus
  selectedCount: number
  totalCount: number
  negatives: AlbumNegative[]
}

export type SelectionLinkStatus = '进行中' | '已完成' | '已失效'

export type SelectionLink = {
  backendId: BackendId
  token: string
  orderBackendId?: BackendId
  albumBackendId?: BackendId
  id: string
  orderId?: string
  albumId?: string
  display: string
  url: string
  customer: string
  phone: string
  product: string
  selectedCount: number
  extraCount: number
  visits: number
  expire: string
  status: SelectionLinkStatus
}

export type PhotoAccessLogInfo = {
  backendId: BackendId
  storeBackendId?: BackendId
  albumBackendId?: BackendId
  assetBackendId?: BackendId
  action: string
  platform: string
  success: string
  happenedAt: string
  remark: string
}

export type ReportSnapshotInfo = {
  backendId: BackendId
  storeBackendId?: BackendId
  reportDate: string
  reportType: string
  orderTotal: number
  arrivedTotal: number
  completedTotal: number
  revenueTotal: number
  selectionTotal: number
  sourceSummary: string
  remark: string
}

export type StudioInfo = {
  backendId: BackendId
  storeBackendId: BackendId
  id: string
  name: string
  status: string
}

export type ServiceGroupInfo = {
  backendId: BackendId
  storeBackendId: BackendId
  storeName: string
  code: string
  name: string
  capacity: number
  durationMinutes: number
  status: string
  sort: number
  remark: string
}

export type BookingInventorySlot = {
  backendId: BackendId
  storeBackendId: BackendId
  storeName: string
  serviceGroupBackendId?: BackendId
  serviceGroupName: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  confirmedCount: number
  conflictCount: number
  status: string
  remark: string
  externalSkuId: string
}

export type EmployeeInfo = {
  backendId: BackendId
  storeBackendId: BackendId
  storeName: string
  employeeNo: string
  name: string
  mobile: string
  roleType: string
  skillTags: string[]
  status: string
  sort: number
  remark: string
  userId?: BackendId
}

export type CustomerInfo = {
  backendId: BackendId
  name: string
  mobile: string
  gender: string
  birthday: string
  source: string
  memberLevel: string
  totalOrderCount: number
  totalSpend: number
  lastOrderTime: string
  tags: string[]
  remark: string
}

export type MemberOverviewInfo = {
  customerBackendId: BackendId
  customerName: string
  mobile: string
  memberLevel: string
  tagSummary: string
  totalOrderCount: number
  totalSpend: number
  activeCardCount: number
  activeCouponCount: number
  activeBenefitCount: number
  pointsBalance: number
  growthValue: number
  balanceAmount: number
  pendingRechargeCount: number
  lastTradeTime: string
  remark: string
}

export type MemberCardInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  cardName: string
  cardType: string
  status: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  balanceAmount: number
  effectiveFrom: string
  effectiveTo: string
  sourceOrderBackendId?: BackendId
  remark: string
}

export type MemberBenefitInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  benefitName: string
  benefitType: string
  status: string
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  sourceType: string
  sourceBackendId?: BackendId
  expireTime: string
  remark: string
}

export type MemberCouponInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  couponName: string
  couponType: string
  status: string
  discountAmount: number
  thresholdAmount: number
  sourceType: string
  sourceBackendId?: BackendId
  expireTime: string
  remark: string
}

export type MemberPointsLedgerInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceBackendId?: BackendId
  happenedAt: string
  remark: string
}

export type MemberGrowthLedgerInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceBackendId?: BackendId
  happenedAt: string
  remark: string
}

export type MemberBalanceLedgerInfo = {
  backendId: BackendId
  customerBackendId: BackendId
  changeType: string
  changeAmount: number
  balanceAfter: number
  sourceType: string
  sourceBackendId?: BackendId
  happenedAt: string
  remark: string
}

export type NotificationTemplateInfo = {
  backendId: BackendId
  templateCode: string
  scene: string
  channelType: string
  title: string
  content: string
  providerTemplateId: string
  enabled: string
  remark: string
}

export type NotificationLogInfo = {
  backendId: BackendId
  storeName: string
  templateBackendId?: BackendId
  channelType: string
  receiver: string
  sendStatus: string
  requestId: string
  errorMessage: string
  sentTime: string
  rawPayload: string
  remark: string
}

export type OperationLogInfo = {
  backendId: BackendId
  title: string
  action: string
  operator: string
  operatorType: number
  deptName: string
  requestMethod: string
  url: string
  ip: string
  status: 'SUCCESS' | 'FAILED'
  errorMessage: string
  requestPayload: string
  responsePayload: string
  happenedAt: string
  durationMs: number
}

export type ChannelSyncLogInfo = {
  backendId: BackendId
  storeName: string
  channelType: string
  apiName: string
  requestId: string
  status: 'SUCCESS' | 'FAILED'
  errorMessage: string
  durationMs: number
  retryable: boolean
  remark: string
}

export type ChannelProductMappingInfo = {
  backendId: BackendId
  productBackendId?: BackendId
  storeBackendId?: BackendId
  storeName: string
  productName: string
  channelType: string
  externalProductId: string
  externalSkuId: string
  externalPoiId: string
  landingUrl: string
  landingPath: string
  externalName: string
  mappingStatus: string
  remark: string
  ready: boolean
}

export type DouyinAcceptanceCaseInfo = {
  caseKey: string
  label: string
  apiName: string
  publicUrl: string
  endpoint: string
  logidSource: string
  status: string
  statusText: string
  requestId: string
  success: string
  errorMessage: string
  createTime: string
  hint: string
}

export type DouyinSyncHealthInfo = {
  channelType: string
  healthStatus: string
  message: string
  failedEventCount: number
  retryableEventCount: number
  deadEventCount: number
  latestLogId: string
  latestWebhookTime: string
  latestAutoSyncTime: string
}

export type DouyinLifeOrderSyncInfo = {
  channelType: string
  syncStatus: string
  total: number
  created: number
  updated: number
  failed: number
  lastLogId: string
  message: string
  syncedAt: string
}

export type DashboardFinanceInfo = {
  date: string
  storeBackendId?: BackendId
  actualIncomeCent: number
  expectedIncomeCent: number
  productAmountCent: number
  discountAmountCent: number
  orderAmountCent: number
  refundAmountCent: number
  orderCount: number
  pendingOrderCount: number
  servingOrderCount: number
  completedOrderCount: number
  canceledOrderCount: number
}
