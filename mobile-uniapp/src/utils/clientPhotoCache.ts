import { getClientTokenValue } from '@/utils/auth';
import type { ClientPhotoAlbumDetail, ClientPhotoSignedUrl } from '@/types/clientPhoto';

const ALBUM_DETAIL_TTL_MS = 10 * 60 * 1000;
const ALBUM_DETAIL_CACHE_PREFIX = 'yy_photo_album_detail_cache';
const SIGNED_URL_CACHE_PREFIX = 'yy_photo_signed_url_cache';

export type CachedSignedUrlKind = 'thumbnail' | 'preview' | 'download';

interface CachedAlbumDetailEntry {
  cachedAt: number;
  detail: ClientPhotoAlbumDetail;
}

interface CachedSignedUrlEntry {
  cachedAt: number;
  expiresAtMs: number;
  data: ClientPhotoSignedUrl;
}

const albumDetailCache = new Map<string, CachedAlbumDetailEntry>();
const signedUrlCache = new Map<string, CachedSignedUrlEntry>();

function readSessionStorage(key: string): string | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  } catch {
    // ignore storage quota / access errors
  }
}

function removeSessionStorage(key: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage access errors
  }
}

function removeSessionStorageByPrefix(prefix: string) {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage access errors
  }
}

function cacheScopeKey(albumId: string) {
  const token = getClientTokenValue();
  if (!token) {
    return '';
  }
  return `${token}::${albumId}`;
}

function cacheStorageKey(key: string) {
  return `${ALBUM_DETAIL_CACHE_PREFIX}::${key}`;
}

function signedUrlStorageKey(key: string) {
  return `${SIGNED_URL_CACHE_PREFIX}::${key}`;
}

function cacheScopeKeyForAsset(assetId: string, kind: CachedSignedUrlKind) {
  const token = getClientTokenValue();
  if (!token) {
    return '';
  }
  return `${token}::${kind}::${assetId}`;
}

function parseSignedUrlExpiresAt(data: ClientPhotoSignedUrl): number {
  const parsedExpiresAt = new Date(data.expiresAt).getTime();
  if (Number.isFinite(parsedExpiresAt)) {
    return parsedExpiresAt;
  }
  if (Number.isFinite(data.expiresIn) && data.expiresIn > 0) {
    return Date.now() + data.expiresIn * 1000;
  }
  return Date.now() + ALBUM_DETAIL_TTL_MS;
}

export function getCachedAlbumDetail(albumId: string): ClientPhotoAlbumDetail | null {
  const key = cacheScopeKey(albumId);
  if (!key) {
    return null;
  }
  const entry = albumDetailCache.get(key);
  if (!entry) {
    const cachedRaw = readSessionStorage(cacheStorageKey(key));
    if (!cachedRaw) {
      return null;
    }
    try {
      const cached = JSON.parse(cachedRaw) as CachedAlbumDetailEntry;
      if (!cached || typeof cached.cachedAt !== 'number' || !cached.detail) {
        removeSessionStorage(cacheStorageKey(key));
        return null;
      }
      if (Date.now() - cached.cachedAt > ALBUM_DETAIL_TTL_MS) {
        removeSessionStorage(cacheStorageKey(key));
        return null;
      }
      albumDetailCache.set(key, cached);
      return cached.detail;
    } catch {
      removeSessionStorage(cacheStorageKey(key));
      return null;
    }
  }
  if (Date.now() - entry.cachedAt > ALBUM_DETAIL_TTL_MS) {
    albumDetailCache.delete(key);
    removeSessionStorage(cacheStorageKey(key));
    return null;
  }
  return entry.detail;
}

export function setCachedAlbumDetail(albumId: string, detail: ClientPhotoAlbumDetail) {
  const key = cacheScopeKey(albumId);
  if (!key) {
    return;
  }
  albumDetailCache.set(key, {
    cachedAt: Date.now(),
    detail,
  });
  writeSessionStorage(
    cacheStorageKey(key),
    JSON.stringify({
      cachedAt: Date.now(),
      detail,
    } satisfies CachedAlbumDetailEntry),
  );
}

export function clearCachedAlbumDetail(albumId?: string) {
  const token = getClientTokenValue();
  if (!token) {
    return;
  }
  if (albumId) {
    const key = `${token}::${albumId}`;
    albumDetailCache.delete(key);
    removeSessionStorage(cacheStorageKey(key));
    return;
  }

  for (const key of albumDetailCache.keys()) {
    if (key.startsWith(`${token}::`)) {
      albumDetailCache.delete(key);
      removeSessionStorage(cacheStorageKey(key));
    }
  }
  removeSessionStorageByPrefix(`${ALBUM_DETAIL_CACHE_PREFIX}::${token}::`);
}

export function getCachedSignedUrl(assetId: string, kind: CachedSignedUrlKind): ClientPhotoSignedUrl | null {
  const key = cacheScopeKeyForAsset(assetId, kind);
  if (!key) {
    return null;
  }
  const entry = signedUrlCache.get(key);
  if (!entry) {
    const cachedRaw = readSessionStorage(signedUrlStorageKey(key));
    if (!cachedRaw) {
      return null;
    }
    try {
      const cached = JSON.parse(cachedRaw) as CachedSignedUrlEntry;
      if (!cached || typeof cached.cachedAt !== 'number' || typeof cached.expiresAtMs !== 'number' || !cached.data) {
        removeSessionStorage(signedUrlStorageKey(key));
        return null;
      }
      if (Date.now() >= cached.expiresAtMs) {
        removeSessionStorage(signedUrlStorageKey(key));
        return null;
      }
      signedUrlCache.set(key, cached);
      return cached.data;
    } catch {
      removeSessionStorage(signedUrlStorageKey(key));
      return null;
    }
  }
  if (Date.now() >= entry.expiresAtMs) {
    signedUrlCache.delete(key);
    removeSessionStorage(signedUrlStorageKey(key));
    return null;
  }
  return entry.data;
}

export function setCachedSignedUrl(assetId: string, kind: CachedSignedUrlKind, data: ClientPhotoSignedUrl) {
  const key = cacheScopeKeyForAsset(assetId, kind);
  if (!key) {
    return;
  }
  const entry = {
    cachedAt: Date.now(),
    expiresAtMs: parseSignedUrlExpiresAt(data),
    data,
  } satisfies CachedSignedUrlEntry;
  signedUrlCache.set(key, entry);
  writeSessionStorage(signedUrlStorageKey(key), JSON.stringify(entry));
}

export function clearCachedSignedUrl(assetId?: string, kind?: CachedSignedUrlKind) {
  const token = getClientTokenValue();
  if (!token) {
    return;
  }

  const deleteByKey = (key: string) => {
    signedUrlCache.delete(key);
    removeSessionStorage(signedUrlStorageKey(key));
  };

  if (assetId && kind) {
    deleteByKey(`${token}::${kind}::${assetId}`);
    return;
  }

  for (const key of signedUrlCache.keys()) {
    const matchesToken = key.startsWith(`${token}::`);
    const matchesAsset = !assetId || key.endsWith(`::${assetId}`);
    const matchesKind = !kind || key.includes(`::${kind}::`);
    if (matchesToken && matchesAsset && matchesKind) {
      deleteByKey(key);
    }
  }
  const prefix = `${SIGNED_URL_CACHE_PREFIX}::${token}::`;
  if (assetId || kind) {
    removeSessionStorageByPrefix(prefix);
  } else {
    removeSessionStorageByPrefix(prefix);
  }
}

export function clearClientPhotoCache() {
  clearCachedAlbumDetail();
  clearCachedSignedUrl();
}
