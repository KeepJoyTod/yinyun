<template>
  <main class="customer-page">
    <header class="customer-topbar">
      <RouterLink class="brand brand--dark" to="/">
        <span class="brand__mark">影</span>
        <span>
          <strong>影约云</strong>
          <small>Order Lookup</small>
        </span>
      </RouterLink>
      <RouterLink class="btn btn--ghost-dark" to="/customer/login">客户取片</RouterLink>
    </header>

    <section class="customer-shell customer-order-shell">
      <div class="customer-heading customer-order-heading">
        <div>
          <p class="eyebrow">PRIVATE ORDER</p>
          <h1>订单详情</h1>
          <p>订单号 {{ orderNo }}。请输入下单时预留的手机号，确认后查看订单状态和取片入口。</p>
        </div>
        <aside class="album-security-note">
          <strong>隐私校验</strong>
          <span>订单详情先用短期访问令牌读取；令牌失效后再按门店和完整手机号重新验证。</span>
        </aside>
      </div>

      <section class="customer-order-lookup">
        <form class="customer-order-form" @submit.prevent="queryOrder">
          <label>
            <span>门店 ID</span>
            <input v-model="storeId" autocomplete="organization" inputmode="numeric" placeholder="请输入门店 ID" />
            <small>从门店、订单查询入口或员工发送的信息中获取；验证成功后详情页不再暴露门店参数。</small>
          </label>
          <label>
            <span>手机号</span>
            <input v-model="phone" autocomplete="tel" inputmode="tel" placeholder="请输入完整手机号" />
            <small>请填写抖音/微信下单、预约或门店登记时预留的手机号。</small>
          </label>
          <label>
            <span>手机号后四位（可选）</span>
            <input v-model="phoneLast4" autocomplete="one-time-code" inputmode="numeric" maxlength="4" placeholder="自动核对尾号" />
            <small>填写后四位可作为二次核对，不支持只用尾号查询。</small>
          </label>
          <button class="btn btn--primary" type="submit" :disabled="loading">
            <Search :size="18" />
            {{ loading ? '查询中' : '查看订单' }}
          </button>
        </form>

        <aside class="customer-order-help">
          <MessageCircle :size="18" />
          <strong>找不到订单？</strong>
          <span>请确认手机号与下单账号一致；抖音来客订单需要同步成功后才会在这里显示。</span>
          <a :href="CUSTOMER_SUPPORT.telHref">{{ CUSTOMER_SUPPORT.phoneDisplay }}</a>
        </aside>
      </section>

      <p v-if="message" class="result-note" :class="{ 'result-note--error': messageType === 'error' }">
        {{ message }}
      </p>

      <section v-if="matchedOrder" class="customer-order-card">
        <div class="customer-order-card__main">
          <p class="eyebrow">ORDER STATUS</p>
          <h2>{{ matchedOrder.title || matchedOrder.orderNo || '影约云订单' }}</h2>
          <p>{{ orderMeta }}</p>
        </div>
        <div class="customer-order-metrics">
          <div>
            <span>订单状态</span>
            <strong>{{ matchedOrder.status || '待确认' }}</strong>
          </div>
          <div>
            <span>支付状态</span>
            <strong>{{ matchedOrder.payStatus || '待确认' }}</strong>
          </div>
          <div>
            <span>预约时间</span>
            <strong>{{ displayTime }}</strong>
          </div>
          <div>
            <span>金额</span>
            <strong>{{ amountLabel }}</strong>
          </div>
        </div>
        <div class="customer-order-actions">
          <a v-if="matchedOrder.pickupUrl" class="btn btn--primary" :href="matchedOrder.pickupUrl">
            <Image :size="18" />
            打开取片入口
          </a>
          <RouterLink v-else class="btn btn--ghost-dark" to="/customer/login">输入取片码</RouterLink>
          <a class="btn btn--ghost-dark" :href="CUSTOMER_SUPPORT.telHref">联系门店</a>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Image, MessageCircle, Search } from '@lucide/vue'
import { clientPhotoApi, type ClientOrderLink } from '../shared/clientPhotoApi'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

const route = useRoute()
const orderNo = computed(() => decodeURIComponent(String(route.params.orderNo || '')))
const storeId = ref(String(import.meta.env.VITE_DEFAULT_STORE_ID || ''))
const phone = ref('')
const phoneLast4 = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'info' | 'error'>('info')
const matchedOrder = ref<ClientOrderLink | null>(null)

const orderMeta = computed(() => [
  matchedOrder.value?.orderNo ? `订单 ${matchedOrder.value.orderNo}` : '',
  matchedOrder.value?.channelType || '',
  matchedOrder.value?.externalStatus ? `渠道状态 ${matchedOrder.value.externalStatus}` : '',
  matchedOrder.value?.phoneMasked ? `手机号 ${matchedOrder.value.phoneMasked}` : '',
].filter(Boolean).join(' · '))

const displayTime = computed(() => matchedOrder.value?.appointmentTime || matchedOrder.value?.createdTime || '待确认')
const amountLabel = computed(() => matchedOrder.value?.amount ? `¥${matchedOrder.value.amount}` : '待确认')

onMounted(() => {
  loadOrderWithStoredToken()
})

async function loadOrderWithStoredToken() {
  if (!clientPhotoApi.getStoredOrderToken()) {
    return
  }
  loading.value = true
  messageType.value = 'info'
  message.value = '正在读取订单'
  try {
    matchedOrder.value = await clientPhotoApi.getOrderDetail(orderNo.value)
    message.value = '订单已匹配'
  } catch (error) {
    messageType.value = 'error'
    message.value = error instanceof Error ? error.message : '订单访问已失效，请重新验证手机号'
  } finally {
    loading.value = false
  }
}

async function queryOrder() {
  const normalizedPhone = phone.value.replace(/\D/g, '')
  const normalizedLast4 = phoneLast4.value.replace(/\D/g, '')
  const normalizedStoreId = storeId.value.replace(/\D/g, '')
  phone.value = normalizedPhone
  phoneLast4.value = normalizedLast4
  storeId.value = normalizedStoreId
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    setError('请输入下单时预留的 11 位手机号')
    return
  }
  if (normalizedLast4 && (!/^\d{4}$/.test(normalizedLast4) || !normalizedPhone.endsWith(normalizedLast4))) {
    setError('手机号后四位与完整手机号不一致')
    return
  }
  if (!normalizedStoreId) {
    setError('请输入门店 ID 后再验证手机号')
    return
  }
  loading.value = true
  messageType.value = 'info'
  message.value = '正在查询订单'
  matchedOrder.value = null
  try {
    await clientPhotoApi.verifyOrderAccess(normalizedStoreId, normalizedPhone, normalizedLast4)
    const current = await clientPhotoApi.getOrderDetail(orderNo.value)
    if (!current?.orderNo) {
      setError('未找到匹配订单，请确认手机号和订单链接是否属于同一门店')
      return
    }
    matchedOrder.value = current
    messageType.value = 'info'
    message.value = '订单已匹配'
  } catch (error) {
    setError(error instanceof Error ? error.message : '订单查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function setError(value: string) {
  messageType.value = 'error'
  message.value = value
}
</script>
