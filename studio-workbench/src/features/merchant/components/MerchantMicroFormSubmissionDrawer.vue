<template>
  <div v-if="open" class="fixed inset-0 z-50 flex justify-end bg-black/45 px-0">
    <aside class="flex h-full w-full max-w-[980px] flex-col overflow-hidden bg-[#FBF8F2] shadow-2xl">
      <div class="flex items-center justify-between border-b border-amber-topbar-border px-6 py-5">
        <div>
          <h3 class="text-[16px] font-semibold text-amber-dark">提交数据</h3>
          <p class="mt-1 text-[12px] text-amber-text-muted">{{ form?.formName }} / 页内跟进视图</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emit('view-order-page')">
            前往订单-表单管理
          </button>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emit('close')">
            关闭
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-6 py-4">
        <input
          :value="keyword"
          class="h-9 w-[200px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none"
          placeholder="姓名 / 手机号"
          type="search"
          @input="emit('update:keyword', ($event.target as HTMLInputElement).value.trim())"
          @keydown.enter="emit('load')"
        />
        <select
          :value="followStatus"
          class="h-9 w-[140px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none"
          @change="emit('update:followStatus', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部跟进状态</option>
          <option value="PENDING">待跟进</option>
          <option value="FOLLOWED">已跟进</option>
          <option value="CLOSED">已关闭</option>
        </select>
        <button class="yy-action bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white" type="button" @click="emit('load')">
          搜索
        </button>
      </div>
      <div class="grid flex-1 gap-5 overflow-y-auto p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section class="grid gap-3">
          <div v-if="loading" class="border border-amber-topbar-border bg-white px-4 py-10 text-center text-[12px] text-amber-text-muted">
            提交数据加载中...
          </div>
          <article v-for="item in items" :key="item.id" class="border border-amber-topbar-border bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[14px] font-semibold text-amber-dark">{{ item.customerName || '未填写姓名' }}</div>
                <div class="mt-1 text-[12px] text-amber-text-muted">{{ item.customerPhone || '未填写手机号' }} / {{ item.submittedAt || '-' }}</div>
                <div class="mt-1 text-[12px] text-amber-text-muted">来源 {{ item.sourceCode || '-' }} / 路径 {{ item.sourcePath || '-' }}</div>
                <div v-if="item.duplicateCustomerHint" class="mt-2 text-[12px] text-[#B8543B]">{{ item.duplicateCustomerHint }}</div>
              </div>
              <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark" type="button" @click="emit('select', item.id)">
                跟进
              </button>
            </div>
          </article>
          <div v-if="!loading && !items.length" class="border border-dashed border-amber-topbar-border bg-white px-4 py-10 text-center text-[12px] text-amber-text-muted">
            当前表单还没有匹配的提交数据
          </div>
        </section>

        <section class="grid gap-4">
          <div class="border border-amber-topbar-border bg-white p-4">
            <div class="text-[14px] font-semibold text-amber-dark">跟进处理</div>
            <div v-if="selectedSubmission" class="mt-4 grid gap-3">
              <div class="text-[12px] text-amber-text-muted">{{ selectedSubmission.customerName || '未填写姓名' }} / {{ selectedSubmission.customerPhone || '-' }}</div>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                跟进状态
                <select :value="followDraftStatus" class="yy-input" @change="emit('update:followDraftStatus', ($event.target as HTMLSelectElement).value)">
                  <option value="PENDING">待跟进</option>
                  <option value="FOLLOWED">已跟进</option>
                  <option value="CLOSED">已关闭</option>
                </select>
              </label>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                跟进备注
                <textarea :value="followDraftRemark" class="yy-textarea" @input="emit('update:followDraftRemark', ($event.target as HTMLTextAreaElement).value)" />
              </label>
              <div class="flex justify-end">
                <button class="yy-action bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6]" :disabled="saving" type="button" @click="emit('save')">
                  {{ saving ? '保存中...' : '保存跟进' }}
                </button>
              </div>
            </div>
            <div v-else class="mt-4 text-[12px] text-amber-text-muted">从左侧选择一条提交数据后可在这里跟进。</div>
          </div>

          <div class="border border-amber-topbar-border bg-white p-4">
            <div class="text-[14px] font-semibold text-amber-dark">跟进时间线</div>
            <div v-if="selectedSubmission?.followTimeline?.length" class="mt-3 grid gap-3">
              <div v-for="(item, index) in selectedSubmission.followTimeline" :key="`${item.at}-${index}`" class="border border-amber-topbar-border bg-[#FBF8F2] px-3 py-3 text-[12px] text-amber-dark">
                <div>{{ item.action }} / {{ item.at }}</div>
                <div v-if="item.remark" class="mt-1 text-amber-text-muted">{{ item.remark }}</div>
              </div>
            </div>
            <div v-else class="mt-3 text-[12px] text-amber-text-muted">当前还没有跟进时间线。</div>
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { MicroFormDto, MicroFormSubmissionDto } from '../../../shared/api/backend'

defineProps<{
  open: boolean
  form: MicroFormDto | null
  items: MicroFormSubmissionDto[]
  loading: boolean
  saving: boolean
  keyword: string
  followStatus: string
  selectedSubmission: MicroFormSubmissionDto | null
  followDraftStatus: string
  followDraftRemark: string
}>()

const emit = defineEmits<{
  close: []
  load: []
  save: []
  select: [id: string]
  'view-order-page': []
  'update:keyword': [value: string]
  'update:followStatus': [value: string]
  'update:followDraftStatus': [value: string]
  'update:followDraftRemark': [value: string]
}>()
</script>
