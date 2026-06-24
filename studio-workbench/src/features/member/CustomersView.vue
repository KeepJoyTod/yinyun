<template>
  <div class="flex flex-col gap-7">
    <div class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Customer Archive</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">客户档案</h2>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            聚合客户来源、标签、消费、最近订单和回访备注，给门店跟进和选片交付提供上下文。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="openCreate"
        >
          新增客户
        </button>
      </div>
    </div>

    <NoticeBanner :notice="notice" />

    <section class="customer-ops-board border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickCustomerFilters"
            :key="filter.key"
            class="yy-action yy-filter-chip"
            :class="activeCustomerFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeCustomerFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in cards"
          :key="item.label"
          class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
        >
          <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ item.label }}</div>
          <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ item.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ item.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[920px]:flex-col max-[920px]:items-start">
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="sourceFilter"
            class="yy-field-sm"
          >
            <option value="all">全部来源</option>
            <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
          </select>
          <select
            v-model="levelFilter"
            class="yy-field-sm"
          >
            <option value="all">全部等级</option>
            <option v-for="level in levelOptions" :key="level" :value="level">{{ level }}</option>
          </select>
          <input
            v-model="searchQuery"
            class="yy-field-sm w-[240px] max-[720px]:w-full"
            placeholder="搜索客户姓名 / 手机号 / 标签"
            type="text"
          />
        </div>
        <button
          class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">客户</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">来源 / 等级</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">标签</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">订单 / 消费</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">最近订单</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr v-for="customer in filteredCustomers" :key="customer.backendId" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4">
                <div class="flex flex-col">
                  <span class="text-[12px] font-medium text-amber-dark">{{ customer.name }}</span>
                  <span class="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ customer.mobile }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-[11px] text-amber-dark">
                <div>{{ customer.source }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ customer.memberLevel }}</div>
              </td>
              <td class="px-5 py-4 text-[11px] text-amber-text-muted">{{ customer.tags.join(' / ') || '—' }}</td>
              <td class="px-5 py-4 text-[11px] text-amber-dark">
                <div>{{ customer.totalOrderCount }} 单</div>
                <div class="mt-1 font-mono text-[10px] text-amber-text-muted">¥ {{ customer.totalSpend.toLocaleString('zh-CN') }}</div>
              </td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">{{ customer.lastOrderTime ? customer.lastOrderTime.replace('T', ' ').slice(0, 16) : '—' }}</td>
              <td class="px-5 py-4">
                <div class="flex flex-wrap gap-2">
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click="openDetail(customer)"
                  >
                    查看详情
                  </button>
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click="openEdit(customer)"
                  >
                    编辑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredCustomers.length" class="px-6 py-10 text-center">
        <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有客户</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部客户，或者检查来源、等级和搜索条件。</p>
      </div>
    </section>

    <Transition name="fade">
      <div
        v-if="detailOpen && selectedCustomer"
        class="fixed inset-0 z-50 flex justify-end bg-[#1A1814]/32"
        @click.self="closeDetail"
      >
        <aside class="h-full w-full max-w-[520px] overflow-y-auto border-l border-amber-topbar-border bg-amber-content-bg shadow-2xl">
          <div class="border-b border-amber-topbar-border px-6 py-5">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Customer Detail</span>
            <div class="mt-1 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-[17px] font-sans text-amber-dark">{{ selectedCustomer.name }}</h3>
                <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ selectedCustomer.mobile }}</p>
              </div>
              <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-text-muted hover:bg-black/5" type="button" @click="closeDetail">
                关闭
              </button>
            </div>
          </div>

          <div class="space-y-5 px-6 py-5">
            <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-sans font-semibold text-amber-dark">客户备注</div>
              <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">{{ selectedCustomer.remark || '暂无备注' }}</p>
            </section>

            <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-[11px] font-sans font-semibold text-amber-dark">最近订单</div>
                <div class="flex gap-2">
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-text-muted hover:bg-black/5"
                    type="button"
                    @click="goToOrderFromDetail"
                  >
                    查看订单
                  </button>
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-text-muted hover:bg-black/5"
                    type="button"
                    :disabled="detailLoading"
                    @click="reloadDetail"
                  >
                    {{ detailLoading ? '加载中...' : '重试' }}
                  </button>
                </div>
              </div>

              <div v-if="detailError" class="mt-3 border border-[#B8543B]/30 bg-[#B8543B]/10 px-3 py-2 text-[10.5px] text-[#8C3E2C]">
                {{ detailError }}
              </div>

              <div v-else-if="detailLoading" class="mt-3 text-[11px] text-amber-text-muted">loading...</div>

              <div v-else-if="!selectedOrders.length" class="mt-3 text-[11px] text-amber-text-muted">最近没有可展示订单</div>

              <div v-else class="mt-3 space-y-3">
                <article
                  v-for="order in selectedOrders"
                  :key="order.backendId"
                  class="border border-amber-topbar-border bg-amber-content-bg p-3"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-[11px] font-semibold text-amber-dark">{{ order.service }}</div>
                      <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ order.id }}</div>
                    </div>
                    <span class="text-[10px] text-amber-text-muted">{{ order.status }}</span>
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-2 text-[10.5px] text-amber-text-muted">
                    <div>来源：{{ order.source }}</div>
                    <div>支付：{{ order.payment }}</div>
                    <div>下单：{{ order.orderTime }}</div>
                    <div>到店：{{ order.arrivalTime }}</div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="w-full max-w-[620px] border border-amber-topbar-border bg-amber-content-bg shadow-2xl">
          <div class="border-b border-amber-topbar-border px-6 py-5">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Customer Form</span>
            <h3 class="mt-1 text-[17px] font-sans text-amber-dark">{{ editingId ? '编辑客户' : '新增客户' }}</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              客户姓名
              <input v-model="form.name" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              手机号
              <input v-model="form.mobile" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              性别
              <input v-model="form.gender" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              生日
              <input v-model="form.birthday" class="yy-field-md" type="date" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              来源
              <input v-model="form.source" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              会员等级
              <input v-model="form.memberLevel" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              标签
              <input v-model="form.tags" class="yy-field-md" placeholder="逗号分隔，如：高复购,待回访" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              客户备注
              <input v-model="form.remark" class="yy-field-md" type="text" />
            </label>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
            <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5" type="button" @click="modalOpen = false">
              取消
            </button>
            <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted" :disabled="saving" type="button" @click="submit">
              {{ saving ? '保存中...' : '保存客户' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { appStore, type BookingOrder, type CustomerInfo } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'

const router = useRouter()

type QuickCustomerFilter = 'all' | 'premium' | 'new' | 'revisit'

const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const detailOpen = ref(false)
const detailLoading = ref(false)
const editingId = ref<string | null>(null)
const selectedCustomer = ref<CustomerInfo | null>(null)
const selectedOrders = ref<BookingOrder[]>([])
const detailError = ref('')
const { notice, pushNotice } = useNotice()
const customers = ref<CustomerInfo[]>([])
const searchQuery = ref('')
const sourceFilter = ref('all')
const levelFilter = ref('all')
const activeCustomerFilter = ref<QuickCustomerFilter>('all')

const form = reactive({
  name: '',
  mobile: '',
  gender: '',
  birthday: '',
  source: '',
  memberLevel: '',
  tags: '',
  remark: '',
})

const isPremium = (customer: CustomerInfo) => customer.totalSpend >= 1000
const isNewCustomer = (customer: CustomerInfo) => customer.totalOrderCount <= 1
const needsRevisit = (customer: CustomerInfo) => customer.totalSpend >= 300 || customer.tags.includes('待回访') || customer.tags.includes('高复购')

const reload = async () => {
  loading.value = true
  try {
    customers.value = [...await appStore.loadCustomers(searchQuery.value)]
  } catch (error) {
    pushNotice('error', error instanceof Error ? `客户加载失败：${error.message}` : '客户加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.mobile = ''
  form.gender = ''
  form.birthday = ''
  form.source = ''
  form.memberLevel = ''
  form.tags = ''
  form.remark = ''
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const openEdit = (customer: CustomerInfo) => {
  editingId.value = customer.backendId
  form.name = customer.name
  form.mobile = customer.mobile
  form.gender = customer.gender === '未设置' ? '' : customer.gender
  form.birthday = customer.birthday
  form.source = customer.source === '未标记' ? '' : customer.source
  form.memberLevel = customer.memberLevel === '普通' ? '普通' : customer.memberLevel
  form.tags = customer.tags.join(',')
  form.remark = customer.remark
  modalOpen.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const next = await appStore.saveCustomer({
      id: editingId.value ?? undefined,
      name: form.name,
      mobile: form.mobile,
      gender: form.gender,
      birthday: form.birthday,
      source: form.source,
      memberLevel: form.memberLevel,
      tags: form.tags,
      remark: form.remark,
    })
    modalOpen.value = false
    await reload()
    pushNotice('success', `${next.name} 已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '客户保存失败')
  } finally {
    saving.value = false
  }
}

const sourceOptions = computed(() => Array.from(new Set(customers.value.map(customer => customer.source).filter(Boolean))))
const levelOptions = computed(() => Array.from(new Set(customers.value.map(customer => customer.memberLevel).filter(Boolean))))
const premiumCustomers = computed(() => customers.value.filter(isPremium))
const newCustomers = computed(() => customers.value.filter(isNewCustomer))
const revisitCustomers = computed(() => customers.value.filter(needsRevisit))

const filteredCustomers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return customers.value.filter(customer => {
    if (sourceFilter.value !== 'all' && customer.source !== sourceFilter.value) return false
    if (levelFilter.value !== 'all' && customer.memberLevel !== levelFilter.value) return false
    if (activeCustomerFilter.value === 'premium' && !isPremium(customer)) return false
    if (activeCustomerFilter.value === 'new' && !isNewCustomer(customer)) return false
    if (activeCustomerFilter.value === 'revisit' && !needsRevisit(customer)) return false
    if (!query) return true
    const haystack = `${customer.name} ${customer.mobile} ${customer.tags.join(' ')} ${customer.remark}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickCustomerFilters = computed(() => [
  { key: 'all' as const, label: '全部客户', count: customers.value.length },
  { key: 'premium' as const, label: '高净值客户', count: premiumCustomers.value.length },
  { key: 'new' as const, label: '本月新客', count: newCustomers.value.length },
  { key: 'revisit' as const, label: '待跟进', count: revisitCustomers.value.length },
])

const cards = computed(() => [
  {
    label: '高净值客户',
    value: String(premiumCustomers.value.length),
    hint: '累计消费较高，适合优先跟进复购和会员转化。',
    scope: 'VIP',
  },
  {
    label: '本月新客',
    value: String(newCustomers.value.length),
    hint: '当前总订单不超过 1 单的客户，可重点做好首单体验。',
    scope: 'NEW',
  },
  {
    label: '可回访客户',
    value: String(revisitCustomers.value.length),
    hint: '适合做补拍、升级套餐、交付反馈或二次消费回访。',
    scope: 'REVISIT',
  },
  {
    label: '累计消费',
    value: `¥ ${customers.value.reduce((sum, customer) => sum + customer.totalSpend, 0).toLocaleString('zh-CN')}`,
    hint: '当前客户档案中的累计消费总额，用于门店运营复盘。',
    scope: 'GMV',
  },
])

const closeDetail = () => {
  detailOpen.value = false
  detailLoading.value = false
  selectedCustomer.value = null
  selectedOrders.value = []
  detailError.value = ''
}

const loadDetailOrders = async (customer: CustomerInfo) => {
  detailLoading.value = true
  detailError.value = ''
  try {
    selectedOrders.value = await appStore.loadCustomerRecentOrders(customer.backendId, 5)
  } catch (error) {
    detailError.value = error instanceof Error ? error.message : '最近订单加载失败'
  } finally {
    detailLoading.value = false
  }
}

const openDetail = async (customer: CustomerInfo) => {
  selectedCustomer.value = customer
  selectedOrders.value = appStore.customerRecentOrders[customer.backendId] ?? []
  detailOpen.value = true
  await loadDetailOrders(customer)
}

const reloadDetail = async () => {
  if (!selectedCustomer.value) return
  await loadDetailOrders(selectedCustomer.value)
}

const goToOrders = (customer: CustomerInfo) => {
  const keyword = customer.mobile || customer.name
  router.push({ path: '/order/appointment', query: { q: keyword, quick: 'all' } })
}

const goToOrderFromDetail = () => {
  if (!selectedCustomer.value) return
  goToOrders(selectedCustomer.value)
}

onMounted(reload)
</script>
