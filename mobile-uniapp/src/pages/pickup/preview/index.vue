<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getAlbum, getDownloadUrl, getPreviewDisplayUrl, getStreamUrl } from '@/api/clientPhoto';
import { clearClientToken, getClientTokenValue, hasClientToken, redirectToLoginWithCurrentPage } from '@/utils/auth';
import type { ClientPhotoAsset } from '@/types/clientPhoto';
import { clearCachedSignedUrl, clearClientPhotoCache, getCachedAlbumDetail, setCachedAlbumDetail } from '@/utils/clientPhotoCache';
import previewState from './preview-state.mjs';

const albumId = ref('');
const assetId = ref('');
const previewUi = reactive(previewState.initPreviewState());
const albumTitle = ref('');
const albumAssets = ref<ClientPhotoAsset[]>([]);
const fileName = ref('');
const loading = ref(false);
const downloading = ref(false);
const errorMessage = ref('');
const downloadMessage = ref('');
const downloadHelpText = ref('');
const downloadFeedbackTitle = ref('');
const downloadMessageType = ref<'info' | 'success' | 'warning' | 'error'>('info');
const downloadLabel = ref('下载原图');
const isSwiping = ref(false);
const swipeStart = ref<{ x: number; y: number } | null>(null);
let previewLoadTimer: ReturnType<typeof setTimeout> | null = null;

const canDownload = computed(() =>
  previewState.canDownloadPreview({
    assetId: assetId.value,
    previewUrl: previewUi.previewUrl,
    imageLoaded: previewUi.imageLoaded,
    loading: loading.value,
    downloading: downloading.value,
  }),
);
const canOpenOriginalRatio = computed(() => Boolean(previewUi.previewUrl) && !loading.value);
const canSwipe = computed(() => albumAssets.value.length > 1);
const currentAssetIndex = computed(() => albumAssets.value.findIndex((asset) => String(asset.assetId) === assetId.value));
const totalAssets = computed(() => albumAssets.value.length);
const currentAssetLabel = computed(() => {
  const total = totalAssets.value;
  const position = currentAssetIndex.value >= 0 ? currentAssetIndex.value + 1 : 0;
  return total > 0 ? `${position} / ${total}` : '-- / --';
});
const previewProgressPercent = computed(() => {
  const total = totalAssets.value;
  const position = currentAssetIndex.value >= 0 ? currentAssetIndex.value + 1 : 0;
  if (!total || !position) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((position / total) * 100)));
});
const canGoPrev = computed(() => currentAssetIndex.value > 0);
const canGoNext = computed(() => currentAssetIndex.value >= 0 && currentAssetIndex.value < albumAssets.value.length - 1);
const previewErrorHelpText = computed(() => previewState.getPreviewErrorHelpText(previewUi.errorMessage || errorMessage.value));
function goBack() {
  const targetUrl = previewState.getPreviewBackUrl(albumId.value);
  if (getCurrentPages().length > 1) {
    uni.navigateBack({
      delta: 1,
      fail: () => {
        uni.redirectTo({ url: targetUrl });
      },
    });
    return;
  }
  uni.redirectTo({ url: targetUrl });
}

function clearPreviewLoadTimer() {
  if (previewLoadTimer) {
    clearTimeout(previewLoadTimer);
    previewLoadTimer = null;
  }
}

function isAuthStatus(statusCode: number) {
  return statusCode === 401 || statusCode === 403;
}

function handleDownloadAuthFailure() {
  // 清理当前账号的相册缓存，避免过期 token 残留会话数据。
  clearClientPhotoCache();
  clearClientToken();
  const feedback = previewState.getDownloadFailureFeedback('下载失败：403', { action: 'download' });
  downloadFeedbackTitle.value = feedback.title;
  downloadMessage.value = feedback.message;
  downloadHelpText.value = feedback.help;
  downloadMessageType.value = feedback.type;
  uni.showToast({ title: downloadMessage.value, icon: 'none' });
  setTimeout(() => {
    redirectToLoginWithCurrentPage('pickup');
  }, 300);
}

