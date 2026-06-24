import type { BackendId } from '../../shared/api/backendId'

export type ResourceManageFilters = {
  keyword: string
  beginUploadTime: string
  endUploadTime: string
  storeId: string
  albumId: string
  orderId: string
  productId: string
  uploaderKeyword: string
  assetType: string
  rating: string
  tagIds: BackendId[]
  visible: string
}

export const createDefaultResourceManageFilters = (): ResourceManageFilters => ({
  keyword: '',
  beginUploadTime: '',
  endUploadTime: '',
  storeId: '',
  albumId: '',
  orderId: '',
  productId: '',
  uploaderKeyword: '',
  assetType: '',
  rating: '',
  tagIds: [],
  visible: '',
})
