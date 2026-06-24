<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { clearClientToken, hasClientToken, redirectToLoginWithCurrentPage } from '@/utils/auth';
import { getThumbnailDisplayUrl, listAlbums } from '@/api/clientPhoto';
import type { ClientPhotoAlbum, ClientPhotoId } from '@/types/clientPhoto';
import { clearClientPhotoCache } from '@/utils/clientPhotoCache';
import previewState from '@/pages/pickup/preview/preview-state.mjs';
import {
  getAlbumActionLabel,
  getAlbumAvailabilityLabel,
  getAlbumDeliverySteps,
  getAlbumListRecoverySteps,
} from '@/pages/pickup/albums/album-state.mjs';

const loading = ref(false);
const albums = ref<ClientPhotoAlbum[]>([]);
const coverPreviewMap = ref<Record<string, string>>({});
const coverLoadMap = ref<Record<string, 'waiting' | 'loading' | 'ready' | 'loaded' | 'error'>>({});
const emptyMessage = ref('暂无相册');
const loadFailed = ref(false);
let albumLoadSeq = 0;
const albumSummary = computed(() => {
  if (loading.value) {
    return '正在加载可访问相册';
  }
  if (loadFailed.value) {
    return '相册加载失败';
  }
  return albums.value.length ? `${albums.value.length} 份可访问相册` : '当前账号暂无可访问相册';
});
const readyAlbumCount = computed(() => albums.value.filter((album) => hasVisibleAssets(album)).length);
const waitingAlbumCount = computed(() => Math.max(albums.value.length - readyAlbumCount.value, 0));
const albumRecoverySteps = computed(() => getAlbumListRecoverySteps({ loadFailed: loadFailed.value }));

function hasVisibleAssets(album: ClientPhotoAlbum) {
  return Number(album.assetCount || 0) > 0;
}

function albumCoverCopy(album: ClientPhotoAlbum) {
  const count = Number(album.assetCount || 0);
  return count > 0 ? `${count} 张可见照片` : '照片准备中';
}

function mapKey(albumId: ClientPhotoId) {
  return String(albumId);
}

function channelLabel(channelType?: string) {
  const value = String(channelType || '').toUpperCase();
  if (value === 'WECHAT_MINI_APP') {
    return '微信取片';
  }
  if (value === 'DOUYIN_MINI_APP') {
    return '抖音取片';
  }
  if (value === 'DOUYIN_LIFE') {
    return '抖音来客';
  }
  if (value === 'H5') {
    return '网页取片';
  }
  return '门店交付';
}

async function signAlbumCoverBatch(batch: ClientPhotoAlbum[], seq: number) {
  await Promise.all(
    batch.map(async (album) => {
      const key = mapKey(album.albumId);
      if (seq !== albumLoadSeq) {
        return;
      }
      coverLoadMap.value = {
        ...coverLoadMap.value,
        [key]: 'loading',
      };
      try {
        const signed = await getThumbnailDisplayUrl(album.coverAssetId as string);
        if (seq !== albumLoadSeq) {
          return;
        }
        coverPreviewMap.value = {
          ...coverPreviewMap.value,
          [key]: signed.url,
        };
        coverLoadMap.value = {
          ...coverLoadMap.value,
          [key]: 'ready',
        };
      } catch {
        if (seq !== albumLoadSeq) {
          return;
        }
        coverLoadMap.value = {
          ...coverLoadMap.value,
          [key]: 'error',
        };
      }
    }),
  );
}

async function preloadAlbumCovers(payload: ClientPhotoAlbum[], seq: number) {
  const coverAlbums = payload.filter((album) => Boolean(album.coverAssetId));
  if (!coverAlbums.length) {
    return;
  }
  const batches = previewState.createAlbumCoverSigningBatches(coverAlbums, {
    firstBatchSize: 3,
    batchSize: 2,
  });
  for (const batch of batches) {
    if (seq !== albumLoadSeq) {
      return;
    }
    await signAlbumCoverBatch(batch, seq);
  }
}

function onCoverLoad(albumId: ClientPhotoId) {
  const key = mapKey(albumId);
  coverLoadMap.value = {
    ...coverLoadMap.value,
    [key]: 'loaded',
  };
}

function onCoverError(albumId: ClientPhotoId) {
  const key = mapKey(albumId);
  coverLoadMap.value = {
    ...coverLoadMap.value,
    [key]: 'error',
  };
}

async function loadAlbums() {
  if (!hasClientToken()) {
    redirectToLoginWithCurrentPage('pickup');
    return;
  }
  albumLoadSeq += 1;
  const seq = albumLoadSeq;
  loading.value = true;
  loadFailed.value = false;
  emptyMessage.value = '暂无相册';
  coverPreviewMap.value = {};
  coverLoadMap.value = {};
  try {
    const payload = await listAlbums();
    albums.value = payload;
    emptyMessage.value = albums.value.length ? '' : '当前账号暂时没有可访问的相册';
    void preloadAlbumCovers(payload, seq);
  } catch {
    albums.value = [];
    loadFailed.value = true;
    emptyMessage.value = '相册加载失败，请重新登录';
  } finally {
    loading.value = false;
  }
}

function retryLoad() {
  void loadAlbums();
}

function relogin() {
  logout();
}

function goDetail(albumId: ClientPhotoId) {
  uni.navigateTo({ url: `/pages/pickup/detail/index?albumId=${encodeURIComponent(String(albumId))}` });
}

function logout() {
  clearClientPhotoCache();
  clearClientToken();
  uni.redirectTo({ url: '/pages/pickup/login/index' });
}

onShow(loadAlbums);
</script>

