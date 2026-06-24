<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getAlbum, getThumbnailDisplayUrl, submitAlbumSelection } from '@/api/clientPhoto';
import type { ClientPhotoAlbumDetail, ClientPhotoAsset, ClientPhotoId } from '@/types/clientPhoto';
import { getCachedAlbumDetail, setCachedAlbumDetail } from '@/utils/clientPhotoCache';
import { hasClientToken, redirectToLoginWithCurrentPage } from '@/utils/auth';
import previewState from '@/pages/pickup/preview/preview-state.mjs';
import detailState, { type AssetFilterKey } from '@/pages/pickup/detail/detail-state.mjs';

const albumId = ref('');
const loading = ref(false);
const loadError = ref('');
const detail = ref<ClientPhotoAlbumDetail | null>(null);
const previewMap = ref<Record<string, string>>({});
const previewErrorMap = ref<Record<string, string>>({});
const previewLoadMap = ref<Record<string, 'waiting' | 'loading' | 'ready' | 'loaded' | 'error'>>({});
const selectedAssetIds = ref<string[]>([]);
const submittingSelection = ref(false);
const activeAssetFilter = ref<AssetFilterKey>('all');
const lastSubmittedCount = ref(0);
let detailLoadSeq = 0;

const assets = computed(() => detail.value?.assets || []);
const assetFilterItems = computed(() => detailState.createAssetFilterItems(assets.value, selectedAssetIds.value, previewLoadMap.value));
const filteredAssets = computed(() => detailState.filterAssetsByKey(assets.value, activeAssetFilter.value, selectedAssetIds.value, previewLoadMap.value));
const activeFilterEmptyCopy = computed(() => detailState.getAssetFilterEmptyCopy(activeAssetFilter.value));
const selectedCount = computed(() => selectedAssetIds.value.length);
const backendSelectedCount = computed(() => Math.max(0, Number(detail.value?.selectedCount || 0)));
const effectiveSelectedCount = computed(() => Math.max(selectedCount.value, backendSelectedCount.value));
const selectedAssetSet = computed(() => new Set(selectedAssetIds.value));
const selectionSummary = computed(() => detailState.getSelectionSummary(effectiveSelectedCount.value, assets.value.length, lastSubmittedCount.value || backendSelectedCount.value, detail.value?.selectionStatus));
const selectionTimelineCopy = computed(() => detailState.getSelectionTimelineCopy(detail.value?.selectionStatus, detail.value?.lastSelectionSubmitTime));
const selectionActionState = computed(() => detailState.getSelectionActionState(detail.value?.selectionStatus, selectedCount.value, submittingSelection.value));
const selectionGuideContent = computed(() => detailState.getSelectionGuideContent(detail.value?.selectionStatus));
const assetCountLabel = computed(() => `${assets.value.length} 张`);
const deliveryStateLabel = computed(() => (assets.value.length ? '可取片' : '待开放'));
const deliveryStateCopy = computed(() => {
  if (assets.value.length) {
    return '照片已开放给当前手机号';
  }
  return '门店上传并开放后会自动显示';
});
const previewProgress = computed(() => previewState.getDetailPreviewProgress(assets.value, previewLoadMap.value));
const previewProgressLabel = computed(() => {
  const progress = previewProgress.value;
  if (!progress.total) {
    return '待上传';
  }
  if (progress.failed > 0) {
    return `${progress.failed} 张需重试`;
  }
  if (progress.prepared >= progress.total) {
    return '照片已准备';
  }
  return `已准备 ${progress.prepared}/${progress.total}`;
});
const deliveryNextStep = computed(() => detailState.getDeliveryNextStep({
  totalCount: assets.value.length,
  selectedCount: selectedCount.value,
  submittedCount: lastSubmittedCount.value || backendSelectedCount.value,
  previewFailed: previewProgress.value.failed,
  selectionStatus: detail.value?.selectionStatus,
}));

function isSelected(asset: ClientPhotoAsset) {
  return selectedAssetSet.value.has(mapKey(asset.assetId));
}

function mapKey(id: ClientPhotoId) {
  return String(id);
}

function syncSelectedAssets(currentAssets: ClientPhotoAsset[]) {
  selectedAssetIds.value = currentAssets
    .filter((asset) => asset.selected === true || asset.selected === '1')
    .map((asset) => mapKey(asset.assetId));
}

