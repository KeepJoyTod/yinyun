<template>
  <Transition name="fade">
    <div
      v-if="notice"
      class="yy-notice border px-4 py-3 text-[11px] font-sans"
      :class="
        notice.type === 'error'
          ? 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
          : 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
      "
    >
      {{ notice.message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Notice } from '../composables/useNotice'

defineProps<{ notice: Notice | null }>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
