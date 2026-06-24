<template>
  <ModuleScaffoldView v-bind="scaffold" />
</template>

<script setup lang="ts">
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { accountProfileScaffold } from './accountCenterScaffolds'

const scaffold = useModuleScaffold(accountProfileScaffold)
</script>
