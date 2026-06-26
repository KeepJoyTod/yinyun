import { describe, expect, it } from 'vitest'
import source from './MerchantDependencyReadinessView.vue?raw'

describe('merchant dependency readiness owner', () => {
  it('uses the shared readiness owner shell with the dependencies section', () => {
    expect(source).toContain('MerchantReadinessOwnerShell')
    expect(source).toContain('section-key="dependencies"')
    expect(source).toContain('dependency-readiness')
  })
})
