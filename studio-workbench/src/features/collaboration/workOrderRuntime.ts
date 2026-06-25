import type { BackendId, CollaborationStageCode, WorkOrderDto, WorkOrderTransitionPayload } from '../../shared/api/backend'
import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'
import { collaborationStageOptions, defaultPositionConfig } from './collaborationSettings'

export type CollaborationWorkOrderStatusCode = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED' | 'OTHER'
export type CollaborationWorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type CollaborationWorkOrderExecution = {
  businessDate: string
  dueAt: string
  dueLabel: string
  owner: string
  progress: number
  overdue: boolean
  nextAction: string
  statusLabel: string
}

export type CollaborationWorkOrderItem = {
  id: string
  backendId: BackendId
  workOrderNo: string
  order: BookingOrder
  album?: Album
  selectionLink?: SelectionLink
  stage: CollaborationStageCode
  stageLabel: string
  orderType: string
  status: string
  statusCode: CollaborationWorkOrderStatusCode
  priority: CollaborationWorkOrderPriority
  priorityLabel: string
  assignee: string
  blockReason: string
  primaryActionLabel: string
  canTransition: boolean
  actionPath: string
  execution: CollaborationWorkOrderExecution
}

type BuildInput = {
  workOrders: WorkOrderDto[]
  orders: BookingOrder[]
  albums: Album[]
  selectionLinks: SelectionLink[]
  now?: Date
}

const stageLabelMap = Object.fromEntries(
  collaborationStageOptions.map(option => [option.code, option.label]),
) as Record<CollaborationStageCode, string>

const stageSlaHours = Object.fromEntries(
  defaultPositionConfig().map(item => [item.code, item.slaHours]),
) as Record<CollaborationStageCode, number>

const stageSequence: CollaborationStageCode[] = collaborationStageOptions.map(option => option.code)
const stageCodeSet = new Set<CollaborationStageCode>(stageSequence)

const stageOwnerMap: Record<CollaborationStageCode, string> = {
  RECEPTION: '接待',
  MAKEUP: '化妆',
  PHOTOGRAPHY: '摄影',
  RETOUCH: '修图',
  REVIEW: '审片',
  SELECTION_REVIEW: '看片',
  PICKUP: '取件',
}

const priorityLabelMap: Record<CollaborationWorkOrderPriority, string> = {
  LOW: '低优先级',
  MEDIUM: '中优先级',
  HIGH: '高优先级',
  URGENT: '紧急',
}

const statusLabelMap: Record<CollaborationWorkOrderStatusCode, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  BLOCKED: '阻塞',
  OTHER: '待同步',
}

