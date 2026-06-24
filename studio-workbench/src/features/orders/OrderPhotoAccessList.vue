<template>
  <div class="mt-4 rounded-md border border-amber-topbar-border/70 bg-white/60 p-3">
    <div class="mb-2 flex items-center justify-between gap-2">
      <div>
        <div class="text-[11px] font-sans font-medium text-amber-dark">最近访问</div>
        <p class="mt-0.5 text-[10.5px] leading-relaxed text-amber-text-muted">客户浏览、下载、失败访问会从 yy_photo_access_log 同步显示。</p>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <span class="border border-amber-topbar-border bg-amber-content-bg px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.12em] text-amber-text-muted">
          last 5
        </span>
        <button
          class="yy-action rounded border border-amber-topbar-border bg-white px-2 py-0.5 text-[10px] font-sans text-amber-text-muted hover:text-amber-dark"
          type="button"
          title="查看完整访问记录和客片明细"
          @click="emit('viewMore')"
        >
          查看更多
        </button>
      </div>
    </div>
    <div v-if="loading" class="rounded-md border border-amber-topbar-border bg-amber-content-bg/70 px-3 py-2 text-[10.5px] text-amber-text-muted">
      正在加载最近访问记录...
    </div>
    <div v-else-if="error" class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[10.5px] text-[var(--color-status-danger)]">
      访问日志加载失败：{{ error }}
    </div>
    <div v-else-if="rows.length" class="space-y-1.5">
      <div
        v-for="row in rows"
        :key="`${row.happenedAt}-${row.action}-${row.platform}`"
        class="grid grid-cols-[0.9fr_0.8fr_1.1fr_0.7fr] gap-2 border border-amber-topbar-border/70 bg-amber-content-bg px-2.5 py-2 text-[10.5px] text-amber-text-muted max-[760px]:grid-cols-2"
      >
        <span class="font-mono font-medium text-amber-dark">{{ row.action }}</span>
        <span>{{ row.platform }}</span>
        <span>{{ row.happenedAt }}</span>
        <span :class="row.success === '失败' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-done)]'">
          {{ row.success }}
        </span>
      </div>
    </div>
    <div v-else class="rounded-md border border-dashed border-amber-topbar-border bg-amber-content-bg/70 px-3 py-2 text-[10.5px] leading-relaxed text-amber-text-muted">
      暂无客户访问记录；客户打开选片链接或下载资料后会出现在这里。
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PhotoAccessLogRow } from '../albums/photoMgmtOperations'

defineProps<{
  rows: PhotoAccessLogRow[]
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  viewMore: []
}>()
</script>
