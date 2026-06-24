<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Work Order Export</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">工单数据导出</h2>
          <p class="mt-2 max-w-[850px] text-[10.5px] leading-relaxed text-amber-text-muted">
            从统一订单、相册和选片数据派生可导出工单，不新建工单账本。店长可按门店、环节、状态导出当前筛选结果，用于每日交接和制作复盘。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:opacity-50"
          :disabled="filteredWorkOrders.length === 0 || exporting"
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
            <option value="阻塞">阻塞</option>
            <option value="待处理">待处理</option>
            <option value="进行中">进行中</option>
          </select>
          <select v-model="stageFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
            <option value="all">全部环节</option>
            <option value="SHOOT">拍摄</option>
            <option value="UPLOAD">上传</option>
            <option value="SELECTION">客户选片</option>
            <option value="DELIVERY">精修交付</option>
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
        <div class="text-[10.5px] text-amber-text-muted">将导出 {{ filteredWorkOrders.length }} 条</div>
      </div>

      <div v-if="filteredWorkOrders.length" class="overflow-x-auto">
        <table class="w-full min-w-[1040px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">工单号</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">订单 / 客户</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
              <th class="px-5 py-3 text-[11px] text-amber-text-muted">环节</th>
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
        <div class="font-sans text-[15px] text-amber-dark">当前筛选下没有可导出的工单</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">{{ storeFilter ? '调整状态、环节、门店或搜索条件后再导出。' : '当前账号暂无可用门店，请先检查员工门店权限。' }}</p>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2] p-5">
      <div class="text-[11px] font-semibold text-amber-dark">导出边界</div>
      <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
        CSV 只包含当前筛选到的派生工单数据，适合每日交接、超时追踪和内部复盘；正式工单事件日志后续接 `yy_work_order_event` 后再纳入导出。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { buildWorkOrders, type WorkOrderStatus } from './workOrders'
import type { WorkExecutionStage } from './workExecution'
import { downloadWorkOrderCsv } from './workOrderExport'

type StageFilter = 'all' | WorkExecutionStage
type StatusFilter = 'all' | WorkOrderStatus

const statusFilter = ref<StatusFilter>('all')
const stageFilter = ref<StageFilter>('all')
const storeFilter = ref('')
const searchQuery = ref('')
const exporting = ref(false)

const workOrders = computed(() => buildWorkOrders({
  orders: appStore.orders,
  albums: appStore.albums,
  selectionLinks: appStore.selectionLinks,
}))

const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const normalizeStoreFilter = (preferred = storeFilter.value) => {
  const matched = concreteStoreOptions.value.find(store => store.name === preferred || String(store.backendId) === preferred)
  return matched?.backendId ? String(matched.backendId) : String(concreteStoreOptions.value[0]?.backendId ?? '')
}

const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const filteredWorkOrders = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return scopedWorkOrders.value.filter(item => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (stageFilter.value !== 'all' && item.stage !== stageFilter.value) return false
    if (!query) return true
    const haystack = `${item.workOrderNo} ${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.assignee}`.toLowerCase()
    return haystack.includes(query)
  })
})

const scopedWorkOrders = computed(() => {
  if (!storeFilter.value) return []
  return workOrders.value.filter(item => String(item.order.storeBackendId) === storeFilter.value)
})

const summaryCards = computed(() => [
  { label: '可导出工单', value: String(filteredWorkOrders.value.length), hint: '当前筛选条件下会进入 CSV 的工单数量。', scope: 'EXPORT' },
  { label: '阻塞', value: String(filteredWorkOrders.value.filter(item => item.status === '阻塞').length), hint: '缺资料、待支付或缺选片链接的工单。', scope: 'BLOCK' },
  { label: '已超时', value: String(filteredWorkOrders.value.filter(item => item.execution.overdue).length), hint: '要求时间已过，需要优先追踪。', scope: 'SLA' },
  { label: '门店数', value: String(new Set(filteredWorkOrders.value.map(item => item.order.store)).size), hint: '当前导出覆盖的门店范围。', scope: '门店' },
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

watch(
  () => concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|'),
  () => {
    storeFilter.value = normalizeStoreFilter()
  },
)

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>
