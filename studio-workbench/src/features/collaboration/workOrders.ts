import type { Album, BookingOrder, SelectionLink } from '../../shared/stores/appStore'
import { buildWorkExecutionItems, type WorkExecutionItem, type WorkExecutionStage } from './workExecution'

export type WorkOrderPriority = 'HIGH' | 'MEDIUM' | 'NORMAL'
export type WorkOrderStatus = '阻塞' | '待处理' | '进行中'
export type WorkOrderActionMode = 'ORDER' | 'PHOTOS' | 'SELECTION'

export type WorkOrder = {
  id: string
  workOrderNo: string
  execution: WorkExecutionItem
  order: BookingOrder
  album?: Album
  selectionLink?: SelectionLink
  stage: WorkExecutionStage
  stageLabel: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  priorityLabel: string
  assignee: string
  blockReason: string
  primaryActionLabel: string
  actionMode: WorkOrderActionMode
  actionPath: string
}

type BuildInput = {
  orders: BookingOrder[]
  albums: Album[]
  selectionLinks: SelectionLink[]
  now?: Date
}

const priorityLabel: Record<WorkOrderPriority, string> = {
  HIGH: '高优先',
  MEDIUM: '中优先',
  NORMAL: '普通',
}

const stageActionMode: Record<WorkExecutionStage, WorkOrderActionMode> = {
  SHOOT: 'ORDER',
  UPLOAD: 'PHOTOS',
  SELECTION: 'SELECTION',
  DELIVERY: 'PHOTOS',
}

const resolveBlockReason = (item: WorkExecutionItem) => {
  if (!item.order.customer || !item.order.phone) return '客户资料不完整'
  if (item.order.payment === '待支付') return '订单待支付，先处理支付或保留状态'
  if (item.stage === 'SELECTION' && !item.selectionLink) return '选片链接未生成'
  return ''
}

const resolveStatus = (item: WorkExecutionItem, blockReason: string): WorkOrderStatus => {
  if (blockReason) return '阻塞'
  if (item.stage === 'SHOOT' && item.order.status === '拍摄中') return '进行中'
  if (item.stage === 'DELIVERY') return '进行中'
  return '待处理'
}

const resolvePriority = (item: WorkExecutionItem, blockReason: string): WorkOrderPriority => {
  if (blockReason || item.overdue) return 'HIGH'
  if (item.stage === 'DELIVERY' || item.stage === 'UPLOAD') return 'MEDIUM'
  return 'NORMAL'
}

const resolvePrimaryActionLabel = (item: WorkExecutionItem, blockReason: string) => {
  if (blockReason) return '打开订单处理'
  if (item.stage === 'SHOOT') return item.order.status === '拍摄中' ? '继续拍摄' : '开始拍摄'
  if (item.stage === 'UPLOAD') return '上传底片'
  if (item.stage === 'SELECTION') return item.selectionLink ? '跟进选片' : '生成选片链接'
  return '进入交付'
}

export const buildWorkOrders = ({ orders, albums, selectionLinks, now = new Date() }: BuildInput): WorkOrder[] =>
  buildWorkExecutionItems({ orders, albums, selectionLinks, now }).map(item => {
    const blockReason = resolveBlockReason(item)
    const priority = resolvePriority(item, blockReason)
    return {
      id: `WO:${item.id}`,
      workOrderNo: `WO-${item.stage}-${item.order.id}`,
      execution: item,
      order: item.order,
      album: item.album,
      selectionLink: item.selectionLink,
      stage: item.stage,
      stageLabel: item.stageLabel,
      status: resolveStatus(item, blockReason),
      priority,
      priorityLabel: priorityLabel[priority],
      assignee: item.owner,
      blockReason,
      primaryActionLabel: resolvePrimaryActionLabel(item, blockReason),
      actionMode: stageActionMode[item.stage],
      actionPath: item.actionPath,
    }
  })