const progressSeed: Record<CollaborationStageCode, number> = {
  RECEPTION: 12,
  MAKEUP: 24,
  PHOTOGRAPHY: 36,
  RETOUCH: 62,
  REVIEW: 74,
  SELECTION_REVIEW: 84,
  PICKUP: 92,
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const matchesAlbum = (album: Album, order: BookingOrder) =>
  album.orderBackendId === order.backendId || album.orderId === order.id

const matchesSelection = (link: SelectionLink, order: BookingOrder, album?: Album) =>
  link.orderBackendId === order.backendId
  || link.orderId === order.id
  || (album != null && (link.albumBackendId === album.backendId || link.albumId === album.id))

const parseDate = (value: string | undefined | null) => {
  if (!value) return null
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value
  const next = new Date(normalized)
  return Number.isNaN(next.getTime()) ? null : next
}

const formatDateTime = (value: Date) => `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}T${pad2(value.getHours())}:${pad2(value.getMinutes())}:00`

const formatDueLabel = (value: Date) => `${pad2(value.getMonth() + 1)}-${pad2(value.getDate())} ${pad2(value.getHours())}:${pad2(value.getMinutes())} 前`

const addHours = (value: Date, hours: number) => new Date(value.getTime() + hours * 60 * 60 * 1000)

const resolveStatusCode = (workOrder: WorkOrderDto): CollaborationWorkOrderStatusCode => {
  const normalized = String(workOrder.status ?? '').trim().toUpperCase()
  if (normalized === 'PENDING') return 'PENDING'
  if (normalized === 'IN_PROGRESS') return 'IN_PROGRESS'
  if (normalized === 'COMPLETED') return 'COMPLETED'
  if (normalized === 'CANCELLED') return 'CANCELLED'
  if (normalized === 'BLOCKED') return 'BLOCKED'
  return 'OTHER'
}

const resolvePriority = (workOrder: WorkOrderDto): CollaborationWorkOrderPriority => {
  const normalized = String(workOrder.priority ?? '').trim().toUpperCase()
  if (normalized === 'LOW') return 'LOW'
  if (normalized === 'HIGH') return 'HIGH'
  if (normalized === 'URGENT') return 'URGENT'
  return 'MEDIUM'
}

const normalizeStageCode = (value: string | undefined | null): CollaborationStageCode | null => {
  const normalized = String(value ?? '').trim().toUpperCase() as CollaborationStageCode
  return stageCodeSet.has(normalized) ? normalized : null
}

const resolveStage = (workOrder: WorkOrderDto): CollaborationStageCode => {
  const explicitStage = normalizeStageCode(workOrder.stageCode)
  if (explicitStage) return explicitStage
  const text = `${workOrder.orderType} ${workOrder.description} ${workOrder.remark}`.toUpperCase()
  if (text.includes('MAKEUP') || text.includes('化妆')) return 'MAKEUP'
  if (text.includes('REVIEW') || text.includes('审片')) return 'REVIEW'
  if (text.includes('SELECTION') || text.includes('选片') || text.includes('看片')) return 'SELECTION_REVIEW'
  if (text.includes('RETOUCH') || text.includes('修图')) return 'RETOUCH'
  if (text.includes('DELIVERY') || text.includes('PICKUP') || text.includes('取件') || text.includes('交付')) return 'PICKUP'
  if (text.includes('PHOTO') || text.includes('SHOOT') || text.includes('UPLOAD') || text.includes('摄影') || text.includes('拍摄')) return 'PHOTOGRAPHY'
  return 'RECEPTION'
}

const resolveShadowOrder = (workOrder: WorkOrderDto): BookingOrder => ({
  backendId: (workOrder.orderId ?? workOrder.id) as BackendId,
  storeBackendId: (workOrder.storeId ?? workOrder.id) as BackendId,
  productBackendId: undefined,
  serviceGroupBackendId: undefined,
  inventorySlotId: undefined,
  id: workOrder.orderNo || `WO-${workOrder.id}`,
  customer: '',
  phone: '',
  store: workOrder.storeId ? `门店 ${workOrder.storeId}` : '待补门店',
  service: workOrder.description || '待补服务',
  source: 'WORK_ORDER',
  method: 'INTERNAL',
  channelType: undefined,
  externalProductId: undefined,
  externalPoiId: undefined,
  remark: workOrder.remark,
  orderTime: workOrder.createTime || '',
  orderDate: workOrder.createTime.slice(0, 10) || '',
  orderClock: workOrder.createTime.slice(11, 16) || '10:00',
  arrivalTime: workOrder.createTime || '',
  status: '已确认',
  payment: '已支付',
  amount: 0,
  refundStatus: undefined,
  refundAmountCent: undefined,
  arrivalDate: workOrder.createTime.slice(0, 10) || '',
  arrivalClock: workOrder.createTime.slice(11, 16) || '10:00',
  externalSkuId: undefined,
  inventoryStatus: undefined,
  conflictReason: undefined,
})

const resolveOrder = (workOrder: WorkOrderDto, orders: BookingOrder[]) =>
  orders.find(item => item.backendId === workOrder.orderId)
  ?? orders.find(item => item.id === workOrder.orderNo)
  ?? resolveShadowOrder(workOrder)

const resolveExecutionBaseTime = (workOrder: WorkOrderDto, order: BookingOrder, album?: Album) =>
  parseDate(workOrder.createTime)
  ?? parseDate(order.arrivalTime)
  ?? parseDate(`${album?.date || order.arrivalDate || order.orderDate || new Date().toISOString().slice(0, 10)}T${order.arrivalClock || order.orderClock || '10:00'}:00`)
  ?? new Date()

const resolveBusinessDate = (workOrder: WorkOrderDto, order: BookingOrder, album?: Album) =>
  album?.date
  || order.arrivalDate
  || order.orderDate
  || workOrder.dueTime?.slice(0, 10)
  || workOrder.createTime.slice(0, 10)
  || new Date().toISOString().slice(0, 10)

const resolveExecution = (
  workOrder: WorkOrderDto,
  stage: CollaborationStageCode,
  order: BookingOrder,
  album: Album | undefined,
  selectionLink: SelectionLink | undefined,
  statusCode: CollaborationWorkOrderStatusCode,
  now: Date,
): CollaborationWorkOrderExecution => {
  const baseTime = resolveExecutionBaseTime(workOrder, order, album)
  const businessDate = resolveBusinessDate(workOrder, order, album)
  const explicitDue = parseDate(workOrder.dueTime)
  const due = explicitDue ?? (stage === 'SELECTION_REVIEW' && selectionLink?.expire
    ? parseDate(`${baseTime.getFullYear()}-${selectionLink.expire}T23:59:00`) ?? addHours(baseTime, stageSlaHours[stage])
    : addHours(baseTime, stageSlaHours[stage]))
  const overdue = !['COMPLETED', 'CANCELLED'].includes(statusCode) && due.getTime() < now.getTime()
  const progress = statusCode === 'COMPLETED'
    ? 100
    : statusCode === 'CANCELLED'
      ? 0
      : Math.min(96, progressSeed[stage] + (statusCode === 'IN_PROGRESS' ? 14 : 0))

  const nextActionMap: Record<CollaborationStageCode, string> = {
    RECEPTION: '核对预约信息并把工单分派到下一岗位。',
    MAKEUP: '确认化妆准备状态，完成后流转到摄影。',
    PHOTOGRAPHY: String(workOrder.orderType ?? '').toUpperCase().includes('UPLOAD')
      ? '补齐底片上传和素材归档，再继续后续协作。'
      : '推进摄影执行并同步客片素材状态。',
    RETOUCH: '安排修图处理，完成后交由审片复核。',
    REVIEW: '复核修图结果，确认后进入客户看片或交付。',
    SELECTION_REVIEW: selectionLink
      ? '跟进客户完成选片，必要时重新发送入口。'
      : '补生成选片链接并通知客户。',
    PICKUP: '确认交付或取件准备，完成后闭环工单。',
  }

  return {
    businessDate,
    dueAt: formatDateTime(due),
    dueLabel: formatDueLabel(due),
    owner: workOrder.handlerName || stageOwnerMap[stage],
    progress,
    overdue,
    nextAction: statusCode === 'BLOCKED'
      ? '先解除阻塞原因，再恢复当前工单处理。'
      : statusCode === 'COMPLETED'
        ? '当前工单已完成，可进入关联页面复核结果。'
        : statusCode === 'CANCELLED'
          ? '当前工单已取消，如需恢复请回到关联业务页面确认。'
          : nextActionMap[stage],
    statusLabel: statusLabelMap[statusCode],
  }
}

const resolveBlockReason = (
  workOrder: WorkOrderDto,
  stage: CollaborationStageCode,
  order: BookingOrder,
  album: Album | undefined,
  selectionLink: SelectionLink | undefined,
  statusCode: CollaborationWorkOrderStatusCode,
) => {
  if (statusCode !== 'BLOCKED') return ''
  if (workOrder.remark) return workOrder.remark
  if (workOrder.description) return workOrder.description
  if (!order.customer || !order.phone) return '客户资料不完整，请先补齐订单联系人信息。'
  if (stage === 'SELECTION_REVIEW' && !selectionLink) return '选片入口缺失，请先生成或重新发送选片链接。'
  if ((stage === 'RETOUCH' || stage === 'REVIEW' || stage === 'PICKUP') && !album) return '客片相册尚未建立，无法继续后续协作。'
  return '当前工单已被标记为阻塞，请先核对处理备注。'
}

const resolveActionPath = (
  stage: CollaborationStageCode,
  order: BookingOrder,
  album?: Album,
  selectionLink?: SelectionLink,
) => {
  if (stage === 'SELECTION_REVIEW') {
    return selectionLink
      ? `/service/selection?open=${encodeURIComponent(selectionLink.id)}`
      : `/service/photos?album=${encodeURIComponent(album?.id || '')}`
  }
  if (stage === 'RETOUCH' || stage === 'REVIEW' || stage === 'PICKUP') {
    return `/service/photos?album=${encodeURIComponent(album?.id || '')}`
  }
  return order.id
    ? `/order/appointment?q=${encodeURIComponent(order.id)}&quick=all`
    : '/collaboration/work-orders'
}

const resolvePrimaryActionLabel = (
  workOrder: WorkOrderDto,
  stage: CollaborationStageCode,
  statusCode: CollaborationWorkOrderStatusCode,
) => {
  if (statusCode === 'BLOCKED') return '恢复处理'
  if (statusCode === 'IN_PROGRESS') return '标记完成'
  if (statusCode === 'COMPLETED' || statusCode === 'CANCELLED') return '查看详情'
  if (stage === 'PHOTOGRAPHY' && String(workOrder.orderType ?? '').toUpperCase().includes('UPLOAD')) return '开始上传'
  if (stage === 'PHOTOGRAPHY') return '开始执行'
  if (stage === 'SELECTION_REVIEW') return '开始跟进'
  return '开始处理'
}

export const buildCollaborationWorkOrderItems = ({
  workOrders,
  orders,
  albums,
  selectionLinks,
  now = new Date(),
}: BuildInput): CollaborationWorkOrderItem[] =>
  workOrders
    .map(workOrder => {
      const order = resolveOrder(workOrder, orders)
      const album = albums.find(item => matchesAlbum(item, order))
      const selectionLink = selectionLinks.find(item => matchesSelection(item, order, album))
      const stage = resolveStage(workOrder)
      const statusCode = resolveStatusCode(workOrder)
      const priority = resolvePriority(workOrder)
      const execution = resolveExecution(workOrder, stage, order, album, selectionLink, statusCode, now)
      return {
        id: `work-order-${workOrder.id}`,
        backendId: workOrder.id,
        workOrderNo: workOrder.orderNo || `WO-${workOrder.id}`,
        order,
        album,
        selectionLink,
        stage,
        stageLabel: stageLabelMap[stage],
        orderType: workOrder.orderType,
        status: statusLabelMap[statusCode],
        statusCode,
        priority,
        priorityLabel: priorityLabelMap[priority],
        assignee: workOrder.handlerName || execution.owner,
        blockReason: resolveBlockReason(workOrder, stage, order, album, selectionLink, statusCode),
        primaryActionLabel: resolvePrimaryActionLabel(workOrder, stage, statusCode),
        canTransition: statusCode === 'PENDING' || statusCode === 'IN_PROGRESS' || statusCode === 'BLOCKED',
        actionPath: resolveActionPath(stage, order, album, selectionLink),
        execution,
      }
    })
    .sort((left, right) => {
      if (left.execution.overdue !== right.execution.overdue) return left.execution.overdue ? -1 : 1
      if (left.execution.dueAt !== right.execution.dueAt) return left.execution.dueAt.localeCompare(right.execution.dueAt)
      return stageSequence.indexOf(left.stage) - stageSequence.indexOf(right.stage)
    })

export const resolveWorkOrderTransitionPayload = (
  item: CollaborationWorkOrderItem,
  remark = '',
): WorkOrderTransitionPayload | null => {
  if (item.statusCode === 'PENDING') {
    return {
      id: item.backendId,
      expectedStatus: item.statusCode,
      targetStatus: 'IN_PROGRESS',
      remark,
    }
  }
  if (item.statusCode === 'IN_PROGRESS') {
    return {
      id: item.backendId,
      expectedStatus: item.statusCode,
      targetStatus: 'COMPLETED',
      remark,
    }
  }
  if (item.statusCode === 'BLOCKED') {
    return {
      id: item.backendId,
      expectedStatus: item.statusCode,
      targetStatus: 'IN_PROGRESS',
      remark,
    }
  }
  return null
}

export const collaborationWorkOrderStageOptions = collaborationStageOptions
