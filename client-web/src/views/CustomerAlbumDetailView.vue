<template>
  <main class="customer-page">
    <header class="customer-topbar">
      <RouterLink class="brand brand--dark" to="/">
        <span class="brand__mark">影</span>
        <span>
          <strong>影约云</strong>
          <small>Private Delivery</small>
        </span>
      </RouterLink>
      <RouterLink class="btn btn--ghost-dark" to="/customer/albums">返回相册</RouterLink>
    </header>

    <section class="customer-shell">
      <div class="customer-heading album-detail-hero">
        <div>
          <p class="eyebrow">PRIVATE PHOTOS</p>
          <h1>{{ album?.title || '相册详情' }}</h1>
          <p>{{ albumSummary }}</p>
        </div>
        <div class="album-proof-card">
          <ShieldCheck :size="18" />
          <strong>私密交付</strong>
          <span>当前页面只展示该手机号有权限访问的照片，预览和下载链接均为短期授权。</span>
        </div>
      </div>

      <div v-if="album" class="album-metrics" aria-label="相册交付状态">
        <div class="album-metric">
          <span>照片总数</span>
          <strong>{{ album.assets.length }}</strong>
        </div>
        <div class="album-metric">
          <span>可预览</span>
          <strong>{{ readyPreviewCount }}</strong>
        </div>
        <div class="album-metric">
          <span>待处理</span>
          <strong>{{ pendingPreviewCount }}</strong>
        </div>
        <div class="album-metric">
          <span>交付状态</span>
          <strong>{{ deliveryStateLabel }}</strong>
        </div>
      </div>

      <div v-if="album" class="album-delivery-guide" aria-label="交付说明">
        <div class="album-delivery-guide__copy">
          <p class="eyebrow">DELIVERY GUIDE</p>
          <h2>交付说明</h2>
          <p>先预览照片，确认需要保存的文件后再下载原图。下载和预览都会重新校验取片身份。</p>
        </div>
        <div class="album-delivery-steps">
          <div v-for="item in deliverySteps" :key="item.title" class="album-delivery-step">
            <component :is="item.icon" :size="18" />
            <strong>{{ item.title }}</strong>
            <span>{{ item.copy }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="album-state album-state--loading">
        <span class="state-skeleton state-skeleton--wide"></span>
        <span class="state-skeleton"></span>
        <span class="state-skeleton state-skeleton--short"></span>
      </div>

      <div v-else-if="errorMessage" class="album-state album-state--error">
        <strong>读取失败</strong>
        <span>{{ errorMessage }}</span>
        <button class="btn btn--primary" type="button" @click="loadAlbum">重试</button>
      </div>

      <div v-else-if="album && !album.assets.length" class="album-state">
        <strong>照片还没有上传</strong>
        <span>门店上传修完的照片后，这里会自动显示照片目录。</span>
        <div class="album-empty-actions album-detail-empty-actions">
          <button class="btn btn--primary" type="button" @click="loadAlbum">刷新照片目录</button>
          <RouterLink class="btn btn--ghost-dark" to="/customer/albums">返回相册列表</RouterLink>
          <a class="btn btn--ghost-dark" :href="CUSTOMER_SUPPORT.telHref">拨打门店电话</a>
        </div>
      </div>

      <div v-else>
        <div class="album-gallery-toolbar">
          <div>
            <p class="eyebrow">PHOTO DIRECTORY</p>
            <h2>照片目录</h2>
            <span>{{ previewStatusSummary }}</span>
          </div>
          <div class="album-gallery-toolbar__actions">
            <button class="btn btn--ghost-dark" type="button" :disabled="previewRefreshing" @click="refreshPreviews">
              <RefreshCw :size="17" />
              {{ previewRefreshing ? '刷新中' : '刷新预览' }}
            </button>
            <a class="btn btn--ghost-dark" :href="CUSTOMER_SUPPORT.telHref">联系门店 {{ CUSTOMER_SUPPORT.phoneDisplay }}</a>
          </div>
        </div>

        <div class="photo-grid photo-grid--gallery">
          <article
            v-for="asset in album?.assets"
            :key="asset.assetId"
            class="photo-tile"
            role="button"
            tabindex="0"
            @click="openPreview(asset)"
            @keydown.enter="openPreview(asset)"
          >
            <div class="photo-tile__image">
              <img
                v-if="previewUrls[asset.assetId]"
                :src="previewUrls[asset.assetId]"
                :alt="asset.fileName"
              />
              <span v-else>{{ previewErrors[asset.assetId] || '正在生成预览' }}</span>
            </div>
            <div class="photo-tile__meta">
              <span class="photo-status" :class="photoStatusClass(asset)">
                {{ photoStatusLabel(asset) }}
              </span>
              <strong>{{ asset.fileName || '照片' }}</strong>
              <span>编号 {{ compactAssetId(asset.assetId) }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div v-if="activeAsset" class="preview-modal" role="dialog" aria-modal="true">
      <button class="preview-modal__backdrop" type="button" aria-label="关闭预览" @click="closePreview"></button>
      <section class="preview-modal__panel">
        <header class="preview-modal__head">
          <div>
            <p class="eyebrow">PHOTO PREVIEW</p>
            <h2>{{ activeAsset.fileName || '照片预览' }}</h2>
          </div>
          <button class="btn btn--ghost-dark" type="button" @click="closePreview">关闭</button>
        </header>
        <div class="preview-modal__image">
          <div class="preview-modal__nav" aria-label="照片切换">
            <button class="btn btn--ghost-dark" type="button" :disabled="!canPreviewPrevious" @click="movePreview(-1)">
              <ChevronLeft :size="18" />
              上一张
            </button>
            <span>{{ previewPositionLabel }}</span>
            <button class="btn btn--ghost-dark" type="button" :disabled="!canPreviewNext" @click="movePreview(1)">
              下一张
              <ChevronRight :size="18" />
            </button>
          </div>
          <img
            v-if="previewUrls[activeAsset.assetId]"
            :src="previewUrls[activeAsset.assetId]"
            :alt="activeAsset.fileName"
          />
          <span v-else>{{ previewErrors[activeAsset.assetId] || '预览生成中' }}</span>
        </div>
        <footer class="preview-modal__foot">
          <span>照片 ID {{ activeAsset.assetId }}</span>
          <button class="btn btn--primary" type="button" :disabled="downloading" @click="downloadActiveAsset">
            {{ downloading ? '准备下载' : '下载原图' }}
          </button>
        </footer>
        <div class="preview-modal__proof">
          <div>
            <ShieldCheck :size="17" />
            <span>下载链接会短期过期，请勿转发给无关人员。</span>
          </div>
          <div>
            <Download :size="17" />
            <span>原图文件名优先使用门店上传时保存的名称。</span>
          </div>
        </div>
        <p v-if="downloadMessage" class="result-note" :class="{ 'result-note--error': downloadMessageType === 'error' }">
          {{ downloadMessage }}
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, CircleCheck, Clock3, Download, RefreshCw, ShieldCheck } from '@lucide/vue'
import {
  clientPhotoApi,
  type ClientPhotoAsset,
  type ClientPhotoAlbumDetail,
} from '../shared/clientPhotoApi'
import { CLIENT_WEB_ROUTES } from '../shared/entryContracts'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

const route = useRoute()
const router = useRouter()
const album = ref<ClientPhotoAlbumDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const previewUrls = ref<Record<string, string>>({})
const previewErrors = ref<Record<string, string>>({})
const activeAsset = ref<ClientPhotoAsset | null>(null)
const downloading = ref(false)
const previewRefreshing = ref(false)
const downloadMessage = ref('')
const downloadMessageType = ref<'info' | 'error'>('info')
const deliverySteps = [
  {
    title: '预览照片',
    copy: '点击照片可打开大图，预览链接会短期过期。',
    icon: CircleCheck,
  },
  {
    title: '下载原图',
    copy: '下载时重新生成授权链接，不把长期地址暴露给客户。',
    icon: Download,
  },
  {
    title: '联系门店',
    copy: '照片缺失、过期或需要延长相册有效期时联系门店处理。',
    icon: Clock3,
  },
]

const albumId = computed(() => String(route.params.albumId || ''))

const albumSummary = computed(() => {
  if (!album.value) {
    return '只展示当前手机号可访问的照片'
  }
  const expires = album.value.expireTime ? `有效期至 ${formatDate(album.value.expireTime)}` : '有效期以门店设置为准'
  return `${album.value.assets.length} 张照片 · ${expires}`
})
const readyPreviewCount = computed(() => Object.keys(previewUrls.value).length)
const failedPreviewCount = computed(() => Object.keys(previewErrors.value).length)
const pendingPreviewCount = computed(() => {
  if (!album.value) {
    return 0
  }
  return Math.max(album.value.assets.length - readyPreviewCount.value - failedPreviewCount.value, 0)
})
const deliveryStateLabel = computed(() => {
  if (!album.value?.assets.length) {
    return '待上传'
  }
  if (failedPreviewCount.value > 0) {
    return '部分待修复'
  }
  if (pendingPreviewCount.value > 0) {
    return '生成中'
  }
  return '可查看'
})
const previewStatusSummary = computed(() => {
  if (!album.value) {
    return '正在读取照片目录'
  }
  return `${readyPreviewCount.value} 张可预览 · ${pendingPreviewCount.value} 张生成中 · ${failedPreviewCount.value} 张需重试`
})
const activeAssetIndex = computed(() => {
  if (!album.value || !activeAsset.value) {
    return -1
  }
  return album.value.assets.findIndex((asset) => asset.assetId === activeAsset.value?.assetId)
})
const canPreviewPrevious = computed(() => activeAssetIndex.value > 0)
const canPreviewNext = computed(() => {
  if (!album.value) {
    return false
  }
  return activeAssetIndex.value >= 0 && activeAssetIndex.value < album.value.assets.length - 1
})
const previewPositionLabel = computed(() => {
  if (!album.value || activeAssetIndex.value < 0) {
    return ''
  }
  return `${activeAssetIndex.value + 1} / ${album.value.assets.length}`
})

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('zh-CN')
}

