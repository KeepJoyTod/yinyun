<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const targetUrl = ref('');
const pageTitle = ref('外部页面');

const safeUrl = computed(() => {
  const value = targetUrl.value.trim();
  return /^https?:\/\//i.test(value) ? value : '';
});

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

onLoad((query?: Record<string, string | undefined>) => {
  const rawUrl = String(query?.url || '');
  const rawTitle = String(query?.title || '');
  targetUrl.value = rawUrl ? safeDecode(rawUrl) : '';
  pageTitle.value = rawTitle ? safeDecode(rawTitle) : '外部页面';
  uni.setNavigationBarTitle({ title: pageTitle.value });
});

function copyUrl() {
  if (!safeUrl.value) {
    uni.showToast({ title: '暂无可复制链接', icon: 'none' });
    return;
  }
  uni.setClipboardData({
    data: safeUrl.value,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
  });
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' });
}
</script>

<template>
  <view class="webview-page">
    <web-view v-if="safeUrl" class="external-webview" :src="safeUrl" />
    <view v-else class="page-shell webview-fallback">
      <view class="page-content">
        <view class="surface-card webview-state-card">
          <view class="empty-visual"><view class="empty-visual-inner" /></view>
          <text class="state-title">外部链接不可打开</text>
          <text class="state-copy">请确认菜单配置的是 http 或 https 链接。小程序 WebView 还需要在平台后台配置业务域名。</text>
          <view class="webview-action-row">
            <button class="button-secondary webview-action" @tap="copyUrl">复制链接</button>
            <button class="button-primary webview-action" @tap="goHome">返回首页</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.webview-page,
.external-webview {
  width: 100%;
  min-height: 100dvh;
}

.webview-fallback {
  display: flex;
  align-items: center;
}

.webview-state-card {
  padding: 52rpx 32rpx;
  text-align: center;
}

.webview-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}

.webview-action {
  margin-top: 0;
}

@media (max-width: 360px) {
  .webview-action-row {
    grid-template-columns: 1fr;
  }
}
</style>
