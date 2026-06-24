<template>
  <Transition name="fade">
    <div
      v-if="notice"
      class="mx-6 mt-4 border px-3 py-2 text-[10.5px] font-sans leading-relaxed"
      :class="notice.type === 'error'
        ? 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
        : 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'"
      role="status"
      aria-label="订单操作反馈"
    >
      <div class="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] opacity-70">订单操作反馈</div>
      {{ notice.message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  notice: {
    type: 'success' | 'error'
    message: string
  } | null
}>()
</script>
