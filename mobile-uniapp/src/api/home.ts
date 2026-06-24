import { request } from './request';
import type {
  BrandInfo,
  HomeBanner,
  HomeCategory,
  HomeData,
  ProductDetailData,
  ProductSkuItem,
  HomeMenuItem,
  ProductCategory,
  ProductItem,
  PublicTimeSlot,
  StoreItem,
  StoreListParams,
  StoreProductsData,
} from '@/types/home';

const publicRoot = '/api/public';
const publicApiFallbackEnabled = String(import.meta.env.PROD) !== 'true'
  && String(import.meta.env.VITE_PUBLIC_API_FALLBACK || 'true').toLowerCase() !== 'false';

function publicFallbackAllowed(error: unknown) {
  if (!publicApiFallbackEnabled) {
    throw error;
  }
}

const fallbackStoreItems: StoreItem[] = [
  {
    storeId: 'demo-store-main',
    name: '影约云旗舰店',
    city: '青岛',
    district: '市南区',
    address: '预约后显示详细到店地址',
    phone: '',
    businessHours: '10:00-20:00',
    status: 'OPEN',
    sort: 10,
  },
  {
    storeId: 'demo-store-portrait',
    name: '影约云形象照店',
    city: '青岛',
    district: '崂山区',
    address: '支持证件照、职业形象照与亲子拍摄',
    phone: '',
    businessHours: '09:30-19:30',
    status: 'OPEN',
    sort: 20,
  },
];

const fallbackProducts: ProductItem[] = [
  {
    productId: 'demo-product-portrait',
    storeId: 'demo-store-main',
    categoryId: 'portrait',
    categoryName: '形象照',
    name: '职业形象照基础套餐',
    subtitle: '适合头像、简历、资料页',
    price: 199,
    originalPrice: 299,
    tag: '热门',
    includeCount: 12,
    retouchCount: 2,
    shootDuration: '30分钟',
    applicableCount: '1人',
    deliveryCycle: '3-5天',
    status: 'ON_SALE',
    sort: 10,
  },
  {
    productId: 'demo-product-family',
    storeId: 'demo-store-main',
    categoryId: 'family',
    categoryName: '亲子照',
    name: '亲子纪念照轻量套餐',
    subtitle: '适合家庭记录和生日纪念',
    price: 399,
    originalPrice: 599,
    tag: '本季推荐',
    includeCount: 24,
    retouchCount: 6,
    shootDuration: '60分钟',
    applicableCount: '2-4人',
    deliveryCycle: '5-7天',
    status: 'ON_SALE',
    sort: 20,
  },
  {
    productId: 'demo-product-id',
    storeId: 'demo-store-portrait',
    categoryId: 'id',
    categoryName: '证件照',
    name: '标准证件照套餐',
    subtitle: '蓝底、白底、红底按需输出',
    price: 89,
    originalPrice: 129,
    tag: '快速交付',
    includeCount: 6,
    retouchCount: 1,
    shootDuration: '20分钟',
    applicableCount: '1人',
    deliveryCycle: '当天',
    status: 'ON_SALE',
    sort: 30,
  },
];

function fallbackCategories(): ProductCategory[] {
  return [
    { categoryId: 'portrait', name: '形象照', productCount: 1 },
    { categoryId: 'family', name: '亲子照', productCount: 1 },
    { categoryId: 'id', name: '证件照', productCount: 1 },
  ];
}

function fallbackStoreProducts(storeId: string): StoreProductsData {
  const store = fallbackStoreItems.find((item) => item.storeId === storeId) || fallbackStoreItems[0];
  const products = fallbackProducts.filter((item) => item.storeId === store.storeId || store.storeId === 'demo-store-main');
  return {
    store,
    categories: fallbackCategories(),
    products: products.length ? products : fallbackProducts,
  };
}

