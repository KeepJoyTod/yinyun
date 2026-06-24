<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
    <input :value="keyword" class="h-9 w-[210px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50" placeholder="请输入表单名称" type="search" @input="$emit('update:keyword', ($event.target as HTMLInputElement).value)" @keydown.enter="$emit('search')" />
    <select :value="status" class="h-9 w-[122px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50" @change="$emit('update:status', ($event.target as HTMLSelectElement).value)">
      <option value="">全部状态</option>
      <option value="PUBLISHED">已发布</option>
      <option value="DRAFT">草稿</option>
      <option value="OFFLINE">已下线</option>
    </select>
    <select :value="storeFilter" class="h-9 w-[150px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50" @change="$emit('update:storeFilter', ($event.target as HTMLSelectElement).value)">
      <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
      <option v-for="store in concreteStoreOptions" :key="String(store.backendId ?? store.name)" :value="String(store.backendId)">
        {{ store.name }}
      </option>
    </select>
    <button class="yy-action inline-flex items-center gap-2 bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="$emit('search')">搜索</button>
    <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted hover:bg-white" type="button" @click="$emit('reset')">重置</button>
    <span class="min-w-0 text-[12px] text-amber-text-muted">查看数据保留订单页深链，同时新增页内提交数据视图。</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  keyword: string
  status: string
  storeFilter: string
  concreteStoreOptions: Array<{ backendId?: string | number | null; name: string }>
}>()

defineEmits<{
  'update:keyword': [value: string]
  'update:status': [value: string]
  'update:storeFilter': [value: string]
  search: []
  reset: []
}>()
</script>
