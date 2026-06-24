<template>
  <div class="login">
    <section class="login-shell">
      <aside class="brand-panel">
        <div class="brand-mark">
          <span>YY</span>
          <div>
            <strong>{{ title }}</strong>
            <em>连锁相馆经营系统</em>
          </div>
        </div>
        <div class="brand-copy">
          <div class="overline">YingYue Cloud Console</div>
          <h1>把预约、订单、选片和渠道接入放在同一个后台。</h1>
          <p>面向照相馆日常运营的控制台，优先服务今日预约、门店履约和抖音/美团渠道联调。</p>
        </div>
        <div class="signal-grid">
          <div v-for="item in loginSignals" :key="item.label" class="signal-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </aside>

      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <div class="form-head">
          <span>商家后台登录</span>
          <h2>进入影约云管理系统</h2>
          <p>开发环境已关闭验证码；正式环境按后端配置启用租户、验证码和第三方登录。</p>
        </div>

        <el-form-item v-if="tenantEnabled" prop="tenantId" class="field-item">
          <label class="field-label">租户</label>
          <el-select v-model="loginForm.tenantId" filterable :placeholder="proxy.$t('login.selectPlaceholder')" style="width: 100%">
            <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
            <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
          </el-select>
        </el-form-item>
        <el-form-item prop="username" class="field-item">
          <label class="field-label">账号</label>
          <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="proxy.$t('login.username')">
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" class="field-item">
          <label class="field-label">密码</label>
          <el-input
            v-model="loginForm.password"
            show-password
            type="password"
            size="large"
            auto-complete="off"
            :placeholder="proxy.$t('login.password')"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="captchaEnabled" prop="code" class="field-item">
          <label class="field-label">验证码</label>
          <div class="captcha-row">
            <el-input v-model="loginForm.code" size="large" auto-complete="off" :placeholder="proxy.$t('login.code')" @keyup.enter="handleLogin">
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" class="login-code-img" @click="getCode" />
            </div>
          </div>
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
          <router-link v-if="register" class="link-type" :to="'/register'">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
        </div>

        <el-form-item v-if="socialLoginEnabled" class="social-row">
          <el-button circle :title="proxy.$t('login.social.wechat')" @click="doSocialLogin('wechat')">
            <svg-icon icon-class="wechat" />
          </el-button>
          <el-button circle :title="proxy.$t('login.social.maxkey')" @click="doSocialLogin('maxkey')">
            <svg-icon icon-class="maxkey" />
          </el-button>
          <el-button circle :title="proxy.$t('login.social.topiam')" @click="doSocialLogin('topiam')">
            <svg-icon icon-class="topiam" />
          </el-button>
          <el-button circle :title="proxy.$t('login.social.gitee')" @click="doSocialLogin('gitee')">
            <svg-icon icon-class="gitee" />
          </el-button>
          <el-button circle :title="proxy.$t('login.social.github')" @click="doSocialLogin('github')">
            <svg-icon icon-class="github" />
          </el-button>
        </el-form-item>

        <el-form-item style="width: 100%; margin-bottom: 0">
          <el-button :loading="loading" size="large" type="primary" class="login-button" @click.prevent="handleLogin">
            <span v-if="!loading">登录工作台</span>
            <span v-else>{{ proxy.$t('login.logging') }}</span>
          </el-button>
        </el-form-item>
      </el-form>
    </section>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2026 影约云 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { authRouterUrl } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';
import { APP_TITLE } from '@/settings';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = APP_TITLE;
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules = computed<ElFormRules>(() => ({
  tenantId: [{ required: true, trigger: 'blur', message: t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  ...(captchaEnabled.value ? { code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }] } : {})
}));

const codeUrl = ref('');
const loading = ref(false);
// 本地开发默认关闭验证码，避免后端未启动或验证码图片失败时阻塞登录页预览。
const captchaDisabledByEnv = import.meta.env.DEV || import.meta.env.VITE_APP_CAPTCHA === 'false';
const captchaEnabled = ref(!captchaDisabledByEnv);
const socialLoginEnabled = import.meta.env.VITE_APP_SOCIAL_LOGIN === 'true';
// 租户开关
const tenantEnabled = ref(true);

