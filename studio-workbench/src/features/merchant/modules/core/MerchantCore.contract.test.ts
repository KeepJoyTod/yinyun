import { describe, expect, it } from 'vitest'
import wrapperSource from './MerchantCoreView.vue?raw'
import metricsPanelSource from './components/MerchantOverviewMetricsPanel.vue?raw'
import stateSource from './composables/useMerchantCoreState.ts?raw'
import operationsSource from './merchantCoreOperations.ts?raw'

const coreContractSource = `${wrapperSource}\n${metricsPanelSource}\n${stateSource}\n${operationsSource}`

describe('merchant core module scaffold', () => {
  it('owns the core module entry, state, and operations files', () => {
    expect(coreContractSource).toContain('MerchantOverviewView')
    expect(coreContractSource).toContain('useMerchantCoreState')
    expect(coreContractSource).toContain('buildMerchantOverviewMetrics')
    expect(coreContractSource).toContain('metrics')
  })
})
