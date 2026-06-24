<template>
  <MerchantModuleChrome>
    <template #status>
      <span class="text-[11px] text-amber-text-muted">发布状态</span>
      <span class="border border-amber-topbar-border bg-[#FBF8F2] px-3 py-1.5 text-[11px] font-medium text-amber-dark">{{ publishStatusText }}</span>
      <button class="yy-action bg-[#1A1814] px-3 py-2 text-[11px] font-semibold text-[#F4EFE6]" type="button" :disabled="saving" @click="saveDraft">
        {{ saving ? '保存中' : '保存草稿' }}
      </button>
      <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] font-semibold text-amber-dark" type="button" :disabled="saving" @click="saveAndNext">
        {{ saving ? '保存中' : '保存并下一步' }}
      </button>
      <button class="yy-action border border-[#1A1814] px-3 py-2 text-[11px] font-semibold text-amber-dark" type="button" :disabled="publishing" @click="publishDraft">
        {{ publishing ? '发布中' : '发布上线' }}
      </button>
    </template>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="grid gap-4 border-b border-amber-topbar-border px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
        <div>
          <div class="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-text-muted">小程序装修</div>
          <h2 class="mt-2 text-[22px] font-semibold leading-none text-amber-dark">店铺装修</h2>
          <p class="mt-2 text-[12px] text-amber-text-muted">微信预约端预览、草稿保存、发布快照和平台同步状态都集中维护在这里。</p>
        </div>
        <div class="grid gap-3">
          <label class="grid gap-1 text-[12px] text-amber-text-muted">
            装修范围
            <select v-model="selectedStoreId" class="h-9 border border-amber-topbar-border bg-[#EAE4D8] px-3 text-[12px] text-amber-dark outline-none" :disabled="storeLoading" @change="changeStoreScope">
              <option value="0">租户默认装修</option>
              <option v-for="store in storeOptions" :key="store.id" :value="String(store.id)">
                {{ store.name }}{{ store.address ? ` / ${store.address}` : '' }}
              </option>
            </select>
          </label>
          <div class="flex min-w-0 items-center justify-end gap-2">
            <span class="shrink-0 text-[12px] font-medium text-[#B8543B]">微信链接</span>
            <input class="h-9 min-w-0 flex-1 border border-amber-topbar-border bg-[#EAE4D8] px-3 text-[12px] text-amber-dark outline-none" :value="wechatLink" readonly>
            <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] font-medium text-amber-dark" type="button" @click="copyWechatLink">
              {{ copiedKey === 'wechat-link' ? '已复制' : '复制' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="notice" class="border-b border-amber-topbar-border px-5 py-3">
        <NoticeBanner :notice="notice" />
      </div>

      <div class="grid grid-cols-[360px_minmax(0,1fr)] max-[1060px]:grid-cols-1">
        <aside class="border-r border-amber-topbar-border px-6 py-6 max-[1060px]:border-r-0 max-[1060px]:border-b">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <div class="text-[12px] font-medium text-amber-dark">微信预约端预览</div>
              <div class="mt-1 text-[11px] text-amber-text-muted">当前为草稿预览，公开端只读发布快照</div>
            </div>
            <span class="font-mono text-[11px] text-amber-text-muted">{{ config.theme.themeColor }}</span>
          </div>

          <div class="mx-auto w-[280px] overflow-hidden rounded-[28px] border-[7px] border-[#1A1814] bg-[#F4EFE6] shadow-[0_22px_46px_rgba(26,24,20,0.12)]">
            <div class="flex h-8 items-center justify-between bg-[#1A1814] px-4 text-[11px] text-[#F4EFE6]">
              <span>9:41</span>
              <span>{{ config.theme.brandName || '品牌名称' }}</span>
              <span>•••</span>
            </div>
            <div class="px-4 pb-4 pt-5 text-center text-white" :style="{ backgroundColor: config.theme.themeColor }">
              <div class="text-[20px] font-semibold">{{ config.bookingFlow.home.homepageTitle || config.theme.brandName || '品牌首页' }}</div>
              <div class="mt-1 truncate text-[11px] opacity-85">{{ selectedStoreName }}</div>
              <div class="mt-2 text-[10px] uppercase tracking-[0.24em] opacity-80">微信预约</div>
            </div>
            <div class="relative bg-white">
              <div class="flex aspect-[3/3.7] items-center justify-center bg-[#EEE8DD]">
                <img v-if="config.theme.shareIconUrl" :src="config.theme.shareIconUrl" alt="" class="h-full w-full object-cover">
                <div v-else class="grid h-full w-full place-items-center px-8 text-center text-[13px] leading-6 text-amber-text-muted">
                  上传分享图标后，这里会模拟展示品牌主视觉
                </div>
                <img v-if="config.watermark.enabled && config.watermark.imageUrl" :src="config.watermark.imageUrl" alt="" class="absolute bottom-3 left-3 h-14 w-14 object-contain opacity-70">
              </div>
            </div>
            <div class="grid gap-2 px-4 py-4" :class="config.bookingFlow.product.listStyle === 'grid' ? 'grid-cols-3' : 'grid-cols-1'">
              <div v-for="item in previewProductItems" :key="item" class="flex min-h-10 items-center justify-center bg-[#EAE4D8] px-2 text-center text-[10px] text-amber-dark">
                {{ item }}
              </div>
            </div>
            <div class="border-t border-amber-topbar-border px-4 py-3 text-[10px] text-amber-text-muted">
              <div class="flex flex-wrap gap-1">
                <span v-if="config.bookingFlow.category.showProductCategories" class="bg-[#EAE4D8] px-2 py-1">分类选择</span>
                <span v-for="field in enabledCustomerFields" :key="field" class="bg-[#EAE4D8] px-2 py-1">{{ field }}</span>
                <span v-if="config.bookingFlow.confirm.serviceAgreement" class="bg-[#EAE4D8] px-2 py-1">服务协议</span>
              </div>
            </div>
          </div>
        </aside>

        <div class="min-w-0">
          <div class="flex flex-wrap border-b border-amber-topbar-border px-5">
            <button
              v-for="tab in topTabs"
              :key="tab.key"
              type="button"
              class="yy-action border-b-2 px-4 py-4 text-[12px] font-medium"
              :class="activeTopTab === tab.key ? 'border-[#B8543B] text-amber-dark' : 'border-transparent text-amber-text-muted'"
              @click="setActiveTopTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="grid gap-5 px-6 py-6">
            <section v-if="activeTopTab === 'theme'" class="grid gap-5">
              <div class="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  品牌名称
                  <input v-model="config.theme.brandName" class="yy-input" type="text" maxlength="24">
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  主题配色
                  <input v-model="config.theme.themeColor" class="yy-input" type="text">
                </label>
              </div>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                分享标题
                <input v-model="config.theme.shareTitle" class="yy-input" maxlength="40" type="text">
              </label>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                分享描述
                <textarea v-model="config.theme.shareDesc" class="yy-textarea" maxlength="120" />
              </label>
            </section>

            <section v-else-if="activeTopTab === 'flow'" class="grid gap-5">
              <div class="flex flex-wrap gap-2">
                <button v-for="tab in flowTabs" :key="tab.key" class="yy-segment" :class="activeFlowTab === tab.key ? 'yy-segment-active' : ''" type="button" @click="activeFlowTab = tab.key">
                  {{ tab.label }}
                </button>
              </div>
              <div v-if="activeFlowTab === 'home'" class="grid gap-4">
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  当前首页
                  <input v-model="config.bookingFlow.home.currentHomepage" class="yy-input" type="text">
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  首页标题
                  <input v-model="config.bookingFlow.home.homepageTitle" class="yy-input" type="text">
                </label>
              </div>
              <div v-else-if="activeFlowTab === 'appointment'" class="grid gap-4">
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.appointment.forceFollowWechat" type="checkbox">
                  强制客户先关注公众号
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  引导图片地址
                  <input v-model="config.bookingFlow.appointment.guideImageUrl" class="yy-input" type="text">
                </label>
              </div>
              <div v-else-if="activeFlowTab === 'category'" class="grid gap-3">
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.category.showProductCategories" type="checkbox">
                  预约流程显示产品分类
                </label>
              </div>
              <div v-else-if="activeFlowTab === 'product'" class="grid gap-4">
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  产品列表样式
                  <select v-model="config.bookingFlow.product.listStyle" class="yy-input">
                    <option value="grid">grid</option>
                    <option value="list">list</option>
                    <option value="compact">compact</option>
                  </select>
                </label>
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.product.showRelatedProducts" type="checkbox">
                  展示关联产品
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  热门关键词
                  <input v-model="config.bookingFlow.product.hotKeywords" class="yy-input" type="text">
                </label>
              </div>
              <div v-else-if="activeFlowTab === 'customer'" class="grid gap-4">
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.customer.needRemark" type="checkbox">
                  需要备注
                </label>
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.customer.remarkRequired" type="checkbox">
                  备注必填
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  备注占位提示
                  <input v-model="config.bookingFlow.customer.remarkPlaceholder" class="yy-input" type="text">
                </label>
              </div>
              <div v-else class="grid gap-4">
                <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                  <input v-model="config.bookingFlow.confirm.serviceAgreement" type="checkbox">
                  展示服务协议
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  协议内容
                  <textarea v-model="config.bookingFlow.confirm.agreementContent" class="yy-textarea min-h-[140px]" />
                </label>
              </div>
            </section>

            <section v-else-if="activeTopTab === 'profile'" class="grid gap-4">
              <div class="border border-amber-topbar-border bg-white p-4">
                <div class="text-[14px] font-semibold text-amber-dark">个人中心菜单</div>
                <p class="mt-2 text-[12px] text-amber-text-muted">当前保留现有菜单结构与顺序，不回退已有能力。</p>
              </div>
            </section>

            <section v-else-if="activeTopTab === 'watermark'" class="grid gap-5">
              <label class="flex items-center gap-3 text-[12px] text-amber-dark">
                <input v-model="config.watermark.enabled" type="checkbox">
                启用水印
              </label>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                水印图片地址
                <input v-model="config.watermark.imageUrl" class="yy-input" type="text">
              </label>
            </section>

            <section v-else-if="activeTopTab === 'platform'" class="grid gap-5">
              <div class="border border-amber-topbar-border bg-[#F4EFE6] p-4">
                <div class="text-[13px] font-semibold text-amber-dark">微信 / 公众号菜单</div>
                <p class="mt-2 text-[12px] leading-6 text-amber-text-muted">本次默认实现是"可配置、可记录、可降级"，不是必须真授权才能使用。</p>
              </div>
              <div class="grid gap-3 md:grid-cols-4">
                <article class="border border-amber-topbar-border bg-white p-4">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-amber-text-muted">授权模式</div>
                  <div class="mt-2 text-[15px] font-semibold text-amber-dark">{{ platformStatus.authMode }}</div>
                </article>
                <article class="border border-amber-topbar-border bg-white p-4">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-amber-text-muted">同步状态</div>
                  <div class="mt-2 text-[15px] font-semibold text-amber-dark">{{ platformStatus.syncStatus }}</div>
                </article>
                <article class="border border-amber-topbar-border bg-white p-4">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-amber-text-muted">Last Sync</div>
                  <div class="mt-2 text-[15px] font-semibold text-amber-dark">{{ platformStatus.lastSyncAt }}</div>
                </article>
                <article class="border border-amber-topbar-border bg-white p-4">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-amber-text-muted">预览令牌</div>
                  <div class="mt-2 break-all text-[12px] font-semibold text-amber-dark">{{ platformStatus.previewToken }}</div>
                </article>
              </div>
              <div v-if="config.platform.lastSyncError" class="border border-[#E6CFC6] bg-[#FFF5EF] px-4 py-3 text-[12px] text-[#8C3E2C]">
                同步失败：{{ config.platform.lastSyncError }}
              </div>
              <div class="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
                <article v-for="template in config.platform.wechatMenuTemplates" :key="template" class="border border-amber-topbar-border bg-[#F4EFE6] p-4">
                  <div class="text-[13px] font-semibold text-amber-dark">{{ template }}</div>
                  <button class="yy-action mt-3 border border-amber-topbar-border px-3 py-2 text-[11px] text-amber-dark" type="button" @click="config.platform.activeTemplate = template">
                    {{ config.platform.activeTemplate === template ? '当前模板' : '加载模板' }}
                  </button>
                </article>
              </div>
            </section>

            <section v-else class="grid gap-4">
              <div class="border border-amber-topbar-border bg-white p-4">
                <div class="text-[14px] font-semibold text-amber-dark">底部导航菜单</div>
                <p class="mt-2 text-[12px] text-amber-text-muted">当前保留现有导航配置与兼容菜单结构。</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { backendApi, defaultMerchantDecorationConfig, type MerchantDecorationConfig, type MerchantDecorationDto, type StoreDto } from '../../shared/api/backend'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { useNotice } from '../../shared/composables/useNotice'
import {
  buildEnabledCustomerFields,
  buildPlatformStatus,
  buildPreviewProductItems,
  buildPublishStatusText,
  buildWechatLink,
  cloneMerchantDecorationConfig,
  flowTabs,
  normalizeStoreScope,
  topTabs,
  validateDecoration,
  type FlowTabKey,
  type TopTabKey,
} from './merchantDecorationOperations'

const route = useRoute()
const router = useRouter()
const { copiedKey, copyText } = useCopyWithState()

const config = reactive<MerchantDecorationConfig>(defaultMerchantDecorationConfig())
const activeTopTab = ref<TopTabKey>('theme')
const activeFlowTab = ref<FlowTabKey>('home')
const storeOptions = ref<StoreDto[]>([])
const selectedStoreId = ref(normalizeStoreScope(route.query.storeId))
const decorationId = ref<string | null>(null)
const shareIconOssId = ref<string | null>(null)
const watermarkOssId = ref<string | null>(null)
const status = ref('DRAFT')
const publishedAt = ref('')
const loading = ref(false)
const storeLoading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const { notice, pushNotice } = useNotice()

const selectedStore = computed(() => storeOptions.value.find(store => String(store.id) === selectedStoreId.value))
const selectedStoreName = computed(() => selectedStoreId.value === '0' ? '租户默认装修' : selectedStore.value?.name || `门店 #${selectedStoreId.value}`)
const wechatLink = computed(() => buildWechatLink(selectedStoreId.value))
const previewProductItems = computed(() => buildPreviewProductItems(config.bookingFlow.product.hotKeywords))
const enabledCustomerFields = computed(() => buildEnabledCustomerFields(config.bookingFlow.customer))
const publishStatusText = computed(() => buildPublishStatusText(loading.value, status.value, publishedAt.value))
const platformStatus = computed(() => buildPlatformStatus(config.platform))

const mergeDecoration = (row: MerchantDecorationDto) => {
  decorationId.value = row.id
  shareIconOssId.value = row.shareIconOssId
  watermarkOssId.value = row.watermarkOssId
  status.value = row.status
  publishedAt.value = row.publishedAt
  Object.assign(config.theme, row.config.theme)
  Object.assign(config.bookingFlow.home, row.config.bookingFlow.home)
  Object.assign(config.bookingFlow.appointment, row.config.bookingFlow.appointment)
  Object.assign(config.bookingFlow.category, row.config.bookingFlow.category)
  Object.assign(config.bookingFlow.product, row.config.bookingFlow.product)
  Object.assign(config.bookingFlow.customer, row.config.bookingFlow.customer)
  Object.assign(config.bookingFlow.confirm, row.config.bookingFlow.confirm)
  config.profileMenus.splice(0, config.profileMenus.length, ...row.config.profileMenus)
  config.bottomMenus.splice(0, config.bottomMenus.length, ...row.config.bottomMenus)
  Object.assign(config.watermark, row.config.watermark)
  Object.assign(config.platform, row.config.platform)
  Object.assign(config.wechatMiniProgram, row.config.wechatMiniProgram)
  if (row.previewToken) config.platform.previewToken = row.previewToken
}

const loadStoreOptions = async () => {
  storeLoading.value = true
  try {
    storeOptions.value = await backendApi.listStores()
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '门店列表加载失败，仅可维护租户默认装修')
  } finally {
    storeLoading.value = false
  }
}

const loadDecoration = async () => {
  loading.value = true
  try {
    const row = await backendApi.getMerchantDecoration({ storeId: selectedStoreId.value, channelType: 'WECHAT' })
    mergeDecoration(row)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '店铺装修配置加载失败，已使用默认草稿')
  } finally {
    loading.value = false
  }
}

