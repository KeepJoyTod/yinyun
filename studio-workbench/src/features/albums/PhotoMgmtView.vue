<template>
  <div class="flex flex-col gap-5">
    <section class="photo-hero rounded-md border border-amber-topbar-border bg-amber-content-bg px-5 py-4">
      <div class="flex items-center justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">Photo Delivery</span>
          <h2 class="mt-1 text-[22px] font-sans font-semibold leading-[1.12] text-amber-dark">客片交付控制台</h2>
          <p class="mt-1.5 max-w-[760px] text-[12px] font-sans leading-relaxed text-amber-text-muted">
            以相册为单位管理底片上传、客户选片、精修交付和失败排障；上方先看整体状态，下方再进入某个相册精细处理。
          </p>
        </div>
        <div class="grid grid-cols-3 gap-2 max-[560px]:grid-cols-1 max-[760px]:w-full">
          <div
            v-for="stat in currentAlbumStats"
            :key="stat.label"
            class="rounded-md border border-amber-topbar-border/70 bg-white px-3 py-2"
          >
            <div class="text-[10px] font-sans text-amber-text-muted">{{ stat.label }}</div>
            <div class="mt-1 text-[18px] font-sans font-semibold tabular-nums leading-none text-amber-dark">{{ stat.value }}</div>
            <div class="mt-1 text-[10px] font-sans text-amber-text-muted">{{ stat.hint }}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="flex h-full gap-5 overflow-hidden max-[1024px]:h-auto max-[1024px]:flex-col max-[1024px]:overflow-y-auto">
    <PhotoAlbumSidebar
      v-model:active-album-id="activeAlbumId"
      v-model:filter-search="filterSearch"
      v-model:filter-status="filterStatus"
      v-model:filter-photographer="filterPhotographer"
      :all-albums="allAlbums"
      :filtered-albums="filteredAlbums"
      :albums="albums"
      :photographer-options="photographerOptions"
      :total-photo-count="totalPhotoCount"
      :ready-album-count="readyAlbumCount"
      :needs-upload-count="needsUploadCount"
      :has-active-filter="hasActiveFilter"
      :status-styles="statusStyles"
      :album-progress="albumProgress"
      :album-next-step="albumNextStep"
      @reset-filter="resetFilter"
    />

    <!-- Main Content: Photo Grid (7:195) -->
    <div class="photo-delivery-board flex-1 flex flex-col bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden">
      <!-- Content Header (7:196) -->
      <div class="px-5 py-4 border-b border-amber-topbar-border flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div class="flex min-w-0 flex-col gap-1">
          <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">Roll · {{ activeAlbum?.id }}</span>
          <h2 class="truncate text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight max-[720px]:whitespace-normal">{{ activeAlbum?.customer }} · {{ activeAlbum?.service }}</h2>
        </div>
        
        <div class="flex items-center gap-3 max-[720px]:w-full max-[720px]:justify-between">
          <div class="flex items-center bg-amber-content-bg border border-amber-topbar-border rounded-md p-0.5">
            <button class="yy-action p-1.5 rounded-[1px] bg-amber-dark shadow-sm" type="button" aria-label="网格视图">
              <img src="../../assets/icons/grid-view.svg" class="w-3.5 h-3.5 invert brightness-200" />
            </button>
            <button class="yy-action p-1.5 rounded-[1px] opacity-30 hover:opacity-60 transition-opacity" type="button" aria-label="筛选视图">
              <img src="../../assets/icons/advanced-filter.svg" class="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            class="yy-action flex items-center gap-2 px-4 py-2 bg-amber-dark text-[#F4EFE6] rounded-md hover:bg-black transition-all"
            @click="triggerNegativesUpload"
            type="button"
          >
            <img src="../../assets/icons/plus.svg" class="w-3.5 h-3.5 invert brightness-200" />
            <span class="text-[11px] font-sans font-medium">上传底片</span>
          </button>
        </div>
      </div>

      <div v-if="activeAlbum" class="grid grid-cols-[1.2fr_repeat(3,0.65fr)_1.35fr] gap-0 border-b border-amber-topbar-border bg-amber-content-bg/55 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
        <div class="p-4 border-r border-amber-topbar-border max-[720px]:border-r-0">
          <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">当前动作</div>
          <div class="mt-2 text-[13px] font-sans font-semibold text-amber-dark">{{ activeAlbumActionLabel }}</div>
          <div class="mt-1 text-[10.5px] font-sans leading-[1.65] text-amber-text-muted">{{ activeAlbumActionHint }}</div>
        </div>
        <div class="p-4 border-r border-amber-topbar-border max-[1180px]:border-r-0">
          <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">底片</div>
          <div class="mt-2 text-[23px] font-sans leading-none text-amber-dark">{{ activeAlbum.totalCount }}</div>
        </div>
        <div class="p-4 border-r border-amber-topbar-border">
          <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">已选</div>
          <div class="mt-2 text-[23px] font-sans leading-none text-amber-dark">{{ activeAlbum.selectedCount }}</div>
        </div>
        <div class="p-4 border-r border-amber-topbar-border max-[1180px]:border-r-0">
          <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">进度</div>
          <div class="mt-2 text-[23px] font-sans leading-none text-amber-dark">{{ activeProgressPercent }}%</div>
        </div>
        <div class="p-4">
          <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">客户联系</div>
          <div class="mt-2 text-[12px] font-sans font-medium text-amber-dark">{{ activeAlbum.customer }} · {{ activeAlbumOrder?.phone || '未绑定手机号' }}</div>
          <div class="mt-1 text-[10.5px] font-sans leading-[1.65] text-amber-text-muted">{{ activeAlbum.orderId }} · {{ activeAlbum.photographer }}</div>
        </div>
      </div>

      <PhotoGridPanel
        :set-negatives-input-el="setNegativesInputEl"
        :upload-progress="uploadProgress"
        :upload-error="uploadError"
        :upload-error-copy-failed="uploadErrorCopyFailed"
        :copying-upload-key="copyingUploadKey"
        :copied-upload-key="copiedUploadKey"
        :photos-to-show="photosToShow"
        :selected-photo-ids="selectedPhotoIds"
        :batch-selection-saving="batchSelectionSaving"
        :batch-selection-error="batchSelectionError"
        :thumbnail-loading-ids="thumbnailLoadingIds"
        :thumbnail-failed-ids="thumbnailFailedIds"
        :drag-over-id="dragOverId"
        :on-negatives-change="onNegativesChange"
        :copy-upload-error="copyUploadError"
        :select-all-photos="selectAllPhotos"
        :clear-selected-photos="clearSelectedPhotos"
        :mark-selected-photos="markSelectedPhotos"
        :on-drag-start="onDragStart"
        :on-drag-over="onDragOver"
        :on-drop="onDrop"
        :on-drag-end="onDragEnd"
        :toggle-photo-selection="togglePhotoSelection"
        :on-thumbnail-load="onThumbnailLoad"
        :on-thumbnail-error="onThumbnailError"
        :move-negative="moveNegative"
        :open-rename="openRename"
        :delete-negative="deleteNegative"
        :trigger-negatives-upload="triggerNegativesUpload"
        @close-upload-error="uploadError = null"
        @clear-batch-selection-error="batchSelectionError = ''"
      />
      <!-- Footer Info (7:344) -->
      <div class="px-7 py-4 border-t border-amber-topbar-border bg-amber-content-bg/60 flex items-center justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
        <div class="flex items-center gap-6 max-[520px]:flex-col max-[520px]:items-start max-[520px]:gap-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] font-mono text-amber-text-muted uppercase tracking-wider opacity-60">Current Album</span>
            <span class="text-[11px] font-mono text-amber-dark">{{ activeAlbum?.totalCount ?? 0 }} Photos</span>
          </div>
          <div class="h-6 w-[1px] bg-amber-topbar-border"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] font-mono text-amber-text-muted uppercase tracking-wider opacity-60">Selection Progress</span>
            <span class="text-[11px] font-mono text-amber-dark">{{ activeAlbum?.selectedCount }} of {{ activeAlbum?.totalCount }} Photos</span>
          </div>
        </div>
        <div class="flex items-center gap-2 max-[520px]:w-full max-[520px]:flex-col">
          <button
            class="yy-action px-4 py-1.5 border border-amber-topbar-border rounded-md text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5 transition-all max-[520px]:w-full"
            @click="generateLinkFromAlbum()"
            type="button"
          >
            生成/更新选片链接
          </button>
          <button
            class="yy-action px-4 py-1.5 bg-amber-dark text-[#F4EFE6] rounded-md text-[10.5px] font-sans hover:bg-black transition-all max-[520px]:w-full"
            @click="goToSelectionConsole"
            type="button"
          >
            打开选片管理
          </button>
        </div>
      </div>

      <PhotoAccessLogPanel
        :active="Boolean(activeAlbum)"
        :loading="photoAccessLoading"
        :error="photoAccessError"
        :rows="photoAccessRows"
        :empty-hint="photoAccessEmptyHint"
      />

      <!-- 客片操作区：通知客户 / 客片确认 / 批量操作（spec §7 详情区） -->
      <div class="border-t border-amber-topbar-border bg-amber-content-bg px-5 py-3">
        <Transition name="fade">
          <div
            v-if="albumActionFeedback"
            class="mb-3 border px-4 py-3 text-[10.5px]"
            :class="albumActionFeedbackTone === 'warning'
              ? 'border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] text-[#8A6121]'
              : 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'"
          >
            {{ albumActionFeedback }}
          </div>
        </Transition>
        <Transition name="fade">
          <div
            v-if="albumActionError"
            class="mb-3 border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[10.5px] text-[#8C3E2C]"
          >
            {{ albumActionError }}
          </div>
        </Transition>
        <div
          v-if="!activeAlbum"
          class="mb-3 rounded-md border border-dashed border-amber-topbar-border bg-white/60 px-4 py-3 text-[10.5px] text-amber-text-muted"
        >
          <div class="font-medium text-amber-dark">当前未选择相册，通知、确认和交付动作已锁定。</div>
          <div class="mt-1">请选择左侧相册后再继续客片交付动作。</div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
        <span class="mr-2 text-[11px] font-sans font-medium text-amber-dark">客片操作</span>
        <button
          class="yy-action flex items-center gap-1.5 px-3 py-1.5 border border-amber-topbar-border rounded-md text-[11px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          type="button"
          :title="activeAlbumActionAvailability.notify.reason || '通知客户'"
          :disabled="albumActionLoading === 'notify' || !canNotifyActiveAlbum"
          @click="handleAlbumNotify"
        >
          <span>通知客户</span>
          <span v-if="albumActionLoading === 'notify'" class="font-mono text-[9px] uppercase tracking-wider opacity-60">处理中</span>
          <span v-else class="font-mono text-[9px] uppercase tracking-wider opacity-60">{{ canNotifyActiveAlbum ? '人工跟进' : activeAlbumActionAvailability.notify.reason }}</span>
        </button>
        <button
          class="yy-action flex items-center gap-1.5 px-3 py-1.5 border border-amber-topbar-border rounded-md text-[11px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          type="button"
          :title="activeAlbumActionAvailability.confirm.reason || '客片确认'"
          :disabled="albumActionLoading === 'confirm' || !canConfirmActiveAlbum"
          @click="handleAlbumConfirmSelection"
        >
          <span>客片确认</span>
          <span v-if="albumActionLoading === 'confirm'" class="font-mono text-[9px] uppercase tracking-wider opacity-60">处理中</span>
          <span v-else class="font-mono text-[9px] uppercase tracking-wider opacity-60">{{ canConfirmActiveAlbum ? '提交确认' : activeAlbumActionAvailability.confirm.reason }}</span>
        </button>
        <button
          class="yy-action flex items-center gap-1.5 px-3 py-1.5 border border-amber-topbar-border rounded-md text-[11px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          type="button"
          :title="activeAlbumActionAvailability.deliver.reason || '资料发送'"
          :disabled="albumActionLoading === 'deliver' || !canDeliverActiveAlbum"
          @click="handleAlbumDeliver"
        >
          <span>资料发送</span>
          <span v-if="albumActionLoading === 'deliver'" class="font-mono text-[9px] uppercase tracking-wider opacity-60">处理中</span>
          <span v-else class="font-mono text-[9px] uppercase tracking-wider opacity-60">{{ canDeliverActiveAlbum ? '最终交付' : activeAlbumActionAvailability.deliver.reason }}</span>
        </button>
        <span class="ml-auto text-[11px] font-mono text-amber-text-muted">
          {{ activeAlbum ? `已上传 ${activeAlbum.totalCount} · 已选 ${activeAlbum.selectedCount} · 待确认 ${Math.max(0, activeAlbum.totalCount - activeAlbum.selectedCount)}` : '请先选择相册' }}
        </span>
        <button
          v-if="activeAlbumNeedsUpload"
          class="yy-action rounded-md border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] font-sans font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="triggerNegativesUpload"
        >
          上传底片后再通知
        </button>
        </div>
        <div
          v-if="activeAlbumActionAvailability.confirm.reason || activeAlbumActionAvailability.deliver.reason"
          class="mt-2 text-[10.5px] font-sans text-amber-text-muted"
        >
          {{ activeAlbumActionAvailability.deliver.reason || activeAlbumActionAvailability.confirm.reason }}
        </div>
      </div>
    </div>
  </div>

  <PhotoRenameModal
    v-model="renameValue"
    :open="renameOpen"
    @close="closeRename"
    @apply="applyRename"
  />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import PhotoAccessLogPanel from './components/PhotoAccessLogPanel.vue'
