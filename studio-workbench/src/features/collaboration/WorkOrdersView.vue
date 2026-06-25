<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Work Orders</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">工单管理</h2>
          <p class="mt-2 max-w-[850px] text-[10.5px] leading-relaxed text-amber-text-muted">
            当前页面直接读取真实 <code>yy_work_order</code>，按接待、化妆、摄影、修图、审片、看片、取件七个岗位视角组织门店协作处理，
            不再使用前端派生工单替代真实状态流转。
          </p>
        </div>
        <button
          class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-white"
          type="button"
          @click="router.push('/collaboration/overview')"
        >
          查看执行概况
        </button>
      </div>
    </section>

    <FeatureGateStatusCard :gate="gate" />
    <p v-if="gateError" class="text-[12px] text-[#8C3E2C]">{{ gateError }}</p>

    <section v-if="canLoadData" class="border border-amber-topbar-border bg-[#FBF8F2]/55">
      <div class="flex flex-wrap items-center gap-2 border-b border-amber-topbar-border p-5">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action border px-3 py-1.5 text-[10.5px]"
          :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }} 路 {{ filter.count }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[26px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="canLoadData" class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
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
              class="h-8 w-[270px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索工单号、客户、手机号、订单号"
              type="search"
            />
          </div>
          <div class="flex items-center gap-3 text-[10.5px] text-amber-text-muted">
            <span>展示 {{ filteredWorkOrders.length }} 条工单</span>
            <button class="yy-action border border-amber-topbar-border px-3 py-1 text-[10px] text-amber-dark hover:bg-white" type="button" @click="reload">
              刷新
            </button>
          </div>
        </div>

        <div v-if="error" class="border-b border-amber-topbar-border bg-[#FFF4E8] px-5 py-4 text-[10.5px] text-[#8C3E2C]">
          {{ error }}
        </div>

        <div v-if="workOrdersLoading" class="px-6 py-14 text-center text-[11px] text-amber-text-muted">
          正在加载真实工单...
        </div>
        <div v-else-if="filteredWorkOrders.length" class="overflow-x-auto">
          <table class="w-full min-w-[1060px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">工单 / 岗位</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">客户 / 订单</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">负责人</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">时限</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="item in filteredWorkOrders"
                :key="item.id"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedWorkOrder?.id === item.id ? 'bg-[#FBF8F2]' : ''"
                @click="selectedWorkOrder = item"
              >
                <td class="px-5 py-4">
                  <div class="font-mono text-[10.5px] text-amber-dark">{{ item.workOrderNo }}</div>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <span class="px-2 py-1 text-[10px]" :class="stageClass(item.stage)">{{ item.stageLabel }}</span>
                    <span class="px-2 py-1 text-[10px]" :class="priorityClass(item.priority)">{{ item.priorityLabel }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-semibold text-amber-dark">{{ item.order.customer || '待补客户' }}</div>
                  <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ item.order.id }} · {{ item.order.phone || '缺手机号' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ item.order.store }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.service }}</div>
                </td>
                <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.assignee }}</td>
                <td class="px-5 py-4">
                  <span class="px-2 py-1 text-[10px]" :class="workStatusClass(item.statusCode)">{{ item.status }}</span>
                  <div v-if="item.blockReason" class="mt-2 text-[10px] text-[#B8543B]">{{ item.blockReason }}</div>
                </td>
                <td class="px-5 py-4 font-mono text-[10.5px]" :class="item.execution.overdue ? 'text-[#B8543B]' : 'text-amber-dark'">
                  {{ item.execution.dueLabel }}
                </td>
                <td class="px-5 py-4">
                  <button
                    class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] text-[#F4EFE6] hover:bg-black"
                    :disabled="actionLoadingId === item.id"
                    type="button"
                    @click.stop="openPrimary(item)"
                  >
                    {{ actionLoadingId === item.id ? '处理中...' : item.primaryActionLabel }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-14 text-center">
          <div class="font-sans text-[15px] text-amber-dark">当前筛选下没有真实工单</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">{{ storeFilter ? '可以切换岗位、门店或搜索条件查看其他任务。' : '当前账号暂无可用门店，请先检查员工门店权限。' }}</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Work Order Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">工单详情</h3>
        </div>
        <div v-if="selectedWorkOrder" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-mono text-[10.5px] text-amber-dark">{{ selectedWorkOrder.workOrderNo }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedWorkOrder.order.customer || '待补客户' }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-1 text-[10px] text-amber-dark">{{ selectedWorkOrder.stageLabel }}</span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Status</dt>
              <dd class="mt-1 text-[11px] text-amber-dark">{{ selectedWorkOrder.status }} 路 {{ selectedWorkOrder.priorityLabel }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedWorkOrder.execution.nextAction }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Related</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">
                订单 {{ selectedWorkOrder.order.id }} · 相册 {{ selectedWorkOrder.album?.id || '未创建' }} · 选片链接 {{ selectedWorkOrder.selectionLink?.id || '未生成' }}
              </dd>
            </div>
            <div v-if="selectedWorkOrder.blockReason">
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Block</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-[#B8543B]">{{ selectedWorkOrder.blockReason }}</dd>
            </div>
          </dl>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[11px] font-semibold text-amber-dark">工单事件</div>
              <button
                class="yy-action border border-amber-topbar-border px-3 py-1 text-[10px] text-amber-dark hover:bg-white"
                type="button"
                :disabled="eventsLoading"
                @click="loadWorkOrderEvents(selectedWorkOrder.backendId)"
              >
                {{ eventsLoading ? '加载中...' : '刷新事件' }}
              </button>
            </div>
            <p v-if="eventsError" class="mt-3 text-[10.5px] text-[#8C3E2C]">{{ eventsError }}</p>
            <p v-else-if="eventsLoading" class="mt-3 text-[10.5px] text-amber-text-muted">正在加载 yy_work_order_event...</p>
            <div v-else-if="workOrderEvents.length" class="mt-3 space-y-3">
              <article v-for="event in workOrderEvents" :key="event.id" class="border border-amber-topbar-border bg-white p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="font-mono text-[10px] text-amber-dark">{{ event.eventType }}</span>
                  <span class="font-mono text-[9px] text-amber-text-muted">{{ event.createTime }}</span>
                </div>
                <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ event.remark || event.eventDetail }}</p>
                <p v-if="event.operatorName" class="mt-2 text-[9.5px] text-amber-text-muted">{{ event.operatorName }}</p>
              </article>
            </div>
            <p v-else class="mt-3 text-[10.5px] text-amber-text-muted">当前工单暂无事件记录。</p>
          </div>

          <div class="mt-6 grid gap-2">
            <button
              class="yy-action w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black"
              :disabled="actionLoadingId === selectedWorkOrder.id"
              type="button"
              @click="openPrimary(selectedWorkOrder)"
            >
              {{ actionLoadingId === selectedWorkOrder.id ? '处理中...' : selectedWorkOrder.primaryActionLabel }}
            </button>
            <button
              class="yy-action w-full border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-black/5"
              type="button"
              @click="router.push(selectedWorkOrder.actionPath)"
            >
              进入关联页面
            </button>
          </div>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              当前页以真实 <code>yy_work_order</code> 为主账本，按钮优先走工单状态流转；订单、相册和选片只作为上下文展示，不再反向伪造工单状态。
            </p>
          </div>
        </div>
        <div v-else class="px-5 py-12 text-center text-[11px] leading-relaxed text-amber-text-muted">
          选择一条工单后查看负责人、阻塞原因、关联相册和下一步动作。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { CollaborationStageCode } from '../../shared/api/backend'
import FeatureGateStatusCard from '../system/FeatureGateStatusCard.vue'
import { useCollaborationWorkOrders } from './useCollaborationWorkOrders'
import {
  collaborationWorkOrderStageOptions,
  type CollaborationWorkOrderItem,
  type CollaborationWorkOrderPriority,
  type CollaborationWorkOrderStatusCode,
} from './workOrderRuntime'

type QuickFilter = 'all' | 'blocked' | 'overdue' | 'active'
type StageFilter = 'all' | CollaborationStageCode

const router = useRouter()
const activeFilter = ref<QuickFilter>('all')
const stageFilter = ref<StageFilter>('all')
const searchQuery = ref('')
const selectedWorkOrder = ref<CollaborationWorkOrderItem | null>(null)
const actionLoadingId = ref('')

const {
  storeFilter,
  concreteStoreOptions,
  ensureWorkbenchStores,
  normalizeStoreFilter,
  workOrders,
  workOrderEvents,
  loading: workOrdersLoading,
  eventsLoading,
  error,
  eventsError,
  gate,
  gateError,
  canLoadData,
  reload,
  transitionWorkOrder,
  loadWorkOrderEvents,
} = useCollaborationWorkOrders()

const scopedWorkOrders = computed(() => {
  if (!storeFilter.value) return []
  return workOrders.value.filter(item => String(item.order.storeBackendId) === storeFilter.value)
})

const blockedWorkOrders = computed(() => scopedWorkOrders.value.filter(item => item.statusCode === 'BLOCKED'))
const overdueWorkOrders = computed(() => scopedWorkOrders.value.filter(item => item.execution.overdue))
const activeWorkOrders = computed(() => scopedWorkOrders.value.filter(item => item.statusCode === 'IN_PROGRESS'))

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部工单', count: scopedWorkOrders.value.length },
  { key: 'blocked' as const, label: '阻塞', count: blockedWorkOrders.value.length },
  { key: 'overdue' as const, label: '已超时', count: overdueWorkOrders.value.length },
  { key: 'active' as const, label: '进行中', count: activeWorkOrders.value.length },
])

