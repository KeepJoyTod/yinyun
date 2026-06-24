<template>
  <button
    class="yy-action rounded-md border px-3 py-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
    :class="tone === 'primary'
      ? 'border-amber-dark bg-amber-dark text-[#F4EFE6] hover:bg-black/90'
      : 'border-amber-topbar-border bg-white text-amber-dark hover:bg-black/5'"
    type="button"
    :title="titleText"
    :disabled="disabled"
    @click="emit('click')"
  >
    {{ loading ? loadingLabel : label }}
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  loadingLabel: string
  titleText: string
  disabled?: boolean
  loading?: boolean
  tone?: 'neutral' | 'primary'
}>(), {
  disabled: false,
  loading: false,
  tone: 'neutral',
})

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>
