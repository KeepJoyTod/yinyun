<template>
  <OrderAttributesView v-if="isOrderAttributesRoute" />
  <InventoryView v-else-if="isInventoryRoute" />
  <ServiceGroupsView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InventoryView from '../../InventoryView.vue'
import OrderAttributesView from '../../OrderAttributesView.vue'
import ServiceGroupsView from '../../ServiceGroupsView.vue'

const route = useRoute()
const isOrderAttributesRoute = computed(() => route.path.includes('/merchant/order-attributes'))
const isInventoryRoute = computed(() => route.path.includes('/merchant/inventory'))
</script>
