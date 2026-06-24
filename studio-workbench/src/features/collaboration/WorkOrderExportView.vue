<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Work Order Export</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">工单数据导出</h2>
          <p class="mt-2 max-w-[850px] text-[10.5px] leading-relaxed text-amber-text-muted">
            导出当前门店真实工单筛选结果，便于每日交接、超时追踪和协作复盘。导出内容来自 <code>yy_work_order</code>，
            不再从前端派生队列临时拼接。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:opacity-50"
          :disabled="filteredWorkOrders.length === 0 || exporting || loading"
          type="button"
          @click="exportCsv"
        >
          {{ exporting ? '导出中...' : '导出 CSV' }}
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

    <section class="border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
        <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
          <select v-model="statusFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
            <option value="all">全部状态</option>
            <option value="BLOCKED">阻塞</option>
            <option value="PENDING">待处理</option>
            <option value="IN_PROGRESS">进行中</option>
            <option value="COMPLETED">已完成</option>
          </select>
          <select v-model="stageFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
            <option value="all">全部岗位</option>
            <option v-for="stage in collaborationWorkOrderStageOptions" :key="stage.code" :value="stage.code">{{ stage.label }}</option>
          </select>
          <select v-model="storeFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
            <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
            <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">{{ store.name }}</option>
          </select>
          <input
            v-model.trim="searchQuery"
            class="h-8 w-[260px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
            placeholder="搜索客户、手机号、订单号、工单号"
            type="search"
          />
        </div>
        <div class="flex items-center gap-3 text-[10.5px] text-amber-text-muted">
          <span>将导出 {{ filteredWorkOrders.length }} 条</span>
          <button class="yy-action border border-amber-topbar-border px-3 py-1 text-[10px] text-amber-dark hover:bg-white" type="button" @click="reload">
            刷新
          </button>
        </div>
      </div>

      <div v-if="error" class="border-b border-amber-topbar-border bg-[#FFF4E8] px-5 py-4 text-[10.5px] text-[#8C3E2C]">
        {{ error }}
      </div>

      <div v-if="loading" class="px-6 py-14 text-center text-[11px] text-amber-text-muted">
        正在加载真实工单...
      </div>
      <div v-else-if="filteredWorkOrders.length" class="overflow-x-auto">
        <table class="w-full min-w-[1040px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">工单号</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">订单 / 客户</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">岗位</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">负责人</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">时限</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">阻塞原因</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="item in filteredWorkOrders" :key="item.id" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ item.workOrderNo }}</td>
              <td class="px-5 py-4">
                <div class="font-mono text-[10px] text-amber-dark">{{ item.order.id }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.customer || '待补客户' }} · {{ item.order.phone || '缺手机号' }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="text-[11px] text-amber-dark">{{ item.order.store }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.service }}</div>
              </td>
              <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.stageLabel }}</td>
              <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.status }} · {{ item.priorityLabel }}</td>
              <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.assignee }}</td>
              <td class="px-5 py-4 font-mono text-[10.5px]" :class="item.execution.overdue ? 'text-[#B8543B]' : 'text-amber-dark'">{{ item.execution.dueLabel }}</td>
              <td class="px-5 py-4 text-[10px] text-amber-text-muted">{{ item.blockReason || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="px-6 py-14 text-center">
        <div class="font-sans text-[15px] text-amber-dark">当前筛选下没有可导出的真实工单</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">{{ storeFilter ? '调整状态、岗位、门店或搜索条件后再导出。' : '当前账号暂无可用门店，请先检查员工门店权限。' }}</p>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2] p-5">
      <div class="text-[11px] font-semibold text-amber-dark">导出边界</div>
      <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
        CSV 仅包含当前筛选到的真实工单数据，适合门店内部交接和超时追踪；事件明细后续接入 <code>yy_work_order_event</code> 后再补充到导出结构。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CollaborationStageCode } from '../../shared/api/backend'
import { useCollaborationWorkOrders } from './useCollaborationWorkOrders'
import { downloadWorkOrderCsv } from './workOrderExport'
import { collaborationWorkOrderStageOptions } from './workOrderRuntime'

type StageFilter = 'all' | CollaborationStageCode
type StatusFilter = 'all' | 'BLOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

const statusFilter = ref<StatusFilter>('all')
const stageFilter = ref<StageFilter>('all')
const searchQuery = ref('')
const exporting = ref(false)

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

const scopedWorkOrders = computed(() => {
  if (!storeFilter.value) return []
  return workOrders.value.filter(item => String(item.order.storeBackendId) === storeFilter.value)
})

const filteredWorkOrders = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return scopedWorkOrders.value.filter(item => {
    if (statusFilter.value !== 'all' && item.statusCode !== statusFilter.value) return false
    if (stageFilter.value !== 'all' && item.stage !== stageFilter.value) return false
    if (!query) return true
    const haystack = `${item.workOrderNo} ${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.assignee}`.toLowerCase()
    return haystack.includes(query)
  })
})

const summaryCards = computed(() => [
  { label: '可导出工单', value: String(filteredWorkOrders.value.length), hint: '当前筛选条件下会进入 CSV 的真实工单数量。', scope: 'EXPORT' },
  { label: '阻塞', value: String(filteredWorkOrders.value.filter(item => item.statusCode === 'BLOCKED').length), hint: '真实工单状态标记为阻塞的处理项。', scope: 'BLOCK' },
  { label: '已超时', value: String(filteredWorkOrders.value.filter(item => item.execution.overdue).length), hint: '按岗位 SLA 推算后已超时的工单。', scope: 'SLA' },
  { label: '门店数', value: String(new Set(filteredWorkOrders.value.map(item => item.order.store)).size), hint: '当前导出覆盖的门店范围。', scope: 'STORE' },
])

const exportCsv = () => {
  exporting.value = true
  try {
    const date = new Date().toISOString().slice(0, 10)
    downloadWorkOrderCsv(filteredWorkOrders.value, `yingyue-work-orders-${date}.csv`)
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>