function updateDownloadLabel() {
  // #ifdef MP-WEIXIN || MP-TOUTIAO
  downloadLabel.value = '保存图片';
  // #endif
  // #ifdef H5
  downloadLabel.value = '下载原图';
  // #endif
}

async function loadPreview(currentAlbumId: string, id: string) {
  if (!hasClientToken()) {
    redirectToLoginWithCurrentPage('pickup');
    return;
  }
  loading.value = true;
  clearPreviewLoadTimer();
  previewState.resetPreviewImageState(previewUi);
  previewUi.previewUrl = '';
  errorMessage.value = '';
  try {
    const cachedAlbum = getCachedAlbumDetail(currentAlbumId);
    const albumPromise = cachedAlbum
      ? Promise.resolve(cachedAlbum)
      : getAlbum(currentAlbumId).then((payload) => {
          setCachedAlbumDetail(currentAlbumId, payload);
          return payload;
        });
    const previewPromise = getPreviewDisplayUrl(id);
    const [album, preview] = await Promise.all([albumPromise, previewPromise]);
    albumTitle.value = album.title;
    albumAssets.value = Array.isArray(album.assets) ? album.assets : [];
    previewUi.previewUrl = preview.url;
    const detailAsset = albumAssets.value.find((asset) => String(asset.assetId) === id);
    fileName.value = preview.fileName || detailAsset?.fileName || `photo-${id}.jpg`;
  } catch (error: any) {
    previewUi.previewUrl = '';
    previewUi.errorMessage = error?.message || '图片不存在或无权限访问';
    errorMessage.value = previewUi.errorMessage;
  } finally {
    loading.value = false;
  }
}

function retryLoadPreview() {
  if (albumId.value && assetId.value) {
    void loadPreview(albumId.value, assetId.value);
  }
}

function openNeighborAsset(step: number) {
  const index = currentAssetIndex.value;
  const nextAsset = albumAssets.value[index + step];
  if (!albumId.value || !nextAsset) {
    if (albumAssets.value.length > 1) {
      uni.showToast({
        title: step > 0 ? '已经是最后一张' : '已经是第一张',
        icon: 'none',
      });
    }
    return;
  }
  uni.redirectTo({
    url: `/pages/pickup/preview/index?albumId=${encodeURIComponent(albumId.value)}&assetId=${encodeURIComponent(String(nextAsset.assetId))}`,
  });
}

function onPreviewImageLoad() {
  clearPreviewLoadTimer();
  previewLoadTimer = setTimeout(() => {
    previewState.applyPreviewImageLoad(previewUi);
    previewLoadTimer = null;
  }, 180);
}

function onPreviewImageError() {
  clearPreviewLoadTimer();
  previewState.applyPreviewImageError(previewUi);
  errorMessage.value = previewUi.errorMessage;
}

function onPreviewTouchStart(event: TouchEvent) {
  if (!canSwipe.value) {
    return;
  }
  const touch = event.touches?.[0];
  if (!touch) {
    return;
  }
  swipeStart.value = { x: touch.clientX, y: touch.clientY };
  isSwiping.value = true;
}

function onPreviewTouchEnd(event: TouchEvent) {
  if (!swipeStart.value) {
    isSwiping.value = false;
    return;
  }
  const touch = event.changedTouches?.[0];
  if (!touch) {
    swipeStart.value = null;
    isSwiping.value = false;
    return;
  }
  const deltaX = touch.clientX - swipeStart.value.x;
  const deltaY = touch.clientY - swipeStart.value.y;
  const horizontalEnough = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
  swipeStart.value = null;
  isSwiping.value = false;
  if (!horizontalEnough) {
    return;
  }
  if (deltaX < 0) {
    openNeighborAsset(1);
    return;
  }
  openNeighborAsset(-1);
}

function onPreviewTouchCancel() {
  swipeStart.value = null;
  isSwiping.value = false;
}

