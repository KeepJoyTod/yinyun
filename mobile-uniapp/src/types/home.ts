export type StoreStatus = 'OPEN' | 'CLOSED' | 'PAUSED' | 'HIDDEN';
export type PublicLinkType =
  | 'INTERNAL'
  | 'PRODUCT'
  | 'STORE'
  | 'EXTERNAL'
  | 'WECHAT_SERVICE'
  | 'NOTICE'
  | 'SAMPLES'
  | 'ORDER';

export interface BrandInfo {
  brandId: string;
  brandCode: string;
  name: string;
  logo?: string;
  logoUrl?: string;
  summary?: string;
  description?: string;
  themeColor?: string;
  shareTitle?: string;
  shareImage?: string;
  shareImageUrl?: string;
  shareDescription?: string;
  shareDesc?: string;
}

export interface HomeBanner {
  bannerId: string;
  imageUrl: string;
  title?: string;
  linkType?: PublicLinkType;
  linkTarget?: string;
  sort?: number;
}

export interface HomeCategory {
  categoryId: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  linkType?: PublicLinkType | string;
  linkTarget?: string;
  sort?: number;
}

export interface HomeMenuItem {
  menuItemId: string;
  label: string;
  icon?: string;
  linkType?: PublicLinkType | string;
  linkTarget?: string;
  sort?: number;
}

export interface HomeData {
  brand: BrandInfo;
  banners: HomeBanner[];
  categories: HomeCategory[];
  menuItems: HomeMenuItem[];
  serviceNotice?: string;
}

export interface StoreItem {
  storeId: string;
  id?: string | number;
  name: string;
  province?: string;
  city?: string;
  district?: string;
  address: string;
  phone?: string;
  contactWechat?: string;
  longitude?: number;
  latitude?: number;
  businessHours?: string;
  status: StoreStatus;
  storeImage?: string;
  imageUrl?: string;
  distance?: number;
  sort?: number;
  sortOrder?: number;
  hidden?: boolean;
}

export interface StoreListParams {
  brandCode?: string;
  lng?: number;
  lat?: number;
  keyword?: string;
}

export interface ProductItem {
  productId: string;
  id?: string | number;
  storeId: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  title?: string;
  subtitle?: string;
  coverImage?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  priceRange?: string;
  tag?: string;
  includeCount?: number;
  retouchCount?: number;
  shootDuration?: string;
  applicableCount?: string;
  makeupService?: string;
  deliveryCycle?: string;
  description?: string;
  refundRule?: string;
  rescheduleRule?: string;
  status?: string;
  sort?: number;
  sortOrder?: number;
}

export interface ProductCategory {
  categoryId: string;
  id?: string | number;
  name: string;
  icon?: string;
  iconUrl?: string;
  productCount?: number;
}

export interface ProductSkuItem {
  skuId: string;
  id?: string | number;
  productId: string;
  skuName: string;
  price: number;
  originalPrice?: number;
  includedPhotos?: number;
  includedRetouch?: number;
  durationMinutes?: number;
  extraPhotoPrice?: number;
  stock?: number;
  status?: string;
}

export interface StoreProductsData {
  store: StoreItem;
  categories: ProductCategory[];
  products: ProductItem[];
}

export interface ProductDetailData {
  product: ProductItem;
  skus: ProductSkuItem[];
  store?: StoreItem;
}

export interface PublicTimeSlot {
  start?: string;
  end?: string;
  date?: string;
  time?: string;
  available: boolean;
  studioId?: string;
  studioName?: string;
}
