import { describe, expect, it } from 'vitest'
import type { ChannelSyncLogInfo, DouyinAcceptanceCaseInfo } from '../../shared/stores/appStoreTypes'
import {
  buildAcceptanceCaseDiagnosticText,
  buildAcceptanceCaseLogRelations,
  casePassed,
} from './channelVerificationOperations'

const makeCase = (overrides: Partial<DouyinAcceptanceCaseInfo> = {}): DouyinAcceptanceCaseInfo => ({
  caseKey: 'verify-whole-order',
  label: '整单核销',
  apiName: 'POST /goodlife/v1/fulfilment/certificate/verify/',
  publicUrl: 'https://api.evanshine.me/api/douyin/life/verify',
  endpoint: '/yy/channel/DOUYIN_LIFE/verify',
  logidSource: 'OpenAPI extra.logid',
  status: 'PENDING',
  statusText: '待排查',
  requestId: '',
  success: 'false',
  errorMessage: '',
  createTime: '2026-06-15 10:00:00',
  hint: '等待真实核销 logid',
  ...overrides,
})

const makeLog = (overrides: Partial<ChannelSyncLogInfo> = {}): ChannelSyncLogInfo => ({
  backendId: '8101',
  storeName: '影约云深圳旗舰店',
  channelType: 'DOUYIN_LIFE',
  apiName: 'goodlife/v1/fulfilment/certificate/verify',
  requestId: 'logid-verify-001',
  status: 'FAILED',
  errorMessage: '核销能力未开通',
  durationMs: 688,
  retryable: true,
  remark: '整单核销验收',
  ...overrides,
})

describe('channel verification operations', () => {
  it('treats success/pass/通过 acceptance states as passed', () => {
    expect(casePassed(makeCase({ success: 'true' }))).toBe(true)
    expect(casePassed(makeCase({ status: 'PASS' }))).toBe(true)
    expect(casePassed(makeCase({ statusText: '已通过' }))).toBe(true)
    expect(casePassed(makeCase({ success: 'false', status: 'PENDING', statusText: '待排查' }))).toBe(false)
  })

  it('links an acceptance case to the exact DOUYIN_LIFE logid before using api category candidates', () => {
    const exactLog = makeLog({
      backendId: 'exact',
      requestId: '20260605131113AF2F064357C9C939F972',
      apiName: 'goodlife/v1/fulfilment/certificate/verify',
      status: 'SUCCESS',
      errorMessage: '',
    })
    const apiCandidate = makeLog({
      backendId: 'candidate',
      requestId: 'candidate-logid',
      apiName: 'goodlife/v1/fulfilment/certificate/verify',
      status: 'FAILED',
      errorMessage: '旧失败',
    })
    const wrongChannel = makeLog({
      backendId: 'wechat',
      channelType: 'WECHAT',
      requestId: '20260605131113AF2F064357C9C939F972',
    })

    const [linked] = buildAcceptanceCaseLogRelations(
      [makeCase({ requestId: '20260605131113AF2F064357C9C939F972' })],
      [wrongChannel, apiCandidate, exactLog],
    )

    expect(linked.relatedLog?.backendId).toBe('exact')
    expect(linked.logMatchLevel).toBe('logid')
    expect(linked.logMatchLabel).toBe('已匹配 logid')
  })

  it('uses a same-api DOUYIN_LIFE candidate when the acceptance case has no logid yet', () => {
    const [linked] = buildAcceptanceCaseLogRelations(
      [makeCase({ requestId: '', status: 'PENDING', statusText: '待核销' })],
      [
        makeLog({ backendId: 'order-query', apiName: 'goodlife/v1/trade/order/query', requestId: 'order-logid' }),
        makeLog({ backendId: 'verify', apiName: 'goodlife/v1/fulfilment/certificate/verify', requestId: 'verify-logid' }),
      ],
    )

    expect(linked.relatedLog?.backendId).toBe('verify')
    expect(linked.logMatchLevel).toBe('api-candidate')
    expect(linked.logMatchLabel).toBe('按接口匹配最近日志')
  })

  it('builds a copyable diagnostic package with acceptance and matched log evidence', () => {
    const [linked] = buildAcceptanceCaseLogRelations(
      [makeCase({ requestId: 'logid-verify-001', errorMessage: '平台未认可核销' })],
      [makeLog({ requestId: 'logid-verify-001', errorMessage: '核销能力未开通' })],
    )

    const text = buildAcceptanceCaseDiagnosticText(linked)

    expect(text).toContain('[抖音来客验收排障]')
    expect(text).toContain('用例：整单核销')
    expect(text).toContain('验收 logid：logid-verify-001')
    expect(text).toContain('日志匹配：已匹配 logid')
    expect(text).toContain('最近日志状态：FAILED')
    expect(text).toContain('最近日志错误：核销能力未开通')
  })
})