async function signPreviews(currentAlbum: ClientPhotoAlbumDetail) {
  previewUrls.value = {}
  previewErrors.value = {}
  await Promise.all(
    currentAlbum.assets.map(async (asset) => {
      try {
        const signed = await clientPhotoApi.getPreviewUrl(asset.assetId)
        previewUrls.value = {
          ...previewUrls.value,
          [asset.assetId]: signed.url,
        }
      } catch (error) {
        previewErrors.value = {
          ...previewErrors.value,
          [asset.assetId]: error instanceof Error ? error.message : '预览生成失败',
        }
      }
    }),
  )
}

function openPreview(asset: ClientPhotoAsset) {
  activeAsset.value = asset
  downloadMessage.value = ''
}

function closePreview() {
  activeAsset.value = null
  downloadMessage.value = ''
}

function movePreview(offset: number) {
  if (!album.value) {
    return
  }
  const nextIndex = activeAssetIndex.value + offset
  const nextAsset = album.value.assets[nextIndex]
  if (!nextAsset) {
    return
  }
  activeAsset.value = nextAsset
  downloadMessage.value = ''
}

function compactAssetId(assetId: string) {
  if (assetId.length <= 10) {
    return assetId
  }
  return `${assetId.slice(0, 6)}...${assetId.slice(-4)}`
}

