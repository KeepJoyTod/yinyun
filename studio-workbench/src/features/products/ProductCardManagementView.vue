<template>
  <div class="flex flex-col gap-7">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="yy-eyebrow">卡项产品</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">卡项产品</h2>
          <p class="mt-2 max-w-[820px] text-[13.5px] leading-relaxed text-amber-text-muted">
            统一管理次卡、共享次卡与储值卡，卡项配置会沉淀到商品主数据，便于后续和服务产品、附加产品、订单卡项联动。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button class="yy-action min-h-[42px] rounded-xl border border-amber-topbar-border px-4 py-2 text-[13px] font-semibold text-amber-dark hover:bg-black/5" type="button" @click="openAdd('times')">
            添加次卡
          </button>
          <button class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black" type="button" @click="openAdd('stored')">
            添加储值卡
          </button>
        </div>
      </div>
    </section>

    <NoticeBar :notice="notice" />

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/55 p-5">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
        <input
          v-model.trim="searchQuery"
          class="yy-field"
          placeholder="请输入卡项名称 / 编号"
          type="search"
          @keydown.enter="applySearchFilter"
        />
        <button class="yy-action h-10 rounded-[14px] border border-amber-dark bg-amber-dark text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="applySearchFilter">
          搜索
        </button>
      </div>
    </section>

    <section class="yy-console-card overflow-hidden border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex flex-wrap items-center gap-1 border-b border-amber-topbar-border bg-[#FBF7F0] px-4 pt-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="yy-action rounded-t-xl border border-b-0 px-4 py-3 text-[12px] font-semibold"
          :class="activeTab === tab.key ? 'border-amber-accent bg-white text-amber-accent' : 'border-transparent text-amber-text-muted hover:text-amber-dark'"
          type="button"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1080px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-white/80 text-left">
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">卡项</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">权益范围</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">有效期</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">金额</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">生效方式</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">状态</th>
              <th class="px-5 py-4 text-[11px] text-amber-text-muted">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="row in filteredRows" :key="row.product.id" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4 align-top">
                <div class="text-[12px] font-semibold text-amber-dark">{{ row.product.name }}</div>
                <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ row.product.id }}</div>
                <div class="mt-2 inline-flex rounded-full border border-amber-topbar-border bg-[#FBF7F0] px-2 py-1 text-[10px] text-amber-text-muted">
                  {{ row.typeLabel }}
                </div>
              </td>
              <td class="px-5 py-4 text-[11px] leading-relaxed text-amber-text-muted">
                {{ row.scopeSummary }}
              </td>
              <td class="px-5 py-4 text-[11px] text-amber-text-muted">{{ row.validitySummary }}</td>
              <td class="px-5 py-4 text-[11px] font-mono text-amber-dark">{{ row.amountSummary }}</td>
              <td class="px-5 py-4 text-[11px] text-amber-text-muted">{{ row.activationSummary }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full px-2 py-1 text-[10px] font-semibold" :class="row.product.active ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'">
                  {{ row.product.active ? '已发布' : '草稿 / 停用' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex flex-wrap items-center gap-2">
                  <button class="yy-action rounded-[12px] border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="openEdit(row.product)">
                    编辑
                  </button>
                  <button class="yy-action rounded-[12px] border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="toggleActive(row.product)">
                    {{ row.product.active ? '停用' : '启用' }}
                  </button>
                  <button
                    class="yy-action rounded-[12px] border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-text-muted hover:bg-black/5"
                    type="button"
                    :title="cardActionDisabledReasons.publicLink"
                    @click="showPublicLinkUnavailable"
                  >
                    客户链接
                  </button>
                  <button
                    class="yy-action rounded-[12px] border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    :title="cardActionDisabledReasons.douyinMapping"
                    @click="openDouyinMappingDiagnostics"
                  >
                    抖音映射
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="7" class="px-5 py-12 text-center text-[12px] text-amber-text-muted">
                <div>当前筛选条件下没有卡项数据</div>
                <div class="mt-3 flex items-center justify-center gap-3">
                  <button class="yy-action rounded-xl border border-amber-topbar-border px-4 py-2 text-[12px] font-semibold text-amber-dark hover:bg-black/5" type="button" @click="openAdd('times')">
                    添加次卡
                  </button>
                  <button class="yy-action rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] hover:bg-black" type="button" @click="openAdd('stored')">
                    添加储值卡
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CardProductModal
      :show="modalState.show"
      :mode="modalState.mode"
      :card-type="modalState.cardType"
      :initial-data="modalState.data"
      :product-options="linkableProductOptions"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import CardProductModal from './components/CardProductModal.vue'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { useNotice } from '../../shared/composables/useNotice'
import { appStore, type ProductConfig } from '../../shared/stores/appStore'

type CardTabKey = 'all' | 'times' | 'shared' | 'stored'
type CardModalType = 'times' | 'stored'

const tabs: { key: CardTabKey; label: string }[] = [
  { key: 'all', label: '全部卡项' },
  { key: 'times', label: '单项次卡' },
  { key: 'shared', label: '共享次卡' },
  { key: 'stored', label: '储值卡' },
]

const searchQuery = ref('')
const activeTab = ref<CardTabKey>('all')
const submitting = ref(false)
const router = useRouter()
const { notice, pushNotice } = useNotice()
const cardActionDisabledReasons = {
  publicLink: '客户公开卡产品链接暂未接入后端 API，当前不生成假链接。',
  douyinMapping: '前往抖音产品页查看 DOUYIN_LIFE 商品、SKU、POI 和落地页映射。',
} as const

const cardProducts = computed(() =>
  appStore.products.filter(product => String(product.bizCategory ?? '').trim().toUpperCase() === 'CARD'),
)

const currentConcreteStore = computed(() =>
  appStore.stores.find(store => store.backendId && store.name),
)

const linkableProductOptions = computed(() =>
  appStore.products
    .filter(product => product.bizCategory !== 'CARD')
    .map(product => ({
      id: product.id,
      name: product.name,
      bizCategory: product.bizCategory,
    })),
)

const classifyCardType = (product: ProductConfig): CardTabKey => {
  if (product.cardMode === 'STORED') return 'stored'
  if (product.cardTimesType === 'SHARED') return 'shared'
  return 'times'
}

const toValiditySummary = (product: ProductConfig) => {
  if (product.cardValidityMode === 'AFTER_ACTIVATION') return `激活后 ${Math.max(1, Number(product.cardValidityDays) || 0)} 天`
  if (product.cardValidityMode === 'FIXED_DATE') return product.cardValidityDate || '未设置'
  return '永久有效'
}

const toScopeSummary = (product: ProductConfig) => {
  if (product.cardMode === 'STORED' && product.cardProductScope === 'ALL') return '全部产品'
  const items = product.cardServiceItems ?? []
  const names = items.map(item => item.productName).filter(Boolean)
  if (!names.length) return '未配置'
  if (product.cardMode === 'TIMES') {
    return names
      .map((name, index) => {
        const count = items[index]?.count
        return `${name}${count ? ` x${count}` : ''}`
      })
      .join(' / ')
  }
  return names.join(' / ')
}

const toAmountSummary = (product: ProductConfig) => {
  if (product.cardMode === 'STORED') {
    const recharge = product.cardRechargeAmount || product.price || '0'
    const gift = product.cardGiftAmount || '0'
    return `充 ${recharge} / 赠 ${gift}`
  }
  return `售价 ${product.cardSalePrice || product.price || '0'}`
}

const toActivationSummary = (product: ProductConfig) =>
  product.cardActivationMode === 'MANUAL' ? '售后手动激活' : '售卡即生效'

const cardRows = computed(() =>
  cardProducts.value.map(product => {
    const type = classifyCardType(product)
    return {
      product,
      type,
      typeLabel: type === 'stored' ? '储值卡' : type === 'shared' ? '共享次卡' : '单项次卡',
      validitySummary: toValiditySummary(product),
      scopeSummary: toScopeSummary(product),
      amountSummary: toAmountSummary(product),
      activationSummary: toActivationSummary(product),
    }
  }),
)

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return cardRows.value.filter(row => {
    if (activeTab.value !== 'all' && row.type !== activeTab.value) return false
    if (!query) return true
    const haystack = `${row.product.name} ${row.product.id} ${row.typeLabel} ${row.scopeSummary}`.toLowerCase()
    return haystack.includes(query)
  })
})

const applySearchFilter = () => {
  searchQuery.value = searchQuery.value.trim()
}

const modalState = ref<{
  show: boolean
  mode: 'add' | 'edit'
  cardType: CardModalType
  data: ProductConfig | null
}>({
  show: false,
  mode: 'add',
  cardType: 'times',
  data: null,
})

const buildCardDefaults = (type: CardModalType): ProductConfig => ({
  id: '',
  bizCategory: 'CARD',
  name: type === 'stored' ? '储值卡' : '次卡',
  nickname: '',
  image: '',
  listImage: '',
  halfImage: '',
  channels: ['WECHAT'],
  categoryName: '卡项产品',
  allowOnlineBooking: false,
  showInApp: true,
  allowStoreOrder: true,
  selfPayMode: 'PAY',
  fullSlotMode: 'ALLOW',
  durationLabel: '',
  supportSelection: false,
  giftAlbum: false,
  originalPriceLabel: '原价',
  currentPriceLabel: type === 'stored' ? '充值金额' : '售价',
  priceLabelText: '',
  hasSpecs: false,
  consumeCredit: 0,
  ladderPricingText: '',
  depositMode: 'BRAND',
  depositAmount: '',
  intro: '',
  detailButtonMode: 'CUSTOM',
  detailButtonText: type === 'stored' ? '立即开卡' : '立即购卡',
  detailModules: ['TITLE', 'TEXT_NAV'],
  publishMode: 'PUBLISHED',
  spec: type === 'stored' ? '储值卡' : '单项次卡',
  price: '',
  unitPrice: '',
  includedCount: 0,
  active: true,
  desc: '',
  storeBackendId: currentConcreteStore.value?.backendId,
  storeNames: currentConcreteStore.value?.name ? [currentConcreteStore.value.name] : [],
  publishStatus: 'PUBLISHED',
  mutuallyExclusiveRule: '',
  linkedProductIds: [],
  linkedProductNames: [],
  shelfConfig: '',
  orderLimitRule: '',
  cardMode: type === 'stored' ? 'STORED' : 'TIMES',
  cardTimesType: 'SINGLE',
  cardSalePrice: '',
  cardRechargeAmount: '',
  cardGiftAmount: '',
  cardOpeningGiftAmount: '',
  cardProductScope: 'SELECTED',
  cardServiceItems: [{ productId: '', productName: '', count: 1 }],
  cardGiftItems: [{ productId: '', productName: '', count: 1 }],
  cardValidityMode: 'FOREVER',
  cardValidityDays: 365,
  cardValidityDate: '',
  cardActivationMode: 'IMMEDIATE',
})

const openAdd = (kind: CardModalType) => {
  if (!currentConcreteStore.value) {
    pushNotice('error', '请先加载可用门店后再创建卡项')
    return
  }
  modalState.value = {
    show: true,
    mode: 'add',
    cardType: kind,
    data: buildCardDefaults(kind),
  }
}

const openEdit = (product: ProductConfig) => {
  const type = product.cardMode === 'STORED' ? 'stored' : 'times'
  modalState.value = {
    show: true,
    mode: 'edit',
    cardType: type,
    data: { ...product },
  }
}

const closeModal = () => {
  if (submitting.value) return
  modalState.value.show = false
}

const handleModalSubmit = async (payload: ProductConfig) => {
  submitting.value = true
  try {
    await appStore.updateProduct({
      ...(modalState.value.data ?? {}),
      ...payload,
      bizCategory: 'CARD',
      active: payload.publishMode === 'PUBLISHED',
      publishStatus: payload.publishMode === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED',
    })
    pushNotice('success', `${modalState.value.mode === 'add' ? '已创建' : '已更新'}卡项：${payload.name}`)
    modalState.value.show = false
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (product: ProductConfig) => {
  try {
    const next = await appStore.toggleProductActive(product)
    pushNotice('success', `${next.name} 已${next.active ? '启用' : '停用'}`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '状态切换失败')
  }
}

const showPublicLinkUnavailable = () => {
  pushNotice('error', cardActionDisabledReasons.publicLink)
}

const openDouyinMappingDiagnostics = () => {
  router.push({ path: '/product/douyin' })
}
</script>

<style scoped>
/* fade transition styles moved to NoticeBar component */
</style>
