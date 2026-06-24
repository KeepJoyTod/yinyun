<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { getCustomerOrderSummary, getCustomerProfile } from '@/api/customer';
import {
  clearCustomerToken,
  getCustomerUser,
  hasCustomerToken,
} from '@/utils/auth';
import type { CustomerOrderSummary, CustomerProfile } from '@/types/clientPhoto';
import { referenceAssets } from '@/utils/referenceAssets';

type EntryKey = 'appointment' | 'orders' | 'notice' | 'stores' | 'service' | 'works';

interface CenterEntry {
  key: EntryKey;
  title: string;
  copy: string;
  icon: string;
  type: 'switchTab' | 'navigateTo' | 'anchor' | 'toast' | 'call';
  url?: string;
  toast?: string;
}

const ORDER_STATUS_FILTER_KEY = 'yy_customer_order_status_filter';

const EMPTY_SUMMARY: CustomerOrderSummary = {
  totalOrders: 0,
  pendingPaymentCount: 0,
  pendingSelectionCount: 0,
  completedCount: 0,
  downloadablePhotoCount: 0,
};

const profile = ref<CustomerProfile | null>(null);
const summary = ref<CustomerOrderSummary>({ ...EMPTY_SUMMARY });
const loading = ref(false);
const loginLoading = ref(false);
const actionLoadingKey = ref<string>('');
const loadFailed = ref(false);
let loadSeq = 0;

const loggedIn = computed(() => hasCustomerToken());
const displayName = computed(() => {
  const cached = getCustomerUser();
  return profile.value?.nickname || cached?.nickname || '影约会员';
});
const avatarText = computed(() => displayName.value.trim().slice(0, 1) || '影');
const phoneMasked = computed(() => {
  const cached = getCustomerUser();
  return profile.value?.phoneMasked || cached?.phoneMasked || '手机号未绑定';
});
const memberLevel = computed(() => profile.value?.memberLevel || '普通会员');
const totalOrderLabel = computed(() => `${summary.value.totalOrders || 0}`);

const orderStatusItems = computed(() => [
  {
    key: 'pending-payment',
    title: '待支付',
    value: summary.value.pendingPaymentCount || 0,
    status: 'PENDING_PAYMENT',
    url: '/pages/customer/orders/index',
  },
  {
    key: 'pending-selection',
    title: '待选片',
    value: summary.value.pendingSelectionCount || 0,
    status: 'PENDING_SELECTION',
    url: '/pages/customer/orders/index',
  },
  {
    key: 'albums',
    title: '底片',
    value: summary.value.downloadablePhotoCount || 0,
    status: '',
    url: '/pages/pickup/albums/index',
  },
  {
    key: 'completed',
    title: '已完成',
    value: summary.value.completedCount || 0,
    status: 'DELIVERED',
    url: '/pages/customer/orders/index',
  },
]);

const serviceEntries: CenterEntry[] = [
  {
    key: 'appointment',
    title: '预约时间',
    copy: '选择门店与档期',
    icon: 'calendar',
    type: 'switchTab',
    url: '/pages/store/list/index',
  },
  {
    key: 'orders',
    title: '我的订单',
    copy: '查看预约进度',
    icon: 'compose',
    type: 'switchTab',
    url: '/pages/customer/orders/index',
  },
  {
    key: 'notice',
    title: '拍摄须知',
    copy: '确认到店准备',
    icon: 'camera',
    type: 'navigateTo',
    url: '/pages/help/shooting-notice/index',
  },
  {
    key: 'stores',
    title: '门店地址',
    copy: '导航或电话咨询',
    icon: 'map-pin',
    type: 'switchTab',
    url: '/pages/store/list/index',
  },
  {
    key: 'service',
    title: '联系客服',
    copy: '咨询订单与取片',
    icon: 'phone',
    type: 'navigateTo',
    url: '/pages/help/contact-service/index',
  },
  {
    key: 'works',
    title: '样片首页',
    copy: '浏览作品风格',
    icon: 'images',
    type: 'switchTab',
    url: '/pages/home/index',
  },
];

function normalizeSummary(payload?: Partial<CustomerOrderSummary>): CustomerOrderSummary {
  return {
    totalOrders: Number(payload?.totalOrders || 0),
    pendingPaymentCount: Number(payload?.pendingPaymentCount || 0),
    pendingSelectionCount: Number(payload?.pendingSelectionCount || 0),
    completedCount: Number(payload?.completedCount || 0),
    downloadablePhotoCount: Number(payload?.downloadablePhotoCount || 0),
  };
}