<template>
  <view class="page-shell">
    <view class="page-content">
      <view class="page-head">
        <view style="min-width: 0">
          <view class="title">我的相册</view>
          <view class="subtitle">只展示当前手机号可访问的照片目录，点开即可继续选片。</view>
        </view>
        <button class="mini-action" @click="logout">退出</button>
      </view>
      <view v-if="!loading && albums.length" class="album-gallery-hero">
        <view class="album-gallery-copy">
          <text class="album-gallery-kicker">影约云交付</text>
          <text class="album-gallery-title">你的照片已经整理好</text>
          <text class="album-gallery-subtitle">相册只在授权时间内开放，预览和保存都会重新确认身份。</text>
        </view>
        <view class="album-gallery-rail">
          <view class="album-gallery-print album-gallery-print-one"></view>
          <view class="album-gallery-print album-gallery-print-two"></view>
          <view class="album-gallery-print album-gallery-print-three"></view>
        </view>
      </view>
      <view class="meta-row" style="margin-bottom: 4rpx">
        <text class="meta-chip meta-chip-strong">{{ albumSummary }}</text>
        <text class="meta-chip">限时有效</text>
        <text class="meta-chip">仅当前手机号可见</text>
      </view>

      <view v-if="!loading && albums.length" class="album-dashboard">
        <view class="album-dashboard-item">
          <text class="album-dashboard-label">全部相册</text>
          <text class="album-dashboard-value">{{ albums.length }}</text>
        </view>
        <view class="album-dashboard-item">
          <text class="album-dashboard-label">可查看</text>
          <text class="album-dashboard-value">{{ readyAlbumCount }}</text>
        </view>
        <view class="album-dashboard-item">
          <text class="album-dashboard-label">准备中</text>
          <text class="album-dashboard-value">{{ waitingAlbumCount }}</text>
        </view>
      </view>

      <view v-if="!loading && albums.length" class="album-status-line">
        短期授权保护原图，照片准备好后会自动出现在相册目录。
      </view>

      <view v-if="loading" class="stack">
        <view class="card skeleton-card">
          <view class="skeleton-line" style="width: 58%"></view>
          <view class="skeleton-line" style="width: 82%"></view>
          <view class="skeleton-line" style="width: 44%"></view>
        </view>
      </view>

      <view v-else-if="albums.length" class="stack">
        <view
          v-for="album in albums"
          :key="album.albumId"
          class="card album-card"
          :class="{ 'album-card-waiting': !hasVisibleAssets(album) }"
          @click="goDetail(album.albumId)"
        >
          <view class="album-cover">
            <image
              v-if="coverPreviewMap[mapKey(album.albumId)]"
              class="album-cover-image"
              :src="coverPreviewMap[mapKey(album.albumId)]"
              mode="aspectFill"
              lazy-load
              @load="onCoverLoad(album.albumId)"
              @error="onCoverError(album.albumId)"
            />
            <view v-if="!coverPreviewMap[mapKey(album.albumId)] || coverLoadMap[mapKey(album.albumId)] !== 'loaded'" class="album-cover-fallback">
              <view class="album-cover-matte"></view>
              <view class="album-cover-proof">
                <view class="album-cover-proof-frame"></view>
                <view class="album-cover-proof-lines">
                  <text></text>
                  <text></text>
                  <text></text>
                </view>
              </view>
              <view class="album-cover-label">
                {{ coverLoadMap[mapKey(album.albumId)] === 'error' ? '封面暂不可用' : getAlbumAvailabilityLabel(album) }}
              </view>
              <view class="album-cover-title">{{ album.title }}</view>
              <view class="album-cover-copy">{{ albumCoverCopy(album) }}</view>
            </view>
            <view class="album-cover-overlay">
              <text class="chip">{{ album.assetCount || 0 }} 张</text>
              <text class="chip chip-neutral">{{ getAlbumAvailabilityLabel(album) }}</text>
            </view>
          </view>
          <view class="album-meta">
            <view class="album-title">{{ album.title }}</view>
            <view class="album-subtitle">
              {{ album.customerName || '未命名客户' }} · {{ channelLabel(album.channelType) }}
            </view>
            <view class="album-footer">
              <text class="muted">有效期至 {{ album.expireTime || '未设置' }}</text>
              <text class="link-text">{{ getAlbumActionLabel(album) }}</text>
            </view>
            <view class="album-delivery-strip">
              <view
                v-for="step in getAlbumDeliverySteps(album)"
                :key="step.title"
                class="album-delivery-step"
                :class="{ 'album-delivery-step-active': step.active }"
              >
                <text class="album-delivery-dot"></text>
                <view class="album-delivery-copy">
                  <text class="album-delivery-title">{{ step.title }}</text>
                  <text class="album-delivery-subtitle">{{ step.copy }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="card empty-state">
        <view class="empty-visual"></view>
        <view class="state-title">{{ emptyMessage }}</view>
        <view class="state-copy">请确认手机号是否为下单或预约时预留的号码，也可以联系门店补发取片码。</view>
        <view class="album-recovery-panel">
          <view
            v-for="step in albumRecoverySteps"
            :key="step.title"
            class="album-recovery-step"
          >
            <text class="album-recovery-title">{{ step.title }}</text>
            <text class="album-recovery-copy">{{ step.copy }}</text>
          </view>
        </view>
        <view class="album-recovery-actions">
          <button class="button-secondary" @click="retryLoad">{{ loadFailed ? '重新加载' : '刷新相册' }}</button>
          <button class="button-ghost" @click="relogin">重新登录</button>
        </view>
      </view>
    </view>
  </view>
</template>
