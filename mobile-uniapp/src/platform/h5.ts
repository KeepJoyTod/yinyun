import type { PlatformAdapter } from './types';

export const h5Platform: PlatformAdapter = {
  platform: 'H5',
  name: 'H5',
  canUsePhoneAuth: false,
  async login() {
    return '';
  },
  async getPhoneCode() {
    throw new Error('H5 暂不支持平台手机号授权');
  },
};
