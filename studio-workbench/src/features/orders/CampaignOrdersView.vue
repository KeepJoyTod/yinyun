<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Campaign Orders</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">活动订单</h2>
          <p class="mt-1 max-w-[800px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            从统一订单表 yy_order 派生活动订单视图，按抖音来客、微信扫码、门店线索等活动来源跟进订单，不在门店工作台创建客户预约。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="goOrders"
        >
          打开统一订单
        </button>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            class="yy-action border px-3 py-1.5 text-[10.5px] font-sans transition-all"
            :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm">
          <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="storeFilter"
              class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none"
            >
              <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
              <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">{{ store.name }}</option>
            </select>
            <select
              v-model="channelFilter"
              class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none"
            >
              <option value="all">全部渠道</option>
              <option v-for="channel in channelOptions" :key="channel" :value="channel">{{ channel }}</option>
            </select>
            <input
              v-model="searchQuery"
              class="h-8 w-[260px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[520px]:w-full"
              placeholder="搜索客户、手机号、订单号、活动"
              type="text"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">
            展示 {{ filteredCampaignOrders.length }} 条，待跟进 {{ followUpOrders.length }} 条
          </div>
        </div>

        <div v-if="filteredCampaignOrders.length" class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">活动 / 渠道</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">订单</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">客户</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">门店 / 服务</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">金额</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">动作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="item in filteredCampaignOrders"
                :key="item.order.id"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedItem?.order.id === item.order.id ? 'bg-[#FBF8F2]' : ''"
                @click="selectedItem = item"
              >
                <td class="px-5 py-4">
                  <div class="text-[11px] font-semibold text-amber-dark">{{ item.campaignName }}</div>
                  <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ item.channelCode }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="font-mono text-[10.5px] text-amber-dark">{{ item.order.id }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">下单 {{ item.order.orderTime || '暂无' }}</div>
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
                  <span class="px-2 py-0.5 text-[10px]" :class="statusClass(item.order.status)">
                    {{ item.order.status }}
                  </span>
                  <span class="ml-2 px-2 py-0.5 text-[10px]" :class="paymentClass(item.order.payment)">
                    {{ item.order.payment }}
                  </span>
                </td>
                <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">¥ {{ item.order.amount.toLocaleString('zh-CN') }}</td>
                <td class="px-5 py-4">
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click.stop="openOrder(item.order)"
                  >
                    跟进订单
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有活动订单</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部活动，或者到统一订单页查看原始订单。</p>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <CampaignOrderLinkPanel :summary="bridgeSummary" />

        <aside class="border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Campaign Detail</span>
            <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">活动跟进详情</h3>
          </div>

          <div v-if="selectedItem" class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[12px] font-semibold text-amber-dark">{{ selectedItem.campaignName }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedItem.order.id }} · {{ selectedItem.order.source }}</div>
              </div>
              <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-0.5 text-[10px] text-amber-text-muted">
                {{ selectedItem.channelCode }}
              </span>
            </div>

            <dl class="mt-5 space-y-4">
              <div>
                <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Customer</dt>
                <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-dark">
                  {{ selectedItem.order.customer || '缺客户姓名' }} · {{ selectedItem.order.phone || '缺手机号' }}
                </dd>
              </div>
              <div>
                <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Progress</dt>
                <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.progressHint }}</dd>
              </div>
              <div>
                <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
                <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
              </div>
              <div>
                <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Appointment</dt>
                <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-dark">{{ selectedItem.appointmentLabel }}</dd>
              </div>
            </dl>

            <button
              class="yy-action mt-6 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black"
              type="button"
              @click="openOrder(selectedItem.order)"
            >
              到统一订单页处理
            </button>

            <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
              <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
              <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
                活动订单视图只读取统一订单数据，不建立第二套订单账本；优惠券、活动清单和参与记录后续在营销模块接真实表。
              </p>
            </div>
          </div>

          <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
            选择一条活动订单后，可以查看客户、活动来源、当前进度和下一步处理建议。
          </div>
        </aside>

        <PromotionTrialPanel :order="selectedItem?.order ?? null" :customer="selectedCustomer" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import CampaignOrderLinkPanel from '../marketing/components/CampaignOrderLinkPanel.vue'
