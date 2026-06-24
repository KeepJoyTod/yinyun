import type { ChannelSyncLogInfo, DouyinAcceptanceCaseInfo } from '../../shared/stores/appStoreTypes'

export type AcceptanceLogMatchLevel = 'logid' | 'api-candidate' | 'none'

export type AcceptanceCaseLogRelation = DouyinAcceptanceCaseInfo & {
  relatedLog: ChannelSyncLogInfo | null
  logMatchLevel: AcceptanceLogMatchLevel
  logMatchLabel: string
  logMatchHint: string
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const casePassed = (item: DouyinAcceptanceCaseInfo) => {
  const normalized = `${item.success} ${item.status} ${item.statusText}`.toLowerCase()
  return normalized.includes('true')
    || normalized.includes('success')
    || normalized.includes('pass')
    || normalized.includes('通过')
    || normalized.includes('成功')
}

const resolveAcceptanceCategory = (item: DouyinAcceptanceCaseInfo) => {
  const text = normalize(`${item.caseKey} ${item.label} ${item.apiName} ${item.endpoint} ${item.publicUrl} ${item.logidSource}`)
  return resolveCategoryFromText(text)
}

const resolveCategoryFromText = (text: string) => {
  if (text.includes('tripartite') || text.includes('三方码') || text.includes('发券') || text.includes('code create')) return 'tripartite-code'
  if (text.includes('refund') || text.includes('退款')) return 'refund'
  if (text.includes('stock') || text.includes('inventory') || text.includes('库存')) return 'stock'
  if (text.includes('verify') || text.includes('fulfil') || text.includes('certificate') || text.includes('核销')) return 'verify'
  if (text.includes('confirm') || text.includes('接单') || text.includes('拒单')) return 'confirm'
  if (text.includes('pay notify') || text.includes('pay-notify') || text.includes('支付通知')) return 'pay-notify'
  if (text.includes('order create') || text.includes('order-create') || text.includes('创单') || text.includes('创建')) return 'order-create'
  if (text.includes('order query') || text.includes('order-query') || text.includes('订单查询')) return 'order-query'
  if (text.includes('order')) return 'order'
  return 'unknown'
}

const resolveLogCategory = (item: ChannelSyncLogInfo) => {
  const apiCategory = resolveCategoryFromText(normalize(item.apiName))
  if (apiCategory !== 'unknown') return apiCategory
  return resolveCategoryFromText(normalize(`${item.remark} ${item.errorMessage}`))
}

const isDouyinLifeLog = (item: ChannelSyncLogInfo) => item.channelType === 'DOUYIN_LIFE'

export const buildAcceptanceCaseLogRelation = (
  item: DouyinAcceptanceCaseInfo,
  channelLogs: ChannelSyncLogInfo[],
): AcceptanceCaseLogRelation => {
  const douyinLogs = channelLogs.filter(isDouyinLifeLog)
  const requestId = item.requestId.trim()
  const exactLog = requestId
    ? douyinLogs.find(log => log.requestId.trim() === requestId)
    : undefined
  if (exactLog) {
    return {
      ...item,
      relatedLog: exactLog,
      logMatchLevel: 'logid',
      logMatchLabel: '已匹配 logid',
      logMatchHint: '验收用例 logid 与最近渠道日志 requestId 完全一致，可作为平台排障证据。',
    }
  }

  const category = resolveAcceptanceCategory(item)
  const candidate = category === 'unknown'
    ? undefined
    : douyinLogs.find(log => resolveLogCategory(log) === category)
  if (candidate) {
    return {
      ...item,
      relatedLog: candidate,
      logMatchLevel: 'api-candidate',
      logMatchLabel: '按接口匹配最近日志',
      logMatchHint: '该用例暂无精确 logid 匹配，当前只按接口类别给出最近 DOUYIN_LIFE 日志候选。',
    }
  }

  return {
    ...item,
    relatedLog: null,
    logMatchLevel: 'none',
    logMatchLabel: '未匹配日志',
    logMatchHint: '最近渠道日志中没有找到同 logid 或同接口类别的 DOUYIN_LIFE 记录。',
  }
}

export const buildAcceptanceCaseLogRelations = (
  cases: DouyinAcceptanceCaseInfo[],
  channelLogs: ChannelSyncLogInfo[],
) => cases.map(item => buildAcceptanceCaseLogRelation(item, channelLogs))

export const buildAcceptanceCaseDiagnosticText = (item: AcceptanceCaseLogRelation) => [
  '[抖音来客验收排障]',
  `用例：${item.label}`,
  `状态：${item.statusText || item.status || (casePassed(item) ? '已通过' : '待排查')}`,
  `接口：${item.publicUrl || item.endpoint || item.apiName || '暂无'}`,
  `验收 logid：${item.requestId || '暂无'}`,
  `日志匹配：${item.logMatchLabel}`,
  `匹配说明：${item.logMatchHint}`,
  `最近日志接口：${item.relatedLog?.apiName || '暂无'}`,
  `最近日志 requestId：${item.relatedLog?.requestId || '暂无'}`,
  `最近日志状态：${item.relatedLog?.status || '暂无'}`,
  `最近日志错误：${item.relatedLog?.errorMessage || '无'}`,
  `最近日志备注：${item.relatedLog?.remark || '无'}`,
  `验收错误：${item.errorMessage || '无'}`,
  `处理建议：${item.hint || '复制 logid/requestId 给平台或后端排障。'}`,
].join('\n')
