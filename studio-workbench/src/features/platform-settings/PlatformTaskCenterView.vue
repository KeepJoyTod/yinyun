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
      @action="handlePanelAction"
    />

    <section
      v-if="detailVisible"
      data-testid="platform-task-detail-drawer"
      class="yy-console-card border border-amber-topbar-border bg-amber-content-bg"
    >
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-amber-topbar-border px-5 py-4">
        <div>
          <div class="text-[12px] font-semibold text-amber-dark">{{ detail?.taskName || activeTaskType }}</div>
          <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ detail?.taskType || activeTaskType }}</div>
        </div>
        <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] text-amber-dark" type="button" @click="closeDetail">
          Close
        </button>
      </div>

      <div v-if="detailLoading" class="px-5 py-6 text-[11px] text-amber-text-muted">Loading task detail...</div>
      <div v-else-if="detailError" class="border-b border-amber-topbar-border px-5 py-4 text-[11px] text-[var(--color-status-danger)]">
        {{ detailError }}
      </div>
      <div v-else-if="detail" class="grid gap-5 p-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="space-y-5">
          <article class="border border-amber-topbar-border bg-white/70 p-4">
            <div class="text-[11px] font-semibold text-amber-dark">Task summary</div>
            <dl class="mt-4 grid grid-cols-2 gap-2 text-[10px] text-amber-text-muted">
              <div>
                <dt>Queue</dt>
                <dd class="mt-1 text-amber-dark">{{ detail.queueName || '-' }}</dd>
              </div>
              <div>
                <dt>Latest run</dt>
                <dd class="mt-1 text-amber-dark">{{ detail.latestRunStatus || '-' }}</dd>
              </div>
              <div>
                <dt>Retention</dt>
                <dd class="mt-1 text-amber-dark">{{ detail.retentionPolicy || '-' }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd class="mt-1 text-amber-dark">{{ detail.status }}</dd>
              </div>
            </dl>
          </article>

          <article class="border border-amber-topbar-border bg-white/70 p-4">
            <div class="text-[11px] font-semibold text-amber-dark">Evidence</div>
            <div v-if="!detail.evidence?.length" class="mt-3 text-[10px] text-amber-text-muted">No evidence yet.</div>
            <div v-for="evidence in detail.evidence ?? []" :key="`${evidence.sourceType}-${evidence.sourceKey}-${evidence.eventTime}`" class="mt-3 border border-amber-topbar-border bg-white px-3 py-3 text-[10px] text-amber-text-muted">
              <div class="font-mono text-amber-dark">{{ evidence.sourceType }} / {{ evidence.sourceKey }}</div>
              <div class="mt-1">{{ evidence.status || '-' }}</div>
              <div class="mt-1">{{ evidence.message || '-' }}</div>
              <div v-if="evidence.eventTime" class="mt-1">{{ evidence.eventTime }}</div>
            </div>
          </article>
        </div>

        <article class="border border-amber-topbar-border bg-white/70 p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-[11px] font-semibold text-amber-dark">Recent runs</div>
            <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10px] text-amber-dark" type="button" @click="reloadDetail">
              Reload detail
            </button>
          </div>
          <div v-if="!detail.runs?.length" class="mt-4 text-[10px] text-amber-text-muted">No runs found.</div>
          <div v-for="run in detail.runs ?? []" :key="run.taskId" class="mt-4 border border-amber-topbar-border bg-white px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="font-mono text-[11px] font-semibold text-amber-dark">{{ run.taskId }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ run.runStatus || run.status }}</div>
              </div>
              <button
                class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10px] text-amber-dark disabled:opacity-50"
                type="button"
                :disabled="!run.downloadUrl"
                @click="downloadRun(run.downloadUrl || '', run.fileName || run.taskId)"
              >
                Download
              </button>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-[10px] text-amber-text-muted">
              <div>
                <dt>Created</dt>
                <dd class="mt-1 text-amber-dark">{{ run.createdTime || '-' }}</dd>
              </div>
              <div>
                <dt>Finished</dt>
                <dd class="mt-1 text-amber-dark">{{ run.finishedTime || '-' }}</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd class="mt-1 text-amber-dark">{{ run.expireTime || '-' }}</dd>
              </div>
              <div>
                <dt>File</dt>
                <dd class="mt-1 text-amber-dark">{{ run.fileName || '-' }}</dd>
              </div>
            </dl>
            <div v-if="run.errorMessage" class="mt-3 text-[10px] text-[var(--color-status-danger)]">{{ run.errorMessage }}</div>
            <div v-else class="mt-3 text-[10px] text-amber-text-muted">{{ run.auditNote || '-' }}</div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { backendApi, type PlatformAsyncTaskDetailDto } from '../../shared/api/backend'
import { computed, onMounted, ref } from 'vue'
import ModuleScaffoldView from '../system/ModuleScaffoldView.vue'
import { useModuleScaffold } from '../system/moduleScaffold'
import PlatformPhase1StatusPanel from './components/PlatformPhase1StatusPanel.vue'
import { usePlatformAsyncTaskList } from './composables/usePlatformSettingsList'
import { platformTaskCenterScaffold } from './platformSettingsScaffolds'
import type { PlatformStatusPanelItem } from './platformStatusPanel'

const scaffold = useModuleScaffold(platformTaskCenterScaffold)
const { loading, error, rows, reload } = usePlatformAsyncTaskList()

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const activeTaskType = ref('')
const detail = ref<PlatformAsyncTaskDetailDto | null>(null)

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
  actions: (row.nextActions ?? []).map(action => ({
    ...action,
    enabled: action.actionKey === 'open_task_detail' ? true : action.enabled,
  })),
})))

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const loadDetail = async (taskType: string) => {
  detailVisible.value = true
  detailLoading.value = true
  detailError.value = ''
  activeTaskType.value = taskType
  try {
    detail.value = await backendApi.getPlatformAsyncTaskDetail(taskType)
  } catch (err) {
    detail.value = null
    detailError.value = err instanceof Error ? err.message : 'Task detail request failed'
  } finally {
    detailLoading.value = false
  }
}

const handlePanelAction = async ({ itemId, actionKey }: { itemId: string; actionKey: string }) => {
  if (actionKey !== 'open_task_detail') return
  await loadDetail(itemId)
}

const reloadDetail = async () => {
  if (!activeTaskType.value) return
  await loadDetail(activeTaskType.value)
}

const closeDetail = () => {
  detailVisible.value = false
  detailLoading.value = false
  detailError.value = ''
  detail.value = null
  activeTaskType.value = ''
}

const downloadRun = async (downloadUrl: string, fallbackName: string) => {
  if (!downloadUrl) return
  try {
    const result = await backendApi.downloadPlatformAsyncTaskByUrl(downloadUrl)
    saveBlob(result.blob, result.fileName || fallbackName || 'async-task-export.csv')
  } catch (err) {
    detailError.value = err instanceof Error ? err.message : 'Download failed'
  }
}

onMounted(reload)
</script>
