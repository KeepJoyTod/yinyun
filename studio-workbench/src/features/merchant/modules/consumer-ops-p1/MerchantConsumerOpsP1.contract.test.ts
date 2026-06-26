import { describe, expect, it } from 'vitest'
import viewSource from './MerchantConsumerOpsP1View.vue?raw'
import stateSource from './composables/useMerchantConsumerOpsP1State.ts?raw'
import operationsSource from './merchantConsumerOpsP1Operations.ts?raw'
import apiSource from '../../../../shared/api/backendConsumerOpsP1Api.ts?raw'

describe('merchant consumer ops p1 scaffold contract', () => {
  it('keeps the owner page wired to one state owner and status presenter', () => {
    expect(viewSource).toContain('MerchantModuleChrome')
    expect(viewSource).toContain('useMerchantConsumerOpsP1State')
    expect(viewSource).toContain('consumerOpsP1StatusLabel')
    expect(viewSource).toContain('consumerOpsP1RiskLabel')
    expect(viewSource).toContain('overview && overview.items.length === 0')
  })

  it('keeps API normalization and summary logic outside the page template', () => {
    expect(stateSource).toContain('consumerOpsP1Api.getConsumerOpsP1Overview')
    expect(stateSource).toContain('buildConsumerOpsP1Summary')
    expect(operationsSource).toContain('buildConsumerOpsP1Summary')
    expect(operationsSource).toContain("item.status === 'SCAFFOLD'")
    expect(apiSource).toContain('/yy/merchant/consumer-ops-p1/overview')
    expect(apiSource).toContain('normalizeStatus')
    expect(apiSource).toContain('normalizeRisk')
  })
})
