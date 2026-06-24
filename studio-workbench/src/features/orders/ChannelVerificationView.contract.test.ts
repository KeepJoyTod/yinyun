import { describe, expect, it } from 'vitest'
import channelVerificationSource from './ChannelVerificationView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import appStoreSource from '../../shared/stores/appStore.ts?raw'
import channelStoreSource from '../../shared/stores/channelStore.ts?raw'
import backendSource from '../../shared/api/backend.ts?raw'

const channelVerificationStoreSource = [appStoreSource, channelStoreSource].join('\n')

describe('channel verification page contract', () => {
  it('replaces the channel verification placeholder with a real route', () => {
    expect(routerSource).toContain('ChannelVerificationView.vue')
    expect(getWorkbenchFeature('order-verification')?.component).toBe('channel-verification')
    expect(getWorkbenchFeature('order-verification')?.status).toBe('ready')
    expect(getWorkbenchFeature('order-verification')?.permission).toBe('yy:channel:list')
  })

  it('loads Douyin Life acceptance cases, sync health, and channel logs', () => {
    expect(channelVerificationSource).toContain('appStore.loadDouyinAcceptanceCases')
    expect(channelVerificationSource).toContain('appStore.loadDouyinSyncHealth')
    expect(channelVerificationSource).toContain('appStore.loadChannelSyncLogs')
    expect(backendSource).toContain('/yy/channel/DOUYIN_LIFE/acceptance-cases')
    expect(backendSource).toContain('/yy/channel/DOUYIN_LIFE/sync-health')
  })

  it('keeps the real verification action read-only in the staff workbench', () => {
    expect(channelVerificationSource).toContain('不在门店工作台直接执行真实核销')
    expect(channelVerificationSource).toContain('POST /yy/channel/DOUYIN_LIFE/verify')
    expect(channelVerificationSource).not.toContain('submitVerify')
    expect(channelVerificationSource).not.toContain('apiRequest')
  })

  it('exposes the known Douyin acceptance logid for operational handoff', () => {
    expect(channelVerificationStoreSource).toContain('20260605131113AF2F064357C9C939F972')
    expect(channelVerificationSource).toContain('X-Bytedance-Logid')
    expect(channelVerificationSource).toContain('复制 logid')
  })

  it('correlates acceptance cases with recent channel logs for troubleshooting handoff', () => {
    expect(channelVerificationSource).toContain('buildAcceptanceCaseLogRelations')
    expect(channelVerificationSource).toContain('buildAcceptanceCaseDiagnosticText')
    expect(channelVerificationSource).toContain('复制排障包')
    expect(channelVerificationSource).toContain('日志匹配')
    expect(channelVerificationSource).toContain('logMatchLabel')
  })
})
