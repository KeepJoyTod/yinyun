import { describe, expect, it } from 'vitest'
import chromeSource from './components/MerchantModuleChrome.vue?raw'
import chromeConfigSource from './merchantChrome.ts?raw'

describe('merchant module chrome contract', () => {
  it('provides Joe666-inspired merchant tabs without mock business data', () => {
    expect(chromeSource).toContain('merchantTabs')
    expect(chromeSource).toContain('RouterLink')
    expect(chromeSource).toContain('slot')
    expect(chromeSource).toContain('<slot name="status" />')
    expect(chromeConfigSource).toContain('/merchant/overview')
    expect(chromeConfigSource).toContain('/merchant/store')
    expect(chromeConfigSource).toContain('/merchant/service-groups')
    expect(chromeConfigSource).toContain('/merchant/inventory')
    expect(chromeConfigSource).not.toContain('fallbackMerchantStores')
    expect(chromeConfigSource).not.toContain('merchantMockData')
  })

  it('keeps quick access actions wired to real workbench routes', () => {
    expect(chromeConfigSource).toContain('/order/appointment')
    expect(chromeConfigSource).toContain('/dashboard/today')
    expect(chromeConfigSource).toContain('/service/photos')
    expect(chromeConfigSource).toContain('/service/selection')
  })
})
