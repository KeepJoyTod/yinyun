export type RuoyiTableResponse<T> = {
  code?: number
  msg?: string
  rows?: T[]
  total?: number
}

export type YyStoreVo = {
  id: string | number
  storeCode?: string
  storeName?: string
  status?: string
  phone?: string
  address?: string
  businessHours?: string
  remark?: string
}

export type YyProductVo = {
  id: string | number
  storeId?: string | number
  productType?: string
  productName?: string
  price?: string | number
  durationMinutes?: number
  selectionPrice?: string | number
  albumProductName?: string
  status?: string
  remark?: string
}

export type YyOrderVo = {
  id: string | number
  storeId?: string | number
  serviceGroupId?: string | number
  inventorySlotId?: string | number
  orderNo?: string
  customerName?: string
  customerPhone?: string
  source?: string
  bookingMethod?: string
  orderTime?: string
  arrivalTime?: string
  status?: string
  payStatus?: string
  channelType?: string
  totalAmountCent?: string | number
  paidAmountCent?: string | number
  refundStatus?: string
  refundAmountCent?: string | number
  workstationNo?: string
  externalOrderId?: string
  externalProductId?: string
  externalSkuId?: string
  externalPoiId?: string
  slotDate?: string
  slotStartTime?: string
  slotEndTime?: string
  inventoryStatus?: string
  conflictReason?: string
  remark?: string
  serviceNameSnapshot?: string
  serviceName?: string
  productName?: string
  albumProductName?: string
}

export type YyPhotoAlbumVo = {
  id: string | number
  storeId?: string | number
  orderId?: string | number
  albumName?: string
  customerName?: string
  customerPhone?: string
  publicToken?: string
  accessCode?: string
  channelType?: string
  status?: string
  selectionStatus?: string
  expireTime?: string
  remark?: string
}

export type YyPhotoAssetVo = {
  id: string | number
  storeId?: string | number
  albumId?: string | number
  fileName?: string
  fileUrl?: string
  objectKey?: string
  thumbnailObjectKey?: string
  sort?: number
  isSelected?: string
  visible?: string
  createTime?: string
  remark?: string
}

export type OssVo = {
  ossId?: string | number
  fileName?: string
  originalName?: string
  url?: string
}

export type YyPhotoAssetForm = {
  id?: string | number
  storeId: string | number
  albumId: string | number
  fileName: string
  fileUrl: string
  objectKey: string
  thumbnailObjectKey: string
  sort: number
  isSelected: string
  visible: string
  remark: string
}
