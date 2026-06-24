import { proxyRefs, ref } from 'vue'
import { backendApi, type CollaborationPolicyPayload, type RetouchProviderListQuery, type RetouchProviderPayload, type RetouchTaskActionPayload, type RetouchTaskListQuery, type ServiceLicenseBindingPayload } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const useServiceProduction = () => {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const run = async <T>(kind: 'loading' | 'saving', fallback: string, task: () => Promise<T>) => {
    if (kind === 'loading') loading.value = true
    if (kind === 'saving') saving.value = true
    error.value = ''
    try {
      return await task()
    } catch (err) {
      error.value = messageOf(err, fallback)
      throw err
    } finally {
      if (kind === 'loading') loading.value = false
      if (kind === 'saving') saving.value = false
    }
  }

  return proxyRefs({
    loading,
    saving,
    error,
    async ensureStores() {
      if (!appStore.stores.length) {
        await appStore.refreshCoreData()
      }
      return appStore.stores
    },
    loadRetouchTasks(query: RetouchTaskListQuery = {}) {
      return run('loading', '加载三方修图任务失败', () => backendApi.listRetouchTasks(query))
    },
    updateRetouchTask(payload: RetouchTaskActionPayload) {
      return run('saving', '保存修图任务失败', () => backendApi.updateRetouchTask(payload))
    },
    loadRetouchProviders(query: RetouchProviderListQuery = {}) {
      return run('loading', '加载修图服务商失败', () => backendApi.listRetouchProviders(query))
    },
    saveRetouchProvider(payload: RetouchProviderPayload) {
      return run('saving', '保存修图服务商失败', () => backendApi.saveRetouchProvider(payload))
    },
    loadCollaborationPolicy() {
      return run('loading', '加载中央修图策略失败', () => backendApi.getCollaborationPolicy())
    },
    saveCollaborationPolicy(payload: CollaborationPolicyPayload) {
      return run('saving', '保存中央修图策略失败', () => backendApi.saveCollaborationPolicy(payload))
    },
    loadLicenseBindings(storeId?: string) {
      return run('loading', '加载开通设置失败', () => backendApi.listServiceLicenseBindings(storeId))
    },
    saveLicenseBinding(payload: ServiceLicenseBindingPayload) {
      return run('saving', '保存开通设置失败', () => backendApi.saveServiceLicenseBinding(payload))
    },
  })
}
