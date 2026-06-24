<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">转化率分析</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · 预约→到店→支付全链路</p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 yy-stagger">
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">预约提交率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ submitRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ submitCount }} / {{ visitCount }}</span>
        </div>
        <div class="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div class="h-full rounded-full bg-accent transition-all duration-500" :style="{ width: submitRate }"></div>
        </div>
      </article>
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">支付完成率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ paidRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ paidCount }} / {{ submitCount }}</span>
        </div>
        <div class="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div class="h-full rounded-full bg-[var(--color-status-done)] transition-all duration-500" :style="{ width: paidRate }"></div>
        </div>
      </article>
      <article class="yy-double-bezel p-5">
        <div class="text-[12px] font-mono uppercase tracking-[0.16em] text-ink-muted">到店核销率</div>
        <div class="mt-2 flex items-end justify-between">
          <strong class="text-[32px] font-sans font-bold tabular-nums leading-none text-ink">{{ arrivedRate }}</strong>
          <span class="text-[12px] font-sans text-ink-muted">{{ arrivedCount }} / {{ paidCount }}</span>
        </div>
        <div class="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div class="h-full rounded-full bg-[var(--color-status-confirmed)] transition-all duration-500" :style="{ width: arrivedRate }"></div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  dateLabel: string
  visitCount: number
  submitCount: number
  paidCount: number
  arrivedCount: number
  submitRate: string
  paidRate: string
  arrivedRate: string
}>()
</script>