<template>
  <main class="staff-login-page min-h-[100dvh] bg-amber-dark text-[#F4EFE6] grid md:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_480px] overflow-hidden">
    <section class="relative min-h-[48dvh] md:min-h-[100dvh] flex flex-col justify-between p-6 sm:p-8 lg:p-12">
      <div class="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_20%_20%,rgba(184,132,46,0.35),transparent_28%),linear-gradient(135deg,rgba(244,239,230,0.14),transparent_42%)]" />
      <div class="relative flex items-center gap-3">
        <img src="../../assets/icons/logo.svg" alt="影约云" class="h-8 w-8" />
        <div>
          <div class="text-lg font-sans font-bold tracking-[0.06em]">影约云</div>
          <div class="text-[10px] font-mono uppercase tracking-[0.24em] text-[#F4EFE6]/55">Studio Workbench</div>
        </div>
      </div>

      <div class="relative max-w-[680px] py-10 md:py-12 lg:py-16">
        <p class="text-[11px] font-mono uppercase tracking-[0.24em] text-amber-accent-soft/70">Store Staff Only</p>
        <h1 class="mt-5 text-[42px] md:text-[48px] xl:text-[64px] leading-[1.04] font-sans font-bold tracking-[-0.02em]">
          员工工作台入口，不和客户取片混用。
        </h1>
        <p class="mt-6 max-w-[520px] text-[15px] leading-7 text-[#F4EFE6]/68">
          这里进入订单、日程、客片和在线选片配置。客户预约、客户取片和手机号验证码登录，会放在客户官网与小程序入口。
        </p>

        <div class="staff-login-scope mt-8 grid gap-3 sm:grid-cols-2" aria-label="今日要处理">
          <div
            v-for="item in workScopes"
            :key="item.title"
            class="border border-[#F4EFE6]/12 bg-[#F4EFE6]/[0.06] rounded-lg p-4"
          >
            <div class="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-accent-soft/60">{{ item.code }}</div>
            <div class="mt-2 text-[15px] font-sans font-semibold text-[#F4EFE6]">{{ item.title }}</div>
            <div class="mt-2 text-[12px] leading-5 text-[#F4EFE6]/58">{{ item.copy }}</div>
          </div>
        </div>
      </div>

      <div class="relative grid grid-cols-3 gap-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[#F4EFE6]/58">
        <span>Orders</span>
        <span>Schedule</span>
        <span>Albums</span>
      </div>
    </section>

    <section class="staff-login-side-panel bg-amber-bg text-amber-dark min-h-[52dvh] md:min-h-[100dvh] flex items-start justify-center p-5 sm:p-6 md:sticky md:top-0 md:border-l md:border-amber-topbar-border/70 md:px-6 md:py-8 xl:px-8 xl:py-10">
      <form class="yy-surface w-full max-w-[420px] border border-amber-topbar-border/70 bg-amber-content-bg rounded-xl p-6 sm:p-7 shadow-[0_24px_80px_rgba(26,24,20,0.12)]" @submit.prevent="submit">
        <p class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Workbench Login</p>
        <div class="mt-3 flex items-center gap-3">
          <span class="h-7 w-[3px] rounded-full bg-amber-accent"></span>
          <h2 class="text-[28px] font-sans font-bold tracking-[-0.01em]">门店工作台登录</h2>
        </div>
        <p class="mt-2 text-[13px] leading-6 text-amber-text-muted">
          {{ loginModeHint }}
        </p>

        <div class="mt-5 grid grid-cols-2 gap-2">
          <div class="border border-amber-topbar-border/60 bg-white/55 rounded-md p-3">
            <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">Role</div>
            <div class="mt-1 text-[13px] font-semibold text-amber-dark">门店管理员</div>
          </div>
          <div class="border border-amber-topbar-border/60 bg-white/55 rounded-md p-3">
            <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">After Login</div>
            <div class="mt-1 text-[13px] font-semibold text-amber-dark">登录后进入主控台</div>
          </div>
        </div>

        <div v-if="error" class="mt-5 border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] rounded-md px-3 py-2 text-[12px] text-[var(--color-status-danger)]">
          {{ error }}
        </div>

        <label class="mt-7 block">
          <span class="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">账号</span>
          <input
            v-model="form.username"
            autocomplete="username"
            class="mt-2 w-full border border-amber-topbar-border bg-amber-search-bg px-3 py-3 rounded-md text-[14px] outline-none focus:ring-2 focus:ring-amber-accent/20 focus:border-amber-accent/30 transition-all"
            placeholder="请输入门店账号"
          />
        </label>

        <label class="mt-5 block">
          <span class="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">密码</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="mt-2 w-full border border-amber-topbar-border bg-amber-search-bg px-3 py-3 rounded-md text-[14px] outline-none focus:ring-2 focus:ring-amber-accent/20 focus:border-amber-accent/30 transition-all"
            :placeholder="passwordPlaceholder"
          />
        </label>

        <label v-if="captchaEnabled" class="mt-5 block">
          <span class="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">验证码</span>
          <div class="mt-2 grid grid-cols-[1fr_128px] gap-2">
            <input
              v-model="form.code"
              autocomplete="one-time-code"
              class="w-full border border-amber-topbar-border bg-amber-search-bg px-3 py-3 rounded-md text-[14px] outline-none focus:ring-2 focus:ring-amber-accent/20 focus:border-amber-accent/30 transition-all"
              placeholder="输入验证码"
            />
            <button
              class="yy-action overflow-hidden border border-amber-topbar-border bg-white/70 rounded-md text-[11px] text-amber-text-muted transition hover:bg-white"
              type="button"
              @click="refreshCaptcha"
            >
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="h-full w-full object-cover" />
              <span v-else>刷新验证码</span>
            </button>
          </div>
        </label>

        <button
          class="yy-action mt-7 w-full bg-amber-dark px-5 py-3 rounded-md text-[13px] font-medium text-[#F4EFE6] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? '正在进入...' : '进入门店工作台' }}
        </button>

        <div class="staff-login-security mt-6 border-t border-amber-topbar-border pt-5 text-[12px] leading-6 text-amber-text-muted">
          <div class="font-medium text-amber-dark">员工入口安全边界</div>
          <div class="mt-1">客户入口走客户官网或小程序，不使用此登录态。</div>
          <div class="mt-1">登录后进入主控台，可继续处理订单确认、拍摄日程、客片交付和在线选片。</div>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCaptcha, loginWithPassword } from '../../shared/api/request'