function assetSelectedSequence(asset: ClientPhotoAsset) {
  return detailState.getSelectedSequence(asset, selectedAssetIds.value);
}

function setAssetFilter(filterKey: AssetFilterKey) {
  activeAssetFilter.value = filterKey;
}

async function signPreviewBatch(batch: ClientPhotoAsset[], seq: number) {
  await Promise.all(
    batch.map(async (asset) => {
      const assetKey = mapKey(asset.assetId);
      if (seq !== detailLoadSeq) {
        return;
      }
      previewLoadMap.value = {
        ...previewLoadMap.value,
        [assetKey]: 'loading',
      };
      try {
        const signed = await getThumbnailDisplayUrl(asset.assetId);
        if (seq !== detailLoadSeq) {
          return;
        }
        previewMap.value = {
          ...previewMap.value,
          [assetKey]: signed.url,
        };
        previewLoadMap.value = {
          ...previewLoadMap.value,
          [assetKey]: 'ready',
        };
      } catch (error: any) {
        if (seq !== detailLoadSeq) {
          return;
        }
        const nextState = previewState.applyDetailPreviewError(
          {
            previewLoadMap: previewLoadMap.value,
            previewErrorMap: previewErrorMap.value,
          },
          assetKey,
          error?.message || '图片加载失败',
        );
        previewLoadMap.value = nextState.previewLoadMap;
        previewErrorMap.value = nextState.previewErrorMap;
      }
    }),
  );
}

async function signPreviewsInBatches(currentAssets: ClientPhotoAsset[], seq: number) {
  const batches = previewState.createDetailPreviewSigningBatches(currentAssets, {
    firstBatchSize: 6,
    batchSize: 4,
  });
  for (const batch of batches) {
    if (seq !== detailLoadSeq) {
      return;
    }
    await signPreviewBatch(batch, seq);
  }
}

async function loadDetail(id: string) {
  if (!hasClientToken()) {
    redirectToLoginWithCurrentPage('pickup');
    return;
  }
  detailLoadSeq += 1;
  const seq = detailLoadSeq;
  loading.value = true;
  loadError.value = '';
  previewMap.value = {};
  previewErrorMap.value = {};
  previewLoadMap.value = {};
  try {
    const cachedDetail = getCachedAlbumDetail(id);
    const payload = cachedDetail || await getAlbum(id);
    detail.value = payload;
    syncSelectedAssets(payload.assets || []);
    if (!cachedDetail) {
      setCachedAlbumDetail(id, payload);
    }
  } catch (error: any) {
    detail.value = null;
    loadError.value = error?.message || '照片目录加载失败';
  } finally {
    loading.value = false;
  }

  const currentAssets = detail.value?.assets || [];
  if (seq === detailLoadSeq && currentAssets.length) {
    await signPreviewsInBatches(currentAssets, seq);
  }
}

function toggleSelect(asset: ClientPhotoAsset) {
  const assetKey = mapKey(asset.assetId);
  if (!assetKey || submittingSelection.value) {
    return;
  }
  if (selectionActionState.value.locked) {
    uni.showToast({ title: selectionActionState.value.toast, icon: 'none' });
    return;
  }
  if (selectedAssetSet.value.has(assetKey)) {
    selectedAssetIds.value = selectedAssetIds.value.filter((id) => id !== assetKey);
    lastSubmittedCount.value = 0;
    return;
  }
  selectedAssetIds.value = [...selectedAssetIds.value, assetKey];
  lastSubmittedCount.value = 0;
}

async function submitSelection() {
  if (selectionActionState.value.locked) {
    uni.showToast({ title: selectionActionState.value.toast, icon: 'none' });
    return;
  }
  if (!albumId.value || !selectedAssetIds.value.length || submittingSelection.value) {
    return;
  }
  submittingSelection.value = true;
  try {
    const payload = await submitAlbumSelection(albumId.value, selectedAssetIds.value);
    detail.value = payload;
    syncSelectedAssets(payload.assets || []);
    lastSubmittedCount.value = selectedAssetIds.value.length;
    setCachedAlbumDetail(albumId.value, payload);
    uni.showToast({ title: '选片已提交', icon: 'success' });
  } catch (error: any) {
    uni.showToast({ title: error?.message || '提交选片失败', icon: 'none' });
  } finally {
    submittingSelection.value = false;
  }
}

