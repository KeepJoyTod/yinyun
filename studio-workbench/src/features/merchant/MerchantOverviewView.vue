<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex items-center justify-between gap-4 px-5 pb-4 pt-5 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <div class="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-text-muted">商户总览</div>
          <h2 class="mt-2 text-[20px] font-semibold leading-none text-amber-dark">商户经营总览</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="selectedStoreId" class="h-9 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
            <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
            <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">{{ store.name }}</option>
          </select>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] font-medium text-amber-text-muted hover:bg-white hover:text-amber-dark" type="button" @click="reloadMerchantContext">
            刷新真实数据
          </button>
        </div>
      </div>

      <div class="grid grid-cols-4 border-t border-amber-topbar-border max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        <article
          v-for="metric in overviewMetrics"
          :key="metric.label"
          class="min-h-[104px] border-r border-b border-amber-topbar-border px-5 py-5 last:border-r-0 max-[980px]:even:border-r-0 max-[560px]:border-r-0"
        >
          <div class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">{{ metric.eyebrow }}</div>
          <div class="mt-3 text-[28px] font-semibold leading-none" :class="metric.danger ? 'text-[#B8543B]' : 'text-amber-dark'">
            {{ metric.value }}
          </div>
          <div class="mt-2 text-[12px] text-amber-dark">{{ metric.label }}</div>
        </article>
      </div>
    </section>

    <div class="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] gap-5 max-[1020px]:grid-cols-1">
      <section class="border border-amber-topbar-border bg-[#FBF8F2]">
        <div class="flex items-center justify-between border-b border-amber-topbar-border px-5 py-4">
          <div>
            <div class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">门店运营</div>
            <h3 class="mt-2 text-[17px] font-semibold leading-none text-amber-dark">门店经营概况</h3>
          </div>
          <RouterLink class="yy-action text-[12px] font-medium text-amber-text-muted hover:text-amber-dark" :to="storeRoute">
            门店资料 ↗
          </RouterLink>
        </div>

        <div class="divide-y divide-amber-topbar-border">
          <article v-for="store in storeRows" :key="store.backendId" class="grid grid-cols-[minmax(160px,1fr)_88px_96px_1fr] items-center gap-4 px-5 py-4 max-[820px]:grid-cols-1">
            <div class="min-w-0">
              <div class="truncate text-[13px] font-semibold text-amber-dark">{{ store.name }}</div>
              <div class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">{{ store.id }}</div>
            </div>
            <span class="inline-flex w-fit items-center gap-1.5 border px-2 py-1 text-[11px]" :class="statusClass(store.status)">
              <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
              {{ store.status }}
            </span>
            <div class="grid grid-cols-2 gap-3 font-mono text-[12px] text-amber-dark">
              <span><span class="text-[10px] text-amber-text-muted">今日</span> {{ storeTodayOrders(store.backendId) }}</span>
              <span><span class="text-[10px] text-amber-text-muted">待服</span> {{ store.pendingOrders }}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center justify-between gap-3 text-[10px] text-amber-text-muted">
                <span>档期填充</span>
                <span>{{ storeFillRate(store.backendId) }}%</span>
              </div>
              <div class="mt-2 h-1.5 bg-[#E8E0D3]">
                <div class="h-full bg-amber-dark" :style="{ width: `${storeFillRate(store.backendId)}%` }"></div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="border border-amber-topbar-border bg-[#FBF8F2]">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <div class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">渠道映射</div>
          <h3 class="mt-2 text-[17px] font-semibold leading-none text-amber-dark">抖音来客映射</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border">
          <article v-for="item in douyinStoreBindings" :key="item.store.backendId" class="flex items-center gap-4 px-5 py-4">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAE4D8] text-[13px] font-semibold text-amber-dark">{{ item.store.name.slice(0, 1) }}</div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[13px] font-medium text-amber-dark">{{ item.store.name }}</div>
              <div class="mt-0.5 truncate text-[11px] text-amber-text-muted">商品 {{ item.mappingCount }} · 可投放 {{ item.readyCount }} · POI {{ item.poiIds.length }}</div>
            </div>
            <span
              class="shrink-0 px-2 py-1 text-[11px]"
              :class="item.statusTone === 'ready' ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : item.statusTone === 'mapped' ? 'bg-[#FFF4D9] text-[#8A5A12]' : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'"
            >
              {{ item.statusLabel }}
            </span>
          </article>
        </div>
      </section>
    </div>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import { buildDouyinStoreBindings } from '../stores/storeDouyinBindings'

