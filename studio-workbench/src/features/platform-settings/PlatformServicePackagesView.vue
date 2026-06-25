<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Service packages"
      description="Read-only service package and license binding status from the service production ledger."
      :loading="loading"
      :error="error"
      empty-text="No service package license bindings."
      :items="items"
      @reload="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import PlatformPhase1StatusPanel from './components/PlatformPhase1StatusPanel.vue'
import { usePlatformServicePackageList } from './composables/usePlatformSettingsList'
import { platformServicePackagesScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformServicePackagesScaffold)
const { loading, error, rows, reload } = usePlatformServicePackageList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.packageCode,
  title: row.packageName || row.packageCode,
  subtitle: row.versionLabel || row.packageCode,
  status: row.status,
  fields: [
    { label: 'Package', value: row.packageCode },
    { label: 'Seats', value: row.seatCount },
    { label: 'Stores', value: row.boundStoreIds },
    { label: 'Expire', value: row.expireTime },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
