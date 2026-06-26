import { describe, expect, it } from 'vitest'
import source from './MerchantChannelReadinessView.vue?raw'

describe('merchant channel readiness owner', () => {
  it('uses the shared readiness owner shell with the channels section', () => {
    expect(source).toContain('MerchantReadinessOwnerShell')
    expect(source).toContain('section-key="channels"')
    expect(source).toContain('channel-readiness')
  })
})
