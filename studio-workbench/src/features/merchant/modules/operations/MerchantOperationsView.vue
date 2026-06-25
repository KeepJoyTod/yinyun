<template>
  <StaffBookingEntryView v-if="isStaffBookingRoute" />
  <OrderFormSubmissionsView v-else-if="isFormSubmissionsRoute" />
  <NotificationsView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import OrderFormSubmissionsView from '../../../orders/OrderFormSubmissionsView.vue'
import StaffBookingEntryView from '../../../orders/StaffBookingEntryView.vue'
import NotificationsView from '../../../tools/NotificationsView.vue'

const route = useRoute()
const isStaffBookingRoute = computed(() => route.path.includes('/order/staff-booking'))
const isFormSubmissionsRoute = computed(() => route.path.includes('/order/forms'))
</script>
