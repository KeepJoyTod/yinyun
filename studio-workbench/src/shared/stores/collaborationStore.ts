import { reactive } from 'vue'
import { collaborationApi } from '../api/backendCollaborationApi'
import type {
  BackendId,
  CollaborationLicenseDto,
  CollaborationLicensePayload,
  CollaborationSettingDto,
  CollaborationSettingPayload,
  ProductCollaborationConfigDto,
  ProductCollaborationConfigPayload,
} from '../api/backend'

type CollaborationStoreState = {
  loading: boolean
  error: string
  positionSetting: CollaborationSettingDto | null
  commonSetting: CollaborationSettingDto | null
  retouchCenterSetting: CollaborationSettingDto | null
  productConfigs: ProductCollaborationConfigDto[]
  licenses: CollaborationLicenseDto[]
}

export const collaborationStore = reactive<CollaborationStoreState & {
  loadSetting(settingType: CollaborationSettingDto['settingType']): Promise<CollaborationSettingDto>
  saveSetting(payload: CollaborationSettingPayload): Promise<CollaborationSettingDto>
  loadProductConfigs(): Promise<ProductCollaborationConfigDto[]>
  saveProductConfig(productId: BackendId, payload: ProductCollaborationConfigPayload): Promise<ProductCollaborationConfigDto>
  loadLicenses(): Promise<CollaborationLicenseDto[]>
  saveLicense(payload: CollaborationLicensePayload): Promise<CollaborationLicenseDto>
  bindLicenseStore(licenseId: BackendId, storeId: BackendId, remark?: string): Promise<CollaborationLicenseDto>
  unbindLicenseStore(licenseId: BackendId, storeId: BackendId): Promise<CollaborationLicenseDto>
}>({
  loading: false,
  error: '',
  positionSetting: null,
  commonSetting: null,
  retouchCenterSetting: null,
  productConfigs: [],
  licenses: [],

  async loadSetting(settingType) {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.getSetting(settingType)
      if (settingType === 'POSITION') this.positionSetting = next
      if (settingType === 'COMMON') this.commonSetting = next
      if (settingType === 'RETOUCH_CENTER') this.retouchCenterSetting = next
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '加载协作设置失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async saveSetting(payload) {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.saveSetting(payload)
      if (payload.settingType === 'POSITION') this.positionSetting = next
      if (payload.settingType === 'COMMON') this.commonSetting = next
      if (payload.settingType === 'RETOUCH_CENTER') this.retouchCenterSetting = next
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '保存协作设置失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async loadProductConfigs() {
    this.loading = true
    this.error = ''
    try {
      this.productConfigs = await collaborationApi.listProductConfigs()
      return this.productConfigs
    } catch (error) {
      this.error = error instanceof Error ? error.message : '加载产品协作设置失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async saveProductConfig(productId, payload) {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.saveProductConfig(productId, payload)
      this.productConfigs = [
        next,
        ...this.productConfigs.filter(item => item.productId !== next.productId),
      ]
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '保存产品协作设置失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async loadLicenses() {
    this.loading = true
    this.error = ''
    try {
      this.licenses = await collaborationApi.listLicenses()
      return this.licenses
    } catch (error) {
      this.error = error instanceof Error ? error.message : '加载协作许可证失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async saveLicense(payload) {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.saveLicense(payload)
      this.licenses = [
        next,
        ...this.licenses.filter(item => item.id !== next.id),
      ]
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '保存协作许可证失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async bindLicenseStore(licenseId, storeId, remark = '') {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.bindLicenseStore(licenseId, { storeId, remark })
      this.licenses = [
        next,
        ...this.licenses.filter(item => item.id !== next.id),
      ]
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '绑定门店失败'
      throw error
    } finally {
      this.loading = false
    }
  },

  async unbindLicenseStore(licenseId, storeId) {
    this.loading = true
    this.error = ''
    try {
      const next = await collaborationApi.unbindLicenseStore(licenseId, storeId)
      this.licenses = [
        next,
        ...this.licenses.filter(item => item.id !== next.id),
      ]
      return next
    } catch (error) {
      this.error = error instanceof Error ? error.message : '解绑门店失败'
      throw error
    } finally {
      this.loading = false
    }
  },
})
