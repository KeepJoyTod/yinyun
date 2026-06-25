<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Notification rules"
      description="Read-only template and delivery-log status from the platform notification facade."
      :loading="loading"
      :error="error"
      empty-text="No notification rules."
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
import { usePlatformNotificationList } from './composables/usePlatformSettingsList'
import { platformNotificationCenterScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformNotificationCenterScaffold)
const { loading, error, rows, reload } = usePlatformNotificationList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.sceneCode,
  title: row.sceneName || row.sceneCode,
  subtitle: row.sceneCode,
  status: row.status,
  fields: [
    { label: 'Channels', value: row.channelTypes.join(', ') },
    { label: 'Enabled', value: row.enabled },
    { label: 'Latest send', value: row.latestSendStatus },
    { label: 'Sent at', value: row.latestSentTime },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
