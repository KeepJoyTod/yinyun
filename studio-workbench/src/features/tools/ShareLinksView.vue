<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">入口物料中心</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">{{ pageTitle }}</h2>
          <p class="mt-1 max-w-[760px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            生成门店二维码、客户预约入口、取片入口和分享链接。正式预约优先打开微信小程序，客户电脑网页只做官网、取片和小程序预约引导。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black disabled:opacity-50"
          type="button"
          :disabled="copyingKey === 'link' || !paramValidation.valid"
          @click="copyLink(activeEntry.h5Url, 'link')"
        >
          {{ !paramValidation.valid ? '参数不完整' : copyingKey === 'link' ? '复制中...' : copiedKey === 'link' ? '已复制' : '复制当前链接' }}
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="share-links-ops-board border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickEntryFilters"
            :key="filter.key"
            class="yy-action yy-filter-chip"
            :class="selectedEntryType === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="selectedEntryType = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in operationCards"
          :key="card.label"
          class="yy-surface border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
              <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-black/[0.03] px-2 py-1 text-[9px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
              {{ card.scope }}
            </span>
          </div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[22px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ card.action }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-[1.05fr_0.95fr] gap-5 max-[1100px]:grid-cols-1">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[760px]:flex-col max-[760px]:items-start">
          <div class="flex flex-wrap items-center gap-3">
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              门店
              <select
                v-model="selectedStoreId"
                class="yy-field-md min-w-[220px]"
              >
                <option v-for="store in appStore.stores" :key="store.backendId" :value="String(store.backendId)">
                  {{ store.name }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              渠道提示
              <select
                v-model="selectedChannel"
                class="yy-field-md min-w-[160px]"
              >
                <option value="STORE">店内扫码</option>
                <option value="WECHAT">微信入口</option>
                <option value="DOUYIN">抖音入口</option>
                <option value="MEITUAN">美团入口</option>
              </select>
            </label>
          </div>
          <button
            class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5"
            type="button"
            @click="resetToDefault"
          >
            恢复默认
          </button>
        </div>

        <div class="divide-y divide-amber-topbar-border/60">
          <article
            v-for="entry in entryConfigs"
            :key="entry.type"
            class="yy-clickable-row p-5"
            :class="selectedEntryType === entry.type ? 'bg-[#F0E9DD]/55' : ''"
          >
            <button class="w-full text-left" type="button" @click="selectedEntryType = entry.type">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[13px] font-sans font-semibold text-amber-dark">{{ entry.label }}</span>
                    <span class="border border-amber-topbar-border bg-white/60 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">
                      {{ entry.badge }}
                    </span>
                  </div>
                  <p class="mt-2 max-w-[680px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">{{ entry.desc }}</p>
                </div>
                <span
                  class="px-2 py-1 text-[9px] font-mono uppercase tracking-[0.16em]"
                  :class="selectedEntryType === entry.type ? 'bg-amber-dark text-[#F4EFE6]' : 'border border-amber-topbar-border text-amber-text-muted'"
                >
                  {{ selectedEntryType === entry.type ? '当前' : '选择' }}
                </span>
              </div>
            </button>
          </article>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">二维码预览</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">{{ activeEntry.materialTitle }}</h3>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ activeEntry.materialSubtitle }}</p>
        </div>

        <div class="p-5">
          <div v-if="!paramValidation.valid" class="mb-4 border border-[#B8543B]/30 bg-[#B8543B]/5 px-4 py-3 text-[11px] text-[#8C3E2C]">
            参数不完整，无法生成正确二维码：缺少 {{ paramValidation.missing.join('、') }}。
          </div>
          <template v-else>
            <div class="grid grid-cols-[auto_1fr] gap-5 max-[640px]:grid-cols-1">
              <div ref="qrWrap" class="w-fit border border-amber-topbar-border bg-amber-content-bg p-3">
                <QrcodeVue :value="activeEntry.qrValue" :size="176" :margin="1" level="M" render-as="canvas" />
              </div>
              <div class="min-w-0">
                <div class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">门店</div>
                <div class="mt-1 text-[13px] font-sans font-semibold text-amber-dark">{{ activeStore?.name || '未选择门店' }}</div>
                <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">建议桌牌文案</div>
                <p class="mt-1 text-[11px] leading-relaxed text-amber-dark">{{ activeEntry.printCopy }}</p>
                <button
                  class="yy-action mt-4 border border-amber-topbar-border px-3 py-2 text-[10.5px] text-amber-text-muted hover:bg-black/5"
                  type="button"
                  @click="downloadQr"
                >
                  下载二维码图片
                </button>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div class="border border-amber-topbar-border bg-white/45 p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">微信小程序页面路径</span>
                  <button class="yy-action text-[10px] text-amber-dark disabled:opacity-50" type="button" :disabled="copyingKey === 'miniapp'" @click="copyLink(activeEntry.miniappPath, 'miniapp')">{{ copyingKey === 'miniapp' ? '...' : copiedKey === 'miniapp' ? '已复制' : '复制' }}</button>
                </div>
                <div class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ activeEntry.miniappPath }}</div>
              </div>
              <div class="border border-amber-topbar-border bg-white/45 p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">小程序码 scene</span>
                  <button class="yy-action text-[10px] text-amber-dark disabled:opacity-50" type="button" :disabled="copyingKey === 'scene'" @click="copyLink(activeEntry.scene, 'scene')">{{ copyingKey === 'scene' ? '...' : copiedKey === 'scene' ? '已复制' : '复制' }}</button>
                </div>
                <div class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ activeEntry.scene }}</div>
              </div>
              <div class="border border-amber-topbar-border bg-white/45 p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">H5 / 官网兜底链接</span>
                  <button class="yy-action text-[10px] text-amber-dark disabled:opacity-50" type="button" :disabled="copyingKey === 'h5'" @click="copyLink(activeEntry.h5Url, 'h5')">{{ copyingKey === 'h5' ? '...' : copiedKey === 'h5' ? '已复制' : '复制' }}</button>
                </div>
                <div class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ activeEntry.h5Url }}</div>
              </div>
            </div>
          </template>
        </div>
      </aside>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">替换检查</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">替换店内旧二维码前检查</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <div v-for="item in replacementChecklist" :key="item" class="flex items-start gap-3 px-5 py-3">
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-amber-topbar-border bg-amber-content-bg text-[10px] font-mono text-amber-text-muted">✓</span>
            <p class="text-[10.5px] leading-relaxed text-amber-text-muted">{{ item }}</p>
          </div>
        </div>
      </div>

      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">平台说明</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">平台配置说明</h3>
        </div>
        <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
          <article v-for="note in platformNotes" :key="note.title" class="border border-amber-topbar-border bg-white/45 p-4">
            <div class="text-[12px] font-sans font-semibold text-amber-dark">{{ note.title }}</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ note.desc }}</p>
            <div class="mt-3 break-all font-mono text-[10px] leading-relaxed text-amber-dark">{{ note.value }}</div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { appStore } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'
