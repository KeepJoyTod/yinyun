<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="yy-eyebrow">{{ module.eyebrow }}</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">{{ module.title }}</h2>
          <p class="mt-2 max-w-[820px] text-[13.5px] leading-relaxed text-amber-text-muted">{{ module.description }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="yy-action min-h-[42px] rounded-xl border border-amber-topbar-border px-4 py-2 text-[13px] font-semibold text-amber-dark hover:bg-black/5"
            type="button"
            @click="openServiceView"
          >
            打开服务产品
          </button>
          <button
            class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black"
            type="button"
            @click="openAddModal"
          >
            {{ module.addLabel || '新增商品' }}
          </button>
        </div>
      </div>
    </section>

    <NoticeBar :notice="notice" />

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55">
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

      <div class="border-t border-amber-topbar-border p-5">
        <div class="grid grid-cols-1 gap-3 xl:grid-cols-[180px_180px_1fr_1fr_140px]">
          <select v-model="storeFilter" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
            <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
            <option v-for="store in concreteStoreOptions" :key="store" :value="store">{{ store }}</option>
          </select>
          <select v-model="statusFilter" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
            <option value="all">全部状态</option>
            <option value="active">已发布</option>
            <option value="inactive">未发布</option>
            <option value="incomplete">待补规则</option>
          </select>
          <input
            v-model.trim="nicknameQuery"
            class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none"
            placeholder="商品昵称搜索"
            type="search"
          />
          <input
            v-model.trim="nameQuery"
            class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none"
            placeholder="商品名称 / 编号 / 规格搜索"
            type="search"
          />
          <button class="yy-action h-10 border border-amber-topbar-border px-4 text-[11px] text-amber-dark hover:bg-black/5" type="button" @click="resetFilters">
            清空筛选
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 border-t border-amber-topbar-border p-5">
        <button class="yy-action h-10 border border-amber-topbar-border px-4 text-[11px] font-medium text-amber-dark hover:bg-black/5" type="button">
          搜索
        </button>
        <button class="yy-action h-10 border border-amber-topbar-border px-4 text-[11px] font-medium text-amber-dark hover:bg-black/5" type="button" @click="batchPublishFiltered">
          批量上架
        </button>
        <button class="yy-action h-10 border border-amber-dark bg-amber-dark px-4 text-[11px] font-medium text-[#F4EFE6] hover:bg-black" type="button" @click="openAddModal">
          新增商品
        </button>
        <div class="ml-auto text-[10.5px] text-amber-text-muted">显示 {{ filteredItems.length }} / {{ items.length }} 个商品</div>
      </div>
    </section>

    <section v-if="filteredItems.length" class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="yy-console-card overflow-hidden border border-amber-topbar-border bg-amber-content-bg shadow-[0_18px_40px_rgba(26,24,20,0.08)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div class="flex gap-5 border-b border-amber-topbar-border p-5 max-[640px]:flex-col">
          <div class="h-[116px] w-[116px] shrink-0 overflow-hidden rounded-2xl bg-[#EDE6D8]">
            <img :src="item.product?.image" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="border border-amber-topbar-border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ item.product?.id }}</span>
              <span class="rounded-full px-2 py-1 text-[9px] font-semibold" :class="statusBadgeClass(item)">{{ item.stage }}</span>
            </div>
            <h3 class="mt-3 text-[24px] font-sans font-black tracking-[-0.02em] text-amber-dark">{{ item.product?.nickname || item.product?.name }}</h3>
            <p class="mt-1 text-[11px] text-amber-text-muted">{{ item.product?.name }}</p>
            <p class="mt-2 line-clamp-2 text-[11px] leading-relaxed text-amber-text-muted">{{ item.subtitle }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="border border-amber-topbar-border bg-white/70 px-2 py-1 text-[10px] text-amber-dark">{{ item.product?.spec }}</span>
              <span class="border border-amber-topbar-border bg-white/50 px-2 py-1 text-[10px] text-amber-text-muted">{{ bizCategoryLabel(item) }}</span>
              <span class="border border-amber-topbar-border bg-white/50 px-2 py-1 text-[10px] text-amber-text-muted">{{ storeLabel(item) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-4 p-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ module.priceLabel || '价格' }}</div>
              <div class="mt-2 text-[28px] font-sans font-black leading-none text-amber-dark">{{ productMetricValue(item) }}</div>
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ module.quantityLabel || '数量' }}</div>
              <div class="mt-2 text-[24px] font-sans font-black leading-none text-amber-dark">{{ productQuantityValue(item) }}</div>
            </div>
          </div>

          <div class="rounded-2xl border border-amber-topbar-border bg-[#FBF7F0] p-4">
            <div class="text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">上架配置</div>
            <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">{{ item.product?.shelfConfig || '未配置上架入口，建议补齐预约页、门店页和选片加购区说明。' }}</p>
          </div>

          <AlbumProductReadinessPanel
            v-if="isAlbumModule && item.product"
            :readiness="albumReadiness(item.product)"
            @configure="openFulfillmentModal(item.product)"
          />

          <div class="grid gap-3 md:grid-cols-2">
            <button class="yy-action border border-amber-topbar-border px-4 py-3 text-[11px] font-medium text-amber-dark hover:bg-black/5" type="button" @click="openEditModal(item)">
              修改
            </button>
            <button class="yy-action border border-amber-topbar-border px-4 py-3 text-[11px] font-medium text-amber-dark hover:bg-black/5" type="button" @click="openActionModal(item, 'publish')">
              {{ item.product?.active ? '取消发布' : '重新发布' }}
            </button>
            <button class="yy-action border border-amber-topbar-border px-4 py-3 text-[11px] font-medium text-amber-dark hover:bg-black/5" type="button" @click="openActionModal(item, 'shelf')">
              上架配置
            </button>
            <button
              class="yy-action relative flex items-center justify-between border border-amber-topbar-border px-4 py-3 text-[11px] font-medium text-amber-dark hover:bg-black/5"
              type="button"
              @click="toggleActive(item)"
            >
              <span>{{ item.product?.active ? '已上架' : '未上架' }}</span>
              <span class="inline-flex h-[20px] w-[38px] rounded-full transition-colors duration-300" :class="item.product?.active ? 'bg-amber-accent' : 'bg-amber-topbar-border'">
                <span class="mt-[2px] ml-[2px] h-[16px] w-[16px] rounded-full bg-white transition-transform duration-300" :class="item.product?.active ? 'translate-x-[18px]' : 'translate-x-0'"></span>
              </span>
            </button>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="yy-console-card border border-amber-topbar-border bg-amber-content-bg px-6 py-12 text-center">
      <div class="font-sans text-[15px] text-amber-dark">{{ module.emptyTitle }}</div>
      <p class="mt-2 text-[11px] text-amber-text-muted">{{ module.emptyHint }}</p>
    </section>

    <SelectionConfigModal
      :show="modalState.show"
      :mode="modalState.mode"
      :initial-data="modalState.data"
      :spec-options="productSpecOptions"
      :store-options="storeOptions"
      :submitting="submitting"
      :external-error="notice?.type === 'error' ? notice.message : ''"
      @close="closeModal"
      @submit="handleModalSubmit"
    />

    <ProductCardActionModal
      :show="actionState.show"
      :product="actionState.product"
      :initial-action="actionState.action"
      :linkable-products="linkableProducts"
      @close="closeActionModal"
      @edit-product="openEditModalFromProduct"
      @submit="handleActionSubmit"
    />

    <AlbumProductFulfillmentModal
      :show="fulfillmentState.show"
      :product-name="fulfillmentState.product?.name"
      :initial-draft="fulfillmentState.draft"
      :submitting="submitting"
      @close="closeFulfillmentModal"
      @submit="handleFulfillmentSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ProductCollaborationConfigDto, ProductCollaborationConfigPayload } from '../../shared/api/backend'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { useNotice } from '../../shared/composables/useNotice'