function fallbackProductDetail(productId: string): ProductDetailData {
  const product = fallbackProducts.find((item) => item.productId === productId) || fallbackProducts[0];
  const store = fallbackStoreItems.find((item) => item.storeId === product.storeId) || fallbackStoreItems[0];
  return {
    product,
    store,
    skus: [
      {
        skuId: `${product.productId}-standard`,
        productId: product.productId,
        skuName: '标准档',
        price: product.price,
        originalPrice: product.originalPrice,
        includedPhotos: product.includeCount,
        includedRetouch: product.retouchCount,
        durationMinutes: product.shootDuration?.includes('60') ? 60 : 30,
        stock: 12,
        status: 'ON_SALE',
      },
    ],
  };
}

function fallbackSlots(date: string): PublicTimeSlot[] {
  const slots = ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '18:00', '18:30'];
  return slots.map((time, index) => ({
    date,
    time,
    start: time,
    end: addMinutes(time, 30),
    available: index % 4 !== 2,
  }));
}

function addMinutes(time: string, minutes: number): string {
  const [hourRaw, minuteRaw] = time.split(':');
  const total = Number(hourRaw) * 60 + Number(minuteRaw) + minutes;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

interface HomePageBlock {
  id?: string | number;
  blockType?: string;
  sortOrder?: number;
  title?: string;
  configJson?: string;
}

const DEFAULT_MENU_ITEMS: HomeMenuItem[] = [
  {
    menuItemId: 'appointment',
    label: '预约时间',
    icon: '约',
    linkType: 'STORE',
    linkTarget: '/pages/store/list/index',
    sort: 10,
  },
  {
    menuItemId: 'orders',
    label: '我的订单',
    icon: '单',
    linkType: 'INTERNAL',
    linkTarget: '/pages/customer/orders/index',
    sort: 20,
  },
  {
    menuItemId: 'notice',
    label: '拍摄须知',
    icon: '须',
    linkType: 'NOTICE',
    linkTarget: '',
    sort: 30,
  },
  {
    menuItemId: 'stores',
    label: '门店地址',
    icon: '店',
    linkType: 'STORE',
    linkTarget: '/pages/store/list/index',
    sort: 40,
  },
  {
    menuItemId: 'service',
    label: '联系客服',
    icon: '客',
    linkType: 'WECHAT_SERVICE',
    linkTarget: '',
    sort: 50,
  },
  {
    menuItemId: 'samples',
    label: '样片首页',
    icon: '样',
    linkType: 'SAMPLES',
    linkTarget: '',
    sort: 60,
  },
];

function toRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? value as Record<string, any> : {};
}

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function toId(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

function sortBySort<T extends { sort?: number; sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const left = a.sort ?? a.sortOrder ?? 0;
    const right = b.sort ?? b.sortOrder ?? 0;
    return left - right;
  });
}

function parseConfigJson(raw?: string): Record<string, any> {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return toRecord(parsed);
  } catch {
    return {};
  }
}

function normalizeBrand(raw: unknown, brandCode = 'yingyue'): BrandInfo {
  const source = toRecord(raw);
  return {
    brandId: toId(source.brandId ?? source.id ?? brandCode),
    brandCode: String(source.brandCode ?? brandCode),
    name: String(source.name ?? '影约云'),
    logo: source.logo ?? source.logoUrl ?? '',
    logoUrl: source.logoUrl ?? source.logo ?? '',
    summary: source.summary ?? source.description ?? '',
    description: source.description ?? source.summary ?? '',
    themeColor: source.themeColor ?? '#2f80ed',
    shareTitle: source.shareTitle ?? '',
    shareImage: source.shareImage ?? source.shareImageUrl ?? '',
    shareImageUrl: source.shareImageUrl ?? source.shareImage ?? '',
    shareDescription: source.shareDescription ?? source.shareDesc ?? '',
    shareDesc: source.shareDesc ?? source.shareDescription ?? '',
  };
}

function normalizeBanner(raw: unknown, index = 0): HomeBanner {
  const source = toRecord(raw);
  return {
    bannerId: toId(source.bannerId ?? source.id ?? `banner-${index}`),
    imageUrl: String(source.imageUrl ?? source.image ?? source.url ?? ''),
    title: source.title ?? source.name ?? '',
    linkType: source.linkType,
    linkTarget: source.linkTarget ?? source.target ?? source.urlTarget ?? '',
    sort: toNumber(source.sort ?? source.sortOrder, index),
  };
}