import {
  CLIENT_WEB_BASE_URL,
  DOUYIN_APP_ID,
  WECHAT_APP_ID,
  buildEntryPayload,
  getEntryTypeFromRouteName,
  validateEntryParams,
  type ChannelHint,
  type EntryType,
} from './shareLinkOperations'

const route = useRoute()
const selectedEntryType = ref<EntryType>('STORE')
const selectedChannel = ref<ChannelHint>('STORE')
const selectedStoreId = ref('')
const { notice, pushNotice } = useNotice()
const { copyingKey, copiedKey, copyText } = useCopyWithState()
const qrWrap = ref<HTMLElement | null>(null)

const entryConfigs = [
  {
    type: 'STORE' as const,
    label: '现场预约通道 / 底片下载',
    badge: '店内桌牌',
    desc: '替换店里当前“现场预约通道、底片下载”的桌牌。扫码后先进入门店入口，再选择预约、取片或查订单。',
    materialTitle: '现场预约通道 / 底片下载',
    materialSubtitle: '适合放在收银台、化妆区、取片区，承接最多场景。',
    printCopy: '扫码下单，方便下载无损底片。',
  },
  {
    type: 'BOOKING' as const,
    label: '扫码预约证件照',
    badge: '预约入口',
    desc: '替换“扫码预约证件照”的独立桌牌。扫码后直达选择项目、门店日期和时段。',
    materialTitle: '扫码预约证件照',
    materialSubtitle: '适合门口、前台和证件照专区，减少店员口头引导。',
    printCopy: '扫码预约证件照，选择门店日期和到店时段。',
  },
  {
    type: 'PICKUP' as const,
    label: '客户取片入口',
    badge: '取片码',
    desc: '客户用手机号和取片码进入自己的相册。只走后端鉴权和短期图片地址，不暴露 OSS 永久链接。',
    materialTitle: '客户取片入口',
    materialSubtitle: '适合交付区和售后说明页，客户自己查相册。',
    printCopy: '扫码取片，输入手机号和取片码查看相册。',
  },
  {
    type: 'ORDER' as const,
    label: '我的订单入口',
    badge: '查单',
    desc: '客户用订单手机号查看预约状态、门店和到店时间。抖音来客订单同步后也进入统一订单账本。',
    materialTitle: '我的订单',
    materialSubtitle: '适合需要客户确认预约状态和到店信息的场景。',
    printCopy: '扫码查看订单，确认门店、项目和到店时间。',
  },
]

const quickEntryFilters = [
  { key: 'STORE' as const, label: '现场通道' },
  { key: 'BOOKING' as const, label: '扫码预约' },
  { key: 'PICKUP' as const, label: '底片取片' },
  { key: 'ORDER' as const, label: '我的订单' },
]

