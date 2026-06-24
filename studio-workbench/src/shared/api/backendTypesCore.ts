import type { BackendId } from './backendId'

export type StoreDto = {
  id: BackendId
  storeCode: string
  name: string
  status: string
  managerName: string
  address: string
  phone: string
  openTime: string
  closeTime: string
  monthlyOrders: number
  pendingOrders: number
}

export type ProductDto = {
  id: BackendId
  storeId?: BackendId | null
  storeName?: string
  rawProductType?: string
  albumProductName?: string
  productCode: string
  name: string
  coverUrl: string | null
  spec: string
  priceCents: number
  unitPriceCents: number
  includedCount: number
  active: boolean
  description: string
}

export type ServiceGroupDto = {
  id: BackendId
  storeId: BackendId
  groupCode: string
  groupName: string
  capacity: number
  durationMinutes: number
  status: string
  sort: number
  remark: string
}

export type BookingInventoryDto = {
  id: BackendId
  storeId: BackendId
  serviceGroupId: BackendId | null
  externalSkuId: string
  bizDate: string
  startTime: string
  endTime: string
  capacity: number
  paidCount: number
  conflictCount: number
  status: string
  remark: string
}

export type EmployeeDto = {
  id: BackendId
  storeId: BackendId
  userId: BackendId | null
  employeeNo: string
  employeeName: string
  mobile: string
  roleType: string
  skillTags: string
  status: string
  sort: number
  remark: string
}

export type CustomerDto = {
  id: BackendId
  customerName: string
  mobile: string
  gender: string
  birthday: string
  source: string
  memberLevel: string
  totalOrderCount: number
  totalSpendAmount: number
  lastOrderTime: string
  tags: string
  remark: string
}

export type NotificationTemplateDto = {
  id: BackendId
  templateCode: string
  scene: string
  channelType: string
  title: string
  content: string
  providerTemplateId: string
  enabled: string
  remark: string
}

export type NotificationLogDto = {
  id: BackendId
  storeId: BackendId | null
  orderId: BackendId | null
  customerId: BackendId | null
  templateId: BackendId | null
  channelType: string
  receiver: string
  sendStatus: string
  requestId: string
  errorMessage: string
  sentTime: string
  rawPayload: string
  remark: string
}

export type OperationLogDto = {
  operId: BackendId
  tenantId: string
  title: string
  businessType: number
  method: string
  requestMethod: string
  operatorType: number
  operName: string
  deptName: string
  operUrl: string
  operIp: string
  operLocation: string
  operParam: string
  jsonResult: string
  status: number
  errorMsg: string
  operTime: string
  costTime: number
}

export type ChannelSyncLogDto = {
  id: BackendId
  storeId: BackendId | null
  channelType: string
  apiName: string
  requestId: string
  success: string
  errorMessage: string
  durationMs: number
  retryable: string
  remark: string
  tenantId: string
}

export type ChannelProductMappingDto = {
  id: BackendId
  storeId: BackendId | null
  productId: BackendId
  channelType: string
  externalProductId: string
  externalSkuId: string
  externalPoiId: string
  landingUrl: string
  landingPath: string
  externalName: string
  mappingStatus: string
  remark: string
  tenantId: string
}

