<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { currentPlatform } from '@/platform';
import { platformLogin, sendCode, verifyPickupCode } from '@/api/clientPhoto';
import { useCustomerAuth } from '@/composables/useCustomerAuth';
import phoneAuth from '@/platform/phone-auth.mjs';
import { normalizeRedirect, resolveLoginMode } from '@/pages/pickup/login/login-state.mjs';
import { clearClientToken, saveClientToken } from '@/utils/auth';
import { replacePage } from '@/utils/navigation';

const platform = currentPlatform();
const isApiMode = Boolean(import.meta.env.VITE_API_BASE_URL);
const phone = ref(import.meta.env.DEV ? (isApiMode ? '13900001111' : '13800003333') : '');
const pickupCode = ref(import.meta.env.DEV ? (isApiMode ? 'PREVIEW-20260608' : 'PICK-202606-001') : '');
const loading = ref(false);
const codeSending = ref(false);
const platformAuthLoading = ref(false);
const phoneError = ref('');
const pickupCodeError = ref('');
const platformAuthMessage = ref('');
const redirectTarget = ref('/pages/pickup/albums/index');
const loginMode = ref<'customer' | 'pickup'>('pickup');
const { loginWithWechatCode, bindPhone } = useCustomerAuth();
const smsCodeEnabled = false;
const busy = computed(() => loading.value || codeSending.value || platformAuthLoading.value);

const platformLabel = computed(() => platform.name);
const canUsePhoneAuth = computed(() => phoneAuth.canUsePlatformPhoneAuth(platform.platform));
const canUsePickupPhoneAuth = computed(() => loginMode.value === 'pickup' && canUsePhoneAuth.value);
const platformPhoneAuthText = computed(() => `${platform.name}手机号授权进入`);
const loginHint = computed(() => {
  if (loginMode.value === 'customer') {
    return '影约云会员登录';
  }
  if (platform.platform === 'WECHAT_MINI_APP') {
    return '微信小程序取片入口';
  }
  if (platform.platform === 'DOUYIN_MINI_APP') {
    return '抖音小程序取片入口';
  }
  return '客户专属取片入口';
});

function readInputValue(event: any) {
  return String(event?.detail?.value ?? event?.target?.value ?? event ?? '');
}

function normalizePhone(raw: string) {
  return String(raw || '')
    .replace(/\D/g, '')
    .slice(0, 11);
}

function normalizePickupCode(raw: string) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function onPhoneInput(event: any) {
  phone.value = normalizePhone(readInputValue(event));
  if (phoneError.value && /^1\d{10}$/.test(phone.value)) {
    phoneError.value = '';
  }
  return phone.value;
}

function onPickupCodeInput(event: any) {
  pickupCode.value = normalizePickupCode(readInputValue(event));
  if (pickupCodeError.value && pickupCode.value) {
    pickupCodeError.value = '';
  }
  return pickupCode.value;
}

function goDouyinOrder() {
  uni.navigateTo({ url: '/pages/douyin/order/index' });
}

async function onSendCode() {
  if (busy.value) {
    return;
  }
  const normalizedPhone = normalizePhone(phone.value);
  phone.value = normalizedPhone;
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    phoneError.value = '请填写 11 位手机号';
    uni.showToast({ title: '请填写正确手机号', icon: 'none' });
    return;
  }
  phoneError.value = '';
  codeSending.value = true;
  try {
    const result = await sendCode(normalizedPhone, platform.platform);
    uni.showToast({
      title: result.message || '验证码申请已记录',
      icon: 'none',
      duration: 2200,
    });
  } catch {
    // 请求层已统一 toast，这里只负责收口异步状态，避免页面事件产生未捕获异常。
  } finally {
    codeSending.value = false;
  }
}

async function onPlatformPhoneLogin(event: any) {
  if (busy.value || !canUsePickupPhoneAuth.value) {
    return;
  }
  platformAuthMessage.value = '';
  const phoneCode = phoneAuth.extractPhoneAuthCode(event);
  if (!phoneCode) {
    platformAuthMessage.value = phoneAuth.getPlatformPhoneAuthFallbackMessage(event?.detail?.errMsg);
    uni.showToast({ title: '可继续使用取片码', icon: 'none' });
    return;
  }
  platformAuthLoading.value = true;
  try {
    const loginCode = await platform.login();
    const token = await platformLogin(
      phoneAuth.buildPlatformPhoneLoginPayload({
        platform: platform.platform,
        loginCode,
        phoneCode,
      }),
    );
    saveClientToken(token);
    replacePage(redirectTarget.value);
  } catch (error: any) {
    clearClientToken();
    const message = error?.message || error?.errMsg || '';
    platformAuthMessage.value = phoneAuth.getPlatformPhoneAuthFallbackMessage(message);
    uni.showToast({ title: '请使用取片码登录', icon: 'none' });
  } finally {
    platformAuthLoading.value = false;
  }
}

