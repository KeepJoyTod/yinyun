export type PhotoPlatform =
  | 'H5'
  | 'WECHAT_MINI_APP'
  | 'DOUYIN_MINI_APP'
  | 'DOUYIN_LIFE'
  | 'MANUAL';

export type ClientPhotoId = string;

export interface ClientPhotoToken {
  clientToken: string;
  expiresIn: number;
  expiresAt: string;
  phoneMasked: string;
  platform: PhotoPlatform;
}

export interface CustomerUser {
  id: string;
  openId?: string;
  openid?: string;
  unionId?: string;
  unionid?: string;
  phone?: string;
  phoneMasked?: string;
  nickname?: string;
  avatarUrl?: string;
  platform: PhotoPlatform;
  createdAt?: string;
}

export interface CustomerAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: string;
  user: CustomerUser;
}

export interface CustomerAuthResponse extends Partial<CustomerAuthToken> {
  token?: string;
  customer?: CustomerUser;
}

export interface CustomerProfile {
  id: string;
  openId?: string;
  unionId?: string;
  phoneMasked?: string;
  nickname?: string;
  avatarUrl?: string;
  memberLevel?: string;
  createdAt?: string;
}

export interface CustomerOrderSummary {
  totalOrders: number;
  pendingPaymentCount: number;
  pendingSelectionCount: number;
  completedCount: number;
  downloadablePhotoCount: number;
}

export type CustomerOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_CONFIRM'
  | 'CONFIRMED'
  | 'SHOOTING'
  | 'PENDING_SELECTION'
  | 'RETOUCHING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

export interface CustomerRescheduleRequest {
  id?: string | number;
  orderId?: string | number;
  originalDate?: string;
  originalTimeSlot?: string;
  newDate?: string;
  newTimeSlot?: string;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  auditRemark?: string;
  createdAt?: string;
}

export interface CustomerOrder {
  orderId: string;
  id?: string;
  orderNo: string;
  storeId?: string;
  productId?: string;
  skuId?: string;
  categoryId?: string;
  customerName?: string;
  customerPhoneMasked?: string;
  productTitle?: string;
  productImage?: string;
  skuName?: string;
  storeName?: string;
  status: CustomerOrderStatus;
  orderStatus?: CustomerOrderStatus;
  statusLabel?: string;
  amount?: number;
  payAmount?: number;
  payStatus?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  createdTime?: string;
  createdAt?: string;
  albumId?: string;
  scheduleId?: string;
  storePhone?: string;
  storeAddress?: string;
  refundRule?: string;
  rescheduleRule?: string;
  canReschedule?: boolean;
  rescheduleDisabledReason?: string;
  rescheduleRemainingCount?: number;
  latestRescheduleTime?: string;
  canCancel?: boolean;
  cancelDisabledReason?: string;
  refundRatio?: number;
  estimatedRefundAmount?: number;
}

export interface CreateCustomerOrderPayload {
  storeId: string;
  skuId: string;
  categoryId?: string;
  customerName: string;
  customerPhone: string;
  remark?: string;
  appointmentDate: string;
  timeSlot: string;
}

export interface CustomerOrderPage {
  content?: CustomerOrder[];
  records?: CustomerOrder[];
  list?: CustomerOrder[];
  totalElements?: number;
  total?: number;
  number?: number;
  page?: number;
  size?: number;
  last?: boolean;
}

export interface CustomerPaymentParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
  paymentReady: boolean;
  message: string;
  transactionNo?: string;
  orderId?: string;
  orderNo?: string;
  amount?: number;
}

export interface ClientPhotoAlbum {
  albumId: ClientPhotoId;
  title: string;
  assetCount?: number;
  coverAssetId?: string;
  customerName?: string;
  channelType?: PhotoPlatform | string;
  status?: string;
  selectionStatus?: 'DRAFT' | 'SUBMITTED' | 'RETOUCHING' | 'DELIVERED' | string;
  expireTime?: string;
}

export interface ClientPhotoAsset {
  assetId: ClientPhotoId;
  fileName: string;
  sort?: number;
  selected?: boolean | string;
}

export interface ClientPhotoAlbumDetail {
  albumId: ClientPhotoId;
  title: string;
  expireTime?: string;
  selectionStatus?: 'DRAFT' | 'SUBMITTED' | 'RETOUCHING' | 'DELIVERED' | string;
  selectedCount?: number;
  lastSelectionSubmitTime?: string;
  assets: ClientPhotoAsset[];
}

export interface ClientPhotoSignedUrl {
  assetId: ClientPhotoId;
  url: string;
  expiresIn: number;
  expiresAt: string;
  fileName?: string;
  contentType?: string;
}

export interface ClientPhotoSendCodeResult {
  requestId?: string;
  expiresIn?: number;
  nextSendIn?: number;
  description?: string;
  message?: string;
}

export interface ClientDouyinLifeOrderEntry {
  entryId: string;
  storeId?: string;
  productId?: string;
  channelType: 'DOUYIN_LIFE';
  title: string;
  externalProductId?: string;
  externalSkuId?: string;
  externalPoiId?: string;
  landingUrl?: string;
  landingPath?: string;
}