function onPreviewLoad(assetId: ClientPhotoId) {
  const assetKey = mapKey(assetId);
  previewLoadMap.value = {
    ...previewLoadMap.value,
    [assetKey]: 'loaded',
  };
}

function onPreviewError(assetId: ClientPhotoId) {
  const assetKey = mapKey(assetId);
  previewLoadMap.value = {
    ...previewLoadMap.value,
    [assetKey]: 'error',
  };
}

function assetPreviewStateLabel(asset: ClientPhotoAsset) {
  const tileState = detailState.getAssetTileActionState(asset, selectedAssetIds.value, previewLoadMap.value, detail.value?.selectionStatus);
  if (tileState.previewLabel) {
    return tileState.previewLabel;
  }
  const state = previewLoadMap.value[mapKey(asset.assetId)];
  if (state === 'error') {
    return '预览暂不可用';
  }
  if (state === 'loaded') {
    return isSelected(asset) ? '已选择' : '可预览';
  }
  if (state === 'ready') {
    return '加载照片中';
  }
  return state === 'loading' ? '生成预览中' : '等待加载';
}

function assetPreviewStateCopy(asset: ClientPhotoAsset) {
  const state = previewLoadMap.value[mapKey(asset.assetId)];
  if (state === 'error') {
    return '可进入大图页重试';
  }
  if (state === 'loaded') {
    return '短期授权图片';
  }
  if (state === 'ready') {
    return '正在显示照片';
  }
  return '正在准备照片';
}

function assetCornerLabel(asset: ClientPhotoAsset) {
  const tileState = detailState.getAssetTileActionState(asset, selectedAssetIds.value, previewLoadMap.value, detail.value?.selectionStatus);
  if (tileState.cornerLabel) {
    return tileState.cornerLabel;
  }
  const state = previewLoadMap.value[mapKey(asset.assetId)];
  if (state === 'error') {
    return '待重试';
  }
  if (state === 'loading') {
    return '加载中';
  }
  if (state === 'ready') {
    return '加载中';
  }
  return '可预览';
}

function assetActionLabel(asset: ClientPhotoAsset) {
  const tileState = detailState.getAssetTileActionState(asset, selectedAssetIds.value, previewLoadMap.value, detail.value?.selectionStatus);
  if (tileState.locked) {
    return '查看保存';
  }
  const state = previewLoadMap.value[mapKey(asset.assetId)];
  if (state === 'error') {
    return '进入重试';
  }
  if (state === 'loading') {
    return '准备中';
  }
  return '查看大图';
}

function assetSelectButtonLabel(asset: ClientPhotoAsset) {
  return detailState.getAssetTileActionState(asset, selectedAssetIds.value, previewLoadMap.value, detail.value?.selectionStatus).actionLabel;
}

function showAssetSequenceBadge(asset: ClientPhotoAsset) {
  return detailState.getAssetTileActionState(asset, selectedAssetIds.value, previewLoadMap.value, detail.value?.selectionStatus).showSequence;
}

function handleAssetButton(asset: ClientPhotoAsset) {
  if (selectionActionState.value.locked) {
    openPreview(asset);
    return;
  }
  toggleSelect(asset);
}

function retryLoadDetail() {
  if (albumId.value) {
    void loadDetail(albumId.value);
  }
}

function handleDeliveryNextAction() {
  const tone = deliveryNextStep.value.tone;
  if (tone === 'waiting') {
    retryLoadDetail();
    return;
  }
  if (tone === 'warning') {
    setAssetFilter('error');
    return;
  }
  if (tone === 'submit') {
    void submitSelection();
    return;
  }
  if (tone === 'ready') {
    setAssetFilter('pending');
    return;
  }
  setAssetFilter('selected');
}

function goAlbums() {
  uni.redirectTo({ url: '/pages/pickup/albums/index' });
}

function openPreview(asset: ClientPhotoAsset) {
  const currentAlbumId = albumId.value;
  if (!currentAlbumId) {
    return;
  }
  uni.navigateTo({
    url: `/pages/pickup/preview/index?albumId=${encodeURIComponent(currentAlbumId)}&assetId=${encodeURIComponent(mapKey(asset.assetId))}`,
  });
}