function resetMemberData() {
  profile.value = null;
  summary.value = { ...EMPTY_SUMMARY };
  loadFailed.value = false;
}

async function loadMemberCenter() {
  loadSeq += 1;
  const seq = loadSeq;
  if (!hasCustomerToken()) {
    resetMemberData();
    return;
  }

  loading.value = true;
  loadFailed.value = false;
  try {
    const [profilePayload, summaryPayload] = await Promise.all([
      getCustomerProfile(),
      getCustomerOrderSummary(),
    ]);
    if (seq !== loadSeq) {
      return;
    }
    profile.value = profilePayload;
    summary.value = normalizeSummary(summaryPayload);
  } catch {
    if (seq !== loadSeq) {
      return;
    }
    loadFailed.value = true;
    const cached = getCustomerUser();
    profile.value = cached
      ? {
        id: cached.id,
        openId: cached.openId || cached.openid,
        unionId: cached.unionId || cached.unionid,
        phoneMasked: cached.phoneMasked,
        nickname: cached.nickname,
        avatarUrl: cached.avatarUrl,
        createdAt: cached.createdAt,
      }
      : null;
    summary.value = { ...EMPTY_SUMMARY };
  } finally {
    if (seq === loadSeq) {
      loading.value = false;
    }
  }
}

function goLogin() {
  loginLoading.value = true;
  uni.navigateTo({
    url: '/pages/pickup/login/index?redirect=' + encodeURIComponent('/pages/my/index'),
    complete: () => {
      loginLoading.value = false;
    },
  });
}

function logout() {
  clearCustomerToken();
  resetMemberData();
  uni.showToast({ title: '已退出会员登录', icon: 'none' });
}

function withActionFeedback(key: string, action: () => void) {
  actionLoadingKey.value = key;
  try {
    action();
  } finally {
    setTimeout(() => {
      if (actionLoadingKey.value === key) {
        actionLoadingKey.value = '';
      }
    }, 180);
  }
}

function goOrderStatus(item: { key: string; status?: string; url: string }) {
  withActionFeedback(`order-${item.key}`, () => {
    if (item.status) {
      uni.setStorageSync(ORDER_STATUS_FILTER_KEY, item.status);
    }
    uni.switchTab({
      url: item.url,
      fail: () => {
        uni.navigateTo({ url: item.url });
      },
    });
  });
}

function goAllOrders() {
  withActionFeedback('all-orders', () => {
    uni.removeStorageSync(ORDER_STATUS_FILTER_KEY);
    uni.switchTab({ url: '/pages/customer/orders/index' });
  });
}

function openEntry(entry: CenterEntry) {
  withActionFeedback(entry.key, () => {
    if (entry.type === 'toast') {
      uni.showToast({ title: entry.toast || '功能即将开放', icon: 'none' });
      return;
    }
    if (!entry.url) {
      uni.showToast({ title: '入口暂未配置', icon: 'none' });
      return;
    }
    if (entry.type === 'switchTab') {
      uni.switchTab({
        url: entry.url,
        fail: () => uni.navigateTo({ url: entry.url as string }),
      });
      return;
    }
    uni.navigateTo({ url: entry.url });
  });
}

function retryLoad() {
  void loadMemberCenter();
}

onShow(loadMemberCenter);
</script>

