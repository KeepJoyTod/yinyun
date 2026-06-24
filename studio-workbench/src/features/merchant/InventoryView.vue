<template>
  <div class="flex flex-col gap-7">
    <div class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Inventory Ledger</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">时段库存</h2>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            查看各门店服务组时段容量、已确认数量和库存冲突，必要时直接调整容量或备注。
          </p>
        </div>
        <button
          class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          {{ loading ? '加载中...' : '刷新库存' }}
        </button>
      </div>
    </div>

    <section
      v-if="isStaffBookingReturn"
      class="border border-[#D7A64F]/35 bg-[#FFF8E8] px-5 py-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-[12px] font-sans font-semibold text-amber-dark">正在处理店员录入前的容量问题</div>
          <p class="mt-1 text-[11px] font-sans text-amber-text-muted">
            {{ dateFilter }} · {{ selectedStoreLabel }} · {{ selectedServiceGroupLabel }} · {{ slotStartFilter || '--:--' }} - {{ slotEndFilter || '--:--' }}
            <span class="ml-1 rounded border border-[#D7A64F]/30 bg-white/55 px-1.5 py-0.5 text-[10px] text-[#8C3E2C]">{{ returnContextLabel }}</span>
          </p>
          <p class="mt-1 text-[11px] font-sans text-amber-text-muted">
            调整容量或处理冲突后，可回到同一时段继续录入预约。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="goBackToStaffBooking"
        >
          回到录入预约
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-5">
      <div class="flex flex-wrap items-end gap-3">
        <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
          日期
          <input v-model="dateFilter" class="yy-field-md" type="date" @change="reload" />
        </label>
        <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
          门店
          <select v-model="storeFilter" class="yy-field-md" @change="handleStoreFilterChange">
            <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
            <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">
              {{ store.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
          服务组
          <select v-model="serviceGroupFilter" class="yy-field-md" @change="reload">
            <option value="all">全部服务组</option>
            <option v-for="option in concreteServiceGroupOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="flex items-center gap-2 pb-2 text-[11px] text-amber-dark">
          <input v-model="conflictOnly" type="checkbox" @change="reload" />
          只看库存冲突
        </label>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">门店 / 服务组</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">日期</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">时段</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">容量</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">已确认</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">库存冲突</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr v-for="slot in slots" :key="slot.backendId" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4">
                <div class="flex flex-col">
                  <span class="text-[12px] font-medium text-amber-dark">{{ slot.storeName }}</span>
                  <span class="mt-1 text-[10px] text-amber-text-muted">{{ slot.serviceGroupName }}</span>
                </div>
              </td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">{{ slot.date }}</td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">{{ slot.startTime }} - {{ slot.endTime }}</td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">{{ slot.capacity }}</td>
              <td class="px-5 py-4 font-mono text-[11px] text-amber-dark">{{ slot.confirmedCount }}</td>
              <td class="px-5 py-4">
                <span
                  class="px-2 py-0.5 text-[10px]"
                  :class="slot.conflictCount > 0
                    ? 'bg-[#B8543B]/10 text-[#8C3E2C]'
                    : 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'"
                >
                  {{ slot.conflictCount }}
                </span>
              </td>
              <td class="px-5 py-4 text-[11px] text-amber-dark">{{ slot.status }}</td>
              <td class="px-5 py-4">
                <button
                  class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                  type="button"
                  @click="openEdit(slot)"
                >
                  调整容量
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!slots.length" class="px-6 py-10 text-center">
        <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有库存时段</div>
        <p class="mt-2 text-[11px] text-amber-text-muted">可以切换具体门店，或者关闭“只看库存冲突”后重新查看。</p>
      </div>
    </section>

    <Transition name="fade">
      <div
        v-if="editingSlot"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
        @click.self="editingSlot = null"
      >
        <div class="w-full max-w-[560px] border border-amber-topbar-border bg-amber-content-bg shadow-2xl">
          <div class="border-b border-amber-topbar-border px-6 py-5">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Inventory Edit</span>
            <h3 class="mt-1 text-[17px] font-sans text-amber-dark">调整容量</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">
              {{ editingSlot.storeName }} · {{ editingSlot.serviceGroupName }} · {{ editingSlot.date }} {{ editingSlot.startTime }} - {{ editingSlot.endTime }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              容量
              <input v-model.number="inventoryForm.capacity" class="yy-field-md" min="0" type="number" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              状态
              <select v-model="inventoryForm.status" class="yy-field-md">
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
              备注
              <input v-model="inventoryForm.remark" class="yy-field-md" type="text" />
            </label>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
            <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5" type="button" @click="editingSlot = null">
              取消
            </button>
            <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted" :disabled="saving" type="button" @click="submit">
              {{ saving ? '保存中...' : '保存容量' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appStore, type BookingInventorySlot } from '../../shared/stores/appStore'
import { buildInventoryCards, getInventoryServiceGroupOptions } from './inventoryOperations'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'

const today = new Date()
const pad2 = (value: number) => String(value).padStart(2, '0')
const defaultDate = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

const loading = ref(false)
const saving = ref(false)
const { notice, pushNotice } = useNotice()
const route = useRoute()
const router = useRouter()
const dateFilter = ref(defaultDate)
const storeFilter = ref('')
const serviceGroupFilter = ref('all')
const conflictOnly = ref(false)
const returnToFilter = ref('')
const fromSubmissionIdFilter = ref('')
const slotStartFilter = ref('')
const slotEndFilter = ref('')
const slots = ref<BookingInventorySlot[]>([])
const editingSlot = ref<BookingInventorySlot | null>(null)

const inventoryForm = reactive({
  capacity: 0,
  status: 'ACTIVE',
  remark: '',
})

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
const serviceGroupOptions = computed(() => getInventoryServiceGroupOptions(appStore.serviceGroups, storeFilter.value))
const concreteServiceGroupOptions = computed(() => serviceGroupOptions.value.filter(option => option.value !== 'all'))
const isStaffBookingReturn = computed(() => returnToFilter.value === 'staffBooking')
const selectedStoreLabel = computed(() => {
  return appStore.stores.find(store => String(store.backendId) === storeFilter.value)?.name || '未知门店'
})
const selectedServiceGroupLabel = computed(() => {
  if (serviceGroupFilter.value === 'all') return '全部服务组'
  return concreteServiceGroupOptions.value.find(option => option.value === serviceGroupFilter.value)?.label || '未知服务组'
})
const returnContextLabel = computed(() => (conflictOnly.value ? '仅看库存冲突' : '满员或冲突'))

const readQueryString = (value: unknown) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

const applyInventoryFiltersFromQuery = () => {
  const date = readQueryString(route.query.date)
  const storeId = readQueryString(route.query.storeId)
  const serviceGroupId = readQueryString(route.query.serviceGroupId)
  const conflict = readQueryString(route.query.conflictOnly)
  const returnTo = readQueryString(route.query.returnTo)
  const fromSubmissionId = readQueryString(route.query.fromSubmissionId)
  const slotStart = readQueryString(route.query.slotStart)
  const slotEnd = readQueryString(route.query.slotEnd)

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) dateFilter.value = date
  if (storeId) storeFilter.value = storeId
  if (serviceGroupId) serviceGroupFilter.value = serviceGroupId
  conflictOnly.value = conflict === '1' || conflict === 'true'
  returnToFilter.value = returnTo
  fromSubmissionIdFilter.value = fromSubmissionId
  slotStartFilter.value = slotStart
  slotEndFilter.value = slotEnd
}

const reload = async () => {
  loading.value = true
  try {
    await ensureWorkbenchStores()
    storeFilter.value = normalizeStoreFilter()
    if (!storeFilter.value) {
      slots.value = []
      return
    }
    slots.value = await appStore.loadBookingInventory({
      date: dateFilter.value,
      storeBackendId: storeFilter.value,
      serviceGroupBackendId: serviceGroupFilter.value === 'all' ? undefined : serviceGroupFilter.value,
      conflictOnly: conflictOnly.value,
    })
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '库存加载失败')
  } finally {
    loading.value = false
  }
}

const handleStoreFilterChange = () => {
  if (!serviceGroupOptions.value.some(option => option.value === serviceGroupFilter.value)) {
    serviceGroupFilter.value = 'all'
  }
  void reload()
}

const goBackToStaffBooking = () => {
  router.push({
    path: '/order/staff-booking',
    query: {
      returnTo: 'staffBooking',
      fromSubmissionId: fromSubmissionIdFilter.value || undefined,
      date: dateFilter.value,
      storeId: storeFilter.value || undefined,
      serviceGroupId: serviceGroupFilter.value === 'all' ? undefined : serviceGroupFilter.value,
      slotStart: slotStartFilter.value || undefined,
      slotEnd: slotEndFilter.value || undefined,
    },
  })
}

const openEdit = (slot: BookingInventorySlot) => {
  editingSlot.value = slot
  inventoryForm.capacity = slot.capacity
  inventoryForm.status = slot.status
  inventoryForm.remark = slot.remark
}

const submit = async () => {
  if (!editingSlot.value) return
  saving.value = true
  try {
    const next = await appStore.updateBookingInventory({
      id: editingSlot.value.backendId,
      capacity: inventoryForm.capacity,
      status: inventoryForm.status,
      remark: inventoryForm.remark,
    })
    editingSlot.value = null
    await reload()
    pushNotice('success', `${next.storeName} ${next.startTime} 时段已更新`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '库存保存失败')
  } finally {
    saving.value = false
  }
}

const cards = computed(() => buildInventoryCards(slots.value))

onMounted(() => {
  applyInventoryFiltersFromQuery()
  void reload()
})

watch(
  () => route.query,
  () => {
    applyInventoryFiltersFromQuery()
    void reload()
  },
)
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
