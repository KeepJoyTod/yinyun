<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStoreList } from '@/api/home';
import type { StoreItem } from '@/types/home';

const brandCode = ref(import.meta.env.VITE_BRAND_CODE || 'yingyue');
const stores = ref<StoreItem[]>([]);
const loading = ref(false);
const error = ref('');

const availableStores = computed(() => stores.value.filter((store) => !store.hidden));

async function loadStores() {
  loading.value = true;
  error.value = '';
  try {
    const result = await getStoreList({ brandCode: brandCode.value });
    stores.value = Array.isArray(result) ? result : [];
  } catch (e: any) {
    error.value = e?.message || '客服信息加载失败';
  } finally {
    loading.value = false;
  }
}

function callStore(store: StoreItem) {
  if (!store.phone) {
    uni.showToast({ title: '该门店暂无联系电话', icon: 'none' });
    return;
  }
  uni.makePhoneCall({ phoneNumber: store.phone });
}

function copyWechat(store: StoreItem) {
  const contactWechat = store.contactWechat?.trim();
  if (!contactWechat) {
    uni.showToast({ title: '该门店暂无客服微信', icon: 'none' });
    return;
  }
  uni.setClipboardData({
    data: contactWechat,
    success: () => uni.showToast({ title: '客服微信已复制', icon: 'none' }),
  });
}

function goStores() {
  uni.switchTab({
    url: '/pages/store/list/index',
    fail: () => uni.navigateTo({ url: '/pages/store/list/index' }),
  });
}

onShow(loadStores);
</script>

<template>
  <view class="page-shell service-page">
    <view class="page-content service-content">
      <view class="hero-panel hero-panel-compact service-hero">
        <view class="brand-row">
          <text class="chip chip-neutral">联系客服</text>
          <text class="service-hero-status">门店优先处理</text>
        </view>
        <view class="hero-title">订单、取片和改期问题，联系对应门店</view>
        <view class="hero-copy">联系方式来自自有门店配置；如果暂无电话或微信，请先进入门店页确认营业状态。</view>
      </view>

      <view v-if="loading" class="surface-card service-state-card">
        <view class="skeleton-line service-skeleton-title" />
        <view class="skeleton-line service-skeleton-copy" />
        <view class="skeleton-block service-skeleton-block" />
      </view>

      <view v-else-if="error" class="surface-card service-state-card">
        <view class="empty-visual"><view class="empty-visual-inner" /></view>
        <text class="state-title">客服信息暂时不可用</text>
        <text class="state-copy">{{ error }}。可以稍后重试，或先进入门店列表查看公开信息。</text>
        <button class="button-secondary service-state-action" @tap="loadStores">重新加载</button>
      </view>

      <view v-else-if="!availableStores.length" class="surface-card service-state-card">
        <view class="empty-visual"><view class="empty-visual-inner" /></view>
        <text class="state-title">暂无可联系门店</text>
        <text class="state-copy">门店配置完成后会在这里显示电话和客服微信，不会展示未授权的外部联系方式。</text>
        <button class="button-secondary service-state-action" @tap="goStores">查看门店</button>
      </view>

      <view v-else class="service-store-list">
        <view v-for="store in availableStores" :key="store.storeId" class="surface-card service-store-card">
          <view class="service-store-head">
            <view class="service-store-copy">
              <text class="service-store-name">{{ store.name }}</text>
              <text class="service-store-address">{{ store.address || '门店地址待补充' }}</text>
            </view>
            <text class="service-store-status">{{ store.status === 'OPEN' ? '营业中' : '请先确认' }}</text>
          </view>
          <view class="service-contact-grid">
            <view class="service-contact-item">
              <text class="service-contact-label">电话</text>
              <text class="service-contact-value">{{ store.phone || '暂未配置' }}</text>
            </view>
            <view class="service-contact-item">
              <text class="service-contact-label">客服微信</text>
              <text class="service-contact-value">{{ store.contactWechat || '暂未配置' }}</text>
            </view>
          </view>
          <view class="service-action-row">
            <button class="button-secondary service-action" @tap="copyWechat(store)">复制微信</button>
            <button class="button-primary service-action" @tap="callStore(store)">电话咨询</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.service-page {
  padding-top: 24rpx;
}

.service-content,
.service-store-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.service-hero-status {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  font-weight: 700;
  white-space: nowrap;
}

.service-state-card {
  padding: 48rpx 30rpx;
  text-align: center;
}

.service-state-action {
  width: 240rpx;
  margin: 22rpx auto 0;
}

.service-skeleton-title {
  width: 58%;
  margin: 0 auto;
}

.service-skeleton-copy {
  width: 76%;
  margin: 18rpx auto 0;
}

.service-skeleton-block {
  height: 220rpx;
  margin-top: 24rpx;
}

.service-store-card {
  padding: 26rpx;
}

.service-store-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.service-store-copy {
  min-width: 0;
}

.service-store-name,
.service-store-address,
.service-store-status,
.service-contact-label,
.service-contact-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-store-name {
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 820;
  line-height: 1.25;
}

.service-store-address {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.5;
}

.service-store-status {
  flex: none;
  min-height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: #e8f2ff;
  color: #1d4ed8;
  font-size: 21rpx;
  font-weight: 760;
  line-height: 40rpx;
  white-space: nowrap;
}

.service-contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 22rpx;
}

.service-contact-item {
  min-width: 0;
  padding: 18rpx;
  border: 1px solid rgba(207, 217, 215, 0.76);
  border-radius: 16rpx;
  background: #f8fbff;
}

.service-contact-label {
  color: #64748b;
  font-size: 21rpx;
  font-weight: 720;
  line-height: 1.25;
}

.service-contact-value {
  margin-top: 8rpx;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 760;
  line-height: 1.3;
  white-space: nowrap;
}

.service-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 22rpx;
}

.service-action {
  margin-top: 0;
}

@media (max-width: 360px) {
  .service-contact-grid,
  .service-action-row {
    grid-template-columns: 1fr;
  }
}
</style>
