import type { Album, BookingOrder, ChannelSyncLogInfo, OperationLogInfo } from '../../shared/stores/appStore'
import { buildOrderCancelGuidance as _buildOrderCancelGuidance } from './orderPhotoDeliveryOperations'
import { buildOrderPhotoDeliveryStage } from './orderPhotoDeliveryOperations'
import type { OrderPhotoDeliveryStage } from './orderPhotoDeliveryOperations'
import { isCancelledOrder, isCompletedOrder, getNextOrderHint, isRefundedOrder } from './orderStatusOperations'
import { isDouyinLifeOrder } from '../../shared/stores/orderIssueRules'
import type { OrderDetailTimelineItem, OrderOperationEvidenceCard, OrderSourceContext } from './orderOperationEvidenceTypes'

export type { OrderDetailTimelineItem, OrderOperationEvidenceCard, OrderSourceContext } from './orderOperationEvidenceTypes'

const toTimelineToneFromStatus = (order: BookingOrder): OrderDetailTimelineItem['tone'] => {
  if (isCancelledOrder(order) || isRefundedOrder(order)) return 'danger'
  if (isCompletedOrder(order)) return 'done'
  return 'pending'
}

const toTimelineToneFromCancelGuidance = (guidance: { tone: 'danger' | 'warn' | 'neutral' }): OrderDetailTimelineItem['tone'] => {
  if (guidance.tone === 'danger') return 'danger'
  if (guidance.tone === 'warn') return 'warn'
  return 'neutral'
}

const toTimelineToneFromPhotoStage = (stage: OrderPhotoDeliveryStage): OrderDetailTimelineItem['tone'] => {
  if (stage.key === 'DELIVERED') return 'done'
  if (stage.key === 'NO_ALBUM') return 'neutral'
  return 'pending'
}

const formatCentAmount = (value: number | undefined) =>
  ((Number(value) || 0) / 100).toFixed(2)

const isRefundChannelSyncLog = (log: ChannelSyncLogInfo) =>
  /refund|退款/i.test([log.apiName, log.requestId, log.errorMessage, log.remark].join('\n'))

const buildOrderRefundTimelineItem = (
  order: BookingOrder,
  channelSyncLogs: ChannelSyncLogInfo[],
): OrderDetailTimelineItem | null => {
  const refundStatus = String(order.refundStatus || '').trim()
  const refundAmountCent = Number(order.refundAmountCent || 0)
  if (!refundStatus && refundAmountCent <= 0 && !isRefundedOrder(order)) return null

  const refundLog = getOrderChannelSyncLogs(order, channelSyncLogs, 5).find(isRefundChannelSyncLog)
  const paymentLabel = order.payment === '已退款' ? '已退款' : order.status === '已退单' ? '已退单' : '退款记录'
  const amountText = refundAmountCent > 0 ? ` ${formatCentAmount(refundAmountCent)}` : ''
  const statusText = refundStatus || (order.payment === '已退款' ? 'REFUNDED' : order.status)
  const logText = refundLog?.requestId ? `；最近退款 logid：${refundLog.requestId}` : ''

  return {
    key: 'refund',
    label: '退款/退单结果',
    value: `${paymentLabel}${amountText}`,
    hint: `退款状态 ${statusText}${logText}`,
    tone: 'danger',
  }
}

const firstMatch = (value: string, pattern: RegExp) => value.match(pattern)?.[1]?.trim() ?? ''

const compactDetails = (details: Array<string | undefined>) =>
  details.map(value => value?.trim() ?? '').filter(Boolean)

const getOrderChannelType = (order: BookingOrder) =>
  String(order.channelType || order.source || '').trim()

