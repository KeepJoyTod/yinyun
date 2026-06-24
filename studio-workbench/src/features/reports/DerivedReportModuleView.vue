<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">{{ module.eyebrow }}</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">{{ module.title }}</h2>
          <p class="mt-2 max-w-[820px] text-[13.5px] leading-relaxed text-amber-text-muted">{{ module.description }}</p>
        </div>
        <button
          class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black"
          type="button"
          @click="router.push(primaryPath)"
        >
          {{ primaryLabel }}
        </button>
      </div>
    </section>

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="flex flex-wrap items-center gap-2 border-b border-amber-topbar-border p-5">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action border px-3 py-1.5 text-[10.5px]"
          :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }} · {{ filter.count }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[25px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="min-w-0 yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
            <select v-model="sourceFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
              <option value="all">全部范围</option>
              <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="h-8 w-[270px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索门店、员工、产品、渠道"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">展示 {{ filteredItems.length }} 条</div>
        </div>

        <div v-if="filteredItems.length" class="yy-console-table overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">统计对象</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">范围</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">核心指标</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">辅助指标</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">动作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedItem?.id === item.id ? 'bg-[#FBF8F2]' : ''"
                @click="selectedItem = item"
              >
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ item.title }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.subtitle }}</div>
                </td>
                <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ item.sourceLabel }}</td>
                <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ item.metricLabel }}</td>
                <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ item.secondaryLabel }}</td>
                <td class="px-5 py-4">
                  <span class="px-2 py-0.5 text-[10px]" :class="stageClass(item.stage)">{{ item.stage }}</span>
                </td>
                <td class="px-5 py-4">
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click.stop="openItem(item)">
                    {{ item.actionLabel }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <template v-if="module.source === 'reviews'">
            <div class="yy-console-card border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] p-6 text-left">
              <div class="text-[12px] font-semibold text-[var(--color-status-danger)]">{{ module.emptyTitle }}</div>
              <p class="mt-2 text-[10.5px] leading-relaxed text-[var(--color-status-danger)]/70">{{ module.emptyHint }}</p>
              <div class="mt-4 border border-[var(--color-status-danger-border)] bg-white/50 p-4">
                <div class="text-[10.5px] font-semibold text-[var(--color-status-danger)]">后续接口规划</div>
                <ul class="mt-2 space-y-1.5 font-mono text-[10px] text-[var(--color-status-danger)]/70">
                  <li>GET /yy/customerReview/list</li>
                  <li>GET /yy/channelReview/list</li>
                </ul>
                <p class="mt-3 text-[10px] leading-relaxed text-[var(--color-status-danger)]/60">接入上述任一接口后，页面将展示真实客户评价和渠道评分，不再保持空态。</p>
              </div>
            </div>
          </template>
          <template v-else-if="hasAnySourceItems && (activeFilter !== 'all' || sourceFilter !== 'all' || searchQuery)">
            <div class="font-sans text-[14px] text-amber-dark">当前筛选无结果</div>
            <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">数据存在但不匹配当前筛选条件，可以调整筛选或搜索条件。</p>
            <button
              class="yy-action mt-4 border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-black/5"
              type="button"
              @click="resetFilters"
            >
              清空筛选
            </button>
          </template>
          <template v-else>
            <div class="font-sans text-[14px] text-amber-dark">{{ module.emptyTitle }}</div>
            <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">{{ module.emptyHint }}</p>
          </template>
        </div>
      </div>

      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Report Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">{{ module.title }}详情</h3>
        </div>
        <div v-if="selectedItem" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedItem.title }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedItem.subtitle }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-amber-content-bg px-2 py-1 text-[10px] text-amber-dark">{{ selectedItem.stage }}</span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Metric</dt>
              <dd class="mt-1 font-mono text-[10.5px] text-amber-dark">{{ selectedItem.metricLabel }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Detail</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.ruleHint }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
            </div>
          </dl>

          <button class="yy-action mt-6 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="openItem(selectedItem)">
            {{ selectedItem.actionLabel }}
          </button>

          <div class="mt-5 border border-amber-topbar-border bg-amber-content-bg p-4">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.boundary }}</p>
          </div>
        </div>
        <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
          <p>当前报表没有可展示记录，页面不会使用虚构指标填充。</p>
          <div class="mt-5 border border-amber-topbar-border bg-amber-content-bg p-4 text-left">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              空态仍显示边界：{{ emptyBoundary }}
            </p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import { buildSnapshotAwareReportItems, getDerivedReportModule, type DerivedReportItem, type DerivedReportStage } from './derivedReportModules'

