import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { appStore } from '../../../shared/stores/appStore'

export type UseOrderOperationLogsReturn = {
  operationLogsLoading: Ref<boolean>
  operationLogsReloadQueued: Ref<boolean>
  operationLogsNotice: Ref<string>
  operationLogsStateText: ComputedRef<string>
  loadOrderOperationLogs: () => Promise<void>
}

export function useOrderOperationLogs(): UseOrderOperationLogsReturn {
  const operationLogsLoading = ref(false)
  const operationLogsReloadQueued = ref(false)
  const operationLogsNotice = ref('')

  const operationLogsStateText = computed(() => {
    if (operationLogsLoading.value) return '正在同步后台操作日志...'
    return operationLogsNotice.value
  })

  const loadOrderOperationLogs = async () => {
    if (appStore.demoMode) {
      operationLogsNotice.value = '演示模式不读取后台操作日志；操作记录使用本地基础时间线。'
      return
    }
    if (operationLogsLoading.value) {
      operationLogsReloadQueued.value = true
      return
    }
    operationLogsLoading.value = true
    operationLogsNotice.value = ''
    try {
      do {
        operationLogsReloadQueued.value = false
        await appStore.loadOperationLogs()
        operationLogsNotice.value = ''
      } while (operationLogsReloadQueued.value)
    } catch {
      operationLogsNotice.value = '操作日志读取失败，已保留基础时间线；不影响确认、改期和取消。'
    } finally {
      operationLogsLoading.value = false
    }
  }

  return {
    operationLogsLoading,
    operationLogsReloadQueued,
    operationLogsNotice,
    operationLogsStateText,
    loadOrderOperationLogs,
  }
}
