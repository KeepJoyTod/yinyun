<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="font-sans text-[14px] font-medium text-amber-dark">来源上下文</div>
      <span
        class="border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em]"
        :class="toneStyles[context.tone]"
      >
        {{ context.badge }}
      </span>
    </div>
    <div class="text-[12px] font-sans font-semibold text-amber-dark">{{ context.title }}</div>
    <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
      {{ context.description }}
    </p>
    <div v-if="context.details.length" class="mt-3 flex flex-wrap gap-1.5">
      <span
        v-for="detail in context.details"
        :key="detail"
        class="rounded border border-amber-topbar-border/70 bg-white/70 px-2 py-1 text-[10px] font-mono text-amber-text-muted"
      >
        {{ detail }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrderSourceContext } from './orderOperations'

defineProps<{
  context: OrderSourceContext
  toneStyles: Record<OrderSourceContext['tone'], string>
}>()
</script>
