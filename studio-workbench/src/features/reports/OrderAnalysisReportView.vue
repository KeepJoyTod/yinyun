<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />

    <section data-testid="order-analysis-filter" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
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
        <button data-testid="order-analysis-reload" class="yy-action h-9 rounded-xl border border-amber-dark bg-amber-dark px-4 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="reload">
          重新加载
        </button>
      </div>

      <div data-testid="order-analysis-summary" class="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[24px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="error" data-testid="order-analysis-error" class="yy-console-card border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] p-5">
      <div class="text-[12px] font-semibold text-[var(--color-status-danger)]">订购分析加载失败</div>
      <p class="mt-2 text-[10.5px] leading-relaxed text-[var(--color-status-danger)]/80">{{ error }}</p>
      <button class="yy-action mt-4 border border-[var(--color-status-danger)] px-4 py-2 text-[11px] text-[var(--color-status-danger)] hover:bg-white/40" type="button" @click="reload">
        重新加载
      </button>
    </section>

    <section v-else-if="loading" data-testid="order-analysis-loading" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-6 text-[11px] text-amber-text-muted">
      订购分析加载中，正在读取统一订单账本与支付流水。
    </section>

    <section v-else-if="hasData" data-testid="order-analysis-content" class="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
      <div class="space-y-5">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="text-[12px] font-semibold text-amber-dark">订购漏斗</div>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">已下单 -> 已支付 -> 已确认服务 -> 已退款/退款中关注</p>
          </div>
          <div class="yy-console-table overflow-x-auto">
            <table class="w-full min-w-[640px] border-collapse">
              <thead>
                <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">阶段</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">订单数</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">金额</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">转化率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-topbar-border/60">
                <tr v-for="row in funnelRows" :key="row.id">
                  <td class="px-5 py-4 text-[11px] text-amber-dark">{{ row.label }}</td>
                  <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ row.orderCountLabel }}</td>
                  <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ row.amountLabel }}</td>
                  <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ row.conversionLabel }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="text-[12px] font-semibold text-amber-dark">渠道拆分</div>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">按 `channelType` 优先、缺失时回退 `source`。</p>
          </div>
          <div class="yy-console-table overflow-x-auto">
            <table class="w-full min-w-[720px] border-collapse">
              <thead>
                <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">渠道</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">订购单量</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">已支付收入</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">退款金额</th>
                  <th class="px-5 py-3 text-[11px] text-amber-text-muted">待关注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-topbar-border/60">
                <tr v-for="row in channelRows" :key="row.id">
                  <td class="px-5 py-4 text-[11px] text-amber-dark">{{ row.channelLabel }}</td>
                  <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ row.orderCountLabel }}</td>
                  <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ row.paidAmountLabel }}</td>
                  <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ row.refundAmountLabel }}</td>
                  <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ row.pendingCountLabel }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <aside class="space-y-5">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="text-[12px] font-semibold text-amber-dark">退款拆分</div>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">退款状态只反映账本事实，不代表第三方退款已闭环。</p>
          </div>
          <div class="space-y-3 p-5">
            <div v-for="row in refundRows" :key="row.id" class="rounded-2xl border border-amber-topbar-border bg-white/70 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-[11px] font-semibold text-amber-dark">{{ row.refundStatus }}</div>
                  <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ row.note }}</div>
                </div>
                <span class="font-mono text-[10px] text-amber-text-muted">{{ row.orderCountLabel }}</span>
              </div>
              <div class="mt-4 font-mono text-[12px] text-amber-dark">{{ row.refundAmountLabel }}</div>
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
          <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ data.overview.boundaryNote }}</p>
        </article>
      </aside>
    </section>

    <section v-else data-testid="order-analysis-empty" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="text-[13px] font-semibold text-amber-dark">当前没有订购分析数据</div>
      <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">
        当前范围内未发现订购、支付或退款记录，页面不会伪造指标。后续有真实 `yy_order` / `yy_payment_record` 数据后再展示漏斗、渠道和退款拆分。
      </p>
      <div class="mt-5 border border-amber-topbar-border bg-white/60 p-4 text-[10.5px] leading-relaxed text-amber-text-muted">
        数据边界：{{ data.overview.boundaryNote }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { orderAnalysisScaffold } from './reportScaffolds'
import { useOrderAnalysisReport } from './composables/useOrderAnalysisReport'
import {
  buildOrderAnalysisChannelRows,
  buildOrderAnalysisFunnelRows,
  buildOrderAnalysisRefundRows,
  buildOrderAnalysisSummaryCards,
} from './orderAnalysisReportOperations'

const scaffold = useModuleScaffold(orderAnalysisScaffold)
const {
  selectedStoreId,
  dateStart,
  dateEnd,
  loading,
  error,
  data,
  storeOptions,
  hasData,
  reload,
} = useOrderAnalysisReport()

const summaryCards = computed(() => buildOrderAnalysisSummaryCards(data.value.overview))
const funnelRows = computed(() => buildOrderAnalysisFunnelRows(data.value.funnel))
const channelRows = computed(() => buildOrderAnalysisChannelRows(data.value.channels))
const refundRows = computed(() => buildOrderAnalysisRefundRows(data.value.refunds))

onMounted(reload)
</script>
