<template>
  <div class="flex-1 overflow-y-auto p-5">
    <input :ref="setNegativesInputEl" type="file" accept="image/*" multiple class="hidden" @change="onNegativesChange" />

    <Transition name="fade">
      <div
        v-if="uploadProgress && uploadProgress.active"
        class="mb-5 border border-amber-accent/25 bg-amber-accent/5 px-5 py-4"
        role="status"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-[11px] font-sans text-amber-dark">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-accent"></span>
            <span>正在上传底片 {{ uploadProgress.done }} / {{ uploadProgress.total }}</span>
          </div>
          <span class="text-[10px] font-mono text-amber-text-muted">
            {{ Math.round((uploadProgress.done / Math.max(1, uploadProgress.total)) * 100) }}%
          </span>
        </div>
        <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-amber-topbar-border/40">
          <div
            class="h-full bg-amber-accent transition-all duration-200"
            :style="{ width: Math.round((uploadProgress.done / Math.max(1, uploadProgress.total)) * 100) + '%' }"
          ></div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="uploadError"
        class="mb-5 border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-5 py-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[11px] font-semibold text-[#8C3E2C]">底片上传失败</div>
            <div class="mt-1 text-[10px] font-mono text-[#8C3E2C]">{{ uploadError.stage }} · {{ uploadError.fileName }}</div>
            <div class="mt-1 text-[10px] leading-relaxed text-[#8C3E2C]">{{ uploadError.message }}</div>
            <button
              class="mt-2 yy-action border border-[#B8543B]/40 bg-white/20 px-2.5 py-1 text-[9.5px] font-mono text-[#8C3E2C] hover:bg-white/35"
              type="button"
              @click="copyUploadError"
            >
              {{ copyingUploadKey === 'upload-error' ? '复制中...' : copiedUploadKey === 'upload-error' ? '已复制' : '复制错误详情' }}
            </button>
            <div v-if="uploadErrorCopyFailed" class="mt-1 text-[10px] text-[#8C3E2C]/70">复制失败，请手动选择文本复制。</div>
          </div>
          <button
            class="shrink-0 p-1 text-[#8C3E2C]/60 hover:text-[#8C3E2C]"
            type="button"
            aria-label="关闭上传错误提示"
            @click="$emit('closeUploadError')"
          >
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="photosToShow.length > 0"
      class="photo-batch-toolbar mb-5 flex items-center justify-between gap-4 border border-amber-topbar-border bg-amber-content-bg/70 p-3 max-[760px]:flex-col max-[760px]:items-stretch"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">Batch Delivery</span>
        <span class="text-[11px] font-sans text-amber-dark">
          已选择 {{ selectedPhotoIds.size }} / {{ photosToShow.length }} 张 · 用于快速整理客户已选精修片
        </span>
      </div>
      <div class="flex flex-wrap items-center gap-2 max-[760px]:grid max-[760px]:grid-cols-2">
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          :disabled="batchSelectionSaving || selectedPhotoIds.size === photosToShow.length"
          @click="selectAllPhotos"
          type="button"
        >
          全选
        </button>
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          :disabled="batchSelectionSaving || selectedPhotoIds.size === 0"
          @click="clearSelectedPhotos"
          type="button"
        >
          清空选择
        </button>
        <button
          class="yy-action px-3 py-1.5 border border-amber-dark bg-amber-dark text-[10.5px] font-sans text-[#F4EFE6] hover:bg-black disabled:opacity-40"
          :disabled="batchSelectionSaving || selectedPhotoIds.size === 0"
          @click="markSelectedPhotos(true)"
          type="button"
        >
          {{ batchSelectionSaving ? '保存中...' : '批量标记已选' }}
        </button>
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5 disabled:opacity-40"
          :disabled="batchSelectionSaving || selectedPhotoIds.size === 0"
          @click="markSelectedPhotos(false)"
          type="button"
        >
          {{ batchSelectionSaving ? '保存中...' : '批量取消已选' }}
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="batchSelectionError"
        class="mb-5 border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[10.5px] text-[#8C3E2C]"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-semibold">选片状态保存失败</div>
            <div class="mt-1">当前批量选择的已选/取消状态未能写回服务器。可能是网络问题或底片已被其他操作修改。</div>
            <div class="mt-1.5">建议：刷新相册后重新选择，或联系管理员检查底片锁。</div>
          </div>
          <button
            class="shrink-0 p-1 text-[#8C3E2C]/60 hover:text-[#8C3E2C]"
            type="button"
            aria-label="关闭错误提示"
            @click="$emit('clearBatchSelectionError')"
          >
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Transition>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div
        v-for="photo in photosToShow"
        :key="photo.key"
        class="yy-photo-tile aspect-[3/4] bg-[#EBE4D6] rounded-md overflow-hidden relative group cursor-pointer border border-transparent hover:border-amber-accent/30 transition-all"
        :class="photo.isNegative && dragOverId === photo.id ? 'border-amber-accent/60' : ''"
        :draggable="photo.isNegative"
        @dragstart="photo.isNegative && onDragStart(photo.id)"
        @dragover.prevent="photo.isNegative && onDragOver(photo.id)"
        @drop.prevent="photo.isNegative && onDrop(photo.id)"
        @dragend="photo.isNegative && onDragEnd()"
        @click="togglePhotoSelection(photo.id)"
      >
        <img
          v-if="photo.url"
          :src="photo.url"
          class="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          :class="thumbnailFailedIds.has(photo.id) ? 'opacity-0' : 'opacity-100'"
          @load="onThumbnailLoad(photo.id)"
          @error="onThumbnailError(photo.id)"
        />
        <div v-else class="w-full h-full flex items-center justify-center p-4 text-center text-[10px] font-mono text-amber-text-muted bg-[#EBE4D6]">
          {{ photo.name }}
        </div>
        <div
          v-if="photo.url && thumbnailLoadingIds.has(photo.id)"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#EBE4D6] text-center"
        >
          <span class="h-8 w-8 animate-pulse rounded-full border border-amber-topbar-border bg-white/45"></span>
          <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">缩略图生成中</span>
        </div>
        <div
          v-if="thumbnailFailedIds.has(photo.id)"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#EBE4D6] p-4 text-center"
        >
          <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-dark">缩略图加载失败</span>
          <span class="text-[10px] font-sans leading-relaxed text-amber-text-muted">请检查原图地址或重新同步底片</span>
        </div>

        <div v-if="photo.isNegative" class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex items-center gap-1.5">
            <div class="w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center">
              <img src="../../../assets/icons/drag-handle.svg" class="w-3.5 h-3.5 invert brightness-200 opacity-80" />
            </div>
          </div>
        </div>

        <div v-if="photo.isNegative" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex items-center gap-1.5">
            <button
              class="yy-action w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center hover:bg-black/40 transition-colors"
              @click.stop="moveNegative(photo.id, -1)"
              type="button"
            >
              <span class="text-[11px] font-mono text-white/90 leading-none">↑</span>
            </button>
            <button
              class="yy-action w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center hover:bg-black/40 transition-colors"
              @click.stop="moveNegative(photo.id, 1)"
              type="button"
            >
              <span class="text-[11px] font-mono text-white/90 leading-none">↓</span>
            </button>
            <button
              class="yy-action w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center hover:bg-black/40 transition-colors"
              @click.stop="openRename(photo.id)"
              type="button"
            >
              <img src="../../../assets/icons/edit-config.svg" class="w-3.5 h-3.5 invert brightness-200 opacity-90" />
            </button>
            <button
              class="yy-action w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center hover:bg-black/40 transition-colors"
              @click.stop="deleteNegative(photo.id)"
              type="button"
            >
              <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5 invert brightness-200 opacity-90" />
            </button>
          </div>
        </div>

        <div class="absolute left-2 top-2 flex gap-1.5">
          <span class="px-1.5 py-0.5 bg-black/35 backdrop-blur-sm border border-white/20 text-[8px] font-mono uppercase tracking-[0.12em] text-white/90">
            {{ selectedPhotoIds.has(photo.id) ? 'Picked' : photo.selected ? 'Selected' : 'Pending' }}
          </span>
        </div>

        <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-mono text-white/90">{{ photo.name }}</span>
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <div class="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="photosToShow.length === 0"
      class="empty-photo-dropzone min-h-[280px] flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-amber-topbar-border bg-white/55 px-6 py-10 text-center"
    >
      <img :src="workbenchImages.emptyFiles" alt="" class="h-[104px] w-[136px] object-contain opacity-90" loading="lazy" />
      <div class="text-[14px] font-sans font-semibold text-amber-dark">暂无底片</div>
      <div class="max-w-[380px] text-[11px] font-sans leading-relaxed text-amber-text-muted">
        <p>当前相册没有底片，不会展示假缩略图。</p>
        <p class="mt-1">门店修完照片后，点击上方「上传底片」按钮上传第一批文件，系统会自动创建底片记录并同步到相册。</p>
      </div>
      <button
        class="yy-action rounded-md border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-sans font-medium text-[#F4EFE6] hover:bg-black transition-all"
        type="button"
        @click="triggerNegativesUpload"
      >
        上传第一批底片
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { workbenchImages } from '../../../shared/stores/workbenchAssets'
import type { PhotoItem, UploadFailureSummary } from '../photoMgmtOperations'

