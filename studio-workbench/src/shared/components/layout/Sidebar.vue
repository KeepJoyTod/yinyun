<template>
  <aside class="relative flex h-full w-sidebar flex-col overflow-hidden border-r border-amber-sidebar-border bg-[linear-gradient(180deg,rgba(26,24,20,0.96),rgba(26,24,20,0.88)_32%,rgba(35,31,27,0.96))] shadow-[20px_0_58px_rgba(26,24,20,0.20)] backdrop-blur-2xl">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_16%_8%,rgba(255,229,171,0.30),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%)]"></div>
    <div class="pointer-events-none absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12),transparent)]"></div>
    <div class="relative border-b border-amber-sidebar-border px-4 py-3">
      <div class="yy-sidebar-brand-card relative overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.06] p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <span class="yy-sidebar-brand-aura pointer-events-none absolute -right-10 -top-14 h-24 w-24 rounded-full"></span>
        <div class="relative z-[1] flex items-center gap-2.5">
          <div class="yy-sidebar-logo-orb flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-amber-accent/35 bg-white/[0.09] shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            <img src="../../../assets/icons/logo.svg" alt="影约云" class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="yy-brand-gradient font-sans text-[21px] font-black leading-none tracking-[0.02em]">影约云</h1>
            <p class="mt-1 truncate font-mono text-[9.5px] uppercase tracking-[0.2em] text-amber-accent-soft/72">Studio Workbench</p>
          </div>
        </div>
      </div>

      <label class="mt-3 flex h-8 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 text-[#F4EFE6]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-amber-accent/45">
        <img src="../../../assets/icons/search.svg" alt="" class="h-3.5 w-3.5 invert opacity-60" />
        <input
          v-model.trim="menuSearch"
          type="search"
          placeholder="查找功能"
          class="min-w-0 flex-1 bg-transparent text-[12px] text-[#F4EFE6] outline-none placeholder:text-[#F4EFE6]/38"
        />
        <button v-if="menuSearch" class="yy-action text-[11px] text-[#F4EFE6]/55" type="button" aria-label="清空菜单搜索" @click="menuSearch = ''">
          清除
        </button>
      </label>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-3" aria-label="门店工作台导航">
      <div v-for="group in filteredGroups" :key="group.key" class="mb-1.5">
        <button
          class="yy-action sidebar-group-trigger group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left"
          type="button"
          :aria-expanded="isGroupOpen(group.key)"
          @click="toggleGroup(group.key)"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-[#F4EFE6]/75 transition-colors group-hover:border-amber-accent/40 group-hover:text-[#F4EFE6]">
            <component :is="getGroupIcon(group.key)" :size="16" :stroke-width="1.85" />
          </span>
          <span class="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-[0.02em] text-[#F4EFE6]/82">{{ group.label }}</span>
          <span class="min-w-6 rounded-full border border-white/12 bg-white/[0.05] px-1.5 py-[2px] text-center font-mono text-[11px] text-[#F4EFE6]/54">{{ group.features.length }}</span>
          <ChevronDown
            :size="15"
            :stroke-width="1.9"
            class="shrink-0 text-[#F4EFE6]/52 transition-transform duration-200"
            :class="isGroupOpen(group.key) ? 'rotate-180 text-amber-accent' : ''"
          />
        </button>

        <div v-show="isGroupOpen(group.key)" class="space-y-[3px] pb-2 pl-2">
          <SidebarItem
            v-for="feature in group.features"
            :key="feature.key"
            :to="feature.path"
            :icon="feature.icon"
            :label="feature.label"
            :badge="feature.badge"
            :status="feature.status"
            :pending-count="feature.pendingCount"
          />
        </div>
      </div>

      <div v-if="filteredGroups.length === 0" class="px-3 py-8 text-center text-[13px] leading-6 text-[#F4EFE6]/60">
        没有匹配的功能
      </div>
    </nav>

    <div class="mt-auto border-t border-amber-sidebar-border p-3">
      <button class="yy-action flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-nav-item font-medium text-[#F4EFE6]/78 hover:bg-white/5 hover:text-[#F4EFE6]" @click="logout">
        <img src="../../../assets/icons/logout.svg" alt="" class="h-4 w-4 invert opacity-65" />
        <span class="flex-1 text-left">退出登录</span>
      </button>

      <div class="mt-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-accent text-[13px] font-bold text-amber-content-bg shadow-[0_8px_20px_rgba(184,132,46,0.25)]">
          {{ staffInitial }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-bold text-[#F4EFE6]">{{ staffName }}</p>
          <p class="truncate text-[10.5px] uppercase tracking-wider text-[#F4EFE6]/52">{{ staffRole }}</p>
          <p v-if="storeScope" class="mt-0.5 truncate text-[10.5px] text-[#F4EFE6]/45">{{ storeScope }}</p>
          <p v-if="stores.length > 1" class="mt-0.5 truncate text-[10px] text-[#F4EFE6]/30">
            {{ stores.length }} 家门店{{ primaryStore ? ' · ' + primaryStore : '' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  FolderOpen,
  Handshake,
  Images,
  Megaphone,
  Package,
  PanelLeft,
  Settings,
  Store,
  UsersRound,
  Wrench,
} from 'lucide-vue-next'
import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getFeaturePendingCount,
  workbenchFeatures,
  workbenchGroups,
} from '../../../app/router/featureRegistry'
import { clearApiToken } from '../../api/request'
import { clearStaffSession, getStaffSession } from '../../auth/staffSession'
import { appStore } from '../../stores/appStore'
import { studioAccessStore } from '../../stores/studioAccessStore'
import SidebarItem from './SidebarItem.vue'

const router = useRouter()
const route = useRoute()
const session = getStaffSession()
const menuSearch = ref('')
const expandedGroups = ref<string[]>(['home', 'order', 'service'])
const roleTypeLabelMap: Record<string, string> = {
  STORE_MANAGER: '门店管理员',
  PHOTOGRAPHER: '摄影师',
  RETOUCHER: '修图师',
  FRONT_DESK: '前台',
  ASSISTANT: '助理',
  SALES: '销售',
}
const groupIconMap = {
  home: CalendarCheck,
  merchant: Store,
  product: Package,
  order: ClipboardList,
  service: Images,
  collaboration: Handshake,
  resource: FolderOpen,
  member: UsersRound,
  tool: Wrench,
  marketing: Megaphone,
  report: BarChart3,
  settings: Settings,
} as const
const getGroupIcon = (key: string) => groupIconMap[key as keyof typeof groupIconMap] || PanelLeft
const normalizeDisplayName = (value?: string | null) => String(value ?? '').trim()
const isPlaceholderIdentityName = (value?: string | null) => {
  const normalized = normalizeDisplayName(value).toLocaleLowerCase()
  if (!normalized) return true
  return normalized.includes('演示账号')
    || normalized.includes('demo')
}
const toRoleLabel = (value?: string | null) => {
  const normalized = normalizeDisplayName(value).toUpperCase()
  if (!normalized) return ''
  return roleTypeLabelMap[normalized] || normalizeDisplayName(value)
}
const staffName = computed(() =>
  [
    studioAccessStore.identity?.employeeName,
    studioAccessStore.identity?.nickname,
    studioAccessStore.identity?.username,
    session?.username,
  ].find(value => !isPlaceholderIdentityName(value))
  || (studioAccessStore.identity?.roleType === 'STORE_MANAGER' ? '门店管理员' : '')
  || normalizeDisplayName(studioAccessStore.identity?.username)
  || normalizeDisplayName(session?.username)
  || '门店账号',
)
const staffRole = computed(() =>
  toRoleLabel(studioAccessStore.identity?.roleType)
  || toRoleLabel(session?.role)
  || '门店主管',
)
const storeScope = computed(() =>
  studioAccessStore.globalStoreScope
    ? '全部门店'
    : primaryStore.value || studioAccessStore.stores[0]?.storeName || '',
)
const staffInitial = computed(() => staffName.value.trim().slice(0, 1) || '店')
const stores = computed(() => studioAccessStore.stores)
const primaryStore = computed(() =>
  stores.value.find(s => s.primary)?.storeName,
)

const filteredGroups = computed(() => {
  const query = menuSearch.value.toLocaleLowerCase()
  return workbenchGroups
    .map(group => ({
      ...group,
      features: workbenchFeatures
        .map(feature => ({
          ...feature,
          status: getEffectiveFeatureStatus(feature, studioAccessStore.featureStatuses),
          pendingCount: getFeaturePendingCount(feature.key, studioAccessStore.pending),
        }))
        .filter(feature => {
          const isVisible = feature.status !== 'hidden'
          if (
            feature.group !== group.key
            || !isVisible
            || !canAccessWorkbenchFeature(feature, studioAccessStore.menuPermissions)
          ) return false
          if (!query) return true
          return `${feature.label} ${feature.description}`.toLocaleLowerCase().includes(query)
        }),
    }))
    .filter(group => group.features.length > 0)
})

const isGroupOpen = (key: string) => Boolean(menuSearch.value) || expandedGroups.value.includes(key)

const toggleGroup = (key: string) => {
  if (menuSearch.value) return
  expandedGroups.value = expandedGroups.value.includes(key)
    ? expandedGroups.value.filter(item => item !== key)
    : [...expandedGroups.value, key]
}

watch(
  () => route.path,
  path => {
    const group = workbenchFeatures.find(feature => feature.path === path)?.group
    if (group && !expandedGroups.value.includes(group)) expandedGroups.value = [...expandedGroups.value, group]
  },
  { immediate: true },
)

const logout = () => {
  studioAccessStore.reset()
  appStore.resetRuntime()
  clearStaffSession()
  clearApiToken()
  router.replace('/login')
}
</script>
