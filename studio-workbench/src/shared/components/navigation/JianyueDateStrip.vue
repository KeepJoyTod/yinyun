<template>
  <div ref="scrollRef" class="jianyue-date-strip flex items-center gap-2 overflow-x-auto border-b border-amber-topbar-border bg-amber-content-bg px-7 py-3">
    <button
      class="yy-action h-10 w-10 shrink-0 rounded-md border border-amber-topbar-border bg-[#FBF8F2] text-[16px] text-amber-text-muted transition-colors hover:bg-white hover:text-amber-dark"
      type="button"
      aria-label="前一天"
      @click="emit('shift', -1)"
    >
      ‹
    </button>

    <button
      v-for="item in items"
      :key="item.date"
      class="yy-action min-w-[128px] rounded-md border px-4 py-2 text-left transition-colors"
      :class="item.active
        ? 'border-amber-accent bg-white text-amber-accent'
        : item.today
          ? 'border-amber-accent/35 bg-[#FFF8F1] text-amber-dark'
          : 'border-transparent text-amber-text-muted hover:border-amber-topbar-border hover:bg-white'"
      type="button"
      @click="emit('select', item.date)"
    >
      <span class="block text-[12px] font-sans font-semibold">{{ item.shortLabel }}</span>
      <span class="mt-0.5 block text-[11px] font-mono">{{ item.dateLabel }}</span>
    </button>

    <button
      class="yy-action h-10 w-10 shrink-0 rounded-md border border-amber-topbar-border bg-[#FBF8F2] text-[16px] text-amber-text-muted transition-colors hover:bg-white hover:text-amber-dark"
      type="button"
      aria-label="后一天"
      @click="emit('shift', 1)"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHorizontalWheel } from '../../composables/useHorizontalWheel'

type DateStripItem = {
  date: string
  shortLabel: string
  dateLabel: string
  active: boolean
  today: boolean
}

defineProps<{
  items: DateStripItem[]
}>()

const emit = defineEmits<{
  select: [date: string]
  shift: [days: number]
}>()

const scrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(scrollRef)
</script>
