<template>
  <div class="mb-3 flex justify-end">
    <button
      v-if="logs.length"
      class="yy-action border border-amber-topbar-border bg-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-amber-text-muted hover:text-amber-dark"
      type="button"
      @click="emit('copy')"
    >
      {{ copied ? '已复制排障' : '复制排障' }}
    </button>
  </div>
  <div v-if="logs.length" class="space-y-2">
    <div
      v-for="log in logs"
      :key="log.backendId"
      class="rounded-md border border-amber-topbar-border/70 bg-white/60 p-3 text-[10.5px]"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <span class="font-mono font-medium text-amber-dark truncate">{{ log.apiName }}</span>
          <span class="ml-2 text-amber-text-muted">{{ log.channelType }}</span>
        </div>
        <span
          class="shrink-0 px-1.5 py-0.5 text-[10px] rounded-sm"
          :class="log.status === 'SUCCESS'
            ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
            : 'bg-[#F8E7E2] text-[#B8543B]'"
        >{{ log.status === 'SUCCESS' ? '成功' : '失败' }}</span>
      </div>
      <div class="mt-1.5 font-mono text-[10px] text-amber-text-muted">
        requestId/logid：{{ log.requestId || '暂无' }}
      </div>
      <div v-if="log.errorMessage" class="mt-1.5 text-[10px] text-[#8C3E2C]">
        失败原因：{{ log.errorMessage }}
      </div>
      <div v-if="log.remark" class="mt-1 text-[10px] text-amber-text-muted">
        备注：{{ log.remark }}
      </div>
      <div class="mt-1.5 flex items-center gap-3 text-[10px] text-amber-text-muted">
        <span>耗时：{{ log.durationMs }} ms</span>
        <span v-if="log.retryable" class="text-amber-accent">可重试</span>
      </div>
    </div>
  </div>
  <p v-else class="text-[11px] text-amber-text-muted leading-relaxed">
    本地订单暂无渠道同步记录；抖音/美团订单的核销日志会显示在这里。
  </p>
</template>

<script setup lang="ts">
import type { ChannelSyncLogInfo } from '../../shared/stores/appStore'

defineProps<{
  logs: ChannelSyncLogInfo[]
  copied: boolean
}>()

const emit = defineEmits<{
  copy: []
}>()
</script>
