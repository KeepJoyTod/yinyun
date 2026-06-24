<template>
  <div class="flex flex-col gap-7">
    <!-- Header Section (6:129) -->
    <div class="bg-amber-content-bg border border-amber-topbar-border rounded-md p-[24.5px] flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
      <div class="flex flex-col gap-1.5">
        <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">Online Selection</span>
        <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">在线选片配置</h2>
        <p class="text-[10.5px] font-sans text-amber-text-muted mt-1 opacity-70">设置服务产品的入册张数、加片单价与成册规格 · 修改后即时生效</p>
      </div>
      <button
        @click="openAddModal"
        class="yy-action flex items-center gap-2 px-4 py-2 bg-amber-dark text-[#F4EFE6] rounded-md hover:bg-black transition-all"
        type="button"
      >
        <img src="../../assets/icons/add-product.svg" class="w-3.5 h-3.5 invert brightness-200" />
        <span class="text-[11px] font-sans font-medium">新增产品</span>
      </button>
    </div>

    <section class="product-ops-board border border-amber-topbar-border bg-[#FBF8F2]/55">
      <div class="border-b border-amber-topbar-border p-5 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Product Flow</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">产品配置承接</h3>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            先确认在售套餐和选片规则，再补齐缺精修数、加片单价或说明的产品。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickProductFilters"
            :key="filter.key"
            class="yy-action px-3 py-1.5 border rounded-md text-[10.5px] font-sans transition-all"
            :class="activeProductFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeProductFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in productOperationCards"
          :key="item.label"
          class="yy-surface border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
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

    <!-- Product List (6:158) -->
    <div class="flex flex-col gap-[1px] bg-amber-topbar-border border border-amber-topbar-border rounded-md overflow-hidden shadow-sm">
      <div v-for="product in filteredProducts" :key="product.id"
        class="yy-clickable-row bg-amber-content-bg p-5 flex flex-wrap items-center gap-6 group hover:bg-amber-bg/5 transition-colors">
        <!-- Drag Handle (6:160) -->
        <button class="yy-action cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-30 transition-opacity max-[720px]:hidden" type="button" aria-label="拖动排序">
          <img src="../../assets/icons/drag-handle.svg" class="w-4 h-4" />
        </button>

        <!-- Product Image (6:167) -->
        <div class="w-[84px] h-[84px] bg-[#EBE4D6] rounded-md overflow-hidden flex-shrink-0">
          <img :src="product.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>

        <!-- Product Info (6:169) -->
        <div class="flex-1 basis-[260px] min-w-[220px] flex flex-col gap-1.5 max-[640px]:min-w-full">
          <span class="text-[10px] font-mono text-amber-text-muted tracking-wider uppercase opacity-60">{{ product.id }}</span>
          <h3 class="text-[15px] font-sans font-medium text-amber-dark">{{ product.name }}</h3>
          <div class="flex flex-wrap items-center gap-1.5">
            <img src="../../assets/icons/album-icon.svg" class="w-3 h-3 opacity-40" />
            <span class="text-[10px] font-sans text-amber-text-muted opacity-70">{{ product.spec }}</span>
            <span class="border border-amber-topbar-border px-1.5 py-0.5 text-[9px] font-sans text-amber-text-muted">
              {{ productRuleStatus(product) }}
            </span>
          </div>
          <p class="text-[10px] font-sans leading-relaxed text-amber-text-muted opacity-70 line-clamp-2">{{ product.desc }}</p>
        </div>

        <!-- Pricing Info (6:180 / 6:185) -->
        <div class="w-32 flex flex-col gap-1 max-[720px]:w-[calc(50%_-_12px)] max-[520px]:w-full">
          <span class="text-[10px] font-sans text-amber-text-muted opacity-50 uppercase tracking-widest">套系价</span>
          <span class="text-[15px] font-mono font-medium text-amber-dark">¥ {{ product.price }}</span>
        </div>

        <div class="w-32 flex flex-col gap-1 max-[720px]:w-[calc(50%_-_12px)] max-[520px]:w-full">
          <span class="text-[10px] font-sans text-amber-text-muted opacity-50 uppercase tracking-widest">选片单价</span>
          <span class="text-[15px] font-mono font-medium text-amber-accent">¥ {{ product.unitPrice }} / 张</span>
        </div>

        <!-- In-bundle Info (6:190) -->
        <div class="w-32 flex flex-col gap-1 max-[720px]:w-[calc(50%_-_12px)] max-[520px]:w-full">
          <span class="text-[10px] font-sans text-amber-text-muted opacity-50 uppercase tracking-widest">含精修</span>
          <span class="text-[15px] font-mono font-medium text-amber-dark">{{ product.includedCount }} 张</span>
        </div>

        <!-- Actions (6:195) -->
        <div class="flex items-center gap-3 pl-6 max-[720px]:w-full max-[720px]:justify-between max-[720px]:pl-0">
          <span class="hidden text-[11px] font-sans text-amber-text-muted max-[720px]:block">{{ productNextAction(product) }}</span>
          <button
            @click="openEditModal(product)"
            class="yy-action w-8 h-8 flex items-center justify-center border border-amber-topbar-border rounded-md hover:bg-black/5 transition-all"
            type="button"
            aria-label="编辑产品配置"
          >
            <img src="../../assets/icons/edit-config.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
          
          <!-- Status Toggle (6:200) -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleActive(product)"
              class="yy-action relative w-[34px] h-[18px] rounded-full transition-colors duration-300 focus:outline-none"
              :class="product.active ? 'bg-amber-accent' : 'bg-amber-topbar-border'"
              type="button"
              :aria-label="product.active ? '下架产品' : '上架产品'"
            >
              <span
                class="absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform duration-300"
                :class="product.active ? 'translate-x-[16px]' : 'translate-x-0'"
              ></span>
            </button>
            <span class="text-[11px] font-sans text-amber-text-muted w-8">{{ product.active ? '上架' : '下架' }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="filteredProducts.length === 0"
        class="bg-amber-content-bg p-8 text-center"
      >
        <div class="text-[15px] font-sans text-amber-dark">当前筛选下没有产品</div>
        <p class="mt-2 text-[11px] font-sans text-amber-text-muted">切回全部产品，或新增一个可选片套餐。</p>
        <button
          class="yy-action mt-4 border border-amber-topbar-border px-4 py-2 text-[11px] font-sans text-amber-dark hover:bg-black/5"
          type="button"
          @click="activeProductFilter = 'all'"
        >
          查看全部产品
        </button>
      </div>
    </div>

    <!-- Config Modal -->
    <SelectionConfigModal
      :show="modalState.show"
      :mode="modalState.mode"
      :initial-data="modalState.data"
      :spec-options="productSpecOptions"
      @close="modalState.show = false"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SelectionConfigModal from './components/SelectionConfigModal.vue'
import { appDerived, appStore, type ProductConfig } from '../../shared/stores/appStore'

const products = computed(() => appStore.products)
const productSpecOptions = computed(() => appDerived.productSpecOptions.value)
const monthExtraRevenue = computed(() =>
  (appStore.selectionStats.monthExtraRevenueCents / 100).toLocaleString('zh-CN', { maximumFractionDigits: 0 }),
)
const averageExtraCount = computed(() => {
  const fixed = appStore.selectionStats.averageExtraCount.toFixed(1)
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed
})
const activeProductFilter = ref<'all' | 'active' | 'inactive' | 'incomplete'>('all')

const toMoneyNumber = (value: string) => Number(String(value).replace(/,/g, '')) || 0
const productNeedsRule = (product: ProductConfig) =>
  product.includedCount <= 0 || toMoneyNumber(product.unitPrice) <= 0 || !product.desc.trim()

const activeProducts = computed(() => products.value.filter(product => product.active))
const inactiveProducts = computed(() => products.value.filter(product => !product.active))
const incompleteProducts = computed(() => products.value.filter(productNeedsRule))

const filteredProducts = computed(() => {
  if (activeProductFilter.value === 'active') return activeProducts.value
  if (activeProductFilter.value === 'inactive') return inactiveProducts.value
  if (activeProductFilter.value === 'incomplete') return incompleteProducts.value
  return products.value
})

const quickProductFilters = computed(() => [
  { key: 'all' as const, label: '全部产品', count: products.value.length },
  { key: 'active' as const, label: '在售产品', count: activeProducts.value.length },
  { key: 'inactive' as const, label: '已下架', count: inactiveProducts.value.length },
  { key: 'incomplete' as const, label: '待补规则', count: incompleteProducts.value.length },
])

const productOperationCards = computed(() => [
  {
    label: '在售产品',
    value: `${activeProducts.value.length}/${products.value.length}`,
    hint: '当前客户可预约或可生成选片入口的产品。',
    action: '核对上架',
    scope: '在售',
  },
  {
    label: '待补规则',
    value: String(incompleteProducts.value.length),
    hint: '缺精修数、加片单价或产品说明的配置。',
    action: '先补齐',
    scope: '规则',
  },
  {
    label: '本月加片营收',
    value: `¥${monthExtraRevenue.value}`,
    hint: '选片加片带来的本月增收统计。',
    action: '看转化',
    scope: '加片',
  },
  {
    label: '平均加片张数',
    value: `+${averageExtraCount.value}`,
    hint: '客户每单平均额外选择的照片张数。',
    action: '调规则',
    scope: '均值',
  },
])

const productRuleStatus = (product: ProductConfig) => (productNeedsRule(product) ? '规则待补' : '规则完整')
const productNextAction = (product: ProductConfig) => {
  if (productNeedsRule(product)) return '补齐选片规则'
  if (!product.active) return '检查后上架'
  return '可用于客户选片'
}

const modalState = ref({
  show: false,
  mode: 'add' as 'add' | 'edit',
  data: null as any
})

const openAddModal = () => {
  modalState.value = {
    show: true,
    mode: 'add',
    data: null
  }
}

const openEditModal = (product: any) => {
  modalState.value = {
    show: true,
    mode: 'edit',
    data: { ...product }
  }
}

const handleModalSubmit = async (data: any) => {
  if (modalState.value.mode === 'add') {
    await appStore.addProduct({ ...data })
  } else {
    await appStore.updateProduct({ ...modalState.value.data, ...data })
  }
  modalState.value.show = false
}

const toggleActive = async (product: ProductConfig) => {
  await appStore.toggleProductActive(product)
}
</script>
