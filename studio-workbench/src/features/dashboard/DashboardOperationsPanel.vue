<template>
  <div class="space-y-6">
    <section class="dashboard-ops-strip space-y-4">
      <div class="flex flex-col gap-3 px-1">
        <div>
          <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">门店运营看板</h2>
          <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · {{ storeScopeLabel }} · {{ datePrefix }}交付动作</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="option in storeOptions"
            :key="option.id"
            class="rounded-md border px-3 py-1.5 text-[12px] font-sans font-medium transition-colors"
            :class="option.id === selectedStoreId
              ? 'border-accent bg-accent text-ink'
              : 'border-hairline bg-surface-1 text-ink-muted hover:text-ink'"
            type="button"
            @click="$emit('select-store', option.id)"
          >
            {{ option.name }}
          </button>
        </div>
        <JianyueDateStrip
          class="rounded-md border border-hairline/70 shadow-sm"
          :items="dateTabs"
          @select="$emit('select-date', $event)"
          @shift="$emit('shift-date', $event)"
        />
      </div>

      <NoticeBanner :notice="pendingTaskNotice" />

      <StateView
        :loading="loading"
        :error="error"
        :on-retry="error ? onRetry : undefined"
        error-title="运营看板刷新失败"
        retry-label="重试刷新"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 yy-stagger">
          <article
            v-for="(item, idx) in operationCards"
            :key="item.label"
            class="yy-double-bezel p-4 min-h-[112px] flex flex-col justify-between hover:-translate-y-0.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50"
            :style="{ animationDelay: idx * 60 + 'ms' }"
            role="button"
            tabindex="0"
            @click="$emit('open-operation', item)"
            @keydown.enter.prevent="$emit('open-operation', item)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-2.5">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
                  <Camera v-if="item.icon === 'camera'" :size="18" class="text-accent" :stroke-width="1.8" />
                  <UploadCloud v-else-if="item.icon === 'upload'" :size="18" class="text-accent" :stroke-width="1.8" />
                  <MousePointerClick v-else-if="item.icon === 'select'" :size="18" class="text-accent" :stroke-width="1.8" />
                  <Send v-else-if="item.icon === 'deliver'" :size="18" class="text-accent" :stroke-width="1.8" />
                </div>
                <div>
                  <p class="text-[15px] font-sans font-semibold text-ink">{{ item.label }}</p>
                  <p class="text-[12px] text-ink-muted mt-1 leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
              <span class="shrink-0 rounded-full border border-hairline bg-canvas px-2 py-0.5 text-[11px] font-sans text-ink-muted">
                {{ item.scope }}
              </span>
            </div>
            <div class="mt-4 flex items-end justify-between gap-3">
              <strong class="text-[40px] leading-none font-sans font-bold tabular-nums text-ink">{{ item.value }}</strong>
              <span class="text-[12px] font-medium text-ink-muted">{{ loading ? '刷新中' : item.hint }}</span>
            </div>
          </article>
        </div>
      </StateView>
    </section>

    <section class="space-y-4">
      <div class="flex items-end justify-between px-1">
        <div>
          <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">服务订单状态</h2>
          <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · {{ storeScopeLabel }}</p>
        </div>
        <button class="yy-action text-[11px] font-sans font-normal text-ink-muted hover:text-ink transition-colors uppercase tracking-[0.1em]" type="button" @click="$emit('go-daily-report')">
          导出日报 ↗
        </button>
      </div>

      <div class="grid grid-cols-2 overflow-hidden rounded-xl border border-hairline/70 bg-surface-1 shadow-sm md:grid-cols-3 xl:grid-cols-6">
        <button
          v-for="item in statusCards"
          :key="item.key"
          class="yy-action min-w-0 border-b border-r border-hairline text-left transition-colors hover:bg-accent-hover/[0.015] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent/50"
          type="button"
          @click="$emit('open-status', item)"
        >
          <StatItem
            :label="item.label"
            :value="item.value"
            trend="0"
            trendType="neutral"
          />
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Camera, MousePointerClick, Send, UploadCloud } from 'lucide-vue-next'
import StatItem from '../../shared/components/dashboard/StatItem.vue'
import NoticeBanner, { type NoticePayload } from '../../shared/components/feedback/NoticeBanner.vue'
import StateView from '../../shared/components/feedback/StateView.vue'
import JianyueDateStrip from '../../shared/components/navigation/JianyueDateStrip.vue'
import type { DashboardOperationCard } from './useDashboardOperationCards'

type DateStripItem = {
  date: string
  shortLabel: string
  dateLabel: string
  active: boolean
  today: boolean
}

type StoreOption = {
  id: string
  name: string
}

type StatusCard = {
  key: string
  label: string
  value: string
}

defineProps<{
  dateLabel: string
  datePrefix: string
  storeScopeLabel: string
  selectedStoreId: string
  storeOptions: StoreOption[]
  dateTabs: DateStripItem[]
  pendingTaskNotice: NoticePayload
  loading: boolean
  error: string
  onRetry?: () => void
  operationCards: DashboardOperationCard[]
  statusCards: StatusCard[]
}>()

defineEmits<{
  'select-store': [storeId: string]
  'select-date': [date: string]
  'shift-date': [days: number]
  'open-operation': [item: DashboardOperationCard]
  'open-status': [item: StatusCard]
  'go-daily-report': []
}>()
</script>