const filteredWorkOrders = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return scopedWorkOrders.value.filter(item => {
    if (activeFilter.value === 'blocked' && item.statusCode !== 'BLOCKED') return false
    if (activeFilter.value === 'overdue' && !item.execution.overdue) return false
    if (activeFilter.value === 'active' && item.statusCode !== 'IN_PROGRESS') return false
    if (stageFilter.value !== 'all' && item.stage !== stageFilter.value) return false
    if (!query) return true
    const haystack = `${item.workOrderNo} ${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.assignee}`.toLowerCase()
    return haystack.includes(query)
  })
})

const summaryCards = computed(() => [
  { label: '工单总数', value: String(scopedWorkOrders.value.length), hint: '当前门店真实工单主链下的全部任务。', scope: 'TOTAL' },
  { label: '阻塞工单', value: String(blockedWorkOrders.value.length), hint: '由真实工单状态标记为阻塞的处理项。', scope: 'BLOCK' },
  { label: '超时工单', value: String(overdueWorkOrders.value.length), hint: '按岗位 SLA 推算后已超时的协作工单。', scope: 'SLA' },
  { label: '进行中', value: String(activeWorkOrders.value.length), hint: '已经进入执行中的真实工单。', scope: 'ACTIVE' },
])

const openPrimary = async (item: CollaborationWorkOrderItem) => {
  if (!item.canTransition) {
    router.push(item.actionPath)
    return
  }
  actionLoadingId.value = item.id
  try {
    await transitionWorkOrder(item)
    if (selectedWorkOrder.value?.backendId === item.backendId) {
      await loadWorkOrderEvents(item.backendId)
    }
  } finally {
    actionLoadingId.value = ''
  }
}

