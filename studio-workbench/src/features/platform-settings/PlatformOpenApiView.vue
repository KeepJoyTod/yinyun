<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Open API apps"
      description="Read-only open-application, signing and rate-limit baselines from the platform API facade."
      :loading="loading"
      :error="error"
      empty-text="No open API apps."
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
import { usePlatformOpenApiList } from './composables/usePlatformSettingsList'
import { platformOpenApiScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformOpenApiScaffold)
const { loading, error, rows, reload } = usePlatformOpenApiList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.appCode,
  title: row.appName || row.appCode,
  subtitle: row.appCode,
  status: row.status,
  fields: [
    { label: 'Auth', value: row.authMode },
    { label: 'Rate limit', value: row.rateLimitLabel },
    { label: 'Sandbox', value: row.sandboxBaseUrl },
    { label: 'App', value: row.appCode },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
