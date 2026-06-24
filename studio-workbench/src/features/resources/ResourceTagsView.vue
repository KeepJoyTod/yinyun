<template>
  <div class="flex flex-col gap-5">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="text-[11px] uppercase tracking-[0.18em] text-amber-text-muted">Resource Tags</div>
      <h2 class="mt-1 text-[22px] font-semibold text-amber-dark">资源标签</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-amber-text-muted">标签字典读取 `yy_photo_tag`，资源数量聚合读取 `yy_photo_asset_tag`，删除标签不会删除资源主记录。</p>
    </section>

    <section class="border border-amber-topbar-border bg-amber-content-bg p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
        <input v-model.trim="tagKeyword" class="h-10 border border-amber-topbar-border px-3 text-[12px]" placeholder="搜索标签名" />
        <select v-model="createStoreId" class="h-10 border border-amber-topbar-border px-3 text-[12px]">
          <option value="">请选择所属门店</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
        </select>
        <div class="flex gap-2">
          <input v-model.trim="createTagName" class="h-10 flex-1 border border-amber-topbar-border px-3 text-[12px]" placeholder="新标签名" />
          <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] text-[#F4EFE6] hover:bg-black disabled:opacity-60" :disabled="!createTagName || !createStoreId || submitting" type="button" @click="submitCreate">
            新增标签
          </button>
        </div>
      </div>
      <p v-if="statusMessage" class="mt-3 text-[12px] text-[#2D7A4D]">{{ statusMessage }}</p>
      <p v-if="mutationError" class="mt-3 text-[12px] text-[#8C3E2C]">{{ mutationError }}</p>
    </section>

    <StateView :loading="loading" :error="error" :empty="!tags.length" :empty-title="emptyState.title" :empty-hint="emptyState.hint" :on-retry="loadTags">
      <ResourceTagTable :rows="tags" @open-tag="openTag" @rename="renameTag" @delete="deleteTag" />
    </StateView>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { backendApi, type ResourceTagDto, type StoreDto } from '../../shared/api/backend'
import StateView from '../../shared/components/feedback/StateView.vue'
import ResourceTagTable from './components/ResourceTagTable.vue'
import { useResourceTagMutations } from './composables/useResourceTagMutations'
import { buildTagDeleteMessage, buildTagEmptyState, sortTagsByUsage } from './resourceTagOperations'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const tagKeyword = ref('')
const createStoreId = ref('')
const createTagName = ref('')
const tags = ref<ResourceTagDto[]>([])
const stores = ref<StoreDto[]>([])

const { submitting, error: mutationError, statusMessage, createTag, updateTag, deleteTag: removeTag } = useResourceTagMutations()

const loadTags = async () => {
  loading.value = true
  error.value = ''
  try {
    const [page, storeRows] = await Promise.all([
      backendApi.listResourceTags({ keyword: tagKeyword.value || undefined }),
      backendApi.listStores().catch(() => []),
    ])
    tags.value = sortTagsByUsage(page.items)
    stores.value = storeRows
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '资源标签加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTags()
})

watch(tagKeyword, () => {
  void loadTags()
})

const submitCreate = async () => {
  if (!createStoreId.value) return
  await createTag({ storeId: createStoreId.value, tagName: createTagName.value })
  createTagName.value = ''
  await loadTags()
}

const renameTag = async (tag: ResourceTagDto) => {
  const nextName = window.prompt('请输入新的标签名', tag.tagName)?.trim()
  if (!nextName || nextName === tag.tagName) return
  await updateTag({ id: tag.id, storeId: tag.storeId, tagName: nextName })
  await loadTags()
}

const deleteTag = async (tag: ResourceTagDto) => {
  if (!window.confirm(buildTagDeleteMessage(tag))) return
  await removeTag(tag.id)
  await loadTags()
}

const openTag = (id: string) => {
  router.push({
    path: '/resource/manage',
    query: { tagIds: id },
  })
}

const emptyState = computed(() => buildTagEmptyState(Boolean(tagKeyword.value.trim())))
</script>
