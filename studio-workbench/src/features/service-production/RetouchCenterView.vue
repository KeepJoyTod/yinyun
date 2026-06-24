<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Retouch Center</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">三方修图中心</h2>
          <p class="mt-2 max-w-[820px] text-[10.5px] leading-relaxed text-amber-text-muted">
            从已确认相册自动派生修图任务，店员只在这里派单、跟催、验收，不再手工维护第二套订单。
          </p>
        </div>
        <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.loading" @click="refreshTasks">
          {{ service.loading ? '刷新中...' : '刷新任务' }}
        </button>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <article v-for="card in summaryCards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
        <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
        <div class="mt-1 text-[10px] text-amber-text-muted">{{ card.hint }}</div>
        <div class="mt-4 text-[24px] font-semibold text-amber-dark">{{ card.value }}</div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
          <select v-model="storeFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark">
            <option value="">全部门店</option>
            <option v-for="store in appStore.stores" :key="store.id" :value="store.id">{{ store.name }}</option>
          </select>
          <select v-model="statusFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark">
            <option value="">全部状态</option>
            <option v-for="option in retouchTaskStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="providerFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark">
            <option value="">全部服务商</option>
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">{{ provider.providerName }}</option>
          </select>
          <input v-model.trim="keyword" class="h-8 w-[220px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark max-[560px]:w-full" placeholder="搜索任务号、客户、服务" type="search" />
        </div>

        <div v-if="filteredTasks.length" class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">任务 / 客户</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">服务商</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">报价 / 截止</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr v-for="task in filteredTasks" :key="task.id" class="cursor-pointer hover:bg-black/[0.015]" :class="selectedTask?.id === task.id ? 'bg-[#FBF8F2]' : ''" @click="selectedTaskId = task.id">
                <td class="px-5 py-4">
                  <div class="font-mono text-[10.5px] text-amber-dark">{{ task.taskNo }}</div>
                  <div class="mt-1 text-[11px] text-amber-dark">{{ task.customerName || '待补客户' }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">相册 {{ task.albumName || '未命名相册' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ task.storeName || '未识别门店' }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ task.serviceName || '待补服务名' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ task.providerName || '未派单' }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">验收 {{ task.acceptanceStatus }}</div>
                </td>
                <td class="px-5 py-4">
                  <span class="rounded border px-2 py-1 text-[10px]" :class="task.status === 'BLOCKED' ? 'border-[#B8543B] text-[#B8543B]' : 'border-amber-topbar-border text-amber-dark'">
                    {{ task.status }}
                  </span>
                  <div v-if="task.blockReason" class="mt-2 text-[10px] text-[#B8543B]">{{ task.blockReason }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ formatMoneyCent(task.quoteAmountCent) }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ formatDateTime(task.dueTime) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-14 text-center">
          <div class="font-sans text-[15px] text-amber-dark">当前筛选下没有修图任务</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">先确认相册已选片，再检查门店范围、状态和搜索条件。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Task Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">派单与验收</h3>
        </div>
        <div v-if="selectedTask" class="space-y-4 p-5 text-[11px] text-amber-dark">
          <div>
            <div class="font-mono text-[10.5px]">{{ selectedTask.taskNo }}</div>
            <div class="mt-1 text-amber-text-muted">{{ selectedTask.customerName }} · {{ selectedTask.storeName }}</div>
          </div>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">服务商</div>
            <select v-model="draft.providerId" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
              <option value="">暂不派单</option>
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">{{ provider.providerName }}</option>
            </select>
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">任务状态</div>
            <select v-model="draft.status" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
              <option v-for="option in retouchTaskStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">验收状态</div>
            <select v-model="draft.acceptanceStatus" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
              <option v-for="option in acceptanceStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">报价（分）</div>
            <input v-model.number="draft.quoteAmountCent" class="h-9 w-full border border-amber-topbar-border bg-white px-3" min="0" step="100" type="number" />
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">截止时间</div>
            <input v-model="draft.dueTime" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="datetime-local" />
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">阻塞原因</div>
            <textarea v-model.trim="draft.blockReason" class="min-h-[88px] w-full border border-amber-topbar-border bg-white px-3 py-2" />
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">本次备注</div>
            <textarea v-model.trim="draft.remark" class="min-h-[88px] w-full border border-amber-topbar-border bg-white px-3 py-2" />
          </label>
          <button class="yy-action w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.saving" @click="saveTask">
            {{ service.saving ? '保存中...' : '保存任务状态' }}
          </button>
          <div v-if="service.error" class="rounded border border-[#B8543B]/30 bg-[#FFF1EE] px-3 py-2 text-[10px] text-[#B8543B]">{{ service.error }}</div>
        </div>
        <div v-else class="px-5 py-12 text-center text-[11px] text-amber-text-muted">
          选择一条修图任务后，在右侧派单、改截止时间或更新验收状态。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { useServiceProduction } from './composables/useServiceProduction'
import { acceptanceStatusOptions, formatDateTime, formatMoneyCent, fromLocalDateTimeInput, retouchTaskStatusOptions, toLocalDateTimeInput } from './serviceProductionOperations'

const service = useServiceProduction()
const storeFilter = ref('')
const statusFilter = ref('')
const providerFilter = ref('')
const keyword = ref('')
const selectedTaskId = ref('')
const tasks = ref<Awaited<ReturnType<typeof service.loadRetouchTasks>>>([])
const providers = ref<Awaited<ReturnType<typeof service.loadRetouchProviders>>>([])

const draft = reactive({
  providerId: '',
  status: 'WAIT_ASSIGN',
  acceptanceStatus: 'PENDING',
  quoteAmountCent: 0,
  dueTime: '',
  blockReason: '',
  remark: '',
})

const filteredTasks = computed(() =>
  tasks.value.filter(task =>
    (!storeFilter.value || task.storeId === storeFilter.value)
    && (!statusFilter.value || task.status === statusFilter.value)
    && (!providerFilter.value || task.providerId === providerFilter.value)
    && (!keyword.value || `${task.taskNo} ${task.customerName} ${task.serviceName}`.includes(keyword.value)),
  ))

const selectedTask = computed(() => filteredTasks.value.find(task => task.id === selectedTaskId.value) ?? filteredTasks.value[0] ?? null)

const summaryCards = computed(() => [
  { label: '待派单', value: tasks.value.filter(task => task.status === 'WAIT_ASSIGN').length, hint: '已确认相册尚未分配服务商' },
  { label: '修图中', value: tasks.value.filter(task => task.status === 'IN_PROGRESS').length, hint: '服务商已接单，正在制作' },
  { label: '待审片', value: tasks.value.filter(task => task.status === 'WAIT_REVIEW').length, hint: '需要门店或中央修图验收' },
  { label: '阻塞', value: tasks.value.filter(task => task.status === 'BLOCKED').length, hint: '有异常，需要人工处理' },
])

watch(selectedTask, task => {
  if (!task) return
  selectedTaskId.value = task.id
  draft.providerId = task.providerId || ''
  draft.status = task.status
  draft.acceptanceStatus = task.acceptanceStatus
  draft.quoteAmountCent = task.quoteAmountCent
  draft.dueTime = toLocalDateTimeInput(task.dueTime)
  draft.blockReason = task.blockReason
  draft.remark = ''
}, { immediate: true })

const refreshTasks = async () => {
  tasks.value = await service.loadRetouchTasks()
  if (!selectedTaskId.value && tasks.value[0]) {
    selectedTaskId.value = tasks.value[0].id
  }
}

const saveTask = async () => {
  if (!selectedTask.value) return
  const updated = await service.updateRetouchTask({
    id: selectedTask.value.id,
    providerId: draft.providerId || null,
    status: draft.status,
    acceptanceStatus: draft.acceptanceStatus,
    quoteAmountCent: draft.quoteAmountCent,
    dueTime: fromLocalDateTimeInput(draft.dueTime),
    blockReason: draft.blockReason,
    remark: draft.remark,
  })
  const nextIndex = tasks.value.findIndex(task => task.id === updated.id)
  if (nextIndex >= 0) tasks.value[nextIndex] = updated
  draft.remark = ''
}

onMounted(async () => {
  await service.ensureStores()
  providers.value = await service.loadRetouchProviders({ status: 'ACTIVE' })
  await refreshTasks()
})
</script>
