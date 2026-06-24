<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero settings-hero rounded-[24px] p-6">
      <div class="relative z-[1] flex items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1A1814,#6C5630_54%,#B8842E)] text-[#F4EFE6] shadow-[0_18px_38px_rgba(26,24,20,0.22)]">
            <SlidersHorizontal :size="26" :stroke-width="1.8" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="inline-flex w-fit items-center rounded-full border border-amber-accent/25 bg-amber-accent/[0.10] px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] leading-none text-amber-accent">System Settings</span>
            <h2 class="mt-2 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">工作台运行中枢</h2>
            <p class="mt-1 max-w-[660px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
              管理门店工作台入口、安全边界、接口模式和客户取片说明；首屏使用渐变品牌块和半透明运行卡片，方便店员快速判断当前环境。
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-done)]">运行体检</span>
              <span class="rounded-full border border-[var(--color-status-confirmed-border)] bg-[var(--color-status-confirmed-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-status-confirmed)]">安全等级 · STAFF</span>
              <span class="rounded-full border border-amber-topbar-border/60 bg-white/55 px-3 py-1 text-[12px] font-semibold text-amber-text-muted">客户入口隔离</span>
            </div>
          </div>
        </div>
      </div>
      <div class="relative z-[1] rounded-[24px] border border-amber-topbar-border/60 bg-white/78 px-4 py-3 text-right shadow-sm backdrop-blur max-[760px]:w-full max-[760px]:text-left">
        <div class="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">Current Staff</div>
        <div class="mt-1 text-[14px] font-sans font-bold text-amber-dark">{{ staffLabel }}</div>
        <div class="mt-2 flex items-center justify-end gap-2 text-[11px] text-[var(--color-status-done)] max-[760px]:justify-start">
          <span class="h-2 w-2 rounded-full bg-[var(--color-status-done)]"></span>
          员工入口独立运行
        </div>
        <button
          class="yy-action mt-3 min-h-[36px] rounded-xl border border-amber-topbar-border/70 bg-white/70 px-3 py-2 text-[12px] font-semibold text-amber-dark hover:bg-white disabled:opacity-60"
          type="button"
          :disabled="copyingRuntimeKey === 'runtime-handoff'"
          @click="copyRuntimeHandoff"
        >
          {{ copyingRuntimeKey === 'runtime-handoff' ? '复制中...' : copiedRuntimeKey === 'runtime-handoff' ? '已复制' : '复制运行交接包' }}
        </button>
      </div>
    </section>

    <section class="settings-ops-board yy-glass-panel yy-console-card rounded-2xl">
      <div class="relative z-[1] border-b border-amber-topbar-border/60 p-5 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Settings Flow</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">工作台安全与运行状态</h3>
          <p class="mt-1 max-w-[560px] text-[13px] font-sans leading-relaxed text-amber-text-muted">
            先确认员工入口，再看接口模式、客户取片安全和可运营数据范围。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickSettingFilters"
            :key="filter.key"
            class="yy-action min-h-[36px] px-3.5 py-2 border rounded-xl text-[12px] font-sans font-semibold transition-all"
            :class="activeSettingFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6] shadow-[0_10px_24px_rgba(26,24,20,0.12)]' : 'border-amber-topbar-border/70 bg-white/75 text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeSettingFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="relative z-[1] grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(item, idx) in settingOperationCards"
          :key="item.label"
          class="yy-surface yy-console-card relative overflow-hidden rounded-2xl border border-amber-topbar-border/70 p-4 shadow-sm backdrop-blur"
        >
          <div class="absolute inset-x-0 top-0 h-[3px]" :class="settingAccentColors[idx]"></div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[13px] font-sans font-bold text-amber-dark">{{ item.label }}</div>
              <div class="mt-1 text-[12px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
            </div>
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-topbar-border/60 bg-amber-content-bg text-amber-accent">
              <ShieldCheck v-if="item.icon === 'shield'" :size="18" :stroke-width="1.8" />
              <PlugZap v-else-if="item.icon === 'plug'" :size="18" :stroke-width="1.8" />
              <ImageDown v-else-if="item.icon === 'image'" :size="18" :stroke-width="1.8" />
              <Database v-else :size="18" :stroke-width="1.8" />
            </div>
          </div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[26px] font-sans font-black tabular-nums leading-none text-amber-dark">{{ item.value }}</strong>
            <span class="rounded-full bg-amber-dark/[0.06] px-2.5 py-1 text-[11px] font-mono font-semibold text-amber-text-muted">{{ item.scope }}</span>
          </div>
          <div class="mt-3 text-[11.5px] font-sans font-semibold text-amber-text-muted">{{ item.action }}</div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-amber-content-bg/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
        <div class="border-b border-amber-topbar-border/60 bg-white/56 p-5">
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Setting Groups</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">设置分组</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <article
            v-for="group in filteredSettingGroups"
            :key="group.title"
            class="yy-clickable-row p-5 flex gap-4 max-[640px]:flex-col"
          >
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-accent/12 text-[14px] font-mono font-black text-amber-accent">
              {{ group.code }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-[15px] font-sans font-bold text-amber-dark">{{ group.title }}</h4>
                <span class="rounded-full border border-amber-topbar-border/60 bg-white/60 px-2.5 py-0.5 text-[11px] font-sans font-semibold text-amber-text-muted">{{ group.status }}</span>
              </div>
              <p class="mt-2 text-[13px] font-sans leading-relaxed text-amber-text-muted">{{ group.desc }}</p>
              <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div
                  v-for="item in group.items"
                  :key="item"
                  class="rounded-xl border border-amber-topbar-border/60 bg-white/52 px-3 py-2 text-[12px] font-sans leading-relaxed text-amber-text-muted"
                >
                  {{ item }}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <aside class="overflow-hidden rounded-2xl border border-amber-topbar-border/70 bg-white/78 shadow-[0_18px_44px_rgba(26,24,20,0.06)] backdrop-blur">
        <div class="border-b border-amber-topbar-border/60 bg-white/56 p-5">
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Safety Boundary</span>
          <h3 class="mt-1 text-[20px] font-sans font-black text-amber-dark">入口边界</h3>
          <p class="mt-2 text-[13px] font-sans leading-relaxed text-amber-text-muted">
            门店员工、客户电脑网页、客户小程序各走独立入口和独立登录态，不混用 token。
          </p>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <div
            v-for="entry in entryBoundaries"
            :key="entry.label"
            class="yy-clickable-row p-5"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-[14px] font-sans font-bold text-amber-dark">{{ entry.label }}</span>
              <span class="rounded-full border border-amber-topbar-border/60 bg-white/60 px-2.5 py-0.5 text-[11px] font-sans font-semibold text-amber-text-muted">{{ entry.scope }}</span>
            </div>
            <p class="mt-2 text-[12.5px] font-sans leading-relaxed text-amber-text-muted">{{ entry.desc }}</p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Database, ImageDown, PlugZap, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { getStaffSession, STAFF_SESSION_KEY } from '../../shared/auth/staffSession'
import { appStore } from '../../shared/stores/appStore'

const activeSettingFilter = ref<'all' | 'security' | 'runtime'>('all')
const session = getStaffSession()
const { copyingKey: copyingRuntimeKey, copiedKey: copiedRuntimeKey, copyText } = useCopyWithState()

const staffLabel = computed(() => {
  if (!session) return '未检测到员工会话'
  return `${session.username} · ${session.role}`
})

const runtimeMode = computed(() => (appStore.demoMode ? 'Demo' : 'API'))
const apiState = computed(() => (appStore.apiError ? '有提示' : '正常'))
const customerAssetScope = computed(() => `${appStore.albums.length} 相册 / ${appStore.selectionLinks.length} 入口`)

const settingOperationCards = computed(() => [
  {
    label: '员工会话',
    value: session ? '已登录' : '未登录',
    hint: `本地员工会话 key：${STAFF_SESSION_KEY}`,
    action: '独立于客户',
    scope: 'STAFF',
    icon: 'shield',
  },
  {
    label: '接口模式',
    value: runtimeMode.value,
    hint: appStore.demoMode ? '当前使用本地演示数据兜底。' : '当前走影约云后端 API。',
    action: apiState.value,
    scope: 'API',
    icon: 'plug',
  },
  {
    label: '客户取片',
    value: customerAssetScope.value,
    hint: '客户仍走手机号、取片码和短期授权链路。',
    action: '不混用',
    scope: 'CLIENT',
    icon: 'image',
  },
  {
    label: '可运营数据',
    value: `${appStore.stores.length} 门店`,
    hint: `产品 ${appStore.products.length} 个，订单 ${appStore.orders.length} 单。`,
    action: '可演示',
    scope: 'DATA',
    icon: 'data',
  },
])

const settingAccentColors = [
  'bg-[var(--color-status-done)]',
  'bg-[var(--color-status-confirmed)]',
  'bg-[var(--color-status-shooting)]',
  'bg-[var(--color-status-pending)]',
]

const settingGroups = computed(() => [
  {
    code: '01',
    type: 'security',
    title: '员工入口与权限边界',
    status: session ? '已登录' : '需登录',
    desc: '门店工作台只服务员工处理订单、日程、客片和选片配置，不承载客户取片登录。',
    items: [
      `员工会话：${STAFF_SESSION_KEY}`,
      '客户入口：client-web / mobile-uniapp',
      '后续接真实门店角色和 RuoYi 权限',
      '退出登录只清理员工工作台会话',
    ],
  },
  {
    code: '02',
    type: 'runtime',
    title: '接口模式与演示兜底',
    status: runtimeMode.value,
    desc: '默认可用 demo 数据演示；设置 VITE_STUDIO_DEMO=false 后走真实 /yy/* 和 OSS 上传闭环。',
    items: [
      `接口状态：${apiState.value}`,
      `门店数量：${appStore.stores.length}`,
      `产品数量：${appStore.products.length}`,
      appStore.apiError || '暂无接口错误提示',
    ],
  },
  {
    code: '03',
    type: 'security',
    title: '客户取片安全说明',
    status: '隔离',
    desc: '客户相册、预览和下载不使用门店员工 token，也不暴露后台地址或长期 OSS 链接。',
    items: [
      '客户 H5/小程序：手机号 + 取片码',
      '图片访问：短期签名 URL 或后端 stream',
      '员工工作台：只管理上传、配置和交付动作',
      '正式 OSS 继续保持私有',
    ],
  },
  {
    code: '04',
    type: 'runtime',
    title: '运营偏好',
    status: '待扩展',
    desc: '后续把通知、默认门店、默认日程视图、上传限制做成可保存配置。',
    items: [
      '默认日程：按今日和当前门店打开',
      '默认客片：优先显示待处理相册',
      '默认产品：优先显示待补规则',
      '后续接后端 staff preference',
    ],
  },
])

const filteredSettingGroups = computed(() => {
  if (activeSettingFilter.value === 'security') return settingGroups.value.filter(group => group.type === 'security')
  if (activeSettingFilter.value === 'runtime') return settingGroups.value.filter(group => group.type === 'runtime')
  return settingGroups.value
})

const quickSettingFilters = computed(() => [
  { key: 'all' as const, label: '全部设置', count: settingGroups.value.length },
  { key: 'security' as const, label: '安全边界', count: settingGroups.value.filter(group => group.type === 'security').length },
  { key: 'runtime' as const, label: '运行模式', count: settingGroups.value.filter(group => group.type === 'runtime').length },
])

const entryBoundaries = [
  {
    label: '门店工作台 PC',
    scope: 'STAFF',
    desc: '当前页面所属入口，给店员处理门店经营动作，使用员工会话。',
  },
  {
    label: '客户电脑网页',
    scope: 'CLIENT_WEB',
    desc: '客户预约、取片、打开相册，不进入门店工作台。',
  },
  {
    label: '微信/抖音小程序',
    scope: 'MINI_APP',
    desc: '共用 mobile-uniapp 和 /client/photo/*，不处理后台设置。',
  },
]

const runtimeHandoffText = computed(() => [
  '影约云门店工作台运行交接包',
  '',
  `当前员工：${staffLabel.value}`,
  `员工会话 key：${STAFF_SESSION_KEY}`,
  `接口模式：${runtimeMode.value}`,
  `接口状态：${apiState.value}`,
  `门店数量：${appStore.stores.length}`,
  `产品数量：${appStore.products.length}`,
  `订单数量：${appStore.orders.length}`,
  `相册入口：${customerAssetScope.value}`,
  '',
  '边界说明：门店工作台只处理员工业务，不承载客户预约登录。',
  '门店工作台只处理员工业务：订单处理、日程、客片、选片、员工、权限、日志和渠道配置。',
  '客户入口：客户电脑网页、微信小程序、抖音小程序；客户取片走手机号 + 取片码。',
  '核心后端：Spring Boot + PostgreSQL + Redis + 私有 OSS。',
].join('\n'))

const copyRuntimeHandoff = async () => {
  await copyText(runtimeHandoffText.value, 'runtime-handoff')
}
</script>
