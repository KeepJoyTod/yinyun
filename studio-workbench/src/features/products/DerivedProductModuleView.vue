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
          class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black disabled:border-amber-topbar-border disabled:bg-amber-bg disabled:text-amber-text-muted"
          type="button"
          :disabled="loading"
          @click="openPrimary"
        >
          {{ loading ? '加载中...' : primaryActionLabel }}
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="flex flex-wrap items-center gap-2 border-b border-amber-topbar-border p-5">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action yy-filter-chip"
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
            <select v-model="storeFilter" class="yy-field-sm max-[560px]:w-full">
              <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
              <option v-for="store in concreteStoreOptions" :key="store" :value="store">{{ store }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="yy-field-sm w-[270px] max-[560px]:w-full"
              placeholder="搜索产品、规格、渠道、门店"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">展示 {{ filteredItems.length }} 条</div>
        </div>

        <div v-if="loading" class="space-y-3 p-5">
          <div v-for="item in 4" :key="item" class="h-[78px] animate-pulse border border-amber-topbar-border bg-white/55"></div>
        </div>

        <div v-else-if="filteredItems.length" class="yy-console-table overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">产品 / 来源</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">价格 / SKU</th>
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
                <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ item.storeName }}</td>
                <td class="px-5 py-4 font-mono text-[10.5px] text-amber-dark">{{ item.priceLabel }}</td>
                <td class="px-5 py-4">
                  <div class="max-w-[300px] text-[10px] leading-relaxed text-amber-text-muted">{{ item.ruleHint }}</div>
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
            v-if="activeFilter !== 'all' || searchQuery"
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
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">产品详情</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">{{ module.title }}详情</h3>
        </div>
        <div v-if="selectedItem" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedItem.title }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedItem.sourceLabel }} · {{ selectedItem.storeName }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-amber-content-bg px-2 py-1 text-[10px] text-amber-dark">{{ selectedItem.stage }}</span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">规则</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.ruleHint }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
            </div>
            <div v-if="selectedItem.mapping">
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">渠道入口</dt>
              <dd class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">
                {{ selectedItem.mapping.landingUrl || selectedItem.mapping.landingPath || '暂无入口' }}
              </dd>
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
          <p>选择一条记录后查看产品规则、渠道字段和下一步处理建议。</p>
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
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appStore, type ChannelProductMappingInfo } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { buildDerivedProductItems, getDerivedProductModule, type DerivedProductItem, type DerivedProductStage } from './derivedProductModules'
import { useNotice } from '../../shared/composables/useNotice'

const moduleLabelExamples = '附加产品 团单产品 冲印产品 美团产品'
void moduleLabelExamples

type QuickFilter = 'all' | 'ready' | 'action' | 'inactive'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const activeFilter = ref<QuickFilter>('all')
const storeFilter = ref('')
const searchQuery = ref('')
const selectedItem = ref<DerivedProductItem | null>(null)
const channelMappings = ref<ChannelProductMappingInfo[]>([])
const { notice, pushNotice } = useNotice()

const module = computed(() => getDerivedProductModule(String(route.meta.featureKey || route.name || 'product-addon')))
const relevantMappings = computed(() => (module.value.source === 'channel' ? channelMappings.value : appStore.channelProductMappings))
const items = computed(() => buildDerivedProductItems(module.value, appStore.products, relevantMappings.value))
const readyItems = computed(() => items.value.filter(item => item.stage === '可售' || item.stage === '可投放'))
const actionItems = computed(() => items.value.filter(item => item.stage === '待补规则' || item.stage === '待补齐'))
const inactiveItems = computed(() => items.value.filter(item => item.stage === '已下架'))
const storeOptions = computed(() => Array.from(new Set(items.value.map(item => item.storeName).filter(store => store !== '全部门店'))))
const concreteStoreOptions = computed(() => storeOptions.value.filter(Boolean))
const normalizeStoreFilter = (preferred = storeFilter.value) => {
  if (preferred && concreteStoreOptions.value.includes(preferred)) return preferred
  return concreteStoreOptions.value[0] ?? ''
}
const primaryActionLabel = computed(() => (module.value.source === 'channel' ? '打开渠道配置' : '打开服务产品'))
const emptyBoundary = computed(() =>
  module.value.source === 'channel'
    ? '渠道商品只读取 /yy/channelProductMapping/list，未授权或缺字段时不显示为可投放。'
    : '统一产品表 yy_product 是当前页面唯一产品来源，不在店员工作台新建第二套商品账本。',
)

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => {
    if (activeFilter.value === 'ready' && !(item.stage === '可售' || item.stage === '可投放')) return false
    if (activeFilter.value === 'action' && !(item.stage === '待补规则' || item.stage === '待补齐')) return false
    if (activeFilter.value === 'inactive' && item.stage !== '已下架') return false
    if (!storeFilter.value || item.storeName !== storeFilter.value) return false
    if (!query) return true
    const haystack = `${item.title} ${item.subtitle} ${item.ruleHint} ${item.storeName} ${item.sourceLabel} ${item.product?.id ?? ''} ${item.mapping?.externalProductId ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: items.value.length },
  { key: 'ready' as const, label: module.value.source === 'channel' ? '可投放' : '可售', count: readyItems.value.length },
  { key: 'action' as const, label: '待处理', count: actionItems.value.length },
  { key: 'inactive' as const, label: '已下架', count: inactiveItems.value.length },
])

const cards = computed(() => [
  { label: module.value.title, value: String(items.value.length), hint: '当前模块匹配到的产品或渠道映射数量。', scope: module.value.source === 'channel' ? '渠道' : '产品' },
  { label: module.value.source === 'channel' ? '可投放' : '可售', value: String(readyItems.value.length), hint: '规则或渠道字段已补齐，可进入运营承接。', scope: '可用' },
  { label: '待处理', value: String(actionItems.value.length), hint: '缺规则、缺 SKU、缺入口或渠道授权未完成。', scope: '处理' },
  { label: '数据来源', value: module.value.source === 'channel' ? '映射' : '产品', hint: module.value.source === 'channel' ? '/yy/channelProductMapping/list' : '统一产品表 yy_product', scope: '边界' },
])

const reloadChannelMappings = async () => {
  if (!module.value.channelType) {
    channelMappings.value = []
    return
  }
  loading.value = true
  try {
    channelMappings.value = [...await appStore.loadChannelProductMappings(module.value.channelType)]
  } catch (error) {
    pushNotice('error', error instanceof Error ? `${module.value.title}加载失败：${error.message}` : `${module.value.title}加载失败`)
  } finally {
    loading.value = false
  }
}

const openPrimary = () => {
  router.push(module.value.source === 'channel' ? '/settings/channels?channel=MEITUAN' : '/product/service')
}

const openItem = (item: DerivedProductItem) => {
  router.push(item.actionPath)
}

const resetFilters = () => {
  activeFilter.value = 'all'
  storeFilter.value = normalizeStoreFilter()
  searchQuery.value = ''
}

const stageClass = (stage: DerivedProductStage) => {
  if (stage === '可售' || stage === '可投放') return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (stage === '待补规则' || stage === '待补齐') return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  return 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'
}

watch(
  [filteredItems, module],
  ([nextItems]) => {
    if (!nextItems.some(item => item.id === selectedItem.value?.id)) selectedItem.value = nextItems[0] ?? null
  },
  { immediate: true },
)

watchEffect(() => {
  const normalized = normalizeStoreFilter()
  if (storeFilter.value !== normalized) {
    storeFilter.value = normalized
  }
})

watch(module, () => {
  resetFilters()
  void reloadChannelMappings()
})

onMounted(reloadChannelMappings)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
