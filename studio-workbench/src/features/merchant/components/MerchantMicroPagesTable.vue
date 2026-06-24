<template>
  <div class="min-w-0">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[980px] border-collapse">
        <thead>
          <tr class="border-b border-amber-topbar-border bg-[#F4EFE6]/70 text-left text-[12px] text-amber-text-muted">
            <th class="px-4 py-3 font-semibold">页面名称</th>
            <th class="px-4 py-3 font-semibold">更新时间</th>
            <th class="px-4 py-3 font-semibold">状态</th>
            <th class="px-4 py-3 font-semibold">推广链接</th>
            <th class="px-4 py-3 font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-topbar-border/55">
          <tr v-for="page in pages" :key="page.id" class="hover:bg-white/65" :class="page.id === selectedPageId ? 'bg-white/70' : ''">
            <td class="px-4 py-4 text-[13px] text-amber-dark">
              <button class="max-w-[260px] truncate text-left font-medium hover:text-[#C65F2D]" type="button" @click="$emit('selectPage', page)">
                {{ page.pageTitle }}
              </button>
              <div class="mt-1 text-[11px] text-amber-text-muted">{{ page.pageDesc || '-' }}</div>
            </td>
            <td class="px-4 py-4 font-mono text-[12px] text-amber-text-muted">{{ page.publishedAt || '-' }}</td>
            <td class="px-4 py-4">
              <span class="inline-flex px-2 py-1 text-[11px]" :class="statusClass(page.status)">{{ statusLabel(page.status) }}</span>
            </td>
            <td class="px-4 py-4">
              <button class="text-[12px] text-[#C65F2D] hover:underline" type="button" @click="$emit('copyLink', pageLink(page), `link-${page.id}`)">
                复制链接
              </button>
            </td>
            <td class="px-4 py-4">
              <div class="flex flex-wrap items-center gap-2">
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="$emit('editPage', page)">
                  编辑
                </button>
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="$emit('copyPage', page)">
                  复制
                </button>
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="$emit('promotePage', page)">
                  推广
                </button>
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="$emit('previewPage', page)">
                  预览
                </button>
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="$emit('togglePublish', page)">
                  {{ page.status === 'PUBLISHED' ? '下线' : '发布' }}
                </button>
                <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-[#B8543B] hover:bg-white" type="button" @click="$emit('deletePage', page)">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MicroPageDto } from '../../../shared/api/backend'

defineProps<{
  pages: MicroPageDto[]
  selectedPageId: string
  statusLabel: (value: string) => string
  statusClass: (value: string) => string
  pageLink: (page: Pick<MicroPageDto, 'id' | 'linkKey' | 'storeId'>) => string
}>()

defineEmits<{
  selectPage: [page: MicroPageDto]
  editPage: [page: MicroPageDto]
  copyPage: [page: MicroPageDto]
  promotePage: [page: MicroPageDto]
  previewPage: [page: MicroPageDto]
  togglePublish: [page: MicroPageDto]
  deletePage: [page: MicroPageDto]
  copyLink: [link: string, key: string]
}>()
</script>