const stageClass = (stage: CollaborationStageCode) => {
  if (stage === 'RECEPTION') return 'bg-[#1A1814] text-[#F4EFE6]'
  if (stage === 'MAKEUP') return 'bg-[#F7E8E1] text-[#8C5A2C]'
  if (stage === 'PHOTOGRAPHY') return 'bg-[#F0E9DD] text-amber-dark'
  if (stage === 'RETOUCH') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  if (stage === 'REVIEW') return 'bg-[#EEF2FF] text-[#3650A3]'
  if (stage === 'SELECTION_REVIEW') return 'bg-[#F6EBDD] text-[#8C5A2C]'
  return 'bg-[#E9F2F7] text-[#2B617B]'
}

const priorityClass = (priority: CollaborationWorkOrderPriority) => {
  if (priority === 'URGENT' || priority === 'HIGH') return 'bg-[#B8543B]/10 text-[#8C3E2C]'
  if (priority === 'MEDIUM') return 'bg-[#F6EBDD] text-[#8C5A2C]'
  return 'border border-amber-topbar-border bg-white text-amber-text-muted'
}

const workStatusClass = (status: CollaborationWorkOrderStatusCode) => {
  if (status === 'BLOCKED') return 'bg-[#B8543B]/10 text-[#8C3E2C]'
  if (status === 'IN_PROGRESS') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  if (status === 'COMPLETED') return 'bg-[#E9F2F7] text-[#2B617B]'
  return 'border border-amber-topbar-border bg-[#FBF8F2] text-amber-text-muted'
}

watch(
  filteredWorkOrders,
  items => {
    if (!items.some(item => item.id === selectedWorkOrder.value?.id)) selectedWorkOrder.value = items[0] ?? null
  },
  { immediate: true },
)

watch(
  () => selectedWorkOrder.value?.backendId,
  id => {
    void loadWorkOrderEvents(id)
  },
)

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>

