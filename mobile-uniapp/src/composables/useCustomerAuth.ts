import { computed, ref } from 'vue';
import { bindCustomerPhone, customerWechatLogin, getCustomerProfile } from '@/api/customer';
import { currentPlatform } from '@/platform';
import {
  clearCustomerToken,
  getCustomerAccessToken,
  getCustomerRefreshToken,
  getCustomerUser,
  hasCustomerToken,
  saveCustomerToken,
} from '@/utils/auth';
import type { CustomerProfile, CustomerUser } from '@/types/clientPhoto';

const profile = ref<CustomerProfile | null>(null);
const loginLoading = ref(false);
const profileLoading = ref(false);
const authError = ref('');

function normalizeExpiresAt(expiresIn?: number, expiresAt?: string) {
  if (expiresAt) {
    return expiresAt;
  }
  const seconds = Number(expiresIn || 30 * 24 * 60 * 60);
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalizeUser(raw?: CustomerUser | CustomerProfile | null): CustomerUser {
  const fallback = getCustomerUser();
  const source = (raw || fallback || {}) as Partial<CustomerUser & CustomerProfile>;
  return {
    id: String(source.id || ''),
    openId: source.openId || source.openid,
    openid: source.openid || source.openId,
    unionId: source.unionId || source.unionid,
    unionid: source.unionid || source.unionId,
    phone: source.phone,
    phoneMasked: source.phoneMasked,
    nickname: source.nickname || '影约会员',
    avatarUrl: source.avatarUrl,
    platform: source.platform || currentPlatform().platform,
    createdAt: source.createdAt,
  };
}

function syncCachedProfile() {
  const cached = getCustomerUser();
  if (!cached) {
    profile.value = null;
    return;
  }
  profile.value = {
    id: cached.id,
    openId: cached.openId || cached.openid,
    unionId: cached.unionId || cached.unionid,
    phoneMasked: cached.phoneMasked,
    nickname: cached.nickname,
    avatarUrl: cached.avatarUrl,
    createdAt: cached.createdAt,
  };
}

export function useCustomerAuth() {
  const isLoggedIn = computed(() => hasCustomerToken());
  const customer = computed(() => getCustomerUser());
  const phoneBound = computed(() => {
    const cached = getCustomerUser();
    return Boolean(profile.value?.phoneMasked && profile.value.phoneMasked !== '手机号未绑定')
      || Boolean(cached?.phone || cached?.phoneMasked);
  });

  async function loginWithWechatCode(code?: string) {
    loginLoading.value = true;
    authError.value = '';
    try {
      const loginCode = code || await currentPlatform().login();
      if (!loginCode) {
        throw new Error('当前环境暂不支持微信登录，请在微信小程序内继续');
      }
      const payload = await customerWechatLogin(loginCode);
      const accessToken = payload.accessToken || payload.token || '';
      const rawUser = payload.user || payload.customer;
      if (!accessToken || !rawUser?.id) {
        throw new Error('登录响应缺少客户身份信息');
      }
      const user = normalizeUser(rawUser);
      saveCustomerToken({
        accessToken,
        refreshToken: payload.refreshToken || '',
        expiresIn: Number(payload.expiresIn || 30 * 24 * 60 * 60),
        expiresAt: normalizeExpiresAt(payload.expiresIn, payload.expiresAt),
        user,
      });
      profile.value = {
        id: user.id,
        openId: user.openId || user.openid,
        unionId: user.unionId || user.unionid,
        phoneMasked: user.phoneMasked,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      };
      return user;
    } catch (error: any) {
      authError.value = error?.message || '客户登录失败';
      clearCustomerToken();
      throw error;
    } finally {
      loginLoading.value = false;
    }
  }

  async function bindPhone(phone: string, verificationCode?: string) {
    loginLoading.value = true;
    authError.value = '';
    try {
      const account = await bindCustomerPhone(phone, verificationCode);
      const current = normalizeUser(account as CustomerUser);
      const nextAccessToken = (account as CustomerProfile & { accessToken?: string; token?: string }).accessToken
        || (account as CustomerProfile & { accessToken?: string; token?: string }).token
        || getCustomerAccessToken();
      saveCustomerToken({
        accessToken: nextAccessToken,
        refreshToken: getCustomerRefreshToken(),
        expiresIn: 30 * 24 * 60 * 60,
        expiresAt: normalizeExpiresAt(),
        user: current,
      });
      await refreshProfile();
      return account;
    } catch (error: any) {
      authError.value = error?.message || '手机号绑定失败';
      throw error;
    } finally {
      loginLoading.value = false;
    }
  }

  async function refreshProfile() {
    if (!hasCustomerToken()) {
      syncCachedProfile();
      return null;
    }
    profileLoading.value = true;
    authError.value = '';
    try {
      const payload = await getCustomerProfile();
      profile.value = payload;
      const current = normalizeUser(payload);
      saveCustomerToken({
        accessToken: getCustomerAccessToken(),
        refreshToken: getCustomerRefreshToken(),
        expiresIn: 30 * 24 * 60 * 60,
        expiresAt: normalizeExpiresAt(),
        user: current,
      });
      return payload;
    } catch (error: any) {
      authError.value = error?.message || '客户资料加载失败';
      throw error;
    } finally {
      profileLoading.value = false;
    }
  }

  function requireCustomerLogin(redirect?: string) {
    if (hasCustomerToken()) {
      return true;
    }
    const target = encodeURIComponent(redirect || '/pages/customer/orders/index');
    uni.showToast({ title: '请先登录会员账号', icon: 'none' });
    uni.navigateTo({ url: `/pages/pickup/login/index?redirect=${target}&mode=customer` });
    return false;
  }

  function logout() {
    clearCustomerToken();
    profile.value = null;
  }

  syncCachedProfile();

  return {
    profile,
    customer,
    isLoggedIn,
    phoneBound,
    loginLoading,
    profileLoading,
    authError,
    loginWithWechatCode,
    bindPhone,
    refreshProfile,
    requireCustomerLogin,
    logout,
  };
}