export type ChannelAcceptanceCaseDto = {
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

export type ChannelSyncHealthDto = {
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

export type DouyinLifeOrderSyncQuery = {
  storeId?: BackendId
  orderId?: string
  outOrderNo?: string
  orderStatus?: string
  startTime?: string
  endTime?: string
  pageNum?: number
  pageSize?: number
  maxPages?: number
  maxTotal?: number
  useTestDataHeader?: boolean
}

export type DouyinLifeOrderSyncResult = {
  channelType: string
  syncStatus: string
  total: number
  created: number
  updated: number
  failed: number
  lastLogId: string
  message: string
}

export type DashboardFinanceDto = {
  date: string
  storeId: BackendId | null
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

export type ScheduleGridOrderSummaryDto = {
  orderId: BackendId
  orderNo: string
  customerName: string
  status: string
  paidAmountCent: number
  source: string
}

export type ScheduleGridSlotDto = {
  id: BackendId
  storeId: BackendId
  bizDate: string
  startTime: string
  endTime: string
  capacity: number
  paidCount: number
  conflictCount: number
  remainCount: number
  slotStatus: string
  orders: ScheduleGridOrderSummaryDto[]
}

export type DashboardScheduleGridDto = {
  storeId: BackendId | null
  dates: string[]
  slotsByDate: Record<string, ScheduleGridSlotDto[]>
}

export type OrderDto = {
  id: BackendId
  orderNo: string
  customerName: string
  customerPhone: string
  storeId: BackendId
  productId: BackendId | null
  serviceGroupId?: BackendId | null
  inventorySlotId?: BackendId | null
  serviceNameSnapshot: string
  channelType?: string
  source: string | null
  serviceMethod: string | null
  orderAt: string
  arrivalAt: string
  status: string
  paymentStatus: string
  amountCents: number
  refundStatus?: string
  refundAmountCent?: number
  externalProductId?: string
  externalSkuId?: string
  externalPoiId?: string
  slotDate?: string
  slotStartTime?: string
  slotEndTime?: string
  inventoryStatus?: string
  conflictReason?: string
  remark: string | null
}

export type AlbumPhotoDto = {
  id: BackendId
  albumId: BackendId
  fileId: BackendId
  originalName: string
  displayName: string
  sortOrder: number
  selected: boolean
  url: string | null
  uploadedAt: string
}

export type AlbumDto = {
  id: BackendId
  albumNo: string
  orderId: BackendId | null
  customerName: string
  serviceName: string
  shootDate: string
  photographer: string
  status: string
  selectedCount: number
  totalCount: number
  photos: AlbumPhotoDto[]
}

export type ResourceTagDto = {
  id: BackendId
  storeId: BackendId | null
  storeName: string
  tagName: string
  resourceCount: number
  createBy: BackendId | null
  createTime: string
}

export type ResourceTagOptionDto = {
  id: BackendId
  tagName: string
}

export type ResourceRowDto = {
  assetId: BackendId
  albumId: BackendId | null
  storeId: BackendId | null
  storeName: string
  orderId: BackendId | null
  productId: BackendId | null
  productName: string
  fileName: string
  fileUrl: string | null
  thumbnailUrl: string | null
  assetType: string
  rating: number
  visible: boolean
  fileSizeBytes: number
  tagList: ResourceTagOptionDto[]
  customerName: string
  customerPhoneMasked: string
  albumName: string
  uploadedAt: string
  uploaderId: BackendId | null
  uploaderName: string
}

export type ResourceUsageBreakdownDto = {
  assetType: string
  assetCount: number
  totalBytes: number
}

export type ResourceUsageSummaryDto = {
  totalQuotaBytes: number
  usedBytes: number
  remainingBytes: number
  usagePercent: number
  missingSizeCount: number
  cleanupPlanEnabled: boolean
  cleanupRetentionDays: number
  quotaConfigKey: string
  cleanupPlanConfigKey: string
  cleanupRetentionConfigKey: string
  typeBreakdown: ResourceUsageBreakdownDto[]
}

export type SelectionLinkDto = {
  id: BackendId
  token: string
  orderId: BackendId | null
  albumId: BackendId
  customerName: string
  customerPhone: string
  product: string
  selectedCount: number
  extraCount: number
  visits: number
  expireAt: string
  status: string
  publicUrl: string
}

export type StudioDto = {
  id: BackendId
  storeId: BackendId
  name: string
  status: string
}

export type ScheduleItemDto = {
  bookingId: BackendId
  orderId: BackendId
  storeId: BackendId
  studioId: BackendId
  studioName: string
  startAt: string
  endAt: string
  bookingStatus: string
  orderNo: string
  customerName: string
  customerPhone: string
  serviceName: string
  orderStatus: string
}

export type OrderStatusStatDto = {
  status: string
  label: string
  count: number
  amountCents: number
}

export type TrendStatDto = {
  day: string
  bookedCount: number
  arrivedCount: number
  amountCents: number
}

export type TodaySlotDto = {
  bookingId: BackendId
  storeId: BackendId
  storeName: string
  studioId: BackendId
  studioName: string
  startAt: string
  endAt: string
  bookingStatus: string
  orderId: BackendId
  orderNo: string
  customerName: string
  customerPhone?: string
  serviceName?: string
  orderStatus: string
}

export type SelectionStatsDto = {
  activeCount: number
  newLast7DaysCount: number
  completedCount: number
  completedThisMonthCount: number
  averageSelectionMinutes: number
  extraConversionRate: number
  averageExtraCount: number
  monthExtraRevenueCents: number
}

export type WorkbenchBootstrapDto = {
  identity: {
    userId: string
    username?: string
    nickname?: string
    employeeId?: string
    employeeNo?: string
    employeeName?: string
    roleType?: string
    storeId?: string
  }
  globalStoreScope: boolean
  stores: {
    storeId: string
    storeCode: string
    storeName: string
    status: string
    roleType?: string
    primary?: boolean
  }[]
  menuPermissions: string[]
  menuPermissionDetails?: {
    permission: string
    label: string
    path: string
    group: string
  }[]
  rolePermissions: string[]
  featureStatuses: Record<string, 'ready' | 'building' | 'hidden'>
  pending: {
    pendingOrders: number
    todayArrivals: number
    inventoryConflicts: number
    activeSelections: number
  }
}

export type RetouchTaskDto = {
  id: BackendId
  tenantId: string
  storeId: BackendId | null
  storeName: string
  orderId: BackendId | null
  orderNo: string
  albumId: BackendId | null
  albumName: string
  providerId: BackendId | null
  providerName: string
  taskNo: string
  status: string
  acceptanceStatus: string
  quoteAmountCent: number
  dueTime: string
  submittedTime: string
  completedTime: string
  sourceStage: string
  customerName: string
  serviceName: string
  blockReason: string
  remark: string
  createTime: string
  updateTime: string
}

export type RetouchTaskListQuery = {
  storeId?: BackendId
  providerId?: BackendId
  status?: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

export type RetouchTaskActionPayload = {
  id: BackendId
  providerId?: BackendId | null
  quoteAmountCent?: number
  dueTime?: string
  status?: string
  acceptanceStatus?: string
  blockReason?: string
  remark?: string
}

export type RetouchProviderDto = {
  id: BackendId
  tenantId: string
  providerCode: string
  providerName: string
  contactName: string
  contactPhone: string
  supportedStoreIds: string
  serviceScope: string
  quoteMode: string
  settlementMode: string
  applicationStatus: string
  status: string
  ratingScore: number
  slaHours: number
  remark: string
  createTime: string
  updateTime: string
}

export type RetouchProviderListQuery = {
  keyword?: string
  applicationStatus?: string
  status?: string
}

export type RetouchProviderPayload = {
  id?: BackendId
  providerCode: string
  providerName: string
  contactName?: string
  contactPhone?: string
  supportedStoreIds?: string
  serviceScope?: string
  quoteMode?: string
  settlementMode?: string
  applicationStatus?: string
  status?: string
  ratingScore?: number
  slaHours?: number
  remark?: string
}

export type CollaborationPolicyDto = {
  id?: BackendId
  tenantId: string
  policyCode: string
  reviewFlowEnabled: string
  productInfoMaskMode: string
  enabledStoreIds: string
  fallbackAction: string
  transferEnabled: string
  autoDispatchMode: string
  genderMakeupEnabled: string
  femaleMakeupRatio: number
  remark: string
  createTime: string
  updateTime: string
}

export type CollaborationPolicyPayload = {
  id?: BackendId
  policyCode?: string
  reviewFlowEnabled?: string
  productInfoMaskMode?: string
  enabledStoreIds?: string
  fallbackAction?: string
  transferEnabled?: string
  autoDispatchMode?: string
  genderMakeupEnabled?: string
  femaleMakeupRatio?: number
  remark?: string
}

export type ServiceLicenseBindingDto = {
  id: BackendId
  tenantId: string
  licenseKey: string
  planName: string
  status: string
  expireTime: string
  boundStoreIds: string
  seatCount: number
  activatedTime: string
  renewAction: string
  remark: string
  createTime: string
  updateTime: string
}

export type ServiceLicenseBindingPayload = {
  id?: BackendId
  licenseKey: string
  planName?: string
  status?: string
  expireTime?: string
  boundStoreIds?: string
  seatCount?: number
  activatedTime?: string
  renewAction?: string
  remark?: string
}
