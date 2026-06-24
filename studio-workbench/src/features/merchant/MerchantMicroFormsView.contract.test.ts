import { describe, expect, it } from 'vitest'
import microFormsSource from './MerchantMicroFormsView.vue?raw'
import promotionDialogSource from './components/MerchantMicroFormPromotionDialog.vue?raw'
import submissionDrawerSource from './components/MerchantMicroFormSubmissionDrawer.vue?raw'
import moduleViewSource from './modules/content/MerchantContentView.vue?raw'
import scopeBarSource from './modules/content/components/MerchantContentScopeBar.vue?raw'
import stateSource from './modules/content/composables/useMerchantContentState.ts?raw'
import moduleOperationsSource from './modules/content/merchantContentOperations.ts?raw'
import operationsSource from './merchantMicroFormsOperations.ts?raw'

const microFormsContractSource = `${microFormsSource}\n${promotionDialogSource}\n${submissionDrawerSource}\n${moduleViewSource}\n${scopeBarSource}\n${stateSource}\n${moduleOperationsSource}\n${operationsSource}`

describe('merchant micro forms contract', () => {
  it('renders the micro form management table and preview surface', () => {
    expect(microFormsSource).toContain('MerchantModuleChrome')
    expect(moduleViewSource).toContain('MerchantMicroFormsView')
    expect(microFormsContractSource).toContain('MerchantContentScopeBar')
    expect(microFormsSource).toContain('Micro Forms')
    expect(microFormsSource).toContain('微表单管理')
  })

  it('keeps real backend APIs and publish actions available', () => {
    expect(microFormsContractSource).toContain('useMerchantContentState')
    expect(microFormsContractSource).toContain('backendApi.listMicroForms')
    expect(microFormsSource).toContain('publishMicroForm')
    expect(microFormsSource).toContain('offlineMicroForm')
  })

  it('adds in-page submissions drawer while preserving order-page deep link', () => {
    expect(microFormsSource).toContain('openSubmissionDrawer(form)')
    expect(microFormsSource).toContain('submissionDrawerOpen')
    expect(microFormsSource).toContain('backendApi.listMicroFormSubmissions')
    expect(microFormsSource).toContain('backendApi.updateMicroFormSubmissionFollow')
    expect(microFormsSource).toContain("router.push({ path: '/order/forms'")
  })

  it('keeps micro forms scoped by real store for daily operations', () => {
    expect(microFormsContractSource).toContain('appStore.stores')
    expect(microFormsSource).toContain('storeFilter')
    expect(microFormsContractSource).toContain('concreteStoreOptions')
    expect(microFormsContractSource).toContain('applyStoreScope')
    expect(microFormsContractSource).toContain('ensureWorkbenchStores')
  })
})
