<template>
  <MerchantMicroPagesView v-if="isMicroPagesRoute" />
  <MerchantMicroFormsView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MerchantMicroFormsView from '../../MerchantMicroFormsView.vue'
import MerchantMicroPagesView from '../../MerchantMicroPagesView.vue'

const route = useRoute()
const isMicroPagesRoute = computed(() => route.path.includes('/merchant/micro-pages'))
</script>
