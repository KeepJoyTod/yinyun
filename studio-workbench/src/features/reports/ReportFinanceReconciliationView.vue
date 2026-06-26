<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />

    <section data-testid="report-finance-filter" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex flex-wrap items-end gap-3 border-b border-amber-topbar-border p-5">
        <label class="flex flex-col gap-1 text-[10.5px] text-amber-text-muted">
          门店范围
          <select v-model="selectedStoreId" class="h-9 min-w-[220px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
            <option v-for="option in storeOptions" :key="option.value || 'all'" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-[10.5px] text-amber-text-muted">
          开始日期
          <input v-model="dateStart" class="h-9 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="date" />
        </label>
        <label class="flex flex-col gap-1 text-[10.5px] text-amber-text-muted">
          结束日期
          <input v-model="dateEnd" class="h-9 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="date" />
        </label>
        <button data-testid="report-finance-reload" class="yy-action h-9 border border-amber-dark bg-amber-dark px-4 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="reload">
          重新加载
        </button>
        <button data-testid="report-finance-export" class="yy-action h-9 border border-amber-topbar-border bg-white px-4 text-[11px] text-amber-dark hover:border-amber-dark" type="button" :disabled="exporting" @click="createExportTask">
          {{ exporting ? '创建中...' : '异步导出' }}
        </button>
      </div>

      <div data-testid="report-finance-summary" class="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 min-h-[32px] text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[22px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="error" data-testid="report-finance-error" class="yy-console-card border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] p-5">
      <div class="text-[12px] font-semibold text-[var(--color-status-danger)]">财务对账报表加载失败</div>
      <p class="mt-2 text-[10.5px] leading-relaxed text-[var(--color-status-danger)]/80">{{ error }}</p>
    </section>

    <section v-if="exportMessage" data-testid="report-finance-export-message" class="yy-console-card border border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)] p-4 text-[11px] text-[var(--color-status-success)]">
      {{ exportMessage }}
    </section>

    <section v-if="loading" data-testid="report-finance-loading" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-6 text-[11px] text-amber-text-muted">
      财务对账加载中，正在读取 `yy_order`、`yy_payment_record`、储值、提现、组合支付和权益预占账本。
    </section>

    <section v-else-if="hasData" data-testid="report-finance-content" class="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
      <div class="space-y-5">
        <LedgerTable title="订单视角" description="订单应收、订单实付和订单退款口径。" :rows="orderLedgerRows" />
        <LedgerTable title="资金流水视角" description="支付、储值、提现、优惠减免等资金侧口径。" :rows="fundLedgerRows" />
      </div>

      <aside class="space-y-5">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="text-[12px] font-semibold text-amber-dark">差异与待关注</div>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">用于验收前定位订单与资金流水不一致的条目。</p>
          </div>
          <div class="space-y-3 p-5">
            <div v-for="row in differenceRows" :key="row.id" class="border border-amber-topbar-border bg-white/70 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-[11px] font-semibold text-amber-dark">{{ row.label }}</div>
                  <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ row.note }}</div>
                </div>
                <span class="font-mono text-[10px] text-amber-text-muted">{{ row.severity }}</span>
              </div>
              <div class="mt-4 flex items-center justify-between gap-3 font-mono text-[10.5px] text-amber-dark">
                <span>{{ row.amountLabel }}</span>
                <span>{{ row.recordCountLabel }}</span>
              </div>
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="text-[12px] font-semibold text-amber-dark">导出任务</div>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">异步导出任务状态、下载鉴权和过期时间。</p>
          </div>
          <div data-testid="report-finance-export-tasks" class="space-y-3 p-5">
            <div v-if="!exportTaskRows.length" class="text-[10.5px] text-amber-text-muted">暂无导出任务。</div>
            <div v-for="task in exportTaskRows" :key="task.id" class="border border-amber-topbar-border bg-white/70 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-mono text-[11px] font-semibold text-amber-dark">{{ task.id }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ task.range }}</div>
                </div>
                <span class="font-mono text-[10px] text-amber-text-muted">{{ task.status }}</span>
              </div>
              <div class="mt-3 grid grid-cols-1 gap-2 text-[10px] text-amber-text-muted sm:grid-cols-2">
                <span>创建：{{ task.createdTime }}</span>
                <span>过期：{{ task.expireTime }}</span>
              </div>
              <div class="mt-3 text-[10px] text-amber-text-muted">{{ task.downloadUrl || task.auditNote }}</div>
              <div v-if="task.errorMessage" class="mt-2 text-[10px] text-[var(--color-status-danger)]">{{ task.errorMessage }}</div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10px] text-amber-dark disabled:opacity-50"
                  type="button"
                  :disabled="task.status !== 'COMPLETED' || downloadingTaskId === task.id"
                  @click="downloadTask(task.id, task.fileName || `${task.id}.csv`)"
                >
                  {{ downloadingTaskId === task.id ? '下载中...' : '下载文件' }}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
          <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            {{ data.overview.boundaryNote }} 关键表：yy_order、yy_payment_record、yy_member_balance_ledger、yy_stored_value_consume_order、yy_member_withdraw_order、yy_composite_payment_order、yy_entitlement_reservation。
          </p>
        </article>
      </aside>
    </section>

    <section v-else data-testid="report-finance-empty" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="text-[13px] font-semibold text-amber-dark">当前没有财务对账数据</div>
      <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">
        当前范围内未发现订单、支付、储值、提现或权益预占记录。页面保持真实空态，不伪造财务指标。
      </p>
      <div class="mt-5 border border-amber-topbar-border bg-white/60 p-4 text-[10.5px] leading-relaxed text-amber-text-muted">
        {{ data.overview.boundaryNote }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, type PropType } from 'vue'
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { reportFinanceReconciliationScaffold } from './reportScaffolds'
import { useReportFinanceReconciliation } from './composables/useReportFinanceReconciliation'
import {
  buildFinanceDifferenceRows,
  buildFinanceExportTaskRows,
  buildFinanceLedgerRows,
  buildFinanceSummaryCards,
  type FinanceLedgerRow,
} from './reportFinanceReconciliationOperations'

