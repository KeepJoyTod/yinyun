import { reactive } from 'vue'
import type { WorkbenchBootstrapDto } from '../api/backend'
import { backendApi } from '../api/backend'
import { getStaffSession } from '../auth/staffSession'

const emptyPending = () => ({
  pendingOrders: 0,
  todayArrivals: 0,
  inventoryConflicts: 0,
  activeSelections: 0,
})

const isVisibleWorkbenchStoreScope = (store: WorkbenchBootstrapDto['stores'][number]) => {
  const code = String(store.storeCode ?? '').toUpperCase()
  const name = String(store.storeName ?? '')
  if (name.includes('默认门店')) return false
  if (code.includes('DEFAULT')) return false
  return true
}

export const studioAccessStore = reactive({
  initialized: false,
  loading: false,
  error: '',
  identity: null as WorkbenchBootstrapDto['identity'] | null,
  globalStoreScope: false,
  stores: [] as WorkbenchBootstrapDto['stores'],
  menuPermissions: [] as string[],
  menuPermissionDetails: [] as NonNullable<WorkbenchBootstrapDto['menuPermissionDetails']>,
  rolePermissions: [] as string[],
  featureStatuses: {} as WorkbenchBootstrapDto['featureStatuses'],
  pending: emptyPending(),

  apply(data: WorkbenchBootstrapDto) {
    this.identity = { ...data.identity }
    this.globalStoreScope = data.globalStoreScope
    this.stores = data.stores.filter(isVisibleWorkbenchStoreScope).map(store => ({ ...store }))
    this.menuPermissions = [...data.menuPermissions]
    this.menuPermissionDetails = [...(data.menuPermissionDetails ?? [])]
    this.rolePermissions = [...data.rolePermissions]
    this.featureStatuses = { ...data.featureStatuses }
    this.pending = { ...emptyPending(), ...data.pending }
    this.error = ''
    this.initialized = true
  },

  useDemoAccess(username: string) {
    this.apply({
      identity: {
        userId: 'demo',
        username,
        nickname: username,
        employeeId: 'demo',
        employeeName: username,
        roleType: 'STORE_MANAGER',
      },
      globalStoreScope: true,
      stores: [],
      menuPermissions: ['*:*:*'],
      rolePermissions: ['studio_manager'],
      featureStatuses: {},
      pending: emptyPending(),
    })
  },

  reset() {
    this.initialized = false
    this.loading = false
    this.error = ''
    this.identity = null
    this.globalStoreScope = false
    this.stores = []
    this.menuPermissions = []
    this.rolePermissions = []
    this.featureStatuses = {}
    this.pending = emptyPending()
    accessPromise = null
  },
})

let accessPromise: Promise<void> | null = null

export const ensureStudioAccess = async () => {
  if (studioAccessStore.initialized) return
  if (import.meta.env.VITE_STUDIO_DEMO !== 'false') {
    studioAccessStore.useDemoAccess(getStaffSession()?.username || '门店账号')
    return
  }
  accessPromise ??= (async () => {
    studioAccessStore.loading = true
    studioAccessStore.error = ''
    try {
      studioAccessStore.apply(await backendApi.getWorkbenchBootstrap())
    } catch (error) {
      studioAccessStore.error = error instanceof Error ? error.message : '工作台权限加载失败'
      throw error
    } finally {
      studioAccessStore.loading = false
      accessPromise = null
    }
  })()
  return accessPromise
}
