import { describe, expect, it } from 'vitest'
import wrapperSource from './MerchantContentView.vue?raw'
import scopeBarSource from './components/MerchantContentScopeBar.vue?raw'
import stateSource from './composables/useMerchantContentState.ts?raw'
import operationsSource from './merchantContentOperations.ts?raw'

describe('merchant content module scaffold', () => {
  it('owns content entry, scope bar, state, and operations files', () => {
    const source = `${wrapperSource}\n${scopeBarSource}\n${stateSource}\n${operationsSource}`
    expect(source).toContain('MerchantMicroFormsView')
    expect(source).toContain('useMerchantContentState')
    expect(source).toContain('请输入表单名称')
    expect(source).toContain('merchantMicroFormsOperations')
  })
})
