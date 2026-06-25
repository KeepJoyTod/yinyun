import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { backendApi, type ProductDto, type ResourceBatchUpdatePayload, type ResourceRowDto, type ResourceTagOptionDto, type StoreDto } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'
import { resourcesApi } from '../../../shared/api/backendResourcesApi'
import { useFeatureScopeGate } from '../../system/useFeatureScopeGate'
import type { ResourceManageFilters } from '../resourceTypes'

type SaveMetaPayload = {
  assetType: string
  rating: number
  visible: boolean
  selectedTagIds: BackendId[]
}

export const useResourceManage = (filters: ResourceManageFilters) => {
  const router = useRouter()
  const featureGate = useFeatureScopeGate({
    featureKey: 'resource-manage',
    requireStoreScope: true,
  })
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)
  const statusMessage = ref('')
  const page = ref(1)
  const pageSize = ref(50)
  const resources = ref<ResourceRowDto[]>([])
  const total = ref(0)
  const stores = ref<StoreDto[]>([])
  const products = ref<ProductDto[]>([])
  const tagOptions = ref<ResourceTagOptionDto[]>([])
  const selectedIds = ref<BackendId[]>([])
  const activeResource = ref<ResourceRowDto | null>(null)
  const drawerOpen = ref(false)

  const loadResources = async () => {
    loading.value = true
    error.value = ''
    try {
      await featureGate.loadGate()
      if (!featureGate.canLoadData.value) {
        resources.value = []
        total.value = 0
        selectedIds.value = []
        activeResource.value = null
        return
      }
      const resourcePage = await resourcesApi.listResources({
        pageNum: page.value,
        pageSize: pageSize.value,
        keyword: filters.keyword.trim() || undefined,
        beginUploadTime: filters.beginUploadTime || undefined,
        endUploadTime: filters.endUploadTime || undefined,
        storeId: filters.storeId || undefined,
        albumId: filters.albumId || undefined,
        orderId: filters.orderId || undefined,
        productId: filters.productId || undefined,
        uploaderKeyword: filters.uploaderKeyword.trim() || undefined,
        assetType: filters.assetType || undefined,
        rating: filters.rating ? Number(filters.rating) : undefined,
        tagIds: filters.tagIds.length ? filters.tagIds : undefined,
        visible: filters.visible === '' ? undefined : filters.visible === '1',
      })
      resources.value = resourcePage.items
      total.value = resourcePage.total
      selectedIds.value = selectedIds.value.filter(id => resources.value.some(item => item.assetId === id))
      if (!resources.value.some(item => item.assetId === activeResource.value?.assetId)) {
        activeResource.value = resources.value[0] ?? null
      }
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '资源列表加载失败'
    } finally {
      loading.value = false
    }
  }

  const loadReferenceData = async () => {
    await featureGate.loadGate()
    if (!featureGate.canLoadData.value) {
      stores.value = []
      tagOptions.value = []
      products.value = []
      return
    }
    const [storesResult, tagsResult, productsResult] = await Promise.all([
      backendApi.listStores().catch(() => []),
      resourcesApi.listResourceTags().catch(() => ({ items: [] })),
      backendApi.listProducts().catch(() => []),
    ])
    stores.value = storesResult
    tagOptions.value = tagsResult.items.map(item => ({ id: item.id, tagName: item.tagName }))
    products.value = productsResult
  }

  onMounted(() => {
    void loadReferenceData()
  })

  const refresh = async () => {
    await loadResources()
    if (!featureGate.canLoadData.value) return
    const tagsResult = await resourcesApi.listResourceTags().catch(() => ({ items: [] }))
    tagOptions.value = tagsResult.items.map(item => ({ id: item.id, tagName: item.tagName }))
  }

  const setPage = async (nextPage: number) => {
    const normalized = Math.max(1, nextPage)
    if (page.value === normalized) return
    page.value = normalized
    await refresh()
  }

  const setPageSize = async (nextPageSize: number) => {
    const normalized = Math.max(1, nextPageSize)
    if (pageSize.value === normalized && page.value === 1) return
    pageSize.value = normalized
    page.value = 1
    await refresh()
  }

  const resetPagination = () => {
    page.value = 1
  }

  const toggleSelected = (assetId: BackendId, checked: boolean) => {
    selectedIds.value = checked
      ? Array.from(new Set([...selectedIds.value, assetId]))
      : selectedIds.value.filter(id => id !== assetId)
  }

  const toggleSelectAll = (checked: boolean) => {
    selectedIds.value = checked ? resources.value.map(item => item.assetId) : []
  }

  const openMeta = (resource: ResourceRowDto) => {
    activeResource.value = resource
    drawerOpen.value = true
  }

  const closeMeta = () => {
    drawerOpen.value = false
  }

  const submitBatchUpdate = async (payload: ResourceBatchUpdatePayload, successMessage: string) => {
    submitting.value = true
    statusMessage.value = ''
    try {
      await resourcesApi.batchUpdateResources(payload)
      statusMessage.value = successMessage
      await refresh()
    } finally {
      submitting.value = false
    }
  }

  const applyBatchUpdate = async (payload: ResourceBatchUpdatePayload) => {
    await submitBatchUpdate(payload, '批量资源元数据已刷新。')
  }

  const saveMeta = async (payload: SaveMetaPayload) => {
    if (!activeResource.value) return
    const currentTagIds = new Set(activeResource.value.tagList.map(item => item.id))
    const nextTagIds = new Set(payload.selectedTagIds)
    await submitBatchUpdate({
      assetIds: [activeResource.value.assetId],
      assetType: payload.assetType,
      rating: payload.rating,
      visible: payload.visible,
      tagIdsToAdd: payload.selectedTagIds.filter(id => !currentTagIds.has(id)),
      tagIdsToRemove: [...currentTagIds].filter(id => !nextTagIds.has(id)),
    }, '资源元数据已保存。')
    const next = resources.value.find(item => item.assetId === activeResource.value?.assetId) ?? null
    activeResource.value = next
  }

  const removeResource = async (resource: ResourceRowDto) => {
    if (!window.confirm(`确认删除资源“${resource.fileName}”吗？此操作只删除资源主记录，不删除标签字典。`)) return
    submitting.value = true
    statusMessage.value = ''
    try {
      await resourcesApi.deleteResource(resource.assetId)
      statusMessage.value = '资源已删除。'
      await refresh()
    } finally {
      submitting.value = false
    }
  }

  const jumpToAlbum = (resource: ResourceRowDto) => {
    router.push({
      path: '/service/photos',
      query: {
        album: resource.albumId || undefined,
      },
    })
  }

  const allSelected = computed(() => resources.value.length > 0 && selectedIds.value.length === resources.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const pageStart = computed(() => total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1)
  const pageEnd = computed(() => total.value === 0 ? 0 : Math.min(total.value, page.value * pageSize.value))
  const hasPrevPage = computed(() => page.value > 1)
  const hasNextPage = computed(() => page.value < totalPages.value)

  return {
    loading,
    error,
    gate: featureGate.gate,
    gateLoading: featureGate.gateLoading,
    gateError: featureGate.gateError,
    canLoadData: featureGate.canLoadData,
    submitting,
    statusMessage,
    page,
    pageSize,
    totalPages,
    pageStart,
    pageEnd,
    hasPrevPage,
    hasNextPage,
    resources,
    total,
    stores,
    products,
    tagOptions,
    selectedIds,
    activeResource,
    drawerOpen,
    allSelected,
    refresh,
    setPage,
    setPageSize,
    resetPagination,
    toggleSelected,
    toggleSelectAll,
    openMeta,
    closeMeta,
    applyBatchUpdate,
    saveMeta,
    removeResource,
    jumpToAlbum,
  }
}
