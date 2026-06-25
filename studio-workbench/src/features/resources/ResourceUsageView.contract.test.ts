import { describe, expect, it } from 'vitest'
import viewSource from './ResourceUsageView.vue?raw'
import cardsSource from './components/ResourceUsageSummaryCards.vue?raw'
import breakdownSource from './components/ResourceUsageBreakdown.vue?raw'
import composableSource from './composables/useResourceUsage.ts?raw'
import operationsSource from './resourceUsageOperations.ts?raw'

const contractSource = [viewSource, cardsSource, breakdownSource, composableSource, operationsSource].join('\n')

describe('resource usage contract', () => {
  it('renders quota and breakdown from the dedicated usage owner', () => {
    expect(contractSource).toContain('ResourceUsageSummaryCards')
    expect(contractSource).toContain('ResourceUsageBreakdown')
    expect(composableSource).toContain('resourcesApi.getResourceUsageSummary')
  })

  it('exposes a controlled historical size backfill action', () => {
    expect(viewSource).toContain('runSizeBackfill')
    expect(viewSource).toContain('backfillButtonText')
    expect(composableSource).toContain('resourcesApi.backfillResourceSizes')
    expect(operationsSource).toContain('buildSizeBackfillResultText')
  })

  it('loads feature scope before usage reads and backfill writes', () => {
    expect(viewSource).toContain('FeatureGateStatusCard')
    expect(viewSource).toContain('v-if="canLoadData"')
    expect(composableSource).toContain("featureKey: 'resource-usage'")
    expect(composableSource).toContain('featureGate.loadGate()')
  })

  it('keeps partial file size backfill visible to staff', () => {
    expect(operationsSource).toContain('file_size_bytes')
    expect(operationsSource).toContain('未回填')
  })
})
