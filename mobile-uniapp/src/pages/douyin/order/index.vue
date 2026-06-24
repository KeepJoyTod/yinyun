<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { listDouyinLifeOrderEntries } from '@/api/clientPhoto';
import type { ClientDouyinLifeOrderEntry } from '@/types/clientPhoto';

const loading = ref(false);
const loadFailed = ref(false);
const entries = ref<ClientDouyinLifeOrderEntry[]>([]);
const storeId = ref('');
const copiedEntryId = ref('');

const entrySummary = computed(() => {
  if (loading.value) {
    return '正在读取可下单套餐';
  }
  if (loadFailed.value) {
    return '下单入口加载失败';
  }
  return entries.value.length ? `${entries.value.length} 个可下单套餐` : '暂无可下单套餐';
});

function normalizeStoreId(raw?: string) {
  return String(raw || '').trim();
}

function entryTarget(entry: ClientDouyinLifeOrderEntry) {
  return entry.landingUrl || entry.landingPath || '';
}

function entryMeta(entry: ClientDouyinLifeOrderEntry) {
  const parts = [
    entry.externalProductId ? `商品 ${entry.externalProductId}` : '',
    entry.externalSkuId ? `SKU ${entry.externalSkuId}` : '',
    entry.externalPoiId ? `POI ${entry.externalPoiId}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '门店真实商品入口';
}

function entryActionText(entry: ClientDouyinLifeOrderEntry) {
  if (entry.landingUrl) {
    return '去抖音下单';
  }
  if (entry.landingPath) {
    return '复制入口路径';
  }
  return '入口待配置';
}

async function loadEntries() {
  loading.value = true;
  loadFailed.value = false;
  copiedEntryId.value = '';
  try {
    entries.value = await listDouyinLifeOrderEntries(storeId.value || undefined);
  } catch {
    entries.value = [];
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
}

function copyEntry(entry: ClientDouyinLifeOrderEntry) {
  const target = entryTarget(entry);
  if (!target) {
    uni.showToast({ title: '该套餐还未配置入口', icon: 'none' });
    return;
  }
  uni.setClipboardData({
    data: target,
    success: () => {
      copiedEntryId.value = entry.entryId;
      uni.showToast({ title: '入口已复制', icon: 'success' });
    },
  });
}

function openEntry(entry: ClientDouyinLifeOrderEntry) {
  const target = entryTarget(entry);
  if (!target) {
    uni.showToast({ title: '该套餐还未配置入口', icon: 'none' });
    return;
  }
  if (!entry.landingUrl) {
    copyEntry(entry);
    return;
  }
  // #ifdef H5
  window.location.href = entry.landingUrl;
  // #endif
  // #ifndef H5
  copyEntry(entry);
  // #endif
}

function retryLoad() {
  void loadEntries();
}

function goPickup() {
  uni.navigateTo({ url: '/pages/pickup/login/index' });
}

onLoad((query) => {
  storeId.value = normalizeStoreId(String(query?.storeId || ''));
});

onShow(loadEntries);
</script>

<template>
  <view class="page-shell">
    <view class="page-content stack">
      <view class="hero-panel hero-panel-compact douyin-order-hero">
        <view class="brand-row">
          <view class="brand-lockup">
            <view class="brand-mark">影</view>
            <text class="brand-name">影约云</text>
          </view>
          <text class="chip chip-neutral">DOUYIN_LIFE</text>
        </view>
        <view class="hero-title">预约拍摄与真实下单</view>
        <view class="hero-copy">
          这里展示门店在后台配置的抖音来客真实商品入口。支付仍在抖音来客完成，支付后订单同步到影约云。
        </view>
        <view class="hero-meta">
          <text class="hero-meta-chip">来客商品页支付</text>
          <text class="hero-meta-chip">订单同步</text>
          <text class="hero-meta-chip">拍完取片</text>
        </view>
      </view>

      <view class="surface-card douyin-order-status">
        <view>
          <view class="section-title">{{ entrySummary }}</view>
          <view class="subtitle">
            客户先完成下单，门店上传照片后再用手机号和取片码进入相册。
          </view>
        </view>
        <button class="mini-action" @click="goPickup">去取片</button>
      </view>

      <view v-if="loading" class="stack">
        <view class="card skeleton-card">
          <view class="skeleton-line" style="width: 60%"></view>
          <view class="skeleton-line" style="width: 84%"></view>
          <view class="skeleton-line" style="width: 46%"></view>
        </view>
      </view>

      <view v-else-if="entries.length" class="stack">
        <view v-for="entry in entries" :key="entry.entryId" class="card douyin-order-card">
          <view class="douyin-order-card-head">
            <view class="douyin-order-badge">抖音来客</view>
            <text class="chip chip-neutral">{{ entry.channelType }}</text>
          </view>
          <view class="douyin-order-title">{{ entry.title }}</view>
          <view class="douyin-order-meta">{{ entryMeta(entry) }}</view>
          <view class="douyin-order-target">{{ entryTarget(entry) || '后台尚未配置入口链接或路径' }}</view>
          <view class="douyin-order-actions">
            <button class="button-primary douyin-order-action" @click="openEntry(entry)">
              {{ entryActionText(entry) }}
            </button>
            <button class="button-secondary douyin-order-action" @click="copyEntry(entry)">
              {{ copiedEntryId === entry.entryId ? '已复制' : '复制入口' }}
            </button>
          </view>
        </view>
      </view>

      <view v-else class="card empty-state">
        <view class="empty-visual"></view>
        <view class="state-title">{{ loadFailed ? '下单入口加载失败' : '暂无可下单套餐' }}</view>
        <view class="state-copy">
          请确认后台“抖音来客 - 真实下单入口配置”已维护商品 ID、SKU、POI 和入口链接。
        </view>
        <view class="album-recovery-actions">
          <button class="button-secondary" @click="retryLoad">{{ loadFailed ? '重新加载' : '刷新入口' }}</button>
          <button class="button-ghost" @click="goPickup">我已下单，去取片</button>
        </view>
      </view>
    </view>
  </view>
</template>