function openOriginalRatioPreview() {
  if (!previewUi.previewUrl) {
    uni.showToast({ title: '照片暂时无法预览', icon: 'none' });
    return;
  }
  const urls = albumAssets.value.length
    ? albumAssets.value
        .map((asset) => (String(asset.assetId) === assetId.value ? previewUi.previewUrl : ''))
        .filter(Boolean)
    : [previewUi.previewUrl];
  uni.previewImage({
    urls: urls.length ? urls : [previewUi.previewUrl],
    current: previewUi.previewUrl,
    fail: () => {
      uni.showToast({ title: '原比例预览暂不可用', icon: 'none' });
    },
  });
}

async function download() {
  if (!canDownload.value) {
    uni.showToast({ title: '照片暂时无法下载，请先重新加载预览', icon: 'none' });
    return;
  }
  downloading.value = true;
  downloadMessage.value = '';
  downloadHelpText.value = '';
  downloadFeedbackTitle.value = '';
  downloadMessageType.value = 'info';
  let signedDownloadUrl = '';
  try {
    const signedDownload = await getDownloadUrl(assetId.value);
    signedDownloadUrl = signedDownload.url;
    fileName.value = signedDownload.fileName || fileName.value || `photo-${assetId.value}.jpg`;
  } catch (error: any) {
    clearCachedSignedUrl(assetId.value, 'download');
    const feedback = previewState.getDownloadFailureFeedback(error?.message || '身份确认失败，请重试', { action: 'download' });
    downloadFeedbackTitle.value = feedback.title;
    downloadMessage.value = feedback.message;
    downloadHelpText.value = feedback.help;
    downloadMessageType.value = feedback.type;
    uni.showToast({ title: downloadMessage.value, icon: 'none' });
    if (feedback.shouldReauth) {
      handleDownloadAuthFailure();
    }
    downloading.value = false;
    return;
  }
  // #ifdef H5
  try {
    const response = await fetch(getStreamUrl(assetId.value), {
      headers: {
        'X-Client-Token': getClientTokenValue(),
      },
    });
    if (!response.ok) {
      if (isAuthStatus(response.status)) {
        handleDownloadAuthFailure();
        return;
      }
      throw new Error(`下载失败：${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName.value || `photo-${assetId.value}.jpg`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    downloadMessage.value = '下载已开始';
    downloadHelpText.value = `文件名：${fileName.value || `photo-${assetId.value}.jpg`}`;
    downloadFeedbackTitle.value = '处理成功';
    downloadMessageType.value = 'success';
  } catch (error: any) {
    if (signedDownloadUrl) {
      const link = document.createElement('a');
      link.href = signedDownloadUrl;
      link.download = fileName.value || `photo-${assetId.value}.jpg`;
      link.rel = 'noopener';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      downloadMessage.value = '已改用限时链接下载';
      downloadHelpText.value = '如果浏览器没有自动下载，请在新打开的页面里保存图片。';
      downloadFeedbackTitle.value = '备用下载已打开';
      downloadMessageType.value = 'warning';
      uni.showToast({ title: downloadMessage.value, icon: 'none' });
    } else {
      const feedback = previewState.getDownloadFailureFeedback(error?.message || '下载失败，请重试', { action: 'download' });
      downloadFeedbackTitle.value = feedback.title;
      downloadMessage.value = feedback.message;
      downloadHelpText.value = feedback.help;
      downloadMessageType.value = feedback.type;
      uni.showToast({ title: downloadMessage.value, icon: 'none' });
    }
  } finally {
    downloading.value = false;
  }
  // #endif

  // #ifdef MP-WEIXIN || MP-TOUTIAO
  let streamUrl = '';
  const downloadHeader: Record<string, string> = {};
  try {
    streamUrl = getStreamUrl(assetId.value);
    downloadHeader['X-Client-Token'] = getClientTokenValue();
  } catch (error: any) {
    const feedback = previewState.getDownloadFailureFeedback(error?.message || '下载地址生成失败', { action: 'download' });
    downloadFeedbackTitle.value = feedback.title;
    downloadMessage.value = feedback.message;
    downloadHelpText.value = feedback.help;
    downloadMessageType.value = feedback.type;
    uni.showToast({ title: downloadMessage.value, icon: 'none' });
    downloading.value = false;
    return;
  }
  uni.downloadFile({
    url: streamUrl,
    header: downloadHeader,
    success: (res) => {
      if (res.statusCode !== 200) {
        if (isAuthStatus(res.statusCode)) {
          handleDownloadAuthFailure();
          return;
        }
        const feedback = previewState.getDownloadFailureFeedback(`下载失败：${res.statusCode}`, { action: 'download' });
        downloadFeedbackTitle.value = feedback.title;
        downloadMessage.value = feedback.message;
        downloadHelpText.value = feedback.help;
        downloadMessageType.value = feedback.type;
        uni.showToast({ title: downloadMessage.value, icon: 'none' });
        return;
      }
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          downloadMessage.value = '已保存到相册';
          downloadHelpText.value = '可以在系统相册中查看原图。';
          downloadFeedbackTitle.value = '处理成功';
          downloadMessageType.value = 'success';
          uni.showToast({ title: '已保存到相册', icon: 'none' });
        },
        fail: (err) => {
          const feedback = previewState.getDownloadFailureFeedback(err.errMsg || '保存失败', { action: 'save' });
          downloadFeedbackTitle.value = feedback.title;
          downloadMessage.value = feedback.message;
          downloadHelpText.value = feedback.help;
          downloadMessageType.value = feedback.type;
          uni.showToast({ title: downloadMessage.value, icon: 'none' });
          // #ifdef MP-WEIXIN || MP-TOUTIAO
          if (feedback.shouldOpenSetting) {
            uni.showModal({
              title: feedback.title,
              content: feedback.message,
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting({});
                }
              },
            });
          }
          // #endif
        },
      });
    },
    fail: (err) => {
      const feedback = previewState.getDownloadFailureFeedback(err.errMsg || '下载失败', { action: 'download' });
      downloadFeedbackTitle.value = feedback.title;
      downloadMessage.value = feedback.message;
      downloadHelpText.value = feedback.help;
      downloadMessageType.value = feedback.type;
      uni.showToast({ title: downloadMessage.value, icon: 'none' });
    },
    complete: () => {
      downloading.value = false;
    },
  });
  // #endif
}

onLoad((query) => {
  updateDownloadLabel();
  const currentAlbumId = String(query?.albumId || '').trim();
  const id = String(query?.assetId || '').trim();
  if (!currentAlbumId || !id) {
    uni.redirectTo({ url: '/pages/pickup/albums/index' });
    return;
  }
  albumId.value = currentAlbumId;
  assetId.value = id;
  void loadPreview(currentAlbumId, id);
});

onBeforeUnmount(() => {
  clearPreviewLoadTimer();
});
</script>

<template>
  <view class="page-shell-dark">
    <view class="page-content">
      <view v-if="loading" class="stack">
        <view class="dark-card">
          <view class="skeleton-line" style="width: 62%"></view>
          <view class="skeleton-line" style="width: 38%"></view>
        </view>
        <view class="skeleton-block" style="height: 640rpx; background-color: #202629"></view>
      </view>
      <view v-else class="stack">
        <view
          v-if="previewUi.previewUrl"
          class="preview-stage"
          :class="{ 'is-swiping': isSwiping }"
          @touchstart="onPreviewTouchStart"
          @touchend="onPreviewTouchEnd"
          @touchcancel="onPreviewTouchCancel"
        >
          <view v-if="!previewUi.imageLoaded" class="preview-skeleton">
            <view class="preview-loading-label">原图加载中</view>
            <view class="preview-stage-skeleton">
              <view class="preview-skeleton-mark"></view>
              <view class="preview-skeleton-title">正在准备照片预览</view>
              <view class="preview-skeleton-copy">照片仅对当前手机号开放，打开前会确认身份。</view>
            </view>
          </view>
          <image
            :src="previewUi.previewUrl"
            mode="aspectFit"
            class="preview-image"
            @load="onPreviewImageLoad"
            @error="onPreviewImageError"
          />
        </view>
        <view v-else class="dark-card">
          <view class="preview-title">图片暂时无法预览</view>
          <view class="preview-copy">{{ previewUi.errorMessage || errorMessage || '预览地址获取失败，请稍后重试。' }}</view>
          <view class="preview-help-copy">{{ previewErrorHelpText }}</view>
          <view class="preview-error-actions">
            <button class="button-primary preview-action-primary" @click="retryLoadPreview">重新加载</button>
            <button class="button-ghost preview-action-secondary" @click="goBack">返回目录</button>
          </view>
        </view>

        <view class="preview-panel">
          <view class="preview-meta-row">
            <text class="preview-safe-chip">安全查看</text>
            <view class="preview-meta-actions">
              <button v-if="canOpenOriginalRatio" class="preview-inline-action" @click="openOriginalRatioPreview">原比例查看</button>
              <text class="dark-muted">限时有效</text>
            </view>
          </view>
          <view v-if="canSwipe" class="preview-swipe-tip">
            <text>左右滑动切换照片，也可以使用下方按钮。</text>
          </view>
          <view class="preview-gallery-caption">
            <text class="preview-gallery-caption-title">看片模式</text>
            <text class="preview-gallery-caption-copy">轻触查看原比例，长按或保存用于交付留存。</text>
          </view>
          <view class="preview-panel-head">
            <view style="min-width: 0">
              <view class="preview-title">{{ fileName || '照片预览' }}</view>
              <view class="preview-copy">{{ albumTitle || '当前相册' }}</view>
            </view>
            <text class="preview-index-chip">{{ currentAssetLabel }}</text>
          </view>
          <view class="preview-progress-track">
            <view class="preview-progress-fill" :style="{ width: `${previewProgressPercent}%` }"></view>
          </view>
          <view class="preview-copy preview-security-copy">保存原图前会确认身份，下载地址不会长期保存。</view>
          <view class="preview-file-context">
            <view class="preview-file-context-item">
              <text class="preview-file-context-label">当前文件</text>
              <text class="preview-file-name">{{ fileName || '照片预览' }}</text>
            </view>
            <view class="preview-file-context-item">
              <text class="preview-file-context-label">访问凭证</text>
              <text class="preview-file-context-value">限时签名</text>
            </view>
            <view class="preview-file-context-item">
              <text class="preview-file-context-label">相册位置</text>
              <text class="preview-file-context-value">{{ currentAssetLabel }}</text>
            </view>
          </view>
          <view class="preview-nav-row">
            <button class="button-secondary preview-nav-button" :disabled="loading || !canGoPrev" @click="openNeighborAsset(-1)">上一张</button>
            <button class="button-secondary preview-nav-button" :disabled="loading || !canGoNext" @click="openNeighborAsset(1)">下一张</button>
          </view>
          <view class="preview-action-row preview-action-row-compact">
            <button class="button-primary preview-action-primary" :loading="downloading" :disabled="!canDownload" @click="download">
              {{ downloading ? '处理中...' : downloadLabel }}
            </button>
            <button class="button-ghost preview-action-secondary" @click="goBack">返回目录</button>
          </view>
          <view class="preview-save-note">
            <text>保存原图会重新校验当前取片身份，不会在页面里暴露后台地址或长期 OSS 链接。</text>
          </view>
          <view v-if="downloadMessage" class="download-feedback" :class="`download-feedback-${downloadMessageType}`">
            <text class="download-feedback-title">
              {{ downloadFeedbackTitle || (downloadMessageType === 'success' ? '处理成功' : downloadMessageType === 'warning' ? '需要确认' : downloadMessageType === 'error' ? '处理失败' : '处理状态') }}
            </text>
            <text class="download-feedback-copy">{{ downloadMessage }}</text>
            <text v-if="downloadHelpText" class="download-feedback-help">{{ downloadHelpText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
