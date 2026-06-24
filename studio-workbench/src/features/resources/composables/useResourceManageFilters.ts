import { computed, onMounted, reactive, watch } from 'vue'
import { useRouteQueryFilters } from '../../../shared/composables/useRouteQueryFilters'
import { createDefaultResourceManageFilters, type ResourceManageFilters } from '../resourceTypes'

export const useResourceManageFilters = () => {
  const filters = reactive<ResourceManageFilters>(createDefaultResourceManageFilters())

  const { applyFromQuery, syncToUrl } = useRouteQueryFilters({
    buildQuery: () => ({
      q: filters.keyword.trim(),
      start: filters.beginUploadTime,
      end: filters.endUploadTime,
      storeId: filters.storeId,
      albumId: filters.albumId,
      orderId: filters.orderId,
      productId: filters.productId,
      uploaderKeyword: filters.uploaderKeyword.trim(),
      assetType: filters.assetType,
      rating: filters.rating,
      tagIds: filters.tagIds.join(','),
      visible: filters.visible,
    }),
    parseQuery: get => {
      filters.keyword = get('q')
      filters.beginUploadTime = get('start')
      filters.endUploadTime = get('end')
      filters.storeId = get('storeId')
      filters.albumId = get('albumId')
      filters.orderId = get('orderId')
      filters.productId = get('productId')
      filters.uploaderKeyword = get('uploaderKeyword')
      filters.assetType = get('assetType')
      filters.rating = get('rating')
      filters.tagIds = get('tagIds')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
      filters.visible = get('visible')
    },
  })

  onMounted(() => {
    applyFromQuery()
  })

  watch(
    () => [
      filters.keyword,
      filters.beginUploadTime,
      filters.endUploadTime,
      filters.storeId,
      filters.albumId,
      filters.orderId,
      filters.productId,
      filters.uploaderKeyword,
      filters.assetType,
      filters.rating,
      filters.tagIds.join(','),
      filters.visible,
    ],
    () => syncToUrl(),
  )

  const hasActiveFilter = computed(() => Boolean(
    filters.keyword
    || filters.beginUploadTime
    || filters.endUploadTime
    || filters.storeId
    || filters.albumId
    || filters.orderId
    || filters.productId
    || filters.uploaderKeyword
    || filters.assetType
    || filters.rating
    || filters.tagIds.length
    || filters.visible,
  ))

  const resetFilters = () => Object.assign(filters, createDefaultResourceManageFilters())

  const filterSignature = computed(() => JSON.stringify(filters))

  return {
    filters,
    hasActiveFilter,
    resetFilters,
    filterSignature,
  }
}
