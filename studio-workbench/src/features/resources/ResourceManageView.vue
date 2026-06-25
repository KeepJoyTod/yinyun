<template>
  <div class="flex flex-col gap-5">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="text-[11px] uppercase tracking-[0.18em] text-amber-text-muted">Resource Manage</div>
          <h2 class="mt-1 text-[22px] font-semibold text-amber-dark">资源管理</h2>
          <p class="mt-1 text-[12px] leading-relaxed text-amber-text-muted">真实列表直接读取 `yy_photo_asset / yy_photo_album`，批量修改类型、评星、标签和客户可见状态。</p>
        </div>
        <div class="text-[12px] text-amber-text-muted">当前共 {{ total }} 条资源</div>
      </div>
    </section>

    <FeatureGateStatusCard :gate="gate" />
    <p v-if="gateError" class="text-[12px] text-[#8C3E2C]">{{ gateError }}</p>

    <ResourceManageFilterBar v-if="canLoadData" :filters="filters" :stores="stores" :products="products" :tag-options="tagOptions" :has-active-filter="hasActiveFilter" @patch="patchFilters" @reset="resetFilters" />

    <section v-if="canLoadData" class="border border-amber-topbar-border bg-amber-content-bg p-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-[12px] text-amber-text-muted">已选 {{ selectedIds.length }} 条</span>
        <select v-model="batchDraft.assetType" class="h-9 border border-amber-topbar-border px-3 text-[12px]">
          <option value="">批量改资源类型</option>
          <option value="RAW">原片</option>
          <option value="PROOF">样片</option>
          <option value="RETOUCHED">精修</option>
          <option value="DELIVERY">交付图</option>
          <option value="OTHER">其他</option>
        </select>
        <select v-model="batchDraft.rating" class="h-9 border border-amber-topbar-border px-3 text-[12px]">
          <option value="">批量改评星</option>
          <option value="0">未评星</option>
          <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="String(rating)">{{ rating }} 星</option>
        </select>
        <select v-model="batchDraft.visible" class="h-9 border border-amber-topbar-border px-3 text-[12px]">
          <option value="">批量改可见性</option>
          <option value="1">客户可见</option>
          <option value="0">仅内部</option>
        </select>
        <select v-model="batchDraft.tagMode" class="h-9 border border-amber-topbar-border px-3 text-[12px]">
          <option value="add">批量打标签</option>
          <option value="remove">批量取消标签</option>
        </select>
        <select class="min-h-9 border border-amber-topbar-border px-3 py-1 text-[12px]" multiple @change="updateBatchTagIds">
          <option v-for="tag in tagOptions" :key="tag.id" :value="tag.id">{{ tag.tagName }}</option>
        </select>
        <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] text-[#F4EFE6] hover:bg-black disabled:opacity-60" :disabled="!canSubmitBatch || submitting" type="button" @click="submitBatch">
          {{ submitting ? '提交中...' : '执行批量操作' }}
        </button>
      </div>
      <p v-if="statusMessage" class="mt-3 text-[12px] text-[#2D7A4D]">{{ statusMessage }}</p>
    </section>

    <StateView v-if="canLoadData" :loading="loading" :error="error" :empty="!resources.length" :empty-title="emptyState.title" :empty-hint="emptyState.hint" :on-retry="refresh">
      <ResourceManageTable
        :rows="resources"
        :selected-ids="selectedIds"
        :all-selected="allSelected"
        :active-resource-id="activeResource?.assetId || null"
        @toggle-all="toggleSelectAll"
        @toggle-one="toggleSelected"
        @edit="openMeta"
        @delete="removeResource"
        @open-album="jumpToAlbum"
      />
    </StateView>

    <section v-if="canLoadData" class="flex flex-wrap items-center justify-between gap-3 border border-amber-topbar-border bg-amber-content-bg px-4 py-3 text-[12px] text-amber-text-muted">
      <div>显示 {{ pageStart }} - {{ pageEnd }} / {{ total }}</div>
      <div class="flex items-center gap-2">
        <select :value="String(pageSize)" class="h-9 border border-amber-topbar-border px-3 text-[12px]" @change="changePageSize">
          <option value="20">20 / 页</option>
          <option value="50">50 / 页</option>
          <option value="100">100 / 页</option>
        </select>
        <button class="yy-action border border-amber-topbar-border px-3 py-1.5 hover:bg-black/5 disabled:opacity-50" :disabled="!hasPrevPage || loading" type="button" @click="goPrevPage">
          上一页
        </button>
        <span>第 {{ page }} / {{ totalPages }} 页</span>
        <button class="yy-action border border-amber-topbar-border px-3 py-1.5 hover:bg-black/5 disabled:opacity-50" :disabled="!hasNextPage || loading" type="button" @click="goNextPage">
          下一页
        </button>
      </div>
    </section>

    <ResourceMetaDrawer v-if="canLoadData" :open="drawerOpen" :resource="activeResource" :tag-options="tagOptions" :submitting="submitting" @save="saveMeta" @close="closeMeta" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import StateView from '../../shared/components/feedback/StateView.vue'
import FeatureGateStatusCard from '../system/FeatureGateStatusCard.vue'
import { canRunBatchAction, buildResourceEmptyState } from './resourceManageOperations'
import ResourceManageFilterBar from './components/ResourceManageFilterBar.vue'
import ResourceManageTable from './components/ResourceManageTable.vue'
import ResourceMetaDrawer from './components/ResourceMetaDrawer.vue'
import { useResourceManage } from './composables/useResourceManage'
import { useResourceManageFilters } from './composables/useResourceManageFilters'
import type { BackendId } from '../../shared/api/backendId'

const { filters, hasActiveFilter, resetFilters, filterSignature } = useResourceManageFilters()
const manage = useResourceManage(filters)

const {
  loading,
  error,
  gate,
  gateError,
  canLoadData,
  submitting,
  statusMessage,
  page,
  pageSize,
  totalPages,
  pageStart,
  pageEnd,
  hasPrevPage,
  hasNextPage,
  resources,
  total,
  stores,
  products,
  tagOptions,
  selectedIds,
  activeResource,
  drawerOpen,
  allSelected,
  refresh,
  setPage,
  setPageSize,
  resetPagination,
  toggleSelected,
  toggleSelectAll,
  openMeta,
  closeMeta,
  applyBatchUpdate,
  saveMeta,
  removeResource,
  jumpToAlbum,
} = manage

watch(filterSignature, () => {
  resetPagination()
  void refresh()
}, { immediate: true })

const patchFilters = (patch: Record<string, unknown>) => Object.assign(filters, patch)

const goPrevPage = () => {
  void setPage(page.value - 1)
}

const goNextPage = () => {
  void setPage(page.value + 1)
}

const changePageSize = (event: Event) => {
  const nextPageSize = Number((event.target as HTMLSelectElement).value)
  void setPageSize(nextPageSize)
}

const batchDraft = reactive({
  assetType: '',
  rating: '',
  visible: '',
  tagMode: 'add',
  tagIds: [] as BackendId[],
})

const updateBatchTagIds = (event: Event) => {
  batchDraft.tagIds = Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value)
}

const canSubmitBatch = computed(() => canRunBatchAction(selectedIds.value, {
  assetType: batchDraft.assetType || undefined,
  rating: batchDraft.rating === '' ? undefined : Number(batchDraft.rating),
  visible: batchDraft.visible === '' ? undefined : batchDraft.visible === '1',
  tagIdsToAdd: batchDraft.tagMode === 'add' ? batchDraft.tagIds : undefined,
  tagIdsToRemove: batchDraft.tagMode === 'remove' ? batchDraft.tagIds : undefined,
}))

const submitBatch = async () => {
  await applyBatchUpdate({
    assetIds: selectedIds.value,
    assetType: batchDraft.assetType || undefined,
    rating: batchDraft.rating === '' ? undefined : Number(batchDraft.rating),
    visible: batchDraft.visible === '' ? undefined : batchDraft.visible === '1',
    tagIdsToAdd: batchDraft.tagMode === 'add' ? batchDraft.tagIds : undefined,
    tagIdsToRemove: batchDraft.tagMode === 'remove' ? batchDraft.tagIds : undefined,
  })
}

const emptyState = computed(() => buildResourceEmptyState(filters))
</script>
