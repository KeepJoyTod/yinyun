<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="card in cards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
      <div class="text-[12px] text-amber-text-muted">{{ card.label }}</div>
      <div class="mt-2 text-[28px] font-semibold text-amber-dark">{{ card.value }}</div>
      <div class="mt-1 text-[11px] text-amber-text-muted">{{ card.hint }}</div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceUsageSummaryDto } from '../../../shared/api/backend'
import { formatBytesToGb } from '../resourceUsageOperations'

const props = defineProps<{
  summary: ResourceUsageSummaryDto
}>()

const cards = computed(() => [
  { label: '总额度', value: formatBytesToGb(props.summary.totalQuotaBytes), hint: `配置来源 ${props.summary.quotaConfigKey}` },
  { label: '已使用', value: formatBytesToGb(props.summary.usedBytes), hint: '按 yy_photo_asset.file_size_bytes 汇总' },
  { label: '剩余容量', value: formatBytesToGb(props.summary.remainingBytes), hint: `使用率 ${props.summary.usagePercent.toFixed(2)}%` },
  { label: '清理计划', value: props.summary.cleanupPlanEnabled ? '已启用' : '未启用', hint: `保留 ${props.summary.cleanupRetentionDays} 天` },
])
</script>
