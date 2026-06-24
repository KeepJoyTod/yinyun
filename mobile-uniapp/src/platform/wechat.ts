import type { PlatformAdapter } from './types';

function uniLogin(provider: 'weixin'): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider,
      success: (res) => resolve(res.code || ''),
      fail: (err) => reject(new Error(err.errMsg || '微信登录失败')),
    });
  });
}

export const wechatPlatform: PlatformAdapter = {
  platform: 'WECHAT_MINI_APP',
  name: '微信小程序',
  canUsePhoneAuth: true,
  login() {
    return uniLogin('weixin');
  },
  async getPhoneCode() {
    throw new Error('请通过微信手机号授权按钮获取 phoneCode');
  },
};
