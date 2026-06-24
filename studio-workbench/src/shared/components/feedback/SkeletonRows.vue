<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse border border-amber-topbar-border bg-white/55"
      :style="{ height: rowHeight + 'px' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
    rowHeight?: number
  }>(),
  {
    count: 4,
    rowHeight: 78,
  },
)
</script>
