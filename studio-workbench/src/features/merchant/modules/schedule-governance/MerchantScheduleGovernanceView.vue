<template>
  <main section-key="schedule" class="min-h-screen bg-amber-bg px-6 py-6 text-amber-dark">
    <section class="mx-auto max-w-6xl space-y-5">
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-amber-topbar-border pb-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">schedule-governance</p>
          <h1 class="mt-1 text-xl font-semibold">档期库存治理</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-amber-text-muted">
            对已生成的时段库存执行临时关档、恢复营业和容量调整。命中已付费预约的关档会先进入审批，通过后系统自动应用。
          </p>
        </div>
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-xs" type="button" @click="reloadBaseData">
          刷新门店和服务组
        </button>
      </header>

      <section class="grid gap-4 rounded-md border border-amber-topbar-border bg-amber-content-bg p-4 md:grid-cols-4" data-testid="schedule-governance-form">
        <label class="space-y-1 text-xs text-amber-text-muted">
          门店
          <select v-model="form.storeId" class="yy-field-md">
            <option value="">选择门店</option>
            <option v-for="store in appStore.stores" :key="store.backendId" :value="store.backendId">{{ store.name }}</option>
          </select>
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          服务组
          <select v-model="form.serviceGroupId" class="yy-field-md">
            <option value="">全部服务组</option>
            <option v-for="group in serviceGroupOptions" :key="group.backendId" :value="group.backendId">{{ group.name }}</option>
          </select>
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          开始日期
          <input v-model="form.beginBizDate" class="yy-field-md" type="date" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          结束日期
          <input v-model="form.endBizDate" class="yy-field-md" type="date" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          开始时间
          <input v-model="form.startTime" class="yy-field-md" type="time" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          结束时间
          <input v-model="form.endTime" class="yy-field-md" type="time" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          动作
          <select v-model="form.actionType" class="yy-field-md">
            <option value="CLOSE">临时关档</option>
            <option value="REOPEN">恢复营业</option>
            <option value="CAPACITY_OVERRIDE">覆盖容量</option>
          </select>
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          容量
          <input v-model.number="form.capacity" class="yy-field-md" min="0" type="number" :disabled="form.actionType !== 'CAPACITY_OVERRIDE'" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted md:col-span-4">
          原因
          <textarea
            v-model="form.reason"
            class="min-h-20 w-full border border-amber-topbar-border bg-white px-3 py-2 text-sm outline-none focus:border-amber-dark"
            placeholder="例如节假日闭店、临时拍摄棚维护、临时追加容量"
          />
        </label>
        <div class="flex flex-wrap gap-3 md:col-span-4">
          <button class="yy-action border border-amber-topbar-border px-4 py-2 text-xs" type="button" :disabled="loading" @click="previewGovernance">
            {{ loading ? '预览中...' : '预览影响' }}
          </button>
          <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-xs text-white disabled:opacity-60" type="button" :disabled="loading" @click="applyGovernance">
            提交治理
          </button>
          <p v-if="notice" class="self-center text-xs" :class="noticeType === 'error' ? 'text-red-700' : 'text-emerald-700'">{{ notice }}</p>
        </div>
      </section>

      <section class="rounded-md border border-amber-topbar-border bg-amber-content-bg p-4" data-testid="schedule-governance-preview">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold">预览结果</h2>
          <div class="flex gap-2 text-xs text-amber-text-muted">
            <span>影响 {{ preview?.affectedSlotCount ?? 0 }} 个时段</span>
            <span>已约 {{ preview?.paidSlotCount ?? 0 }}</span>
            <span>冲突 {{ preview?.conflictSlotCount ?? 0 }}</span>
          </div>
        </div>
        <div v-if="preview?.approvalRequired" class="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="schedule-governance-approval-required">
          当前关档包含已付费预约，已进入高风险审批；审批编号：{{ preview.approval?.id || '待生成' }}。
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-left text-xs">
            <thead class="border-b border-amber-topbar-border text-amber-text-muted">
              <tr>
                <th class="py-2 pr-4">日期</th>
                <th class="py-2 pr-4">时间</th>
                <th class="py-2 pr-4">服务组</th>
                <th class="py-2 pr-4">容量</th>
                <th class="py-2 pr-4">已约</th>
                <th class="py-2 pr-4">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in previewSlots" :key="slot.id" class="border-b border-amber-topbar-border/70">
                <td class="py-2 pr-4">{{ slot.bizDate }}</td>
                <td class="py-2 pr-4">{{ slot.startTime }}-{{ slot.endTime }}</td>
                <td class="py-2 pr-4">{{ serviceGroupName(slot.serviceGroupId) }}</td>
                <td class="py-2 pr-4">{{ slot.capacity }}</td>
                <td class="py-2 pr-4">{{ slot.paidCount }}</td>
                <td class="py-2 pr-4">{{ slot.status }}</td>
              </tr>
              <tr v-if="!previewSlots.length">
                <td class="py-5 text-amber-text-muted" colspan="6">暂无预览结果，先选择门店、日期和时间段。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { backendApi, type ScheduleGovernancePayload, type ScheduleGovernancePreviewDto } from '../../../../shared/api/backend'
