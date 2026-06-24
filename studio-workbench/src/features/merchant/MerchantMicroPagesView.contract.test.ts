import { describe, expect, it } from 'vitest'
import microPagesSource from './MerchantMicroPagesView.vue?raw'
import dialogsSource from './components/MerchantMicroPageDialogs.vue?raw'
import editorShellSource from './components/MerchantMicroPageEditorShell.vue?raw'
import editorPanelSource from './components/MerchantMicroPageEditorPanel.vue?raw'
import filterBarSource from './components/MerchantMicroPageFilterBar.vue?raw'
import previewPhoneSource from './components/MerchantMicroPagePreviewPhone.vue?raw'
import propertyPanelSource from './components/MerchantMicroPagePropertyPanel.vue?raw'
import tableSource from './components/MerchantMicroPagesTable.vue?raw'
import componentEditorSource from './composables/useMerchantMicroPageComponentEditor?raw'
import draftEditorSource from './composables/useMerchantMicroPageDraftEditor?raw'
import operationsSource from './merchantMicroPagesOperations?raw'

const microPagesContractSource = [
  microPagesSource,
  dialogsSource,
  editorShellSource,
  editorPanelSource,
  filterBarSource,
  previewPhoneSource,
  propertyPanelSource,
  tableSource,
  componentEditorSource,
  draftEditorSource,
  operationsSource,
].join('\n')

