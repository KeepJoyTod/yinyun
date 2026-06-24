<template>
  <div class="overflow-x-auto border border-amber-topbar-border bg-amber-content-bg">
    <table class="w-full min-w-[1240px] border-collapse text-left text-[12px]">
      <thead class="bg-amber-bg/15 text-amber-text-muted">
        <tr>
          <th class="px-3 py-3"><input :checked="allSelected" type="checkbox" @change="$emit('toggleAll', ($event.target as HTMLInputElement).checked)" /></th>
          <th class="px-3 py-3">缩略图</th>
          <th class="px-3 py-3">文件名</th>
          <th class="px-3 py-3">资源类型</th>
          <th class="px-3 py-3">客户/订单/相册</th>
          <th class="px-3 py-3">门店</th>
          <th class="px-3 py-3">上传时间</th>
          <th class="px-3 py-3">评星</th>
          <th class="px-3 py-3">标签</th>
          <th class="px-3 py-3">客户可见</th>
          <th class="px-3 py-3">文件大小</th>
          <th class="px-3 py-3">动作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-amber-topbar-border/60">
        <tr v-for="row in rows" :key="row.assetId" :class="row.assetId === activeResourceId ? 'bg-[#FBF8F2]' : ''">
          <td class="px-3 py-3 align-top">
            <input :checked="selectedIds.includes(row.assetId)" type="checkbox" @change="$emit('toggleOne', row.assetId, ($event.target as HTMLInputElement).checked)" />
          </td>
          <td class="px-3 py-3 align-top">
            <div class="flex h-14 w-14 items-center justify-center overflow-hidden border border-amber-topbar-border bg-[#F7F2E8]">
              <img v-if="row.thumbnailUrl || row.fileUrl" :src="row.thumbnailUrl || row.fileUrl || ''" class="h-full w-full object-cover" />
              <span v-else class="text-[10px] text-amber-text-muted">无图</span>
            </div>
          </td>
          <td class="px-3 py-3 align-top">
            <div class="font-medium text-amber-dark">{{ row.fileName }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">资源 ID {{ row.assetId }}</div>
          </td>
          <td class="px-3 py-3 align-top">{{ getResourceTypeLabel(row.assetType) }}</td>
          <td class="px-3 py-3 align-top">
            <div>{{ row.customerName || '未绑定客户' }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">{{ row.customerPhoneMasked || '无手机号' }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">{{ row.productName || '未绑定产品' }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">订单 {{ row.orderId || '未绑定' }} / 相册 {{ row.albumId || '未绑定' }}</div>
          </td>
          <td class="px-3 py-3 align-top">{{ row.storeName || '-' }}</td>
          <td class="px-3 py-3 align-top">
            <div>{{ row.uploadedAt || '-' }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">{{ row.uploaderName || '未识别上传人' }}</div>
          </td>
          <td class="px-3 py-3 align-top">{{ getResourceRatingLabel(row.rating) }}</td>
          <td class="px-3 py-3 align-top">
            <div class="flex max-w-[180px] flex-wrap gap-1">
              <span v-for="tag in row.tagList" :key="tag.id" class="bg-[#FBF8F2] px-2 py-0.5 text-[10px] text-amber-dark">{{ tag.tagName }}</span>
              <span v-if="!row.tagList.length" class="text-[10px] text-amber-text-muted">未打标签</span>
            </div>
          </td>
          <td class="px-3 py-3 align-top">{{ getVisibilityLabel(row.visible) }}</td>
          <td class="px-3 py-3 align-top">{{ formatFileSize(row.fileSizeBytes) }}</td>
          <td class="px-3 py-3 align-top">
            <div class="flex flex-wrap gap-2">
              <button class="yy-action border border-amber-topbar-border px-2 py-1 hover:bg-black/5" type="button" @click="$emit('edit', row)">编辑</button>
              <button class="yy-action border border-amber-topbar-border px-2 py-1 hover:bg-black/5" type="button" @click="$emit('openAlbum', row)">客片相册</button>
              <button class="yy-action border border-[#B8543B]/35 px-2 py-1 text-[#8C3E2C] hover:bg-[#F8E7E2]" type="button" @click="$emit('delete', row)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ResourceRowDto } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'
import { formatFileSize, getResourceRatingLabel, getResourceTypeLabel, getVisibilityLabel } from '../resourceManageOperations'

defineProps<{
  rows: ResourceRowDto[]
  selectedIds: BackendId[]
  allSelected: boolean
  activeResourceId?: BackendId | null
}>()

defineEmits<{
  toggleAll: [checked: boolean]
  toggleOne: [assetId: BackendId, checked: boolean]
  edit: [row: ResourceRowDto]
  delete: [row: ResourceRowDto]
  openAlbum: [row: ResourceRowDto]
}>()
</script>
