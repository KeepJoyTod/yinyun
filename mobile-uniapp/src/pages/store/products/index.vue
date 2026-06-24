<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useStoreProducts } from '@/composables/useStoreProducts';
import { pickReferenceImage, referenceAssets } from '@/utils/referenceAssets';

const storeId = ref('');
const {
  store,
  categories,
  filteredProducts,
  loading,
  error,
  activeCategoryId,
  filterByCategory,
  formatPrice,
  formatOriginalPrice,
  statusLabel,
  loadStoreProducts,
} = useStoreProducts();

onLoad((query) => {
  storeId.value = String(query?.storeId || '');
  if (storeId.value) {
    loadStoreProducts(storeId.value);
  }
});

function onCategoryTap(categoryId: string) {
  filterByCategory(categoryId);
}

function goProductDetail(productId: string) {
  uni.navigateTo({
    url: `/pages/product/detail/index?productId=${encodeURIComponent(productId)}`,
  });
}

function productCover(item: { coverImage?: string; imageUrl?: string }, index: number) {
  return item.coverImage || item.imageUrl || pickReferenceImage(referenceAssets.categoryPortraits, index);
}
</script>

<template>
  <view class="replica-page">
    <view class="page-content stack">
      <view v-if="store" class="product-store-hero">
        <image class="product-store-hero-image" :src="store.storeImage || store.imageUrl || referenceAssets.homeHeroSlides[0]" mode="aspectFill" />
        <view class="product-store-hero-copy">
          <view class="product-store-row">
            <view class="product-store-copy">
              <text class="product-store-name">{{ store.name }}</text>
              <text class="product-store-addr">{{ store.address }}</text>
            </view>
            <text class="product-store-status" :class="store.status === 'OPEN' ? 'product-status-open' : 'product-status-closed'">
              {{ statusLabel(store.status) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <template v-if="loading">
        <view v-for="n in 4" :key="n" class="skeleton-card">
          <view class="skeleton-line" style="width: 40%" />
          <view class="skeleton-line" style="width: 70%" />
          <view class="skeleton-block" style="height: 200rpx" />
        </view>
      </template>

      <!-- 错误 -->
      <view v-else-if="error" class="surface-card product-error-card">
        <text class="state-title">加载失败</text>
        <text class="state-copy">{{ error }}</text>
        <button
          v-if="storeId"
          class="button-secondary"
          style="margin-top: 20rpx"
          @tap="loadStoreProducts(storeId)"
        >
          重新加载
        </button>
      </view>

      <!-- 空态 -->
      <view v-else-if="filteredProducts.length === 0 && !loading" class="surface-card product-empty-card">
        <view class="empty-visual">
          <view class="empty-visual-inner" />
        </view>
        <text class="state-title">暂无商品</text>
        <text class="state-copy">该门店暂无可预约商品</text>
      </view>

      <template v-else>
        <scroll-view v-if="categories.length > 0" scroll-x class="product-tabs-scroll">
          <view class="product-tabs">
            <button
              class="product-tab"
              :class="{ 'product-tab-active': !activeCategoryId }"
              @tap="onCategoryTap('')"
            >
              全部
            </button>
            <button
              v-for="cat in categories"
              :key="cat.categoryId"
              class="product-tab"
              :class="{ 'product-tab-active': activeCategoryId === cat.categoryId }"
              @tap="onCategoryTap(cat.categoryId)"
            >
              {{ cat.name }}
            </button>
          </view>
        </scroll-view>

        <view class="product-browser">
          <view class="product-list">
            <view
              v-for="(item, index) in filteredProducts"
              :key="item.productId"
              class="surface-card product-card"
              @tap="goProductDetail(item.productId)"
            >
              <view class="product-card-body">
                <view class="product-card-cover">
                  <image
                    class="product-card-image"
                    :src="productCover(item, index)"
                    mode="aspectFill"
                  />
                  <view v-if="item.tag" class="product-card-tag">{{ item.tag }}</view>
                </view>

                <view class="product-card-info">
                  <text class="product-card-name">{{ item.name }}</text>
                  <text v-if="item.subtitle" class="product-card-subtitle">{{ item.subtitle }}</text>

                  <view class="product-card-specs">
                    <text v-if="item.includeCount" class="product-card-spec">{{ item.includeCount }}张底片</text>
                    <text v-if="item.retouchCount" class="product-card-spec">精修 {{ item.retouchCount }} 张</text>
                    <text v-if="item.shootDuration" class="product-card-spec">{{ item.shootDuration }}</text>
                  </view>

                  <view class="product-card-price-row">
                    <text class="product-card-price">{{ formatPrice(item.price) }}</text>
                    <text v-if="item.originalPrice" class="product-card-original">{{ formatOriginalPrice(item.originalPrice) }}</text>
                  </view>

                  <view v-if="item.applicableCount || item.deliveryCycle" class="product-card-meta">
                    <text class="product-card-meta-text">
                      {{ [item.applicableCount ? `适用 ${item.applicableCount}` : '', item.deliveryCycle ? `交付 ${item.deliveryCycle}` : ''].filter(Boolean).join(' · ') }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>

      <view class="replica-tab-safe-area" />
    </view>
  </view>
</template>

<style scoped>
.product-store-hero {
  position: relative;
  overflow: hidden;
  height: 300rpx;
  border-radius: 24rpx;
  background: #e4efff;
  box-shadow: 0 18rpx 48rpx rgba(31, 45, 49, 0.08);
}

.product-store-hero-image {
  display: block;
  width: 100%;
  height: 100%;
}

.product-store-hero-copy {
  position: absolute;
  left: 20rpx;
  right: 20rpx;
  bottom: 20rpx;
  box-sizing: border-box;
  padding: 18rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 24rpx rgba(31, 45, 49, 0.08);
}

.product-store-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.product-store-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
  min-width: 0;
}

.product-store-name {
  font-size: 28rpx;
  font-weight: 750;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-store-addr {
  font-size: 22rpx;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-store-status {
  flex: none;
  min-height: 38rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  font-size: 21rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.product-status-open {
  background: #eaf3ff;
  color: #2563eb;
}

.product-status-closed {
  background: #fff4e8;
  color: #8a5b2d;
}

.product-error-card,
.product-empty-card {
  padding: 48rpx 30rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-browser {
  display: block;
}

.product-tabs-scroll {
  margin: 0 -30rpx 2rpx;
  padding: 0 30rpx;
  white-space: nowrap;
}

.product-tabs {
  display: inline-flex;
  gap: 12rpx;
  padding: 2rpx 30rpx 6rpx;
}

.product-tab {
  width: auto;
  min-height: 58rpx;
  margin: 0;
  padding: 0 24rpx;
  border: 1px solid rgba(207, 217, 215, 0.78);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.76);
  color: #52677f;
  font-size: 24rpx;
  font-weight: 760;
  line-height: 58rpx;
  white-space: nowrap;
}

.product-tab::after {
  border: 0;
}

.product-tab:active {
  transform: scale(0.98);
}

.product-tab-active {
  border-color: rgba(12, 92, 82, 0.2);
  background: #2563eb;
  color: #fff;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-card {
  overflow: hidden;
  padding: 0;
}

.product-card-body { display: flex; flex-direction: column; gap: 16rpx; padding: 18rpx; }

.product-card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1.36;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f2ff, #dbeafe);
}

.product-card-image {
  width: 100%;
  height: 100%;
}

.product-card-tag {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  min-height: 34rpx;
  padding: 0 12rpx;
  border-radius: 999rpx;
  background: rgba(12, 92, 82, 0.85);
  color: #fff;
  font-size: 19rpx;
  font-weight: 700;
  line-height: 34rpx;
  white-space: nowrap;
}

.product-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-card-name {
  font-size: 28rpx;
  font-weight: 750;
  color: #0f172a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card-subtitle {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.product-card-spec {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f3f8ff;
  color: #52677f;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
}

.product-card-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 4rpx;
}

.product-card-price {
  font-size: 32rpx;
  font-weight: 800;
  color: #c04832;
}

.product-card-original {
  font-size: 22rpx;
  color: #a0a8ae;
  text-decoration: line-through;
}

.product-card-meta {
  margin-top: 2rpx;
}

.product-card-meta-text {
  font-size: 20rpx;
  color: #8492a6;
}

@media (max-width: 360px) {
  .product-store-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
