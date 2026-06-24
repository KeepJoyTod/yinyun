<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  cancelCustomerOrder,
  listCustomerOrders,
  payCustomerOrder,
  rescheduleCustomerOrder,
} from '@/api/customer';
import YyBottomSheet from '@/components/YyBottomSheet.vue';
import { useCustomerAuth } from '@/composables/useCustomerAuth';
import type { CustomerOrder } from '@/types/clientPhoto';
import { resolveCustomerPaymentAction } from '@/utils/customer-payment-placeholder.mjs';
import { referenceAssets } from '@/utils/referenceAssets';
import {
  ORDER_STATUS_FILTER_KEY,
  actionsFor,
  findActiveTab,
  queryStatus,
  resolvePresetActiveKey,
  tabs,
  type StatusTab,
} from './orderActions';
import {
  amountLabel,
  buildDefaultRescheduleDate,
  createEmptyCopy,
  formatDateTime,
  moneyLabel,
  normalizePage,
  payLabel,
  percentLabel,
} from './orderPresentation';

const { isLoggedIn, requireCustomerLogin } = useCustomerAuth();
const activeKey = ref('all');
const orders = ref<CustomerOrder[]>([]);
const loading = ref(false);
const error = ref('');
const actionLoadingId = ref('');
const expandedOrderId = ref('');
const afterSaleMode = ref<'reschedule' | 'cancel' | ''>('');
const rescheduleDate = ref('');
const rescheduleSlot = ref('');
const afterSaleReason = ref('');
const detailOrder = ref<CustomerOrder | null>(null);
const cancelConfirmOrder = ref<CustomerOrder | null>(null);

const activeTab = computed(() => findActiveTab(activeKey.value));
const cancelConfirmLoading = computed(() => (
  cancelConfirmOrder.value
    ? actionLoadingId.value === `cancel-${cancelConfirmOrder.value.orderId}`
    : false
));
const emptyCopy = computed(() => createEmptyCopy(
  isLoggedIn.value,
  activeKey.value,
  activeTab.value.label,
));

function readPresetStatus() {
  const preset = uni.getStorageSync(ORDER_STATUS_FILTER_KEY);
  if (!preset) {
    return;
  }
  uni.removeStorageSync(ORDER_STATUS_FILTER_KEY);
  const presetActiveKey = resolvePresetActiveKey(preset);
  if (presetActiveKey) {
    activeKey.value = presetActiveKey;
  }
}

async function loadOrders() {
  if (!isLoggedIn.value) {
    orders.value = [];
    error.value = '';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const payload = await listCustomerOrders({
      page: 0,
      size: 50,
      status: queryStatus(activeTab.value),
    });
    const list = normalizePage(payload);
    orders.value = activeTab.value.status === 'AFTERSALE'
      ? list.filter((order) => ['CANCELLED', 'REFUNDING', 'REFUNDED'].includes(order.status))
      : list;
  } catch (err: any) {
    error.value = err?.message || '订单加载失败';
  } finally {
    loading.value = false;
  }
}

function switchTab(tab: StatusTab) {
  activeKey.value = tab.key;
  void loadOrders();
}

function goLogin() {
  requireCustomerLogin('/pages/customer/orders/index');
}

function goAppointment() {
  uni.switchTab({ url: '/pages/store/list/index' });
}

function goAlbums(order: CustomerOrder) {
  if (order.albumId) {
    uni.navigateTo({ url: `/pages/pickup/detail/index?albumId=${encodeURIComponent(order.albumId)}` });
    return;
  }
  uni.switchTab({ url: '/pages/pickup/albums/index' });
}

function goSelection(order: CustomerOrder) {
  if (order.albumId) {
    uni.navigateTo({ url: `/pages/pickup/detail/index?albumId=${encodeURIComponent(order.albumId)}` });
    return;
  }
  uni.switchTab({ url: '/pages/pickup/albums/index' });
}

function showDetail(order: CustomerOrder) {
  detailOrder.value = order;
}

function openAfterSale(order: CustomerOrder, mode: 'reschedule' | 'cancel') {
  expandedOrderId.value = expandedOrderId.value === order.orderId && afterSaleMode.value === mode
    ? ''
    : order.orderId;
  afterSaleMode.value = expandedOrderId.value ? mode : '';
  afterSaleReason.value = mode === 'cancel' ? '客户主动取消' : '';
  rescheduleDate.value = buildDefaultRescheduleDate();
  rescheduleSlot.value = order.appointmentTimeSlot || '';
}

