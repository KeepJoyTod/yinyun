<template>
  <main class="auth-page customer-result-page">
    <RouterLink class="brand brand--dark" to="/">
      <span class="brand__mark">影</span>
      <span>
        <strong>影约云</strong>
        <small>Pickup Result</small>
      </span>
    </RouterLink>

    <section class="customer-result-layout">
      <div class="customer-result-card">
        <p class="eyebrow">PICKUP NOTICE</p>
        <h1>{{ resultReasonLabel }}</h1>
        <p>{{ resultReasonCopy }}</p>

        <div class="customer-result-proof" aria-label="失败原因">
          <span>当前状态</span>
          <strong>{{ resultCode }}</strong>
          <small>{{ reasonLabel }}</small>
        </div>

        <div class="customer-result-next-steps" aria-label="处理建议">
          <div class="customer-result-next-steps__head">
            <p class="eyebrow">NEXT STEPS</p>
            <strong>处理建议</strong>
          </div>
          <ol>
            <li v-for="item in resultNextSteps" :key="item">{{ item }}</li>
          </ol>
        </div>

        <div class="customer-result-actions">
          <RouterLink class="btn btn--primary" to="/customer/login">
            <RotateCcw :size="18" />
            重新取片
          </RouterLink>
          <RouterLink class="btn btn--ghost-dark" to="/booking">小程序预约</RouterLink>
          <a class="btn btn--ghost-dark" :href="CUSTOMER_SUPPORT.telHref">联系门店</a>
        </div>

        <section class="customer-result-support-card" aria-label="门店协助">
          <div>
            <MessageCircle :size="18" />
            <span>门店协助</span>
          </div>
          <p>{{ CUSTOMER_SUPPORT.pickupHelpCopy }}</p>
          <div class="customer-result-support-card__actions">
            <a :href="CUSTOMER_SUPPORT.telHref">
              <Phone :size="16" />
              拨打门店电话 {{ CUSTOMER_SUPPORT.phoneDisplay }}
            </a>
            <span>{{ sourceLabel }}</span>
          </div>
        </section>
      </div>

      <aside class="customer-result-help">
        <div v-for="item in helpItems" :key="item.title" class="customer-result-help__item">
          <component :is="item.icon" :size="18" />
          <div>
            <strong>{{ item.title }}</strong>
            <span>{{ item.copy }}</span>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CircleHelp, Clock3, LockKeyhole, MessageCircle, Phone, RotateCcw, ShieldCheck } from '@lucide/vue'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

type CustomerResultCode = 'INVALID_CODE' | 'NO_ACCESS' | 'EXPIRED' | 'SYSTEM_ERROR'

const route = useRoute()

const resultCode = computed<CustomerResultCode>(() => {
  const code = String(route.query.code || 'SYSTEM_ERROR')
  if (code === 'INVALID_CODE' || code === 'NO_ACCESS' || code === 'EXPIRED') {
    return code
  }
  return 'SYSTEM_ERROR'
})

const reasonLabel = computed(() => String(route.query.reason || '请重新确认手机号、取片码或联系门店处理。'))

const sourceLabel = computed(() => {
  const source = String(route.query.source || '')
  const labels: Record<string, string> = {
    login: '来源：取片登录',
    albums: '来源：相册列表',
    'album-detail': '来源：相册详情',
  }
  return labels[source] || '来源：客户取片入口'
})

const resultReasonLabel = computed(() => {
  const labels: Record<CustomerResultCode, string> = {
    INVALID_CODE: '取片信息未通过验证',
    NO_ACCESS: '暂时无法访问该相册',
    EXPIRED: '相册访问已过期',
    SYSTEM_ERROR: '取片服务暂时不可用',
  }
  return labels[resultCode.value]
})

const resultReasonCopy = computed(() => {
  const copy: Record<CustomerResultCode, string> = {
    INVALID_CODE: '手机号或取片码可能填写有误。请核对门店发送的信息后重新进入相册。',
    NO_ACCESS: '当前手机号没有该相册访问权限，或相册尚未开放给客户查看。',
    EXPIRED: '相册链接或授权时间已经结束。如需继续查看，请联系门店延长有效期。',
    SYSTEM_ERROR: '可能是网络、接口或门店配置正在更新。你可以稍后重试，或直接联系门店。',
  }
  return copy[resultCode.value]
})

const resultNextSteps = computed(() => {
  const steps: Record<CustomerResultCode, string[]> = {
    INVALID_CODE: ['重新核对手机号是否为预约或下单时预留号码', '复制完整取片码，注意不要漏掉字母或横线', '仍无法进入时联系门店重新发送取片入口'],
    NO_ACCESS: ['确认是否使用本人手机号登录', '等待门店上传照片并开放客户可见状态', '联系门店核对相册是否绑定到当前手机号'],
    EXPIRED: ['联系门店延长相册有效期', '确认是否还有新的取片码或相册入口', '延长后重新进入客户取片页面'],
    SYSTEM_ERROR: ['稍后重新打开客户取片入口', '保存当前状态和提示信息', '联系门店确认系统或网络是否正在维护'],
  }
  return steps[resultCode.value]
})

const helpItems = [
  {
    title: 'INVALID_CODE',
    copy: '检查手机号是否为预约或下单时预留号码，取片码区分完整字符。',
    icon: CircleHelp,
  },
  {
    title: 'NO_ACCESS',
    copy: '相册只对绑定客户开放，门店上传并开放后才会显示。',
    icon: LockKeyhole,
  },
  {
    title: 'EXPIRED',
    copy: '过期相册需要门店重新延长有效期或重新发送取片入口。',
    icon: Clock3,
  },
  {
    title: '隐私保护',
    copy: '客户照片默认通过私有存储和短期授权访问，不展示后台地址。',
    icon: ShieldCheck,
  },
]
</script>
