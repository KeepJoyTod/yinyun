import type { BackendId } from './backendId'

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

export type ResourceSizeBackfillResultDto = {
  attemptedCount: number
  updatedCount: number
  skippedCount: number
  failedCount: number
  remainingMissingSizeCount: number
  message: string
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
