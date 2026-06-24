<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { useHome } from '@/composables/useHome';
import {
  buildDisplayedCategories,
  buildDisplayedMenuItems,
  buildHeroSlides,
  buildHomeServiceEntries,
  buildSampleSlides,
  categoryImage as resolveCategoryImage,
  resolveActiveCategoryIndex,
} from './homePresentation';
import { goStoreList, navigateByLink } from './homeNavigation';

const brandCode = ref(import.meta.env.VITE_BRAND_CODE || 'yingyue');
const selectedCategoryId = ref('');

const {
  brandName,
  brandLogo,
  brandSummary,
  banners,
  categories,
  menuItems,
  serviceNotice,
  loading,
  error,
  loadHome,
} = useHome();
const heroSlides = computed(() => buildHeroSlides(banners.value));
const displayedMenuItems = computed(() => buildDisplayedMenuItems(menuItems.value));
const displayedCategories = computed(() => buildDisplayedCategories(categories.value));
const homeServiceEntries = computed(() => buildHomeServiceEntries(displayedMenuItems.value));
const activeCategoryIndex = computed(() => resolveActiveCategoryIndex(
  displayedCategories.value,
  selectedCategoryId.value,
));
const activeCategory = computed(() => displayedCategories.value[activeCategoryIndex.value]);
const activeCategoryImage = computed(() => resolveCategoryImage(activeCategory.value, activeCategoryIndex.value));
const sampleSlides = computed(() => buildSampleSlides(displayedCategories.value));

onShow(() => {
  loadHome(brandCode.value);
});

function onBannerTap(banner: { linkType?: string; linkTarget?: string; title?: string }) {
  navigateByLink({
    linkType: banner.linkType,
    linkTarget: banner.linkTarget,
    title: banner.title,
  });
}

function onCategoryTap(cat: { linkType?: string; linkTarget?: string; name: string }) {
  navigateByLink({
    linkType: cat.linkType,
    linkTarget: cat.linkTarget,
    title: cat.name,
  });
}

function onMenuItemTap(item: { linkType?: string; linkTarget?: string; label?: string }) {
  navigateByLink({
    linkType: item.linkType,
    linkTarget: item.linkTarget,
    title: item.label,
    hasCategories: categories.value.length > 0,
  });
}

function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId;
}

function retryHome() {
  loadHome(brandCode.value);
}
</script>

