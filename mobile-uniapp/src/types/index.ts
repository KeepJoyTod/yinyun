export type PhotoPlatform =
  | 'H5'
  | 'WECHAT_MINI_APP'
  | 'DOUYIN_MINI_APP'
  | 'DOUYIN_LIFE'
  | 'MANUAL';

export type ClientPhotoId = string;

// ── 取片系统 Token（已有） ──────────────────────────────────────
export interface ClientPhotoToken {
  clientToken: string;
  expiresIn: number;
  expiresAt: string;
  phoneMasked: string;
  platform: PhotoPlatform;
}

// ── 客户端用户体系 ──────────────────────────────────────────────
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
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
  user: CustomerUser;
}

// ── 门店 ────────────────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  province?: string;
  city?: string;
  district?: string;
  address: string;
  phone?: string;
  longitude?: number;
  latitude?: number;
  businessHours?: string;
  status?: 'OPEN' | 'CLOSED' | 'HIDDEN' | string;
  imageUrl?: string;
  distance?: number;
}

// ── 商品 ────────────────────────────────────────────────────────
export interface Product {
  id: string;
  storeId?: string;
  title: string;
  description?: string;
  originalPrice?: number;
  currentPrice?: number;
  imageUrl?: string;
  category?: string;
  includedPhotos?: number;
  includedRetouched?: number;
  shootDuration?: string;
  applicableCount?: string;
  status?: 'ON_SALE' | 'OFF_SALE' | string;
  tags?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  sort?: number;
}

// ── 可预约时段 ──────────────────────────────────────────────────
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  studioId?: string;
  studioName?: string;
}

// ── 客户端订单 ──────────────────────────────────────────────────
export type CustomerOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_CONFIRM'
  | 'CONFIRMED'
  | 'SHOOTING'
  | 'PENDING_SELECTION'
  | 'RETCHING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

export interface CustomerOrderItem {
  orderId: string;
  orderNo: string;
  productTitle?: string;
  productImage?: string;
  storeName?: string;
  status: CustomerOrderStatus;
  statusLabel?: string;
  amount?: number;
  payStatus?: string;
  appointmentTime?: string;
  createdTime?: string;
}

// ── 品牌配置 ────────────────────────────────────────────────────
export interface BrandConfig {
  brandCode: string;
  name: string;
  logo?: string;
  description?: string;
  themeColor?: string;
  shareTitle?: string;
  shareImage?: string;
  shareDescription?: string;
}

// ── 相册系统（已有） ────────────────────────────────────────────
export interface ClientPhotoAlbum {
  albumId: ClientPhotoId;
  title: string;
  assetCount?: number;
  coverAssetId?: string;
  customerName?: string;
  channelType?: PhotoPlatform | string;
  status?: string;
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