import PromotionTrialPanel from '../marketing/components/PromotionTrialPanel.vue'
import { buildCampaignOrderBridgeSummary } from '../marketing/campaignOrderBridge'
import {
  getOrderOperationalDate,
  hasCustomerContact,
  isMissingArrivalSchedule,
} from '../../shared/stores/orderIssueRules'

type CampaignFilter = 'all' | 'paid' | 'pending' | 'today' | 'follow'

type CampaignOrderItem = {
  order: BookingOrder
  campaignName: string
  channelCode: string
  appointmentLabel: string
  progressHint: string
  nextAction: string
}

const router = useRouter()
const activeFilter = ref<CampaignFilter>('all')
const storeFilter = ref('')
const channelFilter = ref('all')
const searchQuery = ref('')
const selectedItem = ref<CampaignOrderItem | null>(null)

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayKey = localDateKey()
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const normalizeStoreFilter = (preferred = storeFilter.value) => {
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

const resolveCampaignName = (order: BookingOrder) => {
  if (order.source.includes('抖音')) return '抖音来客团购 / 预约转化'
  if (order.source.includes('微信')) return '微信扫码预约转化'
  if (order.source.includes('美团')) return '美团团购转化'
  if (order.source.includes('手工')) return '门店线索手工跟进'
  return `${order.source || '未知来源'}活动转化`
}

const resolveChannelCode = (order: BookingOrder) => {
  if (order.source.includes('抖音来客')) return 'DOUYIN_LIFE'
  if (order.source.includes('抖音')) return 'DOUYIN'
  if (order.source.includes('微信')) return 'WECHAT'
  if (order.source.includes('美团')) return 'MEITUAN'
  if (order.source.includes('手工')) return 'MANUAL'
  return 'LOCAL'
}

const resolveNextAction = (order: BookingOrder) => {
  if (!hasCustomerContact(order)) return '先补齐客户姓名和手机号，再进入门店处理流。'
  if (order.payment === '待支付') return '联系客户补支付，确认是否继续保留预约时段。'
  if (order.status === '待确认') return '确认客户到店时间，必要时在统一订单页改期。'
  if (order.status === '已确认') return '客户到店后在统一订单页标记到店。'
  if (order.status === '已到店') return '开始服务后推进到服务中。'
  if (order.status === '服务中') return '服务完成后在统一订单页完成服务。'
  if (order.status === '拍摄中') return '旧状态订单：拍摄完成后在统一订单页完成服务。'
  if (order.status === '选片中') return '跟进客户选片，完成后进入客片交付。'
  return '查看统一订单详情，按门店 SOP 继续处理。'
}

const resolveAppointmentLabel = (order: BookingOrder) => {
  if (order.arrivalTime) return `${order.arrivalTime} 到店`
  const operationalDate = getOrderOperationalDate(order)
  if (operationalDate) return `未预约，按 ${operationalDate} 处理`
  return '暂无预约时间'
}

const campaignOrders = computed<CampaignOrderItem[]>(() =>
  appStore.orders.map(order => ({
    order,
    campaignName: resolveCampaignName(order),
    channelCode: resolveChannelCode(order),
    appointmentLabel: resolveAppointmentLabel(order),
    progressHint: `${order.orderTime || '暂无下单时间'} 下单，${resolveAppointmentLabel(order)}，来源 ${order.source || '未知'}`,
    nextAction: resolveNextAction(order),
  })),
)

const scopedCampaignOrders = computed(() =>
  campaignOrders.value.filter(item => storeFilter.value && String(item.order.storeBackendId) === storeFilter.value),
)

const followUpOrders = computed(() =>
  scopedCampaignOrders.value.filter(item =>
    item.order.status === '待确认'
    || item.order.payment === '待支付'
    || !hasCustomerContact(item.order)
    || isMissingArrivalSchedule(item.order),
  ),
)

const paidOrders = computed(() => scopedCampaignOrders.value.filter(item => item.order.payment === '已支付'))
const pendingOrders = computed(() => scopedCampaignOrders.value.filter(item => item.order.payment !== '已支付'))
const todayOrders = computed(() => scopedCampaignOrders.value.filter(item => getOrderOperationalDate(item.order) === todayKey))
const channelOptions = computed(() => Array.from(new Set(scopedCampaignOrders.value.map(item => item.channelCode))))

const filteredCampaignOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return scopedCampaignOrders.value.filter(item => {
    if (activeFilter.value === 'paid' && item.order.payment !== '已支付') return false
    if (activeFilter.value === 'pending' && item.order.payment === '已支付') return false
    if (activeFilter.value === 'today' && getOrderOperationalDate(item.order) !== todayKey) return false
    if (activeFilter.value === 'follow' && !followUpOrders.value.some(o => o.order.id === item.order.id)) return false
    if (channelFilter.value !== 'all' && item.channelCode !== channelFilter.value) return false
    if (!query) return true
    const haystack = `${item.campaignName} ${item.channelCode} ${item.order.id} ${item.order.customer} ${item.order.phone} ${item.order.store} ${item.order.service} ${item.order.source}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部活动', count: scopedCampaignOrders.value.length },
  { key: 'paid' as const, label: '已支付', count: paidOrders.value.length },
  { key: 'pending' as const, label: '待支付', count: pendingOrders.value.length },
  { key: 'today' as const, label: '今日处理', count: todayOrders.value.length },
  { key: 'follow' as const, label: '待跟进', count: followUpOrders.value.length },
])

const bridgeSummary = computed(() => buildCampaignOrderBridgeSummary(scopedCampaignOrders.value.map(item => item.order)))
const selectedCustomer = computed(() => appStore.customers.find(customer => customer.mobile === selectedItem.value?.order.phone) ?? null)

const cards = computed(() => {
  const amount = scopedCampaignOrders.value.reduce((sum, item) => sum + item.order.amount, 0)
  const paidAmount = paidOrders.value.reduce((sum, item) => sum + item.order.amount, 0)
  return [
    {
      label: '活动订单',
      value: String(scopedCampaignOrders.value.length),
      hint: '当前门店统一订单表中可归因到活动和渠道来源的订单。',
      scope: 'yy_order',
    },
    {
      label: '已支付金额',
      value: `¥${paidAmount.toLocaleString('zh-CN')}`,
      hint: '已支付活动订单的金额汇总，用于门店当天跟进。',
      scope: 'PAID',
    },
    {
      label: '待跟进',
      value: String(followUpOrders.value.length),
      hint: '待确认、待支付、缺客户资料或非来客订单缺预约时间的活动订单。',
      scope: '处理',
    },
    {
      label: '活动总额',
      value: `¥${amount.toLocaleString('zh-CN')}`,
      hint: '当前加载范围内活动订单总金额。',
      scope: 'AMOUNT',
    },
  ]
})

const statusClass = (status: string) => {
  if (status === '待确认') return 'border border-amber-topbar-border bg-[#FBF8F2] text-amber-text-muted'
  if (status === '已确认') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  if (status === '拍摄中') return 'bg-[#1A1814] text-[#F4EFE6]'
  return 'border border-amber-topbar-border bg-white text-amber-dark'
}

const paymentClass = (payment: string) =>
  payment === '已支付'
    ? 'bg-[#EBF4ED] text-[#2D7A4D]'
    : 'bg-[#B8543B]/10 text-[#8C3E2C]'

const goOrders = () => {
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      storeId: storeFilter.value || undefined,
    },
  })
}

const openOrder = (order: BookingOrder) => {
  router.push({
    path: '/order/appointment',
    query: {
      q: order.id,
      quick: 'all',
      storeId: order.storeBackendId || storeFilter.value || undefined,
    },
  })
}

watch(
  filteredCampaignOrders,
  orders => {
    if (!orders.some(item => item.order.id === selectedItem.value?.order.id)) selectedItem.value = orders[0] ?? null
  },
  { immediate: true },
)

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
