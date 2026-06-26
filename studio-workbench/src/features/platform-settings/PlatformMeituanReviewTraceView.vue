<template>
  <div class="space-y-5">
    <ModuleScaffoldView v-bind="scaffold" />
    <PlatformPhase1StatusPanel
      eyebrow="Phase 1 facade"
      title="Meituan review trace"
      description="Read-only plugin authorization, review-trace status and latest sync evidence for Meituan."
      :loading="loading"
      :error="error"
      empty-text="No Meituan review-trace plugins."
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
import { usePlatformMeituanReviewTraceList } from './composables/usePlatformSettingsList'
import { platformMeituanReviewTraceScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformMeituanReviewTraceScaffold)
const { loading, error, rows, reload } = usePlatformMeituanReviewTraceList()

const items = computed<PlatformStatusPanelItem[]>(() => rows.value.map(row => ({
  id: row.pluginCode,
  title: row.pluginName || row.pluginCode,
  subtitle: row.pluginCode,
  status: row.status,
  fields: [
    { label: 'Channel', value: row.reviewChannel },
    { label: 'Trace status', value: row.traceStatus },
    { label: 'Latest sync', value: row.latestSyncTime },
    { label: 'Plugin', value: row.pluginCode },
  ],
  evidence: row.evidence ?? [],
  actions: row.nextActions ?? [],
})))

onMounted(reload)
</script>
