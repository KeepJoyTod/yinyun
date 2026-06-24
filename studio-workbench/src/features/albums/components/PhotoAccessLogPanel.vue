<template>
  <section v-if="active" class="photo-access-log-panel border-t border-amber-topbar-border bg-white/60 px-7 py-5">
    <div class="flex items-start justify-between gap-4 max-[720px]:flex-col">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">Access Log</span>
        <h3 class="mt-1 text-[15px] font-sans font-semibold text-amber-dark">客户访问</h3>
        <p class="mt-1 max-w-[640px] text-[11px] font-sans leading-relaxed text-amber-text-muted">
          {{ error || emptyHint }}
        </p>
      </div>
      <span class="rounded-md border border-amber-topbar-border bg-amber-content-bg px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
        yy_photo_access_log
      </span>
    </div>
    <div v-if="loading" class="mt-4 rounded-md border border-amber-topbar-border bg-amber-content-bg/70 px-4 py-4 text-[11px] font-sans leading-relaxed text-amber-text-muted">
      正在加载客户访问记录...
    </div>
    <div v-else-if="error" class="mt-4 rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-4 text-[11px] font-sans leading-relaxed text-[var(--color-status-danger)]">
      访问日志加载失败：{{ error }}
    </div>
    <div v-else-if="rows.length > 0" class="mt-4 grid gap-2">
      <div
        v-for="row in rows"
        :key="`${row.happenedAt}-${row.action}-${row.platform}`"
        class="grid grid-cols-[1fr_0.8fr_0.9fr_0.8fr] gap-3 border border-amber-topbar-border bg-amber-content-bg px-3 py-2 text-[10.5px] text-amber-text-muted max-[760px]:grid-cols-2"
      >
        <span class="font-mono text-amber-dark">{{ row.action }}</span>
        <span>{{ row.platform }}</span>
        <span>{{ row.happenedAt }}</span>
        <span>{{ row.ip }} · {{ row.success }}</span>
      </div>
    </div>
    <div v-else class="mt-4 rounded-md border border-dashed border-amber-topbar-border bg-amber-content-bg/70 px-4 py-4 text-[11px] font-sans leading-relaxed text-amber-text-muted">
      {{ emptyHint }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PhotoAccessLogRow } from '../photoMgmtOperations'

defineProps<{
  active: boolean
  loading: boolean
  error: string
  rows: PhotoAccessLogRow[]
  emptyHint: string
}>()
</script>
