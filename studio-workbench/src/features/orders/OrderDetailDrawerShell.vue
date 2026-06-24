<template>
  <div
    class="fixed inset-0 z-40 flex justify-end bg-[#1A1814]/35"
    @click.self="emit('close')"
  >
    <aside class="order-detail-drawer h-full w-full max-w-[420px] overflow-y-auto border-l border-amber-topbar-border bg-amber-content-bg shadow-2xl">
      <div class="sticky top-0 z-10 border-b border-amber-topbar-border bg-amber-content-bg px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-text-muted">订单详情</span>
            <h3 class="mt-1 truncate font-sans text-[18px] font-medium text-amber-dark">{{ order.id }}</h3>
            <p class="mt-1 text-[11px] text-amber-text-muted">{{ order.service }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              v-if="showBackToSlot"
              class="yy-action px-2 py-1 text-[12px] text-amber-text-muted hover:bg-black/5"
              type="button"
              @click="emit('back-to-slot')"
            >
              回到该时段
            </button>
            <button
              class="yy-action px-2 py-1 text-[12px] text-amber-text-muted hover:bg-black/5"
              type="button"
              @click="emit('close')"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <slot />

      <div v-if="nextActionLabel" class="px-6 pb-5">
        <button
          class="yy-action w-full border border-amber-dark bg-amber-dark px-4 py-3 text-[12px] font-medium text-[#F4EFE6] hover:bg-black disabled:border-amber-topbar-border disabled:bg-amber-bg disabled:text-amber-text-muted"
          type="button"
          :disabled="advancing"
          @click="emit('advance')"
        >
          {{ advancing ? '处理中...' : nextActionLabel }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { BookingOrder } from '../../shared/stores/appStore'

defineProps<{
  order: BookingOrder
  showBackToSlot: boolean
  nextActionLabel?: string
  advancing: boolean
}>()

const emit = defineEmits<{
  close: []
  'back-to-slot': []
  advance: []
}>()
</script>
