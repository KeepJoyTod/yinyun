import { computed, reactive, ref } from 'vue'
import { backendApi, type BackendId, type CollaborationLicenseDto } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { collaborationStore } from '../../../shared/stores/collaborationStore'
import { ensureStudioAccess } from '../../../shared/stores/studioAccessStore'
import { resolveFeatureGate } from '../../system/featureGate'
import {
  collaborationLicenseStatusOptions,
  collaborationRenewActionOptions,
  createCollaborationLicenseDraft,
  toCollaborationLicensePayload,
  type CollaborationOpenLicenseDraft,
} from '../collaborationLicenseOperations'

const featureKey = 'collaboration-open-settings'

const uniqueIds = (ids: Array<string | number | null | undefined>) =>
  Array.from(new Set(ids.map(item => String(item ?? '').trim()).filter(Boolean)))

const ensureStores = async () => {
  if (!appStore.stores.length) {
    await appStore.refreshCoreData()
  }
  return appStore.stores
}

export const useCollaborationOpenSettings = () => {
  const initializing = ref(false)
  const saving = ref(false)
  const gateError = ref('')
  const selectedLicenseId = ref('')
  const gate = ref(resolveFeatureGate({
    featureKey,
    requireStoreScope: true,
    licenseMode: 'advisory',
  }))
  const draft = reactive<CollaborationOpenLicenseDraft>(createCollaborationLicenseDraft())
  const snapshotBoundStoreIds = ref<string[]>([])

  const licenses = computed(() => collaborationStore.licenses)
  const error = computed(() => gateError.value || collaborationStore.error)
  const canLoadLicenses = computed(() =>
    !['loading', 'hidden', 'permission_denied', 'role_denied', 'store_scope_required'].includes(gate.value.state),
  )
  const canEdit = computed(() => canLoadLicenses.value)

  const applyDraft = (license?: CollaborationLicenseDto | null) => {
    Object.assign(draft, createCollaborationLicenseDraft(license))
    snapshotBoundStoreIds.value = uniqueIds(draft.boundStoreIds) as string[]
  }

  const syncDraftFromSelection = () => {
    const current = licenses.value.find(item => item.id === selectedLicenseId.value)
    applyDraft(current ?? null)
  }

  const startCreate = () => {
    selectedLicenseId.value = ''
    applyDraft(null)
  }

  const toggleStore = (storeId: BackendId) => {
    draft.boundStoreIds = draft.boundStoreIds.includes(storeId)
      ? draft.boundStoreIds.filter(item => item !== storeId)
      : [...draft.boundStoreIds, storeId]
  }

  const loadGate = async () => {
    gateError.value = ''
    try {
      const scopes = await backendApi.listFeatureScopes([featureKey])
      gate.value = resolveFeatureGate({
        featureKey,
        requireStoreScope: true,
        licenseMode: 'advisory',
        featureScope: scopes[0] ?? null,
      })
    } catch (error) {
      gateError.value = error instanceof Error ? error.message : '授权门禁加载失败'
      gate.value = resolveFeatureGate({
        featureKey,
        requireStoreScope: true,
        licenseMode: 'advisory',
      })
    }
  }

  const loadLicenses = async () => {
    if (!canLoadLicenses.value) {
      collaborationStore.licenses = []
      startCreate()
      return
    }
    const next = await collaborationStore.loadLicenses()
    if (selectedLicenseId.value && next.some(item => item.id === selectedLicenseId.value)) {
      syncDraftFromSelection()
      return
    }
    if (next[0]) {
      selectedLicenseId.value = next[0].id
      syncDraftFromSelection()
      return
    }
    startCreate()
  }

  const syncStoreBindings = async (licenseId: BackendId) => {
    const previous = uniqueIds(snapshotBoundStoreIds.value)
    const next = uniqueIds(draft.boundStoreIds)
    const storesToBind = next.filter(item => !previous.includes(item))
    const storesToUnbind = previous.filter(item => !next.includes(item))

    for (const storeId of storesToBind) {
      await collaborationStore.bindLicenseStore(licenseId, storeId)
    }
    for (const storeId of storesToUnbind) {
      await collaborationStore.unbindLicenseStore(licenseId, storeId)
    }
  }

  const saveLicense = async () => {
    saving.value = true
    try {
      const saved = await collaborationStore.saveLicense(toCollaborationLicensePayload(draft))
      await syncStoreBindings(saved.id)
      await collaborationStore.loadLicenses()
      await loadGate()
      selectedLicenseId.value = saved.id
      syncDraftFromSelection()
    } finally {
      saving.value = false
    }
  }

  const init = async () => {
    initializing.value = true
    try {
      await ensureStudioAccess()
      await ensureStores()
      await loadGate()
      await loadLicenses()
    } finally {
      initializing.value = false
    }
  }

  return {
    initializing,
    saving,
    error,
    licenses,
    selectedLicenseId,
    draft,
    gate,
    canEdit,
    collaborationLicenseStatusOptions,
    collaborationRenewActionOptions,
    storeOptions: computed(() => appStore.stores),
    init,
    syncDraftFromSelection,
    startCreate,
    toggleStore,
    saveLicense,
  }
}
