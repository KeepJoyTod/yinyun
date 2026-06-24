<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg p-4">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input :value="filters.keyword" class="h-10 border border-amber-topbar-border px-3 text-[12px]" placeholder="客户/手机号/文件名关键词" @input="patch({ keyword: readInput($event) })" />
      <select :value="filters.storeId" class="h-10 border border-amber-topbar-border px-3 text-[12px]" @change="patch({ storeId: readInput($event) })">
        <option value="">全部门店</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
      </select>
      <input :value="filters.albumId" class="h-10 border border-amber-topbar-border px-3 text-[12px]" placeholder="相册 ID" @input="patch({ albumId: readInput($event) })" />
      <input :value="filters.orderId" class="h-10 border border-amber-topbar-border px-3 text-[12px]" placeholder="订单 ID" @input="patch({ orderId: readInput($event) })" />
      <select :value="filters.productId" class="h-10 border border-amber-topbar-border px-3 text-[12px]" @change="patch({ productId: readInput($event) })">
        <option value="">全部产品</option>
        <option v-for="product in filteredProducts" :key="product.id" :value="product.id">{{ product.name }}</option>
      </select>
      <input :value="filters.uploaderKeyword" class="h-10 border border-amber-topbar-border px-3 text-[12px]" placeholder="上传人关键词" @input="patch({ uploaderKeyword: readInput($event) })" />
      <select :value="filters.assetType" class="h-10 border border-amber-topbar-border px-3 text-[12px]" @change="patch({ assetType: readInput($event) })">
        <option value="">全部资源类型</option>
        <option value="RAW">原片</option>
        <option value="PROOF">样片</option>
        <option value="RETOUCHED">精修</option>
        <option value="DELIVERY">交付图</option>
        <option value="OTHER">其他</option>
      </select>
      <input :value="filters.beginUploadTime" class="h-10 border border-amber-topbar-border px-3 text-[12px]" type="date" @input="patch({ beginUploadTime: readInput($event) })" />
      <input :value="filters.endUploadTime" class="h-10 border border-amber-topbar-border px-3 text-[12px]" type="date" @input="patch({ endUploadTime: readInput($event) })" />
      <select :value="filters.rating" class="h-10 border border-amber-topbar-border px-3 text-[12px]" @change="patch({ rating: readInput($event) })">
        <option value="">全部评星</option>
        <option value="0">未评星</option>
        <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="String(rating)">{{ rating }} 星</option>
      </select>
      <select :value="filters.visible" class="h-10 border border-amber-topbar-border px-3 text-[12px]" @change="patch({ visible: readInput($event) })">
        <option value="">全部可见性</option>
        <option value="1">客户可见</option>
        <option value="0">仅内部</option>
      </select>
      <select class="min-h-10 border border-amber-topbar-border px-3 py-2 text-[12px]" multiple @change="patch({ tagIds: readMultiSelect($event) })">
        <option v-for="tag in tagOptions" :key="tag.id" :selected="filters.tagIds.includes(tag.id)" :value="tag.id">{{ tag.tagName }}</option>
      </select>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-amber-text-muted">
      <span>标签支持多选，并同步到 URL。</span>
      <button v-if="hasActiveFilter" class="yy-action border border-amber-topbar-border px-3 py-1.5 text-amber-dark hover:bg-black/5" type="button" @click="$emit('reset')">清空筛选</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductDto, ResourceTagOptionDto, StoreDto } from '../../../shared/api/backend'
import type { ResourceManageFilters } from '../resourceTypes'

const props = defineProps<{
  filters: ResourceManageFilters
  stores: StoreDto[]
  products: ProductDto[]
  tagOptions: ResourceTagOptionDto[]
  hasActiveFilter: boolean
}>()

const emit = defineEmits<{
  patch: [value: Partial<ResourceManageFilters>]
  reset: []
}>()

const patch = (value: Partial<ResourceManageFilters>) => emit('patch', value)

const readInput = (event: Event) => (event.target as HTMLInputElement | HTMLSelectElement).value

const readMultiSelect = (event: Event) =>
  Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value)

const filteredProducts = computed(() => props.filters.storeId
  ? props.products.filter(product => String(product.storeId ?? '') === props.filters.storeId)
  : props.products)
</script>
