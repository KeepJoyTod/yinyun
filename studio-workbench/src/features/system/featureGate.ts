import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getWorkbenchFeature,
  type WorkbenchFeatureRuntimeStatus,
} from '../../app/router/featureRegistry'
import type { MarketingCapabilityDto, ServiceLicenseBindingDto } from '../../shared/api/backend'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'

export type FeatureGateState =
  | 'enabled'
  | 'loading'
  | 'hidden'
  | 'permission_denied'
  | 'role_denied'
  | 'store_scope_required'
  | 'plugin_disabled'
  | 'license_required'
  | 'building'
  | 'capability_blocked'

export type FeatureGateLicenseState = 'active' | 'missing' | 'expired' | 'unknown'
export type FeatureGatePluginState = 'enabled' | 'disabled' | 'unknown'
export type FeatureGateApprovalState = 'not_required' | 'required' | 'unknown'

export type FeatureGateCapability = Pick<
  MarketingCapabilityDto,
  'capabilityCode' | 'capabilityName' | 'enabled' | 'status' | 'scopeLabel' | 'gateCopy' | 'expiresAt'
>

export type FeatureGateLicenseBinding = Pick<
  ServiceLicenseBindingDto,
  'licenseKey' | 'planName' | 'status' | 'expireTime' | 'boundStoreIds'
>

export type FeatureGateInput = {
  featureKey: string
  capability?: FeatureGateCapability | null
  requiredRoles?: string[]
  requireStoreScope?: boolean
  pluginEnabled?: boolean | null
  licenseBindings?: FeatureGateLicenseBinding[] | null
  requiresApproval?: boolean | null
}

export type FeatureGateResult = {
  featureKey: string
  capabilityCode: string
  capabilityName: string
  permissionCode: string
  runtimeStatus: WorkbenchFeatureRuntimeStatus
  state: FeatureGateState
  stateLabel: string
  enabled: boolean
  scopeLabel: string
  gateCopy: string
  expiresAt?: string
  capabilityStatus?: MarketingCapabilityDto['status']
  storeScopeLabel: string
  permissionMatched: boolean
  roleMatched: boolean
  licenseState: FeatureGateLicenseState
  pluginState: FeatureGatePluginState
  approvalState: FeatureGateApprovalState
}

const storeScopeFallbackLabel = '待加载权限范围'

const hasScopedStores = () => studioAccessStore.globalStoreScope || studioAccessStore.stores.length > 0

const parseTime = (value?: string) => {
  const normalized = String(value ?? '').trim()
  if (!normalized) return Number.NaN
  return new Date(normalized).getTime()
}

const isExpiredLicense = (binding: FeatureGateLicenseBinding) => {
  const expireTime = parseTime(binding.expireTime)
  return Number.isFinite(expireTime) && expireTime < Date.now()
}

export const resolveStoreScopeLabel = () => {
  if (!studioAccessStore.initialized) return storeScopeFallbackLabel
  if (studioAccessStore.globalStoreScope) return '全部门店'
  if (studioAccessStore.stores.length === 0) return '当前账号暂无门店范围'
  if (studioAccessStore.stores.length === 1) return studioAccessStore.stores[0]?.storeName ?? '单门店'
  return `${studioAccessStore.stores.length} 个授权门店`
}

export const resolveLicenseState = (
  licenseBindings?: FeatureGateLicenseBinding[] | null,
): FeatureGateLicenseState => {
  if (licenseBindings == null) return 'unknown'
  if (licenseBindings.length === 0) return 'missing'

  const activeBindings = licenseBindings.filter(binding => String(binding.status ?? '').toUpperCase() === 'ACTIVE')
  if (activeBindings.some(binding => !isExpiredLicense(binding))) return 'active'
  if (activeBindings.length > 0 || licenseBindings.some(binding => isExpiredLicense(binding))) return 'expired'
  return 'missing'
}