const today = new Date()
const pad2 = (n: number) => String(n).padStart(2, '0')
const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`
const toCount = (value: string) => Number(value.replace(/,/g, '')) || 0

const selectedStoreId = ref('')
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))
const normalizeStoreFilter = (preferred = selectedStoreId.value) => {
  const matched = concreteStoreOptions.value.find(store => store.name === preferred || String(store.backendId) === preferred)
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

const selectedStore = computed(() => concreteStoreOptions.value.find(store => String(store.backendId) === selectedStoreId.value) ?? null)
const storeRoute = computed(() => ({
  path: '/merchant/store',
  query: { storeId: selectedStoreId.value || undefined },
}))
const storeRows = computed(() => selectedStore.value ? [selectedStore.value] : [])
const scopedOrders = computed(() => appStore.orders.filter(order => String(order.storeBackendId) === selectedStoreId.value))
const scopedScheduleItems = computed(() => appStore.scheduleItems.filter(item => item.storeId === selectedStoreId.value))
const scopedBookingInventory = computed(() => appStore.bookingInventory.filter(slot => slot.storeBackendId === selectedStoreId.value))
const openStoreCount = computed(() => storeRows.value.filter(store => store.status.includes('营业') || store.status.includes('预约')).length)
const pendingOrders = computed(() => scopedOrders.value.filter(order => ['待确认', '已确认', '拍摄中'].includes(order.status)).length)
const todayBookings = computed(() => scopedScheduleItems.value.filter(item => item.startAt.startsWith(todayKey)).length)
const fullSlots = computed(() => scopedBookingInventory.value.filter(slot => slot.capacity > 0 && slot.confirmedCount >= slot.capacity).length)
const douyinStoreBindings = computed(() => buildDouyinStoreBindings(storeRows.value, appStore.channelProductMappings))
const readyDouyinStoreCount = computed(() => douyinStoreBindings.value.filter(item => item.readyCount > 0).length)

const overviewMetrics = computed(() => [
  { eyebrow: '门店', value: String(storeRows.value.length), label: '当前门店' },
  { eyebrow: '营业', value: String(openStoreCount.value), label: '营业门店' },
  { eyebrow: '今日', value: String(todayBookings.value), label: '今日预约' },
  { eyebrow: '待服', value: String(pendingOrders.value), label: '待服务订单', danger: true },
  { eyebrow: '满员', value: String(fullSlots.value), label: '满员时段', danger: fullSlots.value > 0 },
  { eyebrow: '来客', value: String(readyDouyinStoreCount.value), label: '来客可投放门店' },
  { eyebrow: '本月', value: String(storeRows.value.reduce((sum, store) => sum + toCount(store.monthlyOrders), 0)), label: '本月订单' },
  { eyebrow: '填充', value: `${Math.min(100, Math.round((todayBookings.value / Math.max(scopedBookingInventory.value.length, 1)) * 100))}%`, label: '今日排期填充' },
])

const storeTodayOrders = (storeBackendId: string) =>
  scopedScheduleItems.value.filter(item => item.storeId === storeBackendId && item.startAt.startsWith(todayKey)).length

const storeFillRate = (storeBackendId: string) => {
  const slots = scopedBookingInventory.value.filter(slot => slot.storeBackendId === storeBackendId && slot.date === todayKey)
  const capacity = slots.reduce((sum, slot) => sum + slot.capacity, 0)
  const confirmed = slots.reduce((sum, slot) => sum + slot.confirmedCount, 0)
  return capacity > 0 ? Math.min(100, Math.round((confirmed / capacity) * 100)) : 0
}

const statusClass = (status: string) => {
  if (status.includes('停') || status.includes('关闭')) return 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'
  if (status.includes('满')) return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
}

const reloadMerchantContext = async () => {
  await ensureWorkbenchStores()
  selectedStoreId.value = normalizeStoreFilter()
  if (!selectedStoreId.value) return
  await Promise.all([
    appStore.refreshCoreData(),
    appStore.loadSchedule(todayKey, selectedStore.value?.name ?? '', selectedStoreId.value),
    appStore.loadBookingInventory({ date: todayKey, storeBackendId: selectedStoreId.value }),
    appStore.loadChannelProductMappings('DOUYIN_LIFE'),
  ])
}

watch(
  () => concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|'),
  () => {
    selectedStoreId.value = normalizeStoreFilter()
  },
)

watch(selectedStoreId, () => {
  void reloadMerchantContext()
})

onMounted(async () => {
  await ensureWorkbenchStores()
  selectedStoreId.value = normalizeStoreFilter()
  if (appStore.bookingInventory.length === 0) void reloadMerchantContext()
})
</script>
