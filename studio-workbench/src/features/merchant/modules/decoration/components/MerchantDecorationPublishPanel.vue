<template>
  <div class="border border-amber-topbar-border bg-white px-4 py-3 text-[12px] text-amber-text-muted">
    <div class="font-medium text-amber-dark">{{ title }}</div>
    <div class="mt-1">{{ statusText }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  statusText: string
}>()
</script>
