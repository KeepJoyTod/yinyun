<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">{{ module.eyebrow }}</span>
          <h2 class="mt-1 font-sans text-[17.5px] font-medium text-amber-dark">{{ module.title }}</h2>
          <p class="mt-1 max-w-[820px] text-[10.5px] leading-relaxed text-amber-text-muted">{{ module.description }}</p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="openUnifiedOrders"
        >
          打开统一订单
        </button>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]/55">
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
        <article v-for="card in cards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
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
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
            <select v-model="storeFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
              <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
              <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">{{ store.name }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="h-8 w-[270px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索客户、手机号、订单号、服务"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">展示 {{ filteredItems.length }} 条</div>
        </div>

        <div v-if="filteredItems.length" class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">订单 / 类型</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">客户</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">金额</th>
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
                  <div class="font-mono text-[10.5px] text-amber-dark">{{ item.order.id }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.stageLabel }} · {{ item.order.source || '未知来源' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ item.order.customer || '缺客户姓名' }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.phone || '缺手机号' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ item.order.store }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.service }}</div>
                </td>
                <td class="px-5 py-4">
                  <span class="px-2 py-0.5 text-[10px]" :class="stageClass(item.stage)">{{ item.stageLabel }}</span>
                  <span class="ml-2 px-2 py-0.5 text-[10px]" :class="paymentClass(item.order.payment)">{{ item.order.payment }}</span>
                </td>
                <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">¥ {{ item.order.amount.toLocaleString('zh-CN') }}</td>
                <td class="px-5 py-4">
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click.stop="openOrder(item)">
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
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">{{ module.title }}详情</h3>
        </div>
        <div v-if="selectedItem" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-mono text-[10.5px] text-amber-dark">{{ selectedItem.order.id }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedItem.order.customer || '缺客户姓名' }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-1 text-[10px] text-amber-dark">{{ selectedItem.stageLabel }}</span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Progress</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.progressHint }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Related</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">
                相册 {{ selectedItem.album?.id || '未创建' }} · 支付 {{ selectedItem.order.payment }} · 到店 {{ selectedItem.order.arrivalTime || '暂无' }}
              </dd>
            </div>
          </dl>

          <button class="yy-action mt-6 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="openOrder(selectedItem)">
            打开统一订单
          </button>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              统一订单表 yy_order 是当前页面唯一订单来源。{{ selectedItem.boundary }}
            </p>
          </div>
        </div>
        <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
          选择一条记录后查看客户、订单来源、当前进度和下一步处理建议。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import { buildDerivedOrderItems, getDerivedOrderModule, type DerivedOrderItem, type DerivedOrderStage } from './derivedOrderModules'

const moduleLabelExamples = '冲印订单 企业团单 售卡订单 售券订单'
void moduleLabelExamples

type QuickFilter = 'all' | 'paid' | 'pending' | 'issue'

const route = useRoute()
const router = useRouter()
const activeFilter = ref<QuickFilter>('all')
const storeFilter = ref('')
const searchQuery = ref('')
const selectedItem = ref<DerivedOrderItem | null>(null)

const module = computed(() => getDerivedOrderModule(String(route.meta.featureKey || route.name || 'order-print')))
const items = computed(() => buildDerivedOrderItems(module.value, appStore.orders, appStore.albums))
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const normalizeStoreFilter = (preferred = storeFilter.value) => {
  const matched = concreteStoreOptions.value.find(store => String(store.backendId) === preferred)
  return String(matched?.backendId ?? concreteStoreOptions.value[0]?.backendId ?? '')
}

const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const scopedItems = computed(() => items.value.filter(item => storeFilter.value && String(item.order.storeBackendId) === storeFilter.value))

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return scopedItems.value.filter(item => {
    if (activeFilter.value === 'paid' && item.order.payment !== '已支付') return false
    if (activeFilter.value === 'pending' && item.order.payment === '已支付') return false
    if (activeFilter.value === 'issue' && item.stage !== 'ISSUE') return false
    if (!storeFilter.value || String(item.order.storeBackendId) !== storeFilter.value) return false
    if (!query) return true
    const haystack = `${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.order.source} ${item.stageLabel}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: scopedItems.value.length },
  { key: 'paid' as const, label: '已支付', count: scopedItems.value.filter(item => item.order.payment === '已支付').length },
  { key: 'pending' as const, label: '待跟进', count: scopedItems.value.filter(item => item.order.payment !== '已支付').length },
  { key: 'issue' as const, label: '资料异常', count: scopedItems.value.filter(item => item.stage === 'ISSUE').length },
])

const cards = computed(() => {
  const amount = scopedItems.value.reduce((sum, item) => sum + item.order.amount, 0)
  return [
    { label: module.value.title, value: String(scopedItems.value.length), hint: '当前门店统一订单中匹配该模块的记录数。', scope: 'yy_order' },
    { label: '已支付', value: String(scopedItems.value.filter(item => item.order.payment === '已支付').length), hint: '已支付记录，可继续生产、核销或权益处理。', scope: 'PAID' },
    { label: '待跟进', value: String(scopedItems.value.filter(item => item.order.payment !== '已支付').length), hint: '未支付或仍需人工确认的记录。', scope: '处理' },
    { label: '金额汇总', value: `¥${amount.toLocaleString('zh-CN')}`, hint: '当前模块匹配记录的订单金额汇总。', scope: 'AMOUNT' },
  ]
})

const openOrder = (item: DerivedOrderItem) => {
  router.push(item.actionPath)
}

const openUnifiedOrders = () => {
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      storeId: storeFilter.value || undefined,
    },
  })
}

const stageClass = (stage: DerivedOrderStage) => {
  if (stage === 'ISSUE') return 'bg-[#B8543B]/10 text-[#8C3E2C]'
  if (stage === 'PRODUCTION') return 'bg-[#F6EBDD] text-[#8C5A2C]'
  if (stage === 'VERIFY') return 'bg-[#1A1814] text-[#F4EFE6]'
  if (stage === 'PAID') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  return 'border border-amber-topbar-border bg-[#FBF8F2] text-amber-text-muted'
}

const paymentClass = (payment: string) =>
  payment === '已支付'
    ? 'bg-[#EBF4ED] text-[#2D7A4D]'
    : 'bg-[#B8543B]/10 text-[#8C3E2C]'

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
  activeFilter.value = 'all'
  storeFilter.value = normalizeStoreFilter()
  searchQuery.value = ''
})

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>
