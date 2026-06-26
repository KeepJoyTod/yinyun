<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Backup and recovery"
      description="Read-only backup scope, PITR target and drill evidence from the recovery-readiness scaffold."
      :loading="loading"
      :error="error"
      empty-text="No backup or recovery plans."
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
import { usePlatformBackupRecoveryList } from './composables/usePlatformSettingsList'
import { platformBackupRecoveryScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformBackupRecoveryScaffold)
const { loading, error, rows, reload } = usePlatformBackupRecoveryList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.planCode,
  title: row.planName || row.planCode,
  subtitle: row.planCode,
  status: row.status,
  fields: [
    { label: 'Scope', value: row.backupScope },
    { label: 'Recovery target', value: row.recoveryTarget },
    { label: 'Latest drill', value: row.lastDrillTime },
    { label: 'Plan', value: row.planCode },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
