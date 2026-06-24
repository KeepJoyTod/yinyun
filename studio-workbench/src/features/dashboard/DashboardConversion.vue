<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">履约转化</h2>
        <p class="mt-1.5 text-[13px] font-medium text-ink-muted">{{ dateLabel }} · 预约→支付→到店→完成</p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 yy-stagger">
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">支付转化率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ paidRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ paidCount }} / {{ bookedCount }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div class="h-full rounded-full bg-accent transition-all duration-500" :style="{ width: paidRate }"></div>
        </div>
      </article>
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">到店转化率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ arrivedRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ arrivedCount }} / {{ paidCount }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div class="h-full rounded-full bg-[var(--color-status-confirmed)] transition-all duration-500" :style="{ width: arrivedRate }"></div>
        </div>
      </article>
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">完成转化率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ completedRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ completedCount }} / {{ arrivedCount }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div class="h-full rounded-full bg-[var(--color-status-done)] transition-all duration-500" :style="{ width: completedRate }"></div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  dateLabel: string
  bookedCount: number
  paidCount: number
  arrivedCount: number
  completedCount: number
  paidRate: string
  arrivedRate: string
  completedRate: string
}>()
</script>
