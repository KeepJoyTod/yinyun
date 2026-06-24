import { computed, ref, watch, type ComponentPublicInstance, type ComputedRef } from 'vue'
import { useCopyWithState } from '../../../shared/composables/useCopyWithState'
import type { Album } from '../../../shared/stores/appStore'
import {
  buildPhotoItems,
  buildPhotoSelectionUpdateTargets,
  formatUploadErrorForCopy,
  getNextThumbnailSets,
  parseUploadErrorMessage,
  type PhotoItem,
  type UploadFailureSummary,
} from '../photoMgmtOperations'

export function usePhotoUploadState(input: {
  activeAlbum: ComputedRef<Album | undefined>
  uploadAlbumPhotos: (albumId: string, files: File[]) => Promise<void>
  markAlbumPhotosSelected: (
    albumId: string,
    targets: { photoId: string; selected: boolean }[],
  ) => Promise<void>
}) {
  const negativesInputEl = ref<HTMLInputElement | null>(null)
  const uploadError = ref<UploadFailureSummary | null>(null)
  const uploadErrorCopyFailed = ref(false)
  const selectedPhotoIds = ref(new Set<string>())
  const batchSelectionSaving = ref(false)
  const batchSelectionError = ref('')
  const thumbnailLoadingIds = ref(new Set<string>())
  const thumbnailFailedIds = ref(new Set<string>())
  const uploadProgress = ref<{ active: boolean; done: number; total: number } | null>(null)
  const { copyingKey: copyingUploadKey, copiedKey: copiedUploadKey, copyText } = useCopyWithState()

  const triggerNegativesUpload = () => {
    negativesInputEl.value?.click()
  }

  const setNegativesInputEl = (el: Element | ComponentPublicInstance | null) => {
    negativesInputEl.value = el instanceof HTMLInputElement ? el : null
  }

  const photosToShow = computed<PhotoItem[]>(() => buildPhotoItems(input.activeAlbum.value))

  const replaceSet = (
    target: typeof selectedPhotoIds | typeof thumbnailLoadingIds | typeof thumbnailFailedIds,
    values: string[],
  ) => {
    target.value = new Set(values)
  }

  const togglePhotoSelection = (id: string) => {
    const next = new Set(selectedPhotoIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedPhotoIds.value = next
  }

  const selectAllPhotos = () => {
    replaceSet(selectedPhotoIds, photosToShow.value.map(photo => photo.id))
  }

  const clearSelectedPhotos = () => {
    selectedPhotoIds.value = new Set()
  }

  const clearThumbnailFailures = () => {
    thumbnailFailedIds.value = new Set()
  }

  const markSelectedPhotos = async (selected: boolean) => {
    const album = input.activeAlbum.value
    if (!album) return
    const targets = buildPhotoSelectionUpdateTargets(photosToShow.value, selectedPhotoIds.value, selected)
    if (targets.length === 0) {
      clearSelectedPhotos()
      return
    }
    batchSelectionSaving.value = true
    batchSelectionError.value = ''
    try {
      await input.markAlbumPhotosSelected(album.id, targets)
      clearSelectedPhotos()
    } catch (error) {
      batchSelectionError.value = error instanceof Error ? error.message : '未知错误'
    } finally {
      batchSelectionSaving.value = false
    }
  }

  const onThumbnailLoad = (id: string) => {
    const loading = new Set(thumbnailLoadingIds.value)
    loading.delete(id)
    thumbnailLoadingIds.value = loading
    const failed = new Set(thumbnailFailedIds.value)
    failed.delete(id)
    thumbnailFailedIds.value = failed
  }

  const onThumbnailError = (id: string) => {
    const loading = new Set(thumbnailLoadingIds.value)
    loading.delete(id)
    thumbnailLoadingIds.value = loading
    const failed = new Set(thumbnailFailedIds.value)
    failed.add(id)
    thumbnailFailedIds.value = failed
  }

  const onNegativesChange = async (event: Event) => {
    const inputEl = event.target as HTMLInputElement
    const files = Array.from(inputEl.files ?? []).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    const album = input.activeAlbum.value
    if (!album) return
    uploadError.value = null
    uploadProgress.value = { active: true, done: 0, total: files.length }
    const progressTimer = window.setInterval(() => {
      if (!uploadProgress.value || !uploadProgress.value.active) return
      const next = Math.min(uploadProgress.value.total, uploadProgress.value.done + 1)
      uploadProgress.value = { ...uploadProgress.value, done: next }
      if (next >= uploadProgress.value.total) window.clearInterval(progressTimer)
    }, 120)

    try {
      await input.uploadAlbumPhotos(album.id, files)
    } catch (error) {
      window.clearInterval(progressTimer)
      uploadProgress.value = null
      const message = error instanceof Error ? error.message : '上传失败'
      uploadError.value = parseUploadErrorMessage(message) ?? {
        fileName: files[0]?.name || '未知文件',
        stage: 'unknown',
        message,
        detail: {
          albumId: album.id,
          storeId: '',
          fileName: files[0]?.name || '未知文件',
          stage: 'unknown',
          message,
          ossId: '',
          objectKey: '',
        },
      }
      inputEl.value = ''
      return
    }

    window.clearInterval(progressTimer)
    window.setTimeout(() => {
      uploadProgress.value = null
    }, 600)
    inputEl.value = ''
  }

  const copyUploadError = async () => {
    if (!uploadError.value) return
    const text = formatUploadErrorForCopy(uploadError.value.detail)
    uploadErrorCopyFailed.value = false
    const ok = await copyText(text, 'upload-error')
    if (ok) return
    uploadErrorCopyFailed.value = true
    window.setTimeout(() => {
      if (uploadErrorCopyFailed.value) uploadErrorCopyFailed.value = false
    }, 2200)
  }

  watch(
    photosToShow,
    (photos) => {
      const next = getNextThumbnailSets({
        photos,
        selectedIds: selectedPhotoIds.value,
        failedIds: thumbnailFailedIds.value,
        loadingIds: thumbnailLoadingIds.value,
      })
      selectedPhotoIds.value = next.selectedIds
      thumbnailFailedIds.value = next.failedIds
      thumbnailLoadingIds.value = next.loadingIds
    },
    { immediate: true },
  )

  return {
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
  }
}
