<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Roles &amp; Permissions</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] text-amber-dark">权限体检控制台</h2>
          <p class="mt-2 max-w-[780px] text-[13.5px] leading-relaxed text-amber-text-muted">
            工作台只负责门店业务权限体检和说明，系统级角色、菜单和授权仍在 RuoYi 后台维护。
          </p>
        </div>
        <button
          class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black"
          type="button"
          @click="copyMissingPermissions"
        >
          复制缺失权限
        </button>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in roleHealthCards"
          :key="card.label"
          class="yy-console-card rounded-2xl border border-amber-topbar-border/70 bg-white/58 p-4 shadow-sm backdrop-blur"
        >
          <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ card.label }}</div>
          <div class="mt-1 text-[24px] font-sans font-black tabular-nums text-amber-dark">{{ card.value }}</div>
          <div class="mt-1 text-[11px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        </article>
      </div>
    </section>

    <section v-if="missingPermissions.length" class="yy-console-card border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)]">
      <div class="border-b border-[var(--color-status-danger-border)] px-5 py-4">
        <div class="flex items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-status-danger)]">Missing Permissions</span>
            <h3 class="mt-1 text-[15px] font-medium text-[var(--color-status-danger)]">缺失权限 {{ missingPermissions.length }} 项</h3>
            <p class="mt-1 text-[10.5px] leading-relaxed text-[var(--color-status-danger)]/75">
              这些菜单已经在工作台注册，但当前账号还没有拿到对应授权。
            </p>
          </div>
          <button
            class="yy-action rounded-xl border border-[var(--color-status-danger)] bg-[var(--color-status-danger)] px-4 py-2 text-[11px] font-medium text-white"
            type="button"
            @click="copyMissingPermissions"
          >
            复制缺失权限
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] border-collapse">
          <thead>
            <tr class="border-b border-[var(--color-status-danger-border)]/80 bg-black/[0.03] text-left">
              <th class="px-5 py-3 text-[11px] text-[var(--color-status-danger)]">菜单名称</th>
              <th class="px-5 py-3 text-[11px] text-[var(--color-status-danger)]">路由</th>
              <th class="px-5 py-3 text-[11px] text-[var(--color-status-danger)]">权限码</th>
              <th class="px-5 py-3 text-[11px] text-[var(--color-status-danger)]">模块</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-status-danger-border)]/60">
            <tr v-for="perm in missingPermissions" :key="perm.key">
              <td class="px-5 py-3 text-[11px] font-semibold text-[var(--color-status-danger)]">{{ perm.label }}</td>
              <td class="px-5 py-3 font-mono text-[10px] text-[var(--color-status-danger)]/75">{{ perm.path }}</td>
              <td class="px-5 py-3 font-mono text-[10px] text-[var(--color-status-danger)]/75">{{ perm.permission }}</td>
              <td class="px-5 py-3 text-[10px] text-[var(--color-status-danger)]/75">{{ perm.groupLabel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="yy-console-card border border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] px-5 py-4">
      <div class="text-[12px] font-semibold text-[var(--color-status-done)]">当前账号已具备工作台已开放菜单权限</div>
      <p class="mt-1 text-[10.5px] text-[var(--color-status-done)]/75">没有发现需要额外补齐的菜单授权。</p>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            class="yy-action border px-3 py-1.5 text-[10.5px] transition-all"
            :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }} {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="text-[10px] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Role Templates</span>
          <h3 class="mt-1 text-[15px] font-medium text-amber-dark">门店角色模板</h3>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            这些模板用于和 RuoYi 后台角色授权做对齐，不在工作台内直接创建系统角色。
          </p>
        </div>

        <div class="grid grid-cols-1 gap-3 p-5 lg:grid-cols-2">
          <button
            v-for="role in roleTemplates"
            :key="role.key"
            class="yy-action border p-4 text-left transition-all"
            :class="selectedRoleKey === role.key ? 'border-amber-dark bg-amber-content-bg' : 'border-amber-topbar-border bg-white/35 hover:bg-white'"
            type="button"
            @click="selectedRoleKey = role.key"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[12px] font-semibold text-amber-dark">{{ role.name }}</div>
                <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ role.key }}</div>
              </div>
              <span class="border border-amber-topbar-border bg-amber-content-bg px-2 py-0.5 text-[10px] text-amber-text-muted">
                {{ role.scope }}
              </span>
            </div>
            <p class="mt-3 text-[10.5px] leading-relaxed text-amber-text-muted">{{ role.desc }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="permission in role.permissions.slice(0, 4)"
                :key="permission"
                class="border border-amber-topbar-border bg-black/[0.015] px-2 py-1 font-mono text-[9.5px] text-amber-text-muted"
              >
                {{ permission }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Current Access</span>
          <h3 class="mt-1 text-[15px] font-medium text-amber-dark">当前账号体检</h3>
        </div>

        <div class="p-5">
          <div class="border border-amber-topbar-border bg-amber-content-bg p-4">
            <div class="text-[12px] font-semibold text-amber-dark">{{ currentIdentity }}</div>
            <div class="mt-1 text-[10.5px] text-amber-text-muted">{{ currentScope }}</div>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Role Permissions</dt>
              <dd class="mt-1 break-all text-[10.5px] leading-relaxed text-amber-dark">{{ rolePermissionText }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Selected Template</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedRole?.desc }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Missing</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed" :class="missingTemplatePermissions.length ? 'text-[var(--color-status-danger)]' : 'text-amber-text-muted'">
                {{ missingTemplatePermissions.length ? missingTemplatePermissions.join('，') : '当前模板关键权限已满足' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 border border-amber-topbar-border bg-[#1A1814] p-4 text-[#F4EFE6]">
            <div class="text-[11px] font-semibold">权限维护边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-[#F4EFE6]/70">
              新增角色、调整菜单、绑定系统账号仍回到 RuoYi 后台处理，工作台只做可见权限体检和说明。
            </p>
          </div>
        </div>
      </aside>
    </section>

    <section class="yy-console-table border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Permission Matrix</span>
          <h3 class="mt-1 text-[15px] font-medium text-amber-dark">工作台菜单权限矩阵</h3>
        </div>
        <input
          v-model="searchQuery"
          class="h-8 w-[280px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[520px]:w-full"
          placeholder="搜索菜单、分组、权限 key"
          type="text"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">分组</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">菜单</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">权限 key</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">当前账号</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="feature in filteredFeatures" :key="feature.key" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4 text-[11px] text-amber-dark">{{ feature.groupLabel }}</td>
              <td class="px-5 py-4">
                <div class="text-[11px] font-semibold text-amber-dark">{{ feature.label }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ feature.path }}</div>
              </td>
              <td class="px-5 py-4">
                <span class="font-mono text-[10px] text-amber-text-muted">{{ feature.permission || '无需单独权限' }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="px-2 py-0.5 text-[10px]" :class="statusToneClass(feature.status)">
                  {{ feature.statusLabel }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="px-2 py-0.5 text-[10px]"
                  :class="feature.accessible ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'"
                >
                  {{ feature.accessible ? '可见' : '缺权限' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredFeatures.length" class="px-6 py-10 text-center">
        <div class="text-[14px] text-amber-dark">当前筛选下没有菜单</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部权限，或者换一个菜单/权限关键字再查。</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getWorkbenchGroupLabel, workbenchFeatures, workbenchStatusMeta } from '../../app/router/featureRegistry'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { useNotice } from '../../shared/composables/useNotice'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import { computeMissingPermissions, formatMissingPermissionsText, roleTemplates } from './rolesOperations'

type PermissionFilter = 'all' | 'ready' | 'derived' | 'partial' | 'building' | 'missing'
type FeatureRow = (typeof workbenchFeatures)[number] & {
  accessible: boolean
  groupLabel: string
  statusLabel: string
}

const activeFilter = ref<PermissionFilter>('all')
const searchQuery = ref('')
const selectedRoleKey = ref('store-manager')
const { notice, pushNotice } = useNotice()
const { copyText } = useCopyWithState()

const allMenuPermissions = computed(() => studioAccessStore.menuPermissions)
const hasWildcard = computed(() => allMenuPermissions.value.includes('*:*:*'))
const selectedRole = computed(() => roleTemplates.find(role => role.key === selectedRoleKey.value) ?? roleTemplates[0])
const missingPermissions = computed(() => computeMissingPermissions(allMenuPermissions.value, hasWildcard.value))

const currentIdentity = computed(() => {
  const identity = studioAccessStore.identity
  return identity?.employeeName || identity?.nickname || identity?.username || '当前员工'
})

const currentScope = computed(() => {
  if (studioAccessStore.globalStoreScope) return '可查看全部门店'
  if (studioAccessStore.stores.length) return `可查看 ${studioAccessStore.stores.length} 个授权门店`
  return '未返回门店范围'
})

const rolePermissionText = computed(() =>
  studioAccessStore.rolePermissions.length ? studioAccessStore.rolePermissions.join('，') : '未返回角色标识',
)

const canUsePermission = (permission?: string) =>
  !permission || hasWildcard.value || allMenuPermissions.value.includes(permission)

const featureRows = computed<FeatureRow[]>(() =>
  workbenchFeatures.map(feature => ({
    ...feature,
    groupLabel: getWorkbenchGroupLabel(feature.group),
    accessible: canUsePermission(feature.permission),
    statusLabel: workbenchStatusMeta[feature.status].label,
  })),
)

const missingTemplatePermissions = computed(() => {
  if (hasWildcard.value) return []
  return selectedRole.value.permissions.filter(permission => !allMenuPermissions.value.includes(permission))
})

const filteredFeatures = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return featureRows.value.filter(feature => {
    if (activeFilter.value === 'ready' && feature.status !== 'ready') return false
    if (activeFilter.value === 'derived' && feature.status !== 'derived') return false
    if (activeFilter.value === 'partial' && feature.status !== 'partial') return false
    if (activeFilter.value === 'building' && feature.status !== 'building') return false
    if (activeFilter.value === 'missing' && feature.accessible) return false
    if (!query) return true
    const haystack = `${feature.groupLabel} ${feature.label} ${feature.path} ${feature.permission ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部菜单', count: featureRows.value.length },
  { key: 'ready' as const, label: workbenchStatusMeta.ready.label, count: featureRows.value.filter(item => item.status === 'ready').length },
  { key: 'derived' as const, label: workbenchStatusMeta.derived.label, count: featureRows.value.filter(item => item.status === 'derived').length },
  { key: 'partial' as const, label: workbenchStatusMeta.partial.label, count: featureRows.value.filter(item => item.status === 'partial').length },
  { key: 'building' as const, label: workbenchStatusMeta.building.label, count: featureRows.value.filter(item => item.status === 'building').length },
  { key: 'missing' as const, label: '缺权限', count: featureRows.value.filter(item => !item.accessible).length },
])

const roleHealthCards = computed(() => [
  {
    label: '权限健康度',
    value: missingPermissions.value.length ? '待补齐' : '完整',
    hint: missingPermissions.value.length ? `缺少 ${missingPermissions.value.length} 个菜单权限` : '当前账号可访问所有已开放菜单',
  },
  {
    label: '当前账号',
    value: currentIdentity.value,
    hint: currentScope.value,
  },
  {
    label: '角色模板',
    value: selectedRole.value.name,
    hint: selectedRole.value.scope,
  },
  {
    label: '已开放菜单',
    value: String(featureRows.value.filter(item => item.status === 'ready').length),
    hint: '来自工作台功能注册表',
  },
])

const cards = computed(() => [
  {
    label: '当前角色',
    value: hasWildcard.value ? '系统管理员' : selectedRole.value.name,
    hint: rolePermissionText.value,
    scope: 'ROLE',
  },
  {
    label: '门店范围',
    value: studioAccessStore.globalStoreScope ? '全部' : String(studioAccessStore.stores.length),
    hint: currentScope.value,
    scope: 'STORE',
  },
  {
    label: '菜单权限',
    value: hasWildcard.value ? '全部' : String(allMenuPermissions.value.length),
    hint: hasWildcard.value ? '当前账号拥有全量菜单权限' : '来自 bootstrap 的菜单权限数量',
    scope: 'MENU',
  },
  {
    label: '缺失权限',
    value: String(missingPermissions.value.length),
    hint: '可直接复制给管理员补授权',
    scope: 'CHECK',
  },
])

const statusToneClass = (status: FeatureRow['status']) => {
  if (status === 'ready') return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (status === 'partial') return 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'
  if (status === 'derived') return 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)]'
  if (status === 'building') return 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'
  return 'bg-black/[0.04] text-amber-text-muted'
}

const copyMissingPermissions = async () => {
  const text = formatMissingPermissionsText(missingPermissions.value, currentIdentity.value, currentScope.value)
  const ok = await copyText(text, 'missing-permissions')
  if (ok) {
    pushNotice('success', missingPermissions.value.length ? '已复制缺失权限' : '权限状态已复制')
  } else {
    pushNotice('error', '复制失败，请手动选择权限 key')
  }
}
</script>
