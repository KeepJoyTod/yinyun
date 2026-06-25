<template>
  <form class="flex flex-wrap items-end gap-3 border-b border-amber-topbar-border px-5 py-4" @submit.prevent="$emit('apply')">
    <label class="flex flex-col gap-1">
      <span class="text-[10px] text-amber-text-muted">客户</span>
      <input v-model="filters.customerName" class="h-8 w-[180px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-[10px] text-amber-text-muted">参与状态</span>
      <input v-model="filters.participationStatus" class="h-8 w-[150px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-[10px] text-amber-text-muted">转化状态</span>
      <input v-model="filters.conversionStatus" class="h-8 w-[150px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-[10px] text-amber-text-muted">退款状态</span>
      <input v-model="filters.refundStatus" class="h-8 w-[150px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
    </label>
    <button class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] text-[#F4EFE6]" type="submit">查询</button>
    <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('reset')">重置</button>
  </form>
</template>

<script setup lang="ts">
import type { MarketingParticipationListQuery } from '../../../shared/api/backend'

defineProps<{
  filters: MarketingParticipationListQuery
}>()

defineEmits<{
  apply: []
  reset: []
}>()
</script>
