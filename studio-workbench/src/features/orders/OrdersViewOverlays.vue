<template>
  <OrderAdvancedFilterModal
    :open="advancedOpen"
    :advanced="advanced"
    :store-options="advancedStoreOptions"
    :source-options="sourceOptions"
    :payment-options="paymentOptions"
    :service-options="serviceOptions"
    :method-options="methodOptions"
    :status-options="statusOptions"
    :match-count="matchCount"
    @update:open="emit('update:advancedOpen', $event)"
    @update:advanced="emit('update:advanced', $event)"
    @toggle-status="emit('toggle-status', $event)"
    @reset="emit('reset-advanced')"
  />

  <OrderDetailDrawerHost
    :context="orderDetailDrawerContext"
    @close="emit('close-detail')"
    @back-to-slot="emit('back-to-slot')"
    @advance="emit('advance', $event)"
    @refresh-logs="emit('refresh-logs')"
    @copy-order-id="emit('copy-order-id')"
    @copy="(value, key) => emit('copy', value, key)"
    @update-reschedule-date="emit('update-reschedule-date', $event)"
    @update-reschedule-time="emit('update-reschedule-time', $event)"
    @update-reschedule-duration-minutes="emit('update-reschedule-duration-minutes', $event)"
    @update-reschedule-remark="emit('update-reschedule-remark', $event)"
    @apply-reschedule-reason="emit('apply-reschedule-reason', $event)"
    @apply-reschedule-slot="emit('apply-reschedule-slot', $event)"
    @submit-reschedule="emit('submit-reschedule')"
    @update-cancel-reason="emit('update-cancel-reason', $event)"
    @apply-cancel-reason="emit('apply-cancel-reason', $event)"
    @submit-cancel="emit('submit-cancel')"
    @open-album="emit('open-album', $event)"
    @notify-album="emit('notify-album')"
    @confirm-album="emit('confirm-album')"
    @deliver-album="emit('deliver-album')"
    @open-photo-management="emit('open-photo-management')"
    @copy-channel-diagnostic="emit('copy-channel-diagnostic')"
    @refresh-operation-logs="emit('refresh-operation-logs')"
  />

  <OrderPrintDialog
    :open="printDialogOpen"
    :order-id="printDialogOrderId"
    @close="emit('close-print-dialog')"
  />

  <StaffBookingModal
    :open="staffBookingOpen"
    :initial="staffBookingInitial"
    @close="emit('close-staff-booking')"
    @created="emit('staff-booking-created', $event)"
  />
</template>

<script setup lang="ts">
import type { BackendId } from '../../shared/api/backendId'
import type { BookingInventorySlot, BookingOrder } from '../../shared/stores/appStore'
import OrderAdvancedFilterModal from './OrderAdvancedFilterModal.vue'
import OrderDetailDrawerHost, { type OrderDetailDrawerHostContext } from './OrderDetailDrawerHost.vue'
import OrderPrintDialog from './OrderPrintDialog.vue'
import StaffBookingModal, { type StaffBookingInitial } from './StaffBookingModal.vue'

type OrderAdvancedFilters = {
  store: string
  source: string
  payment: string
  service: string
  method: string
  amountMin: string
  amountMax: string
  status: string[]
}

defineProps<{
  advancedOpen: boolean
  advanced: OrderAdvancedFilters
  advancedStoreOptions: string[]
  sourceOptions: string[]
  paymentOptions: string[]
  serviceOptions: string[]
  methodOptions: string[]
  statusOptions: string[]
  matchCount: number
  orderDetailDrawerContext: OrderDetailDrawerHostContext
  printDialogOpen: boolean
  printDialogOrderId: BackendId | null
  staffBookingOpen: boolean
  staffBookingInitial: StaffBookingInitial | null
}>()

const emit = defineEmits<{
  'update:advancedOpen': [value: boolean]
  'update:advanced': [value: OrderAdvancedFilters]
  'toggle-status': [option: string]
  'reset-advanced': []
  'close-detail': []
  'back-to-slot': []
  advance: [order: BookingOrder]
  'refresh-logs': []
  'copy-order-id': []
  copy: [value: string, key: string]
  'update-reschedule-date': [value: string]
  'update-reschedule-time': [value: string]
  'update-reschedule-duration-minutes': [value: number]
  'update-reschedule-remark': [value: string]
  'apply-reschedule-reason': [reason: string]
  'apply-reschedule-slot': [slot: BookingInventorySlot]
  'submit-reschedule': []
  'update-cancel-reason': [value: string]
  'apply-cancel-reason': [reason: string]
  'submit-cancel': []
  'open-album': [albumId: string]
  'notify-album': []
  'confirm-album': []
  'deliver-album': []
  'open-photo-management': []
  'copy-channel-diagnostic': []
  'refresh-operation-logs': []
  'close-print-dialog': []
  'close-staff-booking': []
  'staff-booking-created': [order: BookingOrder]
}>()
</script>
