<template>
  <div class="flex flex-col gap-5">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="text-[11px] uppercase tracking-[0.18em] text-amber-text-muted">Resource Usage</div>
      <h2 class="mt-1 text-[22px] font-semibold text-amber-dark">资源用量</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-amber-text-muted">总额度和清理计划读取后端配置，已使用容量按 `yy_photo_asset.file_size_bytes` 聚合，不伪造清理结果。</p>
    </section>

    <FeatureGateStatusCard :gate="gate" />
    <p v-if="gateError" class="text-[12px] text-[#8C3E2C]">{{ gateError }}</p>

    <StateView v-if="canLoadData" :loading="loading" :error="error" :empty="Boolean(emptyState.title && !summary)" :empty-title="emptyState.title" :empty-hint="emptyState.hint" :on-retry="refresh">
      <template v-if="summary">
        <ResourceUsageSummaryCards :summary="summary" />
        <section v-if="backfillHint" class="rounded border border-[#B8543B]/20 bg-[#F8E7E2] px-4 py-3 text-[12px] text-[#8C3E2C]">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{{ backfillHint }}</p>
            <button
              class="border border-[#8C3E2C]/30 bg-white px-3 py-2 text-[12px] font-semibold text-[#8C3E2C] transition hover:border-[#8C3E2C] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="backfilling || loading"
              @click="runSizeBackfill()"
            >
              {{ backfillButtonText }}
            </button>
          </div>
          <p v-if="backfillResultText" class="mt-2 text-[#6F3527]">{{ backfillResultText }}</p>
          <p v-if="backfillErrorText" class="mt-2 font-semibold text-[#B8543B]">{{ backfillErrorText }}</p>
        </section>
        <ResourceUsageBreakdown :summary="summary" />
      </template>
    </StateView>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StateView from '../../shared/components/feedback/StateView.vue'
import FeatureGateStatusCard from '../system/FeatureGateStatusCard.vue'
import ResourceUsageBreakdown from './components/ResourceUsageBreakdown.vue'
import ResourceUsageSummaryCards from './components/ResourceUsageSummaryCards.vue'
import { useResourceUsage } from './composables/useResourceUsage'
import {
  buildSizeBackfillButtonText,
  buildSizeBackfillErrorText,
  buildSizeBackfillResultText,
  buildUsageEmptyState,
  buildUsageSizeBackfillHint,
} from './resourceUsageOperations'

const {
  loading,
  error,
  gate,
  gateError,
  canLoadData,
  summary,
  backfilling,
  backfillError,
  backfillResult,
  refresh,
  runSizeBackfill,
} = useResourceUsage()

const backfillHint = computed(() => summary.value ? buildUsageSizeBackfillHint(summary.value) : '')
const backfillButtonText = computed(() => buildSizeBackfillButtonText(backfilling.value, summary.value))
const backfillResultText = computed(() => buildSizeBackfillResultText(backfillResult.value))
const backfillErrorText = computed(() => buildSizeBackfillErrorText(backfillError.value))
const emptyState = computed(() => buildUsageEmptyState(summary.value))
</script>
