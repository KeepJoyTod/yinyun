<template>
  <ModuleScaffoldView v-bind="scaffold" />
</template>

<script setup lang="ts">
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import { platformServicePackagesScaffold } from './platformSettingsScaffolds'

const scaffold = useModuleScaffold(platformServicePackagesScaffold)
</script>
