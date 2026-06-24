<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { verifyClientOrderAccess, type ClientOrderByPhoneItem } from '@/api/clientOrder';

const storeId = ref('');
const phone = ref('');
const phoneLast4 = ref('');
const loading = ref(false);
const searched = ref(false);
const loadFailed = ref(false);
const errorMessage = ref('');
const orders = ref<ClientOrderByPhoneItem[]>([]);

const resultSummary = computed(() => {
  if (loading.value) {
    return '正在查询订单';
  }
  if (loadFailed.value) {
    return '订单查询失败';
  }
  if (!searched.value) {
    return '输入手机号查询订单';
  }
  return orders.value.length ? `找到 ${orders.value.length} 个订单` : '没有匹配订单';
});

function readInputValue(event: any) {
  return String(event?.detail?.value ?? event?.target?.value ?? event ?? '');
}

function normalizeDigits(raw: string, maxLength: number) {
  return String(raw || '').replace(/\D/g, '').slice(0, maxLength);
}

function onStoreIdInput(event: any) {
  storeId.value = readInputValue(event).trim();
  return storeId.value;
}

function onPhoneInput(event: any) {
  phone.value = normalizeDigits(readInputValue(event), 11);
  if (phone.value.length >= 4) {
    phoneLast4.value = phone.value.slice(-4);
  }
  return phone.value;
}

function onPhoneLast4Input(event: any) {
  phoneLast4.value = normalizeDigits(readInputValue(event), 4);
  return phoneLast4.value;
}

function validateQuery() {
  const normalizedPhone = normalizeDigits(phone.value, 11);
  const normalizedLast4 = normalizeDigits(phoneLast4.value, 4);
  storeId.value = storeId.value.trim();
  phone.value = normalizedPhone;
  phoneLast4.value = normalizedLast4;

  if (!storeId.value) {
    return '请输入门店 ID';
  }
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    return '请输入下单时预留的 11 位手机号';
  }
  if (normalizedLast4 && normalizedLast4.length !== 4) {
    return '手机号后四位请填写 4 位数字';
  }
  if (normalizedLast4 && !normalizedPhone.endsWith(normalizedLast4)) {
    return '手机号后四位与完整手机号不一致';
  }
  return '';
}

async function queryOrders() {
  if (loading.value) {
    return;
  }
  const validationError = validateQuery();
  if (validationError) {
    errorMessage.value = validationError;
    uni.showToast({ title: validationError, icon: 'none' });
    return;
  }

  loading.value = true;
  searched.value = true;
  loadFailed.value = false;
  errorMessage.value = '';
  try {
    const token = await verifyClientOrderAccess({
      storeId: storeId.value,
      phone: phone.value,
      phoneLast4: phoneLast4.value,
    });
    orders.value = token.orders || [];
  } catch (error: any) {
    orders.value = [];
    loadFailed.value = true;
    errorMessage.value = error?.message || '订单查询失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  phone.value = '';
  phoneLast4.value = '';
  orders.value = [];
  searched.value = false;
  loadFailed.value = false;
  errorMessage.value = '';
}

function orderKey(order: ClientOrderByPhoneItem, index: number) {
  return String(order.orderId || order.orderNo || index);
}

function orderTitle(order: ClientOrderByPhoneItem) {
  return order.title || order.productTitle || order.orderNo || '影约云订单';
}

function orderStatus(order: ClientOrderByPhoneItem) {
  return order.status || order.orderStatus || '待确认';
}

function orderMeta(order: ClientOrderByPhoneItem) {
  return [
    order.orderNo ? `订单 ${order.orderNo}` : '',
    order.channelType || '',
    order.payStatus ? `支付 ${order.payStatus}` : '',
  ].filter(Boolean).join(' · ');
}

function orderTime(order: ClientOrderByPhoneItem) {
  return order.appointmentTime || order.createdTime || '';
}

function amountText(order: ClientOrderByPhoneItem) {
  if (order.amount === undefined || order.amount === null || order.amount === '') {
    return '';
  }
  const amount = Number(order.amount);
  if (Number.isFinite(amount)) {
    return `¥${amount.toFixed(2)}`;
  }
  return String(order.amount);
}

function copyUrl(url?: string) {
  if (!url) {
    uni.showToast({ title: '链接暂未生成', icon: 'none' });
    return;
  }
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  });
}

function openUrl(url?: string) {
  if (!url) {
    uni.showToast({ title: '链接暂未生成', icon: 'none' });
    return;
  }
  // #ifdef H5
  window.location.href = url;
  // #endif
  // #ifndef H5
  copyUrl(url);
  // #endif
}

onLoad((query) => {
  storeId.value = String(query?.storeId || '').trim();
  phone.value = normalizeDigits(String(query?.phone || ''), 11);
  phoneLast4.value = normalizeDigits(String(query?.phoneLast4 || ''), 4);
  if (phone.value || phoneLast4.value) {
    void queryOrders();
  }
});
</script>

