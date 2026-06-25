<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
    <ParticipationFilters :filters="filters" @apply="$emit('refresh')" @reset="$emit('resetFilters')" />

    <div v-if="loading" class="px-5 py-8 text-[11px] text-amber-text-muted">正在加载参与记录...</div>
    <div v-else-if="!participations.length" class="px-5 py-8 text-[11px] text-amber-text-muted">暂无参与记录。消费者侧参与链路接入后会写入这里。</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[980px] border-collapse">
        <thead>
          <tr class="border-b border-amber-topbar-border bg-[#FBF8F2] text-left">
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">活动</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">客户</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">订单</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">金额</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">时间/原因</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-topbar-border/60">
          <tr
            v-for="item in participations"
            :key="item.participationId"
            class="cursor-pointer hover:bg-black/[0.015]"
            :class="selectedId === item.participationId ? 'bg-[#FBF8F2]' : ''"
            @click="$emit('select', item.participationId)"
          >
            <td class="px-5 py-4">
              <div class="text-[11px] font-semibold text-amber-dark">{{ item.campaignName || item.campaignId }}</div>
              <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ item.campaignId }}</div>
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.customerName || item.customerId || '未命名客户' }}</td>
            <td class="px-5 py-4 font-mono text-[10.5px] text-amber-text-muted">{{ item.orderId || '-' }}</td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              <div>{{ item.participationStatus }}</div>
              <div class="mt-1">{{ item.conversionStatus }} / {{ item.refundStatus }}</div>
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              {{ formatMarketingMoney(item.payableAmountCent) }} / {{ formatMarketingMoney(item.finalAmountCent) }}
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              <div>{{ item.participatedAt || '-' }}</div>
              <div class="mt-1">{{ item.invalidReason || '-' }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MarketingParticipationListQuery, MarketingParticipationRowDto } from '../../../shared/api/backend'
import { formatMarketingMoney } from '../marketingScaffoldData'
import ParticipationFilters from './ParticipationFilters.vue'

defineProps<{
  participations: MarketingParticipationRowDto[]
  filters: MarketingParticipationListQuery
  selectedId: string
  loading?: boolean
}>()

defineEmits<{
  refresh: []
  resetFilters: []
  select: [participationId: string]
}>()
</script>
