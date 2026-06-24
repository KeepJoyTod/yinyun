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

      <MerchantOverviewMetricsPanel :metrics="overviewMetrics" />
    </section>

    <div class="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] gap-5 max-[1020px]:grid-cols-1">
      <section class="border border-amber-topbar-border bg-[#FBF8F2]">
        <div class="flex items-center justify-between border-b border-amber-topbar-border px-5 py-4">
          <div>
            <div class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">门店运营</div>
            <h3 class="mt-2 text-[17px] font-semibold leading-none text-amber-dark">门店经营概况</h3>
          </div>
          <RouterLink class="yy-action text-[12px] font-medium text-amber-text-muted hover:text-amber-dark" :to="storeRoute">
            门店资料 ->
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
              <div class="mt-0.5 truncate text-[11px] text-amber-text-muted">商品 {{ item.mappingCount }} 路 可投放 {{ item.readyCount }} 路 POI {{ item.poiIds.length }}</div>
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
import { RouterLink } from 'vue-router'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import MerchantOverviewMetricsPanel from './modules/core/components/MerchantOverviewMetricsPanel.vue'
import { useMerchantCoreState } from './modules/core/composables/useMerchantCoreState'

const {
  selectedStoreId,
  concreteStoreOptions,
  storeRoute,
  storeRows,
  douyinStoreBindings,
  overviewMetrics,
  reloadMerchantContext,
  storeTodayOrders,
  storeFillRate,
  statusClass,
} = useMerchantCoreState()
</script>
