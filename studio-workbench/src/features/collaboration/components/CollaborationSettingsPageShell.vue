<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-start justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">{{ eyebrow }}</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">{{ title }}</h2>
          <p class="mt-2 max-w-[860px] text-[10.5px] leading-relaxed text-amber-text-muted">{{ description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </section>

    <section v-if="error" class="border border-[#B8543B]/30 bg-[#FFF4F1] px-5 py-4 text-[11px] text-[#8C3E2C]">
      {{ error }}
    </section>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  error?: string
}>()
</script>
