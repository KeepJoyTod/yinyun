<template>
  <header class="workbench-header sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b border-amber-topbar-border/60 bg-amber-topbar-bg/56 px-7 shadow-[0_12px_42px_rgba(26,24,20,0.06)] backdrop-blur-[28px] max-[900px]:gap-3 max-[900px]:px-3">
    <!-- Left: Breadcrumbs & Title -->
    <div class="flex min-w-0 items-center gap-3">
      <button
        class="yy-action hidden h-10 w-10 shrink-0 items-center justify-center border border-amber-topbar-border bg-amber-content-bg text-amber-dark max-[900px]:flex"
        type="button"
        aria-label="打开导航菜单"
        @click="emit('toggle-menu')"
      >
        <Menu :size="18" :stroke-width="1.8" />
      </button>
      <div class="yy-glass-panel flex min-w-0 items-center gap-4 rounded-2xl px-4 py-3 max-[900px]:w-auto max-[560px]:rounded-xl max-[560px]:px-3">
        <div class="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#332A1F_0%,#1A1814_58%,#5E451D_100%)] text-[15px] font-black text-[#F4EFE6] shadow-[0_12px_28px_rgba(26,24,20,0.16)]">
          {{ titleInitial }}
          <span class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-amber-content-bg bg-amber-accent shadow-[0_0_12px_rgba(184,132,46,0.45)]"></span>
        </div>
        <div class="relative z-[1] flex min-w-0 flex-col">
          <nav class="flex items-center gap-1.5 max-[560px]:hidden">
            <span class="inline-flex items-center rounded-full bg-amber-accent/[0.11] px-2.5 py-0.5 text-[10.5px] font-mono font-semibold uppercase tracking-[0.16em] text-amber-accent">{{ sectionLabel }}</span>
            <span class="text-[11px] text-amber-text-muted/45">/</span>
            <span class="inline-flex items-center rounded-full bg-amber-dark/[0.065] px-2.5 py-0.5 text-[10.5px] font-mono font-semibold uppercase tracking-[0.16em] text-amber-dark/72">{{ $route.meta.title }}</span>
          </nav>
          <div class="mt-1 flex items-center gap-3">
            <h2 class="truncate font-sans text-[24px] font-black leading-none tracking-[-0.015em] text-amber-dark max-[560px]:text-[19px]">{{ $route.meta.title }}</h2>
            <span class="hidden rounded-full border border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-status-done)] sm:inline-flex">运营中</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex flex-1 items-center justify-end gap-7 max-[900px]:flex-none max-[900px]:gap-2">
      <!-- Search Bar -->
      <div class="group relative h-[38px] w-full max-w-[360px] max-[900px]:hidden">
        <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <img src="../../../assets/icons/search.svg" class="w-4 h-4 opacity-45 group-focus-within:opacity-75 transition-opacity" />
        </div>
        <input
          type="text"
          placeholder="搜索客户姓名 / 订单号 / 手机号 / 底片"
          class="w-full h-full pl-10 pr-10 py-2 bg-amber-search-bg border border-amber-topbar-border rounded-md text-[13px] font-sans text-amber-dark placeholder-amber-text-muted/70 focus:outline-none focus:ring-4 focus:ring-amber-accent/10 focus:border-amber-accent/30 transition-all"
        />
        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <kbd class="w-7 h-[22px] flex items-center justify-center text-[10.5px] font-mono font-medium text-amber-text-muted bg-white/85 border border-amber-topbar-border rounded-md shadow-sm">⌘K</kbd>
        </div>
      </div>

      <!-- Notification & Order Actions -->
      <div class="flex items-center gap-2">
        <button class="yy-action relative p-2 text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-md transition-all group" type="button" aria-label="查看通知">
          <img src="../../../assets/icons/notification.svg" class="w-4 h-4 opacity-65 group-hover:opacity-100" />
          <span class="absolute top-2 right-[18px] w-[5.5px] h-[5.5px] bg-amber-accent rounded-full"></span>
        </button>

        <button
          class="yy-action flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-sm transition-all hover:bg-black max-[560px]:px-3"
          @click="emit('open-orders')"
          type="button"
          :aria-label="todayPendingOrderCount > 0 ? `处理订单，今日 ${todayPendingOrderCount} 条待确认` : '查看预约订单'"
        >
          <img src="../../../assets/icons/orders.svg" class="w-3.5 h-3.5 invert brightness-200" />
          <span class="max-[560px]:hidden whitespace-nowrap">处理订单</span>
          <span
            v-if="todayPendingOrderCount > 0"
            class="ml-1 border border-amber-accent/40 bg-amber-accent/20 px-1.5 py-[2px] font-mono text-[10px] font-semibold leading-none text-amber-accent-soft max-[720px]:hidden"
          >
            今日待确认 {{ todayPendingOrderCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { appStore } from '../../stores/appStore'

const emit = defineEmits<{
  (e: 'open-orders'): void
  (e: 'toggle-menu'): void
}>()

const route = useRoute()
const pad2 = (n: number) => String(n).padStart(2, '0')
const today = new Date()
const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

const sectionLabel = computed(() => {
  const section = route.meta.section
  return typeof section === 'string' && section.length > 0 ? section : '影约云'
})
const titleInitial = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' && title.length > 0 ? title.slice(0, 1) : '影'
})

const todayPendingOrderCount = computed(() =>
  appStore.orders.filter(order => order.arrivalDate === todayKey && order.status === '待确认').length,
)
</script>