import { collaborationStore } from '../../shared/stores/collaborationStore'
import { appDerived, appStore, type ProductConfig } from '../../shared/stores/appStore'
import { buildAlbumProductConfigDraft, buildAlbumProductReadiness } from './albumProductReadiness'
import AlbumProductFulfillmentModal from './components/AlbumProductFulfillmentModal.vue'
import AlbumProductReadinessPanel from './components/AlbumProductReadinessPanel.vue'
import ProductCardActionModal, { type ProductCardActionKey, type ProductCardActionUpdatePayload } from './components/ProductCardActionModal.vue'
import SelectionConfigModal from './components/SelectionConfigModal.vue'
import { buildDerivedProductItems, getDerivedProductModule, type DerivedProductItem } from './derivedProductModules'
import {
  bizCategoryLabel,
  buildCatalogSummaryCards,
  buildDefaultProductCardConfig,
  defaultBizCategoryForModule,
  filterCatalogItems,
  metricValue,
  normalizeStoreFilter as normalizeConcreteStoreFilter,
  quantityValue,
  statusBadgeClass,
  storeLabel,
  type CatalogFilter,
  type ModalSubmitPayload,
} from './productCardCatalogOperations'

const route = useRoute()
const router = useRouter()
const { notice, pushNotice } = useNotice()
const module = computed(() => getDerivedProductModule(String(route.meta.featureKey || route.name || 'product-addon')))
const isAlbumModule = computed(() => module.value.key === 'product-album')
const productSpecOptions = computed(() => appDerived.productSpecOptions.value)
const items = computed(() => buildDerivedProductItems(module.value, appStore.products, appStore.channelProductMappings))
const storeOptions = computed(() => Array.from(new Set(appStore.stores.map(store => store.name).filter(Boolean))))
const concreteStoreOptions = computed(() => storeOptions.value.filter(Boolean))
const nicknameQuery = ref('')
const nameQuery = ref('')
const storeFilter = ref('')
const statusFilter = ref<CatalogFilter>('all')
const submitting = ref(false)
const albumConfigsLoaded = ref(false)
const normalizeStoreFilter = (preferred = storeFilter.value) => normalizeConcreteStoreFilter(preferred, concreteStoreOptions.value)