import { createStaffSession, isValidStaffLogin, saveStaffSession } from '../../shared/auth/staffSession'

const router = useRouter()
const route = useRoute()
const error = ref('')
const submitting = ref(false)
const captchaEnabled = ref(false)
const captchaImage = ref('')
const isDemoRuntime = () => import.meta.env.VITE_STUDIO_DEMO !== 'false'
const loginModeHint = computed(() =>
  isDemoRuntime()
    ? 'Demo 模式用于本地预览；API 模式使用真实后台账号。'
    : 'API 模式已连接真实后台：当前使用门店账号和密码登录；如生产启用验证码，会按后台配置显示。',
)
const passwordPlaceholder = computed(() => (isDemoRuntime() ? '请输入本地预览密码' : '请输入真实后台密码'))
const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
})
const workScopes = [
  {
    code: 'Orders',
    title: '订单确认',
    copy: '确认客户预约、到店时间和套餐状态。',
  },
  {
    code: 'Schedule',
    title: '拍摄日程',
    copy: '查看今日工位、摄影师安排和待到店客户。',
  },
  {
    code: 'Albums',
    title: '客片交付',
    copy: '上传底片、检查取片码和相册可见状态。',
  },
  {
    code: 'Selection',
    title: '在线选片',
    copy: '复制选片链接，跟进客户已选和精修进度。',
  },
]

const refreshCaptcha = async () => {
  if (isDemoRuntime() || import.meta.env.VITE_STUDIO_LOGIN_CAPTCHA !== 'true') {
    captchaEnabled.value = false
    captchaImage.value = ''
    form.code = ''
    form.uuid = ''
    return
  }
  try {
    const captcha = await getCaptcha()
    captchaEnabled.value = captcha.captchaEnabled !== false
    form.code = ''
    form.uuid = captcha.uuid ?? ''
    captchaImage.value = captcha.img ? `data:image/gif;base64,${captcha.img}` : ''
  } catch (err) {
    captchaEnabled.value = false
    captchaImage.value = ''
    form.uuid = ''
    error.value = err instanceof Error ? `验证码加载失败：${err.message}` : '验证码加载失败'
  }
}

const submit = async () => {
  error.value = ''
  if (!isValidStaffLogin(form)) {
    error.value = '请输入正确的门店账号和密码'
    return
  }
  if (captchaEnabled.value && !form.code.trim()) {
    error.value = '请输入验证码'
    return
  }
  submitting.value = true
  try {
    if (!isDemoRuntime()) {
      await loginWithPassword(form)
    }
    saveStaffSession(createStaffSession(form.username, '门店管理员'))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    error.value = err instanceof Error ? `登录失败：${err.message}` : '登录失败，请检查账号或权限'
    await refreshCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void refreshCaptcha()
})
</script>
