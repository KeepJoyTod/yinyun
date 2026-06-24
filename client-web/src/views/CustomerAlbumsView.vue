<template>
  <main class="customer-page">
    <header class="customer-topbar">
      <RouterLink class="brand brand--dark" to="/">
        <span class="brand__mark">影</span>
        <span>
          <strong>影约云</strong>
          <small>Customer Albums</small>
        </span>
      </RouterLink>
      <button class="btn btn--ghost-dark" type="button" @click="logout">重新登录</button>
    </header>

    <section class="customer-shell">
      <div class="customer-heading">
        <p class="eyebrow">PRIVATE ALBUMS</p>
        <h1>我的相册</h1>
        <p>{{ tokenLabel }}</p>
      </div>

      <section class="customer-album-overview" aria-label="客户取片概览">
        <div class="album-summary-grid">
          <div class="album-summary-card">
            <span>可访问相册</span>
            <strong>{{ totalAlbumCount }}</strong>
            <small>当前手机号授权</small>
          </div>
          <div class="album-summary-card">
            <span>照片总数</span>
            <strong>{{ totalPhotoCount }}</strong>
            <small>仅统计已开放目录</small>
          </div>
          <div class="album-summary-card">
            <span>即将过期</span>
            <strong>{{ expiringAlbumCount }}</strong>
            <small>7 天内到期提醒</small>
          </div>
        </div>

        <aside class="album-security-note">
          <strong>私密取片</strong>
          <span>相册按手机号和取片码授权，预览与下载均通过后端生成短期访问链接。</span>
        </aside>
      </section>

      <section class="album-service-panel" aria-label="相册交付提醒">
        <div class="album-service-copy">
          <p class="eyebrow">DELIVERY GUIDE</p>
          <h2>交付提醒</h2>
          <p>选择相册后可在线预览成片，并按门店开放状态下载原图。若相册即将过期，建议先完成保存。</p>
        </div>
        <div class="album-service-steps">
          <div v-for="step in albumServiceSteps" :key="step.title" class="album-service-step">
            <span>{{ step.index }}</span>
            <strong>{{ step.title }}</strong>
            <small>{{ step.description }}</small>
          </div>
        </div>
        <aside class="album-support-card">
          <span>联系门店</span>
          <strong>需要延期或重新授权？</strong>
          <p>请使用预约时预留的手机号联系门店，工作人员可核对订单后重新开放相册。</p>
          <small>{{ CUSTOMER_SUPPORT.phoneDisplay }}</small>
        </aside>
      </section>

      <div v-if="loading" class="album-state">
        正在读取相册
      </div>

      <div v-else-if="errorMessage" class="album-state album-state--error">
        <strong>读取失败</strong>
        <span>{{ errorMessage }}</span>
        <button class="btn btn--primary" type="button" @click="loadAlbums">重试</button>
      </div>

      <div v-else-if="!albums.length" class="album-state">
        <strong>当前手机号暂无可访问相册</strong>
        <span>请确认手机号是否为预约或下单时预留的号码。</span>
        <div class="album-empty-actions">
          <button class="btn btn--primary" type="button" @click="logout">换手机号登录</button>
          <RouterLink class="btn btn--ghost-dark" :to="CLIENT_WEB_ROUTES.miniappBookingGuide">小程序预约</RouterLink>
          <a class="btn btn--ghost-dark" :href="CUSTOMER_SUPPORT.telHref">拨打门店电话</a>
        </div>
      </div>

      <div v-else class="album-list">
        <RouterLink
          v-for="album in albums"
          :key="album.albumId"
          class="album-card album-card--link"
          :to="`/customer/albums/${encodeURIComponent(album.albumId)}`"
        >
          <div>
            <div class="album-card__topline">
              <p class="album-card__meta">相册 ID {{ album.albumId }}</p>
              <span class="album-card__status" :class="albumStatusClass(album)">
                {{ albumStatusLabel(album) }}
              </span>
            </div>
            <h2>{{ album.title || '客户相册' }}</h2>
            <p>
              {{ album.customerName || '客户' }}
              <span v-if="album.expireTime"> · 有效期至 {{ formatDate(album.expireTime) }}</span>
            </p>
            <div class="album-card__progress">
              <span>{{ albumChannelLabel(album.channelType) }}</span>
              <span>{{ albumNextAction(album) }}</span>
            </div>
          </div>
          <div class="album-card__side">
            <strong>{{ album.assetCount ?? 0 }}</strong>
            <span>张照片</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CLIENT_PHOTO_TOKEN_STORAGE_KEY,
  clientPhotoApi,
  type ClientPhotoAlbum,
} from '../shared/clientPhotoApi'
import { CLIENT_WEB_ROUTES } from '../shared/entryContracts'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

