<template>
  <Transition name="yy-notice-fade">
    <div
      v-if="notice"
      class="border px-4 py-3 text-[11px] font-sans leading-relaxed"
      :class="notice.type === 'error'
        ? 'border-[#B8543B]/30 bg-[#B8543B]/10 text-[#8C3E2C]'
        : 'border-[#2D7A4D]/20 bg-[#EBF4ED] text-[#2D7A4D]'"
      role="status"
    >
      {{ notice.message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
export type NoticeTone = 'success' | 'error'
export type NoticePayload = { type: NoticeTone; message: string } | null

defineProps<{
  notice: NoticePayload
}>()
</script>

<style scoped>
.yy-notice-fade-enter-active,
.yy-notice-fade-leave-active {
  transition: opacity 0.3s ease;
}

.yy-notice-fade-enter-from,
.yy-notice-fade-leave-to {
  opacity: 0;
}
</style>
