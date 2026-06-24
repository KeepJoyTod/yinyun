import { computed, ref, type ComputedRef } from 'vue'
import type { Album, BookingOrder, PhotoAccessLogInfo } from '../../../shared/stores/appStore'
import {
  buildPhotoAccessEmptyHint,
  summarizePhotoAccessLogs,
} from '../photoMgmtOperations'
import type { AlbumActionAvailability } from '../photoMgmtOperations'

type AlbumActionResult = {
  fallback?: boolean
  message?: string
  requestId?: string
}

export function usePhotoDeliveryActions(input: {
  activeAlbum: ComputedRef<Album | undefined>
  activeAlbumOrder: ComputedRef<BookingOrder | undefined>
  activeAlbumActionAvailability: ComputedRef<AlbumActionAvailability>
  photoAccessLogsByAlbum: () => Record<string, PhotoAccessLogInfo[]>
  loadPhotoAccessLogs: (albumId: string) => Promise<void>
  notifyAlbum: (albumId: string, payload: {
    channelType: string
    receiver?: string
    remark: string
  }) => Promise<AlbumActionResult>
  confirmAlbumSelection: (albumId: string, payload: { remark: string }) => Promise<AlbumActionResult>
  deliverAlbum: (albumId: string, payload: { remark: string }) => Promise<AlbumActionResult>
}) {
  const photoAccessLoading = ref(false)
  const photoAccessError = ref('')
  const albumActionLoading = ref<'' | 'notify' | 'confirm' | 'deliver'>('')
  const albumActionFeedback = ref('')
  const albumActionFeedbackTone = ref<'success' | 'warning'>('success')
  const albumActionError = ref('')

  const photoAccessLogs = computed(() => {
    const album = input.activeAlbum.value
    return album ? input.photoAccessLogsByAlbum()[album.id] ?? [] : []
  })
  const photoAccessRows = computed(() => summarizePhotoAccessLogs(photoAccessLogs.value))
  const photoAccessEmptyHint = computed(() => buildPhotoAccessEmptyHint(true))

  const loadCurrentPhotoAccessLogs = async (albumId: string) => {
    photoAccessLoading.value = true
    photoAccessError.value = ''
    try {
      await input.loadPhotoAccessLogs(albumId)
    } catch (error) {
      photoAccessError.value = error instanceof Error ? error.message : '未知错误'
    } finally {
      photoAccessLoading.value = false
    }
  }

  const clearAlbumActionFeedback = () => {
    albumActionFeedback.value = ''
    albumActionError.value = ''
  }

  const runAlbumAction = async (
    action: 'notify' | 'confirm' | 'deliver',
    execute: (albumId: string) => Promise<AlbumActionResult>,
    successLabel: string,
  ) => {
    const album = input.activeAlbum.value
    if (!album) return
    const availability = input.activeAlbumActionAvailability.value[action]
    if (!availability.enabled) {
      albumActionError.value = availability.reason
      return
    }
    albumActionLoading.value = action
    albumActionError.value = ''
    albumActionFeedback.value = ''
    try {
      const result = await execute(album.id)
      if (result.fallback) {
        albumActionFeedbackTone.value = 'warning'
        albumActionFeedback.value = result.requestId
          ? `已记录，需要人工跟进 · requestId ${result.requestId}`
          : '已记录，需要人工跟进'
        return
      }
      albumActionFeedbackTone.value = 'success'
      albumActionFeedback.value = result.message?.trim() || successLabel
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      albumActionError.value = `${successLabel}失败：${message}`
    } finally {
      albumActionLoading.value = ''
    }
  }

  const handleAlbumNotify = async () => {
    const album = input.activeAlbum.value
    if (!album) return
    await runAlbumAction(
      'notify',
      currentAlbumId => input.notifyAlbum(currentAlbumId, {
        channelType: 'SMS',
        receiver: input.activeAlbumOrder.value?.phone,
        remark: `工作台通知客户查看相册 ${album.id}`,
      }),
      '通知客户',
    )
  }

  const handleAlbumConfirmSelection = async () => {
    const album = input.activeAlbum.value
    if (!album) return
    await runAlbumAction(
      'confirm',
      currentAlbumId => input.confirmAlbumSelection(currentAlbumId, {
        remark: `工作台确认客片 ${album.id} 选片结果`,
      }),
      '客片确认',
    )
  }

  const handleAlbumDeliver = async () => {
    const album = input.activeAlbum.value
    if (!album) return
    await runAlbumAction(
      'deliver',
      currentAlbumId => input.deliverAlbum(currentAlbumId, {
        remark: `工作台发送相册 ${album.id} 最终交付资料`,
      }),
      '资料发送',
    )
  }

  return {
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
  }
}
