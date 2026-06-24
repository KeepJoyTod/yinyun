<template>
  <dl class="grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-[11px]">
    <dt class="text-amber-text-muted">服务</dt>
    <dd class="font-medium text-amber-dark">{{ order.service || '未关联产品' }}</dd>
    <template v-if="product">
      <dt class="text-amber-text-muted">规格</dt>
      <dd class="text-amber-text-muted">{{ product.spec || '—' }}</dd>
      <dt class="text-amber-text-muted">底片</dt>
      <dd class="text-amber-text-muted">{{ product.includedCount }} 张入册</dd>
    </template>
    <dt class="text-amber-text-muted">加购</dt>
    <dd class="text-amber-text-muted">{{ addonSummary }}</dd>
  </dl>
</template>

<script setup lang="ts">
import type { BookingOrder, ProductConfig } from '../../shared/stores/appStore'

defineProps<{
  order: BookingOrder
  product: ProductConfig | null
  addonSummary: string
}>()
</script>
