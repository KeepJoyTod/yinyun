<template>
  <div class="flex flex-col gap-7">
    <div class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Notification Center</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">通知模板</h2>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            维护短信、微信等客户触达模板，并查看最近发送日志和失败原因。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="openCreate"
        >
          新增模板
        </button>
      </div>
    </div>

    <NoticeBanner :notice="notice" />

    <section class="notification-ops-board border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickNotificationFilters"
            :key="filter.key"
            class="yy-action yy-filter-chip"
            :class="activeNotificationFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeNotificationFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in cards"
          :key="item.label"
          class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm"
        >
          <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ item.label }}</div>
          <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ item.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ item.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ item.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="channelFilter"
              class="yy-field-sm"
            >
              <option value="all">全部渠道</option>
              <option value="SMS">短信</option>
              <option value="WECHAT">微信</option>
            </select>
            <input
              v-model="searchQuery"
              class="yy-field-sm w-[220px]"
              placeholder="搜索模板编码 / 场景 / 标题"
              type="text"
            />
          </div>
          <button
            class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5"
            type="button"
            :disabled="loading"
            @click="reload"
          >
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">模板</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">渠道</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">内容</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/50">
              <tr v-for="template in filteredTemplates" :key="template.backendId" class="hover:bg-black/[0.015]">
                <td class="px-5 py-4">
                  <div class="flex flex-col">
                    <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ template.templateCode }}</span>
                    <span class="mt-1 text-[12px] font-medium text-amber-dark">{{ template.scene }}</span>
                    <span class="mt-1 text-[10px] text-amber-text-muted">{{ template.title || '未设置标题' }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-[11px] text-amber-dark">{{ template.channelType }}</td>
                <td class="px-5 py-4 text-[11px] text-amber-text-muted">{{ template.content }}</td>
                <td class="px-5 py-4">
                  <span
                    class="px-2 py-0.5 text-[10px]"
                    :class="template.enabled === '1'
                      ? 'bg-[#EBF4ED] text-[#2D7A4D]'
                      : 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'"
                  >
                    {{ template.enabled === '1' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click="openEdit(template)"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!filteredTemplates.length" class="px-6 py-10 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有模板</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部模板，或者新增一个场景模板后再继续配置。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Delivery Logs</div>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">最近发送日志</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <article
            v-for="log in visibleLogs"
            :key="log.backendId"
            class="px-5 py-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ log.channelType }} · {{ log.receiver }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ log.storeName }}</div>
              </div>
              <span
                class="px-2 py-0.5 text-[10px]"
                :class="log.sendStatus === 'SUCCESS'
                  ? 'bg-[#EBF4ED] text-[#2D7A4D]'
                  : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
              >
                {{ log.sendStatus === 'SUCCESS' ? '成功' : '失败' }}
              </span>
            </div>
            <div class="mt-3 text-[10.5px] leading-relaxed text-amber-text-muted">
              <div>发送时间：{{ log.sentTime ? log.sentTime.replace('T', ' ').slice(0, 16) : '—' }}</div>
              <div>请求 ID：{{ log.requestId || '—' }}</div>
              <div v-if="log.errorMessage">错误：{{ log.errorMessage }}</div>
              <div v-else>备注：{{ log.remark || '无' }}</div>
            </div>
          </article>
        </div>

        <div v-if="!visibleLogs.length" class="px-5 py-8 text-center text-[11px] text-amber-text-muted">
          当前筛选下没有日志
        </div>
      </aside>
    </section>

    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="w-full max-w-[680px] border border-amber-topbar-border bg-amber-content-bg shadow-2xl">
          <div class="border-b border-amber-topbar-border px-6 py-5">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Template Form</span>
            <h3 class="mt-1 text-[17px] font-sans text-amber-dark">{{ editingId ? '编辑模板' : '新增模板' }}</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              模板编码
              <input v-model="form.templateCode" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              业务场景
              <input v-model="form.scene" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              通知渠道
              <select v-model="form.channelType" class="yy-field-md">
                <option value="SMS">短信</option>
                <option value="WECHAT">微信</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              标题
              <input v-model="form.title" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              服务商模板 ID
              <input v-model="form.providerTemplateId" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              状态
              <select v-model="form.enabled" class="yy-field-md">
                <option value="1">启用</option>
                <option value="0">停用</option>
              </select>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
              模板内容
              <textarea v-model="form.content" class="min-h-[110px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark focus:outline-none"></textarea>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
              备注
              <input v-model="form.remark" class="yy-field-md" type="text" />
            </label>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
            <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5" type="button" @click="modalOpen = false">
              取消
            </button>
            <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted" :disabled="saving" type="button" @click="submit">
              {{ saving ? '保存中...' : '保存模板' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { appStore, type NotificationLogInfo, type NotificationTemplateInfo } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'

type QuickNotificationFilter = 'all' | 'sms' | 'wechat' | 'failed'

const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const { notice, pushNotice } = useNotice()
const templates = ref<NotificationTemplateInfo[]>([])
const logs = ref<NotificationLogInfo[]>([])
const activeNotificationFilter = ref<QuickNotificationFilter>('all')
const channelFilter = ref('all')
const searchQuery = ref('')

const form = reactive({
  templateCode: '',
  scene: '',
  channelType: 'SMS',
  title: '',
  content: '',
  providerTemplateId: '',
  enabled: '1',
  remark: '',
})

const reload = async () => {
  loading.value = true
  try {
    const [nextTemplates, nextLogs] = await Promise.all([
      appStore.loadNotificationTemplates(),
      appStore.loadNotificationLogs(),
    ])
    templates.value = [...nextTemplates]
    logs.value = [...nextLogs]
  } catch (error) {
    pushNotice('error', error instanceof Error ? `模板加载失败：${error.message}` : '模板加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingId.value = null
  form.templateCode = ''
  form.scene = ''
  form.channelType = 'SMS'
  form.title = ''
  form.content = ''
  form.providerTemplateId = ''
  form.enabled = '1'
  form.remark = ''
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const openEdit = (template: NotificationTemplateInfo) => {
  editingId.value = template.backendId
  form.templateCode = template.templateCode
  form.scene = template.scene
  form.channelType = template.channelType
  form.title = template.title
  form.content = template.content
  form.providerTemplateId = template.providerTemplateId
  form.enabled = template.enabled
  form.remark = template.remark
  modalOpen.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const next = await appStore.saveNotificationTemplate({
      id: editingId.value ?? undefined,
      templateCode: form.templateCode,
      scene: form.scene,
      channelType: form.channelType,
      title: form.title,
      content: form.content,
      providerTemplateId: form.providerTemplateId,
      enabled: form.enabled,
      remark: form.remark,
    })
    modalOpen.value = false
    await reload()
    pushNotice('success', `${next.scene} 模板已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '模板保存失败')
  } finally {
    saving.value = false
  }
}

const smsTemplates = computed(() => templates.value.filter(item => item.channelType === 'SMS'))
const wechatTemplates = computed(() => templates.value.filter(item => item.channelType === 'WECHAT'))
const failedLogs = computed(() => logs.value.filter(item => item.sendStatus !== 'SUCCESS'))

const filteredTemplates = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return templates.value.filter(template => {
    if (channelFilter.value !== 'all' && template.channelType !== channelFilter.value) return false
    if (activeNotificationFilter.value === 'sms' && template.channelType !== 'SMS') return false
    if (activeNotificationFilter.value === 'wechat' && template.channelType !== 'WECHAT') return false
    if (activeNotificationFilter.value === 'failed' && !failedLogs.value.some(log => log.templateBackendId === template.backendId)) return false
    if (!query) return true
    const haystack = `${template.templateCode} ${template.scene} ${template.title} ${template.content}`.toLowerCase()
    return haystack.includes(query)
  })
})

const visibleLogs = computed(() => {
  if (activeNotificationFilter.value === 'failed') return failedLogs.value
  if (activeNotificationFilter.value === 'sms') return logs.value.filter(item => item.channelType === 'SMS')
  if (activeNotificationFilter.value === 'wechat') return logs.value.filter(item => item.channelType === 'WECHAT')
  return logs.value
})

const quickNotificationFilters = computed(() => [
  { key: 'all' as const, label: '全部模板', count: templates.value.length },
  { key: 'sms' as const, label: '短信', count: smsTemplates.value.length },
  { key: 'wechat' as const, label: '微信', count: wechatTemplates.value.length },
  { key: 'failed' as const, label: '失败日志', count: failedLogs.value.length },
])

const cards = computed(() => [
  {
    label: '启用模板',
    value: String(templates.value.filter(item => item.enabled === '1').length),
    hint: '当前可用于真实发送的通知模板数量。',
    scope: '可用',
  },
  {
    label: '短信模板',
    value: String(smsTemplates.value.length),
    hint: '面向短信验证码、取片提醒和人工回访的模板。',
    scope: 'SMS',
  },
  {
    label: '失败发送',
    value: String(failedLogs.value.length),
    hint: '最近需要人工排查的发送失败记录。',
    scope: 'FAIL',
  },
  {
    label: '最近发送日志',
    value: String(logs.value.length),
    hint: '最近一次加载到的通知发送日志数量。',
    scope: 'LOG',
  },
])

onMounted(reload)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
