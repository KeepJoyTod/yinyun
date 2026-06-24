import { describe, expect, it } from 'vitest'
import shareLinksSource from './ShareLinksView.vue?raw'
import shareLinkOpsSource from './shareLinkOperations.ts?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('share links page contract', () => {
  it('replaces booking, pickup, and share link tool placeholders with one real page', () => {
    expect(routerSource).toContain('ShareLinksView.vue')
    expect(getWorkbenchFeature('tool-booking-entry')?.component).toBe('share-links')
    expect(getWorkbenchFeature('tool-pickup-entry')?.component).toBe('share-links')
    expect(getWorkbenchFeature('tool-share-links')?.component).toBe('share-links')
    expect(getWorkbenchFeature('tool-share-links')?.status).toBe('ready')
  })

  it('generates store-scoped miniapp paths, scene params, and H5 fallback links', () => {
    expect(shareLinksSource).toContain('buildEntryPayload')
    expect(shareLinkOpsSource).toContain('pages/booking/entry/index')
    expect(shareLinkOpsSource).toContain('pages/pickup/login/index')
    expect(shareLinksSource).toContain('scene')
    expect(shareLinkOpsSource).toContain('storeId')
    expect(shareLinkOpsSource).toContain('https://yingyueyun.evanshine.me')
  })

  it('documents replacement of old in-store QR material with our own miniapp code', () => {
    expect(shareLinksSource).toContain('旧的 yuyue123.cn')
    expect(shareLinksSource).toContain('必须重新生成影约云自己的微信小程序码')
    expect(shareLinkOpsSource).toContain('wx2a1a34748f56a6c6')
    expect(shareLinkOpsSource).toContain('tta3c8d5753dac3aae01')
  })

  it('keeps customer booking outside the employee web workbench', () => {
    expect(shareLinksSource).toContain('客户电脑网页只做官网、取片和小程序预约引导')
    expect(shareLinksSource).not.toContain('/client/booking/intent')
  })

  it('shows copy button states (copying/copied/failed) instead of only alert', () => {
    expect(shareLinksSource).toContain('copyingKey')
    expect(shareLinksSource).toContain('copiedKey')
    expect(shareLinksSource).toContain('复制中...')
    expect(shareLinksSource).toContain('已复制')
    expect(shareLinksSource).toContain('手动选择文本复制')
  })

  it('validates entry params and shows warning for missing params', () => {
    expect(shareLinksSource).toContain('validateEntryParams')
    expect(shareLinksSource).toContain('参数不完整')
    expect(shareLinksSource).toContain('paramValidation.missing')
  })

  it('uses staff-facing Chinese labels instead of internal English labels', () => {
    expect(shareLinksSource).toContain('入口物料中心')
    expect(shareLinksSource).toContain('二维码预览')
    expect(shareLinksSource).toContain('替换检查')
    expect(shareLinksSource).toContain('平台说明')
    expect(shareLinksSource).toContain("'门店'")
    expect(shareLinksSource).toContain("'微信'")
    expect(shareLinksSource).toContain("'抖音'")
    for (const label of ['Entry Material Center', 'QR Preview', 'Replacement Checklist', 'Platform Notes', 'CURRENT', 'SELECT']) {
      expect(shareLinksSource).not.toContain(label)
    }
  })
})