defineProps<{
  setNegativesInputEl: (el: Element | ComponentPublicInstance | null) => void
  uploadProgress: { active: boolean; done: number; total: number } | null
  uploadError: UploadFailureSummary | null
  uploadErrorCopyFailed: boolean
  copyingUploadKey: string
  copiedUploadKey: string
  photosToShow: PhotoItem[]
  selectedPhotoIds: Set<string>
  batchSelectionSaving: boolean
  batchSelectionError: string
  thumbnailLoadingIds: Set<string>
  thumbnailFailedIds: Set<string>
  dragOverId: string | null
  onNegativesChange: (event: Event) => void | Promise<void>
  copyUploadError: () => void | Promise<void>
  selectAllPhotos: () => void
  clearSelectedPhotos: () => void
  markSelectedPhotos: (selected: boolean) => void | Promise<void>
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDrop: (id: string) => void | Promise<void>
  onDragEnd: () => void
  togglePhotoSelection: (id: string) => void
  onThumbnailLoad: (id: string) => void
  onThumbnailError: (id: string) => void
  moveNegative: (id: string, delta: -1 | 1) => void | Promise<void>
  openRename: (id: string) => void
  deleteNegative: (id: string) => void | Promise<void>
  triggerNegativesUpload: () => void
}>()

defineEmits<{
  closeUploadError: []
  clearBatchSelectionError: []
}>()
</script>
