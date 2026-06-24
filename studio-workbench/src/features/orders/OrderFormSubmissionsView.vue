<template>
  <div class="flex flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="yy-eyebrow text-amber-text-muted">Form Submissions</span>
          <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">表单管理</h2>
          <p class="mt-1 max-w-[820px] text-[11px] leading-relaxed text-amber-text-muted">
            这里展示顾客通过公开微表单提交的真实数据，可按表单、客户和跟进状态筛选，并直接更新跟进结果。
          </p>
        </div>
        <button class="yy-action inline-flex items-center gap-2 bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6]" type="button" @click="goMicroForms">
          <FileText :size="14" />
          微表单管理
        </button>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
        <input v-model.trim="filters.formId" class="h-9 w-[180px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none" placeholder="表单 ID" type="text" />
        <input v-model.trim="filters.keyword" class="h-9 w-[220px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none" placeholder="客户姓名 / 手机号" type="search" @keydown.enter="loadRows" />
        <select v-model="filters.followStatus" class="h-9 w-[132px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none">
          <option value="">全部状态</option>
          <option value="PENDING">待跟进</option>
          <option value="FOLLOWED">已跟进</option>
          <option value="CLOSED">已关闭</option>
        </select>
        <button class="yy-action inline-flex items-center gap-2 bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white" type="button" @click="loadRows">
          <Search :size="14" />
          搜索
        </button>
        <button class="yy-action inline-flex items-center gap-2 border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted" type="button" @click="reset">
          <RotateCcw :size="14" />
          重置
        </button>
        <button class="yy-action inline-flex items-center gap-2 border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-dark" type="button" @click="exportRows">
          <Download :size="14" />
          导出
        </button>
      </div>

      <NoticeBar :notice="notice" />

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1080px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-[#F4EFE6]/70 text-left text-[12px] text-amber-text-muted">
              <th class="px-5 py-3 font-semibold">表单名称</th>
              <th class="px-5 py-3 font-semibold">客户</th>
              <th class="px-5 py-3 font-semibold">提交时间</th>
              <th class="px-5 py-3 font-semibold">跟进状态</th>
              <th class="px-5 py-3 font-semibold">备注</th>
              <th class="px-5 py-3 font-semibold">回答摘要</th>
              <th class="px-5 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/55">
            <tr v-for="row in rows" :key="row.id" class="text-[12px] text-amber-dark">
              <td class="px-5 py-4">
                <div class="font-medium">{{ row.formNameSnapshot }}</div>
                <div class="mt-1 font-mono text-[10px] text-amber-text-muted">#{{ row.formId }}</div>
              </td>
              <td class="px-5 py-4">
                <div>{{ row.customerName || '未填写姓名' }}</div>
                <div class="mt-1 font-mono text-[11px] text-amber-text-muted">{{ maskPhone(row.customerPhone) || '未填写手机号' }}</div>
              </td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-text-muted">{{ row.submittedAt || '-' }}</td>
              <td class="px-5 py-4">
                <select class="h-8 border border-amber-topbar-border bg-white px-2 text-[12px] text-amber-dark outline-none" :value="row.followStatus" @change="event => updateFollowStatus(row, event)">
                  <option value="PENDING">待跟进</option>
                  <option value="FOLLOWED">已跟进</option>
                  <option value="CLOSED">已关闭</option>
                </select>
              </td>
              <td class="px-5 py-4">
                <textarea
                  class="h-20 w-[220px] resize-none border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark outline-none"
                  :value="row.followRemark"
                  placeholder="填写跟进备注"
                  @change="event => updateFollowRemark(row, event)"
                />
              </td>
              <td class="px-5 py-4">
                <div class="max-w-[260px] text-[11px] leading-relaxed text-amber-text-muted">
                  {{ answerSummary(row.answers) || '-' }}
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="flex flex-col gap-2">
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="openOrder(row)">
                    {{ row.orderId ? '打开订单' : '去订单跟进' }}
                  </button>
                  <button
                    v-if="!row.orderId"
                    class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
                    type="button"
                    @click="convertSubmissionToBooking(row)"
                  >
                    转预约
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!rows.length" class="px-6 py-12 text-center">
        <div class="text-[14px] font-semibold text-amber-dark">{{ loading ? '加载中...' : '暂无表单提交数据' }}</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">从微表单管理创建并推广公开链接后，顾客提交的数据会出现在这里。</p>
      </div>

      <div class="border-t border-amber-topbar-border px-5 py-3 text-[11px] text-amber-text-muted">
        展示 {{ rows.length }} 条，真实提交总数 {{ total }} 条。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Download, FileText, RotateCcw, Search } from 'lucide-vue-next'
