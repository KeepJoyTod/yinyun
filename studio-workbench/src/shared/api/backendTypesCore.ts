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
  serviceMode: 'HORIZONTAL' | 'VERTICAL' | string
  status: string
  sort: number
  remark: string
}

export type OrderAttributeFieldType = 'TEXT' | 'TEXTAREA' | 'PHONE' | 'DATE' | 'NUMBER' | 'SELECT' | 'CHECKBOX'

export type OrderAttributeValueDto = {
  fieldCode: string
  fieldLabel: string
  fieldType: OrderAttributeFieldType | string
  required: boolean
  options: string[]
  sort: number
  value: string | string[] | null
}

export type OrderAttributeTemplateDto = {
  id: BackendId
  storeId: BackendId
  fieldCode: string
  fieldLabel: string
  fieldType: OrderAttributeFieldType | string
  required: string
  optionsJson: string
  options: string[]
  sort: number
  status: string
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

export type RiskApprovalDto = {
  id: BackendId
  tenantId?: string
  storeId: BackendId | null
  businessType: 'SLOT_CLOSE_WITH_PAID_ORDER' | 'ORDER_REFUND' | 'MEMBER_RECHARGE_CONFIRM' | string
  businessId: BackendId | null
  businessNo: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | string
  title: string
  reason: string
  payloadJson: string
  applicantUserId: BackendId | null
  applicantName: string
  approverUserId: BackendId | null
  approverName: string
  approveTime: string
  rejectReason: string
  resultSummary: string
  createTime: string
  updateTime: string
}

export type ScheduleGovernancePreviewDto = {
  affectedSlotCount: number
  paidSlotCount: number
  conflictSlotCount: number
  approvalRequired: boolean
  message: string
  approval: RiskApprovalDto | null
  slots: BookingInventoryDto[]
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
  orderAttributeJson?: string
  orderAttributes?: OrderAttributeValueDto[]
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