watchEffect(() => {
  if (!storeFilter.value && concreteStoreOptions.value.length) {
    storeFilter.value = normalizeStoreFilter()
  }
})
const modalState = ref({
  show: false,
  mode: 'add' as 'add' | 'edit',
  data: null as ProductConfig | null,
})
const actionState = ref({
  show: false,
  action: 'publish' as ProductCardActionKey,
  product: null as ProductConfig | null,
})
const fulfillmentState = ref({
  show: false,
  product: null as ProductConfig | null,
  draft: null as ProductCollaborationConfigPayload | null,
})
const linkableProducts = computed(() =>
  appStore.products.map(product => ({
    id: product.id,
    name: product.nickname || product.name,
    category: String(product.bizCategory || 'SERVICE').toUpperCase(),
  })),
)
const scopedItems = computed(() =>
  items.value.filter(item => !storeFilter.value || item.storeName === storeFilter.value),
)
const filteredItems = computed(() => filterCatalogItems(scopedItems.value, {
  storeFilter: storeFilter.value,
  statusFilter: statusFilter.value,
  nicknameQuery: nicknameQuery.value,
  nameQuery: nameQuery.value,
}))
const cards = computed(() => buildCatalogSummaryCards(module.value.title, scopedItems.value))
const defaultBizCategory = computed(() => defaultBizCategoryForModule(module.value.key))
const albumConfigMap = computed<Record<string, ProductCollaborationConfigDto>>(() =>
  Object.fromEntries(collaborationStore.productConfigs.map(item => [String(item.productId), item])),
)

const ensureAlbumConfigs = async () => {
  if (!isAlbumModule.value || albumConfigsLoaded.value) return
  try {
    await collaborationStore.loadProductConfigs()
    albumConfigsLoaded.value = true
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '加载入册履约配置失败')
  }
}

onMounted(() => {
  void ensureAlbumConfigs()
})

watch(isAlbumModule, value => {
  if (value) void ensureAlbumConfigs()
})

const resetFilters = () => {
  nicknameQuery.value = ''
  nameQuery.value = ''
  storeFilter.value = normalizeStoreFilter()
  statusFilter.value = 'all'
}

const productMetricValue = (item: DerivedProductItem) => metricValue(module.value, item)
const productQuantityValue = (item: DerivedProductItem) => quantityValue(module.value, item)

const albumReadiness = (product: ProductConfig) =>
  buildAlbumProductReadiness(product, product.backendId ? albumConfigMap.value[String(product.backendId)] : undefined)

const openServiceView = () => {
  router.push('/product/service')
}

const openAddModal = () => {
  modalState.value = {
    show: true,
    mode: 'add',
    data: buildDefaultProductCardConfig(module.value, defaultBizCategory.value),
  }
}

const openEditModal = (item: DerivedProductItem) => {
  if (!item.product) return
  modalState.value = {
    show: true,
    mode: 'edit',
    data: { ...item.product },
  }
}

const openEditModalFromProduct = (product: ProductConfig) => {
  modalState.value = {
    show: true,
    mode: 'edit',
    data: { ...product },
  }
  actionState.value.show = false
}

const openActionModal = (item: DerivedProductItem, action: ProductCardActionKey) => {
  if (!item.product) return
  actionState.value = {
    show: true,
    action,
    product: { ...item.product },
  }
}