const getMicroFormSource = (remark: string) => {
  const formName = firstMatch(remark, /来源：微表单「([^」]+)」提交\s*#?([^\s\n]*)/)
  const submissionId = firstMatch(remark, /来源：微表单「[^」]+」提交\s*#?([^\s\n]*)/)
  if (!formName && !submissionId) return null
  return {
    formName,
    submissionId,
    sourceCode: firstMatch(remark, /来源码[：:]\s*([^\s\n]+)/),
  }
}

export const buildOrderSourceContext = (order: BookingOrder): OrderSourceContext => {
  const channelType = getOrderChannelType(order)
  const remark = String(order.remark || '')
  const microForm = getMicroFormSource(remark)
  const method = order.method || '未记录'
  const details = compactDetails([
    order.externalProductId ? `商品 ${order.externalProductId}` : undefined,
    order.externalSkuId ? `SKU ${order.externalSkuId}` : undefined,
    order.externalPoiId ? `POI ${order.externalPoiId}` : undefined,
    microForm?.sourceCode ? `来源码：${microForm.sourceCode}` : undefined,
    `预约方式：${method}`,
    channelType ? `渠道：${channelType}` : undefined,
  ])

  if (microForm) {
    const formPart = microForm.formName ? `「${microForm.formName}」` : ''
    const idPart = microForm.submissionId ? ` #${microForm.submissionId}` : ''
    return {
      title: '微表单转预约',
      badge: 'FORM',
      tone: 'pending',
      description: `来自微表单${formPart}提交${idPart}，已转为本地预约；员工继续在工作台确认时段和服务。`,
      details,
    }
  }

  if (isDouyinLifeOrder(order) || channelType === 'DOUYIN_LIFE') {
    const hasArrivalSlot = Boolean(order.arrivalDate && order.arrivalClock && order.arrivalTime)
    return {
      title: '抖音来客同步订单',
      badge: 'DOUYIN',
      tone: hasArrivalSlot ? 'done' : 'warn',
      description: hasArrivalSlot
        ? '订单来自抖音来客并已进入本地 yy_order；已带真实预约时段，可进入今日排期。'
        : '订单来自抖音来客并已进入本地 yy_order；当前没有真实预约时段，不写入今日排期。',
      details,
    }
  }

  if (
    ['手工录入', '门店录入', 'LOCAL'].includes(String(order.source || '').trim())
    || ['人工预约', '手工预约', 'MANUAL'].includes(String(order.method || '').trim())
    || channelType === 'LOCAL'
  ) {
    return {
      title: '员工手工预约',
      badge: 'MANUAL',
      tone: 'neutral',
      description: '员工在影约云工作台创建或维护的本地预约，只影响 yy_order 和 yy_booking_slot_inventory。',
      details: compactDetails([
        ...details,
        remark && !microForm ? `备注：${remark.split(/\r?\n/)[0].slice(0, 80)}` : undefined,
      ]),
    }
  }

  return {
    title: order.source || channelType || '本地订单',
    badge: channelType || 'ORDER',
    tone: 'neutral',
    description: '订单已进入影约云统一账本；按当前状态继续处理预约、交付和售后。',
    details,
  }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getOrderOperationLogHaystack = (log: OperationLogInfo) => [
  log.title,
  log.action,
  log.url,
  log.errorMessage,
  log.requestPayload,
  log.responsePayload,
].join('\n')

const hasOrderOperationPath = (value: string, backendId: string) => {
  if (!backendId.trim()) return false
  const id = escapeRegExp(backendId.trim())
  return [
    new RegExp(`/yy/order/${id}/transition\\b`, 'i'),
    new RegExp(`/yy/order/${id}/reschedule\\b`, 'i'),
    new RegExp(`/yy/order/${id}/photo-album-placeholder\\b`, 'i'),
  ].some(pattern => pattern.test(value))
}

const isOrderOperationEndpoint = (value: string) =>
  /\/yy\/order\/(?:staff-booking|\d+\/(?:transition|reschedule|photo-album-placeholder))/i.test(value)
  || /\/yy\/photoAlbum\/\d+\/(?:notify|selection\/confirm|deliver)/i.test(value)

const toOperationTimestamp = (value: string) => {
  const timestamp = new Date(value.replace(' ', 'T')).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

const formatOperationLogTime = (value: string) => value ? value.replace('T', ' ').slice(0, 16) : '时间未知'

const backendStatusLabels: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  ARRIVED: '已到店',
  SERVING: '服务中',
  SHOOTING: '拍摄中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退单',
}

const parsePayloadObject = (value: string): Record<string, unknown> => {
  const source = String(value || '').trim()
  if (!source) return {}
  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')
  if (start < 0 || end <= start) return {}
  try {
    const parsed = JSON.parse(source.slice(start, end + 1))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

const payloadText = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key]
  return value === null || value === undefined ? '' : String(value).trim()
}

const toBackendStatusLabel = (value: string) =>
  backendStatusLabels[value.trim().toUpperCase()] ?? value.trim()

const getOrderOperationPayload = (log: OperationLogInfo) => parsePayloadObject(log.requestPayload || log.responsePayload || '')

const formatOperationDeptContext = (log: OperationLogInfo) =>
  log.deptName && log.deptName !== '未标记部门' ? `门店/部门：${log.deptName}` : ''

const operationSourceLabels: Record<number, string> = {
  0: '其他/系统',
  1: '后台用户',
  2: '移动端',
}

const formatOperationSourceContext = (log: OperationLogInfo) => {
  if (!Number.isFinite(log.operatorType)) return '操作来源：未记录'
  return `操作来源：${operationSourceLabels[log.operatorType] || `类型${log.operatorType}`}`
}

const buildOrderOperationOperatorContext = (log: OperationLogInfo) =>
  [`操作人：${log.operator || '系统'}`, formatOperationDeptContext(log), formatOperationSourceContext(log)].filter(Boolean).join(' · ')

const formatOrderOperationAction = (log: OperationLogInfo) => {
  const value = `${log.action} ${log.url}`.toLowerCase()
  const payload = getOrderOperationPayload(log)
  const targetStatus = payloadText(payload, 'targetStatus')
  if (value.includes('/transition') && targetStatus.toUpperCase() === 'CANCELLED') return '取消预约'
  if (value.includes('/transition') && targetStatus.toUpperCase() === 'REFUNDED') return '退单'
  if (value.includes('/reschedule')) return '改期'
  if (value.includes('/transition')) return '状态流转'
  if (value.includes('/photo-album-placeholder')) return '生成相册'
  if (value.includes('/photoalbum/') && value.includes('/notify')) return '通知客户'
  if (value.includes('/photoalbum/') && value.includes('/selection/confirm')) return '客片确认'
  if (value.includes('/photoalbum/') && value.includes('/deliver')) return '资料发送'
  if (value.includes('/staff-booking')) return '新增预约'
  return log.title || '后台操作'
}

const buildOrderOperationLogHint = (log: OperationLogInfo) => {
  const payload = getOrderOperationPayload(log)
  const parts = [
    formatOperationLogTime(log.happenedAt),
    formatOperationDeptContext(log),
    formatOperationSourceContext(log),
    `${log.requestMethod || 'GET'} ${log.url || log.action || '未记录接口'}`,
  ]

  const targetStatus = payloadText(payload, 'targetStatus')
  if (targetStatus) parts.push(`目标状态：${toBackendStatusLabel(targetStatus)}`)

  const slotDate = payloadText(payload, 'slotDate')
  const slotStartTime = payloadText(payload, 'slotStartTime')
  const slotEndTime = payloadText(payload, 'slotEndTime')
  if (slotDate || slotStartTime) {
    parts.push(`目标时段：${[slotDate, [slotStartTime, slotEndTime].filter(Boolean).join('-')].filter(Boolean).join(' ')}`)
  }

  const remark = payloadText(payload, 'remark')
  if (remark) parts.push(`原因：${remark.slice(0, 80)}`)
  if (log.status === 'FAILED' && log.errorMessage) parts.push(`失败：${log.errorMessage.slice(0, 80)}`)

  return parts.filter(Boolean).join(' · ')
}

const buildOrderOperationPrimaryDetail = (log: OperationLogInfo) => {
  const payload = getOrderOperationPayload(log)
  const targetStatus = payloadText(payload, 'targetStatus')
  if (targetStatus) return `目标状态：${toBackendStatusLabel(targetStatus)}`

  const slotDate = payloadText(payload, 'slotDate')
  const slotStartTime = payloadText(payload, 'slotStartTime')
  const slotEndTime = payloadText(payload, 'slotEndTime')
  if (slotDate || slotStartTime) {
    return `目标时段：${[slotDate, [slotStartTime, slotEndTime].filter(Boolean).join('-')].filter(Boolean).join(' ')}`
  }

  const albumId = payloadText(payload, 'albumId')
  if (albumId) return `相册：${albumId}`

  if (log.status === 'FAILED' && log.errorMessage) return `失败：${log.errorMessage.slice(0, 80)}`
  return `${log.requestMethod || 'GET'} ${log.url || log.action || '未记录接口'}`
}

const buildOrderOperationSecondaryDetail = (log: OperationLogInfo) => {
  const payload = getOrderOperationPayload(log)
  const remark = payloadText(payload, 'remark')
  const parts = [
    remark ? `原因：${remark.slice(0, 80)}` : '',
    log.status === 'FAILED' && log.errorMessage ? `失败：${log.errorMessage.slice(0, 80)}` : '',
    log.status !== 'FAILED' && log.durationMs > 0 ? `耗时：${log.durationMs} ms` : '',
  ]
  return parts.filter(Boolean).join(' · ')
}

export const buildOrderOperationEvidenceCards = (
  order: BookingOrder,
  logs: OperationLogInfo[],
  limit = 3,
): OrderOperationEvidenceCard[] => getOrderOperationLogs(order, logs, limit).map(log => ({
  key: `operation-evidence-${log.backendId}`,
  action: formatOrderOperationAction(log),
  operator: log.operator || '系统',
  operatorContext: buildOrderOperationOperatorContext(log),
  happenedAt: formatOperationLogTime(log.happenedAt),
  primaryDetail: buildOrderOperationPrimaryDetail(log),
  secondaryDetail: buildOrderOperationSecondaryDetail(log),
  statusLabel: log.status === 'SUCCESS' ? '成功' : '失败',
  tone: log.status === 'SUCCESS' ? 'done' : 'danger',
}))

export const isOrderOperationLog = (order: BookingOrder, log: OperationLogInfo) => {
  const haystack = getOrderOperationLogHaystack(log)
  if (/\/monitor\/operlog\/list/i.test(haystack)) return false
  if (!isOrderOperationEndpoint(haystack)) return false
  const backendId = String(order.backendId || '').trim()
  if (hasOrderOperationPath(haystack, backendId)) return true
  if (order.id && haystack.includes(order.id)) return true
  return hasOrderBackendIdContext(haystack, backendId)
}

export const getOrderOperationLogs = (
  order: BookingOrder,
  logs: OperationLogInfo[],
  limit = 3,
) => logs
  .filter(log => isOrderOperationLog(order, log))
  .sort((a, b) => toOperationTimestamp(b.happenedAt) - toOperationTimestamp(a.happenedAt))
  .slice(0, limit)

const getOrderChannelLogHaystack = (log: ChannelSyncLogInfo) => [
  log.apiName,
  log.requestId,
  log.errorMessage,
  log.remark,
].join('\n')

const hasOrderBackendIdContext = (haystack: string, backendId: string) => {
  if (!backendId.trim()) return false
  const id = escapeRegExp(backendId.trim())
  const patterns = [
    new RegExp(`["']?\\b(?:yy_order\\s*)?id\\b["']?\\s*[=:：]\\s*["']?${id}\\b`, 'i'),
    new RegExp(`["']?\\b(?:local)?orderId\\b["']?\\s*[=:：]\\s*["']?${id}\\b`, 'i'),
    new RegExp(`["']?\\borderBackendId\\b["']?\\s*[=:：]\\s*["']?${id}\\b`, 'i'),
    new RegExp(`["']?\\border_id\\b["']?\\s*[=:：]\\s*["']?${id}\\b`, 'i'),
  ]
  return patterns.some(pattern => pattern.test(haystack))
}

export const isOrderChannelSyncLog = (order: BookingOrder, log: ChannelSyncLogInfo) => {
  const haystack = getOrderChannelLogHaystack(log)
  if (order.id && haystack.includes(order.id)) return true
  if (order.backendId && log.requestId.includes(String(order.backendId))) return true
  return hasOrderBackendIdContext(haystack, String(order.backendId))
}

export const getOrderChannelSyncLogs = (
  order: BookingOrder,
  logs: ChannelSyncLogInfo[],
  limit = 3,
) => logs.filter(log => isOrderChannelSyncLog(order, log)).slice(0, limit)

const formatChannelLogStatus = (status: ChannelSyncLogInfo['status']) => status === 'FAILED' ? '失败' : '成功'

export const buildOrderChannelDiagnosticText = (
  order: BookingOrder,
  logs: ChannelSyncLogInfo[],
) => {
  const matchedLogs = getOrderChannelSyncLogs(order, logs, 5)
  const lines = [
    '[订单渠道排障]',
    `订单号：${order.id || '暂无'}`,
    `本地订单ID：${order.backendId || '暂无'}`,
    `门店：${order.store || '暂无'}`,
    `渠道：${order.source || '暂无'}`,
    `状态：${order.status}`,
    `支付：${order.payment}`,
    `到店：${order.arrivalDate || '未排期'} ${order.arrivalClock || ''}`.trim(),
  ]

  if (!matchedLogs.length) {
    return [
      ...lines,
      '渠道同步记录：暂无匹配记录',
    ].join('\n')
  }

  return [
    ...lines,
    ...matchedLogs.flatMap((log, index) => [
      `--- 渠道日志 ${index + 1} ---`,
      `接口：${log.apiName || '未记录接口'}`,
      `渠道类型：${log.channelType || 'UNKNOWN'}`,
      `requestId/logid：${log.requestId || '暂无'}`,
      `状态：${formatChannelLogStatus(log.status)}`,
      `耗时：${log.durationMs} ms`,
      `可重试：${log.retryable ? '是' : '否'}`,
      `错误信息：${log.errorMessage || '无'}`,
      `备注：${log.remark || '无'}`,
    ]),
  ].join('\n')
}

const buildOrderCancelGuidance = (order: BookingOrder): { tone: 'danger' | 'warn' | 'neutral'; title: string; body: string } => {
  return _buildOrderCancelGuidance(order)
}

export const buildOrderDetailTimeline = (
  order: BookingOrder,
  album: Album | null | undefined,
  channelSyncLogs: ChannelSyncLogInfo[] = [],
  operationLogs: OperationLogInfo[] = [],
): OrderDetailTimelineItem[] => {
  const cancelGuidance = buildOrderCancelGuidance(order)
  const photoStage = buildOrderPhotoDeliveryStage(album)
  const sourceContext = buildOrderSourceContext(order)
  const latestSyncLog = getOrderChannelSyncLogs(order, channelSyncLogs, 1)[0]
  const matchedOperationLogs = getOrderOperationLogs(order, operationLogs, 3)
  const refundTimelineItem = buildOrderRefundTimelineItem(order, channelSyncLogs)
  const items: OrderDetailTimelineItem[] = [
    {
      key: 'source',
      label: '订单来源',
      value: sourceContext.title,
      hint: sourceContext.description,
      tone: sourceContext.tone,
    },
    {
      key: 'created',
      label: '订单进入工作台',
      value: order.orderTime || '时间未知',
      tone: 'neutral',
    },
    {
      key: 'arrival',
      label: '预约到店时段',
      value: order.arrivalTime || '未排期',
      tone: order.arrivalTime ? 'neutral' : 'warn',
    },
    {
      key: 'status',
      label: '当前处理节点',
      value: order.status,
      hint: getNextOrderHint(order),
      tone: toTimelineToneFromStatus(order),
    },
    {
      key: 'cancel',
      label: '取消/退款边界',
      value: cancelGuidance.title,
      hint: cancelGuidance.body,
      tone: toTimelineToneFromCancelGuidance(cancelGuidance),
    },
    ...(refundTimelineItem ? [refundTimelineItem] : []),
    {
      key: 'photo',
      label: '客片交付',
      value: photoStage.label,
      hint: photoStage.hint,
      tone: toTimelineToneFromPhotoStage(photoStage),
    },
  ]

  matchedOperationLogs.forEach(log => {
    items.push({
      key: `operation-${log.backendId}`,
      label: '订单操作',
      value: `${formatOrderOperationAction(log)} · ${log.operator || '系统'}`,
      hint: buildOrderOperationLogHint(log),
      statusLabel: log.status === 'SUCCESS' ? '成功' : '失败',
      tone: log.status === 'SUCCESS' ? 'done' : 'danger',
    })
  })

  if (latestSyncLog) {
    items.push({
      key: 'channel-sync',
      label: '最近渠道同步',
      value: `${formatChannelLogStatus(latestSyncLog.status)} · ${latestSyncLog.apiName || latestSyncLog.channelType || '未记录接口'}`,
      hint: latestSyncLog.requestId || latestSyncLog.errorMessage || latestSyncLog.remark || '暂无 requestId/logid',
      tone: latestSyncLog.status === 'SUCCESS' ? 'done' : latestSyncLog.retryable ? 'warn' : 'danger',
    })
  } else {
    items.push({
      key: 'channel-sync',
      label: '最近渠道同步',
      value: '暂无同步记录',
      hint: '本地订单暂无渠道同步记录；抖音/美团订单的核销日志会显示在渠道同步区。',
      tone: 'neutral',
    })
  }

  return items
}
