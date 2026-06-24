<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-5 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <div class="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-text-muted">微页面</div>
          <h2 class="mt-2 text-[22px] font-semibold leading-tight text-amber-dark">微页面管理</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark hover:bg-white" type="button" @click="showTemplateDialog = true">
            从模板中创建
          </button>
          <button class="yy-action bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] hover:bg-black" type="button" @click="openCreateDialog">
            新增页面
          </button>
        </div>
      </div>

      <MerchantMicroPageFilterBar v-model:keyword="keyword" v-model:status="status" @search="loadPages" @reset="resetFilters" />

      <div v-if="notice" class="border-b border-amber-topbar-border px-5 py-3">
        <NoticeBanner :notice="notice" />
      </div>

      <div class="grid gap-5 p-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <MerchantMicroPagePreviewPhone
          :preview-page="previewPage"
          :preview-components="previewComponents"
          :selected-link="selectedLink"
          :copy-selected-link="copySelectedLink"
        />

        <MerchantMicroPagesTable
          :pages="pages"
          :selected-page-id="selectedPageId"
          :status-label="statusLabel"
          :status-class="statusClass"
          :page-link="pageLink"
          @select-page="selectPage"
          @edit-page="openEditDialog"
          @copy-page="copyPage"
          @promote-page="openPromoteDialog"
          @preview-page="openPreview"
          @toggle-publish="togglePublish"
          @delete-page="deleteTarget = $event"
          @copy-link="copyLink"
        />
      </div>
    </section>

    <Teleport to="body">
      <MerchantMicroPageEditorShell
        :editor-visible="editorVisible"
        :component-catalog="componentCatalog"
        :editor-draft="editorDraft"
        :selected-component-id="selectedComponentId"
        :selected-component="selectedComponent"
        :history-stack="historyStack"
        :history-index="historyIndex"
        :saving="saving"
        :published-micro-forms="publishedMicroForms"
        :micro-forms-loading="microFormsLoading"
        :update-draft-field="updateDraftField"
        :select-component="selectComponent"
        :close-editor="closeEditor"
        :save-page="savePage"
        :add-component="addComponent"
        :move-component="moveComponent"
        :duplicate-component="duplicateComponent"
        :remove-component="removeComponent"
        :undo="undo"
        :redo="redo"
        :component-primary-text="componentPrimaryText"
        :component-secondary-text="componentSecondaryText"
        :component-prop="componentProp"
        :component-items="componentItems"
        :list-item-value="listItemValue"
        :micro-form-id-for-link="microFormIdForLink"
        :update-component-title="updateComponentTitle"
        :update-primary-text="updatePrimaryText"
        :update-secondary-text="updateSecondaryText"
        :update-component-prop="updateComponentProp"
        :update-component-number-prop="updateComponentNumberProp"
        :update-list-item="updateListItem"
        :add-list-item="addListItem"
        :remove-list-item="removeListItem"
        :bind-micro-form-link="bindMicroFormLink"
      />

      <MerchantMicroPageDialogs
        :show-template-dialog="showTemplateDialog"
        :templates="templates"
        :promotion-page="promotionPage"
        :delete-target="deleteTarget"
        :copied-key="copiedKey"
        :page-link="pageLink"
        :copy-link="copyLink"
        :create-from-template="createFromTemplate"
        :close-template-dialog="closeTemplateDialog"
        :close-promotion-dialog="closePromotionDialog"
        :close-delete-dialog="closeDeleteDialog"
        :confirm-delete="confirmDelete"
      />
    </Teleport>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import MerchantMicroPageDialogs from './components/MerchantMicroPageDialogs.vue'
import MerchantMicroPageEditorShell from './components/MerchantMicroPageEditorShell.vue'
import MerchantMicroPageFilterBar from './components/MerchantMicroPageFilterBar.vue'
import MerchantMicroPagePreviewPhone from './components/MerchantMicroPagePreviewPhone.vue'
import MerchantMicroPagesTable from './components/MerchantMicroPagesTable.vue'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import {
  backendApi,
  type MicroFormDto,
  type MicroPageDto,
} from '../../shared/api/backend'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { useNotice } from '../../shared/composables/useNotice'
import {
  buildMicroPageLink,
  cloneSchema,
  componentCatalog,
  componentItems,
  componentPrimaryText,
  componentProp,
  componentSecondaryText,
  listItemValue,
  microFormLink,
  statusClass,
  statusLabel,
  templates,
  validateDraft,
  type MicroPageTemplateKey,
} from './merchantMicroPagesOperations'
import { useMerchantMicroPageComponentEditor } from './composables/useMerchantMicroPageComponentEditor'
import { useMerchantMicroPageDraftEditor } from './composables/useMerchantMicroPageDraftEditor'

