import { describe, expect, it } from 'vitest'
import microFormsSource from './MerchantMicroFormsView.vue?raw'
import promotionDialogSource from './components/MerchantMicroFormPromotionDialog.vue?raw'
import submissionDrawerSource from './components/MerchantMicroFormSubmissionDrawer.vue?raw'
import operationsSource from './merchantMicroFormsOperations.ts?raw'

const microFormsContractSource = `${microFormsSource}\n${promotionDialogSource}\n${submissionDrawerSource}\n${operationsSource}`

describe('merchant micro forms contract', () => {
  it('renders the micro form management table and preview surface', () => {
    expect(microFormsSource).toContain('MerchantModuleChrome')
    expect(microFormsSource).toContain('Micro Forms')
    expect(microFormsSource).toContain('微表单管理')
    expect(microFormsSource).toContain('VITE_PUBLIC_MICRO_FORM_BASE_URL')
    expect(microFormsSource).toContain('复制微信链接')
    expect(microFormsSource).toContain('新增表单')
    expect(microFormsSource).toContain('表单名称')
    expect(microFormsSource).toContain('适用门店')
    expect(microFormsSource).toContain('提交数量')
  })

  it('keeps real backend APIs and publish actions available', () => {
    expect(microFormsSource).toContain('merchantMicroForms')
    expect(microFormsSource).toContain('filteredForms')
    expect(microFormsSource).toContain('keyword')
    expect(microFormsSource).toContain('status')
    expect(microFormsContractSource).toContain('statusClass')
    expect(microFormsSource).toContain('backendApi.listMicroForms')
    expect(microFormsSource).toContain('publishMicroForm')
    expect(microFormsSource).toContain('offlineMicroForm')
  })

  it('adds in-page submissions drawer while preserving order-page deep link', () => {
    expect(microFormsSource).toContain('openSubmissionDrawer(form)')
    expect(microFormsSource).toContain('submissionDrawerOpen')
    expect(microFormsSource).toContain('backendApi.listMicroFormSubmissions')
    expect(microFormsSource).toContain('backendApi.updateMicroFormSubmissionFollow')
    expect(microFormsContractSource).toContain('前往订单-表单管理')
    expect(microFormsSource).toContain("router.push({ path: '/order/forms'")
  })

  it('uses the same follow status values as the backend ledger', () => {
    expect(microFormsContractSource).toContain('value="PENDING"')
    expect(microFormsContractSource).toContain('value="FOLLOWED"')
    expect(microFormsContractSource).toContain('value="CLOSED"')
    expect(microFormsContractSource).not.toContain('value="FOLLOWING"')
    expect(microFormsContractSource).not.toContain('value="DONE"')
  })

  it('keeps promotion QR flow and adds dual-mode fan QR entry', () => {
    expect(microFormsContractSource).toContain('QrcodeVue')
    expect(microFormsContractSource).toContain('创建吸粉二维码')
    expect(microFormsContractSource).toContain('可追踪来源的普通推广二维码')
  })

  it('carries bound store context into copied and QR public links', () => {
    expect(microFormsContractSource).toContain('appendMicroFormQuery')
    expect(microFormsContractSource).toContain('appendStoreScope')
    expect(microFormsSource).toContain('promotionLink')
    expect(microFormsSource).toContain('selectedLink')
  })

  it('falls back to the current visible store scope when a published form itself is unbound', () => {
    expect(microFormsContractSource).toContain('const appendStoreScope = (url: string, storeId?: string | null)')
    expect(microFormsContractSource).toContain('const effectiveStoreId = form.storeId || storeFilter')
    expect(microFormsContractSource).toContain('return appendStoreScope(link, effectiveStoreId)')
  })

  it('keeps micro forms scoped by real store for daily operations', () => {
    expect(microFormsSource).toContain('appStore.stores')
    expect(microFormsSource).toContain('storeFilter')
    expect(microFormsSource).toContain('concreteStoreOptions')
    expect(microFormsSource).toContain('normalizeStoreFilter')
    expect(microFormsSource).toContain('ensureWorkbenchStores')
    expect(microFormsSource).toContain('await ensureWorkbenchStores()')
    expect(microFormsSource).not.toContain('<option value="">全部门店</option>')
    expect(microFormsSource).toContain('storeNameForForm')
    expect(microFormsSource).toContain("backendApi.listMicroForms({")
    expect(microFormsSource).toContain('storeId: storeFilter.value || undefined')
    expect(microFormsContractSource).toContain('filterMicroForms')
    expect(microFormsContractSource).toContain('form.storeId === storeFilter')
  })
})