onLoad((query) => {
  const id = String(query?.albumId || '').trim();
  if (!id) {
    uni.redirectTo({ url: '/pages/pickup/albums/index' });
    return;
  }
  albumId.value = id;
  void loadDetail(id);
});
</script>

<template>
  <view class="page-shell">
    <view class="page-content">
      <view v-if="loading" class="stack">
        <view class="card skeleton-card">
          <view class="skeleton-line" style="width: 64%"></view>
          <view class="skeleton-line" style="width: 44%"></view>
        </view>
        <view class="grid">
          <view class="skeleton-block"></view>
          <view class="skeleton-block"></view>
        </view>
      </view>

      <view v-else-if="loadError" class="card error-state">
        <view class="empty-visual"></view>
        <view class="state-title">照片目录加载失败</view>
        <view class="state-copy">{{ loadError }}</view>
        <button class="button-secondary" @click="retryLoadDetail">重新加载</button>
      </view>

      <template v-else-if="detail">
        <view class="surface-card detail-summary-card">
          <view class="detail-summary-topline">
            <text class="detail-summary-kicker">本次照片目录</text>
            <text class="detail-state-pill">{{ deliveryStateLabel }}</text>
          </view>
          <view class="row detail-head-row">
            <view style="min-width: 0">
              <view class="section-title">{{ detail.title }}</view>
              <view class="muted" style="margin-top: 10rpx">有效期至 {{ detail.expireTime || '未设置' }}</view>
            </view>
            <text class="chip">{{ assetCountLabel }}</text>
          </view>
          <view class="detail-guidance">
            <text>{{ deliveryStateCopy }}</text>
            <text class="detail-guidance-chip">{{ previewProgressLabel }}</text>
          </view>
          <view class="detail-hero-strip">
            <view class="detail-hero-print detail-hero-print-main"></view>
            <view class="detail-hero-copy">
              <text class="detail-hero-title">已按门店交付顺序整理</text>
              <text class="detail-hero-subtitle">点开照片可看大图，也可以按喜欢的顺序选择精修片。</text>
            </view>
          </view>
          <view class="delivery-proof-grid">
            <view class="delivery-proof-item">
              <text class="delivery-proof-label">照片总数</text>
              <text class="delivery-proof-value">{{ assetCountLabel }}</text>
            </view>
            <view class="delivery-proof-item">
              <text class="delivery-proof-label">预览状态</text>
              <text class="delivery-proof-value">{{ previewProgressLabel }}</text>
            </view>
            <view class="delivery-proof-item">
              <text class="delivery-proof-label">选片进度</text>
              <text class="delivery-proof-value">{{ effectiveSelectedCount }} 张</text>
            </view>
          </view>
          <view class="delivery-next-panel" :class="`delivery-next-panel-${deliveryNextStep.tone}`">
            <view class="delivery-next-copy">
              <text class="delivery-next-eyebrow">下一步</text>
              <text class="delivery-next-title">{{ deliveryNextStep.title }}</text>
              <text class="delivery-next-subtitle">{{ deliveryNextStep.subtitle }}</text>
            </view>
            <button class="delivery-next-action" @click="handleDeliveryNextAction">{{ deliveryNextStep.action }}</button>
          </view>
          <view v-if="assets.length" class="selection-guide-panel">
            <view v-for="(step, index) in selectionGuideContent.steps" :key="step" class="selection-guide-step">
              <text class="selection-guide-index">{{ String(index + 1).padStart(2, '0') }}</text>
              <text class="selection-guide-title">{{ step }}</text>
            </view>
            <text class="selection-guide-note">{{ selectionGuideContent.note }}</text>
          </view>
        </view>

        <view v-if="assets.length" class="asset-filter-bar">
          <button
            v-for="item in assetFilterItems"
            :key="item.key"
            class="asset-filter-button"
            :class="{ 'asset-filter-button-active': activeAssetFilter === item.key }"
            @click="setAssetFilter(item.key)"
          >
            <text class="asset-filter-label">{{ item.label }}</text>
            <text class="asset-filter-count">{{ item.count }}</text>
          </button>
        </view>

        <view v-if="filteredAssets.length" class="grid">
          <view
            v-for="asset in filteredAssets"
            :key="asset.assetId"
            class="asset-tile"
            :class="{
              'asset-tile-error': previewLoadMap[mapKey(asset.assetId)] === 'error',
              'asset-tile-selected': isSelected(asset),
            }"
            @click="openPreview(asset)"
          >
            <view class="asset-thumb-wrap">
              <text class="asset-corner-chip">{{ assetCornerLabel(asset) }}</text>
              <text v-if="showAssetSequenceBadge(asset)" class="asset-sequence-badge">{{ assetSelectedSequence(asset) }}</text>
              <button
                class="asset-select-button"
                :class="{ 'asset-select-button-active': isSelected(asset) }"
                @click.stop="handleAssetButton(asset)"
              >
                {{ assetSelectButtonLabel(asset) }}
              </button>
              <view v-if="previewLoadMap[mapKey(asset.assetId)] !== 'loaded'" class="asset-thumb asset-thumb-empty">
                <view class="asset-thumb-placeholder">
                  <view class="asset-thumb-mark"></view>
                  <view class="asset-thumb-title">{{ assetPreviewStateLabel(asset) }}</view>
                  <view class="asset-thumb-copy">
                    {{ previewErrorMap[mapKey(asset.assetId)] || assetPreviewStateCopy(asset) }}
                  </view>
                </view>
              </view>
              <image
                v-if="previewMap[mapKey(asset.assetId)] && previewLoadMap[mapKey(asset.assetId)] !== 'error'"
                class="asset-thumb asset-thumb-image"
                :class="{ 'asset-thumb-image-loaded': previewLoadMap[mapKey(asset.assetId)] === 'loaded' }"
                :src="previewMap[mapKey(asset.assetId)]"
                mode="aspectFill"
                lazy-load
                @load="onPreviewLoad(asset.assetId)"
                @error="onPreviewError(asset.assetId)"
              />
            </view>
            <view class="asset-meta">
              <view class="asset-name">{{ asset.fileName || '未命名照片' }}</view>
              <view class="asset-state-row">
                <text class="asset-state-text">{{ assetPreviewStateLabel(asset) }}</text>
                <text class="asset-action-text">{{ assetActionLabel(asset) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else-if="assets.length" class="card empty-state asset-filter-empty">
          <view class="state-title">当前分类暂无照片</view>
          <view class="state-copy">{{ activeFilterEmptyCopy }}</view>
          <button class="button-secondary" @click="setAssetFilter('all')">查看全部</button>
        </view>
        <view v-if="assets.length" class="selection-submit-bar">
          <view class="selection-submit-copy">
            <text class="selection-submit-title">{{ selectionSummary.title }}</text>
            <text class="selection-submit-subtitle">{{ selectionSummary.subtitle }}</text>
            <text v-if="selectionTimelineCopy" class="selection-submit-time">{{ selectionTimelineCopy }}</text>
          </view>
          <button
            class="selection-submit-button"
            :disabled="selectionActionState.disabled"
            @click="submitSelection"
          >
            {{ selectionActionState.label }}
          </button>
        </view>
        <view v-if="assets.length" class="selection-submit-spacer"></view>
        <view v-else class="card empty-state empty-state-polished">
          <view class="empty-visual empty-visual-photo">
            <view class="empty-visual-inner"></view>
          </view>
          <view class="state-title">门店还未开放照片</view>
          <view class="state-copy">照片准备好以后会出现在这个相册里，取片码仍然有效。</view>
          <view class="empty-delivery-steps">
            <view class="empty-delivery-step empty-delivery-step-done">
              <text class="empty-delivery-dot"></text>
              <view>
                <view class="empty-delivery-title">相册已建立</view>
                <view class="empty-delivery-copy">当前手机号可以继续访问这个取片入口。</view>
              </view>
            </view>
            <view class="empty-delivery-step">
              <text class="empty-delivery-dot"></text>
              <view>
                <view class="empty-delivery-title">等待门店上传</view>
                <view class="empty-delivery-copy">底片开放后会自动出现在照片目录。</view>
              </view>
            </view>
            <view class="empty-delivery-step">
              <text class="empty-delivery-dot"></text>
              <view>
                <view class="empty-delivery-title">短期授权查看</view>
                <view class="empty-delivery-copy">预览和下载都会重新确认身份。</view>
              </view>
            </view>
          </view>
          <view class="empty-action-row">
            <button class="button-secondary" @click="retryLoadDetail">刷新状态</button>
            <button class="button-link empty-link-button" @click="goAlbums">返回相册</button>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