import { appStore } from '../../../../shared/stores/appStore'

const route = useRoute()
const today = new Date().toISOString().slice(0, 10)
const GOVERNANCE_ACTIONS = ['CLOSE', 'REOPEN', 'CAPACITY_OVERRIDE'] as const
type GovernanceActionType = ScheduleGovernancePayload['actionType']

const form = reactive<ScheduleGovernancePayload>({
  storeId: '',
  serviceGroupId: '',
  beginBizDate: today,
  endBizDate: today,
  startTime: '09:00',
  endTime: '18:00',
  actionType: 'CLOSE',
  capacity: 1,
  reason: '',
})

const loading = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')
const preview = ref<ScheduleGovernancePreviewDto | null>(null)

const serviceGroupOptions = computed(() =>
  appStore.serviceGroups.filter(group => !form.storeId || group.storeBackendId === form.storeId),
)
const previewSlots = computed(() => preview.value?.slots ?? [])

const readQueryString = (value: unknown) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
const readActionType = (value: unknown): GovernanceActionType => {
  const normalized = readQueryString(value).toUpperCase()
  return GOVERNANCE_ACTIONS.includes(normalized as GovernanceActionType)
    ? normalized as GovernanceActionType
    : form.actionType
}

const hasQueryPrefill = () =>
  Boolean(
    readQueryString(route.query.storeId)
    && readQueryString(route.query.beginBizDate)
    && readQueryString(route.query.endBizDate)
    && readQueryString(route.query.startTime)
    && readQueryString(route.query.endTime),
  )

const serviceGroupName = (id: unknown) =>
  appStore.serviceGroups.find(group => group.backendId === id)?.name || String(id || '全部')

const applyQueryPrefill = () => {
  const storeId = readQueryString(route.query.storeId)
  if (!storeId) return
  form.storeId = storeId
  form.serviceGroupId = readQueryString(route.query.serviceGroupId) || ''
  form.beginBizDate = readQueryString(route.query.beginBizDate) || form.beginBizDate
  form.endBizDate = readQueryString(route.query.endBizDate) || form.endBizDate
  form.startTime = readQueryString(route.query.startTime) || form.startTime
  form.endTime = readQueryString(route.query.endTime) || form.endTime
  form.actionType = readActionType(route.query.actionType)
  if (readQueryString(route.query.approvalId)) {
    noticeType.value = 'success'
    notice.value = `已从审批 ${readQueryString(route.query.approvalId)} 回跳，可直接查看当前治理结果。`
  }
}

const buildPayload = (): ScheduleGovernancePayload => {
  if (!form.storeId) throw new Error('请选择门店')
  if (!form.beginBizDate || !form.endBizDate) throw new Error('请选择日期范围')
  if (!form.startTime || !form.endTime) throw new Error('请选择时间段')
  return {
    ...form,
    serviceGroupId: form.serviceGroupId || null,
    capacity: form.actionType === 'CAPACITY_OVERRIDE' ? Number(form.capacity ?? 0) : null,
    reason: form.reason?.trim() || 'schedule governance',
  }
}

const run = async (action: 'preview' | 'apply') => {
  loading.value = true
  if (noticeType.value !== 'success' || !readQueryString(route.query.approvalId)) {
    notice.value = ''
  }
  try {
    const payload = buildPayload()
    preview.value = action === 'preview'
      ? await backendApi.previewScheduleGovernance(payload)
      : await backendApi.applyScheduleGovernance(payload)
    noticeType.value = 'success'
    notice.value = action === 'preview'
      ? '预览已生成'
      : (preview.value.approvalRequired ? '已提交审批' : '治理已应用')
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '操作失败'
  } finally {
    loading.value = false
  }
}

const previewGovernance = () => run('preview')
const applyGovernance = () => run('apply')

const loadBaseData = async () => {
  await Promise.all([
    appStore.stores.length ? Promise.resolve() : appStore.refreshCoreData(),
    appStore.serviceGroups.length ? Promise.resolve() : appStore.loadServiceGroups(),
  ])
}

const reloadBaseData = async () => {
  await loadBaseData()
  applyQueryPrefill()
}

watch(
  () => route.fullPath,
  async () => {
    applyQueryPrefill()
    if (hasQueryPrefill()) {
      await previewGovernance()
    }
  },
)

onMounted(async () => {
  await loadBaseData()
  applyQueryPrefill()
  if (hasQueryPrefill()) {
    await previewGovernance()
  }
})
</script>
