<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Platform integrations"
      description="Read-only channel authorization, webhook and sync evidence from the backend platform settings facade."
      :loading="loading"
      :error="error"
      empty-text="No channel authorization records."
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
import { usePlatformIntegrationList } from './composables/usePlatformSettingsList'
import { platformIntegrationScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformIntegrationScaffold)
const { loading, error, rows, reload } = usePlatformIntegrationList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.channelType,
  title: row.channelName || row.channelType,
  subtitle: row.channelType,
  status: row.status,
  fields: [
    { label: 'Account', value: row.accountName },
    { label: 'App', value: row.appId },
    { label: 'Webhook', value: row.webhookUrl },
    { label: 'Latest log', value: row.latestLogId },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
