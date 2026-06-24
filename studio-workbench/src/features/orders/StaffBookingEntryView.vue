<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="rounded-2xl border border-amber-topbar-border bg-white/78 p-6 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">店员录入</span>
          <h2 class="mt-1 text-[24px] font-sans font-bold leading-tight text-amber-dark">店员录入预约</h2>
          <p class="mt-2 max-w-[720px] text-[13px] font-sans leading-relaxed text-amber-text-muted">
            给电话、微信、现场客户快速补录预约；保存后写入 yy_order，并占用 yy_booking_slot_inventory 的真实时段库存。
          </p>
        </div>
        <button
          class="yy-action rounded-md border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-sans font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="openBookingModal"
        >
          立即录入
        </button>
      </div>
    </section>

    <section
      v-if="sourceSubmissionLoading || sourceSubmissionError || sourceSubmissionLinkError"
      class="rounded-xl border px-4 py-3 text-[12px] font-sans"
      :class="sourceSubmissionError || sourceSubmissionLinkError ? 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]' : 'border-amber-topbar-border bg-white text-amber-text-muted'"
    >
      {{
        sourceSubmissionError
          ? `表单提交读取失败：${sourceSubmissionError}`
          : sourceSubmissionLinkError
            ? `预约已创建，但表单提交关联订单失败：${sourceSubmissionLinkError}`
            : '正在读取表单提交，准备转为人工预约...'
      }}
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <article class="rounded-2xl border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-text-muted">预填</span>
            <h3 class="mt-1 text-[17px] font-sans font-semibold text-amber-dark">录入前先选门店和时段</h3>
          </div>
          <span class="rounded-full border border-amber-topbar-border bg-white px-2.5 py-1 text-[10px] font-mono text-amber-text-muted">手工</span>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
            门店
            <select v-model="draft.storeName" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
              <option v-for="store in appStore.stores" :key="store.backendId" :value="store.name">{{ store.name }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
            服务组
            <select v-model="draft.serviceGroupId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
              <option value="">按门店默认服务组</option>
              <option v-for="group in serviceGroupOptions" :key="group.backendId" :value="group.backendId">
                {{ group.name }} · {{ group.durationMinutes || 30 }} 分钟
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
            日期
            <input v-model.trim="draft.date" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40" placeholder="YYYY-MM-DD" />
          </label>

          <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
            开始时间
            <input v-model.trim="draft.startTime" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40" placeholder="10:00" />
          </label>
        </div>

        <div
          v-if="sourceSubmissionPrefill?.date && sourceSubmissionPrefill?.startTime"
          class="mt-5 rounded-xl border p-4 text-[12px] font-sans"
          :class="sourceSubmissionSlot && !slotBlocked(sourceSubmissionSlot) ? 'border-[#2D7A4D]/25 bg-[#E8F4EC]/60 text-[#2D7A4D]' : 'border-[#B8543B]/25 bg-[#FFF2D6]/55 text-[#8C3E2C]'"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="font-semibold text-amber-dark">客户期望时段</div>
              <div class="mt-1">
                {{ sourceSubmissionPrefill.date }} {{ sourceSubmissionPrefill.startTime }}{{ sourceSubmissionPrefill.endTime ? `-${sourceSubmissionPrefill.endTime}` : '' }}
                <span v-if="sourceSubmissionPrefill.serviceText"> · {{ sourceSubmissionPrefill.serviceText }}</span>
              </div>
              <div class="mt-1 text-[11px]">
                {{
                  sourceSubmissionSlot
                    ? slotBlocked(sourceSubmissionSlot)
                      ? slotBlockedReason(sourceSubmissionSlot)
                      : `可录入：容量 ${sourceSubmissionSlot.capacity} / 已约 ${sourceSubmissionSlot.confirmedCount} / 剩余 ${sourceSubmissionSlot.remaining}`
                    : '没有找到对应库存时段，先维护容量或改选其他时段。'
                }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-if="sourceSubmissionSlot && !slotBlocked(sourceSubmissionSlot)"
                class="yy-action rounded-md border border-[#2D7A4D] bg-white px-3 py-2 text-[11px] font-medium text-[#2D7A4D]"
                type="button"
                @click="openSubmissionRequestedSlot"
              >
                按该时段录入
              </button>
              <button
                v-else
                class="yy-action rounded-md border border-[#B8543B]/30 bg-white px-3 py-2 text-[11px] font-medium text-[#8C3E2C]"
                type="button"
                @click="goSubmissionRequestedSlotInventory"
              >
                去库存处理
              </button>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-xl border border-amber-topbar-border bg-white/65 p-4 text-[11px] font-sans leading-relaxed text-amber-text-muted">
          <div class="font-semibold text-amber-dark">保存路径</div>
          <p class="mt-1">店员录入只影响影约云本地订单和排期库存，不会反向修改抖音来客订单。</p>
          <p class="mt-1">抖音来客新订单仍走 SPI/Webhook/OpenAPI 同步；有真实时段才进入今日排期。</p>
        </div>
      </article>

      <article class="rounded-2xl border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-text-muted">今日时段</span>
            <h3 class="mt-1 text-[17px] font-sans font-semibold text-amber-dark">今天可直接补录的时段</h3>
          </div>
          <button
            class="yy-action rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-sans text-amber-text-muted hover:bg-black/5"
            type="button"
            @click="goTodaySchedule"
          >
            打开今日预约
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            v-for="slot in recommendedSlots"
            :key="slot.key"
            class="yy-action rounded-xl border p-4 text-left hover:bg-white"
            :class="slotBlocked(slot) ? 'border-[#B8543B]/25 bg-[#FFF2D6]/45 hover:border-[#B8543B]/35' : 'border-amber-topbar-border bg-white/70 hover:border-amber-dark/25'"
            type="button"
            @click="slotBlocked(slot) ? goSlotInventory(slot) : openSlot(slot)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="font-mono text-[22px] leading-none text-amber-dark">{{ slot.startTime }}</div>
                <div class="mt-2 text-[12px] font-sans font-medium text-amber-dark">{{ slot.serviceGroupName }}</div>
                <div class="mt-1 text-[11px] font-sans text-amber-text-muted">
                  {{ slot.storeName }} · 容量 {{ slot.capacity }} / 已约 {{ slot.confirmedCount }}
                </div>
              </div>
              <span
                class="rounded-md px-2 py-1 text-[10px] font-sans font-semibold"
                :class="slotBlocked(slot) ? 'bg-[#B8543B]/10 text-[#B8543B]' : 'bg-[#E8F4EC] text-[#2D7A4D]'"
              >
                {{ slot.conflictCount > 0 ? `冲突 ${slot.conflictCount}` : slot.remaining <= 0 ? '已满' : `余 ${slot.remaining}` }}
              </span>
            </div>
            <div class="mt-3 text-[11px] font-sans" :class="slotBlocked(slot) ? 'text-[#8C3E2C]' : 'text-amber-text-muted'">
              {{ slotBlocked(slot) ? slotBlockedReason(slot) : '点击直接预填并录入预约。' }}
            </div>
            <div v-if="slotBlocked(slot)" class="mt-2 flex flex-wrap gap-1.5 text-[10px] font-sans text-[#8C3E2C]">
              <span class="rounded border border-[#B8543B]/20 bg-white/55 px-1.5 py-0.5">剩余 {{ slot.remaining }}</span>
              <span class="rounded border border-[#B8543B]/20 bg-white/55 px-1.5 py-0.5">冲突 {{ slot.conflictCount }}</span>
              <span class="rounded border border-[#B8543B]/20 bg-white/55 px-1.5 py-0.5">点击去库存处理</span>
            </div>
          </button>
        </div>

        <div v-if="recommendedSlots.length === 0" class="mt-4 rounded-xl border border-dashed border-amber-topbar-border bg-white/55 px-4 py-6 text-[12px] font-sans text-amber-text-muted">
          当前筛选下没有可推荐库存时段。可以直接点“立即录入”，或先到时段库存维护今天的容量。
        </div>
      </article>
    </section>

    <StaffBookingModal
      v-if="staffBookingOpen"
      :key="staffBookingModalKey"
      :open="staffBookingOpen"
      :initial="staffBookingInitial"
      @close="staffBookingOpen = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backendApi, type MicroFormSubmissionDto } from '../../shared/api/backend'
import type { BackendId } from '../../shared/api/backendId'
import { appStore, type BookingInventorySlot, type BookingOrder } from '../../shared/stores/appStore'
import { formatDate } from '../../shared/stores/appStoreTransforms'
import { buildSubmissionBookingPrefill, type SubmissionBookingPrefill } from './microFormSubmissionBooking'
import StaffBookingModal, { type StaffBookingInitial } from './StaffBookingModal.vue'
import {
  buildManualBookingInitial,
  buildPrefillKey,
  buildReturnInitialFromQuery,
  buildSlotBookingInitial,
  buildSlotInventoryQuery,
  buildSubmissionInitial,
  buildSubmissionRequestedSlotInventoryQuery,
  readQueryString,
  shouldOpenStaffBookingReturnFromQuery,
  slotBlocked,
  slotBlockedReason,
  toRecommendedSlot,
  type RecommendedSlot,
  type StaffBookingEntryDraft,
} from './staffBookingEntryOperations'

const route = useRoute()
const router = useRouter()
const today = () => formatDate(new Date())

const draft = reactive<StaffBookingEntryDraft>({
  storeName: '',
  serviceGroupId: '' as BackendId | '',
  date: today(),
  startTime: '10:00',
})

const staffBookingOpen = ref(false)
const staffBookingInitial = ref<StaffBookingInitial | null>(null)
const staffBookingModalKey = ref(0)
const lastAppliedPrefillKey = ref('')
const sourceSubmission = ref<MicroFormSubmissionDto | null>(null)
const sourceSubmissionLoading = ref(false)
const sourceSubmissionError = ref('')
const sourceSubmissionLinkError = ref('')
const sourceSubmissionPrefill = ref<SubmissionBookingPrefill | null>(null)

const shouldOpenStaffBookingReturn = computed(() => {
  return shouldOpenStaffBookingReturnFromQuery(route.query)
})

const loadSubmissionPrefill = async (submissionId: string) => {
  if (!submissionId) return
  sourceSubmissionLoading.value = true
  sourceSubmissionError.value = ''
  try {
    if (!appStore.stores.length) await appStore.refreshCoreData()
    if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()
    const row = await backendApi.getMicroFormSubmission(submissionId as BackendId)
    const prefill = buildSubmissionBookingPrefill(row)
    sourceSubmission.value = row
    sourceSubmissionPrefill.value = prefill
    if (prefill.storeId) {
      const store = appStore.stores.find(item => item.backendId === prefill.storeId)
      if (store) draft.storeName = store.name
    }
    if (prefill.serviceGroupId) draft.serviceGroupId = prefill.serviceGroupId
    if (prefill.date) draft.date = prefill.date
    if (prefill.startTime) draft.startTime = prefill.startTime
    await ensureSubmissionRequestedInventory()
    staffBookingInitial.value = buildSubmissionInitial(row, {
      prefill,
      stores: appStore.stores,
      selectedStoreName: selectedStore.value?.name,
      draft,
    })
  } catch (error) {
    sourceSubmission.value = null
    sourceSubmissionPrefill.value = null
    sourceSubmissionError.value = error instanceof Error ? error.message : '表单提交读取失败'
  } finally {
    sourceSubmissionLoading.value = false
  }
}

const applyEntryPrefillFromQuery = (force = false) => {
  const prefillKey = buildPrefillKey({
    fullPath: route.fullPath,
    stores: appStore.stores,
    serviceGroups: appStore.serviceGroups,
  })
  if (!force && prefillKey === lastAppliedPrefillKey.value) return
  lastAppliedPrefillKey.value = prefillKey

  const fromSubmissionId = readQueryString(route.query.fromSubmissionId)
  const date = readQueryString(route.query.date)
  const storeId = readQueryString(route.query.storeId)
  const serviceGroupId = readQueryString(route.query.serviceGroupId)
  const slotStart = readQueryString(route.query.slotStart)
  const startTime = slotStart || readQueryString(route.query.startTime)
  const matchedStore = storeId ? appStore.stores.find(store => String(store.backendId) === storeId) : null

  if (fromSubmissionId) {
    void loadSubmissionPrefill(fromSubmissionId)
    return
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) draft.date = date
  if (matchedStore) draft.storeName = matchedStore.name
  if (serviceGroupId) draft.serviceGroupId = serviceGroupId as BackendId
  if (/^\d{2}:\d{2}$/.test(startTime)) draft.startTime = startTime

  const returnInitial = buildReturnInitialFromQuery(route.query, {
    stores: appStore.stores,
    selectedStoreName: matchedStore?.name || selectedStore.value?.name,
    draft,
  })
  if (shouldOpenStaffBookingReturn.value && returnInitial) {
    void openStaffBookingModal(returnInitial)
  } else {
    staffBookingInitial.value = null
  }
}

const selectedStore = computed(() => appStore.stores.find(store => store.name === draft.storeName) ?? appStore.stores[0])
const serviceGroupOptions = computed(() =>
  appStore.serviceGroups.filter(group => !selectedStore.value || group.storeBackendId === selectedStore.value.backendId),
)

const sourceSubmissionSlot = computed<RecommendedSlot | null>(() => {
  const prefill = sourceSubmissionPrefill.value
  if (!prefill?.date || !prefill.startTime) return null
  const storeId = prefill.storeId || selectedStore.value?.backendId
  const serviceGroupId = prefill.serviceGroupId || draft.serviceGroupId || undefined
  const matched = appStore.bookingInventory.find(slot =>
    slot.date === prefill.date
    && slot.startTime === prefill.startTime
    && (!storeId || slot.storeBackendId === storeId)
    && (!serviceGroupId || slot.serviceGroupBackendId === serviceGroupId)
  )
  if (!matched) return null
  return toRecommendedSlot(matched, selectedStore.value?.name || '')
})

const recommendedSlots = computed<RecommendedSlot[]>(() => {
  const selectedStoreId = selectedStore.value?.backendId
  return appStore.bookingInventory
    .filter((slot: BookingInventorySlot) => {
      if (slot.date !== draft.date) return false
      if (selectedStoreId && slot.storeBackendId !== selectedStoreId) return false
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 6)
    .map(slot => toRecommendedSlot(slot, selectedStore.value?.name || ''))
})

const openStaffBookingModal = async (initial: StaffBookingInitial | null) => {
  staffBookingOpen.value = false
  await nextTick()
  staffBookingInitial.value = initial
  staffBookingModalKey.value += 1
  staffBookingOpen.value = true
}

const openBookingModal = () => {
  void openStaffBookingModal(buildManualBookingInitial(draft, selectedStore.value?.name))
}

const openSlot = (slot: RecommendedSlot) => {
  void openStaffBookingModal(buildSlotBookingInitial(slot))
}

const ensureSubmissionRequestedInventory = async () => {
  const prefill = sourceSubmissionPrefill.value
  if (!prefill?.date || !prefill.startTime) return
  await appStore.loadBookingInventory({
    date: prefill.date,
    storeBackendId: prefill.storeId || selectedStore.value?.backendId,
    serviceGroupBackendId: prefill.serviceGroupId || draft.serviceGroupId || undefined,
  })
}

const openSubmissionRequestedSlot = () => {
  const slot = sourceSubmissionSlot.value
  if (!slot || slotBlocked(slot)) return
  const initial = sourceSubmission.value && sourceSubmissionPrefill.value
    ? buildSubmissionInitial(sourceSubmission.value, {
      prefill: sourceSubmissionPrefill.value,
      stores: appStore.stores,
      selectedStoreName: selectedStore.value?.name,
      draft,
    })
    : {}
  void openStaffBookingModal({
    ...initial,
    storeName: slot.storeName,
    serviceGroupId: slot.serviceGroupId,
    scheduleMode: 'SCHEDULED',
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
  })
}

const goSlotInventory = (slot: RecommendedSlot) => {
  router.push({
    path: '/merchant/inventory',
    query: buildSlotInventoryQuery(slot, selectedStore.value?.backendId),
  })
}

const goSubmissionRequestedSlotInventory = () => {
  const prefill = sourceSubmissionPrefill.value
  if (!prefill?.date || !prefill.startTime) return
  router.push({
    path: '/merchant/inventory',
    query: buildSubmissionRequestedSlotInventoryQuery(prefill, {
      selectedStoreId: selectedStore.value?.backendId,
      draftServiceGroupId: draft.serviceGroupId,
      sourceSubmissionId: sourceSubmission.value?.id,
      conflictCount: sourceSubmissionSlot.value?.conflictCount,
    }),
  })
}

const handleCreated = async (order: BookingOrder) => {
  staffBookingOpen.value = false
  await linkSubmissionToOrder(order)
  await Promise.all([
    appStore.loadSchedule(order.arrivalDate || draft.date, order.store),
    appStore.loadBookingInventory({ date: order.arrivalDate || draft.date, storeBackendId: order.storeBackendId }),
  ])
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      time: 'arrival',
      start: order.arrivalDate || draft.date,
      end: order.arrivalDate || draft.date,
      q: order.id,
      storeId: order.storeBackendId,
    },
  })
}