const albums = ref<ClientPhotoAlbum[]>([])
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const tokenLabel = computed(() => {
  const token = clientPhotoApi.getStoredToken()
  return token?.phoneMasked ? `${token.phoneMasked} 可访问的相册` : '仅展示当前手机号可访问的相册'
})
const totalAlbumCount = computed(() => albums.value.length)
const totalPhotoCount = computed(() => albums.value.reduce((sum, album) => sum + (album.assetCount ?? 0), 0))
const expiringAlbumCount = computed(() => albums.value.filter((album) => isAlbumExpiring(album)).length)
const albumServiceSteps = [
  {
    index: '01',
    title: '打开相册',
    description: '只展示当前手机号可访问的相册目录。',
  },
  {
    index: '02',
    title: '预览确认',
    description: '大图预览走短期授权链接，不暴露长期 OSS 地址。',
  },
  {
    index: '03',
    title: '保存原图',
    description: '在有效期内完成下载，过期后需要门店重新开放。',
  },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('zh-CN')
}

function isAlbumExpired(album: ClientPhotoAlbum) {
  if (!album.expireTime) {
    return false
  }
  const expireAt = new Date(album.expireTime).getTime()
  return Number.isFinite(expireAt) && expireAt < Date.now()
}

function isAlbumExpiring(album: ClientPhotoAlbum) {
  if (!album.expireTime || isAlbumExpired(album)) {
    return false
  }
  const expireAt = new Date(album.expireTime).getTime()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Number.isFinite(expireAt) && expireAt - Date.now() <= sevenDays
}

function albumStatusLabel(album: ClientPhotoAlbum) {
  if (isAlbumExpired(album)) {
    return '已过期'
  }
  if (isAlbumExpiring(album)) {
    return '即将过期'
  }
  if ((album.assetCount ?? 0) <= 0) {
    return '待上传'
  }
  if (album.status === 'DISABLED' || album.status === 'CLOSED') {
    return '暂停查看'
  }
  return '可查看'
}

function albumStatusClass(album: ClientPhotoAlbum) {
  if (isAlbumExpired(album) || album.status === 'DISABLED' || album.status === 'CLOSED') {
    return 'album-card__status--muted'
  }
  if (isAlbumExpiring(album)) {
    return 'album-card__status--warning'
  }
  if ((album.assetCount ?? 0) <= 0) {
    return 'album-card__status--pending'
  }
  return 'album-card__status--ready'
}

function albumChannelLabel(channelType?: string) {
  const labels: Record<string, string> = {
    H5: '网页取片',
    WECHAT_MINI_APP: '微信小程序',
    DOUYIN_MINI_APP: '抖音小程序',
    DOUYIN_LIFE: '抖音来客',
    MANUAL: '门店创建',
  }
  return channelType ? labels[channelType] ?? '门店交付' : '门店交付'
}

function albumNextAction(album: ClientPhotoAlbum) {
  if (isAlbumExpired(album)) {
    return '联系门店延长有效期'
  }
  if ((album.assetCount ?? 0) <= 0) {
    return '等待门店上传照片'
  }
  if (isAlbumExpiring(album)) {
    return '建议尽快查看下载'
  }
  return '进入相册查看照片'
}

async function loadAlbums() {
  const token = clientPhotoApi.getStoredToken()
  if (!token) {
    await router.replace(CLIENT_WEB_ROUTES.customerLogin)
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    albums.value = await clientPhotoApi.listAlbums()
  } catch (error) {
    const failureReason = error instanceof Error ? error.message : '相册读取失败'
    errorMessage.value = failureReason
    await goCustomerResult({
      code: classifyCustomerResult(failureReason),
      reason: failureReason,
      source: 'albums',
    })
  } finally {
    loading.value = false
  }
}

function logout() {
  window.localStorage.removeItem(CLIENT_PHOTO_TOKEN_STORAGE_KEY)
  void router.replace(CLIENT_WEB_ROUTES.customerLogin)
}

onMounted(loadAlbums)

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