function normalizeCategory(raw: unknown, index = 0): HomeCategory {
  const source = toRecord(raw);
  return {
    categoryId: toId(source.categoryId ?? source.id ?? `category-${index}`),
    name: String(source.name ?? source.title ?? '样片分类'),
    icon: source.icon ?? source.iconUrl ?? '',
    imageUrl: source.imageUrl ?? source.image ?? source.coverImage ?? '',
    linkType: source.linkType ?? 'SAMPLES',
    linkTarget: source.linkTarget ?? '',
    sort: toNumber(source.sort ?? source.sortOrder, index),
  };
}

function normalizeMenuItem(raw: unknown, index = 0): HomeMenuItem {
  const source = toRecord(raw);
  return {
    menuItemId: toId(source.menuItemId ?? source.id ?? source.key ?? `menu-${index}`),
    label: String(source.label ?? source.title ?? source.name ?? '服务入口'),
    icon: source.icon ?? '',
    linkType: source.linkType ?? source.type,
    linkTarget: source.linkTarget ?? source.url ?? source.target ?? '',
    sort: toNumber(source.sort ?? source.sortOrder, index),
  };
}

function mergeMenuItems(items: HomeMenuItem[]): HomeMenuItem[] {
  const merged = new Map<string, HomeMenuItem>();
  for (const item of DEFAULT_MENU_ITEMS) {
    merged.set(item.menuItemId, item);
  }
  for (const item of items) {
    const matchedDefault = DEFAULT_MENU_ITEMS.find((preset) => preset.label === item.label);
    merged.set(matchedDefault?.menuItemId ?? item.menuItemId, {
      ...(matchedDefault || {}),
      ...item,
      menuItemId: matchedDefault?.menuItemId ?? item.menuItemId,
    });
  }
  return sortBySort([...merged.values()]);
}

function extractBlockItems(config: Record<string, any>, keys: string[]): any[] {
  for (const key of keys) {
    if (Array.isArray(config[key])) {
      return config[key];
    }
  }
  if (Array.isArray(config)) {
    return config;
  }
  return [];
}

function normalizeHomeBlocks(blocks: HomePageBlock[], brandCode: string): Partial<HomeData> {
  const result: Partial<HomeData> = {};

  for (const block of blocks) {
    const blockType = String(block.blockType || '').toLowerCase();
    const config = parseConfigJson(block.configJson);
    if (blockType === 'carousel' || blockType === 'banner') {
      result.banners = extractBlockItems(config, ['banners', 'items', 'images'])
        .map((item, index) => normalizeBanner(item, index))
        .filter((item) => item.imageUrl);
    } else if (blockType === 'menu' || blockType === 'service_menu') {
      result.menuItems = extractBlockItems(config, ['menuItems', 'items', 'menus'])
        .map((item, index) => normalizeMenuItem(item, index));
    } else if (blockType === 'sample_category' || blockType === 'category' || blockType === 'cube') {
      result.categories = extractBlockItems(config, ['categories', 'items', 'samples'])
        .map((item, index) => normalizeCategory(item, index));
    } else if (blockType === 'richtext' || blockType === 'notice') {
      result.serviceNotice = String(config.serviceNotice ?? config.content ?? config.text ?? block.title ?? '');
    } else if (blockType === 'brand') {
      result.brand = normalizeBrand(config, brandCode);
    }
  }

  return result;
}

function normalizeHomeData(raw: unknown, brandCode: string): HomeData {
  const source = raw as HomeData | HomePageBlock[];
  const blockData = Array.isArray(source) ? normalizeHomeBlocks(source, brandCode) : {};
  const record = toRecord(source);

  return {
    brand: normalizeBrand(record.brand ?? blockData.brand, brandCode),
    banners: sortBySort(toArray(record.banners ?? blockData.banners)
      .map((item, index) => normalizeBanner(item, index))
      .filter((item) => item.imageUrl)),
    categories: sortBySort(toArray(record.categories ?? blockData.categories)
      .map((item, index) => normalizeCategory(item, index))),
    menuItems: mergeMenuItems(toArray(record.menuItems ?? blockData.menuItems)
      .map((item, index) => normalizeMenuItem(item, index))),
    serviceNotice: String(record.serviceNotice ?? blockData.serviceNotice ?? ''),
  };
}