async function onLogin() {
  if (busy.value) {
    return;
  }
  const normalizedPhone = normalizePhone(phone.value);
  const normalizedCode = normalizePickupCode(pickupCode.value);
  phone.value = normalizedPhone;
  pickupCode.value = normalizedCode;
  phoneError.value = '';
  pickupCodeError.value = '';
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    phoneError.value = '请填写 11 位手机号';
    uni.showToast({ title: '请填写正确手机号', icon: 'none' });
    return;
  }
  if (loginMode.value === 'pickup' && !normalizedCode) {
    pickupCodeError.value = '请填写门店提供的取片码';
    uni.showToast({ title: '请填写取片码', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    if (loginMode.value === 'customer') {
      const code = platform.platform === 'H5' ? `h5-dev-${normalizedPhone}` : undefined;
      await loginWithWechatCode(code);
      await bindPhone(normalizedPhone);
    } else {
      const token = await verifyPickupCode(normalizedPhone, normalizedCode, platform.platform);
      saveClientToken(token);
    }
    replacePage(redirectTarget.value);
  } catch {
    if (loginMode.value === 'pickup') {
      clearClientToken();
    }
  } finally {
    loading.value = false;
  }
}

onLoad((query) => {
  redirectTarget.value = normalizeRedirect(String(query?.redirect || ''));
  loginMode.value = resolveLoginMode(redirectTarget.value, String(query?.mode || ''));
});
</script>

<template>
  <view class="page-shell">
    <view class="page-content stack">
      <view class="hero-panel hero-panel-compact">
        <view class="brand-row">
          <view class="brand-lockup">
            <view class="brand-mark">影</view>
            <text class="brand-name">影约云</text>
          </view>
          <text class="chip chip-neutral">{{ platformLabel }}</text>
        </view>
        <view class="hero-title">{{ loginMode === 'customer' ? '登录会员账号' : '查看你的专属相册' }}</view>
        <view class="hero-copy">
          {{ loginMode === 'customer' ? '登录后可管理预约、支付、订单和底片入口。' : '输入手机号和取片码进入相册目录，预览和保存前都会确认身份。' }}
        </view>
        <view class="hero-meta">
          <text class="hero-meta-chip">手机号验证</text>
          <text class="hero-meta-chip">安全查看</text>
          <text class="hero-meta-chip">限时有效</text>
        </view>
        <view class="pickup-studio-scene">
          <view class="pickup-scene-photo pickup-scene-photo-large"></view>
          <view class="pickup-scene-photo pickup-scene-photo-small"></view>
          <view class="pickup-proof-card">
            <text class="pickup-proof-kicker">今日交付</text>
            <text class="pickup-proof-title">精修片正在安全送达</text>
            <text class="pickup-proof-copy">门店确认后，照片只展示给已授权客户。</text>
          </view>
        </view>
      </view>

      <view class="surface-card login-card">
        <view class="login-card-head">
          <view>
            <view class="section-title">{{ loginHint }}</view>
            <view class="subtitle">请使用门店提供的取片信息。</view>
          </view>
          <text class="login-step-chip">{{ loginMode === 'customer' ? '会员入口' : '1 分钟内完成' }}</text>
        </view>

        <view class="pickup-trust-strip">
          <view class="pickup-trust-item">
            <text class="pickup-trust-kicker">验证</text>
            <text class="pickup-trust-text">手机号匹配</text>
          </view>
          <view class="pickup-trust-item">
            <text class="pickup-trust-kicker">相册</text>
            <text class="pickup-trust-text">门店专属</text>
          </view>
          <view class="pickup-trust-item">
            <text class="pickup-trust-kicker">图片</text>
            <text class="pickup-trust-text">限时查看</text>
          </view>
        </view>

        <view class="pickup-flow-panel">
          <view class="pickup-flow-step">
            <text class="pickup-flow-index">01</text>
            <text class="pickup-flow-title">填写手机号</text>
          </view>
          <view class="pickup-flow-step">
            <text class="pickup-flow-index">02</text>
            <text class="pickup-flow-title">{{ loginMode === 'customer' ? '完成会员登录' : '输入门店取片码' }}</text>
          </view>
          <view class="pickup-flow-step">
            <text class="pickup-flow-index">03</text>
            <text class="pickup-flow-title">进入私有相册</text>
          </view>
        </view>

        <button
          v-if="canUsePickupPhoneAuth"
          class="button-secondary platform-auth-button"
          open-type="getPhoneNumber"
          :loading="platformAuthLoading"
          :disabled="loading || codeSending"
          @getphonenumber="onPlatformPhoneLogin"
        >
          {{ platformPhoneAuthText }}
        </button>
        <text v-if="platformAuthMessage" class="platform-auth-message">{{ platformAuthMessage }}</text>

        <view class="field">
          <text class="label">手机号</text>
          <input
            v-model="phone"
            class="input"
            :class="{ 'input-error': phoneError }"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            @input="onPhoneInput"
          />
          <text v-if="phoneError" class="field-error">{{ phoneError }}</text>
        </view>

        <view v-if="loginMode === 'pickup'" class="field">
          <text class="label">取片码</text>
          <input
            v-model="pickupCode"
            class="input"
            :class="{ 'input-error': pickupCodeError }"
            placeholder="请输入取片码"
            @input="onPickupCodeInput"
          />
          <text v-if="pickupCodeError" class="field-error">{{ pickupCodeError }}</text>
        </view>

        <button class="button-primary" :loading="loading" :disabled="codeSending" @click="onLogin">
          {{ loginMode === 'customer' ? '登录会员' : '进入相册' }}
        </button>
        <button class="button-secondary button-secondary-soft" :disabled="busy" @click="goDouyinOrder">预约下单</button>
        <button
          v-if="smsCodeEnabled"
          class="button-secondary button-secondary-soft"
          :loading="codeSending"
          :disabled="loading"
          @click="onSendCode"
        >
          申请验证码
        </button>

        <view style="margin-top: 22rpx">
          <text class="fine-print">如果取片码过期或手机号不一致，请联系门店重新确认取片码。</text>
        </view>

        <view class="pickup-credential-note">取片信息只用于本次相册校验，不会展示给其他客户。</view>

        <view class="pickup-privacy-note">
          <view class="pickup-privacy-dot"></view>
          <view class="pickup-privacy-copy">
            <text class="pickup-privacy-title">照片不公开展示</text>
            <text class="pickup-privacy-text">每次查看都会校验手机号和取片码，图片链接只在短时间内有效。</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
