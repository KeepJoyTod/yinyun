<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
        <section class="max-h-[92vh] w-full max-w-[860px] overflow-hidden rounded-xl border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
          <header class="flex items-center justify-between gap-3 border-b border-amber-topbar-border px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-dark text-[#F4EFE6]">
                <CalendarPlus :size="18" :stroke-width="1.8" />
              </span>
              <div>
                <h3 class="text-[17px] font-sans font-bold leading-tight text-amber-dark">新增服务订单</h3>
                <p class="mt-1 text-[11px] font-sans text-amber-text-muted">写入统一订单账本；有档期时占用对应工位</p>
              </div>
            </div>
            <button class="yy-action rounded-md p-2 text-amber-text-muted hover:bg-black/5 hover:text-amber-dark" type="button" aria-label="关闭" @click="close">
              <X :size="18" :stroke-width="1.8" />
            </button>
          </header>

          <form class="grid max-h-[calc(92vh-76px)] grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2" @submit.prevent="submit('SAVE')">
            <div class="sm:col-span-2">
              <h4 class="text-[12px] font-sans font-semibold text-amber-dark">客户信息</h4>
            </div>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              客户姓名
              <input v-model.trim="draft.name" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40" autocomplete="name" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              客户手机号
              <input v-model.trim="draft.phone" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40" autocomplete="tel" inputmode="tel" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              性别
              <select v-model="draft.gender" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option value="">未选择</option>
                <option value="FEMALE">女</option>
                <option value="MALE">男</option>
                <option value="UNKNOWN">其他/未知</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              邮箱
              <input v-model.trim="draft.email" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40" autocomplete="email" inputmode="email" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              关联客户
              <select v-model="draft.customerId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option value="">新客户/暂不关联</option>
                <option v-for="item in appStore.customers" :key="item.backendId" :value="item.backendId">{{ item.name }} · {{ item.mobile }}</option>
              </select>
            </label>

            <div class="border-t border-amber-topbar-border pt-4 sm:col-span-2">
              <h4 class="text-[12px] font-sans font-semibold text-amber-dark">订单信息</h4>
            </div>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              门店
              <select v-model="draft.storeName" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option v-for="item in appStore.stores" :key="item.backendId" :value="item.name">{{ item.name }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              服务组
              <select v-model="draft.serviceGroupId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option value="">请选择服务组</option>
                <option v-for="item in serviceGroupOptions" :key="item.backendId" :value="item.backendId">{{ item.name }} · {{ item.durationMinutes || 30 }}分钟</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              产品
              <select v-model="draft.productId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option value="">按服务组默认</option>
                <option v-for="item in productOptions" :key="item.backendId || item.id" :value="item.backendId">{{ item.name }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              档期
              <select v-model="draft.scheduleMode" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                <option value="SCHEDULED">已定档期</option>
                <option value="UNDECIDED">档期未定</option>
                <option value="PAST_DATE">补录历史档期</option>
              </select>
            </label>

            <label v-if="draft.scheduleMode !== 'UNDECIDED'" class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              预约日期
              <input v-model.trim="draft.date" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40" placeholder="YYYY-MM-DD" />
            </label>

            <div v-if="draft.scheduleMode !== 'UNDECIDED'" class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                开始时间
                <input v-model.trim="draft.startTime" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:outline-none focus:border-amber-dark/40" placeholder="10:00" />
              </label>
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                时长
                <select v-model.number="draft.durationMinutes" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                  <option v-for="item in durationOptions" :key="item" :value="item">{{ item }} 分钟</option>
                </select>
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                支付状态
                <select v-model="draft.payStatus" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                  <option value="UNPAID">待支付</option>
                  <option value="PAID">已支付</option>
                </select>
              </label>
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                订单状态
                <select v-model="draft.status" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40">
                  <option value="PENDING">待确认</option>
                  <option value="CONFIRMED">已确认</option>
                </select>
              </label>
            </div>

            <label class="flex items-center gap-2 rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              <input v-model="draft.notifyEnabled" type="checkbox" class="h-4 w-4 accent-amber-dark" />
              发送通知
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              备注
              <textarea v-model.trim="draft.remark" class="min-h-[72px] rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark focus:outline-none focus:border-amber-dark/40" />
            </label>

            <p v-if="errorMessage" class="sm:col-span-2 rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-status-danger)]">
              {{ errorMessage }}
            </p>

            <footer class="flex items-center justify-between gap-3 border-t border-amber-topbar-border pt-4 sm:col-span-2">
              <span class="text-[11px] font-mono text-amber-text-muted">时段 {{ draft.date || '-' }} {{ draft.startTime || '--:--' }} - {{ slotEndTime || '--:--' }}</span>
              <div class="flex items-center gap-2">
                <button class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[12px] font-medium text-amber-text-muted hover:bg-black/5" type="button" @click="close">
                  返回
                </button>
                <button class="yy-action rounded-md border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-medium text-[#F4EFE6] disabled:cursor-not-allowed disabled:opacity-65" type="submit" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存' }}
                </button>
                <button class="yy-action rounded-md border border-amber-dark bg-white px-4 py-2 text-[12px] font-medium text-amber-dark disabled:cursor-not-allowed disabled:opacity-65" type="button" :disabled="submitting" @click="submit('SAVE_AND_RECEIVE')">
                  保存并接待
                </button>
              </div>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { CalendarPlus, X } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { BackendId } from '../../shared/api/backendId'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import { addMinutesToClock, normalizeClock } from '../../shared/stores/appStoreTransforms'
import {
  buildDurationOptions,
  buildStaffBookingDraftDefaults,
  buildStaffOrderCreateInput,
  findBlockedInventorySlot,
  today,
  validateStaffBookingDraft,
  type StaffBookingDraft,
  type StaffBookingInitial,
} from './staffBookingModalOperations'

export type { StaffBookingInitial } from './staffBookingModalOperations'

const props = defineProps<{
  open: boolean
  initial?: StaffBookingInitial | null
}>()

const emit = defineEmits<{
  close: []
  created: [order: BookingOrder]
}>()

const router = useRouter()

const draft = reactive<StaffBookingDraft>({
  storeName: '',
  serviceGroupId: '' as BackendId | '',
  productId: '' as BackendId | '',
  customerId: '' as BackendId | '',
  name: '',
  phone: '',
  gender: '',
  email: '',
  scheduleMode: 'SCHEDULED' as 'SCHEDULED' | 'UNDECIDED' | 'PAST_DATE',
  date: today(),
  startTime: '10:00',
  durationMinutes: 30,
  notifyEnabled: true,
  payStatus: 'UNPAID',
  status: 'PENDING',
  remark: '',
})

const submitting = ref(false)
const errorMessage = ref('')

const selectedStore = computed(() => appStore.stores.find(item => item.name === draft.storeName))
const serviceGroupOptions = computed(() => {
  const scoped = appStore.serviceGroups.filter(item => !selectedStore.value || item.storeBackendId === selectedStore.value.backendId)
  const selected = draft.serviceGroupId
    ? appStore.serviceGroups.find(item => item.backendId === draft.serviceGroupId)
    : null
  if (selected && !scoped.some(item => item.backendId === selected.backendId)) {
    return [selected, ...scoped]
  }
  return scoped
})
const productOptions = computed(() => appStore.products.filter(item => item.active || item.backendId === draft.productId))
const selectedServiceGroup = computed(() =>
  serviceGroupOptions.value.find(item => item.backendId === draft.serviceGroupId)
  ?? serviceGroupOptions.value[0],
)
const selectedProduct = computed(() => productOptions.value.find(item => item.backendId === draft.productId))
const durationOptions = computed(() => buildDurationOptions(draft.durationMinutes))
const slotEndTime = computed(() => normalizeClock(addMinutesToClock(draft.date, draft.startTime, Number(draft.durationMinutes) || 30)))

const loadBlockedInventorySlot = async () => {
  if (draft.scheduleMode === 'UNDECIDED' || !selectedStore.value?.backendId || !selectedServiceGroup.value?.backendId) return null
  const inventorySlots = await appStore.loadBookingInventory({
    date: draft.date,
    storeBackendId: selectedStore.value.backendId,
    serviceGroupBackendId: selectedServiceGroup.value.backendId,
  })
  return findBlockedInventorySlot(inventorySlots, {
    date: draft.date,
    startTime: draft.startTime,
    endTime: slotEndTime.value,
  })
}

const redirectBlockedSlotToInventory = async () => {
  const blockedSlot = await loadBlockedInventorySlot()
  if (!blockedSlot) return false
  errorMessage.value = '当前时段已满或存在冲突，请先去库存页处理后再返回录入。'
  await router.push({
    path: '/merchant/inventory',
    query: {
      date: draft.date,
      storeId: selectedStore.value?.backendId,
      serviceGroupId: selectedServiceGroup.value?.backendId,
      slotStart: draft.startTime,
      slotEnd: slotEndTime.value,
      returnTo: 'staffBooking',
      fromSubmissionId: props.initial?.sourceSubmissionId,
      conflictOnly: blockedSlot.conflictCount > 0 ? '1' : undefined,
    },
  })
  return true
}

const resetDraft = () => {
  Object.assign(draft, buildStaffBookingDraftDefaults(props.initial, appStore.stores, appStore.serviceGroups))
  errorMessage.value = ''
}
const ensureStaffBookingResources = async () => {
  if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()
}

watch(() => props.open, async open => {
  if (!open) return
  resetDraft()
  await ensureStaffBookingResources()
  if (!props.open) return
  resetDraft()
}, { immediate: true })

watch(() => props.initial, async initial => {
  if (!props.open || !initial) return
  resetDraft()
  await ensureStaffBookingResources()
  if (!props.open || props.initial !== initial) return
  resetDraft()
})

watch(selectedServiceGroup, group => {
  if (!group) return
  if (!draft.serviceGroupId) draft.serviceGroupId = group.backendId
  if (props.initial?.startTime && props.initial?.endTime) return
  if (group.durationMinutes) draft.durationMinutes = group.durationMinutes
})

watch(selectedStore, store => {
  if (!store) return
  const currentGroup = appStore.serviceGroups.find(item => item.backendId === draft.serviceGroupId)
  if (currentGroup?.storeBackendId === store.backendId) return
  const group = appStore.serviceGroups.find(item => item.storeBackendId === store.backendId)
  draft.serviceGroupId = group?.backendId || ''
})

const close = () => { if (!submitting.value) emit('close') }

const validate = () => {
  return validateStaffBookingDraft(draft, {
    hasStore: Boolean(selectedStore.value),
    hasServiceGroup: Boolean(selectedServiceGroup.value),
  })
}

const submit = async (submitMode: 'SAVE' | 'SAVE_AND_RECEIVE') => {
  const validation = validate()
  if (validation) {
    errorMessage.value = validation
    return
  }
  if (!selectedServiceGroup.value) return
  draft.startTime = normalizeClock(draft.startTime)
  submitting.value = true
  errorMessage.value = ''
  try {
    if (await redirectBlockedSlotToInventory()) return
    const order = await appStore.createOrder(buildStaffOrderCreateInput(draft, {
      serviceGroup: selectedServiceGroup.value,
      product: selectedProduct.value,
      slotEndTime: slotEndTime.value,
      submitMode,
    }))
    emit('created', order)
    emit('close')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '新增预约失败'
  } finally {
    submitting.value = false
  }
}
</script>
