<template>
  <div class="w-[280px] flex flex-col bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden max-[1024px]:w-full max-[1024px]:max-h-[360px]">
    <div class="p-4 border-b border-amber-topbar-border flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">Rolls · {{ filteredAlbums.length }} / {{ allAlbums.length }}</span>
        <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">底片胶卷</h2>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div class="border border-amber-topbar-border bg-white/45 p-2">
          <div class="text-[15px] font-sans text-amber-dark leading-none">{{ totalPhotoCount }}</div>
          <div class="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Photos</div>
        </div>
        <div class="border border-amber-topbar-border bg-white/45 p-2">
          <div class="text-[15px] font-sans text-amber-dark leading-none">{{ readyAlbumCount }}</div>
          <div class="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Ready</div>
        </div>
        <div class="border border-amber-topbar-border bg-white/45 p-2">
          <div class="text-[15px] font-sans text-amber-dark leading-none">{{ needsUploadCount }}</div>
          <div class="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Todo</div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <input
          :value="filterSearch"
          type="text"
          placeholder="客户 / 相册号 / 订单号"
          class="h-8 w-full border border-amber-topbar-border bg-amber-content-bg px-2.5 text-[11px] font-sans text-amber-dark placeholder:text-amber-dark/40 focus:outline-none focus:border-amber-dark/30"
          @input="$emit('update:filterSearch', ($event.target as HTMLInputElement).value)"
        />
        <div class="grid grid-cols-2 gap-2">
          <select
            :value="filterStatus"
            class="h-8 w-full border border-amber-topbar-border bg-amber-content-bg px-2 text-[10.5px] font-sans text-amber-text-muted focus:outline-none focus:border-amber-dark/30"
            @change="$emit('update:filterStatus', ($event.target as HTMLSelectElement).value)"
          >
            <option value="全部">全部状态</option>
            <option value="待客户选片">待客户选片</option>
            <option value="选片中">选片中</option>
            <option value="已交付">已交付</option>
          </select>
          <select
            :value="filterPhotographer"
            class="h-8 w-full border border-amber-topbar-border bg-amber-content-bg px-2 text-[10.5px] font-sans text-amber-text-muted focus:outline-none focus:border-amber-dark/30"
            @change="$emit('update:filterPhotographer', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="opt in photographerOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <button
          v-if="hasActiveFilter"
          class="yy-action self-end text-[10px] font-sans text-amber-text-muted hover:text-amber-dark"
          type="button"
          @click="$emit('resetFilter')"
        >
          重置筛选
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <StateView
        :empty="filteredAlbums.length === 0"
        empty-title="没有匹配的相册"
        empty-hint="调整筛选条件或重置筛选后查看全部相册。"
      >
        <template #empty-action>
          <button
            class="yy-action border border-amber-topbar-border bg-white px-3 py-1.5 text-[10px] font-sans text-amber-text-muted hover:text-amber-dark"
            type="button"
            @click="$emit('resetFilter')"
          >
            重置筛选
          </button>
        </template>
        <div
          v-for="album in albums"
          :key="album.id"
          class="yy-clickable-row p-5 border-b border-amber-topbar-border cursor-pointer transition-all relative group"
          :class="activeAlbumId === album.id ? 'bg-amber-accent/5' : 'hover:bg-amber-bg/5'"
          @click="$emit('update:activeAlbumId', album.id)"
        >
          <div v-if="activeAlbumId === album.id" class="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-accent"></div>

          <div class="flex justify-between items-start mb-2">
            <div class="flex flex-col gap-0.5">
              <span class="text-[13px] font-sans font-medium text-amber-dark group-hover:text-amber-accent transition-colors">{{ album.customer }}</span>
              <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-wider">{{ album.id }}</span>
            </div>
            <span
              class="px-1.5 py-0.5 rounded-md text-[9px] font-sans font-medium uppercase tracking-wider"
              :class="statusStyles[album.status]"
            >
              {{ album.status }}
            </span>
          </div>

          <div class="text-[10px] font-sans text-amber-text-muted mb-3 opacity-60">
            {{ album.date }} · {{ album.photographer }}
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-[12px] font-mono font-medium text-amber-dark">{{ album.selectedCount }}</span>
              <span class="text-[10px] font-mono text-amber-text-muted">/ {{ album.totalCount }} 已选</span>
            </div>
            <div class="w-16 h-1 bg-amber-topbar-border rounded-full overflow-hidden">
              <div
                class="h-full bg-amber-accent transition-all duration-500"
                :style="{ width: albumProgress(album) + '%' }"
              ></div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-[10px] font-sans text-amber-text-muted">
            <span>{{ albumNextStep(album) }}</span>
            <span class="font-mono uppercase tracking-[0.14em]">{{ album.negatives.length }} files</span>
          </div>
        </div>
      </StateView>
    </div>
  </div>
</template>

<script setup lang="ts">
import StateView from '../../../shared/components/feedback/StateView.vue'
import type { Album } from '../../../shared/stores/appStore'

defineProps<{
  allAlbums: Album[]
  filteredAlbums: Album[]
  albums: Album[]
  activeAlbumId: string
  filterSearch: string
  filterStatus: string
  filterPhotographer: string
  photographerOptions: string[]
  totalPhotoCount: number
  readyAlbumCount: number
  needsUploadCount: number
  hasActiveFilter: boolean
  statusStyles: Record<string, string>
  albumProgress: (album: Album) => number
  albumNextStep: (album: Album) => string
}>()

defineEmits<{
  'update:activeAlbumId': [value: string]
  'update:filterSearch': [value: string]
  'update:filterStatus': [value: string]
  'update:filterPhotographer': [value: string]
  resetFilter: []
}>()
</script>