// 注册开关
const register = ref(false);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);
const loginSignals = [
  { label: '今日重点', value: '预约履约' },
  { label: '渠道状态', value: '抖音联调' },
  { label: '数据权限', value: '租户 / 门店' }
];

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/';
        await router.push(redirectUrl);
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  if (captchaDisabledByEnv) {
    captchaEnabled.value = false;
    loginForm.value.code = '';
    loginForm.value.uuid = '';
    return;
  }
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    // 刷新验证码时清空输入框
    loginForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  if (import.meta.env.DEV) {
    tenantEnabled.value = true;
    tenantList.value = [{ tenantId: '000000', companyName: '影约云默认租户', domain: null }];
    loginForm.value.tenantId = '000000';
    return;
  }
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authRouterUrl(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 32px 20px 64px;
  background: linear-gradient(115deg, rgba(15, 23, 42, 0.96), rgba(22, 78, 99, 0.92)), #0f172a;
}

.login-shell {
  width: min(1040px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 420px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.18);
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.38);
}

.brand-panel {
  display: grid;
  align-content: space-between;
  gap: 42px;
  padding: 42px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.98)), url('../assets/images/login-background.jpg');
  background-size: cover;
  background-position: center;
  color: #fff;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 14px;

  > span {
    display: inline-flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #ffffff;
    color: #0f172a;
    font-weight: 800;
  }

  strong,
  em {
    display: block;
  }

  strong {
    font-size: 17px;
    font-weight: 750;
  }

  em {
    margin-top: 4px;
    color: rgba(226, 232, 240, 0.76);
    font-size: 13px;
    font-style: normal;
  }
}

.brand-copy {
  max-width: 520px;

  .overline {
    color: #5eead4;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
  }

  h1 {
    margin: 14px 0 0;
    font-size: 34px;
    font-weight: 780;
    line-height: 1.24;
    letter-spacing: 0;
  }

  p {
    margin: 18px 0 0;
    color: rgba(226, 232, 240, 0.78);
    font-size: 15px;
    line-height: 1.8;
  }
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.signal-item {
  min-height: 82px;
  padding: 13px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.52);

  span,
  strong {
    display: block;
  }

  span {
    color: rgba(226, 232, 240, 0.66);
    font-size: 12px;
  }

  strong {
    margin-top: 10px;
    font-size: 15px;
  }
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 42px 36px;
  z-index: 1;

  .el-input {
    height: 44px;

    input {
      height: 44px;
    }
  }

  .input-icon {
    height: 43px;
    width: 14px;
    margin-left: 0px;
  }
}

.form-head {
  margin-bottom: 28px;

  span {
    color: #0f766e;
    font-size: 12px;
    font-weight: 800;
  }

  h2 {
    margin: 9px 0 0;
    color: #0f172a;
    font-size: 26px;
    font-weight: 780;
    letter-spacing: 0;
  }

  p {
    margin: 10px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }
}

.field-item {
  display: block;
  margin-bottom: 18px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #dbe4ef inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 2px rgba(15, 118, 110, 0.18),
    0 0 0 1px #0f766e inset;
}

.login-form :deep(.el-button--primary) {
  border-radius: 8px;
  background: #0f172a;
  border-color: #0f172a;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.2);
}

.login-form :deep(.el-button.is-circle) {
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: var(--el-text-color-regular);
}

.login-form :deep(.el-button.is-circle:hover) {
  background: rgba(15, 118, 110, 0.1);
  border-color: rgba(15, 118, 110, 0.2);
}

.captcha-row {
  display: grid;
  grid-template-columns: 1fr 132px;
  gap: 10px;
}

.login-code {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);

  img {
    cursor: pointer;
    vertical-align: middle;
    display: block;
    width: 100%;
    height: 44px;
    object-fit: cover;
  }
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 2px 0 22px;
}

.social-row {
  justify-content: flex-end;
  margin-bottom: 18px;
}

.login-button {
  width: 100%;
  height: 44px;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 0;
}

.login-code-img {
  height: 44px;
  padding-left: 0;
}

:global(html.dark) {
  .login-shell {
    background: #111827;
  }

  .login-form {
    background: #111827;
  }

  .form-head h2,
  .field-label {
    color: #e5e7eb;
  }

  .login-form :deep(.el-input__wrapper) {
    background-color: rgba(17, 24, 39, 0.7);
  }

  .login-form :deep(.el-button.is-circle) {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.25);
    color: #e5e7eb;
  }

  .el-login-footer {
    color: rgba(226, 232, 240, 0.65);
  }
}

@media (max-width: 900px) {
  .login {
    align-items: flex-start;
    padding-top: 20px;
  }

  .login-shell {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding: 26px;
  }

  .brand-copy h1 {
    font-size: 25px;
  }

  .signal-grid {
    grid-template-columns: 1fr;
  }

  .login-form {
    padding: 28px 22px;
  }
}
</style>