import PhotoAlbumSidebar from './components/PhotoAlbumSidebar.vue'
import PhotoGridPanel from './components/PhotoGridPanel.vue'
import PhotoRenameModal from './components/PhotoRenameModal.vue'
import { albumNextStep } from './photoMgmtOperations'
import { usePhotoDeliveryActions } from './composables/usePhotoDeliveryActions'
import { usePhotoAlbumFilters } from './composables/usePhotoAlbumFilters'
import { usePhotoNegativeEditor } from './composables/usePhotoNegativeEditor'
import { usePhotoUploadState } from './composables/usePhotoUploadState'

const router = useRouter()

const {
  allAlbums,
  filterStatus,
  filterPhotographer,
  filterSearch,
  photographerOptions,
  filteredAlbums,
  albums,
  activeAlbumId,
  activeAlbum,
  activeAlbumOrder,
  activeAlbumSelectionLink,
  albumProgress,
  totalPhotoCount,
  readyAlbumCount,
  needsUploadCount,
  activeProgressPercent,
  currentAlbumStats,
  activeAlbumActionLabel,
  activeAlbumActionHint,
  activeAlbumActionAvailability,
  canNotifyActiveAlbum,
  canConfirmActiveAlbum,
  canDeliverActiveAlbum,
  activeAlbumNeedsUpload,
  hasActiveFilter,
  resetFilter,
} = usePhotoAlbumFilters({
  albums: () => appStore.albums,
  orders: () => appStore.orders,
  selectionLinks: () => appStore.selectionLinks,
})

