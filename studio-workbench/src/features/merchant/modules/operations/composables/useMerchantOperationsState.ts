import { computed, reactive, ref } from 'vue'
import { appStore, type NotificationLogInfo, type NotificationTemplateInfo } from '../../../../../shared/stores/appStore'
import { buildNotificationCards, buildNotificationQuickFilters, type QuickNotificationFilter } from '../merchantOperationsOperations'

type MerchantOperationsStateInput = {
  pushError: (message: string) => void
}

export const useMerchantOperationsState = (input: MerchantOperationsStateInput) => {
  const loading = ref(false)
  const saving = ref(false)
  const modalOpen = ref(false)
  const editingId = ref<string | null>(null)
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
      input.pushError(error instanceof Error ? `模板加载失败：${error.message}` : '模板加载失败')
    } finally {
      loading.value = false
    }
  }

  const filteredTemplates = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const failedTemplateIds = new Set(logs.value.filter(item => item.sendStatus !== 'SUCCESS').map(item => item.templateBackendId))
    return templates.value.filter(template => {
      if (channelFilter.value !== 'all' && template.channelType !== channelFilter.value) return false
      if (activeNotificationFilter.value === 'sms' && template.channelType !== 'SMS') return false
      if (activeNotificationFilter.value === 'wechat' && template.channelType !== 'WECHAT') return false
      if (activeNotificationFilter.value === 'failed' && !failedTemplateIds.has(template.backendId)) return false
      if (!query) return true
      const haystack = `${template.templateCode} ${template.scene} ${template.title} ${template.content}`.toLowerCase()
      return haystack.includes(query)
    })
  })

  const visibleLogs = computed(() => {
    if (activeNotificationFilter.value === 'failed') return logs.value.filter(item => item.sendStatus !== 'SUCCESS')
    if (activeNotificationFilter.value === 'sms') return logs.value.filter(item => item.channelType === 'SMS')
    if (activeNotificationFilter.value === 'wechat') return logs.value.filter(item => item.channelType === 'WECHAT')
    return logs.value
  })

  const quickNotificationFilters = computed(() => buildNotificationQuickFilters(templates.value, logs.value))
  const cards = computed(() => buildNotificationCards(templates.value, logs.value))

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

  return {
    loading,
    saving,
    modalOpen,
    editingId,
    templates,
    logs,
    activeNotificationFilter,
    channelFilter,
    searchQuery,
    form,
    filteredTemplates,
    visibleLogs,
    quickNotificationFilters,
    cards,
    resetForm,
    openCreate,
    openEdit,
    reload,
  }
}
