<template>
  <section class="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
    <div class="border border-amber-topbar-border bg-amber-content-bg p-4">
      <div class="text-[14px] font-semibold text-amber-dark">按资源类型占用</div>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[420px] text-left text-[12px]">
          <thead class="text-amber-text-muted">
            <tr>
              <th class="py-2">资源类型</th>
              <th class="py-2">资源数量</th>
              <th class="py-2">占用大小</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="row in summary.typeBreakdown" :key="row.assetType">
              <td class="py-2">{{ row.assetType || '未分类' }}</td>
              <td class="py-2">{{ row.assetCount }}</td>
              <td class="py-2">{{ formatBytesToGb(row.totalBytes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="border border-amber-topbar-border bg-amber-content-bg p-4 text-[12px]">
      <div class="text-[14px] font-semibold text-amber-dark">统计说明</div>
      <div class="mt-3 space-y-2 text-amber-text-muted">
        <p>默认额度读取后端配置，不依赖套餐中心联动。</p>
        <p>清理计划只展示配置状态，本次不执行真实 OSS 物理清理。</p>
        <p>配置键：{{ summary.cleanupPlanConfigKey }} / {{ summary.cleanupRetentionConfigKey }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ResourceUsageSummaryDto } from '../../../shared/api/backend'
import { formatBytesToGb } from '../resourceUsageOperations'

defineProps<{
  summary: ResourceUsageSummaryDto
}>()
</script>
