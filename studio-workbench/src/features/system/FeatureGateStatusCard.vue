<template>
  <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-[11px] font-semibold text-amber-dark">{{ gate.capabilityName }}</div>
        <div class="mt-1 text-[10px] text-amber-text-muted">{{ gate.scopeLabel }}</div>
      </div>
      <span class="border px-2 py-1 text-[10px]" :class="badgeClass">{{ badgeLabel }}</span>
    </div>
    <p class="mt-3 text-[10.5px] leading-relaxed text-amber-text-muted">{{ gate.gateCopy }}</p>
    <div class="mt-3 grid grid-cols-2 gap-2 text-[9.5px] text-amber-text-muted">
      <div>门禁态 {{ gate.stateLabel }}</div>
      <div>门店 {{ gate.storeScopeLabel }}</div>
      <div>权限 {{ gate.permissionCode || '未配置' }}</div>
      <div>许可证 {{ licenseLabel }}</div>
      <div>插件 {{ pluginLabel }}</div>
      <div>审批 {{ approvalLabel }}</div>
    </div>
    <p v-if="gate.expiresAt" class="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">
      到期时间 {{ gate.expiresAt }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FeatureGateResult } from './featureGate'

const props = defineProps<{
  gate: FeatureGateResult
}>()

const badgeLabel = computed(() => {
  if (props.gate.state === 'permission_denied' || props.gate.state === 'role_denied') return '未授权'
  if (props.gate.state === 'store_scope_required') return '缺门店'
  if (props.gate.state === 'plugin_disabled') return '插件关闭'
  if (props.gate.state === 'license_required') return props.gate.licenseState === 'expired' ? '已过期' : '未开通'
  if (props.gate.state === 'building') return '脚手架'
  if (props.gate.capabilityStatus === 'expired' || props.gate.licenseState === 'expired') return '已过期'
  if (props.gate.state === 'capability_blocked' || props.gate.capabilityStatus === 'disabled') return '未开通'
  if (props.gate.licenseState === 'missing') return '待开通'
  if (props.gate.capabilityStatus === 'ready') return '已接通'
  return '可访问'
})

const badgeClass = computed(() => {
  if (
    ['permission_denied', 'role_denied', 'plugin_disabled', 'license_required', 'capability_blocked'].includes(props.gate.state)
    || props.gate.licenseState === 'expired'
  ) {
    return 'border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  }
  if (props.gate.licenseState === 'missing') {
    return 'border-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'
  }
  if (props.gate.state === 'enabled' && props.gate.capabilityStatus === 'ready') {
    return 'border-[var(--color-status-done)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  }
  return 'border-amber-topbar-border bg-[#FBF8F2] text-amber-dark'
})

const pluginLabel = computed(() => {
  if (props.gate.pluginState === 'enabled') return '已启用'
  if (props.gate.pluginState === 'disabled') return '未启用'
  if (props.gate.pluginState === 'not_applicable') return '不适用'
  return '待接入'
})

const licenseLabel = computed(() => {
  if (props.gate.licenseState === 'active') return '已生效'
  if (props.gate.licenseState === 'expired') return '已过期'
  if (props.gate.licenseState === 'missing') return '未开通'
  if (props.gate.licenseState === 'not_applicable') return '不适用'
  return '待接入'
})

const approvalLabel = computed(() => {
  if (props.gate.approvalState === 'required') return '必审'
  if (props.gate.approvalState === 'not_required') return '直达'
  if (props.gate.approvalState === 'not_applicable') return '不适用'
  return '待接入'
})
</script>