const LedgerTable = defineComponent({
  name: 'LedgerTable',
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rows: { type: Array as PropType<FinanceLedgerRow[]>, required: true },
  },
  setup(props) {
    return () => h('article', { class: 'yy-console-card border border-amber-topbar-border bg-amber-content-bg' }, [
      h('div', { class: 'border-b border-amber-topbar-border px-5 py-4' }, [
        h('div', { class: 'text-[12px] font-semibold text-amber-dark' }, props.title),
        h('p', { class: 'mt-1 text-[10.5px] text-amber-text-muted' }, props.description),
      ]),
      h('div', { class: 'yy-console-table overflow-x-auto' }, [
        h('table', { class: 'w-full min-w-[760px] border-collapse' }, [
          h('thead', [
            h('tr', { class: 'border-b border-amber-topbar-border bg-amber-bg/10 text-left' }, [
              h('th', { class: 'px-5 py-3 text-[11px] text-amber-text-muted' }, '口径'),
              h('th', { class: 'px-5 py-3 text-[11px] text-amber-text-muted' }, '记录数'),
              h('th', { class: 'px-5 py-3 text-[11px] text-amber-text-muted' }, '金额'),
              h('th', { class: 'px-5 py-3 text-[11px] text-amber-text-muted' }, '逆向/退款'),
              h('th', { class: 'px-5 py-3 text-[11px] text-amber-text-muted' }, '来源'),
            ]),
          ]),
          h('tbody', { class: 'divide-y divide-amber-topbar-border/60' }, props.rows.map(row =>
            h('tr', { key: row.id }, [
              h('td', { class: 'px-5 py-4' }, [
                h('div', { class: 'text-[11px] text-amber-dark' }, row.label),
                h('div', { class: 'mt-1 text-[10px] text-amber-text-muted' }, row.statusSummary),
              ]),
              h('td', { class: 'px-5 py-4 font-mono text-[10.5px] text-amber-dark' }, row.recordCountLabel),
              h('td', { class: 'px-5 py-4 font-mono text-[10.5px] text-amber-dark' }, row.amountLabel),
              h('td', { class: 'px-5 py-4 font-mono text-[10.5px] text-amber-dark' }, row.refundAmountLabel),
              h('td', { class: 'px-5 py-4 font-mono text-[10px] text-amber-text-muted' }, row.sourceTable),
            ]),
          )),
        ]),
      ]),
    ])
  },
})

const scaffold = useModuleScaffold(reportFinanceReconciliationScaffold)
const {
  selectedStoreId,
  dateStart,
  dateEnd,
  loading,
  exporting,
  downloadingTaskId,
  error,
  exportMessage,
  data,
  storeOptions,
  hasData,
  reload,
  createExportTask,
  downloadTask,
} = useReportFinanceReconciliation()

const summaryCards = computed(() => buildFinanceSummaryCards(data.value.overview))
const orderLedgerRows = computed(() => buildFinanceLedgerRows(data.value.orderLedgers))
const fundLedgerRows = computed(() => buildFinanceLedgerRows(data.value.fundLedgers))
const differenceRows = computed(() => buildFinanceDifferenceRows(data.value.differences))
const exportTaskRows = computed(() => buildFinanceExportTaskRows(data.value.exportTasks))

onMounted(reload)
</script>
