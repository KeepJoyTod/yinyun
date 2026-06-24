<template>
  <div class="flex items-center gap-1">
    <button
      v-if="canAdvance"
      class="yy-action rounded border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-sans font-medium text-accent hover:bg-accent/20 transition-colors"
      type="button"
      :disabled="advancing"
      @click="$emit('advance')"
    >
      {{ advancing ? '处理中...' : nextLabel }}
    </button>
    <button
      class="yy-action rounded border border-hairline px-2 py-1 text-[10px] font-sans text-ink-muted hover:bg-surface-1 transition-colors"
      type="button"
      @click="$emit('print')"
    >
      打印
    </button>
    <button
      class="yy-action rounded border border-hairline px-2 py-1 text-[10px] font-sans text-ink-muted hover:bg-surface-1 transition-colors"
      type="button"
      @click="$emit('detail')"
    >
      详情
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canAdvance: boolean
  advancing: boolean
  nextLabel: string
}>()

defineEmits<{
  advance: []
  print: []
  detail: []
}>()
</script>
