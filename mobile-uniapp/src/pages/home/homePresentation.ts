import type { HomeBanner, HomeCategory, HomeMenuItem } from '@/types/home';
import { pickReferenceImage, referenceAssets } from '@/utils/referenceAssets';

export interface HomeServiceEntry extends HomeMenuItem {
  iconType: string;
}

export const fallbackMenus: HomeMenuItem[] = [
  { menuItemId: 'appointment', label: '预约时间', linkType: 'STORE' },
  { menuItemId: 'orders', label: '我的订单', linkType: 'ORDER' },
  { menuItemId: 'notice', label: '拍摄须知', linkType: 'NOTICE' },
  { menuItemId: 'stores', label: '门店地址', linkType: 'STORE' },
  { menuItemId: 'service', label: '联系客服', linkType: 'WECHAT_SERVICE' },
  { menuItemId: 'samples', label: '样片首页', linkType: 'SAMPLES' },
];

export const fallbackCategories: HomeCategory[] = [
  { categoryId: 'fallback-portrait', name: '形象照', imageUrl: referenceAssets.categoryPortraits[0], linkType: 'STORE' },
  { categoryId: 'fallback-family', name: '亲子照', imageUrl: referenceAssets.categoryPortraits[1], linkType: 'STORE' },
  { categoryId: 'fallback-id', name: '证件照', imageUrl: referenceAssets.categoryPortraits[2], linkType: 'STORE' },
  { categoryId: 'fallback-couple', name: '情侣照', imageUrl: referenceAssets.categoryPortraits[3], linkType: 'STORE' },
];

const menuItemIconMap: Record<string, string> = {
  appointment: 'calendar',
  orders: 'compose',
  notice: 'camera',
  stores: 'map-pin',
  service: 'phone',
  samples: 'images',
  '预约时间': 'calendar',
  '选择门店': 'calendar',
  '我的订单': 'compose',
  '拍摄须知': 'camera',
  '预约须知': 'camera',
  '门店地址': 'map-pin',
  '联系客服': 'phone',
  '样片首页': 'images',
};

export function buildHeroSlides(banners: HomeBanner[]) {
  if (banners.length) {
    return banners.map((banner, index) => ({
      ...banner,
      imageUrl: banner.imageUrl || pickReferenceImage(referenceAssets.homeHeroSlides, index),
    }));
  }
  return referenceAssets.homeHeroSlides.map((imageUrl, index) => ({
    bannerId: `reference-hero-${index}`,
    imageUrl,
    title: index === 0 ? '记录每个重要时刻' : '预约专业影像服务',
    linkType: 'STORE',
  }));
}

export function buildDisplayedMenuItems(menuItems: HomeMenuItem[]) {
  return (menuItems.length ? menuItems : fallbackMenus).slice(0, 6);
}

export function buildDisplayedCategories(categories: HomeCategory[]) {
  return categories.length ? categories : fallbackCategories;
}

export function resolveMenuIcon(item: HomeMenuItem) {
  return (
    menuItemIconMap[item.menuItemId] ||
    menuItemIconMap[item.label] ||
    ({
      STORE: 'map-pin',
      ORDER: 'compose',
      NOTICE: 'camera',
      WECHAT_SERVICE: 'phone',
      SAMPLES: 'images',
      EXTERNAL: 'paperplane',
      INTERNAL: 'compose',
      PRODUCT: 'shop',
    } as Record<string, string>)[item.linkType || ''] ||
    'paperplane'
  );
}

export function buildHomeServiceEntries(menuItems: HomeMenuItem[]): HomeServiceEntry[] {
  return menuItems.map((item) => ({
    ...item,
    iconType: resolveMenuIcon(item),
  }));
}

export function resolveActiveCategoryIndex(categories: HomeCategory[], selectedCategoryId: string) {
  const index = categories.findIndex((item) => item.categoryId === selectedCategoryId);
  return index >= 0 ? index : 0;
}

export function categoryImage(category: HomeCategory | undefined, index: number) {
  return category?.imageUrl || pickReferenceImage(referenceAssets.categoryPortraits, index);
}

export function buildSampleSlides(categories: HomeCategory[]) {
  return referenceAssets.sampleLibrary.map((sample, index) => ({
    ...sample,
    categoryId: categories[index]?.categoryId || '',
  }));
}
