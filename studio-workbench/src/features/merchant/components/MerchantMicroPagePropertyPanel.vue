<template>
  <aside class="max-h-[90vh] overflow-y-auto bg-white p-4">
    <div class="text-[14px] font-semibold text-amber-dark">属性设置</div>
    <div v-if="selectedComponent" class="mt-4 grid gap-3">
      <label class="grid gap-2 text-[12px] text-amber-text-muted">
        组件标题
        <input :value="selectedComponent.title" class="yy-input" maxlength="80" type="text" @input="updateComponentTitle(selectedComponent, ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="grid gap-2 text-[12px] text-amber-text-muted">
        展示文案
        <input :value="componentPrimaryText(selectedComponent)" class="yy-input" type="text" @input="updatePrimaryText(selectedComponent, ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="grid gap-2 text-[12px] text-amber-text-muted">
        组件描述
        <textarea :value="componentSecondaryText(selectedComponent)" class="yy-textarea" @input="updateSecondaryText(selectedComponent, ($event.target as HTMLTextAreaElement).value)" />
      </label>
      <div v-if="selectedComponent.type === 'title'" class="grid gap-2 text-[12px] text-amber-text-muted">
        标题对齐
        <select :value="componentProp(selectedComponent, 'align')" class="yy-input" @change="updateComponentProp(selectedComponent, 'align', ($event.target as HTMLSelectElement).value)">
          <option value="">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
        </select>
      </div>

      <template v-if="selectedComponent.type === 'image'">
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          图片地址
          <input :value="componentProp(selectedComponent, 'url')" class="yy-input" maxlength="500" placeholder="https://... 或本地资源路径" type="text" @input="updateComponentProp(selectedComponent, 'url', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          图片高度
          <input :value="componentProp(selectedComponent, 'height')" class="yy-input" max="620" min="160" type="number" @input="updateComponentNumberProp(selectedComponent, 'height', ($event.target as HTMLInputElement).value)" />
        </label>
      </template>

      <template v-if="selectedComponent.type === 'textnav'">
        <div class="flex items-center justify-between gap-3 text-[12px] text-amber-text-muted">
          <span>快捷入口</span>
          <button class="yy-action border border-amber-topbar-border px-2 py-1 text-[11px] text-amber-dark hover:bg-[#FBF8F2]" type="button" @click="addListItem(selectedComponent, 'items', { label: '新入口', link: '#store' })">
            添加入口
          </button>
        </div>
        <div class="grid gap-3">
          <article v-for="(item, index) in componentItems(selectedComponent)" :key="`nav-${index}`" class="grid gap-2 border border-amber-topbar-border bg-[#FBF8F2] p-3">
            <div class="flex items-center justify-between text-[11px] text-amber-text-muted">
              <span>入口 {{ index + 1 }}</span>
              <button class="text-[#B8543B]" type="button" @click="removeListItem(selectedComponent, 'items', index)">删除</button>
            </div>
            <input :value="listItemValue(item, 'label')" class="yy-input" placeholder="按钮名称" type="text" @input="updateListItem(selectedComponent, 'items', index, 'label', ($event.target as HTMLInputElement).value)" />
            <input :value="listItemValue(item, 'link')" class="yy-input" placeholder="#samples、#store 或 https://..." type="text" @input="updateListItem(selectedComponent, 'items', index, 'link', ($event.target as HTMLInputElement).value)" />
            <select
              class="yy-input"
              :disabled="microFormsLoading || !publishedMicroForms.length"
              :value="microFormIdForLink(listItemValue(item, 'link'))"
              @change="bindMicroFormLink(selectedComponent, index, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">绑定微表单...</option>
              <option v-for="form in publishedMicroForms" :key="form.id" :value="form.id">
                {{ form.formName }}
              </option>
            </select>
            <div v-if="microFormsLoading" class="text-[11px] text-amber-text-muted">预约表单加载中...</div>
            <div v-else-if="!publishedMicroForms.length" class="text-[11px] text-[#B8543B]">暂无已发布微表单，发布后可绑定到“立即预约”。</div>
          </article>
        </div>
      </template>

      <template v-if="selectedComponent.type === 'masonry'">
        <div class="flex items-center justify-between gap-3 text-[12px] text-amber-text-muted">
          <span>样片列表</span>
          <button class="yy-action border border-amber-topbar-border px-2 py-1 text-[11px] text-amber-dark hover:bg-[#FBF8F2]" type="button" @click="addListItem(selectedComponent, 'items', { title: '新样片', image: getSamplePhotoImage(componentItems(selectedComponent).length) })">
            添加样片
          </button>
        </div>
        <div class="grid gap-3">
          <article v-for="(item, index) in componentItems(selectedComponent)" :key="`gallery-${index}`" class="grid gap-2 border border-amber-topbar-border bg-[#FBF8F2] p-3">
            <div class="flex items-center justify-between text-[11px] text-amber-text-muted">
              <span>样片 {{ index + 1 }}</span>
              <button class="text-[#B8543B]" type="button" @click="removeListItem(selectedComponent, 'items', index)">删除</button>
            </div>
            <input :value="listItemValue(item, 'title')" class="yy-input" placeholder="样片名称" type="text" @input="updateListItem(selectedComponent, 'items', index, 'title', ($event.target as HTMLInputElement).value)" />
            <input :value="listItemValue(item, 'image')" class="yy-input" placeholder="图片地址" type="text" @input="updateListItem(selectedComponent, 'items', index, 'image', ($event.target as HTMLInputElement).value)" />
          </article>
        </div>
      </template>

      <template v-if="selectedComponent.type === 'store'">
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          门店地址
          <input :value="componentProp(selectedComponent, 'address')" class="yy-input" type="text" @input="updateComponentProp(selectedComponent, 'address', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          联系电话
          <input :value="componentProp(selectedComponent, 'phone')" class="yy-input" type="text" @input="updateComponentProp(selectedComponent, 'phone', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="grid gap-2 text-[12px] text-amber-text-muted">
          营业时间
          <input :value="componentProp(selectedComponent, 'businessHours')" class="yy-input" type="text" @input="updateComponentProp(selectedComponent, 'businessHours', ($event.target as HTMLInputElement).value)" />
        </label>
      </template>

      <label v-if="selectedComponent.type === 'spacer'" class="grid gap-2 text-[12px] text-amber-text-muted">
        留白高度
        <input :value="componentProp(selectedComponent, 'height')" class="yy-input" max="96" min="8" type="number" @input="updateComponentNumberProp(selectedComponent, 'height', ($event.target as HTMLInputElement).value)" />
      </label>

      <div v-if="selectedComponent.type === 'unknown'" class="border border-dashed border-amber-topbar-border bg-[#FBF8F2] px-3 py-3 text-[12px] text-amber-text-muted">
        未识别组件占位卡：公开页会安全降级渲染，但会保留原始 `props` 与 `unknownProps`。
      </div>
    </div>
    <div v-else class="mt-4 text-[12px] text-amber-text-muted">从中间组件树选择一个组件开始编辑。</div>
  </aside>
</template>

<script setup lang="ts">
import type { MicroFormDto, MicroPageComponentSchema } from '../../../shared/api/backend'
import { getSamplePhotoImage } from '../../../shared/stores/workbenchAssets'

defineProps<{
  selectedComponent: MicroPageComponentSchema | null
  publishedMicroForms: MicroFormDto[]
  microFormsLoading: boolean
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
