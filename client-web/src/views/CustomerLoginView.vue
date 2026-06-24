<template>
  <main class="auth-page pickup-login-page">
    <RouterLink class="brand brand--dark" to="/">
      <span class="brand__mark">影</span>
      <span>
        <strong>影约云</strong>
        <small>Customer Pickup</small>
      </span>
    </RouterLink>

    <section class="pickup-login-layout">
      <aside class="pickup-login-guide">
        <p class="eyebrow">PRIVATE PICKUP</p>
        <h1>输入取片信息，查看自己的私密相册。</h1>
        <p>
          取片入口只校验客户预留手机号和门店发送的取片码。通过后才会生成短期访问授权，不展示后台地址和长期 OSS 链接。
        </p>

        <div class="pickup-login-checklist" aria-label="取片前确认">
          <div v-for="item in loginChecks" :key="item.title" class="pickup-login-check">
            <component :is="item.icon" :size="18" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.copy }}</span>
            </div>
          </div>
        </div>

        <div class="pickup-login-assurance">
          <ShieldCheck :size="18" />
          <span>私密相册采用手机号/取片码校验和短期授权访问，客户只能看到自己名下已开放的照片。</span>
        </div>
      </aside>

      <div class="auth-panel pickup-login-panel">
        <div>
          <p class="eyebrow">CUSTOMER LOGIN</p>
          <h2>客户取片登录</h2>
          <p>输入拍摄时预留的手机号和取片码，进入自己的相册目录。</p>
        </div>

        <form class="form-stack" @submit.prevent="submit">
          <label>
            <span>手机号</span>
            <input v-model="phone" autocomplete="tel" inputmode="tel" placeholder="13800003333" />
            <small>请填写预约、下单或门店登记时预留的手机号。</small>
          </label>
          <label>
            <span>取片码</span>
            <input v-model="pickupCode" autocomplete="one-time-code" placeholder="PICK-202606-001" />
            <small>通常由门店通过微信、短信或订单消息发送。</small>
          </label>
          <button class="btn btn--primary" type="submit" :disabled="submitting">
            <ArrowRight :size="18" />
            {{ submitting ? '验证中' : '进入相册' }}
          </button>
        </form>

        <p v-if="message" class="result-note" :class="{ 'result-note--error': messageType === 'error' }">
          {{ message }}
        </p>

        <div class="pickup-login-actions" aria-label="取片帮助">
          <RouterLink class="text-link" to="/booking">还没有预约？去小程序预约</RouterLink>
          <a class="text-link" :href="CUSTOMER_SUPPORT.telHref">联系门店</a>
          <RouterLink class="text-link" to="/">返回首页</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CalendarClock, KeyRound, ShieldCheck, Smartphone } from '@lucide/vue'
import { clientPhotoApi, normalizePickupCredentials } from '../shared/clientPhotoApi'
import { CLIENT_WEB_ROUTES } from '../shared/entryContracts'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

const phone = ref('')
const pickupCode = ref('')
const message = ref('')
const messageType = ref<'info' | 'error'>('info')
const submitting = ref(false)
const router = useRouter()
const loginChecks = [
  {
    title: '预留手机号',
    copy: '使用预约、下单或到店登记时留下的手机号。',
    icon: Smartphone,
  },
  {
    title: '门店发送的取片码',
    copy: '复制完整取片码，字母会自动转为大写。',
    icon: KeyRound,
  },
  {
    title: '相册有效期内',
    copy: '过期或未开放的相册需要联系门店重新开通。',
    icon: CalendarClock,
  },
]

const submit = async () => {
  const credentials = normalizePickupCredentials(phone.value, pickupCode.value)
  if (!/^1\d{10}$/.test(credentials.phone)) {
    messageType.value = 'error'
    message.value = '请输入 11 位手机号'
    return
  }
  if (credentials.code.length < 4) {
    messageType.value = 'error'
    message.value = '请输入门店发送的取片码'
    return
  }
  submitting.value = true
  messageType.value = 'info'
  message.value = '正在校验取片信息'
  try {
    await clientPhotoApi.verifyPickupCode(credentials.phone, credentials.code)
    await router.push(CLIENT_WEB_ROUTES.customerAlbums)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试'
    messageType.value = 'error'
    message.value = errorMessage
    await goCustomerResult({
      code: classifyCustomerResult(errorMessage),
      reason: errorMessage,
      source: 'login',
    })
  } finally {
    submitting.value = false
  }
}

function classifyCustomerResult(message: string) {
  if (/过期|失效/.test(message)) {
    return 'EXPIRED'
  }
  if (/无权限|不可访问|未授权/.test(message)) {
    return 'NO_ACCESS'
  }
  if (/取片码|验证码|手机号|登录/.test(message)) {
    return 'INVALID_CODE'
  }
  return 'SYSTEM_ERROR'
}

async function goCustomerResult(query: Record<string, string>) {
  await router.push({
    path: CLIENT_WEB_ROUTES.customerResult,
    query,
  })
}
</script>