function photoStatusLabel(asset: ClientPhotoAsset) {
  if (previewUrls.value[asset.assetId]) {
    return '可预览'
  }
  if (previewErrors.value[asset.assetId]) {
    return '需重试'
  }
  return '生成中'
}

function photoStatusClass(asset: ClientPhotoAsset) {
  if (previewUrls.value[asset.assetId]) {
    return 'photo-status--ready'
  }
  if (previewErrors.value[asset.assetId]) {
    return 'photo-status--error'
  }
  return 'photo-status--pending'
}

async function downloadActiveAsset() {
  if (!activeAsset.value) {
    return
  }
  downloading.value = true
  downloadMessage.value = ''
  try {
    const signed = await clientPhotoApi.getDownloadUrl(activeAsset.value.assetId)
    const link = document.createElement('a')
    link.href = signed.url
    link.download = signed.fileName || activeAsset.value.fileName || `photo-${activeAsset.value.assetId}`
    link.target = '_blank'
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
    downloadMessageType.value = 'info'
    downloadMessage.value = '已开始下载原图'
  } catch (error) {
    downloadMessageType.value = 'error'
    downloadMessage.value = error instanceof Error ? error.message : '下载失败，请稍后重试'
  } finally {
    downloading.value = false
  }
}

async function refreshPreviews() {
  if (!album.value || previewRefreshing.value) {
    return
  }
  previewRefreshing.value = true
  try {
    await signPreviews(album.value)
  } finally {
    previewRefreshing.value = false
  }
}

async function loadAlbum() {
  const token = clientPhotoApi.getStoredToken()
  if (!token) {
    await router.replace(CLIENT_WEB_ROUTES.customerLogin)
    return
  }
  if (!albumId.value) {
    errorMessage.value = '缺少相册 ID'
    await goCustomerResult({
      code: 'NO_ACCESS',
      reason: errorMessage.value,
      source: 'album-detail',
    })
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const payload = await clientPhotoApi.getAlbum(albumId.value)
    album.value = payload
    await signPreviews(payload)
  } catch (error) {
    const failureReason = error instanceof Error ? error.message : '相册读取失败'
    errorMessage.value = failureReason
    await goCustomerResult({
      code: classifyCustomerResult(failureReason),
      reason: failureReason,
      source: 'album-detail',
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadAlbum)

function classifyCustomerResult(message: string) {
  if (/过期|失效/.test(message)) {
    return 'EXPIRED'
  }
  if (/无权限|不可访问|未授权|不存在/.test(message)) {
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