async function payOrder(order: CustomerOrder) {
  actionLoadingId.value = `pay-${order.orderId}`;
  try {
    const params = await payCustomerOrder(order.orderId);
    const paymentAction = resolveCustomerPaymentAction(params);
    if (!paymentAction.shouldRequestPayment) {
      uni.showToast({ title: paymentAction.toastMessage, icon: 'none' });
      await loadOrders();
      return;
    }
    if (!uni.requestPayment) {
      uni.showToast({ title: '当前环境暂不支持在线支付', icon: 'none' });
      await loadOrders();
      return;
    }
    await new Promise<void>((resolve, reject) => {
      (uni.requestPayment as any)({
        ...params,
        success: () => resolve(),
        fail: (err: unknown) => reject(err),
      });
    });
    uni.showToast({ title: '已发起支付', icon: 'success' });
    await loadOrders();
  } catch {
    uni.showToast({ title: '可稍后重新支付', icon: 'none' });
  } finally {
    actionLoadingId.value = '';
  }
}

function cancelOrder(order: CustomerOrder) {
  if (order.canCancel === false) {
    uni.showToast({ title: order.cancelDisabledReason || '当前订单不可取消', icon: 'none' });
    return;
  }
  cancelConfirmOrder.value = order;
}

async function confirmCancelOrder() {
  const order = cancelConfirmOrder.value;
  if (!order) {
    return;
  }
  actionLoadingId.value = `cancel-${order.orderId}`;
  try {
    await cancelCustomerOrder(order.orderId, afterSaleReason.value.trim() || '客户主动取消');
    expandedOrderId.value = '';
    afterSaleMode.value = '';
    cancelConfirmOrder.value = null;
    uni.showToast({ title: order.estimatedRefundAmount ? '取消已提交' : '订单已取消', icon: 'none' });
    await loadOrders();
  } finally {
    actionLoadingId.value = '';
  }
}

async function submitReschedule(order: CustomerOrder) {
  if (order.canReschedule === false) {
    uni.showToast({ title: order.rescheduleDisabledReason || '当前订单不可改期', icon: 'none' });
    return;
  }
  if (!rescheduleDate.value || !rescheduleSlot.value.trim()) {
    uni.showToast({ title: '请填写新的日期和时段', icon: 'none' });
    return;
  }
  actionLoadingId.value = `reschedule-${order.orderId}`;
  try {
    await rescheduleCustomerOrder(order.orderId, {
      newDate: rescheduleDate.value,
      newTimeSlot: rescheduleSlot.value.trim(),
      reason: afterSaleReason.value.trim() || '客户申请改期',
    });
    expandedOrderId.value = '';
    afterSaleMode.value = '';
    uni.showToast({ title: '改期申请已提交', icon: 'none' });
    await loadOrders();
  } finally {
    actionLoadingId.value = '';
  }
}

function runAction(order: CustomerOrder, key: string) {
  if (key === 'pay') {
    void payOrder(order);
  } else if (key === 'cancel') {
    openAfterSale(order, 'cancel');
  } else if (key === 'selection') {
    goSelection(order);
  } else if (key === 'albums') {
    goAlbums(order);
  } else if (key === 'reschedule') {
    openAfterSale(order, 'reschedule');
  } else {
    showDetail(order);
  }
}

onShow(() => {
  readPresetStatus();
  void loadOrders();
});
</script>

