<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-accent">{{ eyebrow }}</p>
        <h2 class="mt-2 text-[16px] font-semibold text-amber-dark">{{ title }}</h2>
        <p class="mt-1 max-w-[720px] text-[11px] leading-6 text-amber-text-muted">{{ description }}</p>
      </div>
      <button
        class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] text-amber-dark disabled:opacity-50"
        type="button"
        :disabled="loading"
        @click="$emit('reload')"
      >
        {{ loading ? 'Loading' : 'Reload' }}
      </button>
    </div>

    <div v-if="error" class="mt-4 border border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] text-[var(--color-status-danger)]">
      {{ error }}
    </div>

    <div v-else-if="loading" class="mt-4 grid gap-3 md:grid-cols-3">
      <div v-for="idx in 3" :key="idx" class="h-28 animate-pulse border border-amber-topbar-border bg-[#F7F1E7]" />
    </div>

    <div v-else-if="!items.length" class="mt-4 border border-amber-topbar-border bg-[#FBF8F2] px-4 py-8 text-center text-[12px] text-amber-text-muted">
      {{ emptyText }}
    </div>

    <div v-else class="mt-4 grid gap-3 xl:grid-cols-3">
      <article v-for="item in items" :key="item.id" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-[13px] font-semibold text-amber-dark">{{ item.title }}</div>
            <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ item.subtitle }}</div>
          </div>
          <span class="border px-2 py-1 text-[10px]" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-2 text-[10px] text-amber-text-muted">
          <template v-for="field in item.fields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd class="truncate text-right text-amber-dark">{{ field.value || '-' }}</dd>
          </template>
        </dl>
        <div v-if="item.evidence.length" class="mt-4 border-t border-amber-topbar-border pt-3">
          <div class="mb-2 text-[10px] font-semibold text-amber-dark">Evidence</div>
          <div v-for="evidence in item.evidence.slice(0, 2)" :key="`${item.id}-${evidence.sourceType}-${evidence.sourceKey}`" class="text-[9.5px] leading-5 text-amber-text-muted">
            {{ evidence.sourceType }} / {{ evidence.sourceKey }} / {{ evidence.status || '-' }}
          </div>
        </div>
        <div v-if="item.actions.length" class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="action in item.actions"
            :key="action.actionKey"
            class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10px] text-amber-text-muted disabled:opacity-50"
            type="button"
            :disabled="!action.enabled"
            :title="action.reason"
            @click="$emit('action', { itemId: item.id, actionKey: action.actionKey })"
          >
            {{ action.label }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PlatformScaffoldStatus } from '../../../shared/api/backend'
import type { PlatformStatusPanelItem } from '../platformStatusPanel'

defineProps<{
  eyebrow: string
  title: string
  description: string
  loading: boolean
  error: string
  emptyText: string
  items: PlatformStatusPanelItem[]
}>()

defineEmits<{
  reload: []
  action: [{ itemId: string; actionKey: string }]
}>()

const statusLabel = (status: PlatformScaffoldStatus) => {
  if (status === 'ready') return 'Ready'
  if (status === 'retired') return 'Blocked'
  return 'Scaffold'
}

const statusClass = (status: PlatformScaffoldStatus) => {
  if (status === 'ready') return 'border-[var(--color-status-done)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (status === 'retired') return 'border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
  return 'border-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'
}
</script>
