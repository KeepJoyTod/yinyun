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
          @click="router.push('/member/customers')"
        >
          打开客户档案
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
              <option value="all">全部来源</option>
              <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="h-8 w-[270px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索客户、手机号、标签、订单"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">展示 {{ filteredItems.length }} 条</div>
        </div>

        <div v-if="filteredItems.length" class="yy-console-table overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">客户 / 对象</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">来源</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">金额 / 人数</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">规则</th>
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
                <td class="px-5 py-4">
                  <div class="max-w-[320px] text-[10px] leading-relaxed text-amber-text-muted">{{ item.ruleHint }}</div>
                </td>
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
          <div class="font-sans text-[14px] text-amber-dark">{{ module.emptyTitle }}</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">{{ module.emptyHint }}</p>
          <button
            v-if="activeFilter !== 'all' || sourceFilter !== 'all' || searchQuery"
            class="yy-action mt-4 border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-black/5"
            type="button"
            @click="resetFilters"
          >
            清空筛选
          </button>
        </div>
      </div>

      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Member Detail</span>
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
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Rule</dt>
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
          <p>选择一条记录后查看会员分层、消费来源和下一步跟进建议。</p>
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
import { buildDerivedMemberItems, getDerivedMemberModule, type DerivedMemberItem, type DerivedMemberStage } from './derivedMemberModules'

const moduleLabelExamples = '会员账户 客户标签 消费记录'
void moduleLabelExamples

type QuickFilter = 'all' | 'ready' | 'action' | 'refund'

const route = useRoute()
const router = useRouter()
const activeFilter = ref<QuickFilter>('all')
const sourceFilter = ref('all')
const searchQuery = ref('')
const selectedItem = ref<DerivedMemberItem | null>(null)

const module = computed(() => getDerivedMemberModule(String(route.meta.featureKey || route.name || 'member-accounts')))
const items = computed(() => buildDerivedMemberItems(module.value, appStore.customers, appStore.reportOrders))
const readyItems = computed(() => items.value.filter(item => ['高价值', '活跃标签', '已入账'].includes(item.stage)))
const actionItems = computed(() => items.value.filter(item => ['普通', '新客', '低频标签', '待支付'].includes(item.stage)))
const refundItems = computed(() => items.value.filter(item => item.stage === '已退款'))
const sourceOptions = computed(() => Array.from(new Set(items.value.map(item => item.sourceLabel).filter(Boolean))))
const emptyBoundary = computed(() =>
  module.value.source === 'consumption'
    ? '消费记录只读取 yy_order，不复制外部渠道或会员消费账本。'
    : module.value.source === 'tags'
      ? '客户标签只读取 yy_customer.tags，不在工作台创建第二套标签账本。'
      : '会员账户只从 yy_customer 与 yy_order 派生，暂不维护积分、余额或卡项账本。',
)

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => {
    if (activeFilter.value === 'ready' && !['高价值', '活跃标签', '已入账'].includes(item.stage)) return false
    if (activeFilter.value === 'action' && !['普通', '新客', '低频标签', '待支付'].includes(item.stage)) return false
    if (activeFilter.value === 'refund' && item.stage !== '已退款') return false
    if (sourceFilter.value !== 'all' && item.sourceLabel !== sourceFilter.value) return false
    if (!query) return true
    const haystack = `${item.title} ${item.subtitle} ${item.ruleHint} ${item.metricLabel} ${item.customer?.mobile ?? ''} ${item.order?.id ?? ''} ${item.tag ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: items.value.length },
  { key: 'ready' as const, label: module.value.source === 'consumption' ? '已入账' : '重点', count: readyItems.value.length },
  { key: 'action' as const, label: '待跟进', count: actionItems.value.length },
  { key: 'refund' as const, label: '退款', count: refundItems.value.length },
])

const cards = computed(() => [
  { label: module.value.title, value: String(items.value.length), hint: '当前模块匹配到的客户、标签或消费记录数量。', scope: module.value.source },
  { label: module.value.source === 'consumption' ? '已入账' : '重点', value: String(readyItems.value.length), hint: '可优先跟进或已经形成经营价值的记录。', scope: '可用' },
  { label: '待跟进', value: String(actionItems.value.length), hint: '需要补支付、回访、标签维护或会员沉淀。', scope: '处理' },
  { label: '数据来源', value: module.value.source === 'consumption' ? '订单' : '客户', hint: module.value.source === 'consumption' ? '统一订单 yy_order' : '客户档案 yy_customer', scope: '边界' },
])

const openItem = (item: DerivedMemberItem) => {
  router.push(item.actionPath)
}

const resetFilters = () => {
  activeFilter.value = 'all'
  sourceFilter.value = 'all'
  searchQuery.value = ''
}

const stageClass = (stage: DerivedMemberStage) => {
  if (stage === '高价值' || stage === '活跃标签' || stage === '已入账') return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (stage === '已退款') return 'border border-[var(--color-status-neutral-border)] bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'
  return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
}

const loadModuleData = async () => {
  await appStore.ensureCustomersLoaded()
  if (module.value.source !== 'tags' && !appStore.reportOrders.length) {
    await appStore.loadReportOrders()
  }
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
