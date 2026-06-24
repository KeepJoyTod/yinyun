<template>
  <div class="yy-filter-bar">
    <div class="relative">
      <select :value="storeFilter" class="h-9 w-[146px] appearance-none border border-amber-topbar-border bg-[#FBF8F2] px-3 pr-8 text-[12px] text-amber-dark outline-none" @change="$emit('update:storeFilter', ($event.target as HTMLSelectElement).value)">
        <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
        <option v-for="store in concreteStoreOptions" :key="String(store.backendId ?? store.name)" :value="String(store.backendId)">
          {{ store.name }}
        </option>
      </select>
      <ChevronDown :size="13" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-text-muted" />
    </div>
    <input :value="searchQuery" class="h-9 w-[150px] border border-amber-topbar-border bg-[#FBF8F2] px-3 text-[12px] text-amber-dark outline-none" placeholder="服务组名称" type="text" @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)" />
    <div class="relative">
      <select :value="activeFilter" class="h-9 w-[120px] appearance-none border border-amber-topbar-border bg-[#FBF8F2] px-3 pr-8 text-[12px] text-amber-dark outline-none" @change="$emit('update:activeFilter', (($event.target as HTMLSelectElement).value as ServiceGroupStatusFilter))">
        <option value="all">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">停用</option>
        <option value="low-capacity">低容量</option>
      </select>
      <ChevronDown :size="13" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-text-muted" />
    </div>
    <button class="yy-action bg-amber-dark px-4 py-2 text-[12px] text-[#F4EFE6]" type="button" @click="$emit('reload')">搜索</button>
    <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted" type="button" @click="$emit('reset')">重置</button>
    <button class="yy-action ml-auto inline-flex items-center gap-2 border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-text-muted disabled:opacity-50 max-[720px]:ml-0" :disabled="loading" type="button" @click="$emit('reload')">
      <RefreshCcw :size="13" :class="{ 'animate-spin': loading }" />
      {{ loading ? '刷新中...' : '刷新' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, RefreshCcw } from 'lucide-vue-next'
import type { ServiceGroupStatusFilter } from '../merchantConfigOperations'

defineProps<{
  loading: boolean
  storeFilter: string
  searchQuery: string
  activeFilter: ServiceGroupStatusFilter
  concreteStoreOptions: Array<{ backendId?: string | number | null; name: string }>
}>()

defineEmits<{
  'update:storeFilter': [value: string]
  'update:searchQuery': [value: string]
  'update:activeFilter': [value: ServiceGroupStatusFilter]
  reload: []
  reset: []
}>()
</script>
