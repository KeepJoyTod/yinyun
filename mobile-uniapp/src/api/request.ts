import {
  clearClientToken,
  clearCustomerToken,
  getClientTokenValue,
  getCustomerAccessToken,
  redirectToLoginWithCurrentPage,
} from '@/utils/auth';
import { clearClientPhotoCache } from '@/utils/clientPhotoCache';

interface RuoYiResponse<T> {
  code?: number;
  msg?: string;
  data?: T;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  url: string;
  data?: string | Record<string, unknown> | ArrayBuffer;
  header?: Record<string, string>;
  token?: boolean;
  silent?: boolean;
  timeout?: number;
}

interface BaseRequestOptions extends RequestOptions {
  authMode?: 'client' | 'customer' | 'none';
  onAuthFailure?: () => void;
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
let authRedirecting = false;
let requestIdCounter = 0;

function normalizeUrl(url: string) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

function generateRequestId(): string {
  requestIdCounter += 1;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}-${requestIdCounter}`;
}

function isAuthFailure(statusCode: number, code: number, message?: string) {
  if (statusCode === 401 || statusCode === 403 || code === 401 || code === 403) {
    return true;
  }
  return Boolean(message && /登录.*(失效|过期)|重新登录/.test(message));
}

function buildHeaders(
  options: BaseRequestOptions,
  authMode: 'client' | 'customer' | 'none',
): Record<string, string> {
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': generateRequestId(),
    ...(options.header || {}),
  };

  if (options.token === false || authMode === 'none') {
    return header;
  }

  if (authMode === 'customer') {
    const customerToken = getCustomerAccessToken();
    if (customerToken) {
      header['Authorization'] = `Bearer ${customerToken}`;
    }
  } else {
    const clientToken = getClientTokenValue();
    if (clientToken) {
      header['X-Client-Token'] = clientToken;
    }
  }

  return header;
}

async function executeRequest<T>(options: BaseRequestOptions): Promise<T> {
  const authMode = options.authMode ?? 'client';
  const header = buildHeaders(options, authMode);

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: normalizeUrl(options.url),
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout ?? 10000,
      success: (res) => {
        const body = res.data as RuoYiResponse<T>;
        const code = body?.code ?? res.statusCode;
        if (code === 200) {
          resolve(body.data as T);
          return;
        }
        const message = body?.msg || `请求失败：${code}`;
        const authFailed = options.token !== false && isAuthFailure(res.statusCode, code, message);
        if (authFailed) {
          if (authMode === 'customer') {
            clearCustomerToken();
            options.onAuthFailure?.();
          } else {
            clearClientPhotoCache();
            clearClientToken();
          }
          if (!authRedirecting) {
            authRedirecting = true;
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            setTimeout(() => {
              authRedirecting = false;
              redirectToLoginWithCurrentPage(authMode === 'customer' ? 'customer' : undefined);
            }, 300);
          }
          reject(new Error('登录已过期，请重新登录'));
          return;
        }
        if (!options.silent) {
          uni.showToast({ title: message, icon: 'none' });
        }
        reject(new Error(message));
      },
      fail: (err) => {
        const message = err.errMsg || '网络连接异常';
        if (!options.silent) {
          uni.showToast({ title: message, icon: 'none' });
        }
        reject(new Error(message));
      },
    });
  });
}

// ── 取片系统请求（已有，向后兼容） ──────────────────────────────

export type { RequestOptions };

export async function request<T>(options: RequestOptions): Promise<T> {
  return executeRequest<T>({ ...options, authMode: 'client' });
}

// ── 公开接口请求（无需认证） ────────────────────────────────────

export interface PublicRequestOptions {
  method?: HttpMethod;
  url: string;
  data?: string | Record<string, unknown> | ArrayBuffer;
  header?: Record<string, string>;
  silent?: boolean;
  timeout?: number;
}

export async function publicRequest<T>(options: PublicRequestOptions): Promise<T> {
  return executeRequest<T>({ ...options, authMode: 'none', token: false });
}

// ── 客户端接口请求（JWT Bearer 认证） ───────────────────────────

export interface CustomerRequestOptions {
  method?: HttpMethod;
  url: string;
  data?: string | Record<string, unknown> | ArrayBuffer;
  header?: Record<string, string>;
  silent?: boolean;
  timeout?: number;
  onAuthFailure?: () => void;
}

export async function customerRequest<T>(options: CustomerRequestOptions): Promise<T> {
  return executeRequest<T>({
    ...options,
    authMode: 'customer',
    onAuthFailure: options.onAuthFailure,
  });
}
