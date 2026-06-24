<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero channel-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Channel Settings</span>
          <h2 class="mt-2 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">渠道接入控制台</h2>
          <p class="mt-2 max-w-[820px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
            统一查看微信、抖音、客户网页、后端 API 和回调地址。核心订单、相册、OSS 权限仍归 Spring Boot + PostgreSQL，不放到平台云里。
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span class="rounded-full border border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-done)]">渠道运行面板</span>
            <span class="rounded-full border border-[var(--color-status-confirmed-border)] bg-[var(--color-status-confirmed-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-confirmed)]">API 已统一</span>
            <span class="rounded-full border border-amber-topbar-border/60 bg-white/55 px-3 py-1 text-[12px] font-semibold text-amber-text-muted">SPI / Webhook / 域名</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="yy-action min-h-[42px] rounded-xl border border-amber-topbar-border/70 bg-white/70 px-4 py-2 text-[13px] font-semibold text-amber-dark shadow-sm hover:bg-white"
            type="button"
            @click="copyValue(API_DOMAIN)"
          >
            复制 API 域名
          </button>
          <button
            class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black disabled:opacity-60"
            type="button"
            :disabled="copyingDomainKey === 'platform-fill-checklist'"
            @click="copyPlatformFillChecklist"
          >
            {{ copyingDomainKey === 'platform-fill-checklist' ? '复制中...' : copiedDomainKey === 'platform-fill-checklist' ? '已复制' : '复制后台填写清单' }}
          </button>
        </div>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="channel-settings-board yy-glass-panel yy-console-card rounded-2xl">
      <div class="border-b border-amber-topbar-border/60 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickChannelFilters"
            :key="filter.key"
            class="yy-action min-h-[36px] rounded-xl border px-3.5 py-2 text-[12px] font-sans font-semibold transition-all"
            :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6] shadow-[0_10px_24px_rgba(26,24,20,0.12)]' : 'border-amber-topbar-border/70 bg-white/75 text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="(card, idx) in cards" :key="card.label" class="yy-surface yy-console-card relative overflow-hidden rounded-2xl border border-amber-topbar-border/70 p-4 shadow-sm backdrop-blur">
          <div class="absolute inset-x-0 top-0 h-[3px]" :class="cardAccentColors[idx]"></div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[14px] font-sans font-bold text-amber-dark">{{ card.label }}</div>
              <div class="mt-1 text-[12px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
            </div>
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-topbar-border/60 bg-amber-content-bg text-amber-accent">
              <BadgeCheck v-if="card.scope === 'CORE'" :size="18" :stroke-width="1.8" />
              <Wrench v-else-if="card.scope === 'WECHAT'" :size="18" :stroke-width="1.8" />
              <Sparkles v-else-if="card.scope === 'DOUYIN'" :size="18" :stroke-width="1.8" />
              <ShieldCheck v-else :size="18" :stroke-width="1.8" />
            </div>
          </div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[28px] font-sans font-black leading-none tabular-nums text-amber-dark">{{ card.value }}</strong>
            <span class="rounded-full bg-amber-dark/[0.06] px-2.5 py-1 text-[11px] font-mono font-semibold text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
      <div class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
        <div class="border-b border-amber-topbar-border/60 bg-white/56 px-5 py-4">
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Mini App Domains</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">小程序合法域名</h3>
          <p class="mt-2 text-[13px] leading-relaxed text-amber-text-muted">
            微信和抖音小程序后台都按同一个 API 域名配置 request、uploadFile、downloadFile。
          </p>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <article v-for="domain in miniappDomains" :key="domain.platform" class="p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-topbar-border/60 bg-white/70 text-amber-accent">
                  <Smartphone v-if="domain.platform === '微信小程序'" :size="18" :stroke-width="1.8" />
                  <Videotape v-else :size="18" :stroke-width="1.8" />
                </div>
                <div>
                  <div class="text-[14px] font-sans font-bold text-amber-dark">{{ domain.platform }}</div>
                  <div class="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ domain.appId }}</div>
                </div>
              </div>
              <span class="rounded-full border border-amber-topbar-border/60 bg-white/60 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">
                {{ domain.status }}
              </span>
            </div>
            <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                v-for="item in domain.items"
                :key="item.label"
                class="yy-action border border-amber-topbar-border bg-white/78 p-3 text-left hover:bg-black/[0.03] disabled:opacity-50"
                type="button"
                :disabled="copyingDomainKey === `${domain.platform}-${item.label}`"
                @click="copyDomain(item.value, `${domain.platform}-${item.label}`)"
              >
                <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ item.label }}</div>
                <div class="mt-1 break-all text-[12px] font-mono leading-relaxed text-amber-dark">
                  {{ copyingDomainKey === `${domain.platform}-${item.label}` ? '复制中...' : copiedDomainKey === `${domain.platform}-${item.label}` ? '已复制' : item.value }}
                </div>
              </button>
            </div>
          </article>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
        <div class="border-b border-amber-topbar-border/60 bg-white/56 px-5 py-4">
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Channel Boundary</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">渠道职责边界</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <article v-for="boundary in channelBoundaries" :key="boundary.title" class="p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h4 class="text-[14px] font-sans font-bold text-amber-dark">{{ boundary.title }}</h4>
              <span class="rounded-full border border-amber-topbar-border/60 bg-white/60 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ boundary.scope }}</span>
            </div>
            <p class="mt-2 text-[12.5px] leading-relaxed text-amber-text-muted">{{ boundary.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border/60 bg-white/56 px-5 py-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Douyin Life SPI</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">抖音来客回调 / SPI 地址</h3>
        </div>
        <button
          class="yy-action rounded-xl border border-amber-topbar-border/60 bg-white/62 px-3.5 py-2 text-[12px] font-semibold text-amber-text-muted hover:bg-white"
          type="button"
          @click="copyValue(douyinSpiLines)"
        >
          复制全部
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] font-sans font-semibold text-amber-text-muted">场景</th>
              <th class="px-5 py-3 text-[11px] font-sans font-semibold text-amber-text-muted">推荐地址</th>
              <th class="px-5 py-3 text-[11px] font-sans font-semibold text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] font-sans font-semibold text-amber-text-muted">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="callback in filteredCallbacks" :key="callback.path" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4">
                <div class="text-[12.5px] font-sans font-bold text-amber-dark">{{ callback.label }}</div>
                <div class="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ callback.type }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="break-all font-mono text-[12px] leading-relaxed text-amber-dark">{{ callback.url }}</div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px]"
                  :class="callback.required ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'"
                >
                  {{ callback.required ? '必配' : '建议' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <button
                  class="yy-action rounded-xl border border-amber-topbar-border/60 bg-white/70 px-3.5 py-2 text-[12px] font-semibold text-amber-dark hover:bg-white disabled:opacity-50"
                  type="button"
                  :disabled="copyingSpiKey === callback.path"
                  @click="copySpi(callback.url, callback.path)"
                >
                  {{ copyingSpiKey === callback.path ? '...' : copiedSpiKey === callback.path ? '已复制' : '复制' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
        <div class="border-b border-amber-topbar-border/60 bg-white/56 px-5 py-4">
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Launch Checklist</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">上线前人工确认</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <div v-for="item in launchChecklist" :key="item" class="flex items-start gap-3 px-5 py-3">
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-topbar-border bg-white/70 text-[10px] font-mono text-amber-text-muted">✓</span>
            <p class="text-[12.5px] leading-relaxed text-amber-text-muted">{{ item }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-amber-topbar-border/70 bg-[linear-gradient(135deg,#1A1814,#2B2520_50%,#1A1814)] p-6 text-[#F4EFE6] shadow-[0_18px_44px_rgba(26,24,20,0.16)]">
        <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-[#F4EFE6]/55">Important</span>
        <h3 class="mt-2 text-[18px] font-sans font-medium">不要再把 `yingyueyun` 当新回调首选</h3>
        <p class="mt-3 text-[11px] leading-relaxed text-[#F4EFE6]/70">
          `api.evanshine.me` 是正式后端 API 域名。`yingyueyun.evanshine.me` 是历史兼容入口，仍可用于客户网页或旧链路排障，但新增开放平台 Webhook、SPI、小程序 request/download/upload 配置时都优先使用 `api.evanshine.me`。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BadgeCheck, ShieldCheck, Smartphone, Sparkles, Videotape, Wrench } from 'lucide-vue-next'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'

type FilterKey = 'all' | 'required' | 'optional'

const API_DOMAIN = 'https://api.evanshine.me'
const WECHAT_APP_ID = 'wx2a1a34748f56a6c6'
const DOUYIN_APP_ID = 'tta3c8d5753dac3aae01'

const activeFilter = ref<FilterKey>('all')
const { notice, pushNotice } = useNotice()
const { copyingKey: copyingDomainKey, copiedKey: copiedDomainKey, copyText: copyDomainText } = useCopyWithState()
const { copyingKey: copyingSpiKey, copiedKey: copiedSpiKey, copyText: copySpiText } = useCopyWithState()

const callbacks = [
  { label: '事件订阅 Webhook', type: 'WEBHOOK', path: '/api/douyin/life/webhook', required: true },
  { label: '三方码发券', type: 'SPI', path: '/api/douyin/life/tripartite-code/create', required: true },
  { label: '退款申请', type: 'SPI', path: '/api/douyin/life/refund/apply', required: true },
  { label: '退款结果通知', type: 'SPI', path: '/api/douyin/life/refund/notify', required: false },
  { label: '综合预约订单创建', type: 'SPI', path: '/api/douyin/life/reservation/order-create', required: true },
  { label: '综合预约支付通知', type: 'SPI', path: '/api/douyin/life/reservation/pay-notify', required: true },
  { label: '综合预约三方订单查询', type: 'SPI', path: '/api/douyin/life/reservation/order-query', required: true },
  { label: '预约库存查询', type: 'SPI', path: '/api/douyin/life/reservation/stock-query', required: true },
  { label: '券撤销核销', type: 'SPI', path: '/api/douyin/life/voucher/revoke', required: false },
  { label: '跨订单批量撤销核销', type: 'SPI', path: '/api/douyin/life/voucher/batch-revoke', required: false },
  { label: '订单查询', type: 'OPENAPI', path: '/api/douyin/life/order/query', required: false },
  { label: '对账信息同步', type: 'SPI', path: '/api/douyin/life/fulfil/check-info-sync', required: false },
].map(item => ({ ...item, url: `${API_DOMAIN}${item.path}` }))

const miniappDomains = [
  {
    platform: '微信小程序',
    appId: WECHAT_APP_ID,
    status: 'request/upload/download',
    items: [
      { label: 'request', value: API_DOMAIN },
      { label: 'uploadFile', value: API_DOMAIN },
      { label: 'downloadFile', value: API_DOMAIN },
    ],
  },
  {
    platform: '抖音小程序',
    appId: DOUYIN_APP_ID,
    status: 'request/upload/download',
    items: [
      { label: 'request', value: API_DOMAIN },
      { label: 'uploadFile', value: API_DOMAIN },
      { label: 'downloadFile', value: API_DOMAIN },
    ],
  },
]

const channelBoundaries = [
  {
    title: '微信小程序',
    scope: 'WECHAT_MINI_APP',
    desc: '客户预约、支付、取片入口；后续接微信手机号授权和微信支付，订单仍写入 yy_order。',
  },
  {
    title: '抖音来客',
    scope: 'DOUYIN_LIFE',
    desc: '真实团购/预约支付、发码、退款、核销和订单同步；通过回调和 OpenAPI 同步到本地数据库。',
  },
  {
    title: '抖音小程序',
    scope: 'DOUYIN_MINI_APP',
    desc: '客户取片和后续小程序内支付入口；不承接生活服务 SPI。',
  },
  {
    title: '客户电脑网页',
    scope: 'CLIENT_WEB',
    desc: '官网展示、客户取片和小程序预约引导；不创建网页预约订单。',
  },
]

const filteredCallbacks = computed(() => {
  if (activeFilter.value === 'required') return callbacks.filter(item => item.required)
  if (activeFilter.value === 'optional') return callbacks.filter(item => !item.required)
  return callbacks
})

const quickChannelFilters = computed(() => [
  { key: 'all' as const, label: '全部地址', count: callbacks.length },
  { key: 'required' as const, label: '必配', count: callbacks.filter(item => item.required).length },
  { key: 'optional' as const, label: '建议', count: callbacks.filter(item => !item.required).length },
])

const cards = computed(() => [
  {
    label: '正式 API',
    value: 'api',
    hint: API_DOMAIN,
    scope: 'CORE',
  },
  {
    label: '微信小程序',
    value: '已建',
    hint: WECHAT_APP_ID,
    scope: 'WECHAT',
  },
  {
    label: '抖音小程序',
    value: '已建',
    hint: DOUYIN_APP_ID,
    scope: 'DOUYIN',
  },
  {
    label: '来客 SPI',
    value: `${callbacks.filter(item => item.required).length} 必配`,
    hint: '抖音生活服务回调统一走 api.evanshine.me。',
    scope: 'LIFE',
  },
])

const cardAccentColors = [
  'bg-[var(--color-status-done)]',
  'bg-[var(--color-status-confirmed)]',
  'bg-[var(--color-status-shooting)]',
  'bg-[var(--color-status-pending)]',
]

const launchChecklist = [
  '微信小程序后台 request、uploadFile、downloadFile 合法域名都填 https://api.evanshine.me。',
  '抖音小程序后台 request、uploadFile、downloadFile 合法域名都填 https://api.evanshine.me。',
  '抖音开放平台 Webhook challenge 返回 application/json，body 为 {"challenge": 原值}。',
  '抖音来客 SPI 新增或修改时优先填 api.evanshine.me，不再优先填 yingyueyun.evanshine.me。',
  '真实订单同步、支付通知、库存查询都记录 X-Bytedance-Logid，便于验收和排障。',
]

const douyinSpiLines = computed(() => callbacks.map(item => item.url).join('\n'))
const platformFillChecklist = computed(() => [
  '影约云平台后台填写清单',
  '',
  '1. 微信小程序合法域名',
  `AppID：${WECHAT_APP_ID}`,
  `request：${API_DOMAIN}`,
  `uploadFile：${API_DOMAIN}`,
  `downloadFile：${API_DOMAIN}`,
  '',
  '2. 抖音小程序合法域名',
  `AppID：${DOUYIN_APP_ID}`,
  `request：${API_DOMAIN}`,
  `uploadFile：${API_DOMAIN}`,
  `downloadFile：${API_DOMAIN}`,
  '',
  '3. 抖音开放平台事件订阅',
  `${API_DOMAIN}/api/douyin/life/webhook`,
  'Webhook challenge：返回 application/json，body 为 {"challenge": 原值}',
  '',
  '4. 抖音来客 SPI / OpenAPI 推荐地址',
  douyinSpiLines.value,
  '',
  '5. 边界说明',
  'api.evanshine.me 是正式后端 API 域名；yingyueyun.evanshine.me 只作为历史兼容入口。',
  '微信云/抖音云只做可选 BFF，不维护主订单、主相册或 OSS 权限账本。',
].join('\n'))

const copyValue = async (value: string) => {
  const ok = await copyDomainText(value, 'all')
  pushNotice(ok ? 'success' : 'error', ok ? '已复制到剪贴板' : '复制失败，请手动选择文本复制')
}

const copyDomain = async (value: string, key: string) => {
  const ok = await copyDomainText(value, key)
  pushNotice(ok ? 'success' : 'error', ok ? '已复制到剪贴板' : '复制失败，请手动选择文本复制')
}

const copySpi = async (value: string, key: string) => {
  const ok = await copySpiText(value, key)
  pushNotice(ok ? 'success' : 'error', ok ? '已复制到剪贴板' : '复制失败，请手动选择文本复制')
}

const copyPlatformFillChecklist = async () => {
  const ok = await copyDomainText(platformFillChecklist.value, 'platform-fill-checklist')
  pushNotice(ok ? 'success' : 'error', ok ? '后台填写清单已复制' : '复制失败，请手动选择文本复制')
}
</script>
