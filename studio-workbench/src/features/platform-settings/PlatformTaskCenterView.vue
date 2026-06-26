<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Async task center"
      description="Read-only task queue, retry and retention baselines for export, image-processing and reporting jobs."
      :loading="loading"
      :error="error"
      empty-text="No async task owners."
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
import { usePlatformAsyncTaskList } from './composables/usePlatformSettingsList'
import { platformTaskCenterScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformTaskCenterScaffold)
const { loading, error, rows, reload } = usePlatformAsyncTaskList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.taskType,
  title: row.taskName || row.taskType,
  subtitle: row.taskType,
  status: row.status,
  fields: [
    { label: 'Queue', value: row.queueName },
    { label: 'Latest run', value: row.latestRunStatus },
    { label: 'Retention', value: row.retentionPolicy },
    { label: 'Task type', value: row.taskType },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
