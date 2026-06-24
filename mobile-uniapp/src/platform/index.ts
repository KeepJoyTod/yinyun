import { douyinPlatform } from './douyin';
import { h5Platform } from './h5';
import type { PlatformAdapter } from './types';
import { wechatPlatform } from './wechat';

export function currentPlatform(): PlatformAdapter {
  // #ifdef MP-WEIXIN
  return wechatPlatform;
  // #endif

  // #ifdef MP-TOUTIAO
  return douyinPlatform;
  // #endif

  return h5Platform;
}
