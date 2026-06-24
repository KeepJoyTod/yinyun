<template>
  <div class="flex flex-col gap-5">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="text-[11px] uppercase tracking-[0.18em] text-amber-text-muted">Resource Usage</div>
      <h2 class="mt-1 text-[22px] font-semibold text-amber-dark">资源用量</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-amber-text-muted">总额度和清理计划读取后端配置，已使用容量按 `yy_photo_asset.file_size_bytes` 聚合，不伪造清理结果。</p>
    </section>

    <StateView :loading="loading" :error="error" :empty="Boolean(emptyState.title && !summary)" :empty-title="emptyState.title" :empty-hint="emptyState.hint" :on-retry="refresh">
      <template v-if="summary">
        <ResourceUsageSummaryCards :summary="summary" />
        <p v-if="backfillHint" class="rounded border border-[#B8543B]/20 bg-[#F8E7E2] px-4 py-3 text-[12px] text-[#8C3E2C]">{{ backfillHint }}</p>
        <ResourceUsageBreakdown :summary="summary" />
      </template>
    </StateView>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StateView from '../../shared/components/feedback/StateView.vue'
import ResourceUsageBreakdown from './components/ResourceUsageBreakdown.vue'
import ResourceUsageSummaryCards from './components/ResourceUsageSummaryCards.vue'
import { useResourceUsage } from './composables/useResourceUsage'
import { buildUsageEmptyState, buildUsageSizeBackfillHint } from './resourceUsageOperations'

const { loading, error, summary, refresh } = useResourceUsage()

const backfillHint = computed(() => summary.value ? buildUsageSizeBackfillHint(summary.value) : '')
const emptyState = computed(() => buildUsageEmptyState(summary.value))
</script>
