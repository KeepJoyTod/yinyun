<template>
  <section class="notification-ops-board border border-amber-topbar-border bg-amber-content-bg/55">
    <div class="border-b border-amber-topbar-border p-5">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="filter in quickNotificationFilters"
          :key="filter.key"
          class="yy-action yy-filter-chip"
          :class="activeNotificationFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="$emit('update:activeNotificationFilter', filter.key)"
        >
          {{ filter.label }} 路 {{ filter.count }}
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="item in cards"
        :key="item.label"
        class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
      >
        <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ item.label }}</div>
        <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ item.value }}</strong>
          <span class="text-[10px] font-sans text-amber-text-muted">{{ item.scope }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QuickNotificationFilter } from '../merchantOperationsOperations'

defineProps<{
  activeNotificationFilter: QuickNotificationFilter
  quickNotificationFilters: Array<{ key: QuickNotificationFilter; label: string; count: number }>
  cards: Array<{ label: string; value: string; hint: string; scope: string }>
}>()

defineEmits<{
  'update:activeNotificationFilter': [value: QuickNotificationFilter]
}>()
</script>