const linkSubmissionToOrder = async (order: BookingOrder) => {
  if (!sourceSubmission.value?.id) return
  sourceSubmissionLinkError.value = ''
  try {
    await backendApi.updateMicroFormSubmissionFollow({
      id: sourceSubmission.value.id,
      followStatus: 'FOLLOWED',
      followRemark: `表单提交已转为预约订单：${order.id}`,
      orderId: order.backendId,
    })
    sourceSubmission.value.orderId = order.backendId
    sourceSubmission.value.followStatus = 'FOLLOWED'
    sourceSubmission.value.followRemark = `表单提交已转为预约订单：${order.id}`
  } catch (error) {
    sourceSubmissionLinkError.value = error instanceof Error ? error.message : '表单提交关联订单失败'
    throw error
  }
}

const goTodaySchedule = () => {
  router.push({
    path: '/dashboard/today',
    query: {
      date: draft.date,
      storeId: selectedStore.value?.backendId,
    },
  })
}

watch(
  () => appStore.stores,
  stores => {
    if (!draft.storeName && stores[0]) draft.storeName = stores[0].name
  },
  { deep: true, immediate: true },
)

watch(
  selectedStore,
  store => {
    if (!store) return
    const current = appStore.serviceGroups.find(group => group.backendId === draft.serviceGroupId)
    if (current?.storeBackendId === store.backendId) return
    const next = appStore.serviceGroups.find(group => group.storeBackendId === store.backendId)
    draft.serviceGroupId = next?.backendId || ''
  },
  { immediate: true },
)

onMounted(() => { applyEntryPrefillFromQuery() })

watch(
  [
    () => route.query,
    () => appStore.stores.map(store => store.backendId).join('|'),
    () => appStore.serviceGroups.map(group => group.backendId).join('|'),
  ],
  () => { applyEntryPrefillFromQuery(true) },
)
</script>
