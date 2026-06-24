import { describe, expect, it } from 'vitest'
import { mapChannelAcceptanceCaseRow, mapChannelSyncHealthRow } from './backendChannelInsights'

describe('backend channel insights mappings', () => {
  it('maps channel acceptance cases into stable ui friendly rows', () => {
    expect(
      mapChannelAcceptanceCaseRow({
        caseKey: 'reservation-order-query',
        label: '综合预约三方订单查询',
        apiName: 'life.order.query',
        publicUrl: 'https://api.evanshine.me/api/douyin/life/reservation/order-query',
        endpoint: '/api/douyin/life/reservation/order-query',
        logidSource: 'extra.logid',
        status: 'SKELETON',
        statusText: '骨架',
        requestId: 'logid-001',
        success: '1',
        errorMessage: '',
        createTime: '2026-06-15 10:00:00',
        hint: '保持裸 JSON',
      }),
    ).toEqual({
      caseKey: 'reservation-order-query',
      label: '综合预约三方订单查询',
      apiName: 'life.order.query',
      publicUrl: 'https://api.evanshine.me/api/douyin/life/reservation/order-query',
      endpoint: '/api/douyin/life/reservation/order-query',
      logidSource: 'extra.logid',
      status: 'SKELETON',
      statusText: '骨架',
      requestId: 'logid-001',
      success: '1',
      errorMessage: '',
      createTime: '2026-06-15 10:00:00',
      hint: '保持裸 JSON',
    })
  })

  it('maps sync health rows into counters without changing meaning', () => {
    expect(
      mapChannelSyncHealthRow({
        channelType: 'DOUYIN_LIFE',
        healthStatus: 'READY',
        message: 'ok',
        failedEventCount: 2,
        retryableEventCount: 3,
        deadEventCount: 1,
        latestLogId: '20260615101010ABC',
        latestWebhookTime: '2026-06-15 10:10:10',
        latestAutoSyncTime: '2026-06-15 10:11:10',
      }),
    ).toEqual({
      channelType: 'DOUYIN_LIFE',
      healthStatus: 'READY',
      message: 'ok',
      failedEventCount: 2,
      retryableEventCount: 3,
      deadEventCount: 1,
      latestLogId: '20260615101010ABC',
      latestWebhookTime: '2026-06-15 10:10:10',
      latestAutoSyncTime: '2026-06-15 10:11:10',
    })
  })
})