<template>
  <view class="page-shell member-page">
    <view class="page-content member-content">
      <view class="member-hero">
        <image class="member-hero-image" :src="referenceAssets.seasonalHot[1]" mode="aspectFill" />
        <view class="member-identity">
          <image
            v-if="loggedIn && profile?.avatarUrl"
            class="member-avatar member-avatar-image"
            :src="profile.avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="member-avatar">
            <text>{{ loggedIn ? avatarText : '未' }}</text>
          </view>
          <view class="member-copy">
            <text class="member-kicker">{{ loggedIn ? memberLevel : '影约云会员中心' }}</text>
            <text class="member-name">{{ loggedIn ? displayName : '登录后管理预约与底片' }}</text>
            <text class="member-subtitle">{{ loggedIn ? phoneMasked : '订单、选片、下载进度集中在这里查看' }}</text>
          </view>
        </view>
        <button
          v-if="loggedIn"
          class="member-top-action"
          :disabled="loading"
          @click="logout"
        >
          退出
        </button>
        <button
          v-else
          class="member-top-action member-top-action-primary"
          :disabled="loginLoading"
          :loading="loginLoading"
          @click="goLogin"
        >
          登录
        </button>
      </view>

      <view v-if="loggedIn" class="member-metrics">
        <view class="member-metric-item">
          <text class="member-metric-value">{{ loading ? '--' : totalOrderLabel }}</text>
          <text class="member-metric-label">全部订单</text>
        </view>
        <view class="member-metric-item">
          <text class="member-metric-value">{{ loading ? '--' : summary.pendingPaymentCount }}</text>
          <text class="member-metric-label">待支付</text>
        </view>
        <view class="member-metric-item">
          <text class="member-metric-value">{{ loading ? '--' : summary.pendingSelectionCount }}</text>
          <text class="member-metric-label">待选片</text>
        </view>
        <view class="member-metric-item">
          <text class="member-metric-value">{{ loading ? '--' : summary.downloadablePhotoCount }}</text>
          <text class="member-metric-label">可下载</text>
        </view>
      </view>

      <view v-if="loadFailed" class="member-alert">
        <view>
          <text class="member-alert-title">会员数据暂时未同步</text>
          <text class="member-alert-copy">已保留本地登录信息，可稍后刷新订单数量。</text>
        </view>
        <button class="member-alert-action" :disabled="loading" :loading="loading" @click="retryLoad">刷新</button>
      </view>

      <view class="member-card member-orders-card">
        <view class="member-section-head">
          <text class="member-section-title">我的订单</text>
          <button
            class="member-inline-action"
            :disabled="actionLoadingKey === 'all-orders'"
            :loading="actionLoadingKey === 'all-orders'"
            @click="goAllOrders"
          >
            查看全部订单
          </button>
        </view>
        <view class="member-status-grid">
          <button
            v-for="item in orderStatusItems"
            :key="item.key"
            class="member-status-button"
            :disabled="actionLoadingKey === `order-${item.key}`"
            :loading="actionLoadingKey === `order-${item.key}`"
            @click="goOrderStatus(item)"
          >
            <text class="member-status-value">{{ loggedIn && !loading ? item.value : '--' }}</text>
            <text class="member-status-title">{{ item.title }}</text>
          </button>
        </view>
      </view>

      <view class="member-card member-services-card">
        <view class="member-section-head">
          <text class="member-section-title">常用服务</text>
          <text class="member-section-note">6 个入口</text>
        </view>
        <view class="member-service-grid">
          <button
            v-for="entry in serviceEntries"
            :key="entry.key"
            class="member-service-button"
            :disabled="actionLoadingKey === entry.key"
            :loading="actionLoadingKey === entry.key"
            @click="openEntry(entry)"
          >
            <UniIcons class="member-service-icon" :type="entry.icon" color="#606773" size="68rpx" />
            <text class="member-service-title">{{ entry.title }}</text>
          </button>
        </view>
      </view>

      <view class="member-note-card">
        <text class="member-note-title">影约云技术支持</text>
        <text class="member-note-copy">本页面仅展示自有品牌预约、订单与取片能力；登录前不会请求客户资料接口。</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.member-page {
  padding-top: 24rpx;
}

.member-content {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.member-hero,
.member-card,
.member-note-card,
.member-alert {
  box-sizing: border-box;
  border: 1px solid rgba(207, 217, 215, 0.9);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.97);
}

.member-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
  background: #e4efff;
}

.member-hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.member-identity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 20rpx;
  box-sizing: border-box;
  padding: 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 24rpx rgba(31, 45, 49, 0.08);
}

.member-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 104rpx;
  width: 104rpx;
  height: 104rpx;
  overflow: hidden;
  border-radius: 28rpx;
  background: #eaf3ff;
  color: #1d4ed8;
  font-size: 38rpx;
  font-weight: 820;
}

.member-avatar-image {
  display: block;
  background: #edf4f2;
}

.member-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 7rpx;
}

.member-kicker,
.member-name,
.member-subtitle,
.member-section-title,
.member-section-note,
.member-status-value,
.member-status-title,
.member-service-title,
.member-note-title,
.member-note-copy,
.member-alert-title,
.member-alert-copy,
.member-metric-label,
.member-metric-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-kicker {
  color: #52677f;
  font-size: 22rpx;
  font-weight: 760;
  line-height: 1.3;
  white-space: nowrap;
}

