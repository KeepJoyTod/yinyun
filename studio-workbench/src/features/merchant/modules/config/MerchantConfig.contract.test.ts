import { describe, expect, it } from 'vitest'
import wrapperSource from './MerchantConfigView.vue?raw'
import scopeBarSource from './components/MerchantConfigScopeBar.vue?raw'
import stateSource from './composables/useMerchantConfigState.ts?raw'
import operationsSource from './merchantConfigOperations.ts?raw'

describe('merchant config module scaffold', () => {
  it('owns config entry, scope bar, state, and operations files', () => {
    const source = `${wrapperSource}\n${scopeBarSource}\n${stateSource}\n${operationsSource}`
    expect(source).toContain('ServiceGroupsView')
    expect(wrapperSource).toContain('OrderAttributesView')
    expect(source).toContain('useMerchantConfigState')
    expect(source).toContain('yy-filter-bar')
    expect(source).toContain('serviceGroupOperations')
  })
})
