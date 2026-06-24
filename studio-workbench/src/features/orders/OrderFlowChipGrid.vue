<template>
  <section class="order-flow-chip-grid-section border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 font-sans text-[14px] font-medium text-amber-dark">操作流转</div>
    <div class="order-flow-chip-grid grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2 text-[10.5px]">
      <div
        v-for="step in steps"
        :key="step.label"
        class="rounded-md border px-2.5 py-2"
        :class="step.state === 'done'
          ? 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)]'
          : step.state === 'current'
            ? 'border-amber-accent/35 bg-amber-accent/10'
            : 'border-amber-topbar-border/70 bg-white/65'"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="truncate font-sans"
            :class="step.state === 'todo' ? 'text-amber-text-muted' : 'font-medium text-amber-dark'"
          >{{ step.label }}</span>
          <span
            class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider"
            :class="step.state === 'done'
              ? 'bg-white/70 text-[#2D7A4D]'
              : step.state === 'current'
                ? 'bg-white/80 text-amber-accent'
                : 'bg-amber-content-bg text-amber-text-muted'"
          >
            {{ step.state === 'done' ? '已完成' : step.state === 'current' ? '当前' : '待办' }}
          </span>
        </div>
        <p v-if="step.hint && step.state === 'current'" class="mt-1.5 text-[10px] font-sans leading-relaxed text-amber-text-muted">
          下一步：{{ step.hint }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrderFlowStep } from './orderOperations'

defineProps<{
  steps: OrderFlowStep[]
}>()
</script>