const resolveStateLabel = (
  state: FeatureGateState,
  runtimeStatus: WorkbenchFeatureRuntimeStatus,
  capabilityStatus?: MarketingCapabilityDto['status'],
) => {
  if (state === 'loading') return '权限上下文加载中'
  if (state === 'hidden') return '能力已隐藏或未开通'
  if (state === 'permission_denied') return '缺少页面访问权限'
  if (state === 'role_denied') return '当前角色不可访问'
  if (state === 'store_scope_required') return '当前账号缺少门店范围'
  if (state === 'plugin_disabled') return '插件未启用'
  if (state === 'license_required') return '许可证未开通或已过期'
  if (state === 'capability_blocked') return capabilityStatus === 'expired' ? '能力已过期' : '能力未开通'
  if (state === 'building' || runtimeStatus === 'building' || runtimeStatus === 'planned') return '脚手架已接入，等待真实闭环'
  if (capabilityStatus === 'ready') return '能力已接通'
  if (capabilityStatus === 'scaffold') return '脚手架已接入'
  return '能力可访问'
}

const resolveGateCopy = (
  capability: FeatureGateCapability | null | undefined,
  stateLabel: string,
  storeScopeLabel: string,
) => capability?.gateCopy || `${stateLabel}，当前门店范围：${storeScopeLabel}`

export const resolveFeatureGate = (input: FeatureGateInput): FeatureGateResult => {
  const feature = getWorkbenchFeature(input.featureKey)
  const runtimeStatus = getEffectiveFeatureStatus(feature, studioAccessStore.featureStatuses)
  const permissionMatched = canAccessWorkbenchFeature(feature, studioAccessStore.menuPermissions)
  const roleMatched = !input.requiredRoles?.length
    || input.requiredRoles.some(role => studioAccessStore.rolePermissions.includes(role))
  const pluginState: FeatureGatePluginState = input.pluginEnabled == null
    ? 'unknown'
    : input.pluginEnabled
      ? 'enabled'
      : 'disabled'
  const licenseState = resolveLicenseState(input.licenseBindings)
  const approvalState: FeatureGateApprovalState = input.requiresApproval == null
    ? 'unknown'
    : input.requiresApproval
      ? 'required'
      : 'not_required'
  const storeScopeLabel = resolveStoreScopeLabel()

  let state: FeatureGateState = 'enabled'
  if (!studioAccessStore.initialized) {
    state = 'loading'
  } else if (runtimeStatus === 'hidden') {
    state = 'hidden'
  } else if (!permissionMatched) {
    state = 'permission_denied'
  } else if (!roleMatched) {
    state = 'role_denied'
  } else if (input.requireStoreScope && !hasScopedStores()) {
    state = 'store_scope_required'
  } else if (pluginState === 'disabled') {
    state = 'plugin_disabled'
  } else if (licenseState === 'missing' || licenseState === 'expired') {
    state = 'license_required'
  } else if (input.capability && (!input.capability.enabled || input.capability.status === 'disabled' || input.capability.status === 'expired')) {
    state = 'capability_blocked'
  } else if (runtimeStatus === 'building' || runtimeStatus === 'planned') {
    state = 'building'
  }

  const capabilityCode = input.capability?.capabilityCode || input.featureKey
  const capabilityName = input.capability?.capabilityName || feature?.label || input.featureKey
  const stateLabel = resolveStateLabel(state, runtimeStatus, input.capability?.status)

  return {
    featureKey: input.featureKey,
    capabilityCode,
    capabilityName,
    permissionCode: feature?.permission ?? '',
    runtimeStatus,
    state,
    stateLabel,
    enabled: state === 'enabled',
    scopeLabel: input.capability?.scopeLabel || storeScopeLabel,
    gateCopy: resolveGateCopy(input.capability, stateLabel, storeScopeLabel),
    expiresAt: input.capability?.expiresAt,
    capabilityStatus: input.capability?.status,
    storeScopeLabel,
    permissionMatched,
    roleMatched,
    licenseState,
    pluginState,
    approvalState,
  }
}
