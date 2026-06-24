import { describe, expect, it } from 'vitest'
import wrapperSource from './MerchantDecorationModuleView.vue?raw'
import panelSource from './components/MerchantDecorationPublishPanel.vue?raw'
import stateSource from './composables/useMerchantDecorationState.ts?raw'
import operationsSource from './merchantDecorationModuleOperations.ts?raw'

describe('merchant decoration module scaffold', () => {
  it('owns decoration entry, panel, state, and operations files', () => {
    const source = `${wrapperSource}\n${panelSource}\n${stateSource}\n${operationsSource}`
    expect(source).toContain('MerchantDecorationView')
    expect(source).toContain('useMerchantDecorationState')
    expect(source).toContain('statusText')
    expect(source).toContain('merchantDecorationOperations')
  })
})
