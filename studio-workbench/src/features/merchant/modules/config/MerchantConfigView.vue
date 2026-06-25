<template>
  <InventoryView v-if="isInventoryRoute" />
  <ServiceGroupsView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InventoryView from '../../InventoryView.vue'
import ServiceGroupsView from '../../ServiceGroupsView.vue'

const route = useRoute()
const isInventoryRoute = computed(() => route.path.includes('/merchant/inventory'))
</script>
