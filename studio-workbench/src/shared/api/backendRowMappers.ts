import { normalizeBackendId, optionalBackendId } from './backendId'
import type {
  BookingInventoryDto,
  ChannelProductMappingDto,
  ChannelSyncLogDto,
  CustomerDto,
  DashboardScheduleGridDto,
  DashboardFinanceDto,
  DouyinLifeOrderSyncResult,
  EmployeeDto,
  MicroFormSubmissionDto,
  NotificationLogDto,
  NotificationTemplateDto,
  OperationLogDto,
  PhotoAccessLog,
  ReportSnapshot,
  ServiceGroupDto,
  WorkOrderDto,
  WorkOrderEventDto,
} from './backendTypes'

export const mapServiceGroupRow = (row: Record<string, any>): ServiceGroupDto => ({
  id: normalizeBackendId(row.id),
  storeId: normalizeBackendId(row.storeId),
  groupCode: String(row.groupCode ?? ''),
  groupName: String(row.groupName ?? ''),
  capacity: Number(row.capacity ?? 0),
  durationMinutes: Number(row.durationMinutes ?? 0),
  status: String(row.status ?? ''),
  sort: Number(row.sort ?? 0),
  remark: String(row.remark ?? ''),
})

export const mapBookingInventoryRow = (row: Record<string, any>): BookingInventoryDto => ({
  id: normalizeBackendId(row.id),
  storeId: normalizeBackendId(row.storeId),
  serviceGroupId: optionalBackendId(row.serviceGroupId) ?? null,
  externalSkuId: String(row.externalSkuId ?? ''),
  bizDate: String(row.bizDate ?? ''),
  startTime: String(row.startTime ?? ''),
  endTime: String(row.endTime ?? ''),
  capacity: Number(row.capacity ?? 0),
  paidCount: Number(row.paidCount ?? 0),
  conflictCount: Number(row.conflictCount ?? 0),
  status: String(row.status ?? ''),
  remark: String(row.remark ?? ''),
})

export const mapEmployeeRow = (row: Record<string, any>): EmployeeDto => ({
  id: normalizeBackendId(row.id),
  storeId: normalizeBackendId(row.storeId),
  userId: optionalBackendId(row.userId) ?? null,
  employeeNo: String(row.employeeNo ?? ''),
  employeeName: String(row.employeeName ?? ''),
  mobile: String(row.mobile ?? ''),
  roleType: String(row.roleType ?? ''),
  skillTags: String(row.skillTags ?? ''),
  status: String(row.status ?? ''),
  sort: Number(row.sort ?? 0),
  remark: String(row.remark ?? ''),
})

export const mapCustomerRow = (row: Record<string, any>): CustomerDto => ({
  id: normalizeBackendId(row.id),
  customerName: String(row.customerName ?? ''),
  mobile: String(row.mobile ?? ''),
  gender: String(row.gender ?? ''),
  birthday: String(row.birthday ?? ''),
  source: String(row.source ?? ''),
  memberLevel: String(row.memberLevel ?? ''),
  totalOrderCount: Number(row.totalOrderCount ?? 0),
  totalSpendAmount: Number(row.totalSpend ?? 0),
  lastOrderTime: String(row.lastOrderTime ?? ''),
  tags: String(row.tags ?? ''),
  remark: String(row.remark ?? ''),
})

export const mapNotificationTemplateRow = (row: Record<string, any>): NotificationTemplateDto => ({
  id: normalizeBackendId(row.id),
  templateCode: String(row.templateCode ?? ''),
  scene: String(row.scene ?? ''),
  channelType: String(row.channelType ?? ''),
  title: String(row.title ?? ''),
  content: String(row.content ?? ''),
  providerTemplateId: String(row.providerTemplateId ?? ''),
  enabled: String(row.enabled ?? ''),
  remark: String(row.remark ?? ''),
})

export const mapNotificationLogRow = (row: Record<string, any>): NotificationLogDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  orderId: optionalBackendId(row.orderId) ?? null,
  customerId: optionalBackendId(row.customerId) ?? null,
  templateId: optionalBackendId(row.templateId) ?? null,
  channelType: String(row.channelType ?? ''),
  receiver: String(row.receiver ?? ''),
  sendStatus: String(row.sendStatus ?? ''),
  requestId: String(row.requestId ?? ''),
  errorMessage: String(row.errorMessage ?? ''),
  sentTime: String(row.sentTime ?? ''),
  rawPayload: String(row.rawPayload ?? ''),
  remark: String(row.remark ?? ''),
})

