<template>
  <div class="merchant-module-chrome flex flex-col gap-5">
    <section class="border border-amber-topbar-border/70 bg-[#FBF8F2] shadow-[0_10px_28px_rgba(26,24,20,0.04)]">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border/60 px-4 py-3 max-[900px]:items-start max-[900px]:flex-col">
        <nav class="flex min-w-0 flex-wrap items-center gap-1.5">
          <RouterLink
            v-for="tab in merchantTabs"
            :key="tab.key"
            :to="tab.path"
            class="yy-action inline-flex h-8 items-center gap-2 rounded-md border px-3 text-[11px] font-medium transition-colors"
            :class="isActive(tab.path)
              ? 'border-[#1A1814] bg-[#1A1814] text-[#F4EFE6] shadow-[0_8px_18px_rgba(26,24,20,0.1)]'
              : 'border-transparent text-amber-text-muted hover:border-amber-topbar-border hover:bg-black/[0.03]'"
          >
            <img :src="tab.icon" alt="" class="h-3.5 w-3.5 shrink-0 opacity-75" :class="isActive(tab.path) ? 'invert brightness-[1.8]' : ''" />
            <span class="whitespace-nowrap">{{ tab.label }}</span>
          </RouterLink>
        </nav>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 text-[11px] text-amber-text-muted">
          <div class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-[#2D7A4D]"></span>
            <span>读取真实门店 / 订单 / 排期</span>
          </div>
          <slot name="status" />
        </div>
      </div>

      <div class="grid grid-cols-[124px_repeat(4,minmax(0,1fr))] border-b border-amber-topbar-border/60 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div class="flex flex-col justify-center border-r border-amber-topbar-border/60 px-4 py-3 max-[980px]:col-span-2 max-[980px]:border-r-0 max-[980px]:border-b max-[640px]:col-span-1">
          <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-text-muted">快捷入口</div>
          <div class="mt-1 text-[13px] font-semibold leading-none text-amber-dark">履约入口</div>
        </div>

        <RouterLink
          v-for="card in merchantQuickAccessCards"
          :key="card.key"
          :to="card.path"
          class="yy-action flex min-h-[58px] items-center gap-3 border-r border-amber-topbar-border/60 px-4 py-3 text-left last:border-r-0 hover:bg-white/70 max-[980px]:border-b max-[980px]:even:border-r-0 max-[640px]:border-r-0"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
            :class="card.accent ? 'border-[#B8543B] bg-[#B8543B]' : 'border-[rgba(26,24,20,0.12)] bg-[#F4EFE6]'"
          >
            <img :src="card.icon" alt="" class="h-3.5 w-3.5" :class="card.accent ? 'invert brightness-[1.8]' : ''" />
          </div>
          <div class="min-w-0">
            <div class="truncate text-[12px] font-semibold text-amber-dark">{{ card.label }}</div>
            <div class="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ card.hint }}</div>
          </div>
        </RouterLink>
      </div>
    </section>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { merchantQuickAccessCards, merchantTabs } from '../merchantChrome'

const route = useRoute()
const normalizedPath = computed(() => route.path.replace(/\/$/, ''))

const isActive = (path: string) => {
  const current = normalizedPath.value
  return current === path || (current === '/merchant' && path === '/merchant/overview')
}
</script>
