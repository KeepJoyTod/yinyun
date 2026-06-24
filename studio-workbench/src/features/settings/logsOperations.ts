import type { ChannelSyncLogInfo, OperationLogInfo } from '../../shared/stores/appStoreTypes'

export type LogFilter = 'all' | 'failed' | 'channel' | 'operation' | 'retryable'

export type LogFilterState = {
  activeFilter: LogFilter
  storeFilter: string
  logIdFilter: string
  searchQuery: string
  handlerFilter: string
  mobileFilter: string
}

export type UnifiedLogEvent = {
  id: string
  source: '操作日志' | '渠道同步'
  storeName: string
  channelType: string
  title: string
  action: string
  status: 'SUCCESS' | 'FAILED'
  requestId: string
  happenedAt: string
  durationMs: number
  errorMessage: string
  retryable: boolean
  remark: string
  meta: string
  suggestion: string
  handler: string
  mobile: string
  content: string
}

export type LogMetricCard = {
  label: string
  value: string
  hint: string
  scope?: string
}

export const validLogFilters: LogFilter[] = ['all', 'failed', 'channel', 'operation', 'retryable']

export const toLogTimestamp = (value: string) => {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export const formatLogTime = (value: string) => {
  if (!value) return '暂无时间'
  return value.replace('T', ' ').slice(0, 16)
}

export const buildOperationLogEvent = (item: OperationLogInfo): UnifiedLogEvent => ({
  id: `operation-${item.backendId}`,
  source: '操作日志',
  storeName: item.deptName || '系统后台',
  channelType: 'SYSTEM',
  title: item.title,
  action: item.action,
  status: item.status,
  requestId: item.backendId ? `oper-${item.backendId}` : '',
  happenedAt: item.happenedAt,
  durationMs: item.durationMs,
  errorMessage: item.errorMessage,
  retryable: false,
  remark: item.url,
  meta: `${item.operator} · ${item.requestMethod} · ${item.ip || '无 IP'}`,
  suggestion: item.status === 'FAILED'
    ? '先确认当前员工是否有对应权限，再查看后端操作日志详情和接口返回。'
    : '操作已成功记录，可用于追踪员工处理订单、客片上传和配置修改。',
  handler: item.operator || '系统',
  mobile: '',
  content: `${item.title} ${item.action} ${item.url} ${item.errorMessage || ''}`,
})

export const buildChannelLogEvent = (item: ChannelSyncLogInfo): UnifiedLogEvent => ({
  id: `channel-${item.backendId}`,
  source: '渠道同步',
  storeName: item.storeName,
  channelType: item.channelType,
  title: item.apiName,
  action: item.apiName,
  status: item.status,
  requestId: item.requestId,
  happenedAt: '',
  durationMs: item.durationMs,
  errorMessage: item.errorMessage,
  retryable: item.retryable,
  remark: item.remark,
  meta: `${item.channelType} · ${item.storeName}`,
  suggestion: item.status === 'FAILED'
    ? '复制 requestId 或抖音 logid 给平台排障，同时检查渠道授权、商品映射、库存和本地订单状态。'
    : '渠道同步正常。验收抖音真实订单时，优先保存这条 requestId 或 logid。',
  handler: '渠道任务',
  mobile: '',
  content: `${item.apiName} ${item.remark || ''} ${item.errorMessage || ''}`,
})

export const buildUnifiedLogEvents = (
  operationLogs: OperationLogInfo[],
  channelLogs: ChannelSyncLogInfo[],
): UnifiedLogEvent[] =>
  [
    ...operationLogs.map(buildOperationLogEvent),
    ...channelLogs.map(buildChannelLogEvent),
  ]
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const timeDiff = toLogTimestamp(b.event.happenedAt) - toLogTimestamp(a.event.happenedAt)
      return timeDiff || a.index - b.index
    })
    .map(item => item.event)

const includesText = (value: string, query: string) => value.toLowerCase().includes(query)

