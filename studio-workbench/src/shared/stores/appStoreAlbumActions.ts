import { albumsStore } from './albumsStore'
import type { BookingOrder, SelectionLink } from './appStoreTypes'

type AlbumActionStore = {
  demoMode: boolean
  orders: BookingOrder[]
  selectionLinks: SelectionLink[]
  syncAlbumsToOwner(): void
  syncAlbumsFromOwner(): void
}

export async function generateSelectionLinkAction(
  ctx: AlbumActionStore,
  input: {
    orderId?: string
    albumId?: string
    customer?: string
    phone?: string
    product?: string
  },
) {
  ctx.syncAlbumsToOwner()
  const link = ctx.demoMode
    ? albumsStore.generateSelectionLinkDemo(input, ctx.orders)
    : await albumsStore.generateSelectionLink(input, ctx.orders)
  ctx.syncAlbumsFromOwner()
  return link
}

export async function uploadAlbumPhotosAction(ctx: AlbumActionStore, albumId: string, files: File[]) {
  ctx.syncAlbumsToOwner()
  const photos = ctx.demoMode
    ? albumsStore.uploadAlbumPhotosDemo(albumId, files)
    : await albumsStore.uploadAlbumPhotos(albumId, files)
  ctx.syncAlbumsFromOwner()
  return photos
}

export async function sortAlbumPhotosAction(ctx: AlbumActionStore, albumId: string) {
  ctx.syncAlbumsToOwner()
  if (ctx.demoMode) return
  await albumsStore.sortAlbumPhotos(albumId)
  ctx.syncAlbumsFromOwner()
}

export async function renameAlbumPhotoAction(
  ctx: AlbumActionStore,
  albumId: string,
  photoId: string,
  displayName: string,
) {
  ctx.syncAlbumsToOwner()
  const next = ctx.demoMode
    ? albumsStore.renameAlbumPhotoDemo(albumId, photoId, displayName)
    : await albumsStore.renameAlbumPhoto(albumId, photoId, displayName, ctx.orders)
  ctx.syncAlbumsFromOwner()
  return next
}

export async function markAlbumPhotosSelectedAction(
  ctx: AlbumActionStore,
  albumId: string,
  updates: { photoId: string; selected: boolean }[],
) {
  ctx.syncAlbumsToOwner()
  const updatedPhotos = ctx.demoMode
    ? albumsStore.markAlbumPhotosSelectedDemo(albumId, updates)
    : await albumsStore.markAlbumPhotosSelected(albumId, updates)
  ctx.syncAlbumsFromOwner()
  return updatedPhotos
}

export async function deleteAlbumPhotoAction(ctx: AlbumActionStore, albumId: string, photoId: string) {
  ctx.syncAlbumsToOwner()
  const next = ctx.demoMode
    ? albumsStore.deleteAlbumPhotoDemo(albumId, photoId)
    : await albumsStore.deleteAlbumPhoto(albumId, photoId, ctx.orders)
  ctx.syncAlbumsFromOwner()
  return next
}

export const findSelectionLinkAction = (ctx: Pick<AlbumActionStore, 'selectionLinks'>, id: string) =>
  ctx.selectionLinks.find(link => link.id === id || link.token === id || link.display.endsWith(id) || link.url.endsWith(id))
