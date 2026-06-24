import { request } from './request';
import type {
  ClientDouyinLifeOrderEntry,
  ClientPhotoAlbum,
  ClientPhotoAlbumDetail,
  ClientPhotoId,
  ClientPhotoSendCodeResult,
  ClientPhotoSignedUrl,
  ClientPhotoToken,
  PhotoPlatform,
} from '@/types/clientPhoto';
import {
  getCachedSignedUrl,
  setCachedSignedUrl,
  type CachedSignedUrlKind,
} from '@/utils/clientPhotoCache';
import { getClientTokenValue } from '@/utils/auth';
const root = '/client/photo';
const douyinLifeOrderEntriesPath = '/client/douyin-life/order-entries';

export function sendCode(phone: string, platform: PhotoPlatform) {
  return request<ClientPhotoSendCodeResult>({
    method: 'POST',
    url: `${root}/auth/send-code`,
    token: false,
    data: { phone, platform },
  });
}

export function verifyPickupCode(phone: string, code: string, platform: PhotoPlatform) {
  return request<ClientPhotoToken>({
    method: 'POST',
    url: `${root}/auth/verify`,
    token: false,
    data: { phone, code, platform },
  });
}

export function platformLogin(payload: {
  platform: PhotoPlatform;
  loginCode?: string;
  phoneCode?: string;
  phone?: string;
}) {
  return request<ClientPhotoToken>({
    method: 'POST',
    url: `${root}/auth/platform-login`,
    token: false,
    data: payload,
  });
}

export function listAlbums() {
  return request<ClientPhotoAlbum[]>({
    url: `${root}/albums`,
  });
}

export function listDouyinLifeOrderEntries(storeId?: string | number) {
  const query = storeId ? `?storeId=${encodeURIComponent(String(storeId))}` : '';
  return request<ClientDouyinLifeOrderEntry[]>({
    url: `${douyinLifeOrderEntriesPath}${query}`,
    token: false,
  });
}

function toPathId(id: ClientPhotoId) {
  return encodeURIComponent(String(id));
}

export function getAlbum(albumId: ClientPhotoId) {
  return request<ClientPhotoAlbumDetail>({
    url: `${root}/albums/${toPathId(albumId)}`,
  });
}

export function submitAlbumSelection(albumId: ClientPhotoId, assetIds: ClientPhotoId[]) {
  return request<ClientPhotoAlbumDetail>({
    method: 'POST',
    url: `${root}/albums/${toPathId(albumId)}/selection`,
    data: {
      assetIds: assetIds.map((assetId) => String(assetId)),
    },
  });
}

export function getPreviewUrl(assetId: ClientPhotoId) {
  return getSignedUrl('preview', assetId);
}

export function getPreviewDisplayUrl(assetId: ClientPhotoId) {
  return resolveDisplayImageUrl(assetId, getPreviewUrl(assetId));
}

export function getThumbnailUrl(assetId: ClientPhotoId) {
  const assetKey = String(assetId);
  const cached = getCachedSignedUrl(assetKey, 'thumbnail');
  if (cached) {
    return Promise.resolve(cached);
  }
  return request<ClientPhotoSignedUrl>({
    url: `${root}/assets/${toPathId(assetId)}/thumbnail-url`,
    silent: true,
  }).then((payload) => {
    setCachedSignedUrl(assetKey, 'thumbnail', payload);
    return payload;
  }).catch(() => getSignedUrl('preview', assetId).then((payload) => {
    setCachedSignedUrl(assetKey, 'thumbnail', payload);
    return payload;
  }));
}

export function getThumbnailDisplayUrl(assetId: ClientPhotoId) {
  return resolveDisplayImageUrl(assetId, getThumbnailUrl(assetId));
}

export function getDownloadUrl(assetId: ClientPhotoId) {
  return getSignedUrl('download', assetId);
}

function getSignedUrl(kind: CachedSignedUrlKind, assetId: ClientPhotoId) {
  const assetKey = String(assetId);
  const cached = getCachedSignedUrl(assetKey, kind);
  if (cached) {
    return Promise.resolve(cached);
  }
  const pathMap: Record<CachedSignedUrlKind, string> = {
    thumbnail: 'thumbnail-url',
    preview: 'preview-url',
    download: 'download-url',
  };
  return request<ClientPhotoSignedUrl>({
    url: `${root}/assets/${toPathId(assetId)}/${pathMap[kind]}`,
  }).then((payload) => {
    setCachedSignedUrl(assetKey, kind, payload);
    return payload;
  });
}

export function getStreamUrl(assetId: ClientPhotoId) {
  let baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  // #ifdef MP-WEIXIN || MP-TOUTIAO
  if (!baseUrl) {
    throw new Error('小程序 API 域名未配置');
  }
  // #endif
  const path = `${root}/assets/${toPathId(assetId)}/stream`;
  return `${baseUrl}${path}`;
}

function resolveDisplayImageUrl(assetId: ClientPhotoId, signedUrlPromise: Promise<ClientPhotoSignedUrl>) {
  // #ifdef MP-WEIXIN || MP-TOUTIAO
  return signedUrlPromise.then((payload) =>
    downloadStreamImage(assetId).then((tempFilePath) => ({
      ...payload,
      url: tempFilePath,
    })),
  );
  // #endif
  // #ifndef MP-WEIXIN || MP-TOUTIAO
  return signedUrlPromise;
  // #endif
}

function downloadStreamImage(assetId: ClientPhotoId): Promise<string> {
  let streamUrl = '';
  try {
    streamUrl = getStreamUrl(assetId);
  } catch (error) {
    return Promise.reject(error);
  }
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: streamUrl,
      header: {
        'X-Client-Token': getClientTokenValue(),
      },
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          resolve(res.tempFilePath);
          return;
        }
        reject(new Error(`图片加载失败：${res.statusCode || 'unknown'}`));
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '图片加载失败'));
      },
    });
  });
}
