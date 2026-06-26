import { computed, ref } from 'vue'
import { backendApi, type ReportFinanceReconciliationDto } from '../../../shared/api/backend'
import { studioAccessStore } from '../../../shared/stores/studioAccessStore'

const toDateKey = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    dateFrom: toDateKey(start),
    dateTo: toDateKey(end),
  }
}

const resolveDefaultStoreId = () => {
  if (studioAccessStore.globalStoreScope) return ''
  const identityStoreId = String(studioAccessStore.identity?.storeId ?? '').trim()
  if (identityStoreId) return identityStoreId
  return studioAccessStore.stores.find(store => store.primary)?.storeId
    ?? studioAccessStore.stores[0]?.storeId
    ?? ''
}

const emptyReconciliation = (): ReportFinanceReconciliationDto => ({
  overview: {
    orderAmountCent: 0,
    paidAmountCent: 0,
    refundAmountCent: 0,
    storedValueConsumeCent: 0,
    storedValueReversalCent: 0,
    withdrawPaidCent: 0,
    discountAmountCent: 0,
    waiveAmountCent: 0,
    reconciliationDiffCent: 0,
    attentionCount: 0,
    boundaryNote: 'report-finance reads existing finance ledgers without creating a second ledger.',
  },
  orderLedgers: [],
  fundLedgers: [],
  differences: [],
  exportTasks: [],
})

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

export const useReportFinanceReconciliation = () => {
  const { dateFrom, dateTo } = currentMonthRange()
  const selectedStoreId = ref(resolveDefaultStoreId())
  const dateStart = ref(dateFrom)
  const dateEnd = ref(dateTo)
  const loading = ref(false)
  const exporting = ref(false)
  const downloadingTaskId = ref('')
  const error = ref('')
  const exportMessage = ref('')
  const data = ref<ReportFinanceReconciliationDto>(emptyReconciliation())

  const storeOptions = computed(() => [
    { value: '', label: '全部门店' },
    ...studioAccessStore.stores.map(store => ({
      value: store.storeId,
      label: store.storeName,
    })),
  ])

  const query = () => ({
    storeId: selectedStoreId.value || undefined,
    dateFrom: dateStart.value || undefined,
    dateTo: dateEnd.value || undefined,
  })

  const hasData = computed(() =>
    data.value.orderLedgers.length > 0
    || data.value.fundLedgers.length > 0
    || data.value.differences.length > 0
    || data.value.exportTasks.length > 0,
  )

  const reload = async () => {
    loading.value = true
    error.value = ''
    exportMessage.value = ''
    try {
      data.value = await backendApi.getReportFinanceReconciliation(query())
    } catch (err) {
      error.value = err instanceof Error ? err.message : '财务对账报表加载失败'
      data.value = emptyReconciliation()
    } finally {
      loading.value = false
    }
  }

  const createExportTask = async () => {
    exporting.value = true
    error.value = ''
    exportMessage.value = ''
    try {
      const task = await backendApi.createReportFinanceExportTask(query())
      const tasks = await backendApi.listReportFinanceExportTasks(query())
      data.value = {
        ...data.value,
        exportTasks: tasks.length ? tasks : [task, ...data.value.exportTasks],
      }
      exportMessage.value = `导出任务已创建：${task.taskId}`
    } catch (err) {
      error.value = err instanceof Error ? err.message : '财务对账导出任务创建失败'
    } finally {
      exporting.value = false
    }
  }

  const downloadTask = async (taskId: string, fallbackName = 'finance-reconciliation.csv') => {
    if (!taskId) return
    downloadingTaskId.value = taskId
    error.value = ''
    try {
      const result = await backendApi.downloadReportFinanceExportTask(taskId)
      saveBlob(result.blob, result.fileName || fallbackName)
      exportMessage.value = `导出文件已开始下载：${taskId}`
    } catch (err) {
      error.value = err instanceof Error ? err.message : '财务对账导出下载失败'
    } finally {
      downloadingTaskId.value = ''
    }
  }

  return {
    selectedStoreId,
    dateStart,
    dateEnd,
    loading,
    exporting,
    downloadingTaskId,
    error,
    exportMessage,
    data,
    storeOptions,
    hasData,
    reload,
    createExportTask,
    downloadTask,
  }
}
