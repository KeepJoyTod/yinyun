<template>
  <div v-if="editorVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
    <div class="grid max-h-[90vh] w-[1240px] max-w-full grid-cols-[260px_minmax(0,1fr)_340px] overflow-hidden bg-[#FBF8F2] shadow-2xl max-[1200px]:grid-cols-1">
      <MerchantMicroPageEditorPanel
        :component-catalog="componentCatalog"
        :editor-draft="editorDraft"
        :selected-component-id="selectedComponentId"
        :history-stack="historyStack"
        :history-index="historyIndex"
        :saving="saving"
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
      />

      <MerchantMicroPagePropertyPanel
        :selected-component="selectedComponent"
        :published-micro-forms="publishedMicroForms"
        :micro-forms-loading="microFormsLoading"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import MerchantMicroPageEditorPanel from './MerchantMicroPageEditorPanel.vue'
import MerchantMicroPagePropertyPanel from './MerchantMicroPagePropertyPanel.vue'
import type { MicroFormDto, MicroPageComponentSchema, MicroPagePayload } from '../../../shared/api/backend'
import type { BackendSupportedComponentType, MicroPageDraftField } from '../merchantMicroPagesOperations'

defineProps<{
  editorVisible: boolean
  componentCatalog: Array<{ type: BackendSupportedComponentType; label: string }>
  editorDraft: MicroPagePayload
  selectedComponentId: string
  selectedComponent: MicroPageComponentSchema | null
  historyStack: string[]
  historyIndex: number
  saving: boolean
  publishedMicroForms: MicroFormDto[]
  microFormsLoading: boolean
  updateDraftField: (key: MicroPageDraftField, value: string) => void
  selectComponent: (componentId: string) => void
  closeEditor: () => void
  savePage: () => void | Promise<void>
  addComponent: (type: BackendSupportedComponentType) => void
  moveComponent: (index: number, delta: number) => void
  duplicateComponent: (index: number) => void
  removeComponent: (index: number) => void
  undo: () => void
  redo: () => void
  componentPrimaryText: (component: MicroPageComponentSchema) => string
  componentSecondaryText: (component: MicroPageComponentSchema) => string
  componentProp: (component: MicroPageComponentSchema, key: string) => string
  componentItems: (component: MicroPageComponentSchema, key?: string) => Array<Record<string, unknown>>
  listItemValue: (item: Record<string, unknown>, key: string) => string
  microFormIdForLink: (link: string) => string
  updateComponentTitle: (component: MicroPageComponentSchema, value: string) => void
  updatePrimaryText: (component: MicroPageComponentSchema, value: string) => void
  updateSecondaryText: (component: MicroPageComponentSchema, value: string) => void
  updateComponentProp: (component: MicroPageComponentSchema, key: string, value: unknown) => void
  updateComponentNumberProp: (component: MicroPageComponentSchema, key: string, value: string) => void
  updateListItem: (component: MicroPageComponentSchema, key: string, index: number, field: string, value: string) => void
  addListItem: (component: MicroPageComponentSchema, key: string, item: Record<string, unknown>) => void
  removeListItem: (component: MicroPageComponentSchema, key: string, index: number) => void
  bindMicroFormLink: (component: MicroPageComponentSchema, index: number, formId: string) => void
}>()
</script>
