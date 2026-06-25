<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
    <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4">
      <div>
        <h3 class="text-[14px] font-semibold text-amber-dark">活动列表</h3>
        <p class="mt-1 text-[10.5px] text-amber-text-muted">真实读取 yy_campaign 与 yy_campaign_product。</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('refresh')">刷新</button>
        <button class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] text-[#F4EFE6] hover:bg-black" type="button" @click="$emit('create')">新建活动</button>
      </div>
    </div>

    <div v-if="loading" class="px-5 py-8 text-[11px] text-amber-text-muted">正在加载活动...</div>
    <div v-else-if="!campaigns.length" class="px-5 py-8 text-[11px] text-amber-text-muted">暂无活动。</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[940px] border-collapse">
        <thead>
          <tr class="border-b border-amber-topbar-border bg-[#FBF8F2] text-left">
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">活动</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">范围</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">时间</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">参与/订单</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-topbar-border/60">
          <tr
            v-for="campaign in campaigns"
            :key="campaign.campaignId"
            class="cursor-pointer hover:bg-black/[0.015]"
            :class="selectedId === campaign.campaignId ? 'bg-[#FBF8F2]' : ''"
            @click="$emit('select', campaign.campaignId)"
          >
            <td class="px-5 py-4">
              <div class="text-[11px] font-semibold text-amber-dark">{{ campaign.campaignName }}</div>
              <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ campaign.campaignType }}</div>
            </td>
            <td class="px-5 py-4">
              <div class="text-[10.5px] text-amber-dark">{{ campaign.storeScopeLabel }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ campaign.productScopeLabel }}</div>
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ campaign.timeRangeLabel }}</td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              {{ campaign.participantCount }} / {{ campaign.orderCount }} / {{ formatMarketingMoney(campaign.paidAmountCent) }}
            </td>
            <td class="px-5 py-4">
              <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-dark">{{ campaign.status }}</span>
            </td>
            <td class="px-5 py-4">
              <CampaignStatusActionBar
                :campaign="campaign"
                @edit="$emit('edit', campaign.campaignId)"
                @online="$emit('online', campaign.campaignId)"
                @offline="$emit('offline', campaign.campaignId)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MarketingCampaignDto } from '../../../shared/api/backend'
import { formatMarketingMoney } from '../marketingScaffoldData'
import CampaignStatusActionBar from './CampaignStatusActionBar.vue'

defineProps<{
  campaigns: MarketingCampaignDto[]
  selectedId: string
  loading?: boolean
}>()

defineEmits<{
  create: []
  edit: [campaignId: string]
  refresh: []
  select: [campaignId: string]
  online: [campaignId: string]
  offline: [campaignId: string]
}>()
</script>