<template>
  <view class="replica-page orders-page">
    <view class="page-content orders-content">
      <view class="orders-head">
        <image class="orders-head-image" :src="referenceAssets.seasonalHot[0]" mode="aspectFill" />
        <view class="orders-head-content">
          <view>
            <text class="orders-title">我的订单</text>
            <text class="orders-subtitle">查看预约、支付、选片和底片进度</text>
          </view>
          <button v-if="!isLoggedIn" class="orders-head-action" @click="goLogin">登录</button>
        </view>
      </view>

      <scroll-view scroll-x class="orders-tabs-scroll">
        <view class="orders-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="orders-tab"
            :class="{ 'orders-tab-active': activeKey === tab.key }"
            @click="switchTab(tab)"
          >
            {{ tab.label }}
          </button>
        </view>
      </scroll-view>

      <template v-if="loading">
        <view v-for="n in 4" :key="n" class="surface-card skeleton-card">
          <view class="skeleton-line" style="width: 46%" />
          <view class="skeleton-line" style="width: 78%" />
          <view class="skeleton-block" style="height: 160rpx" />
        </view>
      </template>

      <view v-else-if="error" class="surface-card orders-state-card">
        <text class="state-title">加载失败</text>
        <text class="state-copy">{{ error }}</text>
        <button class="button-secondary" @click="loadOrders">重新加载</button>
      </view>

      <view v-else-if="orders.length === 0" class="surface-card orders-state-card">
        <view class="empty-visual">
          <view class="empty-visual-inner" />
        </view>
        <text class="state-title">{{ isLoggedIn ? '暂无订单' : '请先登录' }}</text>
        <text class="state-copy">{{ emptyCopy }}</text>
        <button v-if="isLoggedIn" class="button-primary" @click="goAppointment">去预约</button>
        <button v-else class="button-primary" @click="goLogin">登录会员</button>
      </view>

      <view v-for="order in orders" :key="order.orderId" class="surface-card order-card">
        <view class="order-card-head">
          <view class="order-title-box">
            <text class="order-product">{{ order.productTitle }}</text>
            <text class="order-no">订单号 {{ order.orderNo }}</text>
          </view>
          <text class="order-status">{{ order.statusLabel }}</text>
        </view>

        <view class="order-info-grid">
          <view class="order-info-item">
            <text class="order-info-label">门店</text>
            <text class="order-info-value">{{ order.storeName }}</text>
          </view>
          <view class="order-info-item">
            <text class="order-info-label">预约时间</text>
            <text class="order-info-value">{{ order.appointmentTime || '待确认' }}</text>
          </view>
          <view class="order-info-item">
            <text class="order-info-label">金额</text>
            <text class="order-info-value order-amount">{{ amountLabel(order) }}</text>
          </view>
          <view class="order-info-item">
            <text class="order-info-label">支付</text>
            <text class="order-info-value">{{ payLabel(order.payStatus) }}</text>
          </view>
        </view>

        <view class="order-rule-panel">
          <text class="order-rule-line">{{ order.rescheduleRule }}</text>
          <text class="order-rule-line">{{ order.refundRule }}</text>
          <text v-if="order.canReschedule === false && order.rescheduleDisabledReason" class="order-rule-warning">
            改期：{{ order.rescheduleDisabledReason }}
          </text>
          <text v-if="order.canCancel === false && order.cancelDisabledReason" class="order-rule-warning">
            取消：{{ order.cancelDisabledReason }}
          </text>
        </view>

        <view class="order-actions">
          <button
            v-for="action in actionsFor(order)"
            :key="action.key"
            class="order-action"
            :class="{
              'order-action-primary': action.type === 'primary',
              'order-action-plain': action.type === 'plain',
            }"
            :loading="actionLoadingId === `${action.key}-${order.orderId}`"
            :disabled="Boolean(actionLoadingId) || (action.key === 'reschedule' && order.canReschedule === false) || (action.key === 'cancel' && order.canCancel === false)"
            @click="runAction(order, action.key)"
          >
            {{ action.label }}
          </button>
        </view>

        <view
          v-if="expandedOrderId === order.orderId && afterSaleMode === 'reschedule'"
          class="after-sale-panel"
        >
          <view class="after-sale-head">
            <text class="after-sale-title">申请改期</text>
            <text class="after-sale-note">剩余 {{ order.rescheduleRemainingCount ?? 0 }} 次 · 最晚 {{ formatDateTime(order.latestRescheduleTime) }}</text>
          </view>
          <view class="after-sale-fields">
            <view class="after-sale-field">
              <text class="after-sale-label">新日期</text>
              <input v-model="rescheduleDate" class="after-sale-input" placeholder="YYYY-MM-DD" />
            </view>
            <view class="after-sale-field">
              <text class="after-sale-label">新时段</text>
              <input v-model="rescheduleSlot" class="after-sale-input" placeholder="10:00-10:30" />
            </view>
          </view>
          <view class="after-sale-field">
            <text class="after-sale-label">改期原因</text>
            <textarea v-model="afterSaleReason" class="after-sale-textarea" maxlength="120" placeholder="填写改期原因，便于门店确认" />
          </view>
          <button
            class="after-sale-submit"
            :loading="actionLoadingId === `reschedule-${order.orderId}`"
            :disabled="Boolean(actionLoadingId)"
            @click="submitReschedule(order)"
          >
            提交改期
          </button>
        </view>

        <view
          v-if="expandedOrderId === order.orderId && afterSaleMode === 'cancel'"
          class="after-sale-panel after-sale-cancel-panel"
        >
          <view class="after-sale-head">
            <text class="after-sale-title">取消订单</text>
            <text class="after-sale-note">预计退款 {{ percentLabel(order.refundRatio) }} · {{ moneyLabel(order.estimatedRefundAmount) }}</text>
          </view>
          <view class="refund-estimate-grid">
            <view>
              <text class="refund-estimate-label">退款比例</text>
              <text class="refund-estimate-value">{{ percentLabel(order.refundRatio) }}</text>
            </view>
            <view>
              <text class="refund-estimate-label">预计金额</text>
              <text class="refund-estimate-value">{{ moneyLabel(order.estimatedRefundAmount) }}</text>
            </view>
          </view>
          <view class="after-sale-field">
            <text class="after-sale-label">取消原因</text>
            <textarea v-model="afterSaleReason" class="after-sale-textarea" maxlength="120" placeholder="请填写取消原因" />
          </view>
          <button
            class="after-sale-submit after-sale-submit-danger"
            :loading="actionLoadingId === `cancel-${order.orderId}`"
            :disabled="Boolean(actionLoadingId)"
            @click="cancelOrder(order)"
          >
            提交取消
          </button>
        </view>
      </view>

      <YyBottomSheet
        :open="Boolean(detailOrder)"
        title="订单详情"
        confirm-text="知道了"
        :show-cancel="false"
        @close="detailOrder = null"
        @confirm="detailOrder = null"
      >
        <view v-if="detailOrder" class="order-sheet-detail">
          <view class="order-sheet-summary">
            <text class="order-sheet-product">{{ detailOrder.productTitle }}</text>
            <text class="order-sheet-no">订单号 {{ detailOrder.orderNo }}</text>
            <text class="order-sheet-status">{{ detailOrder.statusLabel }}</text>
          </view>
          <view class="order-sheet-grid">
            <view class="order-sheet-item">
              <text class="order-sheet-label">门店</text>
              <text class="order-sheet-value">{{ detailOrder.storeName || '待确认' }}</text>
            </view>
            <view class="order-sheet-item">
              <text class="order-sheet-label">预约时间</text>
              <text class="order-sheet-value">{{ detailOrder.appointmentTime || '待确认' }}</text>
            </view>
            <view class="order-sheet-item">
              <text class="order-sheet-label">金额</text>
              <text class="order-sheet-value order-sheet-money">{{ amountLabel(detailOrder) }}</text>
            </view>
            <view class="order-sheet-item">
              <text class="order-sheet-label">支付</text>
              <text class="order-sheet-value">{{ payLabel(detailOrder.payStatus) }}</text>
            </view>
          </view>
          <view class="order-sheet-rules">
            <text v-if="detailOrder.storePhone" class="order-sheet-rule">门店电话：{{ detailOrder.storePhone }}</text>
            <text v-if="detailOrder.storeAddress" class="order-sheet-rule">门店地址：{{ detailOrder.storeAddress }}</text>
            <text v-if="detailOrder.refundRule" class="order-sheet-rule">退款规则：{{ detailOrder.refundRule }}</text>
            <text v-if="detailOrder.rescheduleRule" class="order-sheet-rule">改期规则：{{ detailOrder.rescheduleRule }}</text>
          </view>
        </view>
      </YyBottomSheet>

      <YyBottomSheet
        :open="Boolean(cancelConfirmOrder)"
        title="确认取消订单"
        confirm-text="确认取消"
        cancel-text="再想想"
        :loading="cancelConfirmLoading"
        :confirm-danger="true"
        @close="cancelConfirmOrder = null"
        @confirm="confirmCancelOrder"
      >
        <view v-if="cancelConfirmOrder" class="order-sheet-detail">
          <view class="order-sheet-warning">
            <text class="order-sheet-warning-title">取消后将按门店规则处理退款</text>
            <text class="order-sheet-warning-copy">
              预计退款 {{ percentLabel(cancelConfirmOrder.refundRatio) }} · {{ moneyLabel(cancelConfirmOrder.estimatedRefundAmount) }}
            </text>
          </view>
          <view class="order-sheet-rules">
            <text v-if="cancelConfirmOrder.refundRule" class="order-sheet-rule">{{ cancelConfirmOrder.refundRule }}</text>
            <text class="order-sheet-rule">取消原因：{{ afterSaleReason || '客户主动取消' }}</text>
          </view>
        </view>
      </YyBottomSheet>

      <view class="replica-tab-safe-area" />
    </view>
  </view>
</template>

<style scoped src="./orders-page.scss"></style>