<template>
  <view class="replica-page home-photo-page">
    <view class="page-content home-photo-content">
      <view class="home-photo-hero">
        <swiper
          class="home-hero-swiper"
          :indicator-dots="heroSlides.length > 1"
          indicator-color="rgba(255,255,255,0.42)"
          indicator-active-color="#ffffff"
          :autoplay="true"
          :interval="4200"
          :circular="true"
        >
          <swiper-item v-for="banner in heroSlides" :key="banner.bannerId" @tap="onBannerTap(banner)">
            <image class="home-hero-image" :src="banner.imageUrl" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="home-hero-brand">
          <view class="brand-lockup">
            <image v-if="brandLogo" class="brand-logo" :src="brandLogo" mode="aspectFit" />
            <view v-else class="brand-mark">影</view>
            <text class="brand-name">{{ brandName }}</text>
          </view>
          <text class="home-hero-chip">影楼预约</text>
        </view>
      </view>

      <view class="surface-card home-booking-panel">
        <view class="home-booking-head">
          <view class="home-booking-copy">
            <text class="home-booking-title">记录每个重要时刻</text>
            <text class="home-booking-subtitle">{{ brandSummary }}</text>
          </view>
          <button class="home-booking-primary" @tap="goStoreList">立即预约</button>
        </view>
        <view class="home-service-section">
          <view class="home-service-grid">
            <button
              v-for="item in homeServiceEntries"
              :key="item.menuItemId"
              class="home-service-button"
              @tap="onMenuItemTap(item)"
            >
              <UniIcons class="home-service-icon" :type="item.iconType" color="#606773" size="68rpx" />
              <text class="home-service-title">{{ item.label }}</text>
            </button>
          </view>
        </view>
      </view>

      <template v-if="loading">
        <view class="surface-card skeleton-card">
          <view class="skeleton-line" style="width: 60%" />
          <view class="skeleton-line" style="width: 42%" />
          <view class="skeleton-block" />
        </view>
      </template>

      <view v-else-if="error" class="home-inline-warning">
        <view class="home-inline-warning-copy">
          <text class="home-inline-warning-title">首页内容加载失败</text>
          <text class="home-inline-warning-text">{{ error }}。已先展示授权素材，可稍后重试。</text>
        </view>
        <button class="home-inline-warning-action" @tap="retryHome">重试</button>
      </view>

      <view class="home-mosaic-section">
        <view class="home-section-head">
          <text class="section-title">热门样片</text>
          <text class="link-text" @tap="goStoreList">去预约</text>
        </view>
        <swiper
          class="home-sample-swiper"
          indicator-color="rgba(255,255,255,0.46)"
          indicator-active-color="#ffffff"
          :indicator-dots="sampleSlides.length > 1"
          :autoplay="true"
          :interval="3200"
          :duration="420"
          :circular="true"
        >
          <swiper-item
            v-for="sample in sampleSlides"
            :key="sample.id"
            class="home-sample-slide"
            @tap="sample.categoryId ? selectCategory(sample.categoryId) : goStoreList()"
          >
            <image class="home-sample-image" :src="sample.imageUrl" mode="aspectFill" />
            <view class="home-sample-shade" />
            <view class="home-sample-copy">
              <text class="home-sample-title">{{ sample.title }}</text>
              <text class="home-sample-subtitle">{{ sample.subtitle }}</text>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="home-season-section">
        <view class="home-section-head">
          <text class="section-title">本季推荐</text>
          <text class="home-section-note">照片展示优先，套餐以下单页为准</text>
        </view>
        <scroll-view scroll-x class="home-hot-scroll">
          <view class="home-hot-list">
            <view v-for="sample in sampleSlides" :key="sample.id" class="home-hot-card" @tap="goStoreList">
              <image class="home-hot-image" :src="sample.imageUrl" mode="aspectFill" />
              <view class="home-hot-copy">
                <text class="home-hot-title">{{ sample.title }}</text>
                <text class="home-hot-subtitle">选门店后查看可预约档期</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="surface-card home-category-panel">
        <view class="home-section-head">
          <text class="section-title">样片分类</text>
          <text class="home-section-note">按风格查看照片</text>
        </view>
        <scroll-view scroll-x class="home-category-tabs-scroll">
          <view class="home-category-tabs">
            <button
              v-for="cat in displayedCategories"
              :key="cat.categoryId"
              class="home-category-tab"
              :class="{ 'home-category-tab-active': activeCategory?.categoryId === cat.categoryId }"
              @tap="selectCategory(cat.categoryId)"
            >
              {{ cat.name }}
            </button>
          </view>
        </scroll-view>
        <view v-if="activeCategory" class="home-category-feature" @tap="onCategoryTap(activeCategory)">
          <image class="home-category-feature-image" :src="activeCategoryImage" mode="aspectFill" />
          <view class="home-category-feature-copy">
            <text class="home-category-feature-name">{{ activeCategory.name }}</text>
            <text class="home-category-feature-subtitle">浏览风格后选择门店与档期</text>
          </view>
        </view>
      </view>

      <view v-if="serviceNotice && !loading" class="surface-card home-notice-card">
        <view class="section-title">预约须知</view>
        <text class="home-notice-text">{{ serviceNotice }}</text>
      </view>

      <view class="replica-tab-safe-area" />
    </view>
  </view>
</template>

<style scoped src="./home-page.scss"></style>
