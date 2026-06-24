<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Stage Statistics</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">岗位统计</h2>
          <p class="mt-2 max-w-[850px] text-[10.5px] leading-relaxed text-amber-text-muted">
            统计视图直接聚合真实工单主链，按七个岗位观察总量、阻塞、超时和平均进度，用于门店今日协作排队与瓶颈定位。
          </p>
        </div>
        <button
          class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-white"
          type="button"
          @click="router.push('/collaboration/export')"
        >
          导出工单数据
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summaryCards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
        <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
        <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <strong class="font-sans text-[26px] leading-none text-amber-dark">{{ card.value }}</strong>
          <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
          <div>
            <h3 class="font-sans text-[15px] text-amber-dark">岗位分布</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">越靠前的岗位越代表当前门店需要优先处理的协作瓶颈。</p>
          </div>
          <div class="flex items-center gap-3 text-[10.5px] text-amber-text-muted">
            <span>{{ storeLabel }}</span>
            <button class="yy-action border border-amber-topbar-border px-3 py-1 text-[10px] text-amber-dark hover:bg-white" type="button" @click="reload">
              刷新
            </button>
          </div>
        </div>

        <div v-if="error" class="border-b border-amber-topbar-border bg-[#FFF4E8] px-5 py-4 text-[10.5px] text-[#8C3E2C]">
          {{ error }}
        </div>

        <div v-if="loading" class="px-6 py-14 text-center text-[11px] text-amber-text-muted">
          正在加载真实工单统计...
        </div>
        <div v-else class="divide-y divide-amber-topbar-border/60">
          <article v-for="stat in stageStats" :key="stat.stage" class="p-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2 py-1 text-[10px]" :class="stageClass(stat.stage)">{{ stat.stageLabel }}</span>
                  <span class="font-mono text-[10px] text-amber-text-muted">{{ stat.total }} 个工单</span>
                </div>
                <div class="mt-2 text-[10.5px] text-amber-text-muted">
                  阻塞 {{ stat.blocked }} · 超时 {{ stat.overdue }} · 进行中 {{ stat.active }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-sans text-[24px] leading-none text-amber-dark">{{ stat.averageProgress }}%</div>
                <div class="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">AVG Progress</div>
              </div>
            </div>
            <div class="mt-4 h-2 overflow-hidden bg-black/10">
              <div class="h-full bg-amber-dark" :style="{ width: `${stat.averageProgress}%` }" />
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="border border-amber-topbar-border bg-[#FBF8F2] p-2">
                <div class="font-mono text-[12px] text-amber-dark">{{ stat.blocked }}</div>
                <div class="mt-1 text-[9px] text-amber-text-muted">阻塞</div>
              </div>
              <div class="border border-amber-topbar-border bg-[#FBF8F2] p-2">
                <div class="font-mono text-[12px] text-amber-dark">{{ stat.overdue }}</div>
                <div class="mt-1 text-[9px] text-amber-text-muted">超时</div>
              </div>
              <div class="border border-amber-topbar-border bg-[#FBF8F2] p-2">
                <div class="font-mono text-[12px] text-amber-dark">{{ Math.round(stat.activeRatio * 100) }}%</div>
                <div class="mt-1 text-[9px] text-amber-text-muted">进行中</div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Focus</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">今日关注</h3>
        </div>
        <div class="p-5">
          <div v-if="focusStage" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">{{ focusStage.stageLabel }} 是当前瓶颈</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              当前岗位共有 {{ focusStage.total }} 个工单，其中 {{ focusStage.blocked }} 个阻塞、{{ focusStage.overdue }} 个超时。
              建议优先进入工单管理处理高优先项。
            </p>
          </div>
          <button
            class="yy-action mt-4 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black"
            type="button"
            @click="router.push('/collaboration/work-orders')"
          >
            打开工单管理
          </button>
          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">统计边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              当前页只读真实工单统计，不写订单、不创建预约；平均进度和超时来自前端岗位 SLA 适配层，后续补齐事件链后可继续细化为耗时统计。
            </p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { CollaborationStageCode } from '../../shared/api/backend'
import { buildWorkOrderStageStats } from './workOrderStats'
import { useCollaborationWorkOrders } from './useCollaborationWorkOrders'

const router = useRouter()

const {
  storeFilter,
  concreteStoreOptions,
  ensureWorkbenchStores,
  normalizeStoreFilter,
  workOrders,
  loading,
  error,
  reload,
} = useCollaborationWorkOrders()

const stageStats = computed(() => buildWorkOrderStageStats(workOrders.value))
const focusStage = computed(() =>
  [...stageStats.value].sort((left, right) => {
    const leftScore = left.blocked * 3 + left.overdue * 2 + left.total
    const rightScore = right.blocked * 3 + right.overdue * 2 + right.total
    return rightScore - leftScore
  })[0],
)

const storeLabel = computed(() =>
  concreteStoreOptions.value.find(store => String(store.backendId) === storeFilter.value)?.name ?? '当前门店',
)

const summaryCards = computed(() => [
  { label: '工单总数', value: String(workOrders.value.length), hint: '当前门店真实工单主链里的全部任务。', scope: 'TOTAL' },
  { label: '阻塞总数', value: String(workOrders.value.filter(item => item.statusCode === 'BLOCKED').length), hint: '由真实工单状态明确标记为阻塞。', scope: 'BLOCK' },
  { label: '超时总数', value: String(workOrders.value.filter(item => item.execution.overdue).length), hint: '按岗位 SLA 推算后已超时的工单。', scope: 'SLA' },
  { label: '平均进度', value: `${Math.round(workOrders.value.reduce((sum, item) => sum + item.execution.progress, 0) / Math.max(1, workOrders.value.length))}%`, hint: '按真实工单当前岗位进度估算。', scope: 'AVG' },
])

const stageClass = (stage: CollaborationStageCode) => {
  if (stage === 'RECEPTION') return 'bg-[#1A1814] text-[#F4EFE6]'
  if (stage === 'MAKEUP') return 'bg-[#F7E8E1] text-[#8C5A2C]'
  if (stage === 'PHOTOGRAPHY') return 'bg-[#F0E9DD] text-amber-dark'
  if (stage === 'RETOUCH') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  if (stage === 'REVIEW') return 'bg-[#EEF2FF] text-[#3650A3]'
  if (stage === 'SELECTION_REVIEW') return 'bg-[#F6EBDD] text-[#8C5A2C]'
  return 'bg-[#E9F2F7] text-[#2B617B]'
}

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>
