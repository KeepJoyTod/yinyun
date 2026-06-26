<template>
  <MerchantModuleChrome>
  <div class="flex flex-col gap-8">
    <!-- Section Header (4:130) -->
    <div class="flex items-end justify-between gap-4 border-b border-amber-topbar-border/30 pb-4 max-[720px]:flex-col max-[720px]:items-start">
      <div class="flex flex-col gap-1.5">
        <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">门店 · {{ stores.length }}</span>
        <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">门店管理</h2>
        <p class="text-[10.5px] font-sans text-amber-text-muted mt-1 opacity-70">先看待服务门店，再确认营业状态、联系人和当日承接能力。</p>
      </div>
      <span class="text-[11px] font-sans font-medium text-amber-text-muted">当前可见门店</span>
    </div>

    <section class="store-ops-board border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">承接流程</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">门店承接概况</h3>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            先处理待服务单，再检查营业门店和预约制交付点。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickStoreFilters"
            :key="filter.key"
            class="px-3 py-1.5 border rounded-md text-[10.5px] font-sans transition-all"
            :class="activeStoreFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeStoreFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in storeOperationCards"
          :key="item.label"
          class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ item.label }}</div>
              <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-black/[0.03] px-2 py-1 text-[9px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
              {{ item.scope }}
            </span>
          </div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ item.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ item.action }}</span>
          </div>
        </article>
      </div>
    </section>

    <details class="border border-amber-topbar-border bg-amber-content-bg/55">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">抖音来客门店绑定</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">抖音来客绑定</h3>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            真实可用门店以 /yy/store/list 为主数据；这里把 /yy/channelProductMapping/list 里的 DOUYIN_LIFE 商品、SKU、POI 和入口挂到对应门店。
          </p>
        </div>
        <button
          class="border border-amber-topbar-border px-3 py-1.5 text-[10.5px] font-sans text-amber-dark hover:bg-white disabled:text-amber-text-muted"
          type="button"
          :disabled="douyinBindingLoading"
          @click.stop="reloadDouyinBindings"
        >
          {{ douyinBindingLoading ? '刷新中...' : '刷新来客绑定' }}
        </button>
      </summary>

      <div class="grid grid-cols-1 gap-3 border-t border-amber-topbar-border p-5 lg:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="binding in douyinStoreBindings"
          :key="binding.store.backendId"
          class="border border-amber-topbar-border bg-amber-content-bg p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-[11px] font-semibold text-amber-dark">{{ binding.store.name }}</div>
              <div class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-text-muted">{{ binding.store.id }}</div>
            </div>
            <span
              class="shrink-0 px-2 py-0.5 text-[9.5px]"
              :class="binding.statusTone === 'ready' ? 'bg-[#EBF4ED] text-[#2D7A4D]' : binding.statusTone === 'mapped' ? 'bg-[#FFF4D9] text-[#8A5A12]' : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
            >
              {{ binding.statusLabel }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="border border-amber-topbar-border bg-white/45 px-2 py-2">
              <span class="block text-[9px] text-amber-text-muted">商品</span>
              <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ binding.mappingCount }}</strong>
            </div>
            <div class="border border-amber-topbar-border bg-white/45 px-2 py-2">
              <span class="block text-[9px] text-amber-text-muted">可投放</span>
              <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ binding.readyCount }}</strong>
            </div>
            <div class="border border-amber-topbar-border bg-white/45 px-2 py-2">
              <span class="block text-[9px] text-amber-text-muted">POI</span>
              <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ binding.poiIds.length }}</strong>
            </div>
          </div>

          <div class="mt-4 text-[10.5px] leading-relaxed text-amber-text-muted">
            {{ binding.hint }}
          </div>
        </article>
      </div>
    </details>

    <!-- Store Grid (4:139) -->
    <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
      <article v-for="store in filteredStores" :key="store.id"
        class="store-reference-card bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden flex flex-col group hover:shadow-md hover:border-amber-dark/20 transition-all duration-200">
        <div class="flex gap-5 p-5">
          <div class="h-[122px] w-[162px] shrink-0 overflow-hidden rounded-md border border-amber-topbar-border bg-amber-dark/5 max-[520px]:hidden">
            <img :src="workbenchImages.storeFront" class="h-full w-full object-cover grayscale-[0.08] transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-[16px] font-sans font-semibold text-amber-dark">{{ store.name }}</h3>
                <p class="mt-1 truncate text-[11px] font-sans text-amber-text-muted">{{ store.manager }}</p>
              </div>
              <span class="shrink-0 rounded-md border border-amber-topbar-border bg-[#FBF8F2] px-2 py-0.5 text-[10px] font-sans text-amber-text-muted">
                {{ store.status }}
              </span>
            </div>
            <div class="mt-5 space-y-2 text-[13px] font-sans text-amber-text-muted">
              <div>本月订单：<b class="font-mono text-amber-accent">{{ store.monthlyOrders }}</b> 单</div>
              <div>待服务单：<b class="font-mono text-amber-accent">{{ store.pendingOrders }}</b> 单</div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-2 text-center">
              <div class="rounded-md border border-amber-topbar-border bg-[#FBF8F2]/70 px-2 py-2">
                <span class="block text-[9px] text-amber-text-muted">今日预约</span>
                <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ storeTodayOrders(store.backendId) }}</strong>
              </div>
              <div class="rounded-md border border-amber-topbar-border bg-[#FBF8F2]/70 px-2 py-2">
                <span class="block text-[9px] text-amber-text-muted">待上传</span>
                <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ storePendingAlbums(store.backendId) }}</strong>
              </div>
              <div class="rounded-md border border-amber-topbar-border bg-[#FBF8F2]/70 px-2 py-2">
                <span class="block text-[9px] text-amber-text-muted">排期</span>
                <strong class="mt-1 block text-[13px] font-mono text-amber-dark">{{ storeScheduleSlots(store.backendId) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-amber-topbar-border px-5 py-3 flex flex-col gap-2">
          <div class="flex items-start gap-2">
            <img src="../../assets/icons/address.svg" class="w-3.5 h-3.5 mt-0.5 opacity-40 group-hover/info:opacity-80 transition-opacity" />
            <span class="text-[11px] font-sans text-amber-text-muted leading-relaxed">{{ store.address }}</span>
          </div>
          <div class="flex items-center gap-2">
            <img src="../../assets/icons/phone.svg" class="w-3.5 h-3.5 opacity-40 group-hover/info:opacity-80 transition-opacity" />
            <span class="text-[11px] font-sans text-amber-text-muted">{{ store.phone }}</span>
          </div>
          <div class="flex items-center gap-2">
            <img src="../../assets/icons/clock.svg" class="w-3.5 h-3.5 opacity-40 group-hover/info:opacity-80 transition-opacity" />
            <span class="text-[11px] font-sans text-amber-text-muted">{{ store.hours }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 border-t border-amber-topbar-border bg-[#F4EFE6]/45 sm:grid-cols-4">
          <button
            v-for="action in storeActionButtons"
            :key="action.key"
            class="yy-action border-r border-b border-amber-topbar-border px-3 py-3 text-left text-[11px] font-sans font-semibold text-amber-dark transition-colors hover:bg-white last:border-r-0"
            type="button"
            @click="openStoreAction(store, action.key)"
          >
            {{ action.label }}
          </button>
        </div>

        <details class="border-t border-amber-topbar-border px-5 py-3">
          <summary class="cursor-pointer list-none text-[10.5px] font-sans font-medium uppercase tracking-wider text-amber-text-muted marker:hidden">
            抖音来客映射
          </summary>
          <div v-if="getDouyinMappings(store).length > 0" class="mt-3 overflow-x-auto">
            <table class="min-w-full text-[9px]">
              <thead>
                <tr class="text-left text-amber-text-muted">
                  <th class="pb-1 font-medium">产品</th>
                  <th class="pb-1 font-medium">POI ID</th>
                  <th class="pb-1 font-medium">SKU ID</th>
                  <th class="pb-1 font-medium">映射状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in getDouyinMappings(store)" :key="m.backendId" class="border-t border-amber-topbar-border/50">
                  <td class="py-0.5">{{ m.productName || m.externalName || '-' }}</td>
                  <td class="py-0.5 font-mono">{{ m.externalPoiId || '-' }}</td>
                  <td class="py-0.5 font-mono">{{ m.externalSkuId || '-' }}</td>
                  <td class="py-0.5">
                    <span :class="m.ready ? 'text-green-600' : 'text-amber-600'">
                      {{ m.mappingStatus || 'UNMAPPED' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="mt-1 text-[9.5px] text-amber-text-muted">
            暂无抖音来客映射；到 /yy/channelProductMapping/list 维护商品、SKU、POI 和入口。
          </div>
        </details>
      </article>
    </div>

    <div
      v-if="filteredStores.length === 0"
      class="border border-dashed border-amber-topbar-border bg-amber-content-bg p-8 text-center"
    >
      <div class="text-[15px] font-sans text-amber-dark">当前筛选下没有门店</div>
      <p class="mt-2 text-[11px] font-sans text-amber-text-muted">切回当前可见门店，或检查门店营业状态和待服务单。</p>
      <button
        class="mt-4 border border-amber-topbar-border px-4 py-2 text-[11px] font-sans text-amber-dark hover:bg-black/5"
        type="button"
        @click="activeStoreFilter = 'all'"
      >
        查看当前可见门店
      </button>
    </div>
  </div>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { appStore, type StoreInfo } from '../../shared/stores/appStore'
import { workbenchImages } from '../../shared/stores/workbenchAssets'
import { buildDouyinStoreBindings, mappingBelongsToStore } from './storeDouyinBindings'
import MerchantModuleChrome from '../merchant/components/MerchantModuleChrome.vue'

const router = useRouter()
const stores = computed(() => appStore.stores)
const activeStoreFilter = ref<'all' | 'pending' | 'open' | 'reservation'>('all')
const douyinBindingLoading = ref(false)

const today = new Date()
const pad2 = (n: number) => String(n).padStart(2, '0')
const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

const toCount = (value: string) => Number(value.replace(/,/g, '')) || 0

const storeTodayOrders = (storeBackendId: string) =>
  appStore.orders.filter(order => order.storeBackendId === storeBackendId && order.arrivalDate === todayKey).length

const storePendingAlbums = (storeBackendId: string) => {
  const storeOrderIds = new Set(appStore.orders.filter(order => order.storeBackendId === storeBackendId).map(order => order.backendId))
  return appStore.albums.filter(album => {
    if (!album.orderBackendId || !storeOrderIds.has(album.orderBackendId)) return false
    return album.totalCount === 0 || album.status === '待客户选片'
  }).length
}

const storeScheduleSlots = (storeBackendId: string) =>
  appStore.scheduleItems.filter(item => item.storeId === storeBackendId && item.startAt.startsWith(todayKey)).length

const pendingStores = computed(() => stores.value.filter(store => toCount(store.pendingOrders) > 0))
const openStores = computed(() => stores.value.filter(store => store.status.includes('营业')))
const reservationStores = computed(() => stores.value.filter(store => store.status.includes('预约')))
const monthlyOrderCount = computed(() => stores.value.reduce((sum, store) => sum + toCount(store.monthlyOrders), 0))
const pendingOrderCount = computed(() => stores.value.reduce((sum, store) => sum + toCount(store.pendingOrders), 0))
const douyinStoreBindings = computed(() =>
  buildDouyinStoreBindings(stores.value, appStore.channelProductMappings),
)

const filteredStores = computed(() => {
  if (activeStoreFilter.value === 'pending') return pendingStores.value
  if (activeStoreFilter.value === 'open') return openStores.value
  if (activeStoreFilter.value === 'reservation') return reservationStores.value
  return stores.value
})

const quickStoreFilters = computed(() => [
  { key: 'all' as const, label: '当前可见', count: stores.value.length },
  { key: 'pending' as const, label: '有待服务', count: pendingStores.value.length },
  { key: 'open' as const, label: '营业中', count: openStores.value.length },
  { key: 'reservation' as const, label: '预约制', count: reservationStores.value.length },
])

const storeOperationCards = computed(() => [
  {
    label: '门店总数',
    value: String(stores.value.length),
    hint: '当前工作台可管理的门店和交付点。',
    action: '看分布',
    scope: '门店',
  },
  {
    label: '营业中',
    value: String(openStores.value.length),
    hint: '正在营业、可承接客户到店的门店。',
    action: '可接待',
    scope: '营业',
  },
  {
    label: '待服务单',
    value: String(pendingOrderCount.value),
    hint: '需要门店继续确认、拍摄或交付的订单。',
    action: '先处理',
    scope: '服务',
  },
  {
    label: '本月订单',
    value: String(monthlyOrderCount.value),
    hint: '按门店汇总的本月订单规模。',
    action: '看趋势',
    scope: '月度',
  },
])

type StoreActionKey = 'service-groups' | 'product-config' | 'walk-in-order' | 'order-attrs'

const storeActionButtons: { key: StoreActionKey; label: string }[] = [
  { key: 'service-groups', label: '服务组管理' },
  { key: 'product-config', label: '产品配置' },
  { key: 'walk-in-order', label: '到店下单' },
  { key: 'order-attrs', label: '订单属性' },
]

const openStoreAction = (store: StoreInfo, actionKey: StoreActionKey) => {
  if (actionKey === 'service-groups') {
    router.push({ path: '/merchant/service-groups', query: { storeId: store.backendId } })
    return
  }
  if (actionKey === 'product-config') {
    router.push({ path: '/product/service', query: { storeId: store.backendId, store: store.name } })
    return
  }
  if (actionKey === 'walk-in-order') {
    router.push({ path: '/order/appointment', query: { quick: 'all', storeId: store.backendId, astore: store.name, store: store.name, intent: 'walk-in' } })
    return
  }
  router.push({ path: '/merchant/order-attributes', query: { storeId: store.backendId, store: store.name } })
}

const getDouyinMappings = (store: StoreInfo) =>
  appStore.channelProductMappings.filter(
    m => m.channelType === 'DOUYIN_LIFE' && mappingBelongsToStore(m, store),
  )

const reloadDouyinBindings = async () => {
  douyinBindingLoading.value = true
  try {
    await appStore.loadChannelProductMappings('DOUYIN_LIFE')
  } finally {
    douyinBindingLoading.value = false
  }
}

onMounted(() => {
  if (!appStore.channelProductMappings.some(mapping => mapping.channelType === 'DOUYIN_LIFE')) {
    void reloadDouyinBindings()
  }
})
</script>
