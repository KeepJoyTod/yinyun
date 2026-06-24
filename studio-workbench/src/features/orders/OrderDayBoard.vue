<template>
  <section class="orders-day-board rounded-md border border-amber-topbar-border bg-amber-content-bg px-5 py-4">
    <div class="flex items-end justify-between gap-4 max-[980px]:flex-col max-[980px]:items-start">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-text-muted">按天处理</span>
        <h3 class="mt-1 text-[18px] font-sans font-semibold text-amber-dark">按天处理</h3>
        <p class="mt-1 max-w-[640px] text-[12px] font-sans leading-relaxed text-amber-text-muted">
          先按到店日期收拢今天的处理队列，再用门店筛选和渠道筛选收紧范围，优先处理冲突提示和缺资料订单。
        </p>
      </div>
      <div class="flex flex-wrap items-start gap-4 max-[720px]:w-full max-[720px]:flex-col">
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">门店筛选</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="store in storeOptions"
              :key="store"
              class="yy-action rounded-full border px-3 py-1.5 text-[11px] font-sans font-semibold transition-all"
              :class="storeNameForOrderScope === store
                ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
                : 'border-amber-topbar-border/70 bg-white/55 text-amber-text-muted hover:bg-white'"
              type="button"
              @click="$emit('selectStore', store)"
            >
              {{ store }}
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">渠道筛选</span>
          <div class="flex flex-wrap gap-2">
            <button
              class="yy-action rounded-full border px-3 py-1.5 text-[11px] font-sans font-semibold transition-all"
              :class="selectedSource === '订单来源'
                ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
                : 'border-amber-topbar-border/70 bg-white/55 text-amber-text-muted hover:bg-white'"
              type="button"
              @click="$emit('selectSource', '订单来源')"
            >
              全部渠道
            </button>
            <button
              v-for="source in sourceOptions.filter(opt => !opt.startsWith('全部'))"
              :key="source"
              class="yy-action rounded-full border px-3 py-1.5 text-[11px] font-sans font-semibold transition-all"
              :class="selectedSource === source
                ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
                : 'border-amber-topbar-border/70 bg-white/55 text-amber-text-muted hover:bg-white'"
              type="button"
              @click="$emit('selectSource', source)"
            >
              {{ source }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="card in dayCommandCards"
        :key="card.label"
        class="yy-action yy-surface rounded-md border border-amber-topbar-border/70 bg-white p-3 text-left transition hover:border-amber-dark/25"
        type="button"
        @click="$emit('selectQuickFilter', card.filter)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-[13px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
            <div class="mt-1 text-[11px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          </div>
          <span class="rounded border border-amber-topbar-border/60 bg-black/[0.03] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.12em] text-amber-text-muted">
            {{ card.scope }}
          </span>
        </div>
        <div class="mt-3 flex items-end justify-between gap-3">
          <strong class="text-[26px] font-sans font-semibold tabular-nums leading-none text-amber-dark">{{ card.value }}</strong>
          <span class="text-[11px] font-sans text-amber-text-muted">{{ card.action }}</span>
        </div>
      </button>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <article class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] p-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-status-danger)]">冲突提示</div>
            <div class="mt-1 text-[15px] font-sans font-semibold text-amber-dark">库存冲突订单</div>
          </div>
          <span class="rounded bg-white/70 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-status-danger)]">
            {{ inventoryConflictOrders.length }} 条
          </span>
        </div>
        <div class="mt-4 space-y-2">
          <div
            v-for="order in inventoryConflictOrders.slice(0, 3)"
            :key="`conflict-${order.id}`"
            class="flex items-center justify-between gap-3 rounded-md border border-white/70 bg-white/75 px-3 py-2"
          >
            <div class="min-w-0">
              <div class="truncate text-[12px] font-semibold text-amber-dark">{{ order.customer }}</div>
              <div class="mt-0.5 truncate text-[10px] font-mono text-amber-text-muted">{{ order.id }} · {{ order.store }} · {{ order.arrivalDate }} {{ order.arrivalClock }}</div>
            </div>
            <button class="yy-action rounded border border-[var(--color-status-danger-border)] px-3 py-1 text-[10px] font-semibold text-[var(--color-status-danger)] hover:bg-white" type="button" @click="$emit('openOrder', order)">
              处理动作
            </button>
          </div>
          <p v-if="inventoryConflictOrders.length === 0" class="rounded-md border border-dashed border-[var(--color-status-danger-border)] bg-white/65 px-3 py-3 text-[11px] leading-relaxed text-[var(--color-status-danger)]">
            当前没有库存冲突订单；出现超卖或时段冲突时会在这里集中提示。
          </p>
        </div>
      </article>

      <article class="rounded-md border border-amber-topbar-border/70 bg-white p-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">处理动作</div>
            <div class="mt-1 text-[15px] font-sans font-semibold text-amber-dark">缺资料订单</div>
          </div>
          <span class="rounded border border-amber-topbar-border/60 bg-black/[0.03] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-amber-text-muted">
            {{ missingInfoOrders.length }} 条
          </span>
        </div>
        <div class="mt-4 space-y-2">
          <div
            v-for="order in missingInfoOrders.slice(0, 3)"
            :key="`missing-${order.id}`"
            class="flex items-center justify-between gap-3 rounded-md border border-amber-topbar-border/70 bg-white/75 px-3 py-2"
          >
            <div class="min-w-0">
              <div class="truncate text-[12px] font-semibold text-amber-dark">{{ order.customer || order.id }}</div>
              <div class="mt-0.5 truncate text-[10px] font-mono text-amber-text-muted">{{ order.id }} · {{ order.phone || '缺手机号' }} · {{ order.arrivalDate || '缺预约时间' }}</div>
            </div>
            <button class="yy-action rounded border border-amber-topbar-border/70 px-3 py-1 text-[10px] font-semibold text-amber-text-muted hover:bg-white" type="button" @click="$emit('openOrder', order)">
              处理动作
            </button>
          </div>
          <p v-if="missingInfoOrders.length === 0" class="rounded-md border border-dashed border-amber-topbar-border/70 bg-white/65 px-3 py-3 text-[11px] leading-relaxed text-amber-text-muted">
            当前没有缺资料订单；缺手机号、缺客户信息或非来客订单缺预约时间的订单会出现在这里。
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BookingOrder } from '../../shared/stores/appStore'
import type { QuickOrderFilter } from './orderOperations'

type DayCommandCard = {
  label: string
  value: string
  hint: string
  action: string
  scope: string
  filter: QuickOrderFilter
}

defineProps<{
  storeOptions: string[]
  storeNameForOrderScope: string
  sourceOptions: string[]
  selectedSource: string
  dayCommandCards: DayCommandCard[]
  inventoryConflictOrders: BookingOrder[]
  missingInfoOrders: BookingOrder[]
}>()

defineEmits<{
  selectStore: [store: string]
  selectSource: [source: string]
  selectQuickFilter: [filter: QuickOrderFilter]
  openOrder: [order: BookingOrder]
}>()
</script>
