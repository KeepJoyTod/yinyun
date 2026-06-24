import { describe, expect, it } from 'vitest'
import customerLoginSource from '../views/CustomerLoginView.vue?raw'
import customerAlbumsSource from '../views/CustomerAlbumsView.vue?raw'
import customerAlbumDetailSource from '../views/CustomerAlbumDetailView.vue?raw'
import customerResultSource from '../views/CustomerResultView.vue?raw'
import routerSource from '../router/index.ts?raw'
import entryContractsSource from './entryContracts.ts?raw'

describe('customer result page contracts', () => {
  it('declares a dedicated customer result route', () => {
    expect(entryContractsSource).toContain("customerResult: '/customer/result'")
    expect(routerSource).toContain('CLIENT_WEB_ROUTES.customerResult')
    expect(routerSource).toContain("name: 'CustomerResult'")
    expect(routerSource).toContain("import('../views/CustomerResultView.vue')")
  })

  it('routes customer-facing pickup failures to the result page', () => {
    expect(customerLoginSource).toContain('goCustomerResult')
    expect(customerLoginSource).toContain('reason: errorMessage')
    expect(customerAlbumsSource).toContain('goCustomerResult')
    expect(customerAlbumsSource).toContain("source: 'albums'")
    expect(customerAlbumDetailSource).toContain('goCustomerResult')
    expect(customerAlbumDetailSource).toContain("source: 'album-detail'")
  })

  it('shows clear recovery actions for invalid code, no access and expired album states', () => {
    expect(customerResultSource).toContain('customer-result-page')
    expect(customerResultSource).toContain('customer-result-card')
    expect(customerResultSource).toContain('resultReasonLabel')
    expect(customerResultSource).toContain('重新取片')
    expect(customerResultSource).toContain('小程序预约')
    expect(customerResultSource).toContain('联系门店')
    expect(customerResultSource).toContain('INVALID_CODE')
    expect(customerResultSource).toContain('NO_ACCESS')
    expect(customerResultSource).toContain('EXPIRED')
  })

  it('shows support context and next steps instead of a dead end', () => {
    expect(customerResultSource).toContain('customer-result-next-steps')
    expect(customerResultSource).toContain('resultNextSteps')
    expect(customerResultSource).toContain('处理建议')
    expect(customerResultSource).toContain('customer-result-support-card')
    expect(customerResultSource).toContain('门店协助')
    expect(customerResultSource).toContain('拨打门店电话')
    expect(customerResultSource).toContain('sourceLabel')
  })
})