const {
  setNegativesInputEl,
  uploadError,
  uploadErrorCopyFailed,
  selectedPhotoIds,
  batchSelectionSaving,
  batchSelectionError,
  thumbnailLoadingIds,
  thumbnailFailedIds,
  copyingUploadKey,
  copiedUploadKey,
  uploadProgress,
  triggerNegativesUpload,
  photosToShow,
  togglePhotoSelection,
  selectAllPhotos,
  clearSelectedPhotos,
  clearThumbnailFailures,
  markSelectedPhotos,
  onThumbnailLoad,
  onThumbnailError,
  onNegativesChange,
  copyUploadError,
} = usePhotoUploadState({
  activeAlbum,
  uploadAlbumPhotos: async (albumId, files) => {
    await appStore.uploadAlbumPhotos(albumId, files)
  },
  markAlbumPhotosSelected: async (albumId, targets) => {
    await appStore.markAlbumPhotosSelected(albumId, targets)
  },
})
const {
  dragOverId,
  renameOpen,
  renameValue,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  moveNegative,
  openRename,
  closeRename,
  applyRename,
  deleteNegative,
} = usePhotoNegativeEditor({
  activeAlbum,
  sortAlbumPhotos: async (albumId) => {
    await appStore.sortAlbumPhotos(albumId)
  },
  renameAlbumPhoto: async (albumId, photoId, name) => {
    await appStore.renameAlbumPhoto(albumId, photoId, name)
  },
  deleteAlbumPhoto: async (albumId, photoId) => {
    await appStore.deleteAlbumPhoto(albumId, photoId)
  },
})
const {
  photoAccessLoading,
  photoAccessError,
  photoAccessRows,
  photoAccessEmptyHint,
  albumActionLoading,
  albumActionFeedback,
  albumActionFeedbackTone,
  albumActionError,
  loadCurrentPhotoAccessLogs,
  clearAlbumActionFeedback,
  handleAlbumNotify,
  handleAlbumConfirmSelection,
  handleAlbumDeliver,
} = usePhotoDeliveryActions({
  activeAlbum,
  activeAlbumOrder,
  activeAlbumActionAvailability,
  photoAccessLogsByAlbum: () => appStore.photoAccessLogsByAlbum,
  loadPhotoAccessLogs: async (albumId) => {
    await appStore.loadPhotoAccessLogs(albumId)
  },
  notifyAlbum: (albumId, payload) => appStore.notifyAlbum(albumId, payload),
  confirmAlbumSelection: (albumId, payload) => appStore.confirmAlbumSelection(albumId, payload),
  deliverAlbum: (albumId, payload) => appStore.deliverAlbum(albumId, payload),
})