const { copiedKey, copyText } = useCopyWithState()

const pages = ref<MicroPageDto[]>([])
const publishedMicroForms = ref<MicroFormDto[]>([])
const keyword = ref('')
const status = ref('')
const microFormsLoading = ref(false)
const saving = ref(false)
const selectedPageId = ref('')
const promotionPage = ref<MicroPageDto | null>(null)
const deleteTarget = ref<MicroPageDto | null>(null)
const showTemplateDialog = ref(false)
const editorVisible = ref(false)
const { notice, pushNotice } = useNotice()

const publicBaseUrl = computed(() => {
  const configured = import.meta.env.VITE_PUBLIC_MICRO_PAGE_BASE_URL
  return configured || `${window.location.origin}/public/micro-page/{id}`
})

const publicMicroFormBaseUrl = computed(() => {
  const configured = import.meta.env.VITE_PUBLIC_MICRO_FORM_BASE_URL
  return configured || 'https://weixin.yuyue123.cn/wx/?bid=sg9ix50p#/smallform/index'
})

const selectedPage = computed(() => pages.value.find(page => page.id === selectedPageId.value) ?? null)
const previewPage = computed(() => editorVisible.value ? previewDraftPage.value : selectedPage.value)
const previewComponents = computed(() => [...(previewPage.value?.schema.components ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))
const selectedLink = computed(() => previewPage.value ? pageLink(previewPage.value) : '')

const showNotice = (type: 'info' | 'error', text: string) => {
  pushNotice(type === 'error' ? 'error' : 'success', text)
}

const pageLink = (page: Pick<MicroPageDto, 'id' | 'linkKey' | 'storeId'>) => {
  return buildMicroPageLink(page, publicBaseUrl.value)
}

const defaultBookingLink = computed(() => {
  const form = publishedMicroForms.value[0]
  return form ? microFormLink(form, publicMicroFormBaseUrl.value, editorDraft.storeId) : '#store'
})

const microFormIdForLink = (link: string) => {
  const normalized = link.trim()
  return publishedMicroForms.value.find(form => microFormLink(form, publicMicroFormBaseUrl.value, editorDraft.storeId) === normalized)?.id || ''
}

const {
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
  createFromTemplate: createDraftFromTemplate,
  addComponent,
  moveComponent,
  duplicateComponent,
  removeComponent,
  buildSavePayload,
} = useMerchantMicroPageDraftEditor({
  getDefaultBookingLink: () => defaultBookingLink.value,
})

const {
  addListItem,
  bindMicroFormLink,
  removeListItem,
  updateComponentNumberProp,
  updateComponentProp,
  updateComponentTitle,
  updateListItem,
  updatePrimaryText,
  updateSecondaryText,
} = useMerchantMicroPageComponentEditor({
  getPublicMicroFormBaseUrl: () => publicMicroFormBaseUrl.value,
  getStoreId: () => editorDraft.storeId,
  getPublishedMicroForms: () => publishedMicroForms.value,
  pushHistory,
})

const loadPages = async () => {
  try {
    const page = await backendApi.listMicroPages({
      pageTitle: keyword.value || undefined,
      status: status.value || undefined,
      pageSize: 100,
    })
    pages.value = page.items
    if (!selectedPageId.value || !page.items.some(item => item.id === selectedPageId.value)) {
      selectedPageId.value = page.items[0]?.id ?? ''
    }
  } catch (error) {
    pages.value = []
    selectedPageId.value = ''
    showNotice('error', error instanceof Error ? `微页面加载失败：${error.message}` : '微页面加载失败')
  }
}

const loadPublishedMicroForms = async () => {
  microFormsLoading.value = true
  try {
    const page = await backendApi.listMicroForms({
      status: 'PUBLISHED',
      pageSize: 100,
    })
    publishedMicroForms.value = page.items.filter(form => form.status === 'PUBLISHED')
  } catch (error) {
    publishedMicroForms.value = []
    showNotice('error', error instanceof Error ? `预约表单加载失败：${error.message}` : '预约表单加载失败')
  } finally {
    microFormsLoading.value = false
  }
}

const resetFilters = () => {
  keyword.value = ''
  status.value = ''
  void loadPages()
}

const selectPage = (page: MicroPageDto) => {
  selectedPageId.value = page.id
}

const selectComponent = (componentId: string) => { selectedComponentId.value = componentId }

const copyLink = async (link: string, key: string) => {
  const ok = await copyText(link, key)
  showNotice(ok ? 'info' : 'error', ok ? '链接已复制' : '复制失败，请手动复制')
}

const copySelectedLink = () => {
  if (selectedLink.value) void copyLink(selectedLink.value, 'selected-link')
}

const openCreateDialog = () => {
  resetDraft()
  editorVisible.value = true
}

const openEditDialog = (page: MicroPageDto) => {
  mergeDraft(page)
  editorVisible.value = true
  selectedPageId.value = page.id
}

const closeEditor = () => {
  editorVisible.value = false
}

const closeTemplateDialog = () => { showTemplateDialog.value = false }
const closePromotionDialog = () => { promotionPage.value = null }
const closeDeleteDialog = () => { deleteTarget.value = null }

const createFromTemplate = (key: MicroPageTemplateKey) => {
  createDraftFromTemplate(key)
  showTemplateDialog.value = false
  editorVisible.value = true
}

const savePage = async () => {
  const error = validateDraft(editorDraft)
  if (error) {
    showNotice('error', error)
    return
  }
  saving.value = true
  try {
    const payload = buildSavePayload()
    const saved = editorDraft.id
      ? await backendApi.updateMicroPage(payload)
      : await backendApi.createMicroPage(payload)
    showNotice('info', '微页面已保存')
    editorVisible.value = false
    await loadPages()
    selectedPageId.value = saved.id
  } catch (error) {
    showNotice('error', error instanceof Error ? `保存失败：${error.message}` : '保存失败')
  } finally {
    saving.value = false
  }
}

const copyPage = async (page: MicroPageDto) => {
  try {
    const created = await backendApi.createMicroPage({
      pageTitle: `${page.pageTitle} - Copy`,
      pageDesc: page.pageDesc,
      coverUrl: page.coverUrl,
      coverOssId: page.coverOssId,
      backgroundColor: page.backgroundColor,
      editMode: page.editMode,
      schema: cloneSchema(page.schema),
      remark: page.remark,
    })
    await loadPages()
    selectedPageId.value = created.id
    showNotice('info', '微页面已复制')
  } catch (error) {
    showNotice('error', error instanceof Error ? `复制失败：${error.message}` : '复制失败')
  }
}

const openPromoteDialog = (page: MicroPageDto) => {
  promotionPage.value = page
}

const openPreview = (page: MicroPageDto) => {
  window.open(pageLink(page), '_blank')
}

const togglePublish = async (page: MicroPageDto) => {
  try {
    const updated = page.status === 'PUBLISHED'
      ? await backendApi.offlineMicroPage(page.id)
      : await backendApi.publishMicroPage(page.id)
    pages.value = pages.value.map(item => item.id === updated.id ? updated : item)
    selectedPageId.value = updated.id
    showNotice('info', page.status === 'PUBLISHED' ? '页面已下线' : '页面已发布')
  } catch (error) {
    showNotice('error', error instanceof Error ? `状态更新失败：${error.message}` : '状态更新失败')
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    await backendApi.deleteMicroPage(deleteTarget.value.id)
    pages.value = pages.value.filter(page => page.id !== deleteTarget.value?.id)
    selectedPageId.value = pages.value[0]?.id ?? ''
    showNotice('info', '页面已删除')
  } catch (error) {
    showNotice('error', error instanceof Error ? `删除失败：${error.message}` : '删除失败')
  } finally {
    deleteTarget.value = null
  }
}

onMounted(() => {
  void loadPages()
  void loadPublishedMicroForms()
})
</script>
