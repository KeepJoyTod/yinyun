<template>
  <div class="flex flex-wrap items-center gap-2">
    <button class="yy-action border border-amber-topbar-border px-2.5 py-1 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('edit')">编辑</button>
    <button
      v-if="campaign.status !== 'ONLINE'"
      class="yy-action border border-[var(--color-status-done)] bg-[var(--color-status-done-bg)] px-2.5 py-1 text-[10px] text-[var(--color-status-done)]"
      type="button"
      @click="$emit('online')"
    >
      上线
    </button>
    <button
      v-else
      class="yy-action border border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] px-2.5 py-1 text-[10px] text-[var(--color-status-danger)]"
      type="button"
      @click="$emit('offline')"
    >
      下线
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MarketingCampaignDto } from '../../../shared/api/backend'

defineProps<{
  campaign: MarketingCampaignDto
}>()

defineEmits<{
  edit: []
  online: []
  offline: []
}>()
</script>
