<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Login risk controls"
      description="Read-only device, IP and MFA risk baselines from the platform login-risk scaffold."
      :loading="loading"
      :error="error"
      empty-text="No login-risk policies."
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
import { usePlatformLoginRiskList } from './composables/usePlatformSettingsList'
import { platformLoginRiskScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformLoginRiskScaffold)
const { loading, error, rows, reload } = usePlatformLoginRiskList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.policyCode,
  title: row.policyName || row.policyCode,
  subtitle: row.policyCode,
  status: row.status,
  fields: [
    { label: 'Dimension', value: row.riskDimension },
    { label: 'Scope', value: row.guardScope },
    { label: 'Latest event', value: row.latestEventTime },
    { label: 'Policy', value: row.policyCode },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