function normalizeStore(raw: unknown): StoreItem {
  const source = toRecord(raw);
  const id = toId(source.storeId ?? source.id);
  return {
    id: source.id,
    storeId: id,
    name: String(source.name ?? '门店'),
    province: source.province ?? '',
    city: source.city ?? '',
    district: source.district ?? '',
    address: String(source.address ?? ''),
    phone: source.phone ?? '',
    contactWechat: source.contactWechat ?? source.contact_wechat ?? '',
    longitude: toOptionalNumber(source.longitude),
    latitude: toOptionalNumber(source.latitude),
    businessHours: source.businessHours ?? '',
    status: source.status ?? 'CLOSED',
    storeImage: source.storeImage ?? source.imageUrl ?? '',
    imageUrl: source.imageUrl ?? source.storeImage ?? '',
    distance: toOptionalNumber(source.distance),
    sort: toOptionalNumber(source.sort ?? source.sortOrder),
    sortOrder: toOptionalNumber(source.sortOrder ?? source.sort),
    hidden: Boolean(source.hidden),
  };
}

function normalizeProductCategory(raw: unknown, index = 0): ProductCategory {
  const source = toRecord(raw);
  return {
    id: source.id,
    categoryId: toId(source.categoryId ?? source.id ?? `category-${index}`),
    name: String(source.name ?? '分类'),
    icon: source.icon ?? source.iconUrl ?? '',
    iconUrl: source.iconUrl ?? source.icon ?? '',
    productCount: toOptionalNumber(source.productCount),
  };
}

function normalizeProduct(raw: unknown, index = 0): ProductItem {
  const source = toRecord(raw);
  const id = toId(source.productId ?? source.id);
  const includedPhotos = source.includeCount ?? source.includedPhotos;
  const includedRetouch = source.retouchCount ?? source.includedRetouch;
  return {
    id: source.id,
    productId: id || `product-${index}`,
    storeId: toId(source.storeId),
    categoryId: source.categoryId === undefined || source.categoryId === null
      ? undefined
      : String(source.categoryId),
    categoryName: source.categoryName ?? '',
    name: String(source.name ?? source.title ?? '套餐'),
    title: source.title ?? source.name ?? '',
    subtitle: source.subtitle ?? '',
    coverImage: source.coverImage ?? source.imageUrl ?? '',
    imageUrl: source.imageUrl ?? source.coverImage ?? '',
    price: toNumber(source.price),
    originalPrice: toOptionalNumber(source.originalPrice),
    priceRange: source.priceRange ?? '',
    tag: source.tag ?? '',
    includeCount: toOptionalNumber(includedPhotos),
    retouchCount: toOptionalNumber(includedRetouch),
    shootDuration: source.shootDuration ?? '',
    applicableCount: source.applicableCount ?? '',
    makeupService: source.makeupService ?? '',
    deliveryCycle: source.deliveryCycle ?? '',
    description: source.description ?? '',
    refundRule: source.refundRule ?? '',
    rescheduleRule: source.rescheduleRule ?? '',
    status: source.status ?? '',
    sort: toOptionalNumber(source.sort ?? source.sortOrder),
    sortOrder: toOptionalNumber(source.sortOrder ?? source.sort),
  };
}

function flattenProducts(rawProducts: unknown): unknown[] {
  if (Array.isArray(rawProducts)) {
    return rawProducts;
  }
  const record = toRecord(rawProducts);
  return Object.values(record).flatMap((value) => Array.isArray(value) ? value : []);
}

