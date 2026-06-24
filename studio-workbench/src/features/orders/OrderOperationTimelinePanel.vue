<template>
  <div class="mb-3 flex justify-end">
    <button
      class="yy-action rounded border border-amber-topbar-border bg-white px-2 py-0.5 text-[10px] font-sans text-amber-text-muted hover:text-amber-dark disabled:opacity-60"
      type="button"
      aria-label="刷新完整操作记录"
      :disabled="loading"
      @click="emit('refresh')"
    >
      {{ loading ? '刷新中...' : '刷新日志' }}
    </button>
  </div>
  <p
    v-if="stateText"
    class="mb-3 border border-amber-topbar-border/70 bg-white/70 px-3 py-2 text-[10.5px] font-sans leading-relaxed text-amber-text-muted"
  >
    {{ stateText }}
  </p>
  <ol class="space-y-2.5 text-[11px]">
    <li
      v-for="item in items"
      :key="item.key"
      class="rounded-md border bg-white/65 px-3 py-2"
      :class="toneStyles[item.tone]"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="font-sans font-medium text-amber-dark">{{ item.label }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <span
            v-if="item.key.startsWith('operation-')"
            class="rounded border px-1.5 py-0.5 font-sans text-[10px] font-medium"
            :class="item.tone === 'done'
              ? 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done-text)]'
              : 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'"
          >
            {{ item.statusLabel || (item.tone === 'done' ? '成功' : '失败') }}
          </span>
          <span class="font-mono text-[10px]">{{ item.value }}</span>
        </span>
      </div>
      <div
        v-if="item.key.startsWith('operation-') && splitAuditParts(item.hint).length"
        class="mt-2 flex flex-wrap gap-1.5"
      >
        <span
          v-for="part in splitAuditParts(item.hint)"
          :key="`${item.key}-${part}`"
          class="rounded border border-amber-topbar-border/70 bg-white/70 px-2 py-0.5 text-[10px] leading-relaxed text-amber-text-muted"
        >
          {{ part }}
        </span>
      </div>
      <p
        v-if="item.hint && !item.key.startsWith('operation-')"
        class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted"
      >
        {{ item.hint }}
      </p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { OrderDetailTimelineItem } from './orderOperations'

defineProps<{
  items: OrderDetailTimelineItem[]
  loading: boolean
  stateText: string
  toneStyles: Record<OrderDetailTimelineItem['tone'], string>
}>()

const emit = defineEmits<{
  refresh: []
}>()

const splitAuditParts = (hint?: string) =>
  String(hint || '')
    .split(' · ')
    .map(part => part.trim())
    .filter(Boolean)
</script>
