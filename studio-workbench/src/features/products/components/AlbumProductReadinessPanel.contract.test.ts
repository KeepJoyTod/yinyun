import { describe, expect, it } from 'vitest'
import panelSource from './AlbumProductReadinessPanel.vue?raw'

describe('album product readiness panel contract', () => {
  it('keeps fulfillment evidence optional and rendered as a dedicated section', () => {
    expect(panelSource).toContain('evidence?: AlbumProductFulfillmentEvidence')
    expect(panelSource).toContain('v-if="evidence"')
    expect(panelSource).toContain('evidence.summary')
    expect(panelSource).toContain('v-for="item in evidence.items"')
  })
})