export const mapOperationLogRow = (row: Record<string, any>): OperationLogDto => ({
  operId: normalizeBackendId(row.operId ?? row.id),
  tenantId: String(row.tenantId ?? ''),
  title: String(row.title ?? ''),
  businessType: Number(row.businessType ?? 0),
  method: String(row.method ?? ''),
  requestMethod: String(row.requestMethod ?? ''),
  operatorType: Number(row.operatorType ?? 0),
  operName: String(row.operName ?? ''),
  deptName: String(row.deptName ?? ''),
  operUrl: String(row.operUrl ?? ''),
  operIp: String(row.operIp ?? ''),
  operLocation: String(row.operLocation ?? ''),
  operParam: String(row.operParam ?? ''),
  jsonResult: String(row.jsonResult ?? ''),
  status: Number(row.status ?? 0),
  errorMsg: String(row.errorMsg ?? ''),
  operTime: String(row.operTime ?? row.createTime ?? ''),
  costTime: Number(row.costTime ?? 0),
})

export const mapChannelSyncLogRow = (row: Record<string, any>): ChannelSyncLogDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  channelType: String(row.channelType ?? ''),
  apiName: String(row.apiName ?? ''),
  requestId: String(row.requestId ?? ''),
  success: String(row.success ?? ''),
  errorMessage: String(row.errorMessage ?? ''),
  durationMs: Number(row.durationMs ?? 0),
  retryable: String(row.retryable ?? ''),
  remark: String(row.remark ?? ''),
  tenantId: String(row.tenantId ?? ''),
})

export const mapChannelProductMappingRow = (row: Record<string, any>): ChannelProductMappingDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  productId: normalizeBackendId(row.productId),
  channelType: String(row.channelType ?? ''),
  externalProductId: String(row.externalProductId ?? ''),
  externalSkuId: String(row.externalSkuId ?? ''),
  externalPoiId: String(row.externalPoiId ?? ''),
  landingUrl: String(row.landingUrl ?? ''),
  landingPath: String(row.landingPath ?? ''),
  externalName: String(row.externalName ?? ''),
  mappingStatus: String(row.mappingStatus ?? ''),
  remark: String(row.remark ?? ''),
  tenantId: String(row.tenantId ?? ''),
})

export const mapPhotoAccessLogRow = (row: Record<string, any>): PhotoAccessLog => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  albumId: optionalBackendId(row.albumId) ?? null,
  assetId: optionalBackendId(row.assetId) ?? null,
  customerPhone: String(row.customerPhone ?? ''),
  platform: String(row.platform ?? ''),
  action: String(row.action ?? ''),
  ip: String(row.ip ?? ''),
  success: String(row.success ?? ''),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
})

export const mapReportSnapshotRow = (row: Record<string, any>): ReportSnapshot => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  reportDate: String(row.reportDate ?? ''),
  reportType: String(row.reportType ?? ''),
  orderTotal: Number(row.orderTotal ?? 0),
  arrivedTotal: Number(row.arrivedTotal ?? 0),
  completedTotal: Number(row.completedTotal ?? 0),
  revenueTotal: Number(row.revenueTotal ?? 0),
  selectionTotal: Number(row.selectionTotal ?? 0),
  sourceSummary: String(row.sourceSummary ?? ''),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
})

export const mapWorkOrderRow = (row: Record<string, any>): WorkOrderDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  orderNo: String(row.orderNo ?? ''),
  orderId: optionalBackendId(row.orderId) ?? null,
  orderType: String(row.orderType ?? ''),
  status: String(row.status ?? ''),
  priority: String(row.priority ?? ''),
  handlerId: optionalBackendId(row.handlerId) ?? null,
  handlerName: String(row.handlerName ?? ''),
  description: String(row.description ?? ''),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
})

export const mapWorkOrderEventRow = (row: Record<string, any>): WorkOrderEventDto => ({
  id: normalizeBackendId(row.id),
  workOrderId: normalizeBackendId(row.workOrderId),
  eventType: String(row.eventType ?? ''),
  eventDetail: String(row.eventDetail ?? ''),
  operatorId: optionalBackendId(row.operatorId) ?? null,
  operatorName: String(row.operatorName ?? ''),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
})

