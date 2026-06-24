<template>
  <div class="rounded-2xl border border-amber-topbar-border bg-[#FBF7F0] p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">闭环检查</div>
        <div class="mt-2 text-[13px] font-semibold text-amber-dark">{{ readiness.summary }}</div>
      </div>
      <button
        class="yy-action border border-amber-topbar-border px-3 py-2 text-[10.5px] font-medium text-amber-dark hover:bg-black/5"
        type="button"
        @click="$emit('configure')"
      >
        履约配置
      </button>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-3">
      <article
        v-for="item in readiness.items"
        :key="item.key"
        class="rounded-xl border px-3 py-3"
        :class="item.tone === 'ready' ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-white/70'"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-semibold text-amber-dark">{{ item.label }}</span>
          <span
            class="rounded-full px-2 py-1 text-[9px] font-semibold"
            :class="item.tone === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ item.tone === 'ready' ? '已就绪' : '待补齐' }}
          </span>
        </div>
        <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ item.detail }}</p>
      </article>
    </div>

    <div v-if="readiness.workflowLabels.length" class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="label in readiness.workflowLabels"
        :key="label"
        class="rounded-full border border-amber-topbar-border bg-white/80 px-2 py-1 text-[9px] text-amber-text-muted"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AlbumProductReadiness } from '../albumProductReadiness'

defineProps<{
  readiness: AlbumProductReadiness
}>()

defineEmits<{
  configure: []
}>()
</script>
