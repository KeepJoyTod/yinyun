import type { PhotoPlatform } from '@/types/clientPhoto';

export interface PlatformAdapter {
  platform: PhotoPlatform;
  name: string;
  canUsePhoneAuth: boolean;
  login(): Promise<string>;
  getPhoneCode(): Promise<string>;
}