export const mapMicroFormSubmissionRow = (row: Record<string, any>): MicroFormSubmissionDto => ({
  id: normalizeBackendId(row.id),
  formId: normalizeBackendId(row.formId),
  formNameSnapshot: String(row.formNameSnapshot ?? ''),
  customerName: String(row.customerName ?? ''),
  customerPhone: String(row.customerPhone ?? ''),
  submittedAt: String(row.submittedAt ?? ''),
  followStatus: String(row.followStatus ?? 'PENDING'),
  followRemark: String(row.followRemark ?? ''),
  answers: (() => {
    try { return JSON.parse(String(row.answersJson || '{}')) as Record<string, unknown> } catch { return {} }
  })(),
  answersJson: String(row.answersJson ?? '{}'),
  orderId: optionalBackendId(row.orderId) ?? null,
  remark: String(row.remark ?? ''),
  storeId: optionalBackendId(row.storeId) ?? null,
  serviceGroupId: optionalBackendId(row.serviceGroupId) ?? null,
  sourceCode: String(row.sourceCode ?? ''),
  sourcePath: String(row.sourcePath ?? ''),
  qrScene: String(row.qrScene ?? ''),
  assignee: String(row.assignee ?? ''),
  followTimeline: (() => {
    try { return JSON.parse(String(row.followTimelineJson || '[]')) as Array<{ at: string; action: string; operator?: string; remark?: string }> } catch { return [] }
  })(),
  duplicateCustomerHint: String(row.duplicateCustomerHint ?? ''),
})

export const mapDouyinLifeSyncResult = (row: Record<string, any>): DouyinLifeOrderSyncResult => ({
  channelType: String(row.channelType ?? 'DOUYIN_LIFE'),
  syncStatus: String(row.syncStatus ?? ''),
  total: Number(row.total ?? 0),
  created: Number(row.created ?? 0),
  updated: Number(row.updated ?? 0),
  failed: Number(row.failed ?? 0),
  lastLogId: String(row.lastLogId ?? ''),
  message: String(row.message ?? ''),
})

export const mapDashboardFinanceRow = (row: Record<string, any>): DashboardFinanceDto => ({
  date: String(row.date ?? ''),
  storeId: optionalBackendId(row.storeId) ?? null,
  actualIncomeCent: Number(row.actualIncomeCent ?? 0),
  expectedIncomeCent: Number(row.expectedIncomeCent ?? 0),
  productAmountCent: Number(row.productAmountCent ?? 0),
  discountAmountCent: Number(row.discountAmountCent ?? 0),
  orderAmountCent: Number(row.orderAmountCent ?? 0),
  refundAmountCent: Number(row.refundAmountCent ?? 0),
  orderCount: Number(row.orderCount ?? 0),
  pendingOrderCount: Number(row.pendingOrderCount ?? 0),
  servingOrderCount: Number(row.servingOrderCount ?? 0),
  completedOrderCount: Number(row.completedOrderCount ?? 0),
  canceledOrderCount: Number(row.canceledOrderCount ?? 0),
})

export const mapScheduleGridRow = (row: Record<string, any>): DashboardScheduleGridDto => {
  const source = row.slotsByDate && typeof row.slotsByDate === 'object'
    ? row.slotsByDate as Record<string, any[]>
    : {}
  const slotsByDate = Object.fromEntries(
    Object.entries(source).map(([date, slots]) => [
      date,
      Array.isArray(slots)
        ? slots.map((slot: Record<string, any>) => ({
            id: normalizeBackendId(slot.id),
            storeId: normalizeBackendId(slot.storeId),
            bizDate: String(slot.bizDate ?? date),
            startTime: String(slot.startTime ?? ''),
            endTime: String(slot.endTime ?? ''),
            capacity: Number(slot.capacity ?? 0),
            paidCount: Number(slot.paidCount ?? 0),
            conflictCount: Number(slot.conflictCount ?? 0),
            remainCount: Number(slot.remainCount ?? 0),
            slotStatus: String(slot.slotStatus ?? 'SLOT_EMPTY'),
            orders: Array.isArray(slot.orders)
              ? slot.orders.map((order: Record<string, any>) => ({
                  orderId: normalizeBackendId(order.orderId),
                  orderNo: String(order.orderNo ?? ''),
                  customerName: String(order.customerName ?? ''),
                  status: String(order.status ?? ''),
                  paidAmountCent: Number(order.paidAmountCent ?? 0),
                  source: String(order.source ?? ''),
                }))
              : [],
          }))
        : [],
    ]),
  )
  return {
    storeId: optionalBackendId(row.storeId) ?? null,
    dates: Array.isArray(row.dates) ? row.dates.map((date: unknown) => String(date ?? '')) : [],
    slotsByDate,
  }
}

