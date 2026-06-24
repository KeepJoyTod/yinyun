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
    expect(composableSource).toContain('backendApi.getResourceUsageSummary')
  })

  it('keeps partial file size backfill visible to staff', () => {
    expect(operationsSource).toContain('file_size_bytes')
    expect(operationsSource).toContain('未回填')
  })
})
