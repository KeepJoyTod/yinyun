<template>
  <main section-key="governance" class="min-h-screen bg-amber-bg px-6 py-6 text-amber-dark">
    <section class="mx-auto max-w-6xl space-y-5">
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-amber-topbar-border pb-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">governance</p>
          <h1 class="mt-1 text-xl font-semibold">高风险审批</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-amber-text-muted">
            审批临时关档、订单退款和会员充值确认。付费时段关档审批通过后会自动应用到库存，无需再回治理页二次提交。
          </p>
        </div>
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-xs" type="button" :disabled="loading" @click="refresh">
          {{ loading ? '加载中...' : '刷新审批' }}
        </button>
      </header>

      <section class="grid gap-4 rounded-md border border-amber-topbar-border bg-amber-content-bg p-4 md:grid-cols-4" data-testid="risk-approval-filters">
        <label class="space-y-1 text-xs text-amber-text-muted">
          状态
          <select v-model="filters.status" class="yy-field-md" @change="loadApprovals">
            <option value="PENDING">待审批</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已驳回</option>
            <option value="">全部</option>
          </select>
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          类型
          <select v-model="filters.businessType" class="yy-field-md" @change="loadApprovals">
            <option value="">全部类型</option>
            <option value="SLOT_CLOSE_WITH_PAID_ORDER">付费时段关档</option>
            <option value="ORDER_REFUND">订单退款</option>
            <option value="MEMBER_RECHARGE_CONFIRM">会员充值确认</option>
          </select>
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          门店 ID
          <input v-model="filters.storeId" class="yy-field-md" placeholder="可选" type="text" @keyup.enter="loadApprovals" />
        </label>
        <label class="space-y-1 text-xs text-amber-text-muted">
          审批备注
          <input v-model="decisionRemark" class="yy-field-md" placeholder="通过/驳回备注" type="text" />
        </label>
      </section>

      <p v-if="notice" class="text-xs" :class="noticeType === 'error' ? 'text-red-700' : 'text-emerald-700'">{{ notice }}</p>

      <section class="rounded-md border border-amber-topbar-border bg-amber-content-bg" data-testid="risk-approval-list">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-xs">
            <thead class="border-b border-amber-topbar-border text-amber-text-muted">
              <tr>
                <th class="px-4 py-3">编号</th>
                <th class="px-4 py-3">类型</th>
                <th class="px-4 py-3">业务单号</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3">原因</th>
                <th class="px-4 py-3">作用范围</th>
                <th class="px-4 py-3">结果摘要</th>
                <th class="px-4 py-3">申请人</th>
                <th class="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in approvals" :key="item.id" class="border-b border-amber-topbar-border/70 align-top">
                <td class="px-4 py-3 font-mono">{{ item.id }}</td>
                <td class="px-4 py-3">{{ businessTypeLabel(item.businessType) }}</td>
                <td class="px-4 py-3">{{ item.businessNo || item.businessId }}</td>
                <td class="px-4 py-3">{{ item.status }}</td>
                <td class="max-w-sm px-4 py-3">{{ item.reason || '-' }}</td>
                <td class="max-w-sm px-4 py-3">{{ scopeSummary(item) }}</td>
                <td class="max-w-sm px-4 py-3">{{ item.resultSummary || '-' }}</td>
                <td class="px-4 py-3">{{ item.applicantName || '-' }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-2">
                    <div class="flex gap-2">
                      <button
                        class="yy-action border border-emerald-700 px-3 py-1.5 text-[11px] text-emerald-800 disabled:opacity-50"
                        type="button"
                        :disabled="item.status !== 'PENDING' || actionId === item.id"
                        @click="approve(item.id)"
                      >
                        通过
                      </button>
                      <button
                        class="yy-action border border-red-700 px-3 py-1.5 text-[11px] text-red-800 disabled:opacity-50"
                        type="button"
                        :disabled="item.status !== 'PENDING' || actionId === item.id"
                        @click="reject(item.id)"
                      >
                        驳回
                      </button>
                    </div>
                    <button
                      v-if="buildScheduleGovernanceQuery(item)"
                      class="yy-action w-fit border border-amber-topbar-border px-3 py-1.5 text-[11px]"
                      type="button"
                      @click="goToSchedule(item)"
                    >
                      查看治理结果
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!approvals.length">
                <td class="px-4 py-8 text-amber-text-muted" colspan="9">暂无审批。高风险关档、退款申请和会员充值审批会出现在这里。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { backendApi, type RiskApprovalDto, type RiskApprovalListQuery } from '../../../../shared/api/backend'
import { appStore } from '../../../../shared/stores/appStore'

type ScheduleApprovalPayload = {
  ruleId?: number
  storeId?: number
  serviceGroupId?: number
  beginBizDate?: string
  endBizDate?: string
  startTime?: string
  endTime?: string
  actionType?: string
}

const router = useRouter()

const filters = reactive<RiskApprovalListQuery>({
  status: 'PENDING',
  businessType: '',
  storeId: undefined,
  pageSize: 50,
})

const approvals = ref<RiskApprovalDto[]>([])
const loading = ref(false)
const actionId = ref<RiskApprovalDto['id'] | ''>('')
const decisionRemark = ref('')
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const businessTypeLabel = (type: string) => ({
  SLOT_CLOSE_WITH_PAID_ORDER: '付费时段关档',
  ORDER_REFUND: '订单退款',
  MEMBER_RECHARGE_CONFIRM: '会员充值确认',
}[type] || type)

const normalizeFilters = () => ({
  ...filters,
  storeId: filters.storeId || undefined,
  businessType: filters.businessType || undefined,
  status: filters.status || undefined,
})

const parseApprovalPayload = (item: RiskApprovalDto): ScheduleApprovalPayload | null => {
  if (item.businessType !== 'SLOT_CLOSE_WITH_PAID_ORDER' || !item.payloadJson) return null
  try {
    return JSON.parse(item.payloadJson) as ScheduleApprovalPayload
  } catch {
    return null
  }
}

const scopeSummary = (item: RiskApprovalDto) => {
  const payload = parseApprovalPayload(item)
  if (!payload) return '-'
  const storeName = appStore.stores.find(store => String(store.backendId) === String(payload.storeId))?.name || `门店 #${payload.storeId || '-'}`
  const serviceGroupName = payload.serviceGroupId
    ? appStore.serviceGroups.find(group => String(group.backendId) === String(payload.serviceGroupId))?.name || `服务组 #${payload.serviceGroupId}`
    : '全部服务组'
  const dateRange = payload.beginBizDate && payload.endBizDate
    ? `${payload.beginBizDate} ~ ${payload.endBizDate}`
    : '-'
  const timeRange = payload.startTime && payload.endTime ? `${payload.startTime}-${payload.endTime}` : '-'
  return `${storeName} / ${serviceGroupName} / ${dateRange} / ${timeRange}`
}

const buildScheduleGovernanceQuery = (item: RiskApprovalDto) => {
  const payload = parseApprovalPayload(item)
  if (!payload) return null
  return {
    storeId: payload.storeId ? String(payload.storeId) : '',
    serviceGroupId: payload.serviceGroupId ? String(payload.serviceGroupId) : '',
    beginBizDate: payload.beginBizDate || '',
    endBizDate: payload.endBizDate || '',
    startTime: payload.startTime || '',
    endTime: payload.endTime || '',
    actionType: payload.actionType || 'CLOSE',
    approvalId: String(item.id),
  }
}

const loadApprovals = async () => {
  loading.value = true
  notice.value = ''
  try {
    approvals.value = await backendApi.listRiskApprovals(normalizeFilters())
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '审批列表加载失败'
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await Promise.all([
    appStore.stores.length ? Promise.resolve() : appStore.refreshCoreData(),
    appStore.serviceGroups.length ? Promise.resolve() : appStore.loadServiceGroups(),
  ])
  await loadApprovals()
}

const decide = async (id: RiskApprovalDto['id'], decision: 'approve' | 'reject') => {
  actionId.value = id
  notice.value = ''
  try {
    const payload = { remark: decisionRemark.value.trim() || undefined }
    const result = await (decision === 'approve'
      ? backendApi.approveRiskApproval(id, payload)
      : backendApi.rejectRiskApproval(id, payload))
    noticeType.value = 'success'
    notice.value = result.resultSummary || (decision === 'approve' ? '审批已通过' : '审批已驳回')
    await loadApprovals()
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '审批操作失败'
  } finally {
    actionId.value = ''
  }
}

const approve = (id: RiskApprovalDto['id']) => decide(id, 'approve')
const reject = (id: RiskApprovalDto['id']) => decide(id, 'reject')

const goToSchedule = async (item: RiskApprovalDto) => {
  const query = buildScheduleGovernanceQuery(item)
  if (!query) return
  await router.push({ path: '/merchant/schedule-governance', query })
}

onMounted(() => {
  void refresh()
})
</script>
