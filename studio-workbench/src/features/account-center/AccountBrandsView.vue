<template>
  <ModuleScaffoldView v-bind="scaffold" />
</template>

<script setup lang="ts">
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { accountBrandsScaffold } from './accountCenterScaffolds'

const scaffold = useModuleScaffold(accountBrandsScaffold)
</script>
