import type { ClientPhotoToken } from '@/types/clientPhoto';
import type { CustomerUser } from '@/types';

const TOKEN_KEY = 'yy_photo_client_token';
const CUSTOMER_TOKEN_KEY = 'yy_customer_token';
const CUSTOMER_USER_KEY = 'yy_customer_user';
const CUSTOMER_REFRESH_KEY = 'yy_customer_refresh_token';

// ── 取片系统 Token（已有） ──────────────────────────────────────

export function saveClientToken(token: ClientPhotoToken) {
  uni.setStorageSync(TOKEN_KEY, token);
}

export function getClientToken(): ClientPhotoToken | null {
  const token = uni.getStorageSync(TOKEN_KEY) as ClientPhotoToken | '';
  if (!token || !token.clientToken) {
    return null;
  }
  const expiresAt = new Date(token.expiresAt).getTime();
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    clearClientToken();
    return null;
  }
  return token;
}

export function getClientTokenValue(): string {
  return getClientToken()?.clientToken || '';
}

export function clearClientToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

export function hasClientToken(): boolean {
  return Boolean(getClientTokenValue());
}

// ── 客户端用户体系（新增） ──────────────────────────────────────

export interface CustomerTokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
  user: CustomerUser;
}

export function saveCustomerToken(payload: CustomerTokenPayload) {
  uni.setStorageSync(CUSTOMER_TOKEN_KEY, payload.accessToken);
  uni.setStorageSync(CUSTOMER_REFRESH_KEY, payload.refreshToken || '');
  uni.setStorageSync(CUSTOMER_USER_KEY, JSON.stringify({
    ...payload.user,
    _expiresAt: payload.expiresAt,
  }));
}

export function getCustomerAccessToken(): string {
  return uni.getStorageSync(CUSTOMER_TOKEN_KEY) || '';
}

export function getCustomerRefreshToken(): string {
  return uni.getStorageSync(CUSTOMER_REFRESH_KEY) || '';
}

export function getCustomerUser(): CustomerUser | null {
  try {
    const raw = uni.getStorageSync(CUSTOMER_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw as string) as CustomerUser & { _expiresAt?: string };
    if (parsed._expiresAt) {
      const expiresAt = new Date(parsed._expiresAt).getTime();
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        clearCustomerToken();
        return null;
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function hasCustomerToken(): boolean {
  const token = getCustomerAccessToken();
  if (!token) return false;
  const user = getCustomerUser();
  return Boolean(user);
}

export function clearCustomerToken() {
  uni.removeStorageSync(CUSTOMER_TOKEN_KEY);
  uni.removeStorageSync(CUSTOMER_REFRESH_KEY);
  uni.removeStorageSync(CUSTOMER_USER_KEY);
}

// ── 通用登录跳转 ────────────────────────────────────────────────

function currentPageUrl(): string {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as unknown as {
    route?: string;
    options?: Record<string, string | number | boolean | undefined>;
    $page?: { options?: Record<string, string | number | boolean | undefined> };
  };
  const route = current?.route;
  if (!route) {
    return '/pages/pickup/albums/index';
  }
  const options = current.options || current.$page?.options || {};
  const query = Object.entries(options)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `/${route}${query ? `?${query}` : ''}`;
}

export function redirectToLoginWithCurrentPage(mode?: 'customer' | 'pickup') {
  const redirect = encodeURIComponent(currentPageUrl());
  const modeQuery = mode ? `&mode=${encodeURIComponent(mode)}` : '';
  uni.redirectTo({ url: `/pages/pickup/login/index?redirect=${redirect}${modeQuery}` });
}
