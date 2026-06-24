export const PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE =
  '手机号授权暂不可用，请继续使用手机号和取片码进入相册。';

export function canUsePlatformPhoneAuth(platform) {
  return platform === 'WECHAT_MINI_APP' || platform === 'DOUYIN_MINI_APP';
}

export function extractPhoneAuthCode(event) {
  const detail = event?.detail || {};
  return String(detail.code || detail.phoneCode || event?.code || '').trim();
}

export function buildPlatformPhoneLoginPayload({ platform, loginCode, phoneCode }) {
  return {
    platform,
    loginCode: String(loginCode || '').trim(),
    phoneCode: String(phoneCode || '').trim(),
  };
}

export function getPlatformPhoneAuthFallbackMessage(message) {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('deny') || normalized.includes('cancel') || normalized.includes('取消')) {
    return '你已取消手机号授权，可继续输入手机号和取片码进入相册。';
  }
  return PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE;
}

const phoneAuth = {
  PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE,
  canUsePlatformPhoneAuth,
  extractPhoneAuthCode,
  buildPlatformPhoneLoginPayload,
  getPlatformPhoneAuthFallbackMessage,
};

export default phoneAuth;
