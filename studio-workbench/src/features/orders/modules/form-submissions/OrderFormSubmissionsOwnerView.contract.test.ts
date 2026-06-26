import { describe, expect, it } from 'vitest'
import routerSource from '../../../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../../../app/router/featureRegistry'
import ownerViewSource from './OrderFormSubmissionsOwnerView.vue?raw'
import pageSource from '../../OrderFormSubmissionsView.vue?raw'
import merchantContentApiSource from '../../../../shared/api/backendMerchantContentApi.ts?raw'

const contractSource = `${ownerViewSource}\n${pageSource}\n${merchantContentApiSource}`

describe('order form submissions owner contract', () => {
  it('mounts a dedicated order form submissions owner route', () => {
    expect(routerSource).toContain('OrderFormSubmissionsOwnerView.vue')
    expect(getWorkbenchFeature('order-forms')?.component).toBe('order-form-submissions')
    expect(getWorkbenchFeature('order-forms')?.status).toBe('ready')
    expect(getWorkbenchFeature('order-forms')?.permission).toBe('yy:order:list')
  })

  it('keeps query, follow update, export and convert-to-booking on one owner page', () => {
    expect(ownerViewSource).toContain('OrderFormSubmissionsView')
    expect(pageSource).toContain('backendApi.listMicroFormSubmissions')
    expect(pageSource).toContain('backendApi.updateMicroFormSubmissionFollow')
    expect(pageSource).toContain('backendApi.exportMicroFormSubmissions')
    expect(pageSource).toContain('convertSubmissionToBooking')
  })

  it('passes export filters through the dedicated content api slice', () => {
    expect(contractSource).toContain("params.set('formId'")
    expect(contractSource).toContain("params.set('customerName'")
    expect(contractSource).toContain("params.set('customerPhone'")
    expect(contractSource).toContain("params.set('followStatus'")
    expect(contractSource).toContain("'application/x-www-form-urlencoded'")
  })
})
