import { computed, reactive, ref, watch } from 'vue'
import type { Router } from 'vue-router'
import { backendApi, type BackendId, type OrderAttributeTemplateDto } from '../../shared/api/backend'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import { addMinutesToClock, normalizeClock } from '../../shared/stores/appStoreTransforms'
import { buildOrderAttributeValues } from '../../shared/orderAttributes'
import { hasVerticalServiceOverlap } from './orderSlotOperations'
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

type StaffBookingModalProps = {
  open: boolean
  initial?: StaffBookingInitial | null
}

type StaffBookingModalEmit = {
  (event: 'close'): void
  (event: 'created', order: BookingOrder): void
}

export function useStaffBookingModalState(
  props: StaffBookingModalProps,
  emit: StaffBookingModalEmit,
  router: Router,
) {
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
    orderAttributes: [],
    remark: '',
  })

  const submitting = ref(false)
  const errorMessage = ref('')
  const orderAttributeLoading = ref(false)
  const orderAttributeTemplates = ref<OrderAttributeTemplateDto[]>([])

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

  const syncOrderAttributeDrafts = (templates = orderAttributeTemplates.value) => {
    draft.orderAttributes = buildOrderAttributeValues(templates, draft.orderAttributes || [])
  }

  const loadOrderAttributeTemplates = async (storeBackendId?: BackendId) => {
    if (!storeBackendId) {
      orderAttributeTemplates.value = []
      draft.orderAttributes = []
      return
    }
    orderAttributeLoading.value = true
    try {
      orderAttributeTemplates.value = await backendApi.listOrderAttributeTemplates(storeBackendId)
      syncOrderAttributeDrafts(orderAttributeTemplates.value)
    } finally {
      orderAttributeLoading.value = false
    }
  }

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

  const hasVerticalOverlap = () => {
    if (draft.scheduleMode === 'UNDECIDED') return false
    if (selectedServiceGroup.value?.serviceMode !== 'VERTICAL') return false
    return hasVerticalServiceOverlap(appStore.orders, {
      storeBackendId: String(selectedStore.value?.backendId || ''),
      serviceGroupBackendId: String(selectedServiceGroup.value?.backendId || ''),
      date: draft.date,
      startTime: draft.startTime,
      endTime: slotEndTime.value,
      durationMinutes: Number(selectedServiceGroup.value?.durationMinutes || draft.durationMinutes || 30),
    })
  }

  const resetDraft = () => {
    Object.assign(draft, buildStaffBookingDraftDefaults(props.initial, appStore.stores, appStore.serviceGroups))
    draft.orderAttributes = []
    errorMessage.value = ''
  }

  const ensureStaffBookingResources = async () => {
    if (!appStore.stores.length) await appStore.refreshCoreData()
    if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()
  }

  watch(() => props.open, async open => {
    if (!open) return
    resetDraft()
    await ensureStaffBookingResources()
    if (!props.open) return
    resetDraft()
    await loadOrderAttributeTemplates(selectedStore.value?.backendId)
  }, { immediate: true })

  watch(() => props.initial, async initial => {
    if (!props.open || !initial) return
    resetDraft()
    await ensureStaffBookingResources()
    if (!props.open || props.initial !== initial) return
    resetDraft()
    await loadOrderAttributeTemplates(selectedStore.value?.backendId)
  })

  watch(selectedServiceGroup, group => {
    if (!group) return
    if (!draft.serviceGroupId) draft.serviceGroupId = group.backendId
    if (props.initial?.startTime && props.initial?.endTime) return
    if (group.durationMinutes) draft.durationMinutes = group.durationMinutes
  })

  watch(selectedStore, async store => {
    if (!store) return
    const currentGroup = appStore.serviceGroups.find(item => item.backendId === draft.serviceGroupId)
    if (!currentGroup || currentGroup.storeBackendId !== store.backendId) {
      const group = appStore.serviceGroups.find(item => item.storeBackendId === store.backendId)
      draft.serviceGroupId = group?.backendId || ''
    }
    await loadOrderAttributeTemplates(store.backendId)
  })

  const close = () => {
    if (!submitting.value) emit('close')
  }

  const validate = () => validateStaffBookingDraft(draft, {
    hasStore: Boolean(selectedStore.value),
    hasServiceGroup: Boolean(selectedServiceGroup.value),
  })

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
      if (hasVerticalOverlap()) {
        errorMessage.value = '纵向服务时段与同服务组订单重叠，请改选其他时间。'
        return
      }
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

  return {
    draft,
    submitting,
    errorMessage,
    orderAttributeLoading,
    serviceGroupOptions,
    productOptions,
    durationOptions,
    slotEndTime,
    close,
    submit,
  }
}