function normalizeSku(raw: unknown, index = 0): ProductSkuItem {
  const source = toRecord(raw);
  return {
    id: source.id,
    skuId: toId(source.skuId ?? source.id ?? `sku-${index}`),
    productId: toId(source.productId),
    skuName: String(source.skuName ?? source.name ?? '套餐规格'),
    price: toNumber(source.price),
    originalPrice: toOptionalNumber(source.originalPrice),
    includedPhotos: toOptionalNumber(source.includedPhotos ?? source.includeCount),
    includedRetouch: toOptionalNumber(source.includedRetouch ?? source.retouchCount),
    durationMinutes: toOptionalNumber(source.durationMinutes),
    extraPhotoPrice: toOptionalNumber(source.extraPhotoPrice),
    stock: toOptionalNumber(source.stock),
    status: source.status ?? '',
  };
}

function normalizeStoreProductsData(raw: unknown): StoreProductsData {
  const source = toRecord(raw);
  return {
    store: normalizeStore(source.store),
    categories: toArray(source.categories).map((item, index) => normalizeProductCategory(item, index)),
    products: sortBySort(flattenProducts(source.products).map((item, index) => normalizeProduct(item, index))),
  };
}

function normalizeProductDetail(raw: unknown): ProductDetailData {
  const source = toRecord(raw);
  const product = normalizeProduct(source.product ?? source);
  const skus = toArray(source.skus).map((item, index) => normalizeSku(item, index));
  return {
    product,
    skus,
    store: source.store ? normalizeStore(source.store) : undefined,
  };
}

export function getBrandInfo(brandCode: string) {
  return request<unknown>({
    url: `${publicRoot}/brand/${encodeURIComponent(brandCode)}`,
    token: false,
    silent: true,
  }).then((data) => normalizeBrand(data, brandCode));
}

export function getHomeData(brandCode: string) {
  return Promise.all([
    getBrandInfo(brandCode).catch(() => normalizeBrand(undefined, brandCode)),
    request<unknown>({
      url: `${publicRoot}/pages/home`,
      data: { brandCode },
      token: false,
      silent: true,
    }).catch(() => []),
  ]).then(([brand, pageData]) => ({
    ...normalizeHomeData(pageData, brandCode),
    brand,
  }));
}

export function getStoreList(params: StoreListParams = {}) {
  const query: string[] = [];
  if (params.brandCode) {
    query.push(`brandCode=${encodeURIComponent(params.brandCode)}`);
  }
  if (params.lng !== undefined) {
    query.push(`lng=${params.lng}`);
  }
  if (params.lat !== undefined) {
    query.push(`lat=${params.lat}`);
  }
  if (params.keyword) {
    query.push(`keyword=${encodeURIComponent(params.keyword)}`);
  }
  const qs = query.length ? `?${query.join('&')}` : '';
  return request<unknown[]>({
    url: `${publicRoot}/stores${qs}`,
    token: false,
    silent: true,
  }).then((data) => toArray(data).map(normalizeStore))
    .catch((error) => {
      publicFallbackAllowed(error);
      return fallbackStoreItems;
    });
}

export function getStoreProducts(storeId: string) {
  return request<unknown>({
    url: `${publicRoot}/stores/${encodeURIComponent(storeId)}/products`,
    token: false,
    silent: true,
  }).then(normalizeStoreProductsData)
    .catch((error) => {
      publicFallbackAllowed(error);
      return fallbackStoreProducts(storeId);
    });
}

export function getProductDetail(productId: string) {
  return request<unknown>({
    url: `${publicRoot}/products/${encodeURIComponent(productId)}`,
    token: false,
    silent: true,
  }).then(normalizeProductDetail)
    .catch((error) => {
      publicFallbackAllowed(error);
      return fallbackProductDetail(productId);
    });
}

export function getStoreSlots(storeId: string, date: string, productId?: string) {
  const query = [
    `date=${encodeURIComponent(date)}`,
    productId ? `productId=${encodeURIComponent(productId)}` : '',
  ].filter(Boolean).join('&');
  return request<PublicTimeSlot[]>({
    url: `${publicRoot}/stores/${encodeURIComponent(storeId)}/slots?${query}`,
    token: false,
    silent: true,
  }).catch((error) => {
    publicFallbackAllowed(error);
    return fallbackSlots(date);
  });
}
