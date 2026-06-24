<template>
  <CollaborationSettingsPageShell
    eyebrow="Position Config"
    title="岗位设置"
    description="维护接待、化妆、摄影、修图、审片、看片、取件的岗位顺序、角色绑定、SLA 和自动派单策略。"
    :error="collaborationStore.error"
  >
    <template #actions>
      <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="saving" @click="save">
        {{ saving ? '保存中...' : '保存岗位设置' }}
      </button>
    </template>

    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[920px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">岗位</th>
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">启用</th>
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">顺序</th>
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">角色编码</th>
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">SLA(小时)</th>
              <th class="px-3 py-3 text-[11px] text-amber-text-muted">自动派单</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="item in positions" :key="item.code">
              <td class="px-3 py-3 text-[11px] text-amber-dark">{{ item.label }}</td>
              <td class="px-3 py-3"><input v-model="item.enabled" type="checkbox" /></td>
              <td class="px-3 py-3"><input v-model.number="item.sort" class="h-8 w-20 border border-amber-topbar-border px-2 text-[11px]" type="number" /></td>
              <td class="px-3 py-3"><input v-model.trim="item.roleType" class="h-8 w-40 border border-amber-topbar-border px-2 text-[11px]" type="text" /></td>
              <td class="px-3 py-3"><input v-model.number="item.slaHours" class="h-8 w-24 border border-amber-topbar-border px-2 text-[11px]" type="number" min="1" /></td>
              <td class="px-3 py-3"><input v-model="item.autoAssign" type="checkbox" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CollaborationPositionConfigItemDto } from '../../shared/api/backend'
import { collaborationStore } from '../../shared/stores/collaborationStore'
import { defaultPositionConfig, parseJson, stringifyJson } from './collaborationSettings'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const saving = ref(false)
const positions = ref<CollaborationPositionConfigItemDto[]>(defaultPositionConfig())

onMounted(async () => {
  const setting = await collaborationStore.loadSetting('POSITION')
  positions.value = parseJson(setting.configJson, defaultPositionConfig())
})

const save = async () => {
  saving.value = true
  try {
    await collaborationStore.saveSetting({
      id: collaborationStore.positionSetting?.id,
      settingType: 'POSITION',
      status: 'ACTIVE',
      configJson: stringifyJson(positions.value),
    })
  } finally {
    saving.value = false
  }
}
</script>