<template>
  <view class="page-shell">
    <view class="page-content stack">
      <view class="hero-panel hero-panel-compact order-query-hero">
        <view class="brand-row">
          <view class="brand-lockup">
            <view class="brand-mark">影</view>
            <text class="brand-name">影约云</text>
          </view>
          <text class="chip chip-neutral">订单查询</text>
        </view>
        <view class="hero-title">查询你的拍摄订单</view>
        <view class="hero-copy">输入门店 ID 和下单手机号，查看订单状态、取片入口和订单详情链接。</view>
      </view>

      <view class="surface-card order-query-form">
        <view class="section-title">{{ resultSummary }}</view>
        <view class="subtitle">为保护客户订单隐私，查询必须填写门店 ID 和完整手机号；后四位只用于二次核对。</view>

        <view class="field">
          <text class="label">门店 ID</text>
          <input
            v-model="storeId"
            class="input"
            placeholder="请输入门店 ID"
            @input="onStoreIdInput"
          />
        </view>

        <view class="field">
          <text class="label">手机号</text>
          <input
            v-model="phone"
            class="input"
            type="number"
            maxlength="11"
            placeholder="请输入完整手机号"
            @input="onPhoneInput"
          />
        </view>

        <view class="field">
          <text class="label">手机号后四位</text>
          <input
            v-model="phoneLast4"
            class="input"
            type="number"
            maxlength="4"
            placeholder="可选，自动从手机号带出"
            @input="onPhoneLast4Input"
          />
        </view>

        <view v-if="errorMessage && !loadFailed" class="query-inline-error">{{ errorMessage }}</view>
        <view class="order-query-actions">
          <button class="button-primary order-query-button" :loading="loading" @click="queryOrders">查询订单</button>
          <button class="button-secondary order-query-button" :disabled="loading" @click="resetQuery">清空</button>
        </view>
      </view>

      <view v-if="loading" class="stack">
        <view class="card order-skeleton-card">
          <view class="skeleton-line" style="width: 58%"></view>
          <view class="skeleton-line" style="width: 86%"></view>
          <view class="skeleton-line" style="width: 42%"></view>
        </view>
      </view>

      <view v-else-if="orders.length" class="stack">
        <view v-for="(order, index) in orders" :key="orderKey(order, index)" class="card order-result-card">
          <view class="order-result-head">
            <view>
              <view class="order-result-title">{{ orderTitle(order) }}</view>
              <view class="order-result-meta">{{ orderMeta(order) || '客户订单' }}</view>
            </view>
            <text class="order-status-chip">{{ orderStatus(order) }}</text>
          </view>

          <view class="order-result-grid">
            <view class="order-result-field">
              <text class="order-result-label">客户</text>
              <text class="order-result-value">{{ order.customerName || order.phoneMasked || '已隐藏' }}</text>
            </view>
            <view class="order-result-field">
              <text class="order-result-label">时间</text>
              <text class="order-result-value">{{ orderTime(order) || '待确认' }}</text>
            </view>
            <view class="order-result-field">
              <text class="order-result-label">金额</text>
              <text class="order-result-value">{{ amountText(order) || '待确认' }}</text>
            </view>
          </view>

          <view class="order-link-panel">
            <view class="order-link-row">
              <text class="order-link-label">取片链接</text>
              <text class="order-link-text">{{ order.pickupUrl || '暂未生成' }}</text>
            </view>
            <view class="order-link-actions">
              <button class="mini-action" @click="openUrl(order.pickupUrl)">打开</button>
              <button class="mini-action mini-action-light" @click="copyUrl(order.pickupUrl)">复制</button>
            </view>
          </view>

          <view class="order-link-panel">
            <view class="order-link-row">
              <text class="order-link-label">详情链接</text>
              <text class="order-link-text">{{ order.orderDetailUrl || '暂未生成' }}</text>
            </view>
            <view class="order-link-actions">
              <button class="mini-action" @click="openUrl(order.orderDetailUrl)">打开</button>
              <button class="mini-action mini-action-light" @click="copyUrl(order.orderDetailUrl)">复制</button>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="searched || loadFailed" class="card empty-state">
        <view class="empty-visual"></view>
        <view class="state-title">{{ loadFailed ? '订单查询失败' : '没有匹配订单' }}</view>
        <view class="state-copy">
          {{ loadFailed ? errorMessage || '请稍后重新查询。' : '请确认门店 ID、手机号或尾号是否与下单信息一致。' }}
        </view>
        <button class="button-secondary" :loading="loading" @click="queryOrders">重新查询</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.order-query-form {
  gap: 24rpx;
}

.order-query-actions,
.order-link-actions {
  display: flex;
  gap: 16rpx;
}

.order-query-button {
  flex: 1;
}

.query-inline-error {
  color: #b42318;
  font-size: 24rpx;
  line-height: 1.5;
}

.order-result-card {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.order-result-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.order-result-title {
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
}

.order-result-meta,
.order-result-label,
.order-link-label {
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.45;
}

.order-status-chip {
  flex-shrink: 0;
  border-radius: 999rpx;
  background: #e8f4ef;
  color: #2f80ed;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
  padding: 13rpx 18rpx;
}

.order-result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.order-result-field {
  min-width: 0;
  border: 1rpx solid #e6e0d4;
  border-radius: 18rpx;
  background: #fbfaf6;
  padding: 16rpx;
}

.order-result-value {
  display: block;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 650;
  line-height: 1.45;
  margin-top: 8rpx;
  overflow-wrap: anywhere;
}

.order-link-panel {
  border: 1rpx solid #e6e0d4;
  border-radius: 20rpx;
  background: #fffdf8;
  padding: 18rpx;
}

.order-link-row {
  min-width: 0;
}

.order-link-text {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  line-height: 1.45;
  margin-top: 8rpx;
  overflow-wrap: anywhere;
}

.order-link-actions {
  margin-top: 16rpx;
}

.mini-action-light {
  background: #f7f5ef;
  color: #2f80ed;
}

.order-skeleton-card {
  min-height: 180rpx;
}

@media (max-width: 420px) {
  .order-result-grid {
    grid-template-columns: 1fr;
  }

  .order-query-actions,
  .order-link-actions {
    flex-direction: column;
  }
}
</style>
