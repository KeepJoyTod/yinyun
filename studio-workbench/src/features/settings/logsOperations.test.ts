import { describe, expect, it } from 'vitest'
import type { ChannelSyncLogInfo, OperationLogInfo } from '../../shared/stores/appStoreTypes'
import {
  buildLogDiagnosticText,
  buildLogHeroCards,
  buildLogSummaryCards,
  buildUnifiedLogEvents,
  filterUnifiedLogEvents,
  getLogStoreOptions,
  type LogFilterState,
} from './logsOperations'

const operationLogs: OperationLogInfo[] = [
  {
    backendId: '7101',
    title: '预约订单',
    action: 'POST /yy/order/9001/transition',
    operator: '门店主管',
    operatorType: 1,
    deptName: '影约云深圳旗舰店',
    requestMethod: 'POST',
    url: '/yy/order/9001/transition',
    ip: '127.0.0.1',
    status: 'SUCCESS',
    errorMessage: '',
    requestPayload: '',
    responsePayload: '',
    happenedAt: '2026-06-15 09:20:00',
    durationMs: 146,
  },
  {
    backendId: '7102',
    title: '操作日志',
    action: 'GET /monitor/operlog/list',
    operator: 'yy-demo',
    operatorType: 1,
    deptName: '影约云深圳旗舰店',
    requestMethod: 'GET',
    url: '/monitor/operlog/list',
    ip: '127.0.0.1',
    status: 'FAILED',
    errorMessage: '缺少 monitor:operlog:list 权限',
    requestPayload: '',
    responsePayload: '',
    happenedAt: '2026-06-15 09:25:00',
    durationMs: 92,
  },
]

const channelLogs: ChannelSyncLogInfo[] = [
  {
    backendId: '8101',
    storeName: '影约云深圳旗舰店',
    channelType: 'DOUYIN_LIFE',
    apiName: 'goodlife/v1/trade/order/query',
    requestId: 'douyin-logid-20260613-001',
    status: 'FAILED',
    errorMessage: '请求太过频繁',
    durationMs: 680,
    retryable: true,
    remark: '订单补偿同步',
  },
  {
    backendId: '8102',
    storeName: '影约云香港交付点',
    channelType: 'WECHAT',
    apiName: 'wechat/subscribe/send',
    requestId: 'wechat-request-002',
    status: 'SUCCESS',
    errorMessage: '',
    durationMs: 240,
    retryable: false,
    remark: '预约确认通知',
  },
]

describe('logs operations', () => {
  it('normalizes operation logs and channel logs into one troubleshooting timeline', () => {
    const events = buildUnifiedLogEvents(operationLogs, channelLogs)

    expect(events.map(event => event.id)).toEqual([
      'operation-7102',
      'operation-7101',
      'channel-8101',
      'channel-8102',
    ])
    expect(events[0]).toMatchObject({
      source: '操作日志',
      requestId: 'oper-7102',
      status: 'FAILED',
      handler: 'yy-demo',
      suggestion: '先确认当前员工是否有对应权限，再查看后端操作日志详情和接口返回。',
    })
    expect(events[2]).toMatchObject({
      source: '渠道同步',
      requestId: 'douyin-logid-20260613-001',
      retryable: true,
      handler: '渠道任务',
      suggestion: '复制 requestId 或抖音 logid 给平台排障，同时检查渠道授权、商品映射、库存和本地订单状态。',
    })
  })

  it('filters by status, source, store, handler, mobile, request id, and free text', () => {
    const events = buildUnifiedLogEvents(operationLogs, channelLogs)
    const failedDouyinFilter: LogFilterState = {
      activeFilter: 'failed',
      storeFilter: '影约云深圳旗舰店',
      logIdFilter: 'douyin-logid',
      searchQuery: '频繁',
      handlerFilter: '渠道',
      mobileFilter: '',
    }

    expect(filterUnifiedLogEvents(events, failedDouyinFilter).map(event => event.id)).toEqual(['channel-8101'])
    expect(filterUnifiedLogEvents(events, { ...failedDouyinFilter, activeFilter: 'retryable' }).map(event => event.id)).toEqual(['channel-8101'])
    expect(filterUnifiedLogEvents(events, { ...failedDouyinFilter, activeFilter: 'operation' })).toEqual([])
    expect(filterUnifiedLogEvents(events, { ...failedDouyinFilter, mobileFilter: '13800000000' })).toEqual([])
  })

  it('matches log id filter against request id, content, meta, or remark', () => {
    const events = buildUnifiedLogEvents(operationLogs, channelLogs)
    const baseFilter: LogFilterState = {
      activeFilter: 'all',
      storeFilter: 'all',
      logIdFilter: '',
      searchQuery: '',
      handlerFilter: '',
      mobileFilter: '',
    }

    expect(filterUnifiedLogEvents(events, { ...baseFilter, logIdFilter: 'douyin-logid' }).map(event => event.id)).toEqual(['channel-8101'])
    expect(filterUnifiedLogEvents(events, { ...baseFilter, logIdFilter: '订单补偿同步' }).map(event => event.id)).toEqual(['channel-8101'])
    expect(filterUnifiedLogEvents(events, { ...baseFilter, logIdFilter: 'wechat' }).map(event => event.id)).toEqual(['channel-8102'])
  })

  it('builds store options, hero cards, summary cards, and diagnostic copy text', () => {
    const events = buildUnifiedLogEvents(operationLogs, channelLogs)

    expect(getLogStoreOptions(events)).toEqual(['影约云深圳旗舰店', '影约云香港交付点'])
    expect(buildLogHeroCards(events).map(card => `${card.label}:${card.value}`)).toEqual([
      '系统日志面板:4',
      '失败排障:2',
      '渠道任务:2',
      '可重试:1',
    ])
    expect(buildLogSummaryCards(events).find(card => card.label === '平均耗时')?.value).toBe('290')
    expect(buildLogDiagnosticText(events[2])).toContain('requestId/logid：douyin-logid-20260613-001')
    expect(buildLogDiagnosticText(events[2])).toContain('错误信息：请求太过频繁')
  })
})
