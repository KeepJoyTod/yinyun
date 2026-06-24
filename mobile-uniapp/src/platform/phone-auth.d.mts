import type { PhotoPlatform } from '@/types/clientPhoto';

export const PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE: string;
export function canUsePlatformPhoneAuth(platform?: PhotoPlatform | string): boolean;
export function extractPhoneAuthCode(event: unknown): string;
export function buildPlatformPhoneLoginPayload(options: {
  platform: PhotoPlatform;
  loginCode?: string;
  phoneCode?: string;
}): {
  platform: PhotoPlatform;
  loginCode: string;
  phoneCode: string;
};
export function getPlatformPhoneAuthFallbackMessage(message?: string): string;

declare const phoneAuth: {
  PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE: typeof PLATFORM_PHONE_AUTH_FALLBACK_MESSAGE;
  canUsePlatformPhoneAuth: typeof canUsePlatformPhoneAuth;
  extractPhoneAuthCode: typeof extractPhoneAuthCode;
  buildPlatformPhoneLoginPayload: typeof buildPlatformPhoneLoginPayload;
  getPlatformPhoneAuthFallbackMessage: typeof getPlatformPhoneAuthFallbackMessage;
};

export default phoneAuth;