import { useNotice } from '../../shared/composables/useNotice'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { backendApi, type MicroFormSubmissionDto } from '../../shared/api/backend'

const route = useRoute()
const router = useRouter()
const { notice, pushNotice } = useNotice()

const rows = ref<MicroFormSubmissionDto[]>([])
const loading = ref(false)
const total = ref(0)
const filters = reactive({
  formId: String(route.query.formId || ''),
  keyword: '',
  followStatus: '',
})

const query = () => ({
  formId: filters.formId || undefined,
  customerName: filters.keyword && !/^\d+$/.test(filters.keyword) ? filters.keyword : undefined,
  customerPhone: filters.keyword && /^\d+$/.test(filters.keyword) ? filters.keyword : undefined,
  followStatus: filters.followStatus || undefined,
  pageSize: 100,
})

const loadRows = async () => {
  loading.value = true
  try {
    const page = await backendApi.listMicroFormSubmissions(query())
    rows.value = page.items
    total.value = page.total
  } catch (error) {
    rows.value = []
    total.value = 0
    pushNotice('error', error instanceof Error ? `提交数据加载失败：${error.message}` : '提交数据加载失败')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  filters.formId = ''
  filters.keyword = ''
  filters.followStatus = ''
  void loadRows()
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const exportRows = async () => {
  try {
    const result = await backendApi.exportMicroFormSubmissions(query())
    downloadBlob(result.blob, result.fileName || 'micro-form-submissions.xlsx')
    pushNotice('success', '表单提交数据导出已开始')
  } catch (error) {
    pushNotice('error', error instanceof Error ? `导出失败：${error.message}` : '导出失败')
  }
}

const updateFollow = async (row: MicroFormSubmissionDto, nextStatus: string, nextRemark: string) => {
  try {
    await backendApi.updateMicroFormSubmissionFollow({
      id: row.id,
      followStatus: nextStatus,
      followRemark: nextRemark,
      orderId: row.orderId,
    })
    row.followStatus = nextStatus
    row.followRemark = nextRemark
    pushNotice('success', '跟进信息已更新')
  } catch (error) {
    pushNotice('error', error instanceof Error ? `更新失败：${error.message}` : '更新失败')
  }
}

const updateFollowStatus = (row: MicroFormSubmissionDto, event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  void updateFollow(row, value, row.followRemark)
}

const updateFollowRemark = (row: MicroFormSubmissionDto, event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value.trim()
  void updateFollow(row, row.followStatus, value)
}

const answerSummary = (answers: Record<string, unknown>) =>
  Object.entries(answers)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('/') : String(value ?? '')}`)
    .join('；')

const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

const openOrder = (row: MicroFormSubmissionDto) => {
  if (row.orderId) {
    router.push({ path: '/order/appointment', query: { q: String(row.orderId) } })
    return
  }
  router.push({ path: '/order/appointment', query: { q: row.customerPhone || row.customerName } })
}

const convertSubmissionToBooking = (row: MicroFormSubmissionDto) => {
  router.push({
    path: '/order/staff-booking',
    query: {
      fromSubmissionId: row.id,
      scheduleMode: 'UNDECIDED',
    },
  })
}

const goMicroForms = () => {
  router.push('/merchant/micro-forms')
}

watch(
  () => route.query.formId,
  value => {
    filters.formId = String(value || '')
    void loadRows()
  },
)

onMounted(loadRows)
</script>