export const filterUnifiedLogEvents = (events: UnifiedLogEvent[], state: LogFilterState) => {
  const query = state.searchQuery.trim().toLowerCase()
  const logId = state.logIdFilter.trim().toLowerCase()
  const handler = state.handlerFilter.trim().toLowerCase()
  const mobile = state.mobileFilter.trim().toLowerCase()

  return events.filter(event => {
    if (state.activeFilter === 'failed' && event.status !== 'FAILED') return false
    if (state.activeFilter === 'channel' && event.source !== '渠道同步') return false
    if (state.activeFilter === 'operation' && event.source !== '操作日志') return false
    if (state.activeFilter === 'retryable' && !event.retryable) return false
    if (state.storeFilter !== 'all' && event.storeName !== state.storeFilter) return false
    if (logId) {
      const logIdHaystack = `${event.requestId} ${event.content} ${event.meta} ${event.remark}`.toLowerCase()
      if (!logIdHaystack.includes(logId)) return false
    }
    if (handler && !includesText(event.handler, handler)) return false
    if (mobile && !includesText(event.mobile, mobile)) return false
    if (!query) return true
    const haystack = `${event.source} ${event.storeName} ${event.channelType} ${event.title} ${event.action} ${event.requestId} ${event.errorMessage} ${event.meta} ${event.content} ${event.handler}`.toLowerCase()
    return haystack.includes(query)
  })
}

export const getLogStoreOptions = (events: UnifiedLogEvent[]) =>
  Array.from(new Set(events.map(item => item.storeName).filter(Boolean)))

export const getFailedLogEvents = (events: UnifiedLogEvent[]) => events.filter(item => item.status === 'FAILED')

export const getChannelLogEvents = (events: UnifiedLogEvent[]) => events.filter(item => item.source === '渠道同步')

export const buildQuickLogFilters = (events: UnifiedLogEvent[]) => {
  const channelEvents = getChannelLogEvents(events)
  return [
    { key: 'all' as const, label: '全部日志', count: events.length },
    { key: 'failed' as const, label: '失败', count: getFailedLogEvents(events).length },
    { key: 'channel' as const, label: '渠道同步', count: channelEvents.length },
    { key: 'operation' as const, label: '操作日志', count: events.length - channelEvents.length },
    { key: 'retryable' as const, label: '可重试', count: events.filter(item => item.retryable).length },
  ]
}

export const buildLogHeroCards = (events: UnifiedLogEvent[]): LogMetricCard[] => [
  { label: '系统日志面板', value: String(events.length), hint: '操作日志 + 渠道同步日志' },
  { label: '失败排障', value: String(getFailedLogEvents(events).length), hint: '优先复制 requestId / logid' },
  { label: '渠道任务', value: String(getChannelLogEvents(events).length), hint: '抖音来客与平台接口记录' },
  { label: '可重试', value: String(events.filter(item => item.retryable).length), hint: '失败后可走补偿或人工重试' },
]

export const buildLogSummaryCards = (events: UnifiedLogEvent[]): LogMetricCard[] => {
  const totalDuration = events.reduce((sum, item) => sum + item.durationMs, 0)
  const averageDuration = events.length ? Math.round(totalDuration / events.length) : 0
  return [
    {
      label: '最近日志',
      value: String(events.length),
      hint: '当前工作台加载到的操作与渠道同步日志。',
      scope: 'ALL',
    },
    {
      label: '失败日志',
      value: String(getFailedLogEvents(events).length),
      hint: '需要店员或管理员优先排查的异常记录。',
      scope: 'FAIL',
    },
    {
      label: '可重试',
      value: String(events.filter(item => item.retryable).length),
      hint: '渠道同步失败后可再次发起或等待补偿任务处理。',
      scope: 'RETRY',
    },
    {
      label: '平均耗时',
      value: `${averageDuration}`,
      hint: '接口调用和操作日志的平均耗时，单位毫秒。',
      scope: 'MS',
    },
  ]
}

export const buildLogDiagnosticText = (event: UnifiedLogEvent) => [
  '[日志排障]',
  `来源：${event.source}`,
  `门店：${event.storeName}`,
  `渠道：${event.channelType}`,
  `接口/动作：${event.action}`,
  `requestId/logid：${event.requestId || '暂无'}`,
  `状态：${event.status === 'FAILED' ? '失败' : '成功'}`,
  `耗时：${event.durationMs} ms`,
  `错误信息：${event.errorMessage || '无'}`,
  `时间：${event.happenedAt || '暂无'}`,
  `处理人：${event.handler}`,
  `备注：${event.remark || '无'}`,
  event.retryable ? '可重试：是' : '',
].filter(Boolean).join('\n')
