<template>
  <section class="space-y-6 px-6 py-6">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">订单 / 批量开卡</p>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold text-slate-900">批量新建卡项订单脚手架</h1>
          <p class="max-w-3xl text-sm leading-6 text-slate-600">
            先把批量开卡申请统一挂到高风险审批账本，沉淀门店、卡项、批次、金额和执行说明，
            后续再接真实批量订单生成、权益发放、失败回滚和审计闭环。
          </p>
        </div>
        <button
          class="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          :disabled="loading || saving"
          @click="load"
        >
          {{ loading ? '加载中...' : '刷新申请单' }}
        </button>
      </div>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">{{ card.label }}</p>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ card.hint }}</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-900">新建批量开卡申请</h2>
          <p class="text-sm text-slate-600">创建后只会写入审批账本，不直接生成真实订单或权益。</p>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-700">
            <span>门店 ID</span>
            <input v-model="draft.storeId" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="例如 1001" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>申请标题</span>
            <input v-model="draft.batchTitle" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="例如 夏季会员回流开卡" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>卡项名称</span>
            <input v-model="draft.cardName" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="例如 399 次卡" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>卡项类型</span>
            <select v-model="draft.cardType" class="h-10 w-full rounded-md border border-slate-200 px-3">
              <option value="TIMES_CARD">次卡</option>
              <option value="STORED_VALUE_CARD">储值卡</option>
              <option value="BENEFIT_CARD">权益卡</option>
              <option value="SHARED_CARD">共享卡</option>
            </select>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>批量数量</span>
            <input v-model="draft.batchCount" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="20" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>目标客户数</span>
            <input v-model="draft.targetCustomerCount" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="20" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>单价（元）</span>
            <input v-model="draft.unitPriceYuan" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="299" />
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span>目标人群</span>
            <input v-model="draft.targetAudience" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="老会员复购" />
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>执行策略</span>
            <input v-model="draft.channelPolicy" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="审批通过后由店员线下确认发放" />
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>申请原因</span>
            <textarea v-model="draft.reason" rows="3" class="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="说明业务背景、风险点和审批原因" />
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>备注</span>
            <textarea v-model="draft.remark" rows="2" class="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="补充批次名单来源、人工执行说明或边界" />
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            :disabled="saving"
            @click="createCardBatchOrder"
          >
            {{ saving ? '提交中...' : '提交审批申请' }}
          </button>
          <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>
          <p v-else-if="successMessage" class="text-sm text-emerald-600">{{ successMessage }}</p>
        </div>
      </article>

      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-900">执行边界</h2>
          <p class="text-sm text-slate-600">这页只解决“谁申请、申请什么、何时审批”的脚手架问题。</p>
        </div>
        <ul class="space-y-3 text-sm leading-6 text-slate-600">
          <li>真实批量订单、批量发卡、余额扣减、权益到账暂未执行。</li>
          <li>审批通过后仅代表允许后续人工执行，不代表系统已经自动开卡。</li>
          <li>所有申请都复用 `yy_risk_approval`，不新增第二套批量卡项订单账本。</li>
          <li>后续闭环要补真实卡项实例、订单写链路、失败回滚和操作审计详情。</li>
        </ul>
      </article>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div class="grid gap-3 md:grid-cols-4">
        <label class="space-y-2 text-sm text-slate-700">
          <span>门店 ID</span>
          <input v-model="filters.storeId" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>状态</span>
          <select v-model="filters.status" class="h-10 w-full rounded-md border border-slate-200 px-3">
            <option value="">全部状态</option>
            <option value="PENDING">待审批</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已驳回</option>
          </select>
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>关键字</span>
          <input v-model="filters.keyword" class="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="标题 / 申请号 / 原因" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>数量</span>
          <input v-model="filters.limit" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
      </div>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">最近申请</h2>
          <p class="text-sm text-slate-600">统一查看批量开卡申请、审批状态和预估金额。</p>
        </div>
        <span class="text-sm text-slate-500">共 {{ orders.length }} 条</span>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="pb-2">申请号</th>
              <th class="pb-2">卡项</th>
              <th class="pb-2">批次</th>
              <th class="pb-2">金额</th>
              <th class="pb-2">状态</th>
              <th class="pb-2">申请人</th>
              <th class="pb-2">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orders" :key="item.id" class="border-t border-slate-100 align-top">
              <td class="py-3 font-medium text-slate-900">
                <div>{{ item.batchNo }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.title }}</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ item.cardName }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.cardType }}</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ item.batchCount }} 份</div>
                <div class="mt-1 text-xs text-slate-500">目标 {{ item.targetCustomerCount }} 人</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ formatAmountCent(item.estimatedTotalCent) }}</div>
                <div class="mt-1 text-xs text-slate-500">单价 {{ formatAmountCent(item.unitPriceCent) }}</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ item.status }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.resultSummary || item.channelPolicy }}</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ item.applicantName || '-' }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.approverName || '待审批' }}</div>
              </td>
              <td class="py-3 text-slate-600">
                <div>{{ item.createTime || '-' }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.approveTime || '未审批' }}</div>
              </td>
            </tr>
            <tr v-if="!orders.length">
              <td colspan="7" class="py-8 text-center text-sm text-slate-500">当前没有批量开卡申请，先创建一条审批草稿。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { formatAmountCent } from './orderCardBatchScaffold'
import { useOrderCardBatch } from './useOrderCardBatch'

const {
  loading,
  saving,
  errorMessage,
  successMessage,
  filters,
  draft,
  orders,
  summaryCards,
  load,
  createCardBatchOrder,
} = useOrderCardBatch()

onMounted(() => {
  void load()
})
</script>
