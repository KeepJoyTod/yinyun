import { describe, expect, it } from 'vitest'
import editorSource from './MerchantMicroFormEditorView.vue?raw'
import operationsSource from './merchantMicroFormEditorOperations.ts?raw'

const editorContractSource = `${editorSource}\n${operationsSource}`

describe('merchant micro form editor contract', () => {
  it('keeps the builder shell and real backend load/save flow', () => {
    expect(editorSource).toContain('表单搭建')
    expect(editorSource).not.toContain('Form Builder')
    expect(editorSource).toContain('backendApi.getMicroForm')
    expect(editorSource).toContain('backendApi.createMicroForm')
    expect(editorSource).toContain('backendApi.updateMicroForm')
    expect(editorSource).toContain('appStore.stores')
    expect(editorSource).toContain('适用门店')
    expect(editorSource).toContain('v-model="draft.storeId"')
    expect(editorSource).toContain('schemaVersion: 2')
  })

  it('implements rules visibility binding and privacy editing', () => {
    expect(editorSource).toContain('最小长度')
    expect(editorSource).toContain('最大长度')
    expect(editorSource).toContain('正则校验')
    expect(editorSource).toContain('自定义错误提示')
    expect(editorSource).toContain('唯一性提示')
    expect(editorSource).toContain('条件显隐')
    expect(editorSource).toContain('来源参数名')
    expect(editorSource).toContain('绑定门店')
    expect(editorSource).toContain('绑定服务组')
    expect(editorSource).toContain('隐私协议')
  })

  it('normalizes extended field schema back into the payload', () => {
    expect(editorContractSource).toContain('normalizeField')
    expect(editorContractSource).toContain('field.rules')
    expect(editorContractSource).toContain('field.visibility')
    expect(editorContractSource).toContain('field.binding')
    expect(editorContractSource).toContain('field.privacy')
  })

  it('keeps unbound all-store micro forms admin-only and normalizes staff drafts to concrete stores', () => {
    expect(editorSource).toContain('studioAccessStore')
    expect(editorSource).toContain('canUseGlobalStoreScope')
    expect(editorSource).toContain('concreteStoreOptions')
    expect(editorSource).toContain('ensureWorkbenchStores')
    expect(editorSource).toContain('normalizeDraftStoreId')
    expect(editorSource).toContain('<option v-if="canUseGlobalStoreScope" :value="null">全部门店 / 不绑定</option>')
    expect(editorSource).toContain('if (!canUseGlobalStoreScope.value && !draft.storeId)')
    expect(editorSource).toContain('draft.storeId = normalizeDraftStoreId()')
  })
})
