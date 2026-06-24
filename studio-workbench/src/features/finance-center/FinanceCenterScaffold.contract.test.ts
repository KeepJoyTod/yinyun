import { describe, expect, it } from 'vitest'
import overviewSource from './FinanceOverviewView.vue?raw'
import transactionsSource from './FinanceTransactionsView.vue?raw'
import scaffoldsSource from './financeCenterScaffolds.ts?raw'

describe('finance center scaffold contract', () => {
  it('keeps finance center pages on the shared scaffold owner', () => {
    expect(overviewSource).toContain('ModuleScaffoldView')
    expect(transactionsSource).toContain('ModuleScaffoldView')
    expect(overviewSource).toContain('useModuleScaffold')
    expect(transactionsSource).toContain('useModuleScaffold')
    expect(scaffoldsSource).toContain("featureKey: 'finance-overview'")
    expect(scaffoldsSource).toContain("featureKey: 'finance-transactions'")
    expect(scaffoldsSource).toContain('backendFinanceApi.ts')
  })
})