const statusStyles: Record<string, string> = {
  '选片中': 'bg-amber-accent/10 text-amber-accent border border-amber-accent/20',
  '已交付': 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)] border border-[#2D7A4D]/20',
  '待客户选片': 'bg-amber-dark/5 text-amber-text-muted border border-amber-topbar-border'
}

const generateLinkFromAlbum = async () => {
  const album = activeAlbum.value
  if (!album) return
  const order = appStore.orders.find(o => o.id === album.orderId)
  const link = await appStore.generateSelectionLink({
    albumId: album.id,
    orderId: album.orderId,
    customer: album.customer,
    phone: order?.phone,
    product: order?.service ?? album.service,
  })
  router.push({ path: '/service/selection', query: { open: link.id } })
}

const goToSelectionConsole = () => {
  const album = activeAlbum.value
  router.push({
    path: '/service/selection',
    query: {
      open: activeAlbumSelectionLink.value?.id,
      album: album?.id,
    },
  })
}

watch(
  albums,
  (next) => {
    if ((!activeAlbumId.value || !next.some(album => album.id === activeAlbumId.value)) && next[0]) {
      activeAlbumId.value = next[0].id
    }
  },
  { immediate: true },
)

watch(
  activeAlbumId,
  (id) => {
    clearSelectedPhotos()
    clearThumbnailFailures()
    clearAlbumActionFeedback()
    if (id) {
      void appStore.loadAlbumDetails(id)
      void loadCurrentPhotoAccessLogs(id)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