.member-name {
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 840;
  line-height: 1.2;
}

.member-subtitle {
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.45;
}

.member-top-action,
.member-inline-action,
.member-alert-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: auto;
  min-width: 104rpx;
  min-height: 58rpx;
  margin: 0;
  padding: 0 22rpx;
  border: 0;
  border-radius: 999rpx;
  background: #eaf3ff;
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 760;
  line-height: 58rpx;
  transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;
}

.member-top-action {
  position: relative;
  z-index: 1;
}

.member-top-action-primary {
  background: #2563eb;
  color: #fff;
}

.member-top-action::after,
.member-inline-action::after,
.member-alert-action::after,
.member-status-button::after,
.member-service-button::after {
  border: 0;
}

.member-top-action:active,
.member-inline-action:active,
.member-alert-action:active,
.member-status-button:active,
.member-service-button:active {
  transform: scale(0.985);
}

.member-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.member-metric-item {
  min-width: 0;
  padding: 18rpx 12rpx;
  border-radius: 18rpx;
  background: #eaf3ff;
  text-align: center;
}

.member-metric-value {
  color: #103f3a;
  font-size: 32rpx;
  font-weight: 840;
  line-height: 1.1;
  white-space: nowrap;
}

.member-metric-label {
  margin-top: 7rpx;
  color: #536864;
  font-size: 21rpx;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
}

.member-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 22rpx;
  background: #fff9ee;
  border-color: rgba(199, 154, 74, 0.24);
}

.member-alert-title {
  color: #714d1c;
  font-size: 23rpx;
  font-weight: 780;
  line-height: 1.35;
}

.member-alert-copy {
  margin-top: 5rpx;
  color: #7a633f;
  font-size: 21rpx;
  line-height: 1.45;
}

.member-alert-action {
  background: #fff;
  color: #714d1c;
}

.member-card {
  padding: 24rpx;
}

.member-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.member-section-title {
  color: #0f172a;
  font-size: 29rpx;
  font-weight: 820;
  line-height: 1.25;
  white-space: nowrap;
}

.member-section-note {
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.35;
  white-space: nowrap;
}

.member-inline-action {
  min-width: 150rpx;
  min-height: 52rpx;
  padding: 0 18rpx;
  background: transparent;
  color: #1d4ed8;
  line-height: 52rpx;
}

.member-status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.member-status-button {
  min-width: 0;
  min-height: 126rpx;
  margin: 0;
  padding: 18rpx 10rpx;
  border: 0;
  border-radius: 18rpx;
  background:
    linear-gradient(180deg, rgba(243, 248, 246, 0.98), rgba(238, 245, 243, 0.98)),
    #f2f7f5;
  color: #0f172a;
  line-height: normal;
  transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;
}

.member-status-value {
  color: #1d4ed8;
  font-size: 32rpx;
  font-weight: 840;
  line-height: 1.1;
  white-space: nowrap;
}

.member-status-title {
  margin-top: 10rpx;
  color: #526663;
  font-size: 22rpx;
  font-weight: 720;
  line-height: 1.25;
  white-space: nowrap;
}

.member-service-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28rpx 12rpx;
}

.member-service-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 0;
  min-height: 176rpx;
  margin: 0;
  padding: 8rpx 4rpx;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #0f172a;
  line-height: normal;
  transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;
}

.member-service-icon {
  margin-bottom: 20rpx;
}

.member-service-title {
  color: #0f172a;
  font-size: 38rpx;
  font-weight: 500;
  line-height: 1.18;
  text-align: center;
  white-space: nowrap;
}

.member-note-card {
  padding: 22rpx 24rpx;
  background: #edf4f2;
}

.member-note-title {
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.35;
}

.member-note-copy {
  margin-top: 8rpx;
  color: #4d625f;
  font-size: 22rpx;
  line-height: 1.55;
}

button[disabled] {
  opacity: 0.55;
  transform: none;
}

@media (max-width: 360px) {
  .member-hero,
  .member-alert {
    align-items: stretch;
    flex-direction: column;
  }

  .member-top-action,
  .member-alert-action {
    width: 100%;
  }

  .member-metrics,
  .member-status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .member-service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24rpx 18rpx;
  }
}
</style>
