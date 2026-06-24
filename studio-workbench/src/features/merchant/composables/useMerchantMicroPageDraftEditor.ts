import { computed, reactive, ref } from 'vue'
import type { MicroPageComponentSchema, MicroPageDto, MicroPagePayload } from '../../../shared/api/backend'
import {
  buildTemplateSchema,
  cloneSchema,
  createMicroPageComponent,
  draftAsPage,
  duplicateMicroPageComponent,
  emptyMicroPageDraft,
  microPageSavePayload,
  type BackendSupportedComponentType,
  type MicroPageDraftField,
  type MicroPageTemplateKey,
} from '../merchantMicroPagesOperations'

export const useMerchantMicroPageDraftEditor = ({
  getDefaultBookingLink,
}: {
  getDefaultBookingLink: () => string
}) => {
  const editorDraft = reactive<MicroPagePayload>(emptyMicroPageDraft())
  const selectedComponentId = ref('')
  const historyStack = ref<string[]>([])
  const historyIndex = ref(-1)

  const previewDraftPage = computed(() => draftAsPage(editorDraft))
  const selectedComponent = computed(() =>
    editorDraft.schema.components.find(component => component.id === selectedComponentId.value) ?? null,
  )

  const pushHistory = () => {
    const snapshot = JSON.stringify(editorDraft.schema)
    if (historyStack.value[historyIndex.value] === snapshot) return
    historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
    historyStack.value.push(snapshot)
    historyIndex.value = historyStack.value.length - 1
  }

  const applyHistory = (index: number) => {
    const snapshot = historyStack.value[index]
    if (!snapshot) return
    editorDraft.schema = JSON.parse(snapshot)
    historyIndex.value = index
    selectedComponentId.value = editorDraft.schema.components[0]?.id || ''
  }

  const undo = () => applyHistory(historyIndex.value - 1)
  const redo = () => applyHistory(historyIndex.value + 1)

  const mergeDraft = (page: MicroPageDto) => {
    Object.assign(editorDraft, {
      id: page.id,
      storeId: page.storeId,
      pageTitle: page.pageTitle,
      pageDesc: page.pageDesc,
      coverUrl: page.coverUrl,
      coverOssId: page.coverOssId,
      backgroundColor: page.backgroundColor || '#FBF8F2',
      editMode: page.editMode || 'COMPONENT',
      status: page.status || 'DRAFT',
      schema: cloneSchema(page.schema),
      linkKey: page.linkKey,
      remark: page.remark,
    })
    selectedComponentId.value = editorDraft.schema.components[0]?.id || ''
    historyStack.value = [JSON.stringify(editorDraft.schema)]
    historyIndex.value = 0
  }

  const resetDraft = () => {
    Object.assign(editorDraft, emptyMicroPageDraft())
    selectedComponentId.value = editorDraft.schema.components[0]?.id || ''
    historyStack.value = [JSON.stringify(editorDraft.schema)]
    historyIndex.value = 0
  }

  const updateDraftField = (key: MicroPageDraftField, value: string) => {
    editorDraft[key] = value
  }

  const createFromTemplate = (key: MicroPageTemplateKey) => {
    resetDraft()
    editorDraft.pageTitle = key === 'campaign' ? '营销活动页' : '产品详情页'
    editorDraft.pageDesc = key === 'campaign' ? '活动介绍与预约入口' : '产品卖点与门店承接'
    editorDraft.schema = buildTemplateSchema(key, getDefaultBookingLink())
    selectedComponentId.value = editorDraft.schema.components[0]?.id || ''
    pushHistory()
  }

  const createComponent = (type: BackendSupportedComponentType): MicroPageComponentSchema => {
    return createMicroPageComponent({
      type,
      currentCount: editorDraft.schema.components.length,
      defaultBookingLink: getDefaultBookingLink(),
    })
  }

  const addComponent = (type: BackendSupportedComponentType) => {
    const component = createComponent(type)
    editorDraft.schema.components.push(component)
    selectedComponentId.value = component.id
    pushHistory()
  }

  const moveComponent = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= editorDraft.schema.components.length) return
    const [component] = editorDraft.schema.components.splice(index, 1)
    editorDraft.schema.components.splice(target, 0, component)
    editorDraft.schema.components.forEach((item, order) => {
      item.sort = order + 1
    })
    pushHistory()
  }

  const duplicateComponent = (index: number) => {
    const source = editorDraft.schema.components[index]
    if (!source) return
    const clone = duplicateMicroPageComponent(source)
    editorDraft.schema.components.splice(index + 1, 0, clone)
    editorDraft.schema.components.forEach((item, order) => { item.sort = order + 1 })
    selectedComponentId.value = clone.id
    pushHistory()
  }

  const removeComponent = (index: number) => {
    const currentId = editorDraft.schema.components[index]?.id
    editorDraft.schema.components.splice(index, 1)
    editorDraft.schema.components.forEach((item, order) => { item.sort = order + 1 })
    if (selectedComponentId.value === currentId) {
      selectedComponentId.value = editorDraft.schema.components[0]?.id || ''
    }
    pushHistory()
  }

  const buildSavePayload = () => microPageSavePayload(editorDraft)

  return {
    editorDraft,
    selectedComponentId,
    historyStack,
    historyIndex,
    previewDraftPage,
    selectedComponent,
    pushHistory,
    undo,
    redo,
    mergeDraft,
    resetDraft,
    updateDraftField,
    createFromTemplate,
    addComponent,
    moveComponent,
    duplicateComponent,
    removeComponent,
    buildSavePayload,
  }
}
