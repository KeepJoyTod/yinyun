<template>
  <div class="flex flex-col gap-7">
    <section class="roles-hero yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Roles & Permissions</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">权限体检控制台</h2>
          <p class="mt-2 max-w-[780px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
            明确管理员、门店主管和普通员工能看什么、能做什么。系统级角色仍在 RuoYi 后台维护，工作台负责门店业务权限体检。
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
          <div class="mt-1 text-[11px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        </article>
      </div>
    </section>

    <section v-if="missingPermissions.length" class="border border-[#B8543B]/30 bg-[#B8543B]/5">
      <div class="border-b border-[#B8543B]/20 px-5 py-4">
        <div class="flex items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-[#8C3E2C]">Missing Permissions</span>
            <h3 class="mt-1 text-[15px] font-sans font-medium text-[#8C3E2C]">缺失权限（{{ missingPermissions.length }}）</h3>
            <p class="mt-1 text-[10.5px] leading-relaxed text-[#8C3E2C]/70">
              以下工作台菜单缺少对应权限码，请联系管理员在 RuoYi 后台补齐。
            </p>
          </div>
          <button
            class="yy-action border border-[#8C3E2C] bg-[#8C3E2C] px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-[#6E2E1F]"
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
            <tr class="border-b border-[#B8543B]/15 bg-[#B8543B]/5 text-left">
              <th class="px-5 py-3 text-[11px] font-sans text-[#8C3E2C]">菜单名称</th>
              <th class="px-5 py-3 text-[11px] font-sans text-[#8C3E2C]">路由</th>
              <th class="px-5 py-3 text-[11px] font-sans text-[#8C3E2C]">权限码</th>
              <th class="px-5 py-3 text-[11px] font-sans text-[#8C3E2C]">模块</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#B8543B]/10">
            <tr v-for="perm in missingPermissions" :key="perm.key" class="hover:bg-[#B8543B]/[0.03]">
              <td class="px-5 py-3 text-[11px] font-semibold text-[#8C3E2C]">{{ perm.label }}</td>
              <td class="px-5 py-3 font-mono text-[10px] text-[#8C3E2C]/70">{{ perm.path }}</td>
              <td class="px-5 py-3 font-mono text-[10px] text-[#8C3E2C]/70">{{ perm.permission }}</td>
              <td class="px-5 py-3 text-[10px] text-[#8C3E2C]/70">{{ perm.groupLabel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="!missingPermissions.length" class="border border-[#2D7A4D]/20 bg-[#EBF4ED] px-5 py-4">
      <div class="text-[12px] font-semibold text-[#2D7A4D]">当前账号工作台权限完整</div>
      <p class="mt-1 text-[10.5px] text-[#2D7A4D]/70">所有已开放的菜单权限均已具备，无需额外补权限。</p>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            class="yy-action border px-3 py-1.5 text-[10.5px] font-sans transition-all"
            :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm">
          <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Role Templates</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">门店角色模板</h3>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            这些是影约云门店工作台建议模板，用于和 RuoYi 后台角色授权对齐。
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
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">当前账号体检</h3>
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
              <dd class="mt-1 text-[10.5px] leading-relaxed" :class="missingTemplatePermissions.length ? 'text-[#8C3E2C]' : 'text-amber-text-muted'">
                {{ missingTemplatePermissions.length ? missingTemplatePermissions.join('，') : '当前模板关键权限已满足' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 border border-amber-topbar-border bg-[#1A1814] p-4 text-[#F4EFE6]">
            <div class="text-[11px] font-semibold">权限维护边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-[#F4EFE6]/70">
              新增角色、修改菜单、绑定系统账号仍去系统后台。门店工作台只做可见权限体检和模板说明，避免员工误改全局权限。
            </p>
          </div>
        </div>
      </aside>
    </section>

    <section class="yy-console-table border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Permission Matrix</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">工作台菜单权限矩阵</h3>
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
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">分组</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">菜单</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">权限 key</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">当前账号</th>
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
                <span
                  class="px-2 py-0.5 text-[10px]"
                  :class="feature.status === 'ready'
                    ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
                    : 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'"
                >
                  {{ feature.status === 'ready' ? '已开放' : '建设中' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="px-2 py-0.5 text-[10px]"
                  :class="feature.accessible
                    ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
                    : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'"
                >
                  {{ feature.accessible ? '可见' : '缺权限' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredFeatures.length" class="px-6 py-10 text-center">
        <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有菜单</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部权限，或换一个菜单/权限关键字再查。</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getWorkbenchGroupLabel, workbenchFeatures } from '../../app/router/featureRegistry'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import { computeMissingPermissions, formatMissingPermissionsText, roleTemplates } from './rolesOperations'
import { useNotice } from '../../shared/composables/useNotice'

type PermissionFilter = 'all' | 'ready' | 'building' | 'missing'

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
  studioAccessStore.rolePermissions.length
    ? studioAccessStore.rolePermissions.join('，')
    : '未返回角色标识',
)

const canUsePermission = (permission?: string) =>
  !permission || hasWildcard.value || allMenuPermissions.value.includes(permission)

const featureRows = computed(() =>
  workbenchFeatures.map(feature => ({
    ...feature,
    groupLabel: getWorkbenchGroupLabel(feature.group),
    accessible: canUsePermission(feature.permission),
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
    if (activeFilter.value === 'building' && feature.status !== 'building') return false
    if (activeFilter.value === 'missing' && feature.accessible) return false
    if (!query) return true
    const haystack = `${feature.groupLabel} ${feature.label} ${feature.path} ${feature.permission ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部菜单', count: featureRows.value.length },
  { key: 'ready' as const, label: '已开放', count: featureRows.value.filter(item => item.status === 'ready').length },
  { key: 'building' as const, label: '建设中', count: featureRows.value.filter(item => item.status === 'building').length },
  { key: 'missing' as const, label: '缺权限', count: featureRows.value.filter(item => !item.accessible).length },
])

const roleHealthCards = computed(() => [
  {
    label: '权限健康度',
    value: missingPermissions.value.length ? '待补齐' : '完整',
    hint: missingPermissions.value.length ? `缺 ${missingPermissions.value.length} 个菜单权限` : '当前账号可访问已开放工作台菜单',
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
    value: hasWildcard.value ? '管理员' : selectedRole.value.name,
    hint: rolePermissionText.value,
    scope: 'ROLE',
  },
  {
    label: '门店范围',
    value: studioAccessStore.globalStoreScope ? '全部' : String(studioAccessStore.stores.length),
    hint: currentScope.value,
    scope: '门店',
  },
  {
    label: '菜单权限',
    value: hasWildcard.value ? '全部' : String(allMenuPermissions.value.length),
    hint: hasWildcard.value ? '当前账号拥有全部菜单权限。' : '后端 bootstrap 返回的菜单权限数量。',
    scope: 'MENU',
  },
  {
    label: '缺失权限',
    value: String(missingPermissions.value.length),
    hint: '按当前账号可见工作台菜单计算，可复制给管理员补授权。',
    scope: 'CHECK',
  },
])

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
