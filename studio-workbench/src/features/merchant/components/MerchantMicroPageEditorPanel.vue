<template>
  <aside class="max-h-[90vh] overflow-y-auto border-r border-amber-topbar-border bg-white p-4">
    <div class="text-[14px] font-semibold text-amber-dark">组件库</div>
    <div class="mt-4 grid grid-cols-2 gap-2">
      <button v-for="component in componentCatalog" :key="component.type" class="yy-action border border-amber-topbar-border bg-[#FBF8F2] px-3 py-3 text-[12px] text-amber-dark hover:bg-[#F4EFE6]" type="button" @click="addComponent(component.type)">
        {{ component.label }}
      </button>
    </div>
  </aside>

  <section class="max-h-[90vh] overflow-y-auto border-r border-amber-topbar-border bg-[#FBF8F2]">
    <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-amber-topbar-border bg-[#FBF8F2]/95 px-5 py-4 backdrop-blur">
      <div>
        <div class="text-[15px] font-semibold text-amber-dark">{{ editorDraft.id ? '编辑页面' : '新增页面' }}</div>
        <div class="mt-1 text-[11px] text-amber-text-muted">编辑后先保存草稿，再发布到公开页；已有页面兼容字段会自动保留。</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark hover:bg-white" type="button" @click="closeEditor">
          取消
        </button>
        <button class="yy-action bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#D96C25]" type="button" :disabled="saving" @click="savePage">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <div class="grid gap-4 p-5">
      <section class="grid gap-3 border border-amber-topbar-border bg-white p-4">
        <div class="text-[13px] font-semibold text-amber-dark">基础设置</div>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          页面标题
          <input :value="editorDraft.pageTitle" class="yy-input" maxlength="120" type="text" @input="updateDraftField('pageTitle', ($event.target as HTMLInputElement).value.trim())" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          页面描述
          <textarea :value="editorDraft.pageDesc" class="yy-textarea" maxlength="500" @input="updateDraftField('pageDesc', ($event.target as HTMLTextAreaElement).value.trim())" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          封面图片
          <input :value="editorDraft.coverUrl" class="yy-input" maxlength="500" type="text" @input="updateDraftField('coverUrl', ($event.target as HTMLInputElement).value.trim())" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          背景颜色
          <input :value="editorDraft.backgroundColor" class="yy-input" type="text" @input="updateDraftField('backgroundColor', ($event.target as HTMLInputElement).value.trim())" />
        </label>
      </section>

      <section class="border border-amber-topbar-border bg-white">
        <div class="flex items-center justify-between border-b border-amber-topbar-border px-4 py-3">
          <div class="text-[13px] font-semibold text-amber-dark">组件树</div>
          <div class="flex items-center gap-2">
            <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark" type="button" :disabled="historyIndex <= 0" @click="undo">
              撤销
            </button>
            <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark" type="button" :disabled="historyIndex >= historyStack.length - 1" @click="redo">
              重做
            </button>
          </div>
        </div>
        <div class="grid gap-3 p-4">
          <article
            v-for="(component, index) in editorDraft.schema.components"
            :key="component.id"
            class="cursor-pointer border p-3"
            :class="selectedComponentId === component.id ? 'border-[#F58235] bg-[#FFF5ED]' : 'border-amber-topbar-border bg-[#FBF8F2]'"
            @click="selectComponent(component.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">{{ component.type }}</div>
                <div class="mt-1 text-[13px] font-semibold text-amber-dark">{{ component.title }}</div>
              </div>
              <div class="flex items-center gap-1">
                <button class="yy-icon-button" type="button" :disabled="index === 0" @click.stop="moveComponent(index, -1)">↑</button>
                <button class="yy-icon-button" type="button" :disabled="index === editorDraft.schema.components.length - 1" @click.stop="moveComponent(index, 1)">↓</button>
                <button class="yy-icon-button" type="button" @click.stop="duplicateComponent(index)">⧉</button>
                <button class="yy-icon-button text-[#8C3E2C]" type="button" @click.stop="removeComponent(index)">×</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MicroPagePayload } from '../../../shared/api/backend'

type BackendSupportedComponentType = 'image' | 'masonry' | 'title' | 'textnav' | 'store' | 'spacer' | 'divider'
type ComponentCatalogItem = {
  type: BackendSupportedComponentType
  label: string
}

type DraftField = 'pageTitle' | 'pageDesc' | 'coverUrl' | 'backgroundColor'

defineProps<{
  componentCatalog: ComponentCatalogItem[]
  editorDraft: MicroPagePayload
  selectedComponentId: string
  historyStack: string[]
  historyIndex: number
  saving: boolean
  updateDraftField: (key: DraftField, value: string) => void
  selectComponent: (componentId: string) => void
  closeEditor: () => void
  savePage: () => void | Promise<void>
  addComponent: (type: BackendSupportedComponentType) => void
  moveComponent: (index: number, delta: number) => void
  duplicateComponent: (index: number) => void
  removeComponent: (index: number) => void
  undo: () => void
  redo: () => void
}>()
</script>
