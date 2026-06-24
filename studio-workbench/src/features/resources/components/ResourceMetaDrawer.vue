<template>
  <aside v-if="open && resource" class="fixed inset-y-0 right-0 z-20 w-full max-w-[420px] border-l border-amber-topbar-border bg-white shadow-2xl">
    <div class="flex items-center justify-between border-b border-amber-topbar-border px-5 py-4">
      <div>
        <div class="text-[14px] font-semibold text-amber-dark">编辑资源元数据</div>
        <div class="mt-1 text-[11px] text-amber-text-muted">{{ resource.fileName }}</div>
      </div>
      <button class="yy-action text-[12px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">关闭</button>
    </div>
    <div class="space-y-4 px-5 py-4 text-[12px]">
      <label class="block">
        <span class="mb-1 block text-amber-text-muted">资源类型</span>
        <select v-model="form.assetType" class="h-10 w-full border border-amber-topbar-border px-3">
          <option value="RAW">原片</option>
          <option value="PROOF">样片</option>
          <option value="RETOUCHED">精修</option>
          <option value="DELIVERY">交付图</option>
          <option value="OTHER">其他</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-1 block text-amber-text-muted">评星</span>
        <select v-model.number="form.rating" class="h-10 w-full border border-amber-topbar-border px-3">
          <option :value="0">未评星</option>
          <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="rating">{{ rating }} 星</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-1 block text-amber-text-muted">客户可见</span>
        <select v-model="form.visibleText" class="h-10 w-full border border-amber-topbar-border px-3">
          <option value="1">客户可见</option>
          <option value="0">仅内部</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-1 block text-amber-text-muted">标签</span>
        <select class="min-h-[120px] w-full border border-amber-topbar-border px-3 py-2" multiple @change="updateTagIds">
          <option v-for="tag in tagOptions" :key="tag.id" :selected="form.selectedTagIds.includes(tag.id)" :value="tag.id">{{ tag.tagName }}</option>
        </select>
      </label>
      <div class="rounded border border-amber-topbar-border bg-[#FBF8F2] p-3 text-[11px] text-amber-text-muted">
        单条编辑通过批量更新接口提交，只更新当前资源的类型、评星、可见性和标签关系。
      </div>
      <button class="yy-action w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[#F4EFE6] hover:bg-black disabled:opacity-60" :disabled="submitting" type="button" @click="submit">
        {{ submitting ? '保存中...' : '保存元数据' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ResourceRowDto, ResourceTagOptionDto } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'

const props = defineProps<{
  open: boolean
  resource: ResourceRowDto | null
  tagOptions: ResourceTagOptionDto[]
  submitting: boolean
}>()

const emit = defineEmits<{
  save: [payload: { assetType: string; rating: number; visible: boolean; selectedTagIds: BackendId[] }]
  close: []
}>()

const form = reactive({
  assetType: 'RAW',
  rating: 0,
  visibleText: '0',
  selectedTagIds: [] as BackendId[],
})

watch(
  () => props.resource,
  resource => {
    form.assetType = resource?.assetType || 'RAW'
    form.rating = Number(resource?.rating ?? 0)
    form.visibleText = resource?.visible ? '1' : '0'
    form.selectedTagIds = resource?.tagList.map(item => item.id) ?? []
  },
  { immediate: true },
)

const updateTagIds = (event: Event) => {
  form.selectedTagIds = Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value)
}

const submit = () => emit('save', {
  assetType: form.assetType,
  rating: form.rating,
  visible: form.visibleText === '1',
  selectedTagIds: form.selectedTagIds,
})
</script>
