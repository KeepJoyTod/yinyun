import { computed } from 'vue'
import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getWorkbenchFeature,
  type WorkbenchFeatureRuntimeStatus,
} from '../../app/router/featureRegistry'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'

export type ModuleScaffoldConfig = {
  featureKey: string
  domain: string
  title: string
  summary: string
  owner: string
  nextPhase: string
  routes: string[]
  contracts: string[]
  apis: string[]
  ledgers: string[]
}

export type ModuleScaffoldViewModel = ModuleScaffoldConfig & {
  permissionCode: string
  runtimeStatus: WorkbenchFeatureRuntimeStatus
  accessState: string
  storeScopeLabel: string
}

export const defineModuleScaffold = (config: ModuleScaffoldConfig) => config

const resolveStoreScopeLabel = () => {
  if (!studioAccessStore.initialized) return '待加载权限范围'
  if (studioAccessStore.globalStoreScope) return '全部门店'
  if (studioAccessStore.stores.length === 0) return '当前账号暂无门店范围'
  if (studioAccessStore.stores.length === 1) return studioAccessStore.stores[0]?.storeName ?? '单门店'
  return `${studioAccessStore.stores.length} 个授权门店`
}

const resolveAccessState = (featureKey: string, runtimeStatus: WorkbenchFeatureRuntimeStatus) => {
  const feature = getWorkbenchFeature(featureKey)
  if (!studioAccessStore.initialized) return '待加载门禁'
  if (runtimeStatus === 'hidden') return '未开通或已隐藏'
  if (!canAccessWorkbenchFeature(feature, studioAccessStore.menuPermissions)) return '缺少访问权限'
  if (runtimeStatus === 'building' || runtimeStatus === 'planned') return '已挂载脚手架'
  if (runtimeStatus === 'partial') return '已接入部分链路'
  if (runtimeStatus === 'derived') return '已接入派生模块'
  return '已接入可访问模块'
}

export const useModuleScaffold = (config: ModuleScaffoldConfig) => computed<ModuleScaffoldViewModel>(() => {
  const feature = getWorkbenchFeature(config.featureKey)
  const runtimeStatus = getEffectiveFeatureStatus(feature, studioAccessStore.featureStatuses)
  return {
    ...config,
    permissionCode: feature?.permission ?? '',
    runtimeStatus,
    accessState: resolveAccessState(config.featureKey, runtimeStatus),
    storeScopeLabel: resolveStoreScopeLabel(),
  }
})
