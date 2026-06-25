<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg/55">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-amber-topbar-border px-5 py-4">
      <div>
        <div class="text-[11px] font-semibold text-amber-dark">{{ sectionLabel }}</div>
        <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">
          <span class="mr-2">模块 {{ summary.total }}</span>
          <span class="mr-2">已完成 {{ summary.readyCount }}</span>
          <span class="mr-2">部分闭环 {{ summary.partialCount }}</span>
          <span class="mr-2">建设中 {{ summary.buildingCount }}</span>
          <span class="mr-2">阻塞 {{ summary.blockedCount }}</span>
          <span>未启动 {{ summary.notStartedCount }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-[10px]">
        <span class="yy-status-chip border-[#B03A3A]/25 bg-[#F4D7D7] text-[#B03A3A]">P0 {{ summary.p0Count }}</span>
        <span class="yy-status-chip border-[#B65F1E]/25 bg-[#F3E7A5] text-[#7A4A08]">P1 {{ summary.p1Count }}</span>
        <span class="yy-status-chip border-[#8A847B]/25 bg-[#EAE6DF] text-[#655E54]">P2 {{ summary.p2Count }}</span>
      </div>
    </div>

    <div class="p-5">
      <div v-if="loading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="border border-amber-topbar-border bg-white/70 p-4">
          <div class="h-4 w-40 animate-pulse bg-black/10"></div>
          <div class="mt-3 grid gap-2 md:grid-cols-3">
            <div v-for="cell in 3" :key="cell" class="h-16 animate-pulse bg-black/[0.04]"></div>
          </div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="border border-[#B03A3A]/25 bg-[#F4D7D7] p-4 text-[12px] text-[#8E2F2F]">
        <div class="font-semibold">加载失败</div>
        <div class="mt-1">{{ errorMessage }}</div>
        <button class="yy-action mt-3 border border-[#B03A3A] px-3 py-1.5 text-[11px] text-[#B03A3A]" type="button" @click="emit('retry')">
          重试
        </button>
      </div>

      <div v-else-if="items.length === 0" class="border border-dashed border-amber-topbar-border bg-white/70 p-4 text-[12px] text-amber-text-muted">
        暂无 readiness 项。
      </div>

      <div v-else class="grid gap-3">
        <article
          v-for="item in items"
          :key="item.moduleKey"
          class="border border-amber-topbar-border bg-white/80 p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-[13px] font-semibold text-amber-dark">{{ item.moduleName }}</h3>
                <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ item.moduleKey }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="sourceItem in item.sourceItems"
                  :key="sourceItem"
                  class="yy-status-chip border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted"
                >
                  {{ sourceItem }}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-[10px]">
              <span :class="['yy-status-chip', readinessStatusClass(item.status)]">{{ readinessStatusLabel(item.status) }}</span>
              <span :class="['yy-status-chip', readinessPriorityClass(item.priority)]">{{ item.priority }}</span>
            </div>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">阻塞原因</div>
              <ul class="mt-2 space-y-1.5 text-[12px] leading-relaxed text-amber-dark">
                <li v-for="blocker in item.blockers" :key="blocker">- {{ blocker }}</li>
              </ul>
            </div>
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">下一步动作</div>
              <ul class="mt-2 space-y-1.5 text-[12px] leading-relaxed text-amber-dark">
                <li v-for="action in item.nextActions" :key="action">- {{ action }}</li>
              </ul>
            </div>
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">证据</div>
              <ul class="mt-2 space-y-1.5 text-[12px] leading-relaxed text-amber-dark">
                <li v-for="ref in item.evidenceRefs" :key="ref">{{ ref }}</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MerchantReadinessItemDto } from '../../../../../shared/api/backendTypes'
import {
  readinessPriorityClass,
  readinessStatusClass,
  readinessStatusLabel,
  type MerchantReadinessSummary,
} from '../merchantReadinessOperations'

defineProps<{
  sectionLabel: string
  items: MerchantReadinessItemDto[]
  summary: MerchantReadinessSummary
  loading: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>
