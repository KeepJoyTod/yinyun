<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg/55">
    <div class="border-b border-amber-topbar-border p-5">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action yy-filter-chip"
          :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="$emit('update:activeFilter', filter.key)"
        >
          {{ filter.label }} {{ filter.count }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in cards"
        :key="card.label"
        class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
      >
        <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
        <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
          <span class="text-[10px] font-sans text-amber-text-muted">{{ card.scope }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MerchantProductFilter } from '../merchantProductOperations'

defineProps<{
  activeFilter: MerchantProductFilter
  quickFilters: Array<{ key: MerchantProductFilter; label: string; count: number }>
  cards: Array<{ label: string; value: string; hint: string; scope: string }>
}>()

defineEmits<{
  'update:activeFilter': [value: MerchantProductFilter]
}>()
</script>
