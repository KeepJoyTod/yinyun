<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getHomeData } from '@/api/home';

interface NoticeSection {
  title: string;
  items: string[];
}

const brandCode = ref(import.meta.env.VITE_BRAND_CODE || 'yingyue');
const loading = ref(false);
const loadFailed = ref(false);
const serviceNotice = ref('');

const fallbackNotice = '到店前请确认预约门店、拍摄时间、联系人手机号和套餐内容；如需改期，请提前联系门店确认可用档期。';

const noticeSections: NoticeSection[] = [
  {
    title: '到店前',
    items: [
      '确认预约时间、门店地址和同行人数，预留路程与妆造时间。',
      '保持预约手机号可联系，门店会通过订单信息核对到店身份。',
      '如有服装、证件照尺寸、亲子或多人拍摄需求，提前在备注或电话中说明。',
    ],
  },
  {
    title: '拍摄中',
    items: [
      '拍摄方案以门店现场确认结果为准，临时加项会在下单前再次核对。',
      '儿童、宠物或多人拍摄请按门店引导候场，避免影响后续档期。',
      '贵重物品请自行保管，离店前确认随身物品和订单状态。',
    ],
  },
  {
    title: '交付与选片',
    items: [
      '拍摄完成后，门店会按约定周期开放底片、精修或选片入口。',
      '相册、下载和选片入口需要使用预约手机号登录后查看。',
      '如取片码过期、照片缺失或需调整精修，请联系门店核对订单状态。',
    ],
  },
];

async function loadNotice() {
  loading.value = true;
  loadFailed.value = false;
  try {
    const data = await getHomeData(brandCode.value);
    serviceNotice.value = data.serviceNotice || '';
  } catch {
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
}

function goStores() {
  uni.switchTab({
    url: '/pages/store/list/index',
    fail: () => uni.navigateTo({ url: '/pages/store/list/index' }),
  });
}

function goService() {
  uni.navigateTo({ url: '/pages/help/contact-service/index' });
}

onShow(loadNotice);
</script>

<template>
  <view class="page-shell notice-page">
    <view class="page-content notice-content">
      <view class="hero-panel hero-panel-compact notice-hero">
        <view class="brand-row">
          <text class="chip chip-neutral">拍摄须知</text>
          <text class="notice-hero-status">到店前确认</text>
        </view>
        <view class="hero-title">拍摄前，把关键事项核对清楚</view>
        <view class="hero-copy">请以门店最终确认信息为准；本页只保留影响到店、拍摄、交付的必要提醒。</view>
      </view>

      <view class="surface-card notice-summary-card">
        <view class="section-title">门店说明</view>
        <view v-if="loading" class="notice-loading">
          <view class="skeleton-line notice-skeleton-line" />
          <view class="skeleton-line notice-skeleton-line-short" />
        </view>
        <text v-else class="notice-summary-text">{{ serviceNotice || fallbackNotice }}</text>
        <text v-if="loadFailed" class="notice-load-tip">暂未同步后台装修说明，已展示通用拍摄提醒。</text>
      </view>

      <view class="surface-card notice-check-card">
        <view class="section-title">核对清单</view>
        <view class="notice-section-list">
          <view v-for="section in noticeSections" :key="section.title" class="notice-section">
            <text class="notice-section-title">{{ section.title }}</text>
            <view class="notice-item-list">
              <view v-for="item in section.items" :key="item" class="notice-item">
                <view class="notice-dot" />
                <text class="notice-item-text">{{ item }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="notice-action-row">
        <button class="button-secondary notice-action" @tap="goService">联系客服</button>
        <button class="button-primary notice-action" @tap="goStores">查看门店</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.notice-page {
  padding-top: 24rpx;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.notice-hero-status {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  font-weight: 700;
  white-space: nowrap;
}

.notice-summary-card,
.notice-check-card {
  padding: 28rpx;
}

.notice-summary-text {
  display: block;
  margin-top: 14rpx;
  color: #435052;
  font-size: 25rpx;
  line-height: 1.65;
}

.notice-load-tip {
  display: block;
  margin-top: 14rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: #fffaf2;
  color: #7b5b28;
  font-size: 22rpx;
  line-height: 1.45;
}

.notice-loading {
  margin-top: 18rpx;
}

.notice-skeleton-line {
  width: 88%;
}

.notice-skeleton-line-short {
  width: 58%;
}

.notice-section-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 22rpx;
}

.notice-section {
  padding: 20rpx;
  border: 1px solid rgba(207, 217, 215, 0.78);
  border-radius: 18rpx;
  background: #f8fbff;
}

.notice-section-title {
  display: block;
  color: #1d4ed8;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 1.35;
}

.notice-item-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 16rpx;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.notice-dot {
  flex: none;
  width: 14rpx;
  height: 14rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: #2563eb;
  box-shadow: 0 0 0 7rpx rgba(12, 92, 82, 0.08);
}

.notice-item-text {
  color: #4b5b5d;
  font-size: 23rpx;
  line-height: 1.55;
}

.notice-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.notice-action {
  margin-top: 0;
}

@media (max-width: 360px) {
  .notice-action-row {
    grid-template-columns: 1fr;
  }
}
</style>
