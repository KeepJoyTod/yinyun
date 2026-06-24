<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useStoreList } from '@/composables/useStoreList';
import { pickReferenceImage, referenceAssets } from '@/utils/referenceAssets';

const brandCode = ref(import.meta.env.VITE_BRAND_CODE || 'yingyue');
const {
  stores,
  loading,
  locating,
  error,
  keyword,
  locationEnabled,
  locationError,
  formatDistance,
  statusLabel,
  isStoreOpen,
  navigateToCall,
  navigateToMap,
  requestLocation,
  loadStores,
  searchStores,
  searchStoresDebounced,
} = useStoreList();

onShow(() => {
  loadStores({ brandCode: brandCode.value });
});

function onSearchInput(event: any) {
  const nextKeyword = String(event?.detail?.value ?? '');
  keyword.value = nextKeyword;
  searchStoresDebounced(brandCode.value, nextKeyword);
}

function onSearchConfirm() {
  searchStores(brandCode.value);
}

function onSearchClear() {
  keyword.value = '';
  searchStores(brandCode.value);
}

function onLocateTap() {
  requestLocation(brandCode.value);
}

function retryStores() {
  loadStores({ brandCode: brandCode.value });
}

function goProducts(storeId: string) {
  uni.navigateTo({
    url: `/pages/store/products/index?storeId=${encodeURIComponent(storeId)}`,
  });
}

function storeName(item: { name?: string; storeId?: string }) {
  return item.name || `门店 ${item.storeId || ''}`.trim();
}

function storeAddress(item: { province?: string; city?: string; district?: string; address?: string }) {
  const segments = [item.province, item.city, item.district, item.address]
    .filter(Boolean)
    .join('');
  return segments || '门店地址待完善';
}

function storeCover(item: { storeImage?: string; imageUrl?: string }, index: number) {
  return item.storeImage || item.imageUrl || pickReferenceImage(referenceAssets.homeHeroSlides, index);
}
</script>

<template>
  <view class="replica-page">
    <view class="page-content stack">
      <view class="store-photo-hero">
        <image class="store-photo-hero-image" :src="referenceAssets.homeHeroSlides[1]" mode="aspectFill" />
        <view class="store-photo-hero-copy">
          <text class="store-photo-title">选择门店</text>
          <text class="store-photo-subtitle">先确认地址和服务，再进入商品预约。</text>
        </view>
      </view>

      <view class="surface-card store-search-card">
        <view class="store-search-row">
          <view class="store-search-input-wrap">
            <text class="store-search-icon">搜</text>
            <input
              class="store-search-input"
              :value="keyword"
              placeholder="搜索门店名称、地址"
              confirm-type="search"
              @input="onSearchInput"
              @confirm="onSearchConfirm"
            />
          </view>
          <text v-if="keyword" class="store-search-clear" @tap="onSearchClear">清除</text>
        </view>
        <view class="store-location-row">
          <text class="store-location-copy">
            {{ locationEnabled ? '已按距离由近到远排序' : locationError || '未授权定位时按门店推荐顺序展示' }}
          </text>
          <button class="store-location-button" :loading="locating" :disabled="locating" @tap="onLocateTap">
            使用当前位置
          </button>
        </view>
      </view>

      <template v-if="loading">
        <view v-for="n in 3" :key="n" class="skeleton-card">
          <view class="skeleton-line" style="width: 50%" />
          <view class="skeleton-line" style="width: 70%" />
          <view class="skeleton-line" style="width: 40%" />
        </view>
      </template>

      <view v-else-if="error" class="surface-card store-error-card">
        <text class="state-title">加载失败</text>
        <text class="state-copy">{{ error }}</text>
        <button class="button-secondary" style="margin-top: 20rpx" @tap="retryStores">重新加载</button>
      </view>

      <view v-else-if="stores.length === 0" class="surface-card store-empty-card">
        <view class="empty-visual"><view class="empty-visual-inner" /></view>
        <text class="state-title">暂无门店</text>
        <text class="state-copy">当前品牌暂无开放门店，请稍后再来查看</text>
      </view>

      <template v-else>
        <view
          v-for="(item, index) in stores"
          :key="item.storeId"
          class="surface-card store-card"
          @tap="goProducts(item.storeId)"
        >
          <view class="store-card-cover">
            <image class="store-card-image" :src="storeCover(item, index)" mode="aspectFill" />
            <view class="store-card-status" :class="isStoreOpen(item.status) ? 'store-status-open' : 'store-status-closed'">
              {{ statusLabel(item.status) }}
            </view>
          </view>

          <view class="store-card-meta">
            <view class="store-card-head">
              <text class="store-card-name">{{ storeName(item) }}</text>
              <text v-if="item.distance" class="store-card-distance">{{ formatDistance(item.distance) }}</text>
            </view>
            <text class="store-card-address">{{ storeAddress(item) }}</text>
            <view v-if="item.businessHours" class="store-card-hours">
              <text class="store-card-hours-text">营业时间：{{ item.businessHours }}</text>
            </view>
            <view class="store-card-actions">
              <button class="store-action-btn store-action-call" @tap.stop="navigateToCall(item.phone)">电话咨询</button>
              <button class="store-action-btn store-action-nav" @tap.stop="navigateToMap(item)">导航到店</button>
              <button class="store-action-btn store-action-view" @tap.stop="goProducts(item.storeId)">查看商品</button>
            </view>
          </view>
        </view>
      </template>

      <view class="replica-tab-safe-area" />
    </view>
  </view>
