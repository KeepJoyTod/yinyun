import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedMemberModuleView.vue?raw'

describe('derived member module pages contract', () => {
  it('keeps customer tags on the shared derived member route', () => {
    expect(routerSource).toContain('DerivedMemberModuleView.vue')
    expect(getWorkbenchFeature('member-tags')?.component).toBe('derived-member-module')
    expect(getWorkbenchFeature('member-tags')?.status).toBe('derived')
    expect(getWorkbenchFeature('member-tags')?.permission).toBe('yy:customer:list')
  })

  it('uses unified customer data without creating a second tag ledger', () => {
    expect(viewSource).toContain('buildDerivedMemberItems')
    expect(viewSource).toContain('appStore.customers')
    expect(viewSource).toContain('yy_customer.tags')
    expect(viewSource).toContain('不在工作台创建第二套标签账本')
    expect(viewSource).not.toContain('saveCustomerTag')
  })
})