const buildPayload = () => ({
  id: decorationId.value,
  storeId: selectedStoreId.value,
  channelType: 'WECHAT',
  config: cloneMerchantDecorationConfig(config),
  shareIconOssId: shareIconOssId.value,
  watermarkOssId: watermarkOssId.value,
})

const saveDraft = async () => {
  const error = validateDecoration(config)
  if (error) {
    pushNotice('error', error)
    return
  }
  saving.value = true
  try {
    const row = await backendApi.saveMerchantDecoration(buildPayload())
    mergeDecoration(row)
    config.platform.syncStatus = config.platform.syncStatus || '待同步'
    pushNotice('success', '店铺装修草稿已保存')
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '店铺装修保存失败')
  } finally {
    saving.value = false
  }
}

const saveAndNext = async () => {
  await saveDraft()
  if (notice.value?.type === 'error') return
  const currentIndex = topTabs.findIndex(tab => tab.key === activeTopTab.value)
  const next = topTabs[Math.min(currentIndex + 1, topTabs.length - 1)]
  setActiveTopTab(next.key)
  pushNotice('success', `已保存，进入${next.label}`)
}

const publishDraft = async () => {
  const error = validateDecoration(config)
  if (error) {
    pushNotice('error', error)
    return
  }
  if (!globalThis.confirm(`确认发布"${selectedStoreName.value}"的店铺装修吗？发布后公开端将读取这份快照。`)) return
  publishing.value = true
  try {
    const row = await backendApi.publishMerchantDecoration(buildPayload())
    mergeDecoration(row)
    config.platform.syncStatus = '已发布待同步'
    config.platform.lastSyncAt = new Date().toISOString()
    pushNotice('success', '店铺装修已发布，公开端将读取发布快照')
  } catch (error) {
    config.platform.syncStatus = '同步失败'
    config.platform.lastSyncError = error instanceof Error ? error.message : '发布失败'
    pushNotice('error', error instanceof Error ? error.message : '店铺装修发布失败')
  } finally {
    publishing.value = false
  }
}

const copyWechatLink = async () => {
  const ok = await copyText(wechatLink.value, 'wechat-link')
  pushNotice(ok ? 'success' : 'error', ok ? '微信链接已复制' : '复制失败，请手动复制链接')
}

const changeStoreScope = () => {
  router.replace({ query: { ...route.query, storeId: selectedStoreId.value } })
  void loadDecoration()
}

const setActiveTopTab = (tab: TopTabKey) => {
  activeTopTab.value = tab
}

watch(
  () => route.query.sel,
  value => {
    const matched = topTabs.find(tab => tab.sel === String(value || '1'))
    activeTopTab.value = matched?.key || 'theme'
  },
  { immediate: true },
)

watch(
  () => route.query.storeId,
  value => {
    const next = normalizeStoreScope(value)
    if (next === selectedStoreId.value) return
    selectedStoreId.value = next
    void loadDecoration()
  },
)

onMounted(() => {
  void loadStoreOptions()
  void loadDecoration()
})
</script>
