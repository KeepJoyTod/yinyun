import { describe, expect, it } from 'vitest'
import decorationSource from './MerchantDecorationView.vue?raw'
import operationsSource from './merchantDecorationOperations.ts?raw'

const decorationContractSource = `${decorationSource}\n${operationsSource}`

describe('merchant decoration page contract', () => {
  it('renders the decoration preview and publish surface', () => {
    expect(decorationSource).toContain('小程序装修')
    expect(decorationSource).toContain('店铺装修')
    expect(decorationSource).toContain('微信预约端预览')
    expect(decorationSource).toContain('微信预约')
    expect(decorationSource).toContain('发布上线')
    expect(decorationSource).toContain('租户默认装修')
    expect(decorationSource).toContain('selectedStoreId')
    expect(decorationSource).toContain("storeId: selectedStoreId.value")
    expect(decorationSource).not.toContain('Mini-Program Decoration')
    expect(decorationSource).not.toContain('Wechat Booking')
  })

  it('keeps decoration tabs and save-next flow visible', () => {
    expect(decorationContractSource).toContain('topTabs')
    expect(decorationContractSource).toContain('flowTabs')
    expect(decorationSource).toContain('saveAndNext')
    expect(decorationSource).toContain('setActiveTopTab')
    expect(decorationSource).not.toContain('router.replace({ query: { ...route.query, sel } })')
    expect(decorationContractSource).toContain('预约流程配置')
    expect(decorationContractSource).toContain('平台配置')
  })

  it('shows degraded platform sync state and preview token metadata', () => {
    expect(decorationSource).toContain('platformStatus')
    expect(decorationSource).toContain('授权模式')
    expect(decorationSource).toContain('同步状态')
    expect(decorationSource).toContain('预览令牌')
    expect(decorationSource).not.toContain('Auth Mode')
    expect(decorationSource).not.toContain('Sync Status')
    expect(decorationSource).not.toContain('Preview Token')
    expect(decorationSource).toContain('config.platform.lastSyncError')
  })

  it('builds a store scoped public link and guards publishing with validation', () => {
    expect(decorationContractSource).toContain('new URLSearchParams')
    expect(decorationContractSource).toContain("channelType: 'WECHAT'")
    expect(decorationContractSource).toContain('validateDecoration')
    expect(decorationSource).toContain('globalThis.confirm')
    expect(decorationSource).toContain('backendApi.getMerchantDecoration')
  })

  it('wires key decoration buttons to backend persistence or local copy actions', () => {
    expect(decorationSource).toContain('@click="saveDraft"')
    expect(decorationSource).toContain('@click="saveAndNext"')
    expect(decorationSource).toContain('@click="publishDraft"')
    expect(decorationSource).toContain('@click="copyWechatLink"')
    expect(decorationSource).toContain('backendApi.saveMerchantDecoration')
    expect(decorationSource).toContain('backendApi.publishMerchantDecoration')
    expect(decorationSource).toContain('copyText(wechatLink.value')
  })
})
