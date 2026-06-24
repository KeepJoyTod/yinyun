const DEFAULT_REDIRECT = '/pages/pickup/albums/index';

const ALLOWED_REDIRECT_PREFIXES = [
  '/pages/pickup/',
  '/pages/customer/',
  '/pages/my/',
  '/pages/product/',
  '/pages/store/',
];

const CUSTOMER_REDIRECT_PREFIXES = [
  '/pages/customer/',
  '/pages/my/',
  '/pages/product/',
  '/pages/store/',
];

const CUSTOMER_PICKUP_PATHS = new Set([
  '/pages/pickup/albums/index',
  '/pages/pickup/detail/index',
  '/pages/pickup/preview/index',
]);

export function normalizeRedirect(raw) {
  if (!raw) {
    return DEFAULT_REDIRECT;
  }
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return ALLOWED_REDIRECT_PREFIXES.some((prefix) => decoded.startsWith(prefix))
    ? decoded
    : DEFAULT_REDIRECT;
}

export function normalizeLoginMode(raw) {
  return raw === 'customer' || raw === 'pickup' ? raw : '';
}

export function resolveLoginMode(target, requestedMode = '') {
  const normalizedTarget = normalizeRedirect(target);
  const path = normalizedTarget.split('?')[0];
  if (CUSTOMER_PICKUP_PATHS.has(path)) {
    return 'customer';
  }
  const mode = normalizeLoginMode(requestedMode);
  if (mode) {
    return mode;
  }
  return CUSTOMER_REDIRECT_PREFIXES.some((prefix) => normalizedTarget.startsWith(prefix))
    ? 'customer'
    : 'pickup';
}

export default {
  normalizeRedirect,
  normalizeLoginMode,
  resolveLoginMode,
};
