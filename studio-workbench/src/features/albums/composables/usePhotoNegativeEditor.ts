import { ref, type ComputedRef } from 'vue'
import type { Album } from '../../../shared/stores/appStore'

export function usePhotoNegativeEditor(input: {
  activeAlbum: ComputedRef<Album | undefined>
  sortAlbumPhotos: (albumId: string) => Promise<void>
  renameAlbumPhoto: (albumId: string, photoId: string, name: string) => Promise<void>
  deleteAlbumPhoto: (albumId: string, photoId: string) => Promise<void>
}) {
  const draggingId = ref<string | null>(null)
  const dragOverId = ref<string | null>(null)
  const renameOpen = ref(false)
  const renameId = ref<string | null>(null)
  const renameValue = ref('')

  const onDragStart = (id: string) => {
    draggingId.value = id
  }

  const onDragOver = (id: string) => {
    dragOverId.value = id
  }

  const clearDragState = () => {
    draggingId.value = null
    dragOverId.value = null
  }

  const persistSort = async () => {
    const album = input.activeAlbum.value
    if (!album) return
    await input.sortAlbumPhotos(album.id)
  }

  const onDrop = async (targetId: string) => {
    const album = input.activeAlbum.value
    if (!album || !album.negatives) return
    const sourceId = draggingId.value
    if (!sourceId || sourceId === targetId) {
      clearDragState()
      return
    }
    const from = album.negatives.findIndex(negative => negative.id === sourceId)
    const to = album.negatives.findIndex(negative => negative.id === targetId)
    if (from === -1 || to === -1) {
      clearDragState()
      return
    }
    const next = [...album.negatives]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    album.negatives = next
    await persistSort()
    clearDragState()
  }

  const onDragEnd = () => {
    clearDragState()
  }

  const moveNegative = async (id: string, delta: -1 | 1) => {
    const album = input.activeAlbum.value
    if (!album || !album.negatives) return
    const from = album.negatives.findIndex(negative => negative.id === id)
    if (from === -1) return
    const to = from + delta
    if (to < 0 || to >= album.negatives.length) return
    const next = [...album.negatives]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    album.negatives = next
    await persistSort()
  }

  const openRename = (id: string) => {
    const album = input.activeAlbum.value
    const target = album?.negatives?.find(negative => negative.id === id)
    if (!target) return
    renameId.value = id
    renameValue.value = target.name
    renameOpen.value = true
  }

  const closeRename = () => {
    renameOpen.value = false
    renameId.value = null
    renameValue.value = ''
  }

  const applyRename = async () => {
    const album = input.activeAlbum.value
    if (!album || !album.negatives) return
    const id = renameId.value
    if (!id) return
    const nextName = renameValue.value.trim()
    if (!nextName) return
    await input.renameAlbumPhoto(album.id, id, nextName)
    closeRename()
  }

  const deleteNegative = async (id: string) => {
    const album = input.activeAlbum.value
    if (!album || !album.negatives) return
    const target = album.negatives.find(negative => negative.id === id)
    if (!target) return
    const ok = window.confirm(`删除底片：${target.name}？`)
    if (!ok) return
    await input.deleteAlbumPhoto(album.id, id)
    if (renameId.value === id) closeRename()
  }

  return {
    draggingId,
    dragOverId,
    renameOpen,
    renameId,
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
  }
}