const activeStore = computed(() =>
  appStore.stores.find(store => String(store.backendId) === selectedStoreId.value) ?? appStore.stores[0],
)

const activeConfig = computed(() =>
  entryConfigs.find(entry => entry.type === selectedEntryType.value) ?? entryConfigs[0],
)

const pageTitle = computed(() => {
  if (route.name === 'tool-booking-entry') return '客户预约入口'
  if (route.name === 'tool-pickup-entry') return '取片入口'
  return '二维码与分享链接'
})

const entryPayload = computed(() => buildEntryPayload({
  storeId: String(activeStore.value?.backendId ?? ''),
  entryType: selectedEntryType.value,
  channel: selectedChannel.value,
}))

const paramValidation = computed(() => validateEntryParams(
  String(activeStore.value?.backendId ?? ''),
  selectedEntryType.value,
  selectedChannel.value,
))

const activeEntry = computed(() => ({
  ...activeConfig.value,
  miniappPath: entryPayload.value.miniappPath,
  scene: entryPayload.value.scene,
  h5Url: entryPayload.value.h5Url,
  qrValue: entryPayload.value.qrValue,
}))

const operationCards = computed(() => [
  {
    label: '门店入口',
    value: appStore.stores.length ? `${appStore.stores.length} 个` : '待加载',
    hint: '二维码必须带 storeId，避免扫码后进错门店。',
    action: activeStore.value?.name ?? '未选择',
    scope: '门店',
  },
  {
    label: '微信小程序',
    value: '已配置',
    hint: '正式桌牌优先生成微信小程序码。',
    action: WECHAT_APP_ID,
    scope: '微信',
  },
  {
    label: '抖音小程序',
    value: '预留',
    hint: '同一套入口参数后续可生成抖音码。',
    action: DOUYIN_APP_ID,
    scope: '抖音',
  },
  {
    label: 'H5 兜底',
    value: '引导',
    hint: '客户网页不创建预约，只做取片和小程序预约引导。',
    action: 'client-web',
    scope: 'H5',
  },
])

const replacementChecklist = [
  '旧的 yuyue123.cn 或别人小程序码不能接管，必须重新生成影约云自己的微信小程序码并替换桌牌。',
  '每家店单独生成二维码，确认 storeId、门店名称、入口类型和桌牌文案一致。',
  '微信小程序后台 request、uploadFile、downloadFile 合法域名保持 https://api.evanshine.me。',
  '正式预约进入小程序；电脑网页只做官网、取片和小程序预约引导，不在网页里新建预约。',
  '贴到门店前，使用店员手机扫码验证能进入对应门店和对应入口。',
]

const platformNotes = [
  {
    title: '微信小程序码',
    desc: '后台生成无限制小程序码时，page 填页面路径，scene 填短参数。',
    value: `appid=${WECHAT_APP_ID}`,
  },
  {
    title: '抖音小程序',
    desc: '当前 AppID 已沉淀，后续抖音端复用 entry、storeId、channel 参数。',
    value: `appid=${DOUYIN_APP_ID}`,
  },
  {
    title: '核心后端',
    desc: '所有订单、相册、取片权限和 OSS 私有签名仍在统一后端。',
    value: 'https://api.evanshine.me',
  },
  {
    title: '客户网页兜底',
    desc: '客户 PC 网页只承接官网、取片和小程序预约引导。',
    value: CLIENT_WEB_BASE_URL,
  },
]

const resetToDefault = () => {
  selectedChannel.value = 'STORE'
  syncEntryTypeFromRoute()
}

const syncEntryTypeFromRoute = () => {
  selectedEntryType.value = getEntryTypeFromRouteName(route.name)
}

const copyLink = async (value: string, key: string) => {
  const ok = await copyText(value, key)
  pushNotice(ok ? 'success' : 'error', ok ? '已复制到剪贴板' : '复制失败，请手动选择文本复制')
}

const downloadQr = () => {
  const canvas = qrWrap.value?.querySelector('canvas')
  if (!canvas) {
    pushNotice('error', '未找到二维码画布，请刷新后重试')
    return
  }
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `yingyue-${activeStore.value?.backendId ?? 'store'}-${selectedEntryType.value.toLowerCase()}-qr.png`
  link.click()
  pushNotice('success', '二维码图片已生成下载')
}

watch(() => route.name, syncEntryTypeFromRoute)

onMounted(() => {
  syncEntryTypeFromRoute()
  if (!selectedStoreId.value && appStore.stores[0]) {
    selectedStoreId.value = String(appStore.stores[0].backendId)
  }
})

watch(
  () => appStore.stores,
  stores => {
    if (!selectedStoreId.value && stores[0]) {
      selectedStoreId.value = String(stores[0].backendId)
    }
  },
  { deep: true },
)
</script>
