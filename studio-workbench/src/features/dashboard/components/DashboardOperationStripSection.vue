<template>
  <section class="dashboard-ops-strip space-y-4">
    <div class="flex flex-col gap-3 px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">门店运营看板</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ selectedDateLabel }} · {{ selectedStoreScopeLabel }} · {{ selectedDatePrefix }}交付动作</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="option in storeOptions"
          :key="option.id"
          class="rounded-md border px-3 py-1.5 text-[12px] font-sans font-medium transition-colors"
          :class="option.id === selectedStoreId
            ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
            : 'border-amber-topbar-border bg-amber-content-bg text-amber-text-muted hover:text-amber-dark'"
          type="button"
          @click="$emit('select-store', option.id)"
        >
          {{ option.name }}
        </button>
      </div>
      <JianyueDateStrip
        class="rounded-md border border-amber-topbar-border/70 shadow-sm"
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
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <article
          v-for="item in cards"
          :key="item.label"
          class="yy-surface bg-amber-content-bg border border-amber-topbar-border/70 rounded-md shadow-sm p-4 min-h-[112px] flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-accent/50"
          role="button"
          tabindex="0"
          @click="$emit('open-card', item)"
          @keydown.enter.prevent="$emit('open-card', item)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-2.5">
              <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-accent/10">
                <Camera v-if="item.icon === 'camera'" :size="18" class="text-amber-accent" :stroke-width="1.8" />
                <UploadCloud v-else-if="item.icon === 'upload'" :size="18" class="text-amber-accent" :stroke-width="1.8" />
                <MousePointerClick v-else-if="item.icon === 'select'" :size="18" class="text-amber-accent" :stroke-width="1.8" />
                <Send v-else-if="item.icon === 'deliver'" :size="18" class="text-amber-accent" :stroke-width="1.8" />
              </div>
              <div>
                <p class="text-[15px] font-sans font-semibold text-amber-dark">{{ item.label }}</p>
                <p class="text-[12.5px] text-amber-text-muted mt-1 leading-relaxed">{{ item.desc }}</p>
              </div>
            </div>
            <span class="shrink-0 rounded-md border border-amber-topbar-border/60 bg-black/[0.02] px-2 py-0.5 text-[11px] font-sans text-amber-text-muted">
              {{ item.scope }}
            </span>
          </div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[40px] leading-none font-sans font-bold tabular-nums text-amber-dark">{{ item.value }}</strong>
            <span class="text-[12px] font-medium text-amber-text-muted">{{ loading ? '刷新中' : item.hint }}</span>
          </div>
        </article>
      </div>
    </StateView>
  </section>
</template>

<script setup lang="ts">
import { Camera, MousePointerClick, Send, UploadCloud } from 'lucide-vue-next'
import JianyueDateStrip from '../../../shared/components/navigation/JianyueDateStrip.vue'
import NoticeBanner from '../../../shared/components/feedback/NoticeBanner.vue'
import StateView from '../../../shared/components/feedback/StateView.vue'

export type DashboardOperationCard = {
  label: string
  value: string
  desc: string
  hint: string
  scope: string
  icon: string
}

defineProps<{
  selectedDateLabel: string
  selectedStoreScopeLabel: string
  selectedDatePrefix: string
  storeOptions: Array<{ id: string; name: string }>
  selectedStoreId: string
  dateTabs: Array<{
    date: string
    shortLabel: string
    dateLabel: string
    active: boolean
    today: boolean
  }>
  pendingTaskNotice: { type: 'success' | 'error'; message: string } | null
  loading: boolean
  error: string
  onRetry?: () => void
  cards: DashboardOperationCard[]
}>()

defineEmits<{
  'select-store': [storeId: string]
  'select-date': [date: string]
  'shift-date': [days: number]
  'open-card': [item: DashboardOperationCard]
}>()
</script>