const openFulfillmentModal = (product: ProductConfig) => {
  if (!product.backendId) {
    pushNotice('error', '请先保存入册商品，再配置履约流程')
    return
  }
  fulfillmentState.value = {
    show: true,
    product: { ...product },
    draft: buildAlbumProductConfigDraft(product, albumConfigMap.value[String(product.backendId)] ?? null),
  }
}

const closeModal = () => {
  if (submitting.value) return
  modalState.value.show = false
}

const closeActionModal = () => {
  if (submitting.value) return
  actionState.value.show = false
}

const closeFulfillmentModal = () => {
  if (submitting.value) return
  fulfillmentState.value.show = false
}

const handleModalSubmit = async ({ values, imageFiles }: ModalSubmitPayload) => {
  submitting.value = true
  try {
    let image = values.image
    if (imageFiles.image) image = await appStore.uploadProductCover(imageFiles.image)
    if (modalState.value.mode === 'add') {
      await appStore.updateProduct({
        ...values,
        image,
        bizCategory: values.bizCategory || defaultBizCategory.value,
        active: values.publishMode !== 'DRAFT',
        publishStatus: values.publishMode === 'DRAFT' ? 'UNPUBLISHED' : 'PUBLISHED',
        mutuallyExclusiveRule: '',
        linkedProductIds: [],
        linkedProductNames: [],
        shelfConfig: values.storeNames.length ? `${values.storeNames.join('、')} / ${buildDefaultProductCardConfig(module.value, defaultBizCategory.value).shelfConfig || ''}` : buildDefaultProductCardConfig(module.value, defaultBizCategory.value).shelfConfig,
        orderLimitRule: '',
      })
      pushNotice('success', `已创建${module.value.title}：${values.name}`)
    } else {
      await appStore.updateProduct({
        ...modalState.value.data,
        ...values,
        image,
        bizCategory: values.bizCategory || modalState.value.data?.bizCategory || defaultBizCategory.value,
        active: values.publishMode !== 'DRAFT',
        publishStatus: values.publishMode === 'DRAFT' ? 'UNPUBLISHED' : 'PUBLISHED',
      } as ProductConfig)
      pushNotice('success', `已更新${module.value.title}：${values.name}`)
    }
    modalState.value.show = false
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

const handleActionSubmit = async (payload: ProductCardActionUpdatePayload) => {
  submitting.value = true
  try {
    const linkedProducts = appStore.products.filter(item => payload.linkedProductIds.includes(item.id))
    await appStore.updateProduct({
      ...payload.product,
      active: payload.published,
      publishStatus: payload.published ? 'PUBLISHED' : 'UNPUBLISHED',
      mutuallyExclusiveRule: payload.mutuallyExclusiveRule,
      linkedProductIds: payload.linkedProductIds,
      linkedProductNames: linkedProducts.map(item => item.nickname || item.name),
      shelfConfig: payload.shelfConfig,
      orderLimitRule: payload.orderLimitRule,
    })
    actionState.value.show = false
    pushNotice('success', `${payload.product.name} 配置已更新`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '保存配置失败')
  } finally {
    submitting.value = false
  }
}

const handleFulfillmentSubmit = async (payload: ProductCollaborationConfigPayload) => {
  const product = fulfillmentState.value.product
  if (!product?.backendId) {
    pushNotice('error', '缺少商品主键，无法保存履约配置')
    return
  }
  submitting.value = true
  try {
    await collaborationStore.saveProductConfig(product.backendId, {
      ...payload,
      productId: product.backendId,
    })
    fulfillmentState.value.show = false
    albumConfigsLoaded.value = true
    pushNotice('success', `${product.name} 履约配置已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '保存履约配置失败')
  } finally {
    submitting.value = false
  }
}

const batchPublishFiltered = async () => {
  const targets = filteredItems.value
    .map(item => item.product)
    .filter((product): product is ProductConfig => Boolean(product && !product.active))
  if (!targets.length) {
    pushNotice('error', '当前筛选下没有可批量上架的商品')
    return
  }
  try {
    for (const product of targets) {
      await appStore.toggleProductActive(product)
    }
    pushNotice('success', `已批量上架 ${targets.length} 个商品`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '批量上架失败')
  }
}

const toggleActive = async (item: DerivedProductItem) => {
  if (!item.product) return
  try {
    const next = await appStore.toggleProductActive(item.product)
    pushNotice('success', `${next.name} 已${next.active ? '上架' : '下架'}`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '状态切换失败')
  }
}
</script>
