import { ref } from 'vue'
import { backendApi } from '../../../shared/api/backend'
import type {
  PlatformIntegrationStatusDto,
  PlatformNotificationRuleDto,
  PlatformServicePackageStatusDto,
} from '../../../shared/api/backend'

type Loader<T> = () => Promise<T[]>

const createPlatformSettingsList = <T>(loader: Loader<T>) => {
  const loading = ref(false)
  const error = ref('')
  const rows = ref<T[]>([])

  const reload = async () => {
    loading.value = true
    error.value = ''
    try {
      rows.value = await loader()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Platform settings request failed'
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    rows,
    reload,
  }
}

export const usePlatformIntegrationList = () =>
  createPlatformSettingsList<PlatformIntegrationStatusDto>(() => backendApi.listPlatformIntegrations())

export const usePlatformNotificationList = () =>
  createPlatformSettingsList<PlatformNotificationRuleDto>(() => backendApi.listPlatformNotificationCenters())

export const usePlatformServicePackageList = () =>
  createPlatformSettingsList<PlatformServicePackageStatusDto>(() => backendApi.listPlatformServicePackages())
