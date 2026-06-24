<template>
  <ModuleScaffoldView v-bind="scaffold" />
</template>

<script setup lang="ts">
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { accountHelpCenterScaffold } from './accountCenterScaffolds'

const scaffold = useModuleScaffold(accountHelpCenterScaffold)
</script>