const moduleLabelExamples = '门店业绩日报 门店业绩月报 服务产品统计 员工业绩统计 修图量统计 收支统计 客户分析 客户评价 渠道收入统计 订单转化分析'
void moduleLabelExamples

type QuickFilter = 'all' | 'normal' | 'action'

const route = useRoute()
const router = useRouter()
const activeFilter = ref<QuickFilter>('all')
const sourceFilter = ref('all')
const searchQuery = ref('')
const selectedItem = ref<DerivedReportItem | null>(null)

const module = computed(() => getDerivedReportModule(String(route.meta.featureKey || route.name || 'report-store-daily')))
const items = computed(() => buildSnapshotAwareReportItems(module.value, {
  orders: appStore.reportOrders,
  customers: appStore.customers,
  employees: appStore.employees,
  albums: appStore.albums,
  snapshots: appStore.reportSnapshots,
}))
const normalItems = computed(() => items.value.filter(item => item.stage === '正常'))
const actionItems = computed(() => items.value.filter(item => item.stage === '待关注'))
const sourceOptions = computed(() => Array.from(new Set(items.value.map(item => item.sourceLabel).filter(Boolean))))
const hasAnySourceItems = computed(() => items.value.length > 0)
const primaryPath = computed(() => {
  if (module.value.source === 'employees') return '/settings/employees'
  if (module.value.source === 'retouch') return '/service/photos'
  if (module.value.source === 'customers' || module.value.source === 'reviews') return '/member/customers'
  return '/order/appointment'
})
const primaryLabel = computed(() => {
  if (module.value.source === 'employees') return '打开员工管理'
  if (module.value.source === 'retouch') return '打开客片管理'
  if (module.value.source === 'customers' || module.value.source === 'reviews') return '打开客户档案'
  return '打开统一订单'
})
const emptyBoundary = computed(() => {
  if (module.value.source === 'reviews') return '客户评价没有正式评价表或渠道评价 API 时保持空态，不伪造评分。'
  if (module.value.source === 'employees') return '员工业绩只读取 yy_employee 和相册归属，不伪造销售与提成。'
  if (module.value.source === 'retouch') return '修图量只读取 yy_photo_album 与 yy_photo_asset。'
  if (module.value.source === 'customers') return '客户分析只读取 yy_customer。'
  return '报表优先读取 yy_report_snapshot；无快照时实时读取 yy_order 聚合，不写第二套财务账本。'
})

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => {
    if (activeFilter.value === 'normal' && item.stage !== '正常') return false
    if (activeFilter.value === 'action' && item.stage !== '待关注') return false
    if (sourceFilter.value !== 'all' && item.sourceLabel !== sourceFilter.value) return false
    if (!query) return true
    const haystack = `${item.title} ${item.subtitle} ${item.metricLabel} ${item.secondaryLabel} ${item.ruleHint} ${item.sourceLabel}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: items.value.length },
  { key: 'normal' as const, label: '正常', count: normalItems.value.length },
  { key: 'action' as const, label: '待关注', count: actionItems.value.length },
])

const cards = computed(() => [
  { label: module.value.title, value: String(items.value.length), hint: '当前报表匹配到的聚合对象或业务节点数量。', scope: module.value.source },
  { label: '正常', value: String(normalItems.value.length), hint: '当前聚合结果无需优先处理的记录。', scope: 'NORMAL' },
  { label: '待关注', value: String(actionItems.value.length), hint: '存在待支付、待确认、未交付或低转化的记录。', scope: '处理' },
  { label: '数据来源', value: module.value.source === 'customers' ? '客户' : module.value.source === 'employees' ? '员工' : module.value.source === 'retouch' ? '相册' : '订单', hint: emptyBoundary.value, scope: '边界' },
])

const openItem = (item: DerivedReportItem) => {
  router.push(item.actionPath)
}

const resetFilters = () => {
  activeFilter.value = 'all'
  sourceFilter.value = 'all'
  searchQuery.value = ''
}

const stageClass = (stage: DerivedReportStage) => {
  if (stage === '正常') return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (stage === '无数据') return 'border border-[var(--color-status-neutral-border)] bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'
  return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
}

const loadModuleData = async () => {
  await appStore.ensureReportDataLoaded(module.value.source)
}

onMounted(loadModuleData)

watch(
  [filteredItems, module],
  ([nextItems]) => {
    if (!nextItems.some(item => item.id === selectedItem.value?.id)) selectedItem.value = nextItems[0] ?? null
  },
  { immediate: true },
)

watch(module, () => {
  resetFilters()
  void loadModuleData()
})
</script>
