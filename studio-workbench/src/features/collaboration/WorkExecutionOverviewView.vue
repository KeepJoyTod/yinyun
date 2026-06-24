<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Work Execution</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">工作执行概况</h2>
          <p class="mt-2 max-w-[820px] text-[10.5px] leading-relaxed text-amber-text-muted">
            从统一订单、客片相册和在线选片数据判断每个订单当前唯一环节，门店按拍摄、上传、客户选片、精修交付顺序处理，不建立重复业务账本。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10.5px] text-amber-text-muted hover:bg-white" type="button" @click="shiftDate(-1)">
            前一天
          </button>
          <input v-model="selectedDate" class="h-9 border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" type="date" />
          <button class="yy-action border border-amber-dark bg-amber-dark px-3 py-2 text-[10.5px] text-[#F4EFE6]" type="button" @click="selectedDate = todayKey">
            今天
          </button>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10.5px] text-amber-text-muted hover:bg-white" type="button" @click="shiftDate(1)">
            后一天
          </button>
        </div>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]/55">
      <div class="flex flex-wrap items-center gap-2 border-b border-amber-topbar-border p-5">
        <button
          v-for="filter in stageFilters"
          :key="filter.key"
          class="yy-action border px-3 py-1.5 text-[10.5px]"
          :class="activeStage === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="activeStage = filter.key"
        >
          {{ filter.label }} · {{ filter.count }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="yy-surface border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[26px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
          <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
            <select v-model="storeFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
              <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
              <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">{{ store.name }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="h-8 w-[280px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索客户、手机号、订单号、服务"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">{{ selectedDateLabel }} · {{ filteredItems.length }} 项工作</div>
        </div>

        <div v-if="filteredItems.length" class="overflow-x-auto">
          <table class="w-full min-w-[960px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">当前环节</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">客户 / 订单</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">门店 / 服务</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">负责人</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">要求时间</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">进度</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">操作</th>
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
                  <span class="px-2 py-1 text-[10px]" :class="stageClass(item.stage)">{{ item.stageLabel }}</span>
                  <div class="mt-2 text-[10px]" :class="item.overdue ? 'text-[#B8543B]' : 'text-amber-text-muted'">
                    {{ item.overdue ? '已超时' : item.statusLabel }}
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-semibold text-amber-dark">{{ item.order.customer || '待补客户' }}</div>
                  <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ item.order.id }} · {{ item.order.phone || '缺手机号' }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ item.order.store }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.order.service }}</div>
                </td>
                <td class="px-5 py-4 text-[10.5px] text-amber-dark">{{ item.owner }}</td>
                <td class="px-5 py-4 font-mono text-[10.5px]" :class="item.overdue ? 'text-[#B8543B]' : 'text-amber-dark'">{{ item.dueLabel }}</td>
                <td class="px-5 py-4">
                  <div class="h-1.5 w-24 overflow-hidden bg-black/10">
                    <div class="h-full bg-amber-dark" :style="{ width: `${item.progress}%` }" />
                  </div>
                  <div class="mt-1 font-mono text-[9px] text-amber-text-muted">{{ item.progress }}%</div>
                </td>
                <td class="px-5 py-4">
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click.stop="openItem(item)">
                    进入处理页面
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-14 text-center">
          <div class="font-sans text-[15px] text-amber-dark">当前日期没有匹配的执行工作</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">{{ storeFilter ? '可切换日期、门店或环节查看其他任务。' : '当前账号暂无可用门店，请先检查员工门店权限。' }}</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Execution Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">执行详情</h3>
        </div>
        <div v-if="selectedItem" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedItem.order.customer || '待补客户' }}</div>
              <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ selectedItem.order.id }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-1 text-[10px] text-amber-dark">{{ selectedItem.stageLabel }}</span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Current Status</dt>
              <dd class="mt-1 text-[11px] text-amber-dark">{{ selectedItem.statusLabel }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Due</dt>
              <dd class="mt-1 text-[11px]" :class="selectedItem.overdue ? 'text-[#B8543B]' : 'text-amber-dark'">
                {{ selectedItem.dueLabel }}{{ selectedItem.overdue ? ' · 已超时' : '' }}
              </dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Related Data</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">
                订单 {{ selectedItem.order.id }} · 相册 {{ selectedItem.album?.id || '未创建' }} · 选片链接 {{ selectedItem.selectionLink?.id || '未生成' }}
              </dd>
            </div>
          </dl>

          <button class="yy-action mt-6 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="openItem(selectedItem)">
            进入处理页面
          </button>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              当前页面只派生执行视图，订单仍由 yy_order 管理，相册和底片仍由客片模块管理，选片结果仍由在线选片模块管理。
            </p>
          </div>
        </div>
        <div v-else class="px-5 py-12 text-center text-[11px] leading-relaxed text-amber-text-muted">
          选择一项工作后查看当前环节、负责人、时限和下一步操作。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import { buildWorkExecutionItems, type WorkExecutionItem, type WorkExecutionStage } from './workExecution'

type StageFilter = 'ALL' | WorkExecutionStage

const router = useRouter()
const pad2 = (value: number) => String(value).padStart(2, '0')
const dateKey = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const todayKey = dateKey(new Date())
const selectedDate = ref(todayKey)
const activeStage = ref<StageFilter>('ALL')
const storeFilter = ref('')
const searchQuery = ref('')
const selectedItem = ref<WorkExecutionItem | null>(null)

const allItems = computed(() => buildWorkExecutionItems({
  orders: appStore.orders,
  albums: appStore.albums,
  selectionLinks: appStore.selectionLinks,
}))

const selectedDateLabel = computed(() => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? selectedDate.value : `${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

const dateItems = computed(() => allItems.value.filter(item => item.businessDate === selectedDate.value))
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const normalizeStoreFilter = (preferred = storeFilter.value) => {
  const matched = concreteStoreOptions.value.find(store => store.name === preferred || String(store.backendId) === preferred)
  return matched?.backendId ? String(matched.backendId) : String(concreteStoreOptions.value[0]?.backendId ?? '')
}

const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return scopedDateItems.value.filter(item => {
    if (activeStage.value !== 'ALL' && item.stage !== activeStage.value) return false
    if (!query) return true
    const haystack = `${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.stageLabel}`.toLowerCase()
    return haystack.includes(query)
  })
})

const scopedDateItems = computed(() => {
  if (!storeFilter.value) return []
  return dateItems.value.filter(item => String(item.order.storeBackendId) === storeFilter.value)
})

const countStage = (stage: WorkExecutionStage) => scopedDateItems.value.filter(item => item.stage === stage).length
const stageFilters = computed(() => [
  { key: 'ALL' as const, label: '全部环节', count: scopedDateItems.value.length },
  { key: 'SHOOT' as const, label: '拍摄', count: countStage('SHOOT') },
  { key: 'UPLOAD' as const, label: '上传', count: countStage('UPLOAD') },
  { key: 'SELECTION' as const, label: '客户选片', count: countStage('SELECTION') },
  { key: 'DELIVERY' as const, label: '精修交付', count: countStage('DELIVERY') },
])

const summaryCards = computed(() => [
  { label: '当日执行项', value: String(scopedDateItems.value.length), hint: '每个订单只展示当前唯一环节。', scope: 'TOTAL' },
  { label: '已超时', value: String(scopedDateItems.value.filter(item => item.overdue).length), hint: '要求时间已经过去，需要优先处理。', scope: 'OVERDUE' },
  { label: '待拍摄 / 上传', value: String(countStage('SHOOT') + countStage('UPLOAD')), hint: '门店现场和素材入库环节。', scope: 'PRODUCE' },
  { label: '待选片 / 交付', value: String(countStage('SELECTION') + countStage('DELIVERY')), hint: '客户确认和最终交付环节。', scope: 'DELIVER' },
])

const shiftDate = (days: number) => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return
  date.setDate(date.getDate() + days)
  selectedDate.value = dateKey(date)
}

const openItem = (item: WorkExecutionItem) => {
  router.push(item.actionPath)
}

const stageClass = (stage: WorkExecutionStage) => {
  if (stage === 'SHOOT') return 'bg-[#1A1814] text-[#F4EFE6]'
  if (stage === 'UPLOAD') return 'bg-[#F0E9DD] text-amber-dark'
  if (stage === 'SELECTION') return 'bg-[#F6EBDD] text-[#8C5A2C]'
  return 'bg-[#EBF4ED] text-[#2D7A4D]'
}

watch(
  filteredItems,
  items => {
    if (!items.some(item => item.id === selectedItem.value?.id)) selectedItem.value = items[0] ?? null
  },
  { immediate: true },
)

watch(selectedDate, () => {
  activeStage.value = 'ALL'
  storeFilter.value = normalizeStoreFilter()
})

watch(
  () => concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|'),
  () => {
    storeFilter.value = normalizeStoreFilter()
  },
)

onMounted(async () => {
  await ensureWorkbenchStores()
  storeFilter.value = normalizeStoreFilter()
})
</script>
