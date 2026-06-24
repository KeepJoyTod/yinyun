<template>
  <div
    class="flex flex-wrap items-center gap-1.5 border-b border-amber-topbar-border bg-amber-content-bg px-7 py-3"
    aria-label="订单状态：全部有效订单、待服务、服务中、已完成、待支付、已取消、已退单"
  >
    <button
      v-for="tab in statusTabItems"
      :key="tab.key"
      class="yy-action px-3.5 py-1.5 rounded-md text-[13px] font-sans transition-all"
      :class="statusTab === tab.key
        ? 'bg-amber-dark text-[#F4EFE6] font-semibold'
        : 'text-amber-text-muted hover:bg-black/5 hover:text-amber-dark'"
      type="button"
      @click="$emit('setStatusTab', tab.key)"
    >
      {{ tab.label }}
      <span
        class="ml-1.5 font-mono text-[11px]"
        :class="statusTab === tab.key ? 'text-amber-accent-soft' : 'opacity-55'"
      >{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatusGroupCount, OrderStatusGroupKey } from './orderOperations'

defineProps<{
  statusTab: string
  statusTabItems: OrderStatusGroupCount[]
}>()

defineEmits<{
  setStatusTab: [key: OrderStatusGroupKey]
}>()
</script>
