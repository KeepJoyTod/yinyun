<template>
  <section class="order-operational-summary rounded-md border border-amber-topbar-border bg-white/75 p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">订单操作总览</span>
        <h4 class="mt-1 truncate font-sans text-[17px] font-semibold text-amber-dark">
          {{ order.customer || '未留姓名' }} · {{ order.status }}
        </h4>
        <p class="mt-1 truncate text-[11px] font-sans text-amber-text-muted">
          {{ order.store }} · {{ slotTimeLabel }}
        </p>
      </div>
      <span class="shrink-0 px-2 py-0.5 text-[10.5px]" :class="statusClass">
        {{ order.status }}
      </span>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div class="rounded-md border border-amber-topbar-border/70 bg-[#FBF8F2] px-3 py-2">
        <div class="text-[10px] font-sans text-amber-text-muted">当前时段</div>
        <div class="mt-1 font-mono text-[13px] font-semibold text-amber-dark">{{ slotTimeLabel }}</div>
        <p class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ capacitySummary }}</p>
      </div>
      <div class="rounded-md border border-amber-topbar-border/70 bg-[#FBF8F2] px-3 py-2">
        <div class="text-[10px] font-sans text-amber-text-muted">来源 / 门店</div>
        <div class="mt-1 truncate font-sans text-[13px] font-semibold text-amber-dark">{{ order.source || '本地' }}</div>
        <p class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ storeScopeText }}</p>
      </div>
      <div class="rounded-md border border-amber-topbar-border/70 bg-[#FBF8F2] px-3 py-2">
        <div class="text-[10px] font-sans text-amber-text-muted">下一步</div>
        <div class="mt-1 font-sans text-[13px] font-semibold text-amber-dark">{{ nextActionLabel }}</div>
        <p class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ operationalHint }}</p>
      </div>
    </div>

    <div class="mt-3 rounded-md border border-amber-topbar-border/70 bg-[#FBF8F2] p-3">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div>
          <div class="text-[11px] font-sans font-medium text-amber-dark">最近操作证据</div>
          <p class="mt-0.5 text-[10.5px] leading-relaxed text-amber-text-muted">改期、取消、状态流转后自动刷新后台日志；可核对操作人、原因和目标时段。</p>
        </div>
        <button
          class="yy-action shrink-0 rounded border border-amber-topbar-border bg-white px-2 py-0.5 text-[10px] font-sans text-amber-text-muted hover:text-amber-dark disabled:opacity-60"
          type="button"
          aria-label="刷新最近操作证据"
          :disabled="operationLogsLoading"
          @click="emit('refreshLogs')"
        >
          {{ operationLogsLoading ? '刷新中' : '刷新' }}
        </button>
      </div>
      <p
        v-if="operationLogsStateText"
        class="mb-2 rounded border border-amber-topbar-border/70 bg-white/70 px-3 py-1.5 text-[10px] leading-relaxed text-amber-text-muted"
      >
        {{ operationLogsStateText }}
      </p>
      <div v-if="evidenceCards.length" class="space-y-2">
        <div
          v-for="card in evidenceCards"
          :key="card.key"
          class="rounded-md border bg-white/75 px-3 py-2 text-[10.5px]"
          :class="card.tone === 'done'
            ? 'border-[var(--color-status-done-border)]'
            : 'border-[var(--color-status-danger-border)]'"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-sans font-semibold text-amber-dark">{{ card.action }}</span>
            <span class="flex shrink-0 items-center gap-1">
              <span
                class="rounded border px-1.5 py-0.5 font-sans text-[10px] font-medium"
                :class="card.tone === 'done'
                  ? 'border-[var(--color-status-done-border)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done-text)]'
                  : 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'"
              >
                {{ card.statusLabel || (card.tone === 'done' ? '成功' : '失败') }}
              </span>
              <span class="font-mono text-[10px] text-amber-text-muted">{{ card.happenedAt }}</span>
            </span>
          </div>
          <div class="mt-1 grid gap-1 text-amber-text-muted">
            <span>{{ card.operatorContext }}</span>
            <span>{{ card.primaryDetail }}</span>
            <span v-if="card.secondaryDetail">{{ card.secondaryDetail }}</span>
          </div>
        </div>
      </div>
      <p v-else class="rounded-md border border-dashed border-amber-topbar-border bg-white/60 px-3 py-2 text-[10.5px] leading-relaxed text-amber-text-muted">
        暂无匹配后台操作日志；执行确认、改期、取消后会自动刷新，也可手动点击刷新。
      </p>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-if="canAdvance"
        class="yy-action rounded-md border border-amber-dark bg-amber-dark px-3 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        :disabled="advancing"
        @click="emit('advance', order)"
      >
        {{ advancing ? '处理中...' : nextActionLabel }}
      </button>
      <button
        v-if="showBackToSlot"
        class="yy-action rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-medium text-amber-dark hover:bg-black/5"
        type="button"
        @click="emit('backToSlot')"
      >
        返回时段看板
      </button>
      <button
        class="yy-action rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-900 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        :disabled="copySaving"
        @click="emit('copyOrder')"
      >
        {{ copySaving ? '复制中...' : '复制订单' }}
      </button>
      <button
        class="yy-action rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-medium text-amber-dark hover:bg-black/5"
        type="button"
        @click="emit('copyOrderId')"
      >
        复制订单号
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BookingOrder } from '../../shared/stores/appStore'
import type { OrderOperationEvidenceCard } from './orderOperations'

defineProps<{
  order: BookingOrder
  statusClass: string
  slotTimeLabel: string
  capacitySummary: string
  storeScopeText: string
  nextActionLabel: string
  operationalHint: string
  evidenceCards: OrderOperationEvidenceCard[]
  operationLogsLoading: boolean
  operationLogsStateText: string
  canAdvance: boolean
  advancing: boolean
  showBackToSlot: boolean
  copySaving: boolean
}>()

const emit = defineEmits<{
  refreshLogs: []
  advance: [order: BookingOrder]
  backToSlot: []
  copyOrder: []
  copyOrderId: []
}>()
</script>
