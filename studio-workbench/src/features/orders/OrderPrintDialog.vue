<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="$emit('close')"
    >
      <div class="w-[420px] max-w-[calc(100vw-32px)] rounded-xl border border-hairline bg-surface-1 shadow-2xl">
        <div class="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 class="text-[15px] font-sans font-semibold text-ink">打印预览</h3>
          <button class="yy-action rounded p-1 hover:bg-canvas transition-colors" type="button" @click="$emit('close')">
            <span class="text-[14px] text-ink-muted">×</span>
          </button>
        </div>

        <div class="space-y-3 px-5 py-4">
          <p class="text-[12px] text-ink-muted">
            当前主线还没有接入真实打印数据接口，先保留订单级打印入口。
          </p>
          <div class="rounded-md border border-hairline bg-canvas px-4 py-3">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-ink-muted">订单 ID</span>
              <span class="font-mono text-ink">{{ orderId || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button
            class="yy-action rounded-md border border-hairline px-4 py-2 text-[11px] font-sans text-ink-muted hover:bg-canvas transition-colors"
            type="button"
            @click="$emit('close')"
          >
            关闭
          </button>
          <button
            class="yy-action rounded-md bg-accent px-4 py-2 text-[11px] font-sans font-medium text-white hover:bg-accent-hover transition-colors"
            type="button"
            @click="handlePrint"
          >
            打印
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { BackendId } from '../../shared/api/backendId'

defineProps<{
  open: boolean
  orderId: BackendId | null
}>()

defineEmits<{ close: [] }>()

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
