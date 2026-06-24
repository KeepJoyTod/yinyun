import { describe, expect, it } from 'vitest'
import gateSource from './useMarketingCapabilityGate.ts?raw'

describe('marketing capability gate contract', () => {
  it('routes marketing capability cards through the shared feature gate facade', () => {
    expect(gateSource).toContain('resolveFeatureGate')
    expect(gateSource).toContain('marketingCapabilityFeatureKeyMap')
    expect(gateSource).toContain('requireStoreScope: true')
  })
})
