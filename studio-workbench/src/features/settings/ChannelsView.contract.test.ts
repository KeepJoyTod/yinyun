import { describe, expect, it } from 'vitest'
import channelsSource from './ChannelsView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('channels settings page contract', () => {
  it('replaces the channel settings placeholder with a real route', () => {
    expect(routerSource).toContain('ChannelsView.vue')
    expect(getWorkbenchFeature('settings-channels')?.component).toBe('channels')
    expect(getWorkbenchFeature('settings-channels')?.status).toBe('ready')
    expect(getWorkbenchFeature('settings-channels')?.permission).toBe('yy:channel:list')
  })

  it('keeps miniapp legal domains and app ids visible', () => {
    expect(channelsSource).toContain('wx2a1a34748f56a6c6')
    expect(channelsSource).toContain('tta3c8d5753dac3aae01')
    expect(channelsSource).toContain('request')
    expect(channelsSource).toContain('uploadFile')
    expect(channelsSource).toContain('downloadFile')
    expect(channelsSource).toContain('https://api.evanshine.me')
  })

  it('lists Douyin Life webhook and SPI endpoints under the api domain', () => {
    expect(channelsSource).toContain('/api/douyin/life/webhook')
    expect(channelsSource).toContain('/api/douyin/life/tripartite-code/create')
    expect(channelsSource).toContain('/api/douyin/life/reservation/pay-notify')
    expect(channelsSource).toContain('/api/douyin/life/reservation/stock-query')
    expect(channelsSource).toContain('/api/douyin/life/order/query')
  })

  it('documents the boundary away from yingyueyun for new callbacks', () => {
    expect(channelsSource).toContain('不要再把 `yingyueyun` 当新回调首选')
    expect(channelsSource).toContain('官网展示、客户取片和小程序预约引导')
    expect(channelsSource).toContain('不承接生活服务 SPI')
  })

  it('has individual copy buttons for each domain type with state feedback', () => {
    expect(channelsSource).toContain('copyingDomainKey')
    expect(channelsSource).toContain('copiedDomainKey')
    expect(channelsSource).toContain('copyDomain')
    expect(channelsSource).toContain('复制中...')
    expect(channelsSource).toContain('已复制')
  })

  it('has individual copy state for each SPI row', () => {
    expect(channelsSource).toContain('copyingSpiKey')
    expect(channelsSource).toContain('copiedSpiKey')
    expect(channelsSource).toContain('copySpi')
  })

  it('uses the shared notice banner for copy feedback', () => {
    expect(channelsSource).toContain('NoticeBanner')
  })

  it('renders channels as a control console with larger typography and glass surfaces', () => {
    expect(channelsSource).toContain('yy-glass-panel')
    expect(channelsSource).toContain('yy-console-hero')
    expect(channelsSource).toContain('渠道接入控制台')
    expect(channelsSource).toContain('渠道运行面板')
    expect(channelsSource).toContain('yy-console-card')
    expect(channelsSource).toContain('text-[14px]')
    expect(channelsSource).toContain('rounded-2xl')
    expect(channelsSource).toContain('API_DOMAIN')
  })

  it('can copy a platform-console fill checklist for handoff', () => {
    expect(channelsSource).toContain('复制后台填写清单')
    expect(channelsSource).toContain('platformFillChecklist')
    expect(channelsSource).toContain('copyPlatformFillChecklist')
    expect(channelsSource).toContain('Webhook challenge')
    expect(channelsSource).toContain('application/json')
  })
})
