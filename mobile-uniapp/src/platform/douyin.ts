import type { PlatformAdapter } from './types';

function uniLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      success: (res) => resolve(res.code || ''),
      fail: (err) => reject(new Error(err.errMsg || '抖音小程序登录失败')),
    });
  });
}

export const douyinPlatform: PlatformAdapter = {
  platform: 'DOUYIN_MINI_APP',
  name: '抖音小程序',
  canUsePhoneAuth: false,
  async login() {
    return uniLogin();
  },
  async getPhoneCode() {
    throw new Error('抖音手机号授权首期暂未接入');
  },
};