describe('merchant micro pages contract', () => {
  it('renders the micro page management experience', () => {
    expect(microPagesSource).toContain('微页面')
    expect(microPagesSource).not.toContain('Micro Pages')
    expect(microPagesSource).toContain('微页面管理')
    expect(microPagesSource).toContain('从模板中创建')
    expect(microPagesSource).toContain('新增页面')
    expect(microPagesContractSource).toContain('推广')
    expect(microPagesContractSource).toContain('请选择要预览的页面')
  })

  it('uses real backend APIs and editor state instead of local mock rows', () => {
    expect(microPagesSource).toContain('backendApi.listMicroPages')
    expect(microPagesSource).toContain('backendApi.createMicroPage')
    expect(microPagesSource).toContain('backendApi.updateMicroPage')
    expect(microPagesSource).toContain('backendApi.publishMicroPage')
    expect(microPagesSource).toContain('backendApi.offlineMicroPage')
    expect(microPagesSource).toContain('backendApi.deleteMicroPage')
    expect(microPagesContractSource).toContain('defaultMicroPageSchema')
    expect(microPagesSource).not.toContain('merchantMicroPages.value')
  })

  it('keeps editor actions visible while each editor column scrolls independently', () => {
    expect(microPagesContractSource).toContain('max-h-[90vh]')
    expect(microPagesContractSource).toContain('overflow-hidden')
    expect(microPagesContractSource).toContain('overflow-y-auto')
    expect(microPagesContractSource).toContain('sticky top-0 z-10')
    expect(microPagesContractSource).toContain("@click=\"savePage\"")
  })

  it('only emits component types currently accepted by the micro page backend', () => {
    expect(microPagesContractSource).toContain("export const backendSupportedComponentTypes")
    for (const type of ['image', 'masonry', 'title', 'textnav', 'store', 'spacer', 'divider']) {
      expect(microPagesContractSource).toContain(`'${type}'`)
    }
    for (const unsupported of ['product', 'card', 'ad', 'groupbuy', 'contact']) {
      expect(microPagesContractSource).not.toContain(`createComponent('${unsupported}')`)
    }
  })

  it('uses the public renderer for phone preview instead of exposing schema JSON', () => {
    expect(microPagesContractSource).toContain("import MicroPageRenderer from '../../public/components/MicroPageRenderer.vue'")
    expect(microPagesContractSource).toContain('<MicroPageRenderer')
    expect(microPagesContractSource).not.toContain('h-[476px] overflow-y-auto')
    expect(microPagesContractSource).not.toContain('border-b border-[#EEE8DE] bg-white/90')
    expect(microPagesContractSource).not.toContain('componentPreviewTitle')
    expect(microPagesContractSource).not.toContain('componentPreviewHint')
    expect(microPagesContractSource).not.toContain("JSON.stringify({ ...props")
    expect(microPagesContractSource).not.toContain('schemaVersion=2，未知组件字段原样保留')
    expect(microPagesContractSource).toContain('编辑后先保存草稿，再发布到公开页')
  })

  it('exposes component-specific fields for staff micro page editing', () => {
    for (const label of ['标题对齐', '图片地址', '图片高度', '快捷入口', '添加入口', '样片列表', '添加样片', '门店地址', '联系电话', '营业时间', '留白高度']) {
      expect(microPagesContractSource).toContain(label)
    }
    expect(microPagesContractSource).toContain('updateComponentProp')
    expect(microPagesContractSource).toContain('updateListItem')
    expect(microPagesContractSource).toContain('addListItem')
    expect(microPagesContractSource).toContain('removeListItem')
  })

  it('creates useful default templates with customer-facing copy and local assets', () => {
    expect(microPagesContractSource).toContain('影约云预约拍摄')
    expect(microPagesContractSource).toContain('门店拍摄环境')
    expect(microPagesContractSource).toContain('样片展示')
    expect(microPagesContractSource).toContain('立即预约')
    expect(microPagesContractSource).toContain('defaultBookingLink.value')
    expect(microPagesContractSource).toContain('getSamplePhotoImage')
    expect(microPagesContractSource).toContain('workbenchImages.storeFront')
    expect(microPagesContractSource).not.toContain("text: '页面标题'")
    expect(microPagesContractSource).not.toContain("text: '图片组件'")
    expect(microPagesContractSource).not.toContain("text: '文本导航'")
  })

  it('binds micro page booking CTA to published micro forms without creating orders directly', () => {
    expect(microPagesSource).toContain('type MicroFormDto')
    expect(microPagesSource).toContain('publishedMicroForms')
    expect(microPagesSource).toContain('backendApi.listMicroForms')
    expect(microPagesSource).toContain("status: 'PUBLISHED'")
    expect(microPagesSource).toContain('VITE_PUBLIC_MICRO_FORM_BASE_URL')
    expect(microPagesContractSource).toContain('microFormLink')
    expect(microPagesContractSource).toContain('appendMicroFormQuery')
    expect(microPagesContractSource).toContain('appendStoreScope')
    expect(microPagesContractSource).toContain('form.storeId || storeId')
    expect(microPagesSource).toContain('microFormIdForLink')
    expect(microPagesSource).toContain('bindMicroFormLink')
    expect(microPagesContractSource).toContain('绑定微表单')
    expect(microPagesContractSource).toContain('暂无已发布微表单')
    expect(microPagesSource).not.toContain('createOrder')
    expect(microPagesSource).not.toContain('createAppointment')
    expect(microPagesSource).not.toContain('booking_slot_inventory')
  })

  it('keeps publish preview links and bound CTA links scoped to the visible store when needed', () => {
    expect(microPagesContractSource).toContain('export const appendStoreScope = (url: string, storeId?: string | null)')
    expect(microPagesContractSource).toContain('return appendStoreScope(link, form.storeId || storeId)')
    expect(microPagesContractSource).toContain('const pageLinkBase =')
    expect(microPagesContractSource).toContain('return appendStoreScope(pageLinkBase, page.storeId)')
    expect(microPagesSource).toContain('microFormLink(form, publicMicroFormBaseUrl.value, editorDraft.storeId)')
    expect(microPagesContractSource).toContain("updateListItem(component, 'items', index, 'link', form ? microFormLink(form, getPublicMicroFormBaseUrl(), getStoreId()) : '#store')")
  })

  it('keeps micro-page table actions real and promotion as an explicit link/qr fallback', () => {
    expect(microPagesContractSource).toContain('@click="$emit(\'editPage\', page)"')
    expect(microPagesContractSource).toContain('@click="$emit(\'copyPage\', page)"')
    expect(microPagesContractSource).toContain('@click="$emit(\'promotePage\', page)"')
    expect(microPagesContractSource).toContain('@click="$emit(\'togglePublish\', page)"')
    expect(microPagesContractSource).toContain('@click="confirmDelete"')
    expect(microPagesContractSource).toContain('QrcodeVue')
    expect(microPagesContractSource).toContain("copyLink(pageLink(promotionPage), 'promotion-link')")
    expect(microPagesSource).toContain('window.open(pageLink(page)')
    expect(microPagesSource).not.toContain('@click="() => {}"')
  })

  it('keeps draft, history, templates, and component ordering in a dedicated editor owner', () => {
    expect(microPagesSource).toContain('useMerchantMicroPageDraftEditor')
    expect(draftEditorSource).toContain('editorDraft = reactive<MicroPagePayload>')
    expect(draftEditorSource).toContain('historyStack = ref<string[]>')
    expect(draftEditorSource).toContain('mergeDraft')
    expect(draftEditorSource).toContain('resetDraft')
    expect(draftEditorSource).toContain('createFromTemplate')
    expect(draftEditorSource).toContain('addComponent')
    expect(draftEditorSource).toContain('moveComponent')
    expect(draftEditorSource).toContain('duplicateComponent')
    expect(draftEditorSource).toContain('removeComponent')
    expect(draftEditorSource).toContain('microPageSavePayload(editorDraft)')
    expect(draftEditorSource).not.toContain('backendApi.')
    expect(draftEditorSource).not.toContain('window.open')
  })
})
