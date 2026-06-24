<template>
  <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-[11px] font-semibold text-amber-dark">{{ capability.capabilityName }}</div>
        <div class="mt-1 text-[10px] text-amber-text-muted">{{ capability.scopeLabel }}</div>
      </div>
      <span class="border px-2 py-1 text-[10px]" :class="badgeClass">{{ badgeLabel }}</span>
    </div>
    <p class="mt-3 text-[10.5px] leading-relaxed text-amber-text-muted">{{ capability.gateCopy }}</p>
    <div class="mt-3 grid grid-cols-2 gap-2 text-[9.5px] text-amber-text-muted">
      <div>门禁态 {{ capability.stateLabel }}</div>
      <div>门店 {{ capability.storeScopeLabel }}</div>
      <div>权限 {{ capability.permissionCode || '未配置' }}</div>
      <div>许可证 {{ licenseLabel }}</div>
      <div>插件 {{ pluginLabel }}</div>
      <div>审批 {{ approvalLabel }}</div>
    </div>
    <p v-if="capability.expiresAt" class="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">
      到期时间 {{ capability.expiresAt }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MarketingCapabilityGateViewModel } from '../composables/useMarketingCapabilityGate'

const props = defineProps<{
  capability: MarketingCapabilityGateViewModel
}>()

const badgeLabel = computed(() => {
  if (props.capability.state === 'permission_denied' || props.capability.state === 'role_denied') return '未授权'
  if (props.capability.state === 'store_scope_required') return '缺门店'
  if (props.capability.state === 'plugin_disabled') return '插件关闭'
  if (props.capability.state === 'license_required') return props.capability.licenseState === 'expired' ? '已过期' : '未开通'
  if (props.capability.state === 'building') return '脚手架'
  if (props.capability.capabilityStatus === 'expired') return '已过期'
  if (props.capability.state === 'capability_blocked' || props.capability.capabilityStatus === 'disabled') return '未开通'
  if (props.capability.capabilityStatus === 'ready') return '已接通'
  return '可访问'
})

const badgeClass = computed(() => {
  if (['permission_denied', 'role_denied', 'plugin_disabled', 'license_required', 'capability_blocked'].includes(props.capability.state)) {
    return 'border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  }
  if (props.capability.state === 'enabled' && props.capability.capabilityStatus === 'ready') {
    return 'border-[var(--color-status-done)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  }
  return 'border-amber-topbar-border bg-[#FBF8F2] text-amber-dark'
})

const pluginLabel = computed(() => {
  if (props.capability.pluginState === 'enabled') return '已启用'
  if (props.capability.pluginState === 'disabled') return '未启用'
  return '待接入'
})

const licenseLabel = computed(() => {
  if (props.capability.licenseState === 'active') return '已生效'
  if (props.capability.licenseState === 'expired') return '已过期'
  if (props.capability.licenseState === 'missing') return '未开通'
  return '待接入'
})

const approvalLabel = computed(() => {
  if (props.capability.approvalState === 'required') return '必审'
  if (props.capability.approvalState === 'not_required') return '直达'
  return '待接入'
})
</script>
