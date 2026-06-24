<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
    <input
      :value="keyword"
      class="h-9 w-[220px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none"
      placeholder="请输入页面名称"
      type="search"
      @input="$emit('update:keyword', ($event.target as HTMLInputElement).value.trim())"
      @keydown.enter="$emit('search')"
    />
    <select
      :value="status"
      class="h-9 w-[120px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none"
      @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">全部状态</option>
      <option value="PUBLISHED">已发布</option>
      <option value="DRAFT">草稿</option>
      <option value="OFFLINE">已下线</option>
    </select>
    <button class="yy-action bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="$emit('search')">
      搜索
    </button>
    <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted hover:bg-white" type="button" @click="$emit('reset')">
      重置
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  keyword: string
  status: string
}>()

defineEmits<{
  'update:keyword': [value: string]
  'update:status': [value: string]
  search: []
  reset: []
}>()
</script>
