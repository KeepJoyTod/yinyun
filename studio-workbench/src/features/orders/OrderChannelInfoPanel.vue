<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 font-sans text-[14px] font-medium text-amber-dark">{{ label }}</div>
    <dl class="grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-[11px]">
      <dt class="text-amber-text-muted">来源</dt>
      <dd class="text-amber-dark">{{ source || '本地' }}</dd>
      <dt class="text-amber-text-muted">方式</dt>
      <dd class="text-amber-dark">{{ method || '人工处理' }}</dd>
      <dt class="text-amber-text-muted">支付</dt>
      <dd class="text-amber-dark">{{ payment }}</dd>
    </dl>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  source?: string
  method?: string
  payment: string
}>()
</script>
