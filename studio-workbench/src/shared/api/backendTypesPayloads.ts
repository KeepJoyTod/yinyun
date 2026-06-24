import type { BackendId } from './backendId'

export type ProductPayload = {
  storeId?: BackendId | null
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

export type ServiceGroupPayload = {
  id?: BackendId
  storeId: BackendId
  groupCode: string
  groupName: string
  capacity: number
  durationMinutes: number
  status: string
  sort: number
  remark: string
}

export type OrderCreatePayload = {
  customerName: string
  customerPhone: string
  customerId?: BackendId | null
  gender?: string
  email?: string
  storeId: BackendId
  serviceGroupId: BackendId
  productId?: BackendId | null
  studioId?: BackendId
  arrivalAt: string
  scheduleMode?: 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE'
  slotDate: string
  slotStartTime: string
  slotEndTime: string
  notifyEnabled?: boolean
  submitMode?: 'SAVE' | 'SAVE_AND_RECEIVE'
  payStatus?: string
  status?: string
  remark?: string
}

export type OrderStatusPayload = {
  id: BackendId
  status: string
  expectedStatus?: string
  remark?: string
}

export type OrderReschedulePayload = {
  id: BackendId
  expectedStatus: string
  arrivalTime: string
  serviceGroupId?: BackendId | null
  slotDate: string
  slotStartTime: string
  slotEndTime: string
  remark?: string
}

export type BookingInventoryUpdatePayload = {
  id: BackendId
  storeId: BackendId
  serviceGroupId?: BackendId | null
  externalSkuId?: string
  bizDate: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  remark?: string
}

export type EmployeePayload = {
  id?: BackendId
  storeId: BackendId
  userId?: BackendId | null
  employeeNo: string
  employeeName: string
  mobile?: string
  roleType?: string
  skillTags?: string
  status?: string
  sort?: number
  remark?: string
}

export type CustomerPayload = {
  id?: BackendId
  customerName: string
  mobile: string
  gender?: string
  birthday?: string
  source?: string
  memberLevel?: string
  tags?: string
  remark?: string
}

export type NotificationTemplatePayload = {
  id?: BackendId
  templateCode: string
  scene: string
  channelType: string
  title?: string
  content: string
  providerTemplateId?: string
  enabled?: string
  remark?: string
}

export type OrderListQuery = {
  pageNum?: number
  pageSize?: number
  keyword?: string
  storeId?: BackendId
  source?: string
  bookingMethod?: string
  status?: string
  payStatus?: string
  beginOrderTime?: string
  endOrderTime?: string
  beginArrivalTime?: string
  endArrivalTime?: string
  slotDate?: string
  slotStartTime?: string
  slotEndTime?: string
}

export type OrderExportQuery = OrderListQuery

export type WorkOrderDto = {
  id: BackendId
  storeId: BackendId | null
  orderNo: string
  orderId: BackendId | null
  orderType: string
  status: string
  priority: string
  handlerId: BackendId | null
  handlerName: string
  description: string
  remark: string
  createTime: string
}

export type WorkOrderEventDto = {
  id: BackendId
  workOrderId: BackendId
  eventType: string
  eventDetail: string
  operatorId: BackendId | null
  operatorName: string
  remark: string
  createTime: string
}

export type WorkOrderListQuery = {
  pageNum?: number
  pageSize?: number
  storeId?: BackendId
  orderNo?: string
  orderId?: BackendId
  orderType?: string
  status?: string
  priority?: string
  handlerId?: BackendId
}

export type WorkOrderTransitionPayload = {
  id: BackendId
  expectedStatus: string
  targetStatus: string
  remark?: string
}

export type PhotoAccessLog = {
  id: BackendId
  storeId: BackendId | null
  albumId: BackendId | null
  assetId: BackendId | null
  customerPhone: string
  platform: string
  action: string
  ip: string
  success: string
  remark: string
  createTime: string
}

export type PhotoAccessLogQuery = {
  pageNum?: number
  pageSize?: number
  albumId?: BackendId
  assetId?: BackendId
  action?: string
}

export type ReportSnapshot = {
  id: BackendId
  storeId: BackendId | null
  reportDate: string
  reportType: string
  orderTotal: number
  arrivedTotal: number
  completedTotal: number
  revenueTotal: number
  selectionTotal: number
  sourceSummary: string
  remark: string
  createTime: string
}

export type ReportSnapshotQuery = {
  pageNum?: number
  pageSize?: number
  reportType?: string
  storeId?: BackendId
  snapshotDate?: string
}