</template>

<style scoped>
.store-photo-hero {
  position: relative;
  overflow: hidden;
  height: 260rpx;
  border-radius: 24rpx;
  background: #e4efff;
  box-shadow: 0 18rpx 48rpx rgba(31, 45, 49, 0.08);
}

.store-photo-hero-image {
  display: block;
  width: 100%;
  height: 100%;
}

.store-photo-hero-copy {
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  bottom: 22rpx;
  box-sizing: border-box;
  padding: 18rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 24rpx rgba(31, 45, 49, 0.08);
}

.store-photo-title,
.store-photo-subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-photo-title {
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 840;
  line-height: 1.18;
}

.store-photo-subtitle {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.35;
  white-space: nowrap;
}

.store-search-card { padding: 16rpx 20rpx; }
.store-search-row { display: flex; align-items: center; gap: 14rpx; }
.store-search-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 10rpx;
  height: 72rpx; padding: 0 18rpx;
  border: 1px solid #cfe0f5; border-radius: 14rpx; background: #f8fbff;
}
.store-search-input-wrap:focus-within {
  border-color: #2563eb; box-shadow: 0 0 0 4rpx rgba(12, 92, 82, 0.08);
}
.store-search-icon { color: #8492a6; font-size: 22rpx; font-weight: 600; }
.store-search-input { flex: 1; font-size: 26rpx; color: #0f172a; }
.store-search-clear { color: #2563eb; font-size: 24rpx; font-weight: 600; white-space: nowrap; }
.store-location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 14rpx;
}
.store-location-copy {
  flex: 1;
  min-width: 0;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.45;
}
.store-location-button {
  width: auto;
  min-width: 172rpx;
  min-height: 56rpx;
  margin: 0;
  padding: 0 18rpx;
  border: 0;
  border-radius: 999rpx;
  background: #eaf3ff;
  color: #1d4ed8;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 56rpx;
}
.store-location-button::after { border: 0; }
.store-location-button:active { transform: scale(0.98); opacity: 0.82; }
.store-error-card, .store-empty-card {
  padding: 48rpx 30rpx; text-align: center;
  display: flex; flex-direction: column; align-items: center;
}
.store-card { overflow: hidden; padding: 0; }
.store-card-cover { position: relative; height: 260rpx; overflow: hidden; background: linear-gradient(180deg, #eef6ff, #e5eefb); }
.store-card-image { width: 100%; height: 100%; }
.store-card-status {
  position: absolute; top: 16rpx; right: 16rpx;
  min-height: 40rpx; padding: 0 16rpx; border-radius: 999rpx;
  font-size: 21rpx; font-weight: 700; line-height: 40rpx; color: #fff;
}
.store-status-open { background: rgba(12, 92, 82, 0.88); }
.store-status-closed { background: rgba(150, 120, 80, 0.85); }
.store-card-meta { padding: 22rpx 24rpx 20rpx; }
.store-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.store-card-name { flex: 1; font-size: 30rpx; font-weight: 750; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.store-card-distance { flex: none; color: #2563eb; font-size: 22rpx; font-weight: 700; }
.store-card-address { margin-top: 10rpx; font-size: 23rpx; color: #64748b; line-height: 1.5; }
.store-card-hours { margin-top: 10rpx; padding: 10rpx 14rpx; border-radius: 10rpx; background: #f3f8ff; }
.store-card-hours-text { font-size: 21rpx; color: #52677f; }
.store-card-actions { display: flex; gap: 12rpx; margin-top: 18rpx; }
.store-action-btn {
  flex: 1; width: auto; min-height: 64rpx; margin: 0; padding: 0 10rpx;
  border: 1px solid #cfe0f5; border-radius: 12rpx; background: #fff;
  color: #0f172a; font-size: 22rpx; font-weight: 650; line-height: 64rpx;
  text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.store-action-btn::after { border: 0; }
.store-action-btn:active { transform: scale(0.98); opacity: 0.8; }
.store-action-call { color: #2563eb; border-color: rgba(12, 92, 82, 0.25); background: #eaf3ff; }
.store-action-nav { color: #1d4ed8; border-color: rgba(12, 92, 82, 0.25); background: #eaf3ff; }
.store-action-view { color: #fff; border-color: transparent; background: #2563eb; }
.store-action-view:active { background: #0a4d44; }
</style>
