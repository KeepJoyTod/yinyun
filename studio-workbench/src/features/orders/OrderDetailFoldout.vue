<template>
  <details class="order-detail-foldout border border-amber-topbar-border bg-amber-content-bg/55">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-sans text-[14px] font-medium text-amber-dark">
      <span>{{ title }}</span>
      <span class="border border-amber-topbar-border bg-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
        {{ badge }}
      </span>
    </summary>
    <div class="border-t border-amber-topbar-border/70 px-4 py-3">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  badge: string
}>()
</script>
